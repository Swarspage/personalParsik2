import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
    refetchInterval: 1e4
    // Poll every 10s for new orders
  });
}

function useMyOrders() {
  return useQuery({
    queryKey: [api.orders.myOrders.path],
    queryFn: async () => {
      const res = await fetch(api.orders.myOrders.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch your orders");
      return api.orders.myOrders.responses[200].parse(await res.json());
    },
    refetchInterval: 10000
    // Poll every 10s for live updates
  });
}

function useCreateOrder() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to place order");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Order Placed!", description: "We'll have it ready shortly." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to place order. Please try again." });
    }
  });
}

function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status, paymentStatus }) => {
      const url = buildUrl(api.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.orders.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.orders.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Updated", description: "Order status updated successfully." });
    }
  });
}

function useOpenOrders() {
  return useQuery({
    queryKey: ["/api/orders/open"],
    queryFn: async () => {
      const res = await fetch("/api/orders/open", { credentials: "include" });
      if (res.status === 401 || res.status === 403) return []; // Not logged in or not a user
      if (!res.ok) throw new Error("Failed to fetch open orders");
      return await res.json();
    },
    refetchInterval: 5000
  });
}

function useCreateDraftOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/orders/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Please log in to order");
        throw new Error("Failed to order item");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/open"] });
      toast({ title: "Order Sent to Kitchen", description: "The chefs are starting on it now!" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Order Failed", description: err.message || "Failed to order item." });
    }
  });
}

function useCancelDraftOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (orderId) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/open"] });
      toast({ title: "Ticket Cancelled", description: "The un-prepared items have been cancelled." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Cancel Failed", description: "Failed to cancel. It may already be preparing." });
    }
  });
}

function useCheckoutTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ paymentMethod }) => {
      const res = await fetch("/api/orders/checkout-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to checkout");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/open"] });
      queryClient.invalidateQueries({ queryKey: [api.orders.myOrders.path] });
      toast({ title: "Checkout Requested", description: "A waiter will bring your bill shortly." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Checkout Failed", description: "Please inform staff." });
    }
  });
}

export {
  useCreateOrder,
  useOrders,
  useMyOrders,
  useUpdateOrderStatus,
  useOpenOrders,
  useCreateDraftOrder,
  useCancelDraftOrder,
  useCheckoutTable
};
