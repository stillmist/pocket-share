import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
};

type UserContextValue = {
  user: User | undefined;
  loading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  loading: false,
  error: null,
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
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void };

    const getUser = async () => {
      try {
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) return;

        if (session?.user) {
          setUser({ email: session.user.email! });
        } else {
          setUser(undefined);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error getting user session:", err);
          setError(
            err instanceof Error ? err.message : "Failed to get user session",
          );
          setUser(undefined);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        try {
          if (event === "SIGNED_IN" && session?.user) {
            setUser({ email: session.user.email! });
          } else if (event === "SIGNED_OUT") {
            setUser(undefined);
          } else if (event === "INITIAL_SESSION") {
            // This event fires when the initial session is restored
            if (session?.user) {
              setUser({ email: session.user.email! });
            } else {
              setUser(undefined);
            }
            setLoading(false);
          }
        } catch (err) {
          console.error("Error in auth state change:", err);
          if (mounted) {
            setError(
              err instanceof Error ? err.message : "Auth state change error",
            );
          }
        }
      });

      return authSubscription;
    };

    // Initialize auth state
    getUser();

    // Set up auth state listener
    subscription = setupAuthListener();

    // Clean up
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
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
