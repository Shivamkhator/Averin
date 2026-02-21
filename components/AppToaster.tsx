"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-center"
      swipeDirections={["left", "right"]}
      offset={{ top: 72 }}
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}