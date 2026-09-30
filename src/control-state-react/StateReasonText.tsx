import type { HTMLAttributes } from "react";
import type { StateReason } from "../control-state";

export type StateReasonTextProps = HTMLAttributes<HTMLParagraphElement> & {
  reason: StateReason;
};

export function StateReasonText({ reason, ...props }: StateReasonTextProps) {
  return (
    <p data-control-state-reason={reason.code} {...props}>
      {reason.message}
    </p>
  );
}
