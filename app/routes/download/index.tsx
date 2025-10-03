import { memo, useCallback, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";

import { createBrowserClient } from "@supabase/ssr";
import { DownloadIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useSidebar } from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useSupabase } from "~/context/supabase";
import { useSelection } from "~/hooks/use-selection";
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

  const { selectedFiles, toggleSelection, toggleSelectAll, clearSelection } =
    useSelection();

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
    if (fetcher.data?.errors && fetcher.data?.all) {
      // When downloading multiple files
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

    const p = fetcher.submit(formData, {
      action: "/download/all",
      encType: "multipart/form-data",
      method: "POST",
    });

    toast.promise(p, {
      loading: "Downloading all files",
      success: (data: void) => {
        return `Downloaded all files`;
      },
      error: "Error downloading files",
    });
  };

  const handleDownloadSelected = () => {
    if (selectedFiles.size === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      if (selectedFiles.has(file.id)) {
        formData.append("files", file.name);
      }
    });

    formData.append(
      "supabaseEnv",
      JSON.stringify({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey,
      }),
    );

    const p = fetcher.submit(formData, {
      action: "/download/all",
      encType: "multipart/form-data",
      method: "POST",
    });

    toast.promise(p, {
      loading: "Downloading selected files",
      success: (data: void) => {
        return `Downloaded selected files`;
      },
      error: "Error downloading selected files",
    });

    clearSelection()
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

    const p = fetcher.submit(formData, {
      action: "/download/single",
      encType: "multipart/form-data",
      method: "POST",
    });

    toast.promise(p, {
      loading: `Downloading ${file.name}`,
      success: (data: void) => {
        return `Downloaded ${file.name}`;
      },
      error: `Error downloading ${file.name}`,
    });
  };

  const isAllSelected = files.length > 0 && selectedFiles.size === files.length;
  const isSomeSelected =
    selectedFiles.size > 0 && selectedFiles.size < files.length;
  const allFileIds = files.map((file) => file.id);

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
        className={`max-w-[1600px] mx-auto sticky top-1 backdrop-blur-xl flex flex-col md:flex-row gap-5 md:gap-0 md:justify-between md:items-center mb-6 p-2 md:p-3 rounded-sm sm:rounded-lg transform-border transition-all duration-300 ${
          selectedFiles.size > 0
            ? "bg-blue-900/20 border border-blue-500/30"
            : ""
        }`}
      >
        <div className="flex items-center justify-between md:justify-center md:space-x-6 transition-all">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">
              {selectedFiles.size > 0
                ? `${selectedFiles.size} selected`
                : "Download Files"}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {selectedFiles.size > 0
                ? `Ready to download ${selectedFiles.size} file${selectedFiles.size !== 1 ? "s" : ""}`
                : `${files.length} file${files.length !== 1 ? "s" : ""} available for download`}
            </p>
          </div>

          {selectedFiles.size === 0 && (
            <Button
              onClick={handleDownloadAll}
              className="flex md:hidden cursor-pointer select-none justify-self-end"
              disabled={
                !files || files.length === 0 || fetcher.state !== "idle"
              }
            >
              <DownloadIcon /> Download All
            </Button>
          )}
        </div>

        {selectedFiles.size > 0 && (
          <div className="flex md:hidden items-center justify-between w-full md:w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-0"
            >
              Clear Selection
            </Button>

            <Button
              onClick={handleDownloadSelected}
              className="cursor-pointer select-none transition-colors"
              disabled={fetcher.state !== "idle"}
            >
              <DownloadIcon /> Download Selected ({selectedFiles.size})
            </Button>
          </div>
        )}

        {selectedFiles.size > 0 && (
          <div className="hidden md:flex items-center justify-center space-x-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
            >
              Clear Selection
            </Button>

            <Button
              onClick={handleDownloadSelected}
              className="cursor-pointer select-none transition-colors"
              disabled={fetcher.state !== "idle"}
            >
              <DownloadIcon /> Download Selected ({selectedFiles.size})
            </Button>
          </div>
        )}

        {selectedFiles.size === 0 && (
          <Button
            onClick={handleDownloadAll}
            className="hidden md:flex cursor-pointer select-none justify-self-end"
            disabled={!files || files.length === 0 || fetcher.state !== "idle"}
          >
            <DownloadIcon /> Download All
          </Button>
        )}
      </div>

      <FileList
        files={files}
        onDownload={handleSingleDownload}
        selectedFiles={selectedFiles}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={() => toggleSelectAll(allFileIds)}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
      />
    </div>
  );
}

function FileList({
  files,
  onDownload,
  selectedFiles,
  onToggleSelection,
  onToggleSelectAll,
  isAllSelected,
  isSomeSelected,
}: {
  files: StorageFile[];
  onDownload: (file: StorageFile) => void;
  selectedFiles: Set<string>;
  onToggleSelection: (fileId: string) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
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
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-400 border-b border-gray-700">
                <div className="lg:col-span-1 flex items-center justify-center">
                  <Checkbox
                    checked={
                      isAllSelected ||
                      (isSomeSelected ? "indeterminate" : false)
                    }
                    onClick={onToggleSelectAll}
                    className="h-4 w-4 rounded cursor-pointer"
                  />
                </div>
                <div className="lg:col-span-5">Name</div>
                <div className="lg:col-span-2 text-center">Type</div>
                <div className="lg:col-span-2 text-center">Size</div>
                <div className="lg:col-span-1 text-center">Date</div>
              </div>

              {/* Files List */}
              {groupFiles.map((file, index) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  onDownload={onDownload}
                  isSelected={selectedFiles.has(file.id)}
                  onToggleSelection={useCallback(
                    () => onToggleSelection(file.id),
                    [file.id, onToggleSelection],
                  )}
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

const FileListItem = memo(
  function FileListItem({
    file,
    onDownload,
    isSelected,
    onToggleSelection,
    isLast,
  }: {
    file: StorageFile;
    onDownload: (file: StorageFile) => void;
    isSelected: boolean;
    onToggleSelection: () => void;
    isLast: boolean;
  }) {
    const group =
      fileGroups.find((g) => g.type === getFileType(file)) ||
      fileGroups.find((g) => g.type === "other")!;

    // Direct event handlers - no useCallback
    const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDownload(file);
    };

    const handleToggleSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onToggleSelection();
    };

    const handleRowClick = (e: React.MouseEvent) => {
      // Only toggle if not clicking on checkbox or download button
      if (
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof SVGElement)
      ) {
        onToggleSelection();
      }
    };

    return (
      <div
        onClick={handleRowClick}
        className={`lg:grid lg:grid-cols-12 lg:gap-4 px-4 py-3 hover:bg-gray-700 transition-colors items-center cursor-pointer ${
          isSelected ? "bg-blue-900/20" : ""
        } ${!isLast ? "border-b border-gray-700" : ""}`}
      >
        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Checkbox
              checked={isSelected}
              onClick={handleToggleSelection}
              className="h-4 w-4 rounded cursor-pointer"
            />
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
                    onClick={handleDownload}
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
        <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
          <Checkbox
            checked={isSelected}
            onClick={handleToggleSelection}
            className="h-4 w-4 rounded cursor-pointer"
          />
        </div>

        <div className="hidden lg:flex lg:col-span-5 items-center space-x-3 min-w-0">
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

        <div className="hidden lg:block lg:col-span-2 text-center">
          <span className="text-gray-400 text-sm capitalize">{group.type}</span>
        </div>

        <div className="hidden lg:block lg:col-span-2 text-center">
          <span className="text-gray-400 text-sm">{file.size}</span>
        </div>

        <div className="hidden lg:block lg:col-span-1 text-center">
          {file.created_at && (
            <span className="text-gray-400 text-sm">{file.created_at}</span>
          )}
        </div>

        <div className="hidden lg:flex lg:col-span-1 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-600"
                  onClick={handleDownload}
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
  },
  (prev, next) => {
    return (
      prev.file.id === next.file.id &&
      prev.isSelected === next.isSelected &&
      prev.isLast === next.isLast
    );
  },
);
