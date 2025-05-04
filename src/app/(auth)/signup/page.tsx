"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { UserPlus, BriefcaseMedical, User as UserIcon } from "lucide-react"; // Icons


const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["patient", "doctor"], { required_error: "Please select a role." }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

   const createUserProfile = async (userId: string, name: string, email: string, role: 'patient' | 'doctor') => {
     const userDocRef = doc(db, "users", userId);
     const profileData: any = {
       uid: userId,
       name: name,
       email: email,
       role: role,
       createdAt: serverTimestamp(),
     };
     // Add role-specific fields if needed later
      if (role === 'doctor') {
         profileData.specialization = ''; // Default empty specialization
         profileData.clinicAddress = ''; // Default empty address
         profileData.availableHours = {}; // Default empty hours
      } else {
         profileData.age = null; // Default empty age
         profileData.contactInfo = ''; // Default empty contact
      }
     await setDoc(userDocRef, profileData);
   };


  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.name });

      // Create user profile document in Firestore
      await createUserProfile(user.uid, data.name, data.email, data.role);


      toast({
        title: "Signup Successful",
        description: "Your account has been created.",
      });
       router.push("/"); // Redirect to home, which will handle role-based routing
    } catch (error: any) {
      console.error("Signup failed:", error);
       let errorMessage = "Signup failed. Please try again.";
       if (error.code === 'auth/email-already-in-use') {
         errorMessage = "This email is already registered. Please login or use a different email.";
       } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Please enter a valid email address.";
       } else if (error.code === 'auth/weak-password') {
          errorMessage = "Password is too weak. Please choose a stronger password.";
       }
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

 const handleGoogleSignIn = async (role: 'patient' | 'doctor' | null) => {
    if (!role) {
        toast({ title: "Role Selection Required", description: "Please select if you are signing up as a Patient or Doctor before using Google Sign-In.", variant: "destructive" });
        return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

       // Check if user already exists in Firestore (optional but good practice)
       const userDocRef = doc(db, "users", user.uid);
       const userDoc = await getDoc(userDocRef);

       if (!userDoc.exists()) {
            // Create profile if it doesn't exist
            await createUserProfile(user.uid, user.displayName || "Google User", user.email!, role);
             toast({
                title: "Google Sign-Up Successful",
                description: `Welcome, ${user.displayName || "User"}! Your profile has been created as a ${role}.`,
             });
       } else {
            // User exists, just log them in (profile should already have role)
             toast({
                title: "Google Sign-In Successful",
                description: `Welcome back, ${user.displayName || "User"}!`,
             });
       }

      router.push("/"); // Redirect to home
    } catch (error: any) {
      console.error("Google Sign-in/up failed:", error);
       // Handle specific errors like account existing with different credential
       let errorMessage = "Could not sign in/up with Google. Please try again.";
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "An account already exists with this email address using a different sign-in method.";
        }
      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
             <UserPlus className="h-10 w-10 text-primary" />
           </div>
          <CardTitle className="text-2xl font-bold">Join MediConnect</CardTitle>
          <CardDescription>Create your account to connect with doctors or patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                        disabled={isLoading || isGoogleLoading}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="patient" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                             <UserIcon className="mr-2 h-4 w-4 text-blue-600"/> Patient
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="doctor" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            <BriefcaseMedical className="mr-2 h-4 w-4 text-teal-600"/> Doctor
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "Creating Account..." : <> <UserPlus className="mr-2 h-4 w-4" /> Create Account</>}
              </Button>
            </form>
          </Form>
          <div className="relative my-6">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">
                 Or sign up with
               </span>
             </div>
           </div>
           {/* Pass the selected role to the Google sign-in handler */}
           <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn(form.getValues('role'))} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? "Processing..." : (
                <>
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.12s3.13-7.12 6.99-7.12c1.93 0 3.21.79 4.18 1.71l2.32-2.32C16.46 2.77 14.21 1.51 11.51 1.51 6.63 1.51 2.75 5.39 2.75 10.24s3.88 8.73 8.76 8.73c2.84 0 4.96-1.01 6.59-2.64 1.74-1.74 2.36-4.05 2.36-6.34 0-.6-.05-1.18-.15-1.72H12.48z"></path></svg>
                Google
                </>
            )}
          </Button>
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <p>Already have an account?&nbsp;</p>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log In
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper function to get user profile data (already defined in AuthContext, maybe move to utils)
async function getDoc(ref: any) {
     const firestore = await import("firebase/firestore").then(m => m.getFirestore());
     const { getDoc: firestoreGetDoc } = await import("firebase/firestore");
     return firestoreGetDoc(ref);
}

