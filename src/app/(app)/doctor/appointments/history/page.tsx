
"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { db, auth } from '@/lib/firebase'; // Import db and auth
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Interface matching Firestore data structure for history/appointments
interface AppointmentHistory {
 id: string;
 patientId: string;
 patientName: string; // Assuming this is stored
 // Store date and time appropriately. Using string for simplicity from previous code,
 // but storing as Timestamp in Firestore is generally better for querying/sorting.
 date: string | Timestamp; // Allow both for transition/flexibility
 time: string;
 status: 'completed' | 'canceled' | 'confirmed' | 'pending'; // Define possible statuses
 reason?: string; // Optional
 doctorId: string;
 // Add other fields if necessary
}

export default function DoctorHistoryPage() {
    const { user } = useAuth(); // Get current doctor user
    const [searchTerm, setSearchTerm] = useState("");
    const [history, setHistory] = useState<AppointmentHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Moved outside useEffect for reusability if needed
    const fetchHistory = async (currentUserId: string, currentSearchTerm: string) => {
        setIsLoading(true);
        try {
             // Query 'appointments' collection (or wherever appointments are stored)
             // Filter by doctorId and status (completed or canceled)
            let q = query(
                collection(db, "appointments"), // Adjust collection name if needed
                where("doctorId", "==", currentUserId),
                where("status", "in", ["completed", "canceled"]), // Filter for completed/canceled
                 orderBy("date", "desc"), // Order by date descending
                 orderBy("time", "desc") // Secondary sort by time maybe? Depends on how date/time stored
            );

             // Apply patient name search if searchTerm exists
             // Note: Firestore full-text search is limited.
             // This performs a basic prefix search (case-sensitive).
             // For robust search, consider dedicated services (Algolia, Typesense) or different data modeling.
            if (currentSearchTerm) {
                q = query(
                    collection(db, "appointments"),
                    where("doctorId", "==", currentUserId),
                    where("status", "in", ["completed", "canceled"]),
                     // Filter by patient name (prefix search)
                     where("patientName", ">=", currentSearchTerm),
                     where("patientName", "<=", currentSearchTerm + '\uf8ff'),
                    orderBy("patientName"), // Order by name first for search consistency
                    orderBy("date", "desc"),
                    orderBy("time", "desc")
                );
            }


            const querySnapshot = await getDocs(q);
            const historyData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AppointmentHistory[];
            setHistory(historyData);
        } catch (error) {
            console.error("Error fetching appointment history:", error);
            // Optionally show a toast message
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchHistory(user.uid, searchTerm);
        } else {
             // Handle case where user is not logged in (though routing should prevent this)
            setIsLoading(false);
            setHistory([]);
        }
        // Dependency array includes user and searchTerm to refetch when they change
    }, [user, searchTerm]);

     const getStatusColorClass = (status: string): string => {
        switch (status) {
             case 'completed': return 'bg-green-100 text-green-800 border-green-300';
             case 'canceled': return 'bg-red-100 text-red-800 border-red-300';
             // Add other statuses if they can appear here, though query filters them
             default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    }

     const formatDate = (dateInput: string | Timestamp): string => {
       if (!dateInput) return 'N/A';
       try {
         const date = dateInput instanceof Timestamp ? dateInput.toDate() : new Date(dateInput);
         return date.toLocaleDateString(); // Adjust format as needed
       } catch (e) {
         return 'Invalid Date';
       }
     };


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Appointment History</h1>
        <Card>
            <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
                <CardDescription>Review completed and canceled appointments.</CardDescription>
                <div className="relative mt-2 pt-2">
                  <Search className="absolute left-2.5 top-4.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name..."
                    className="pl-8 w-full md:w-1/2 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    // Skeleton Loader for Table
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : history.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                                {/* <TableHead>Actions</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((apt) => (
                                <TableRow key={apt.id}>
                                    <TableCell className="font-medium">{apt.patientName || 'N/A'}</TableCell>
                                     <TableCell>{formatDate(apt.date)}</TableCell>
                                    <TableCell>{apt.time || 'N/A'}</TableCell>
                                    <TableCell className="text-muted-foreground">{apt.reason || '-'}</TableCell>
                                    <TableCell className="text-right">
                                         <Badge className={`capitalize ${getStatusColorClass(apt.status)}`}>
                                            {apt.status}
                                        </Badge>
                                    </TableCell>
                                     {/* <TableCell>
                                         <Button variant="ghost" size="sm">View Details</Button>
                                     </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                      {searchTerm ? `No matching appointment history found for "${searchTerm}".` : "No appointment history found."}
                  </p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}



    