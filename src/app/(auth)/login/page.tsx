"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Stethoscope, LogIn } from "lucide-react"; // Or other relevant icons

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/"); // Redirect to home, which will handle role-based routing
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Please enter a valid email address.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // You might need to check if this Google user exists in your Firestore 'users' collection
      // and potentially redirect them to a profile completion/role selection step if they are new.
      // For now, assume existing users or handle this post-login redirection logic on the home page.
      toast({
        title: "Google Sign-In Successful",
        description: `Welcome, ${result.user.displayName}!`,
      });
      router.push("/"); // Redirect to home
      router.reload();
    } catch (error: any) {
      console.error("Google Sign-in failed:", error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
             <Stethoscope className="h-10 w-10 text-primary" />
           </div>
          <CardTitle className="text-2xl font-bold">Welcome Back to MediConnect</CardTitle>
          <CardDescription>Sign in to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} type="email" disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "Signing In..." : <> <LogIn className="mr-2 h-4 w-4" /> Sign In </>}
              </Button>
            </form>
          </Form>
           <div className="relative my-6">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">
                 Or continue with
               </span>
             </div>
           </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? "Processing..." : (
                <>
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.12s3.13-7.12 6.99-7.12c1.93 0 3.21.79 4.18 1.71l2.32-2.32C16.46 2.77 14.21 1.51 11.51 1.51 6.63 1.51 2.75 5.39 2.75 10.24s3.88 8.73 8.76 8.73c2.84 0 4.96-1.01 6.59-2.64 1.74-1.74 2.36-4.05 2.36-6.34 0-.6-.05-1.18-.15-1.72H12.48z"></path></svg>
                Google
                </>
            )}
          </Button>
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <p>Don't have an account?&nbsp;</p>
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
