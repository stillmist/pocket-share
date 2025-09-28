import { createContext, useContext } from "react";

type SupabaseContextType = {
  url: string;
  anonKey: string;
};

export const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined,
);

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx)
    throw new Error("useSupabase must be used inside SupabaseProvideer");
  return ctx;
};
