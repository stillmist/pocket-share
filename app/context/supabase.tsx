import { createContext, useContext, useState } from "react";

type SupabaseContextType = {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  anonKey: string;
  setAnonKey: React.Dispatch<React.SetStateAction<string>>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined,
);

export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [url, setUrl] = useState<string>("");
  const [anonKey, setAnonKey] = useState<string>("");

  return (
    <SupabaseContext.Provider value={{ url, setUrl, anonKey, setAnonKey }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx)
    throw new Error("useSupabase must be used inside SupabaseProvideer");
  return ctx;
};
