import * as React from "react";

import { cn } from "../utils/cn";

const Skeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(function Skeleton(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
