import { redirect } from "react-router";
import { createClient } from "~/lib/supabase.server";
import type { Route } from "./+types/login";

export default function Logout() {
  return <></>;
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createClient(request);

  console.log("logging out");

  const { error } = await supabase.auth.signOut();

  console.log(error);
  console.log(headers);

  if (error) {
    return { ok: false, error };
  } else {
    console.log("redirecting");
    return redirect("/login", { headers });
  }
}
