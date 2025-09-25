import DowmloadSection, { type CustomFile } from "~/components/download";
import Navbar from "~/components/navbar";
import UploadSection from "~/components/upload";
import { createClient } from "~/lib/supabase.server";
import type { Route } from "./+types/home";

import type { FileObject } from "@supabase/storage-js/src/lib/types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSupabase } from "~/context/supabase";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pocket Share" }, { name: "description", content: "Home" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data, error } = await supabase.storage.from("look").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  const parsedFiles = data ? parseFileList(data) : [];

  return {
    env: {
      SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
    error: error?.message,
    files: parsedFiles,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (loaderData.error) {
    toast.error("Error loading files. Try reloading page.", {
      description: loaderData.error,
    });
  }

  const { setUrl, setAnonKey } = useSupabase();

  useEffect(() => {
    setUrl(loaderData.env.SUPABASE_URL);
    setAnonKey(loaderData.env.SUPABASE_ANON_KEY);
  }, []);

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

function parseFileList(files: FileObject[]) {
  const parsedFiles: CustomFile[] = [];

  for (let file of files) {
    if (!file.id && !file.metadata) continue;

    const parsedFile: CustomFile = {
      name: file.name,
      size: formatFileSize(file.metadata.size),
      type: parseMimeType(file.metadata.mimetype),
      modified: parseDate(file.metadata.lastModified),
    };

    parsedFiles.push(parsedFile);
  }

  return parsedFiles;
}

function parseDate(dateString: string) {
  const date = new Date(dateString);

  // Use Intl.DateTimeFormat with 'en-GB' for DD/MM/YYYY format
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  const formatted = formatter.format(date);

  // Replace slashes with dashes
  const finalDate = formatted.replace(/\//g, "-");

  return finalDate;
}

function parseMimeType(mimeType: string) {
  // Split at '/' and take the second part
  const parts = mimeType.split("/");
  if (parts.length !== 2) return parts[0];

  // For types like 'image/svg+xml', we only want 'svg'
  const subtype = parts[1].split("+")[0];

  return subtype;
}

function formatFileSize(bytes: number) {
  const units = ["B", "kB", "MB", "GB", "TB"];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  const size = bytes.toFixed(i === 0 ? 0 : 1); // No decimals for bytes
  return `${size}${units[i]}`;
}
