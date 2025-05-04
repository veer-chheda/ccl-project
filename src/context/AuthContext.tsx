"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface UserProfile {
  role: 'doctor' | 'patient';
  // Add other profile fields as needed
  name?: string;
  specialization?: string; // Doctor specific
  clinicAddress?: string; // Doctor specific
  age?: number; // Patient specific
  contactInfo?: string; // Patient specific
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setProfileLoading(true);
        // Fetch user role/profile from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            console.log("No profile found for user:", currentUser.uid);
            // Handle cases where profile might not exist yet (e.g., during signup flow)
            setUserProfile(null); // Set profile to null explicitly if not found
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null); // Set profile to null on error
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show a loading state while auth or profile is loading
  if (loading || profileLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <Skeleton className="h-12 w-12 rounded-full" />
         <div className="ml-4 space-y-2">
           <Skeleton className="h-4 w-[250px]" />
           <Skeleton className="h-4 w-[200px]" />
         </div>
       </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, loading, userProfile, profileLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
