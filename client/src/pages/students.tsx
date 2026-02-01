import { useState } from "react";
import { Layout } from "@/components/layout";
import { useStudents, useCreateStudent, useDeleteStudent } from "@/hooks/use-students";
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
import { Card } from "@/components/ui/card";
import { Plus, Search, Trash2, UserPlus, Users, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";
import { insertStudentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = insertStudentSchema.omit({ teacherId: true });
type FormValues = z.infer<typeof formSchema>;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

export default function StudentsPage() {
  const { data: students, isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const deleteMutation = useDeleteStudent();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", rollNumber: "" }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        toast({
          title: "Student added!",
          description: `${data.name} has been added to your class.`,
        });
      }
    });
  };

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground text-lg mt-1">
            {students?.length || 0} students in your class
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="button-add-student"
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Add New Student</DialogTitle>
              <DialogDescription>
                Enter the student's details below to add them to your class.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input 
                  id="name" 
                  data-testid="input-student-name"
                  {...form.register("name")} 
                  placeholder="e.g. Rahul Sharma" 
                  className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll" className="text-sm font-medium">Roll Number (Optional)</Label>
                <Input 
                  id="roll" 
                  data-testid="input-student-roll"
                  {...form.register("rollNumber")} 
                  placeholder="e.g. 101" 
                  className="h-11 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  data-testid="button-submit-student"
                  disabled={createMutation.isPending}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          data-testid="input-search-students"
          className="pl-12 h-12 rounded-xl bg-card border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
          placeholder="Search students by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </motion.div>
        ) : filteredStudents?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {search ? "No matching students" : "No students yet"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {search 
                ? "Try a different search term or add a new student." 
                : "Add your first student to get started with attendance tracking."}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="students"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredStudents?.map((student, index) => (
              <motion.div key={student.id} variants={item}>
                <Card className="group rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20"
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Roll: {student.rollNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          data-testid={`button-delete-student-${student.id}`}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-display">Delete {student.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {student.name} and all their attendance records. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="rounded-xl bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                              deleteMutation.mutate(student.id);
                              toast({
                                title: "Student removed",
                                description: `${student.name} has been removed from your class.`,
                              });
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
