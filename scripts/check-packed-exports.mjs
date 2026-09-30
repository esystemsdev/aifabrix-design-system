import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const work = join(root, ".packed-check");
const failures = [];

rmSync(work, { recursive: true, force: true });
mkdirSync(join(work, "consumer"), { recursive: true });

const [packed] = JSON.parse(npm(["pack", "--json", "--pack-destination", work], root));
const unexpected = packed.files
  .map((file) => file.path)
  .filter((path) => !/^(dist\/|README\.md$|LICENSE$|package\.json$)/.test(path));
if (unexpected.length) failures.push(`tarball contains non-dist files: ${unexpected.join(", ")}`);

const consumer = join(work, "consumer");
writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "packed-consumer", private: true, type: "module" }));
npm(["install", "--no-audit", "--no-fund", "--silent", join(work, packed.filename), "react@18", "react-dom@18"], consumer);

const probe = `
const results = {};
for (const entry of ["@aifabrix/ui", "@aifabrix/ui/control-state", "@aifabrix/ui/control-state-react"]) {
  results[entry] = Object.keys(await import(entry)).length;
}
try {
  await import("@aifabrix/ui/dist/index.js");
  results.deepImport = "resolved";
} catch (error) {
  results.deepImport = error.code;
}
console.log(JSON.stringify(results));
`;
const results = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", probe], { cwd: consumer, encoding: "utf8" }));

for (const entry of ["@aifabrix/ui", "@aifabrix/ui/control-state", "@aifabrix/ui/control-state-react"]) {
  if (!results[entry]) failures.push(`${entry} exports nothing`);
}
if (results.deepImport !== "ERR_PACKAGE_PATH_NOT_EXPORTED") {
  failures.push(`deep dist import should fail with ERR_PACKAGE_PATH_NOT_EXPORTED, got ${results.deepImport}`);
}

rmSync(work, { recursive: true, force: true });
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Packed exports passed (${packed.filename}, ${packed.files.length} files): ${JSON.stringify(results)}`);

function npm(args, cwd) {
  return execFileSync("npm", args, { cwd, encoding: "utf8" });
}
