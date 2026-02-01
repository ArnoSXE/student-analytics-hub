import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useStudents } from "@/hooks/use-students";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, CalendarIcon, Save } from "lucide-react";
import { format, isSunday } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: attendanceData, isLoading: isLoadingAttendance } = useAttendance(date);
  const markMutation = useMarkAttendance();

  // Local state to manage toggles before saving
  const [attendanceState, setAttendanceState] = useState<Record<number, boolean>>({});

  // Sync state when data loads
  useEffect(() => {
    if (students && attendanceData) {
      const newState: Record<number, boolean> = {};
      
      students.forEach(student => {
        const record = attendanceData.find(r => r.studentId === student.id);
        // Default to true (Present) if no record exists yet
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
    });
  };

  const isHoliday = isSunday(date);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Mark Attendance</h2>
          <p className="text-muted-foreground">
            {format(date, "EEEE, MMMM do, yyyy")}
          </p>
        </div>

        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                disabled={(date) => date > new Date()} // Cannot mark future
              />
            </PopoverContent>
          </Popover>

          <Button 
            onClick={handleSave} 
            disabled={markMutation.isPending || isHoliday || isLoadingStudents}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {markMutation.isPending ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {isHoliday ? (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-yellow-600 mb-4" />
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-500">It's Sunday!</h3>
            <p className="text-yellow-700 dark:text-yellow-400">Attendance cannot be marked on holidays.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-border/50 overflow-hidden">
          <div className="p-0">
            {isLoadingStudents || isLoadingAttendance ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : students?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No students found. Add students in the Students tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 divide-y divide-border/40">
                {students?.map((student) => {
                  const isPresent = attendanceState[student.id];
                  
                  return (
                    <div 
                      key={student.id} 
                      className={cn(
                        "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors",
                        !isPresent && "bg-destructive/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          isPresent ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        )}>
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Roll: {student.rollNumber || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(student.id)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2",
                            isPresent 
                              ? "bg-success text-white border-success shadow-lg shadow-success/20 scale-105" 
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          )}
                        >
                          <Check className="w-6 h-6" />
                        </button>
                        
                        <button
                          onClick={() => handleToggle(student.id)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2",
                            !isPresent 
                              ? "bg-destructive text-white border-destructive shadow-lg shadow-destructive/20 scale-105" 
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          )}
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}
    </Layout>
  );
}
