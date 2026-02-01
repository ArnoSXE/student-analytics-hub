import { useState } from "react";
import { Layout } from "@/components/layout";
import { useExams, useCreateExam } from "@/hooks/use-exams";
import { useStudents } from "@/hooks/use-students";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { insertExamSchema } from "@shared/schema";

const formSchema = insertExamSchema.omit({ teacherId: true }).extend({
  score: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(1),
  examDate: z.string(),
  studentId: z.coerce.number()
});
type FormValues = z.infer<typeof formSchema>;

export default function ExamsPage() {
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const { data: students } = useStudents();
  const createMutation = useCreateExam();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      score: 0,
      maxScore: 100,
      examDate: format(new Date(), "yyyy-MM-dd"),
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Exams & Scores</h2>
          <p className="text-muted-foreground">Record student performance.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Score
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Exam Score</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Controller
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name} ({s.rollNumber || "No Roll"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.studentId && (
                  <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...form.register("subject")} placeholder="e.g. Mathematics" />
                {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input type="number" id="score" {...form.register("score")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxScore">Max Score</Label>
                  <Input type="number" id="maxScore" {...form.register("maxScore")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" {...form.register("examDate")} />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Score"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoadingExams ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : exams?.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No exams recorded yet.</td></tr>
              ) : (
                exams?.map((exam) => {
                  const student = students?.find(s => s.id === exam.studentId);
                  const percentage = (exam.score / exam.maxScore) * 100;
                  
                  return (
                    <tr key={exam.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-muted-foreground">
                        {new Date(exam.examDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {student?.name || "Unknown Student"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                          {exam.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        {exam.score} / {exam.maxScore}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={percentage >= 50 ? "text-success font-bold" : "text-destructive font-bold"}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
