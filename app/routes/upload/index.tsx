import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { FileIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSupabase } from "~/context/supabase";

export default function Upload() {
  return (
    <div className="w-full">
      <UploadSection />
    </div>
  );
}

function UploadSection() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  const { url, anonKey } = useSupabase();

  useEffect(() => {
    if (fetcher.data?.ok) {
      // Reset the files
      const FileInput =
        document && (document.getElementById("files") as HTMLInputElement);
      FileInput.value = "";
      setDndFiles([]);
      setInputFiles([]);
      setFiles([]);

      toast.success("Uploaded files successfully");
    } else if (fetcher.data?.error) {
      // Error
      toast.error("Error uploading files", { description: fetcher.data.error });
    }
  }, [fetcher.data]);

  const [files, setFiles] = useState<File[]>([]);
  const [dndFiles, setDndFiles] = useState<File[]>([]);
  const [inputFiles, setInputFiles] = useState<File[]>([]);

  useEffect(() => {
    setFiles(removeDuplicateFiles([...dndFiles, ...inputFiles]));
  }, [dndFiles, inputFiles]);

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setDndFiles(removeDuplicateFiles(dndFiles.concat(droppedFiles)));
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let target = e.target;

    if (target.files) {
      let filesFromInput: any[] = [];
      for (let i = 0; i < target.files.length; i++) {
        target.files.item(i) && filesFromInput.push(target.files.item(i));
      }
      setInputFiles(removeDuplicateFiles(filesFromInput));
    }
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
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="dashed-border w-[85%] min-h-[24rem] flex flex-col items-center justify-center rounded-md select-none"
        >
          <FileIcon
            className="fill-white -z-10"
            height={"70pt"}
            width={"50pt"}
          />
          <p className="text-lg font-semibold -z-10">
            Drag and drop files here
          </p>
        </div>
        <div className="my-5 text-muted-foreground">OR</div>

        <div className="min-w-[85%] mb-5 rounded-md">
          <Input
            id="files"
            name="files"
            type="file"
            onChange={handleInputChange}
            multiple
          />
        </div>

        <div className="mt-7 min-w-[90%] rounded-md flex justify-center">
          <Button
            type="submit"
            onClick={handleUpload}
            className="w-full md:w-[75%] xl:w-[50%] text-lg text-slate-800 bg-slate-100 select-none cursor-pointer"
            disabled={files.length === 0}
          >
            {busy ? "Uploading" : "Upload"}
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="w-full ps-14 pt-11 flex flex-col items-start justify-start">
          <h3 className="text-xl font-semibold">Files to upload</h3>
          <ol className="pt-3 list-decimal">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function removeDuplicateFiles(files: File[]) {
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
