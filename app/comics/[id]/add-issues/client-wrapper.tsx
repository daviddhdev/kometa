"use client";

import AddIssuesPage from "@/components/pages/addIssuesPage/add-issues-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ClientWrapper({ volumeId }: { volumeId: string }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AddIssuesPage volumeId={volumeId} />
    </QueryClientProvider>
  );
}
