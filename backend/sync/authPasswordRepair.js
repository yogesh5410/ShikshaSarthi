const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const SchoolAdmin = require("../models/SchoolAdmin");
const SuperAdmin = require("../models/SuperAdmin");

const REMOTE_TIMEOUT_MS = Number(process.env.SYNC_REMOTE_TIMEOUT_MS || 10_000);
const AUTH_HASH_REPAIR_ENABLED =
  String(process.env.SYNC_AUTH_HASH_REPAIR_ENABLED || "true").toLowerCase() !== "false";

const AUTH_MODELS = [
  { key: "students", model: Student },
  { key: "teachers", model: Teacher },
  { key: "schoolAdmins", model: SchoolAdmin },
  { key: "superAdmins", model: SuperAdmin },
];

function isLikelyBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

/**
 * If local credentials were corrupted during old sync runs, verify against Atlas
 * and repair local hashed password in-place.
 */
async function repairLocalPasswordFromAtlas({
  model,
  lookupQuery,
  candidatePassword,
}) {
  const sourceUri = String(process.env.MONGO_URI || "").trim();
  const sourceDbName = String(process.env.SYNC_SOURCE_DB_NAME || "test").trim();

  if (!sourceUri || !model || !lookupQuery || !candidatePassword) {
    return false;
  }

  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });

  try {
    await client.connect();

    const sourceDb = client.db(sourceDbName);
    const sourceCollection = sourceDb.collection(model.collection.name);
    const remoteUser = await sourceCollection.findOne(lookupQuery, {
      projection: { password: 1, updatedAt: 1 },
    });

    if (!remoteUser || typeof remoteUser.password !== "string") {
      return false;
    }

    const passwordMatches = await bcrypt.compare(candidatePassword, remoteUser.password);
    if (!passwordMatches) {
      return false;
    }

    const writeResult = await model.updateOne(
      lookupQuery,
      {
        $set: {
          password: remoteUser.password,
          synced: true,
          updatedAt: remoteUser.updatedAt || new Date(),
        },
      },
      {
        runValidators: false,
        includeDeleted: true,
        skipSyncMetadata: true,
      }
    );

    return Boolean(writeResult.matchedCount);
  } catch (_error) {
    return false;
  } finally {
    await client.close().catch(() => {});
  }
}

async function repairAuthCollectionHashes({ sourceDb, model, key }) {
  const summary = {
    key,
    scannedRemote: 0,
    repaired: 0,
    skippedMissingLocal: 0,
    skippedAlreadyEqual: 0,
    skippedInvalidRemoteHash: 0,
    failed: 0,
  };

  const localRows = await model
    .find({})
    .setOptions({ includeDeleted: true })
    .select({ _id: 1, password: 1 })
    .lean();

  const localPasswordById = new Map(
    localRows.map((doc) => [String(doc._id), typeof doc.password === "string" ? doc.password : ""])
  );

  const collection = sourceDb.collection(model.collection.name);
  const cursor = collection.find(
    { password: { $exists: true } },
    { projection: { _id: 1, password: 1, updatedAt: 1 } }
  );

  const pendingOps = [];

  for await (const remoteDoc of cursor) {
    summary.scannedRemote += 1;

    const remoteHash = typeof remoteDoc.password === "string" ? remoteDoc.password : "";
    if (!isLikelyBcryptHash(remoteHash)) {
      summary.skippedInvalidRemoteHash += 1;
      continue;
    }

    const idKey = String(remoteDoc._id);
    if (!localPasswordById.has(idKey)) {
      summary.skippedMissingLocal += 1;
      continue;
    }

    const localHash = localPasswordById.get(idKey);
    if (localHash === remoteHash) {
      summary.skippedAlreadyEqual += 1;
      continue;
    }

    pendingOps.push({
      updateOne: {
        filter: { _id: remoteDoc._id },
        update: {
          $set: {
            password: remoteHash,
            synced: true,
            updatedAt: remoteDoc.updatedAt || new Date(),
          },
        },
        upsert: false,
      },
    });

    // Keep memory and single-request size bounded.
    if (pendingOps.length >= 200) {
      try {
        await model.bulkWrite(pendingOps, { ordered: false });
        summary.repaired += pendingOps.length;
      } catch (_error) {
        summary.failed += pendingOps.length;
      } finally {
        pendingOps.length = 0;
      }
    }
  }

  if (pendingOps.length) {
    try {
      await model.bulkWrite(pendingOps, { ordered: false });
      summary.repaired += pendingOps.length;
    } catch (_error) {
      summary.failed += pendingOps.length;
    }
  }

  return summary;
}

async function repairAllLocalAuthPasswordsFromAtlas() {
  const sourceUri = String(process.env.MONGO_URI || "").trim();
  const sourceDbName = String(process.env.SYNC_SOURCE_DB_NAME || "test").trim();

  if (!AUTH_HASH_REPAIR_ENABLED) {
    return {
      attempted: false,
      skipped: true,
      reason: "disabled-by-env",
    };
  }

  if (!sourceUri) {
    return {
      attempted: false,
      skipped: true,
      reason: "source-uri-not-configured",
    };
  }

  const client = new MongoClient(sourceUri, { serverSelectionTimeoutMS: REMOTE_TIMEOUT_MS });
  const startedAt = Date.now();

  const result = {
    attempted: true,
    repaired: 0,
    scannedRemote: 0,
    skippedMissingLocal: 0,
    skippedAlreadyEqual: 0,
    skippedInvalidRemoteHash: 0,
    failed: 0,
    collections: {},
    durationMs: 0,
  };

  try {
    await client.connect();
    const sourceDb = client.db(sourceDbName);

    for (const entry of AUTH_MODELS) {
      const entrySummary = await repairAuthCollectionHashes({
        sourceDb,
        model: entry.model,
        key: entry.key,
      });

      result.collections[entry.key] = entrySummary;
      result.repaired += entrySummary.repaired;
      result.scannedRemote += entrySummary.scannedRemote;
      result.skippedMissingLocal += entrySummary.skippedMissingLocal;
      result.skippedAlreadyEqual += entrySummary.skippedAlreadyEqual;
      result.skippedInvalidRemoteHash += entrySummary.skippedInvalidRemoteHash;
      result.failed += entrySummary.failed;
    }

    result.durationMs = Date.now() - startedAt;
    return result;
  } catch (error) {
    return {
      attempted: true,
      error: error.message,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    await client.close().catch(() => {});
  }
}

module.exports = {
  repairLocalPasswordFromAtlas,
  repairAllLocalAuthPasswordsFromAtlas,
};
