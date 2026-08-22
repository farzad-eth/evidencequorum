import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const address = "0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8";
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
