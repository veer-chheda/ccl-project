"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function PatientProfilePage() {
  const { user, userProfile, profileLoading: authProfileLoading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | string>(""); // Allow string for input flexibility
  const [contactInfo, setContactInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Separate loading state

  useEffect(() => {
    if (userProfile && !authProfileLoading) {
      setName(userProfile.name || user?.displayName || "");
      setAge(userProfile.age ?? ""); // Handle null/undefined age
      setContactInfo(userProfile.contactInfo || "");
      setPageLoading(false);
    } else if (!authProfileLoading && !userProfile) {
      toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
      setPageLoading(false);
    }
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
       // Convert age back to number for Firestore, handle empty string or invalid input
      const ageNumber = age === "" ? null : parseInt(String(age), 10);
       if (age !== "" && isNaN(ageNumber!)) {
           toast({ title: "Invalid Input", description: "Please enter a valid number for age.", variant: "destructive" });
           setIsLoading(false);
           return;
       }


      await updateDoc(userDocRef, {
        name: name,
        age: ageNumber, // Store as number or null
        contactInfo: contactInfo,
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
                       <Skeleton className="h-4 w-10" />
                       <Skeleton className="h-10 w-1/3" />
                   </div>
                   <div className="space-y-2">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-10 w-full" />
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
                 <CardTitle>Personal Information</CardTitle>
                 <CardDescription>Keep your details up to date.</CardDescription>
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
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            type="number" // Use number input but handle string state
                            value={age}
                            onChange={(e) => setAge(e.target.value)} // Keep as string in state initially
                            placeholder="Your Age"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="contactInfo">Contact Info</Label>
                        <Input
                            id="contactInfo"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="Phone number or other contact"
                            disabled={isLoading}
                        />
                    </div>
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
