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
import { Label } from "@/components/ui/label";
import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Library, Plus } from "lucide-react";
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

export default function CollectionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error("Failed to fetch collections");
      return response.json();
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to create collection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsCreateDialogOpen(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      toast.success("Collection created successfully");
    },
    onError: (error) => {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
    },
  });

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }
    createCollectionMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <LoadingPlaceholder text="Loading collections..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1">
            Organize your comics into custom collections
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateCollection}>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>
                  Create a new collection to organize your comics
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Enter collection name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCollectionDescription}
                    onChange={(e) =>
                      setNewCollectionDescription(e.target.value)
                    }
                    placeholder="Enter collection description (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createCollectionMutation.isPending}
                >
                  Create Collection
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collections?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <Library className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Collections Yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first collection to start organizing your comics
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections?.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="block group"
            >
              <div className="border rounded-lg p-6 hover:border-primary transition-colors h-full flex flex-col">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Created{" "}
                    {new Date(collection.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
