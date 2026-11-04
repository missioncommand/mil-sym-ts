// node test/c2dLookupCheck.mjs (after build)
import { C2DLookup } from "../dist/C5Ren.mjs";

const c2d = C2DLookup.getInstance();
const cases = [
    ["SFGPUCI--------", "110310000012110000000000000000", "plain unit: unchanged"],
    ["SFGPUCI-----US-", "110310000012110000000000000840", "country code: unchanged"],
    ["SFGPIMA---H----", "110320000011010000000000000000", "ground installation (key keeps H)"],
    ["SHGPIUE---H----", "110620000012050000000000000000", "hostile installation"],
    ["SFGPIMA---HB---", "110320010011010000000000000000", "HB sets feint/dummy on an installation"],
    ["EFOPCE----H----", "110320000011220100000000000000", "Fire Station + H: installation (set 20)"],
    ["EFOPCE---------", "110340000013140200000000000000", "Fire Station, no H: activity (set 40)"],
    ["EFOPDK----H----", "110320000011210800000000000000", "Prison + H: installation (set 20)"],
    ["EFOPDK---------", "110340000013150800000000000000", "Prison, no H: activity (set 40)"],
    ["SFGPIMA--------", null, "installation function without H: no row"],
];

let failed = 0;
for (const [input, expected, what] of cases) {
    const actual = c2d.getDCode(input, true);
    const ok = actual === expected;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${input} -> ${actual}${ok ? "" : `  (expected ${expected})`}  ${what}`);
}
const sigint = c2d.getDCode("IFPPSCD--------");
console.log(`${sigint ? "PASS" : "FAIL"}  IFPPSCD-------- -> ${sigint}  SIGINT converts`);
if (!sigint) failed++;
console.log(failed ? `${failed} failed` : "all passed");
process.exitCode = failed ? 1 : 0;
