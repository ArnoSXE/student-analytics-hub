import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type CreateExamRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useExams() {
  return useQuery({
    queryKey: [api.exams.list.path],
    queryFn: async () => {
      const res = await fetch(api.exams.list.path);
      if (!res.ok) throw new Error("Failed to fetch exams");
      return api.exams.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateExamRequest) => {
      const validated = api.exams.create.input.parse(data);
      const res = await fetch(api.exams.create.path, {
        method: api.exams.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to add exam score");
      return api.exams.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.exams.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      toast({ title: "Success", description: "Exam score recorded" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
