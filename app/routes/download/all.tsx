import { createBrowserClient } from "@supabase/ssr";

import type { Route } from "./+types/all";
import { downloadFromUrl } from "./utils";

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.clone().formData();

  const fileNames = formData.getAll("files") as string[];
  if (!fileNames) return;

  const supabaseEnv = formData.get("supabaseEnv")
    ? JSON.parse(formData.get("supabaseEnv") as string)
    : {};

  const supabase = createBrowserClient(
    supabaseEnv.SUPABASE_URL as string,
    supabaseEnv.SUPABASE_ANON_KEY as string,
  );

  const downloadUrls: { name: string; url: string }[] = [];

  fileNames.forEach((fileName) => {
    const { data } = supabase.storage.from("look").getPublicUrl(fileName, {
      download: true,
    });
    data.publicUrl &&
      downloadUrls.push({ name: fileName, url: data.publicUrl });
  });

  const results = await Promise.allSettled(
    downloadUrls.map(async ({ name, url }) => {
      await downloadFromUrl(url, name);
    }),
  );

  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason);

  if (errors.length === 0) {
    return { ok: true, all: true };
  } else {
    return { ok: false, errors };
  }
}
