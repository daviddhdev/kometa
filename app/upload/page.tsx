"use client";
import UploadPage from "@/components/pages/uploadPage/UploadPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Upload() {
  return (
    <QueryClientProvider client={queryClient}>
      <UploadPage />
    </QueryClientProvider>
  );
}
