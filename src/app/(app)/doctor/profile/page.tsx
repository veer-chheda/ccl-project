"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function DoctorProfilePage() {
  const { user, userProfile, profileLoading: authProfileLoading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  // Add state for available hours if editing is needed
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Separate loading state for page data fetch


  useEffect(() => {
     // Initialize state from AuthContext profile once it's loaded
    if (userProfile && !authProfileLoading) {
       setName(userProfile.name || user?.displayName || "");
       setSpecialization(userProfile.specialization || "");
       setClinicAddress(userProfile.clinicAddress || "");
       setPageLoading(false); // Data is ready from context
    } else if (!authProfileLoading && !userProfile) {
       // Handle case where profile doesn't exist after auth check
       toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
       setPageLoading(false);
    }
     // No dependency array needed if only relying on AuthContext updates triggered by its own useEffect
  }, [userProfile, authProfileLoading, user?.displayName, toast]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const userDocRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userDocRef, {
        name: name,
        specialization: specialization,
        clinicAddress: clinicAddress,
        // Add availableHours update logic if needed
      });
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
       // Optionally refresh context or rely on listener if implemented
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "Could not update profile. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


   if (pageLoading || authProfileLoading) {
     return (
       <AppLayout>
          <div className="space-y-4">
             <Skeleton className="h-8 w-1/4" />
             <Card>
                <CardHeader>
                   <Skeleton className="h-6 w-1/3" />
                   <Skeleton className="h-4 w-2/3 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                       <Skeleton className="h-4 w-16" />
                       <Skeleton className="h-10 w-full" />
                   </div>
                   <div className="space-y-2">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-10 w-full" />
                   </div>
                   <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-20 w-full" />
                   </div>
                    <Skeleton className="h-10 w-24 mt-4" />
                </CardContent>
             </Card>
          </div>
       </AppLayout>
     );
   }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
         <Card>
             <CardHeader>
                 <CardTitle>Doctor Information</CardTitle>
                 <CardDescription>Update your professional details.</CardDescription>
             </CardHeader>
             <CardContent>
                 <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Full Name"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user?.email ?? ""}
                            disabled // Email usually not editable directly
                            className="bg-muted cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g., Cardiologist, General Practitioner"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <Label htmlFor="clinicAddress">Clinic Address</Label>
                        <Textarea
                            id="clinicAddress"
                            value={clinicAddress}
                            onChange={(e) => setClinicAddress(e.target.value)}
                            placeholder="Your clinic's address"
                            disabled={isLoading}
                        />
                    </div>
                    {/* Add UI for editing available hours here if needed */}
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : <> <Save className="mr-2 h-4 w-4"/> Save Changes </>}
                    </Button>
                 </form>
             </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
