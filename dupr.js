const tokenUrl = "https://uat.mydupr.com/api/auth/v3/token";
const apiUrl = "https://uat.mydupr.com/api/v3/subscribe/rating-changes";

const clientKey = "test-ck-b76375b5-06af-43d8-fff9-0a1c6e5c9192";
const clientSecret = "test-cs-ff850f0b360f499cfa6c0d07b9d5f4dc";

const encoded = Buffer.from(`${clientKey}:${clientSecret}`).toString("base64");
async function getAccessToken() {
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "x-authorization": encoded,
      "Content-Type": "application/json",
    },
  });

  const body = await res.json();

  if (!res.ok) {
    console.error("❌ Token fetch failed:", body);
    process.exit(1);
  }

  console.log("✅ Access token obtained.");
  console.log("Access Token:", body);
  return body.access_token;
}

async function callProtectedApi(token) {
  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "/",
    },
  });

  const body = await res.json();

  if (!res.ok) {
    console.error("❌ API call failed:", body);
  } else {
    console.log("✅ API response:", JSON.stringify(body, null, 2));
  }
}

(async () => {
  const token = await getAccessToken();
  await callProtectedApi(token);
})();