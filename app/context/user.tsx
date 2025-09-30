import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
};

type UserContextValue = {
  user: User | undefined;
  loading: boolean;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  loading: false,
});

export function UserContextProvider({
  env,
  children,
}: {
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string };
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  useEffect(() => {
    // 1. Check current session on mount
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      user?.email && setUser({ email: user.email });

      setLoading(false);
    };

    getUser();

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        user?.email &&
          setUser({
            email: user.email,
          });
      } else if (event === "SIGNED_OUT") {
        setUser(undefined);
      }
    });

    // 3. Clean up
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useUserContext must be used inside UserContextProvider");
  return ctx;
}
