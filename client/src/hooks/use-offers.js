import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

function useOffers(activeOnly = false) {
    return useQuery({
        queryKey: [api.offers.list.path, activeOnly],
        queryFn: async () => {
            const url = new URL(api.offers.list.path, window.location.origin);
            if (activeOnly) url.searchParams.append("active", "true");
            const res = await fetch(url.toString(), { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch offers");
            return api.offers.list.responses[200].parse(await res.json());
        }
    });
}

function useCreateOffer() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (data) => {
            const res = await fetch(api.offers.create.path, {
                method: api.offers.create.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "Failed to create offer" }));
                throw new Error(errorData.message || "Failed to create offer");
            }
            return api.offers.create.responses[201].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.offers.list.path] });
            toast({ title: "Success", description: "Offer created successfully" });
        },
        onError: (error) => {
            toast({ variant: "destructive", title: "Validation Error", description: error.message });
        }
    });
}

function useUpdateOffer() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const url = buildUrl(api.offers.update.path, { id });
            const res = await fetch(url, {
                method: api.offers.update.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to update offer");
            return api.offers.update.responses[200].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.offers.list.path] });
            toast({ title: "Success", description: "Offer updated successfully" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to update offer" });
        }
    });
}

function useDeleteOffer() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (id) => {
            const url = buildUrl(api.offers.delete.path, { id });
            const res = await fetch(url, {
                method: api.offers.delete.method,
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to delete offer");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.offers.list.path] });
            toast({ title: "Success", description: "Offer deleted" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete offer" });
        }
    });
}

function useToggleOffer() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: async (id) => {
            const url = buildUrl(api.offers.toggle.path, { id });
            const res = await fetch(url, {
                method: api.offers.toggle.method,
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to toggle offer");
            return api.offers.toggle.responses[200].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.offers.list.path] });
            toast({ title: "Success", description: "Offer status toggled" });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to toggle offer status" });
        }
    });
}

export {
    useOffers,
    useCreateOffer,
    useUpdateOffer,
    useDeleteOffer,
    useToggleOffer
};
