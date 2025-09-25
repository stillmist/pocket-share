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
