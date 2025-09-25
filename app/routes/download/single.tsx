import { createBrowserClient } from "@supabase/ssr";

import type { Route } from "./+types/single";
import { downloadFromUrl } from "./utils";

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.clone().formData();

  const fileName = formData.get("name") as string;
  if (!fileName) return;

  const supabaseEnv = formData.get("supabaseEnv")
    ? JSON.parse(formData.get("supabaseEnv") as string)
    : {};

  const supabase = createBrowserClient(
    supabaseEnv.SUPABASE_URL as string,
    supabaseEnv.SUPABASE_ANON_KEY as string,
  );

  const { data } = supabase.storage.from("look").getPublicUrl(fileName, {
    download: true,
  });

  if (data.publicUrl) {
    try {
      await downloadFromUrl(data.publicUrl, fileName);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }
}
