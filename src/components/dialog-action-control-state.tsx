"use client";

import * as React from "react";

import type { ActionState } from "../control-state";

type DialogActionStateProps = {
  controlState?: ActionState;
  stateReasonId?: string;
};

function DialogActionBusyLabel({ id, label }: { id?: string; label?: string }) {
  return id && label ? (
    <span id={id} className="sr-only">
      {label}
    </span>
  ) : null;
}

export { DialogActionBusyLabel, type DialogActionStateProps };
