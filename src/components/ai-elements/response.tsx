"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        // make sure rendered markdown doesn't add large top/bottom gaps
        // - remove margins on direct children
        // - remove margins on paragraphs and tables, and make tables responsive
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "[&_p]:mt-0 [&_p]:mb-0",
        "[&_table]:mt-0 [&_table]:mb-0 [&_table]:w-full [&_table]:table-auto [&_table]:text-sm",
        "[&_th]:text-left [&_th]:font-medium [&_th]:px-2 [&_th]:py-1",
        "[&_td]:px-2 [&_td]:py-1 [&_td]:align-top",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
