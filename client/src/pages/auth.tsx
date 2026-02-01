import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Users, BarChart3, Loader2, CheckCircle2 } from "lucide-react";

const loginSchema = api.auth.login.input;
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof insertUserSchema>;

const features = [
  { icon: Users, title: "Student Management", desc: "Add and organize all your students" },
  { icon: BarChart3, title: "Visual Analytics", desc: "Beautiful charts and insights" },
  { icon: BookOpen, title: "Exam Tracking", desc: "Monitor academic performance" },
];

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary to-accent p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[20%] w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[30%] right-[15%] w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"
          />
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[60%] left-[60%] w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm rotate-45"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="text-3xl font-bold font-display tracking-tight">ClassTracker</span>
          </div>
          
          <h1 className="text-5xl font-bold font-display leading-tight mb-6">
            Simplify your<br />classroom management
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-md mb-12">
            Track attendance, manage student performance, and visualize progress with beautiful analytics.
          </p>

          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/70">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10 flex gap-6 text-sm font-medium text-primary-foreground/60"
        >
          <span>2024 ClassTracker</span>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:hidden mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <GraduationCap className="w-8 h-8" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold font-display">Welcome to ClassTracker</h1>
            <p className="text-muted-foreground mt-1">Manage your classroom with ease</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Register
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" key="login">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm loginMutation={loginMutation} />
                </motion.div>
              </TabsContent>

              <TabsContent value="register" key="register">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm registerMutation={registerMutation} />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm({ loginMutation }: { loginMutation: any }) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" }
  });

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input 
              id="username" 
              data-testid="input-username"
              {...form.register("username")} 
              placeholder="Enter your username"
              className="h-12 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input 
              id="password" 
              data-testid="input-password"
              type="password" 
              {...form.register("password")} 
              placeholder="Enter your password"
              className="h-12 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button 
            type="submit" 
            data-testid="button-login"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/30" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ registerMutation }: { registerMutation: any }) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { fullName: "", username: "", password: "", classCode: "", teacherUniqueId: "" }
  });

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-display">Create your account</CardTitle>
        <CardDescription>Fill in your details to get started</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input 
                id="fullName" 
                data-testid="input-fullname"
                {...form.register("fullName")} 
                placeholder="John Doe" 
                className="h-11 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {form.formState.errors.fullName && (
                <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-username" className="text-sm font-medium">Username</Label>
              <Input 
                id="reg-username" 
                data-testid="input-reg-username"
                {...form.register("username")} 
                placeholder="jdoe" 
                className="h-11 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>
          </div>
         
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
            <Input 
              id="reg-password" 
              data-testid="input-reg-password"
              type="password" 
              {...form.register("password")} 
              placeholder="Create a secure password"
              className="h-11 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classCode" className="text-sm font-medium">Class Code</Label>
              <Input 
                id="classCode" 
                data-testid="input-classcode"
                {...form.register("classCode")} 
                placeholder="CS-101" 
                className="h-11 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {form.formState.errors.classCode && (
                <p className="text-xs text-destructive">{form.formState.errors.classCode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId" className="text-sm font-medium">Teacher ID</Label>
              <Input 
                id="teacherId" 
                data-testid="input-teacherid"
                {...form.register("teacherUniqueId")} 
                placeholder="T-5592" 
                className="h-11 px-4 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {form.formState.errors.teacherUniqueId && (
                <p className="text-xs text-destructive">{form.formState.errors.teacherUniqueId.message}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            data-testid="button-register"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 mt-2"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
