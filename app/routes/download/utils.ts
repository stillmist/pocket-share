import type { FileObject } from "@supabase/storage-js/src/lib/types";
import {
  Aperture,
  FilePenLine,
  FileText,
  Music,
  Paperclip,
} from "lucide-react";

export async function downloadFromUrl(url: string, fileName: string) {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Clean up
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export function parseFileList(files: FileObject[]) {
  const parsedFiles: StorageFile[] = [];

  for (let file of files) {
    if (!file.id && !file.metadata) continue;

    const parsedFile: StorageFile = {
      id: file.id,
      name: file.name,
      size: formatFileSize(file.metadata.size),
      type: file.metadata.mimetype,
      created_at: parseDate(file.metadata.lastModified),
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

export type StorageFile = {
  name: string;
  size: string;
  type: string;
  id: string;
  created_at?: string;
};

export type FileGroup = {
  type: "image" | "pdf" | "audio" | "text" | "other";
  label: string;
  icon: any;
};

export const fileGroups: FileGroup[] = [
  {
    type: "image",
    label: "Photos",
    icon: Aperture,
  },
  {
    type: "pdf",
    label: "PDFs",
    icon: FileText,
  },
  {
    type: "text",
    label: "Text Files",
    icon: FilePenLine,
  },
  {
    type: "audio",
    label: "Audio",
    icon: Music,
  },
  {
    type: "other",
    label: "Other Files",
    icon: Paperclip,
  },
];

export const getFileType = (file: StorageFile): FileGroup["type"] => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("text/") || file.type.includes("document"))
    return "text";
  return "other";
};

export const groupFilesByType = (files: StorageFile[]) => {
  const grouped: Record<FileGroup["type"], StorageFile[]> = {
    image: [],
    pdf: [],
    audio: [],
    text: [],
    other: [],
  };

  files.forEach((file) => {
    const type = getFileType(file);
    grouped[type].push(file);
  });

  return grouped;
};
