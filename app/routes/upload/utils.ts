import {
  Aperture,
  FilePenLine,
  FileText,
  Music,
  Paperclip,
} from "lucide-react";

export type FileWithPreview = File & {
  preview: string;
  id: string;
};

export type FileGroup = {
  type: "image" | "pdf" | "audio" | "text" | "other";
  label: string;
  icon: any;
  accept: string;
};

export const fileGroups: FileGroup[] = [
  {
    type: "image",
    label: "Photos",
    icon: Aperture,
    accept: "image/*",
  },
  {
    type: "pdf",
    label: "PDFs",
    icon: FileText,
    accept: ".pdf",
  },
  {
    type: "text",
    label: "Text Files",
    icon: FilePenLine,
    accept: ".txt,.doc,.docx",
  },
  {
    type: "audio",
    label: "Audio",
    icon: Music,
    accept: "audio/*",
  },
  {
    type: "other",
    label: "Other Files",
    icon: Paperclip,
    accept: "*",
  },
];

export const getFileType = (file: File): FileGroup["type"] => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("text/") || file.type.includes("document"))
    return "text";
  return "other";
};

export const groupFilesByType = (files: FileWithPreview[]) => {
  const grouped: Record<FileGroup["type"], FileWithPreview[]> = {
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
