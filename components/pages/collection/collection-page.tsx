"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VolumeCard } from "@/components/utils/volume-card";
import type { Volume } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Collection {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function CollectionPage({ id }: { id: string }) {
  const [isAddVolumeDialogOpen, setIsAddVolumeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: collection, isLoading: isLoadingCollection } =
    useQuery<Collection>({
      queryKey: ["collection", id],
      queryFn: async () => {
        const response = await fetch(`/api/collections/${id}`);
        if (!response.ok) throw new Error("Failed to fetch collection");
        return response.json();
      },
    });

  const { data: volumes, isLoading: isLoadingVolumes } = useQuery<Volume[]>({
    queryKey: ["collection-volumes", id],
    queryFn: async () => {
      const response = await fetch(`/api/collections/${id}/volumes`);
      if (!response.ok) throw new Error("Failed to fetch collection volumes");
      return response.json();
    },
  });

  const { data: availableVolumes, isLoading: isLoadingAvailableVolumes } =
    useQuery<Volume[]>({
      queryKey: ["available-volumes", searchQuery],
      queryFn: async () => {
        const response = await fetch(`/api/volumes?search=${searchQuery}`);
        if (!response.ok) throw new Error("Failed to fetch available volumes");
        return response.json();
      },
      enabled: isAddVolumeDialogOpen,
    });

  const addVolumeMutation = useMutation({
    mutationFn: async (volumeId: number) => {
      const response = await fetch(`/api/collections/${id}/volumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volumeId }),
      });
      if (!response.ok) throw new Error("Failed to add volume to collection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection-volumes", id],
      });
      setIsAddVolumeDialogOpen(false);
      toast.success("Volume added to collection");
    },
    onError: (error) => {
      console.error("Error adding volume to collection:", error);
      toast.error("Failed to add volume to collection");
    },
  });

  const removeVolumeMutation = useMutation({
    mutationFn: async (volumeId: number) => {
      const response = await fetch(
        `/api/collections/${id}/volumes?volumeId=${volumeId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok)
        throw new Error("Failed to remove volume from collection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection-volumes", id],
      });
      toast.success("Volume removed from collection");
    },
    onError: (error) => {
      console.error("Error removing volume from collection:", error);
      toast.error("Failed to remove volume from collection");
    },
  });

  if (isLoadingCollection || isLoadingVolumes) {
    return <div>Loading collection...</div>;
  }

  if (!collection) {
    return <div>Collection not found</div>;
  }

  const filteredAvailableVolumes = availableVolumes?.filter(
    (volume) => !volumes?.some((v) => v.id === volume.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 flex-col">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>
        <h1 className="text-3xl font-bold">{collection.name}</h1>
      </div>

      {collection.description && (
        <p className="text-muted-foreground mb-8">{collection.description}</p>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Volumes</h2>
        <Dialog
          open={isAddVolumeDialogOpen}
          onOpenChange={setIsAddVolumeDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Volume
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Volume to Collection</DialogTitle>
              <DialogDescription>
                Select a volume to add to this collection
              </DialogDescription>
            </DialogHeader>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto py-2">
              {isLoadingAvailableVolumes ? (
                <div>Loading volumes...</div>
              ) : filteredAvailableVolumes?.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No volumes found
                </div>
              ) : (
                filteredAvailableVolumes?.map((volume) => (
                  <div key={volume.id} className="relative">
                    <VolumeCard volume={volume} hideActions />
                    <Button
                      className="absolute top-2 right-2"
                      size="sm"
                      onClick={() => addVolumeMutation.mutate(volume.id)}
                      disabled={addVolumeMutation.isPending}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsAddVolumeDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {volumes?.map((volume) => (
          <div key={volume.id} className="relative group">
            <VolumeCard
              volume={volume}
              extraButton={
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-full"
                  onClick={() => removeVolumeMutation.mutate(volume.id)}
                >
                  Remove from collection
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
