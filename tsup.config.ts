import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "control-state/index": "src/control-state/index.ts",
    "control-state-react/index": "src/control-state-react/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2020",
  treeshake: true,
});
