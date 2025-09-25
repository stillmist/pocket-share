import { Shapes } from "lucide-react";
import { useEffect } from "react";
import {
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createClient } from "~/lib/supabase.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/login";

export default function Login() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const redirectUrl = searchParams.get("redirect") || "/";

    return redirect(redirectUrl, { headers });
  }

  return {
    user,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.clone().formData();

  const { supabase, headers } = createClient(request.clone());

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const redirectUrl = searchParams.get("redirect") || "/";

  if (error) {
    return { ok: false, data, error, headers };
  } else {
    return redirect(redirectUrl, { headers });
  }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [searchParams] = useSearchParams(location.search);

  useEffect(() => {
    if (user) navigate(searchParams.get("redirect") || "/");
  }, [user]);

  if (user) return null;

  const fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.ok) {
      toast.success("Logged in successfully");
      navigate("/", { replace: true });
    } else if (fetcher.data?.error) {
      // Error
      toast.error("Error logging in", { description: fetcher.data.error });
    }
  }, [fetcher.data]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <fetcher.Form method="post">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <Shapes className="size-6" />
              </div>
              <span className="sr-only">Pocket Share</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Pocket Share.</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="ex@ps.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {busy ? "Logging in" : "Login"}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </div>
  );
}
