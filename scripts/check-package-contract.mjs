import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { findContractViolations } from "./package-contract-rules.mjs";

const root = resolve(import.meta.dirname, "..");
const roots = ["src", "dist"].map((dir) => join(root, dir)).filter((dir) => existsSync(dir));

const files = roots.flatMap(listSources).map((path) => ({
  path: relative(root, path).split(sep).join("/"),
  source: readFileSync(path, "utf8"),
}));

const violations = findContractViolations(files);
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(`Package contract passed (${files.length} files).`);

function listSources(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return listSources(path);
    return /\.(ts|tsx|js)$/.test(name) ? [path] : [];
  });
}
