import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useStudents } from "@/hooks/use-students";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, CalendarIcon, Save, Sparkles, Coffee, UserCheck, UserX } from "lucide-react";
import { format, isSunday } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
};

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: attendanceData, isLoading: isLoadingAttendance } = useAttendance(date);
  const markMutation = useMarkAttendance();
  const { toast } = useToast();

  const [attendanceState, setAttendanceState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (students && attendanceData) {
      const newState: Record<number, boolean> = {};
      students.forEach(student => {
        const record = attendanceData.find(r => r.studentId === student.id);
        newState[student.id] = record ? record.present : true;
      });
      setAttendanceState(newState);
    }
  }, [students, attendanceData, date]);

  const handleToggle = (studentId: number) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSave = () => {
    if (!students) return;
    
    const records = students.map(student => ({
      studentId: student.id,
      present: attendanceState[student.id] ?? true
    }));

    markMutation.mutate({
      date: format(date, "yyyy-MM-dd"),
      records
    }, {
      onSuccess: () => {
        toast({
          title: "Attendance saved!",
          description: `Successfully saved attendance for ${format(date, "MMMM d, yyyy")}`,
        });
      }
    });
  };

  const isHoliday = isSunday(date);
  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const absentCount = Object.values(attendanceState).filter(v => !v).length;

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground text-lg mt-1">
            {format(date, "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                data-testid="button-date-picker"
                className={cn(
                  "w-[220px] justify-start text-left font-normal h-11 rounded-xl border-border/60",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl shadow-xl" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                disabled={(date) => date > new Date()}
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>

          <Button 
            onClick={handleSave} 
            data-testid="button-save-attendance"
            disabled={markMutation.isPending || isHoliday || isLoadingStudents || !students?.length}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            {markMutation.isPending ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Save className="w-4 h-4 mr-2" />
                </motion.div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {!isHoliday && students && students.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card className="rounded-xl border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Present</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/20">
                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Absent</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isHoliday ? (
          <motion.div
            key="holiday"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-900/50 rounded-2xl overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center p-16 text-center relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Coffee className="w-16 h-16 text-amber-500 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-2">It's Sunday!</h3>
                <p className="text-amber-700 dark:text-amber-500 text-lg">Take a break - attendance is not marked on holidays.</p>
                <motion.div 
                  className="absolute top-4 right-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-amber-400/50" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="attendance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
              {isLoadingStudents || isLoadingAttendance ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : students?.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground">Add students in the Students tab to start marking attendance.</p>
                </div>
              ) : (
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-border/30"
                >
                  {students?.map((student) => {
                    const isPresent = attendanceState[student.id];
                    
                    return (
                      <motion.div 
                        key={student.id}
                        variants={item}
                        className={cn(
                          "flex items-center justify-between p-5 transition-colors duration-200",
                          !isPresent && "bg-red-50/50 dark:bg-red-900/10"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-colors duration-300",
                              isPresent 
                                ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                                : "bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg shadow-red-500/25"
                            )}
                          >
                            {student.name.substring(0, 2).toUpperCase()}
                          </motion.div>
                          <div>
                            <p className="font-semibold text-lg">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Roll: {student.rollNumber || "N/A"}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (!isPresent) handleToggle(student.id);
                            }}
                            data-testid={`button-present-${student.id}`}
                            className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
                              isPresent 
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-105" 
                                : "bg-background text-muted-foreground border-border/60 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            )}
                          >
                            <Check className="w-6 h-6" strokeWidth={3} />
                          </motion.button>
                          
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (isPresent) handleToggle(student.id);
                            }}
                            data-testid={`button-absent-${student.id}`}
                            className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
                              !isPresent 
                                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 scale-105" 
                                : "bg-background text-muted-foreground border-border/60 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            )}
                          >
                            <X className="w-6 h-6" strokeWidth={3} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
