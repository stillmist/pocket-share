import DowmloadSection, { type CustomFile } from "~/components/download";
import Navbar from "~/components/navbar";
import UploadSection from "~/components/upload";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pocket Share" }, { name: "description", content: "Home" }];
}

export async function clientLoader({}: Route.ClientLoaderArgs): Promise<
  CustomFile[]
> {
  return [];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="main-container">
      <Navbar />
      <div className="flex items-start justify-center gap-20 px-5 pt-10">
        <UploadSection />
        <DowmloadSection data={loaderData} />
      </div>
    </main>
  );
}
