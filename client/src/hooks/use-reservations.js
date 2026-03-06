import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
function useReservations() {
  return useQuery({
    queryKey: [api.reservations.list.path],
    queryFn: async () => {
      const res = await fetch(api.reservations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return api.reservations.list.responses[200].parse(await res.json());
    },
    refetchInterval: 1e4
    // Poll every 10s for new reservations
  });
}
function useCreateReservation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(api.reservations.create.path, {
        method: api.reservations.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to book table");
      return api.reservations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Table Booked!", description: "See you soon at Parsik Cafe." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to book table. Please try again or call us." });
    }
  });
}
function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const url = buildUrl(api.reservations.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.reservations.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.reservations.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] });
      toast({ title: "Updated", description: "Reservation status updated." });
    }
  });
}
export {
  useCreateReservation,
  useReservations,
  useUpdateReservationStatus
};
