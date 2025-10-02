import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

import { createBrowserClient } from "@supabase/ssr";
import { DownloadIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useSupabase } from "~/context/supabase";
import {
  fileGroups,
  getFileType,
  groupFilesByType,
  parseFileList,
  type StorageFile,
} from "./utils";

export default function Download() {
  const { url, anonKey } = useSupabase();

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(url, anonKey);

  useEffect(() => {
    fetchFiles();
  }, [supabase]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.storage.from("look").list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) throw error;

      const filesWithMetadata: StorageFile[] = parseFileList(data);

      setFiles(filesWithMetadata);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  // Close sidebar after navigation
  const { isMobile, open, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (isMobile && open) {
      setOpenMobile(false);
    }
  }, []);

  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.ok) {
      fetcher.data?.all && toast.success(`Downloaded all files successfully`);
      fetcher.data?.single && toast.success(`Downloaded file successfully`);
    } else if (fetcher.data?.errors && fetcher.data?.all) {
      // When downloading all files
      fetcher.data?.errors.forEach((error: string) => {
        toast.error("Error downloading file", {
          description: error,
        });
      });
    } else if (fetcher.data?.error && fetcher.data?.single) {
      // When downloading single file
      toast.error("Error downloading file", {
        description: fetcher.data.error,
      });
    }
  }, [fetcher.data]);

  const handleDownloadAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!files) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file.name));

    formData.append(
      "supabaseEnv",
      JSON.stringify({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey,
      }),
    );

    toast.info(`Downloading all files`, { duration: 5000 });

    fetcher.submit(formData, {
      action: "/download/all",
      encType: "multipart/form-data",
      method: "POST",
    });
  };

  const handleSingleDownload = async (file: StorageFile) => {
    const formData = new FormData();
    formData.append(
      "supabaseEnv",
      JSON.stringify({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey,
      }),
    );
    formData.append("name", file.name);

    toast.info(`Downloading ${file.name}`, { duration: 5000 });

    fetcher.submit(formData, {
      action: "/download/single",
      encType: "multipart/form-data",
      method: "POST",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-red-400">
        <p className="text-lg mb-4">Error loading files</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-6">
      <div
        className={`max-w-[1600px] mx-auto sticky top-1 backdrop-blur-xl flex justify-between items-center mb-6 p-3 rounded-sm sm:rounded-lg`}
      >
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">
            Download Files
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {files.length} file{files.length !== 1 ? "s" : ""} available for
            download
          </p>
        </div>

        <Button
          onClick={handleDownloadAll}
          className="cursor-pointer select-none"
          disabled={!files || files.length === 0}
        >
          <DownloadIcon /> Download All
        </Button>
      </div>

      <FileList files={files} onDownload={handleSingleDownload} />
    </div>
  );
}

// File List Component
function FileList({
  files,
  onDownload,
}: {
  files: StorageFile[];
  onDownload: (file: StorageFile) => void;
}) {
  const groupedFiles = groupFilesByType(files);

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <span className="text-6xl mb-4 block">📁</span>
        <p className="text-lg mb-2">No files available</p>
        <p className="text-sm">Upload some files to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {fileGroups.map((group) => {
        const groupFiles = groupedFiles[group.type];
        if (groupFiles.length === 0) return null;

        return (
          <div key={group.type} className="space-y-2">
            {/* Group Header */}
            <div className="flex items-center space-x-3 px-4 py-2">
              <group.icon className="size-6" />
              <h3 className="text-lg font-semibold text-white">
                {group.label} ({groupFiles.length})
              </h3>
            </div>

            {/* Files List */}
            <div className="bg-gray-800 rounded-sm overflow-hidden">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden lg:grid sm:grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-400 border-b border-gray-700">
                <div className="sm:col-span-6">Name</div>
                <div className="sm:col-span-2 text-center">Type</div>
                <div className="sm:col-span-2 text-center">Size</div>
                <div className="sm:col-span-1 text-center">Date</div>
              </div>

              {/* Files List */}
              {groupFiles.map((file, index) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  onDownload={onDownload}
                  isLast={index === groupFiles.length - 1}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Individual File List Item
function FileListItem({
  file,
  onDownload,
  isLast,
}: {
  file: StorageFile;
  onDownload: (file: StorageFile) => void;
  isLast: boolean;
}) {
  const group =
    fileGroups.find((g) => g.type === getFileType(file)) ||
    fileGroups.find((g) => g.type === "other")!;

  return (
    <div
      className={`lg:grid lg:grid-cols-12 lg:gap-4 px-4 py-3 hover:bg-gray-700 transition-colors items-center ${
        !isLast ? "border-b border-gray-700" : ""
      }`}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <group.icon className="size-4" />
          <div className="min-w-0 flex-1">
            <p
              className="text-white font-medium truncate text-sm"
              title={file.name}
            >
              {file.name}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
              <span className="capitalize">{group.type}</span>
              <span>•</span>
              <span>{file.size}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-600"
                  onClick={() => onDownload(file)}
                >
                  <span className="sr-only">Download {file.name}</span>
                  <DownloadIcon className="w-4 h-4" fill="currentColor" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download {file.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Desktop Layout */}

      {/* File Name with Icon */}
      <div className="hidden lg:flex lg:col-span-6 items-center space-x-3 min-w-0">
        <group.icon className="size-5" />
        <div className="min-w-0 flex-1">
          <p
            className="text-white font-medium truncate text-sm"
            title={file.name}
          >
            {file.name}
          </p>
        </div>
      </div>

      {/* File Type */}
      <div className="hidden lg:block lg:col-span-2 text-center">
        <span className="text-gray-400 text-sm capitalize">{group.type}</span>
      </div>

      {/* File Size */}
      <div className="hidden lg:block lg:col-span-2 text-center">
        <span className="text-gray-400 text-sm">{file.size}</span>
      </div>

      {/* Date */}
      <div className="hidden lg:block lg:col-span-1 text-center">
        {file.created_at && (
          <span className="text-gray-400 text-sm">{file.created_at}</span>
        )}
      </div>

      {/* Download Action */}
      <div className="hidden lg:flex lg:col-span-1 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-600"
                onClick={() => onDownload(file)}
              >
                <span className="sr-only">Download {file.name}</span>
                <DownloadIcon className="w-4 h-4" fill="currentColor" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download {file.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
