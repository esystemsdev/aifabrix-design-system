import { describe, expect, it } from "vitest";
import { findContractViolations } from "../../scripts/package-contract-rules.mjs";

describe("package contract rules", () => {
  it("accepts a component importing React and a sibling", () => {
    const source = 'import * as React from "react";\nimport { cn } from "../utils/cn";';
    expect(findContractViolations([{ path: "src/components/button.tsx", source }])).toEqual([]);
  });

  it("accepts React inside control-state-react", () => {
    const source = 'import { useMemo } from "react";';
    expect(findContractViolations([{ path: "src/control-state-react/field/presentation.ts", source }])).toEqual([]);
  });

  it("[EDGE] rejects a React import in the React-free control-state core", () => {
    const source = 'import { useMemo } from "react";';
    const violations = findContractViolations([{ path: "src/control-state/policy/action.ts", source }]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("React-free core");
  });

  it("[EDGE] rejects bundler globals", () => {
    const files = [
      { path: "src/components/a.tsx", source: "const dev = import.meta.env.DEV;" },
      { path: "src/components/b.tsx", source: "const mode = process.env.NODE_ENV;" },
    ];
    expect(findContractViolations(files)).toHaveLength(2);
  });

  it("[EDGE] rejects router, Miso SDK and application-layer imports", () => {
    const files = [
      { path: "src/components/a.tsx", source: 'import { Link } from "react-router-dom";' },
      { path: "src/components/b.tsx", source: 'import { MisoClient } from "@aifabrix/miso-client";' },
      { path: "src/components/c.tsx", source: 'import { api } from "../../services/api/client";' },
    ];
    expect(findContractViolations(files)).toHaveLength(3);
  });
});
