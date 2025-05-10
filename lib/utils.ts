import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function downloadFile(
  url: string,
  defaultFilename: string = "download"
) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : defaultFilename;

    // Create a blob from the response
    const blob = await response.blob();

    // Create a download link and trigger the download
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}
