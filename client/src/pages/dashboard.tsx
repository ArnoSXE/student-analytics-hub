import { Layout } from "@/components/layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { 
  Users, 
  CalendarCheck2, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Dashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!analytics) return null;

  const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', '#FFBB28', '#FF8042'];
  
  const pieData = [
    { name: 'Present', value: analytics.averageAttendance },
    { name: 'Absent', value: 100 - analytics.averageAttendance },
  ];

  return (
    <Layout>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-display font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening in your class.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <h3 className="text-3xl font-bold">{analytics.totalStudents}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-success/10 rounded-full text-success">
              <CalendarCheck2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
              <h3 className="text-3xl font-bold">{Math.round(analytics.averageAttendance)}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-full text-accent">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
              <h3 className="text-3xl font-bold">{Math.round(analytics.averageScore)}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Attendance Trend Line Chart */}
        <Card className="rounded-2xl shadow-md border-border/50 col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Daily attendance over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fill: 'hsl(var(--muted-foreground))'}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis 
                    tick={{fill: 'hsl(var(--muted-foreground))'}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="presentCount" 
                    name="Present"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="absentCount" 
                    name="Absent"
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Pie Chart */}
        <Card className="rounded-2xl shadow-md border-border/50">
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
            <CardDescription>Presence distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Bar Chart */}
        <Card className="rounded-2xl shadow-md border-border/50">
          <CardHeader>
            <CardTitle>Exam Performance</CardTitle>
            <CardDescription>Distribution of scores across ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.performanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="range" 
                    tick={{fill: 'hsl(var(--muted-foreground))'}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{fill: 'hsl(var(--muted-foreground))'}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Students"
                    fill="hsl(var(--accent))" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
