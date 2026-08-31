"use client";

import { IconContext } from "@phosphor-icons/react";

const defaultIconProps = { weight: "light" as const };

export function IconThemeProvider({ children }: { children: React.ReactNode }) {
  return <IconContext.Provider value={defaultIconProps}>{children}</IconContext.Provider>;
}
