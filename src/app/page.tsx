"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; // Use Skeleton for loading

export default function HomePage() {
  const { user, loading, userProfile, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect until auth and profile loading are complete
    if (!loading && !profileLoading) {
      if (user && userProfile) {
        // Redirect based on role
        if (userProfile.role === 'doctor') {
          router.replace('/doctor/dashboard');
        } else if (userProfile.role === 'patient') {
          router.replace('/patient/dashboard');
        } else {
          // Fallback or handle unexpected role
          console.warn("Unknown user role:", userProfile.role);
          router.replace('/login'); // Redirect to login as a safe default
        }
      } else if (!user) {
        // No user logged in, redirect to login
        router.replace('/login');
      }
      // If user exists but profile doesn't (e.g., during signup), stay on a relevant page or redirect appropriately
      // This case might be handled within the signup flow itself.
      // If it needs handling here, redirect to a profile setup page or back to login/signup.
      else if (user && !userProfile) {
         console.log("User logged in but profile not loaded/found, redirecting to login.");
         // Potentially redirect to a 'complete profile' page later
         router.replace('/login');
      }
    }
  }, [user, loading, userProfile, profileLoading, router]);

  // Show loading state while checking auth/profile
  if (loading || profileLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-muted">
         <div className="flex flex-col items-center space-y-4">
           <Skeleton className="h-16 w-16 rounded-full bg-primary/20" />
           <Skeleton className="h-6 w-48 bg-primary/20" />
           <Skeleton className="h-4 w-64 bg-muted-foreground/20" />
         </div>
       </div>
     );
  }


  // This content will be briefly visible before redirection if not loading
  return (
     <div className="flex items-center justify-center min-h-screen bg-muted">
        <p className="text-muted-foreground">Loading MediConnect...</p>
     </div>
  );
}
