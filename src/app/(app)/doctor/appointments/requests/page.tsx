
"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { db, auth } from '@/lib/firebase'; // Import db and auth
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Interface for appointment request data
interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName?: string; // Optional, maybe fetched separately or stored redundantly
  // Using string for requested time from previous code, consider structured date/time
  requestedTime: string; // Example: "YYYY-MM-DD HH:MM AM/PM" or Timestamp
  reason: string;
  status: 'pending' | 'confirmed' | 'canceled'; // Only pending should show here
  createdAt: Timestamp; // Track creation time
}

export default function DoctorRequestsPage() {
  const { user } = useAuth(); // Get current doctor user
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useCallback ensures fetchRequests doesn't change on every render unless user changes
  const fetchRequests = useCallback(async (currentUserId: string) => {
    setIsLoading(true);
    try {
      // Query the 'requests' collection (or 'appointments' if using one collection)
      const q = query(
        collection(db, "appointments"),
        where("doctorId", "==", currentUserId),
        where("status", "==", "pending"),
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentRequest[];
      setPendingRequests(requestsData);
    } catch (error) {
      console.error("Error fetching appointment requests:", error);
      toast({ title: "Error", description: "Could not load requests. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Dependency array for useCallback

  useEffect(() => {
    if (user) {
      fetchRequests(user.uid);
    } else {
      setIsLoading(false);
      setPendingRequests([]);
    }
  }, [user, fetchRequests]); // useEffect depends on user and the stable fetchRequests function

   // Function to format Firestore Timestamp or date string
   const formatRequestTime = (timeInput: string | Timestamp): string => {
     if (!timeInput) return 'N/A';
     try {
       // Assuming requestedTime might be stored as a simple string "YYYY-MM-DD HH:MM AM/PM" for now
       if (typeof timeInput === 'string') {
         // Attempt to parse and format if it's a recognizable date string
         const date = new Date(timeInput);
         if (!isNaN(date.getTime())) {
            return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
         }
         return timeInput; // Return original string if parsing fails
       } else if (timeInput instanceof Timestamp) {
         return timeInput.toDate().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
       }
       return 'Invalid Time';
     } catch (e) {
       return 'Invalid Time';
     }
   };


    const handleApprove = async (request: AppointmentRequest) => {
        // 1. Update the request status to 'confirmed' (or delete the request)
        setIsLoading(true); // Indicate processing
        const requestDocRef = doc(db, "appointments", request.id);

        try {
            await updateDoc(requestDocRef, {
                status: "confirmed",
            });

            // Update UI state
            setPendingRequests(prev => prev.filter(req => req.id !== request.id));
            toast({ title: "Approved", description: `Appointment confirmed for ${request.patientName}.` });

        } catch (error) {
            console.error("Error approving request:", error);
            toast({ title: "Error", description: "Could not approve request. Please try again.", variant: "destructive" });
        } finally {
             setIsLoading(false);
        }
    };

    const handleReject = async (request: AppointmentRequest) => {
        setIsLoading(true);
        const requestDocRef = doc(db, "appointments", request.id);
        try {
            await updateDoc(requestDocRef, {
                status: "rejected",
            });
            // Update UI state
            setPendingRequests(prev => prev.filter(req => req.id !== request.id));
            toast({ title: "Rejected", description: "Appointment request rejected.", variant: "destructive" });
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast({ title: "Error", description: "Could not reject request. Please try again.", variant: "destructive" });
        } finally {
             setIsLoading(false);
        }
    };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Appointment Requests</h1>
        <Card>
            <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Review and manage incoming appointment requests from patients.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    // Skeleton Loader for List Items
                    <ul className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <li key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-md bg-card gap-4">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0">
                                    <Skeleton className="h-9 w-24" />
                                    <Skeleton className="h-9 w-24" />
                                    <Skeleton className="h-9 w-28" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : pendingRequests.length > 0 ? (
                  <ul className="space-y-4">
                    {pendingRequests.map((req) => (
                      <li key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-md bg-card gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{req.patientName}</p>
                          <p className="text-sm text-muted-foreground">Requested: {formatRequestTime(req.requestedTime)}</p>
                          {req.reason && <p className="text-sm mt-1">Reason: <span className="italic text-muted-foreground">{req.reason}</span></p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0">
                           <Button size="sm" variant="outline" onClick={() => handleApprove(req)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" disabled={isLoading}>
                              <Check className="h-4 w-4 mr-1" /> Approve
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => handleReject(req)} className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" disabled={isLoading}>
                               <X className="h-4 w-4 mr-1" /> Reject
                           </Button>
                         </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No pending appointment requests.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}

    