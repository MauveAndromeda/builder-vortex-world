import { ReactNode } from "react";
import { ThemeOverrideContext, useThemeOverrideState } from "@/hooks/use-theme-override";

export function ThemeOverrideProvider({ children }: { children: ReactNode }) {
  const state = useThemeOverrideState();
  return (
    <ThemeOverrideContext.Provider value={state}>
      {children}
    </ThemeOverrideContext.Provider>
  );
}
