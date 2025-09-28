import { createBrowserClient } from "@supabase/ssr";
import * as tus from "tus-js-client";

import type { Route } from "./+types";

export async function clientAction({ request }: Route.ActionArgs) {
  let formData = await request.clone().formData();

  const files = (formData.getAll("files") as File[]) || [];
  const supabaseEnv = formData.get("supabaseEnv")
    ? JSON.parse(formData.get("supabaseEnv") as string)
    : {};

  for (let file of files) {
    try {
      // Bucket name should be given by or created by the person uploading
      await uploadFile("look", `${file.name}`, file, supabaseEnv);
    } catch (error: any) {
      let errorDetails = extractErrorDetails(error);

      if (errorDetails === null) {
        errorDetails = { errorMessage: "Internal error", statusCode: 500 };
      }

      return {
        ok: false,
        error: errorDetails?.errorMessage,
        statusCode: errorDetails?.statusCode,
      };
    }
  }

  return { ok: true };
}

function extractErrorDetails(errorMessage: string) {
  const jsonMatch = errorMessage.toString().match(/{.*}/);
  if (!jsonMatch) return null;

  try {
    const json = JSON.parse(jsonMatch[0]);
    return {
      statusCode: json.statusCode,
      errorMessage: json.error,
    };
  } catch (e) {
    return null;
  }
}

export async function uploadFile(
  bucketName: string,
  fileName: string,
  file: File,
  supabaseEnv: any,
) {
  const supabase = createBrowserClient(
    supabaseEnv.SUPABASE_URL as string,
    supabaseEnv.SUPABASE_ANON_KEY as string,
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return new Promise<void>(async (resolve, reject) => {
    var upload = new tus.Upload(file, {
      // Supabase TUS endpoint (with direct storage hostname)
      endpoint: `${supabaseEnv.SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session?.access_token}`,
        "x-upsert": "true", // optionally set upsert to true to overwrite existing files
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
      metadata: {
        bucketName: bucketName,
        objectName: fileName,
        cacheControl: "3600",
        contentType: file.type,
      },
      chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
      onError: function (error) {
        console.log("Failed because: " + error);
        reject(error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: function () {
        const name = upload.file instanceof File ? upload.file.name : "";
        console.log("Download %s from %s", name, upload.url);
        resolve();
      },
    });

    // Check if there are any previous uploads to continue.
    const previousUploads = await upload.findPreviousUploads();
    // Found previous uploads so we select the first one.
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    // Start the upload
    upload.start();
  });
}
