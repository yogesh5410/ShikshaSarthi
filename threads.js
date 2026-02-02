// load-test.js
import axios from "axios";

const url = "https://shiksha-sarthi-nmms-prep-cn64.vercel.app/students/";
const CONCURRENT_REQUESTS = 300;

async function hitEndpoint(i) {
  try {
    const res = await axios.get(url);
    console.log(`Request ${i + 1} - Status: ${res.status}`);
  } catch (err) {
    console.error(
      `Request ${i + 1} - Error: ${err.response?.status || err.message}`
    );
  }
}

async function startLoadTest() {
  const promises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(hitEndpoint(i));
  }

  await Promise.all(promises);
  console.log(`Finished ${CONCURRENT_REQUESTS} concurrent requests.`);
}

startLoadTest();
