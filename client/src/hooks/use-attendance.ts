import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type MarkAttendanceRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function useAttendance(date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return useQuery({
    queryKey: [api.attendance.get.path, { date: dateStr }],
    queryFn: async () => {
      const url = `${api.attendance.get.path}?date=${dateStr}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.get.responses[200].parse(await res.json());
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MarkAttendanceRequest) => {
      const res = await fetch(api.attendance.mark.path, {
        method: api.attendance.mark.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to mark attendance");
      return api.attendance.mark.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific date query
      queryClient.invalidateQueries({
        queryKey: [api.attendance.get.path, { date: variables.date }],
      });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      
      toast({ title: "Saved", description: "Attendance updated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
