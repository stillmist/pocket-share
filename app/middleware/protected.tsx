import { useEffect } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  type LoaderFunctionArgs,
} from "react-router";
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

  return <Outlet />;
}
