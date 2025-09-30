import { useEffect } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  type LoaderFunctionArgs,
} from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { createClient } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
  };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams([["redirect", location.pathname]]);

  useEffect(() => {
    if (!user) navigate(`/login?${searchParams.toString()}`);
  }, [user]);

  if (!user) return null;

  return (
    <SidebarProvider className="flex flex-col main-container">
      <div className="flex flex-1">
        <AppSidebar />
        <div className="flex min-h-svh w-full flex-col gap-3 p-3">
          <SidebarTrigger />
          <SidebarInset>
            <Outlet />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
