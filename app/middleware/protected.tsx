import { PlayIcon } from "lucide-react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { useSupabase } from "~/context/supabase";
import { UserContextProvider, useUserContext } from "~/context/user";

export default function Index() {
  const location = useLocation();

  const { url, anonKey } = useSupabase();

  const [searchParams] = useSearchParams([["redirect", location.pathname]]);

  return (
    <UserContextProvider
      env={{ SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey }}
    >
      <EnsureUser redirectTo={`/login?${searchParams.toString()}`}>
        <SidebarProvider className="flex flex-col main-container">
          <div className="flex flex-1">
            <AppSidebar />
            <div className="min-h-svh w-full p-2">
              <SidebarTrigger className="fixed top-4 sm:top-5 z-50" />
              <SidebarInset className="mt-10 sm:mt-12">
                <Outlet />
              </SidebarInset>
            </div>
          </div>
        </SidebarProvider>
      </EnsureUser>
    </UserContextProvider>
  );
}

function EnsureUser({
  redirectTo,
  children,
}: {
  redirectTo: string;
  children: React.ReactNode;
}) {
  const { user, loading, error } = useUserContext();

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <PlayIcon className="animate-ping" />
      </div>
    );
  }

  if (error) {
    console.error("Auth error:", error);
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <p className="text-sm text-destructive">Authentication error</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace={true} />;
  }

  return <>{children}</>;
}
