import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

function useMenu(category) {
  return useQuery({
    queryKey: [api.menu.list.path, category],
    queryFn: async () => {
      const url = new URL(api.menu.list.path, window.location.origin);
      if (category && category !== "All") url.searchParams.append("category", category);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch menu");
      return api.menu.list.responses[200].parse(await res.json());
    }
  });
}

function useCreateMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(api.menu.create.path, {
        method: api.menu.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to create menu item");
      return api.menu.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
      toast({ title: "Success", description: "Menu item created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create menu item" });
    }
  });
}

function useCreateMenuItemsBulk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (items) => {
      const results = await Promise.allSettled(
        items.map(async (data) => {
          const res = await fetch(api.menu.create.path, {
            method: api.menu.create.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: "Failed to create menu item" }));
            throw new Error(errorData.message || "Failed to create menu item");
          }
          return api.menu.create.responses[201].parse(await res.json());
        })
      );

      const failed = results.filter(r => r.status === "rejected");
      if (failed.length === items.length) {
        throw new Error("Failed to save any items.");
      } else if (failed.length > 0) {
        throw new Error(`Saved ${items.length - failed.length} items, but ${failed.length} failed.`);
      }
      return results.map(r => r.value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
      toast({ title: "Success", description: "Menu items created successfully" });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] }); // Invalidate anyway in case some succeeded
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });
}

function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const url = buildUrl(api.menu.update.path, { id });
      const res = await fetch(url, {
        method: api.menu.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update menu item");
      return api.menu.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
      toast({ title: "Success", description: "Menu item updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update menu item" });
    }
  });
}

function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id) => {
      const url = buildUrl(api.menu.delete.path, { id });
      const res = await fetch(url, {
        method: api.menu.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete menu item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.menu.list.path] });
      toast({ title: "Success", description: "Menu item deleted" });
    }
  });
}

export {
  useCreateMenuItem,
  useCreateMenuItemsBulk,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useMenu
};
