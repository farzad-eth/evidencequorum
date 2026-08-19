import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const address = "0xec5BB6E6f7B950914d55D34d931e0032935c8e89";
const client = createClient({ chain: studionet });

try {
  const count = await client.readContract({
    address,
    functionName: "count",
    args: [],
    jsonSafeReturn: true,
  });
  console.log(JSON.stringify({ address, count }, null, 2));
} catch (error) {
  console.error("EvidenceQuorum read probe failed:", error);
  process.exitCode = 1;
}
