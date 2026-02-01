import { Layout } from "@/components/layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Users, 
  CalendarCheck2, 
  TrendingUp, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
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
  AreaChart,
  Area,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [value]);

  return <>{displayValue}{suffix}</>;
}

export default function Dashboard() {
  const { data: analytics, isLoading } = useAnalytics();
  const { user } = useAuth();

  const currentTime = format(new Date(), "EEEE, MMMM d");
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] rounded-2xl lg:col-span-2" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!analytics) return null;

  const COLORS = {
    present: 'hsl(160, 84%, 39%)',
    absent: 'hsl(0, 84%, 60%)',
    primary: 'hsl(221, 83%, 53%)',
    accent: 'hsl(262, 83%, 58%)'
  };
  
  const pieData = [
    { name: 'Present', value: analytics.averageAttendance, fill: COLORS.present },
    { name: 'Absent', value: 100 - analytics.averageAttendance, fill: COLORS.absent },
  ];

  const statCards = [
    {
      title: "Total Students",
      value: analytics.totalStudents,
      suffix: "",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600",
      trend: null
    },
    {
      title: "Avg. Attendance",
      value: analytics.averageAttendance,
      suffix: "%",
      icon: CalendarCheck2,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600",
      trend: analytics.averageAttendance >= 75 ? "up" : "down"
    },
    {
      title: "Avg. Score",
      value: analytics.averageScore,
      suffix: "%",
      icon: TrendingUp,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-600",
      trend: analytics.averageScore >= 70 ? "up" : "down"
    },
    {
      title: "Performance",
      value: analytics.averageScore >= 80 ? "Excellent" : analytics.averageScore >= 60 ? "Good" : "Needs Work",
      suffix: "",
      icon: Award,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600",
      trend: null,
      isText: true
    }
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2 mb-8"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {greeting}, {user?.fullName?.split(' ')[0]}
          </h2>
          <motion.div
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
          </motion.div>
        </div>
        <p className="text-muted-foreground text-lg">{currentTime} — Here's your class overview</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="relative overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      stat.trend === 'up' 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{stat.trend === 'up' ? 'Good' : 'Low'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</p>
                  {stat.isText ? (
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  ) : (
                    <h3 className="text-4xl font-bold tracking-tight">
                      <AnimatedNumber value={stat.value as number} suffix={stat.suffix} />
                    </h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
      >
        <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-display">Attendance Trend</CardTitle>
            <CardDescription>Daily attendance pattern over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.attendanceTrend}>
                  <defs>
                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.present} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.present} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.absent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.absent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      background: 'hsl(var(--card))'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="presentCount" 
                    name="Present"
                    stroke={COLORS.present}
                    strokeWidth={3}
                    fill="url(#presentGradient)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absentCount" 
                    name="Absent"
                    stroke={COLORS.absent}
                    strokeWidth={3}
                    fill="url(#absentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-display">Overall Attendance</CardTitle>
            <CardDescription>Present vs. Absent ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      background: 'hsl(var(--card))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold">{Math.round(analytics.averageAttendance)}%</span>
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.present }}></div>
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.absent }}></div>
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8"
      >
        <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-display">Exam Performance Distribution</CardTitle>
            <CardDescription>Score ranges across all exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.performanceDistribution} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1}/>
                      <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="range" 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      background: 'hsl(var(--card))'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Students"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
}
