import { useState } from "react";
import { Layout } from "@/components/layout";
import { useExams, useCreateExam } from "@/hooks/use-exams";
import { useStudents } from "@/hooks/use-students";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
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
import { Plus, Award, BookOpen, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertExamSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const formSchema = insertExamSchema.omit({ teacherId: true }).extend({
  score: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(1),
  examDate: z.string(),
  studentId: z.coerce.number()
});
type FormValues = z.infer<typeof formSchema>;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function ExamsPage() {
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const { data: students } = useStudents();
  const createMutation = useCreateExam();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Score recorded!",
          description: "The exam score has been saved successfully.",
        });
      }
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-500/10" };
    if (percentage >= 60) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-500/10" };
    return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-500/10" };
  };

  const avgScore = exams?.length 
    ? Math.round(exams.reduce((acc, e) => acc + (e.score / e.maxScore) * 100, 0) / exams.length)
    : 0;

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight">Exams</h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1">
            {exams?.length || 0} exam scores recorded
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="button-add-score"
              className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Add Score</span><span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Record Exam Score</DialogTitle>
              <DialogDescription>
                Add a new exam score for a student.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Student</Label>
                <Controller
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger 
                        data-testid="select-student"
                        className="h-11 rounded-xl border-border/60"
                      >
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Input 
                  id="subject" 
                  data-testid="input-subject"
                  {...form.register("subject")} 
                  placeholder="e.g. Mathematics" 
                  className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score" className="text-sm font-medium">Score</Label>
                  <Input 
                    type="number" 
                    id="score" 
                    data-testid="input-score"
                    {...form.register("score")} 
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxScore" className="text-sm font-medium">Max Score</Label>
                  <Input 
                    type="number" 
                    id="maxScore" 
                    data-testid="input-max-score"
                    {...form.register("maxScore")} 
                    className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input 
                  type="date" 
                  id="date" 
                  data-testid="input-exam-date"
                  {...form.register("examDate")} 
                  className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  data-testid="button-submit-score"
                  disabled={createMutation.isPending}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Score"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {exams && exams.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-6"
        >
          <Card className="rounded-xl sm:rounded-2xl border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 flex-shrink-0">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Class Average</p>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-4xl font-bold">{avgScore}%</span>
                  {avgScore >= 70 ? (
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Great
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full">
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" /> Needs work
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLoadingExams ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </motion.div>
        ) : exams?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No exam scores yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start recording exam scores to track your students' academic performance.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="exams"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {exams?.map((exam) => {
              const student = students?.find(s => s.id === exam.studentId);
              const percentage = Math.round((exam.score / exam.maxScore) * 100);
              const colors = getScoreColor(percentage);
              
              return (
                <motion.div key={exam.id} variants={item}>
                  <Card className="rounded-xl sm:rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colors.light} flex items-center justify-center flex-shrink-0`}>
                            <BookOpen className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg truncate">{student?.name || "Unknown"}</h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                              <span className="bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded-md text-xs font-bold">
                                {exam.subject}
                              </span>
                              <span className="hidden sm:inline">{new Date(exam.examDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-xl sm:text-3xl font-bold ${colors.text}`}>{percentage}%</div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-mono">
                            {exam.score}/{exam.maxScore}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-1.5 sm:h-2 bg-muted"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
