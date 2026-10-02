import { readdirSync } from "node:fs";
import { defineConfig } from "tsup";

const componentEntries = Object.fromEntries(
  readdirSync("src/components")
    .filter((file) => /\.tsx?$/.test(file))
    .map((file) => [
      `components/${file.replace(/\.tsx?$/, "")}`,
      `src/components/${file}`,
    ]),
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "control-state/index": "src/control-state/index.ts",
    "control-state-react/index": "src/control-state-react/index.ts",
    ...componentEntries,
  },
  format: ["esm"],
  dts: {
    entry: {
      index: "src/index.ts",
      "control-state/index": "src/control-state/index.ts",
      "control-state-react/index": "src/control-state-react/index.ts",
    },
  },
  clean: true,
  target: "es2020",
  treeshake: true,
  splitting: true,
});
