import { useCallback, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useSupabase } from "~/context/supabase";
import { NonImagePreview } from "./components/file-previews";
import { MasonryGrid } from "./components/masonry-grid";
import { fileGroups, groupFilesByType, type FileWithPreview } from "./utils";

export default function Upload() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  const { url, anonKey } = useSupabase();

  useEffect(() => {
    if (fetcher.data?.ok) {
      // Cleanup object urls
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      // Reset the files
      setFiles([]);

      toast.success("Uploaded files successfully");
    } else if (fetcher.data?.error) {
      // Error
      toast.error("Error uploading files", { description: fetcher.data.error });
    }
  }, [fetcher.data]);

  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleOnDrop = (acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
        id: Math.random().toString(36).substring(2, 9),
      });

      return fileWithPreview;
    });

    setFiles(removeDuplicateFiles<FileWithPreview>(files.concat(newFiles)));
  };

  const handleUpload = async (e: React.FormEvent) => {
    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));
    formData.append(
      "supabaseEnv",
      JSON.stringify({
        SUPABASE_URL: url,
        SUPABASE_ANON_KEY: anonKey,
      }),
    );

    fetcher.submit(formData, {
      action: "/upload/do-upload",
      encType: "multipart/form-data",
      method: "POST",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center rounded-md p-2.5 overflow-auto">
        <Dropzone onDrop={handleOnDrop}>
          {({ getRootProps, getInputProps }) => (
            <section className="w-full md:w-[85%] flex items-center justify-center">
              <div
                {...getRootProps()}
                className="dashed-border w-full lg:w-[50%] min-h-[20rem] lg:min-h-[24rem] flex flex-col items-center justify-center rounded-md select-none"
              >
                <input {...getInputProps()} />

                <svg
                  className="w-8 h-8 mb-4 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 sm:text-lg text-center">
                  <span className="font-semibold">Click to upload</span> or{" "}
                  <span className="font-semibold">drag and drop</span>
                </p>
                <p className="text-sm text-gray-300 text-center">
                  {fileGroups.map((group) => group.accept).join(", ")}
                </p>
              </div>
            </section>
          )}
        </Dropzone>

        <div className="mt-7 min-w-[90%] rounded-md flex justify-center">
          <Button
            type="submit"
            onClick={handleUpload}
            className="w-full md:w-[75%] lg:w-[40%] text-lg text-slate-800 bg-slate-100 select-none cursor-pointer"
            disabled={files.length === 0}
          >
            {busy ? "Uploading" : "Upload"}
          </Button>
        </div>
      </div>

      <div className="w-[90%] mt-10 xl:mt-20">
        <Previews files={files} onFilesChange={setFiles} />
      </div>
    </div>
  );
}

function Previews({
  files,
  onFilesChange,
}: {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
}) {
  const [groupedFiles, setGroupedFiles] = useState<
    ReturnType<typeof groupFilesByType>
  >(groupFilesByType(files));

  useEffect(() => {
    setGroupedFiles(groupFilesByType(files));
  }, [files]);

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const updatedFiles = files.filter((f) => f.id !== fileId);

      const file = files.filter((f) => f.id === fileId);
      if (file.length > 0 && file[0].preview) {
        URL.revokeObjectURL(file[0].preview);
      }

      onFilesChange(updatedFiles);
    },
    [files, onFilesChange],
  );

  return (
    <>
      {files.length > 0 && (
        <div className="space-y-8">
          {fileGroups.map((group) => {
            const groupFiles = groupedFiles[group.type];
            if (groupFiles.length === 0) return null;

            return (
              <div key={group.type} className="space-y-4">
                {/* Group Header */}
                <div className="flex items-center space-x-3 border-b pb-2">
                  <group.icon />
                  <h3 className="text-lg font-semibold text-white">
                    {group.label} ({groupFiles.length})
                  </h3>
                </div>

                {/* Files Grid */}
                {group.type === "image" ? (
                  <MasonryGrid files={groupFiles} onRemove={handleRemoveFile} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupFiles.map((file) => (
                      <div key={file.id} className="min-h-[5rem]">
                        <NonImagePreview
                          file={file}
                          onRemove={handleRemoveFile}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function removeDuplicateFiles<T extends { name: string; size: number }>(
  files: T[],
): T[] {
  const unique = [];
  const seen = new Set();

  for (const file of files) {
    const key = `${file.name}-${file.size}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(file);
    }
  }

  return unique;
}
