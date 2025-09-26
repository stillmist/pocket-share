import { replace } from "react-router";
import { createClient } from "~/lib/supabase.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createClient(request);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { ok: false, error };
  } else {
    return replace("/login", { headers });
  }
}
