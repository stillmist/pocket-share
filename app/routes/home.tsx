import DowmloadSection from "~/components/download";
import Navbar from "~/components/navbar";
import UploadSection from "~/components/upload";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pocket Share" }, { name: "description", content: "Home" }];
}

export async function loader({}: Route.LoaderArgs) {
  return {
    env: {
      SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
    files: [],
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="main-container">
      <Navbar />
      <div className="flex items-start justify-center gap-20 px-5 pt-10">
        <UploadSection supabaseEnv={loaderData.env} />
        <DowmloadSection data={loaderData.files} />
      </div>
    </main>
  );
}
