import { describe, expect, it } from "vitest";
import { CONTROL_STATE_SCENARIOS } from "../../src/control-state";
import {
  isDiscreteSelectionKey,
  resolveDiscreteFieldPresentation,
  resolveDisclosurePresentation,
  resolveNavigationPresentation,
  resolveSurfacePresentation,
} from "../../src/control-state-react";

const reason = {
  code: "access.denied",
  message: "Access is required.",
  source: "permission",
} as const;

describe("control-state React presentation", () => {
  it("maps active, disabled, and hidden navigation semantics", () => {
    expect(
      resolveNavigationPresentation({
        family: "navigation",
        visibility: "visible",
        interaction: "active",
      }),
    ).toMatchObject({ current: "page", disabled: false });
    expect(
      resolveNavigationPresentation({
        family: "navigation",
        visibility: "visible",
        interaction: "disabled",
        reason,
      }),
    ).toMatchObject({ disabled: true, reason });
    expect(
      resolveNavigationPresentation({
        family: "navigation",
        visibility: "hidden",
      }),
    ).toMatchObject({ hidden: true });
  });

  it("maps disclosure restrictions without inventing permission logic", () => {
    expect(
      resolveDisclosurePresentation({
        family: "disclosure",
        visibility: "visible",
        interaction: "disabled",
        reason,
      }),
    ).toEqual({ hidden: false, disabled: true, reason });
  });

  it("keeps discrete readonly presentation focusable while blocking mutation", () => {
    expect(
      resolveDiscreteFieldPresentation({
        family: "field",
        visibility: "visible",
        interaction: "readonly",
        activity: "idle",
        validation: "valid",
        reason,
      }),
    ).toMatchObject({
      readOnly: true,
      effectiveDisabled: false,
      dataState: "readonly",
    });
    expect(
      resolveDiscreteFieldPresentation({
        family: "field",
        visibility: "visible",
        interaction: "editable",
        activity: "busy",
        validation: "valid",
      }),
    ).toMatchObject({ effectiveDisabled: true, busy: true });
    expect(isDiscreteSelectionKey(" ")).toBe(true);
    expect(isDiscreteSelectionKey("ArrowRight")).toBe(false);
    expect(isDiscreteSelectionKey("ArrowRight", true)).toBe(true);
  });

  it("keeps region and screen boundaries distinct", () => {
    expect(
      resolveSurfacePresentation({
        family: "region",
        mode: "access-denied",
        reason,
      }),
    ).toMatchObject({ dataState: "access-denied", role: "alert" });
    expect(resolveSurfacePresentation({ family: "screen", mode: "loading" })).toMatchObject({
      dataState: "loading",
      role: "status",
      busy: true,
    });
  });

  it("resolves every non-field matrix row owned by the React bindings", () => {
    for (const { state } of CONTROL_STATE_SCENARIOS) {
      if (state.family === "navigation") {
        expect(resolveNavigationPresentation(state).hidden).toBe(state.visibility === "hidden");
      }
      if (state.family === "disclosure") {
        expect(resolveDisclosurePresentation(state).hidden).toBe(state.visibility === "hidden");
      }
      if (state.family === "region" || state.family === "screen") {
        expect(resolveSurfacePresentation(state).dataState).toBe(state.mode);
      }
    }
  });
});
