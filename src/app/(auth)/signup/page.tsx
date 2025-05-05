
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"; // Import getDoc
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
import { Textarea } from "@/components/ui/textarea"; // Import Textarea


const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["patient", "doctor"], { required_error: "Please select a role." }),
  specialization: z.string().optional(), // Optional for conditional rendering
  clinicAddress: z.string().optional(), // Optional for conditional rendering
}).refine((data) => {
  // Require specialization and clinicAddress if role is doctor
  if (data.role === 'doctor') {
    return !!data.specialization && !!data.clinicAddress;
  }
  return true;
}, {
  // Custom error message if validation fails (though individual field errors are often better)
   message: "Specialization and Clinic Address are required for doctors.",
   // Specify path for error message if needed, or leave general
   // path: ["specialization"], // Example: attach error to specialization
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
      specialization: "",
      clinicAddress: "",
    },
  });

  // Watch the role field to conditionally render doctor fields
  const selectedRole = form.watch("role");


   const createUserProfile = async (userId: string, name: string, email: string, role: 'patient' | 'doctor', specialization?: string, clinicAddress?: string) => {
     const userDocRef = doc(db, "users", userId);
     const profileData: any = {
       uid: userId,
       name: name,
       email: email,
       role: role,
       createdAt: serverTimestamp(),
     };
     // Add role-specific fields
      if (role === 'doctor') {
         profileData.specialization = specialization || ''; // Use provided or default empty
         profileData.clinicAddress = clinicAddress || ''; // Use provided or default empty
         profileData.availableHours = {}; // Default empty hours map
      } else {
         profileData.age = null; // Default empty age for patient
         profileData.contactInfo = ''; // Default empty contact for patient
      }
     await setDoc(userDocRef, profileData);
   };


  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
     // Double-check required fields for doctor before submitting
    if (data.role === 'doctor' && (!data.specialization || !data.clinicAddress)) {
        toast({
            title: "Missing Information",
            description: "Please provide specialization and clinic address for doctor registration.",
            variant: "destructive",
        });
        // Set errors manually if needed, although zod refine should handle it too
         form.setError("specialization", { type: "manual", message: "Specialization is required." });
         form.setError("clinicAddress", { type: "manual", message: "Clinic address is required." });
        return; // Stop submission
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.name });

      // Create user profile document in Firestore
      await createUserProfile(user.uid, data.name, data.email, data.role, data.specialization, data.clinicAddress);


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
     // For Google Sign-in as doctor, we can't collect specialization/address upfront easily.
     // We'll create the basic profile and they'll need to complete it later via their profile page.
     if (role === 'doctor') {
         toast({
             title: "Complete Profile Later",
             description: "After signing in with Google, please complete your specialization and clinic address in your profile.",
             duration: 5000, // Show longer
         });
     }

    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

       // Check if user already exists in Firestore
       const userDocRef = doc(db, "users", user.uid);
       const userDoc = await getDoc(userDocRef);

       if (!userDoc.exists()) {
            // Create profile if it doesn't exist (basic profile for Google Doctor signup)
            await createUserProfile(user.uid, user.displayName || "Google User", user.email!, role);
             toast({
                title: "Google Sign-Up Successful",
                description: `Welcome, ${user.displayName || "User"}! Your profile has been created as a ${role}.`,
             });
       } else {
            // User exists, just log them in
            // Optionally, check if the existing role matches the selected role?
            const existingProfile = userDoc.data();
            if (existingProfile?.role !== role) {
                 toast({
                    title: "Role Mismatch",
                    description: `You previously signed in as a ${existingProfile?.role}. Please log in with the correct role or contact support.`,
                    variant: "destructive",
                    duration: 7000,
                 });
                 // Log them out to avoid confusion
                 await auth.signOut();
                 setIsGoogleLoading(false);
                 return;
            }

             toast({
                title: "Google Sign-In Successful",
                description: `Welcome back, ${user.displayName || "User"}!`,
             });
       }

      router.push("/"); // Redirect to home
      router.reload(); // Reload to ensure context picks up new user state correctly
    } catch (error: any) {
      console.error("Google Sign-in/up failed:", error);
       // Handle specific errors
       let errorMessage = "Could not sign in/up with Google. Please try again.";
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "An account already exists with this email address using a different sign-in method (e.g., email/password). Please log in using that method.";
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
                      <Input placeholder="•••••••• (min. 6 characters)" {...field} type="password" disabled={isLoading || isGoogleLoading}/>
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
                    <FormLabel>I am signing up as a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                        disabled={isLoading || isGoogleLoading}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="patient" id="role-patient" />
                          </FormControl>
                          <FormLabel htmlFor="role-patient" className="font-normal flex items-center cursor-pointer">
                             <UserIcon className="mr-2 h-4 w-4 text-blue-600"/> Patient
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="doctor" id="role-doctor" />
                          </FormControl>
                          <FormLabel htmlFor="role-doctor" className="font-normal flex items-center cursor-pointer">
                            <BriefcaseMedical className="mr-2 h-4 w-4 text-teal-600"/> Doctor
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Fields for Doctor */}
               {selectedRole === 'doctor' && (
                 <>
                   <FormField
                     control={form.control}
                     name="specialization"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Specialization</FormLabel>
                         <FormControl>
                           <Input placeholder="e.g., Cardiologist, General Practitioner" {...field} disabled={isLoading || isGoogleLoading}/>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="clinicAddress"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Clinic Address</FormLabel>
                         <FormControl>
                            <Textarea placeholder="Your clinic's full address" {...field} disabled={isLoading || isGoogleLoading}/>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </>
               )}


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
           <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn(form.getValues('role'))} disabled={isLoading || isGoogleLoading || !selectedRole}>
            {isGoogleLoading ? "Processing..." : (
                <>
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.12s3.13-7.12 6.99-7.12c1.93 0 3.21.79 4.18 1.71l2.32-2.32C16.46 2.77 14.21 1.51 11.51 1.51 6.63 1.51 2.75 5.39 2.75 10.24s3.88 8.73 8.76 8.73c2.84 0 4.96-1.01 6.59-2.64 1.74-1.74 2.36-4.05 2.36-6.34 0-.6-.05-1.18-.15-1.72H12.48z"></path></svg>
                Google as {selectedRole ? (selectedRole === 'patient' ? 'Patient' : 'Doctor') : '...'}
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

// Note: The helper getDoc function was removed as it's now imported directly from firebase/firestore at the top.


    