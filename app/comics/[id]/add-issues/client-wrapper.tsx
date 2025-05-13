"use client";

import AddIssuesPage from "@/components/pages/addIssuesPage/add-issues-page";

export default function ClientWrapper({ volumeId }: { volumeId: string }) {
  return <AddIssuesPage volumeId={volumeId} />;
}
