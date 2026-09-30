import { describe, expect, it } from "vitest";
import {
  CONTROL_STATE_CAPABILITIES,
  CONTROL_STATE_SCENARIOS,
  resolveActionState,
  stateReason,
  supportsControlState,
} from "../../src/control-state";

const denied = stateReason("access.denied", "You cannot perform this action.", "permission");
const unavailable = stateReason(
  "availability.unavailable",
  "The action is unavailable.",
  "availability",
);

describe("portable control-state core", () => {
  it("exposes every normative family and scenario", () => {
    expect(Object.keys(CONTROL_STATE_CAPABILITIES)).toEqual([
      "action",
      "field",
      "navigation",
      "disclosure",
      "region",
      "screen",
    ]);
    expect(new Set(CONTROL_STATE_SCENARIOS.map(({ id }) => id)).size).toBe(
      CONTROL_STATE_SCENARIOS.length,
    );
    expect(CONTROL_STATE_SCENARIOS).toHaveLength(29);
  });

  it("reports supported family states", () => {
    expect(supportsControlState("action", "busy")).toBe(true);
    expect(supportsControlState("action", "readonly")).toBe(false);
    expect(supportsControlState("screen", "access-denied")).toBe(true);
  });

  it("applies visibility, access, availability, busy, then ready precedence", () => {
    expect(resolveActionState(baseInput({ visible: false }))).toMatchObject({
      visibility: "hidden",
    });
    expect(resolveActionState(baseInput({ access: "pending" }))).toMatchObject({
      interaction: "disabled",
      reason: { code: "access.pending" },
    });
    expect(resolveActionState(baseInput({ access: "denied" }))).toMatchObject({
      interaction: "disabled",
      reason: denied,
    });
    expect(
      resolveActionState(baseInput({ available: false, unavailableReason: unavailable })),
    ).toMatchObject({ interaction: "disabled", reason: unavailable });
    expect(resolveActionState(baseInput({ busy: true }))).toMatchObject({
      interaction: "enabled",
      activity: "busy",
    });
  });

  it("rejects empty reasons and unavailable actions without a reason", () => {
    expect(() => stateReason("", "Message", "policy")).toThrow();
    expect(() => resolveActionState(baseInput({ available: false }))).toThrow(
      "Unavailable actions require a reason",
    );
  });
});

function baseInput(
  overrides: Partial<Parameters<typeof resolveActionState>[0]> = {},
): Parameters<typeof resolveActionState>[0] {
  return {
    access: "allowed",
    deniedReason: denied,
    available: true,
    ...overrides,
  };
}
