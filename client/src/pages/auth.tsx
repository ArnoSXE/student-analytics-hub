import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { api } from "@shared/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpenCheck } from "lucide-react";

const loginSchema = api.auth.login.input;
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">ClassTracker</span>
          </div>
          <h1 className="text-5xl font-bold font-display leading-tight mb-6">
            Simplify your classroom management today.
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Track attendance, manage student performance, and visualize progress all in one place.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-sm font-medium text-primary-foreground/60">
          <span>&copy; 2024 ClassTracker</span>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-8">
             <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-display">Welcome to ClassTracker</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm loginMutation={loginMutation} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm registerMutation={registerMutation} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ loginMutation }: { loginMutation: any }) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-display">Sign in to your account</CardTitle>
        <CardDescription>Enter your username and password below.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register("username")} placeholder="jdoe" />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ registerMutation }: { registerMutation: any }) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-display">Create a teacher account</CardTitle>
        <CardDescription>We just need a few details to get you started.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
             <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...form.register("username")} placeholder="jdoe" />
               {form.formState.errors.username && (
                <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>
          </div>
         
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
             {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classCode">Class Code</Label>
              <Input id="classCode" {...form.register("classCode")} placeholder="CS-101" />
               {form.formState.errors.classCode && (
                <p className="text-sm text-destructive">{form.formState.errors.classCode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input id="teacherId" {...form.register("teacherUniqueId")} placeholder="T-5592" />
               {form.formState.errors.teacherUniqueId && (
                <p className="text-sm text-destructive">{form.formState.errors.teacherUniqueId.message}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
