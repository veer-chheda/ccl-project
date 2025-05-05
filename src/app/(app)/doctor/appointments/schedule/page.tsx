
"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { db, auth } from '@/lib/firebase'; // Import db and auth
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; // Import Firestore functions
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { startOfDay, endOfDay, isEqual } from 'date-fns'; // Import date-fns helpers

// Interface for confirmed appointments from Firestore
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: Timestamp; // Use Firestore Timestamp for date
  time: string; // Store time as a string (e.g., "10:00 AM")
  status: 'confirmed' | 'pending' | 'completed' | 'canceled'; // Allow other statuses if needed, though filtering for 'confirmed'
  reason?: string;
  // Add other relevant fields
}

export default function DoctorSchedulePage() {
    const { user } = useAuth(); // Get current doctor user
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Default to today
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch appointments for the selected date
    const fetchAppointments = useCallback(async (currentUserId: string, date: Date) => {
        setIsLoading(true);
        try {
            const start = Timestamp.fromDate(startOfDay(date));
            const end = Timestamp.fromDate(endOfDay(date));

            const q = query(
                collection(db, "appointments"),
                where("doctorId", "==", currentUserId),
                where("status", "==", "confirmed"), // Fetch only confirmed appointments
                where("date", ">=", start),
                where("date", "<=", end),
                orderBy("date", "asc"), // Order by date (effectively the timestamp)
                 orderBy("time", "asc") // Consider if time needs a separate numeric field for reliable sorting
            );

            const querySnapshot = await getDocs(q);
            const appointmentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Appointment[];
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            // Handle error, maybe show a toast
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed inside useCallback as it uses args

    useEffect(() => {
        if (user && selectedDate) {
            fetchAppointments(user.uid, selectedDate);
        } else {
             // Clear appointments if no user or date selected
            setAppointments([]);
            setIsLoading(false); // Ensure loading is false if fetch isn't called
        }
    }, [user, selectedDate, fetchAppointments]); // Refetch when user or selectedDate changes

    // Helper function to format Timestamp to time string
    const formatTime = (timestamp: Timestamp): string => {
      if (!timestamp) return 'N/A';
      try {
        // The 'time' field should ideally be used directly if stored as string.
        // If only timestamp is available, format it.
        return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return 'Invalid Time';
      }
    };

     // Helper function to format Timestamp to date string
     const formatDate = (timestamp: Timestamp): string => {
        if (!timestamp) return 'N/A';
        try {
            return timestamp.toDate().toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
     };

     const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'confirmed': return 'default'; // Blue?
            case 'completed': return 'secondary'; // Green?
            case 'pending': return 'outline'; // Yellow?
            case 'canceled': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusColorClass = (status: string): string => {
        switch (status) {
             case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
             case 'completed': return 'bg-green-100 text-green-800 border-green-300';
             case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
             case 'canceled': return 'bg-red-100 text-red-800 border-red-300';
             default: return '';
        }
    }


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    // initialFocus // Can sometimes cause issues, enable if needed
                  />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                 <CardTitle>Appointments for {selectedDate ? selectedDate.toLocaleDateString() : 'Selected Date'}</CardTitle>
                 <CardDescription>View confirmed appointments for the selected date.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    // Skeleton Loader for Appointments List
                    <ul className="space-y-4">
                         {[...Array(4)].map((_, index) => (
                             <li key={index} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                 <div className="space-y-2">
                                     <Skeleton className="h-5 w-32" />
                                     <Skeleton className="h-4 w-20" />
                                 </div>
                                 <Skeleton className="h-6 w-20 rounded-full" />
                             </li>
                         ))}
                    </ul>
                ) : appointments.length > 0 ? (
                  <ul className="space-y-4">
                    {appointments.map((apt) => (
                      <li key={apt.id} className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.time}</p> {/* Display stored time string */}
                           {/* <p className="text-sm text-muted-foreground">Date: {formatDate(apt.date)}</p> */}
                        </div>
                         {/* Badge should reflect the actual status, even though we filtered */}
                         <Badge
                             variant={getStatusVariant(apt.status)}
                             className={`capitalize ${getStatusColorClass(apt.status)}`}
                            >
                            {apt.status}
                         </Badge>
                        {/* TODO: Add actions like 'View Details', 'Mark as Completed', 'Cancel' */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No appointments scheduled for this date.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

    