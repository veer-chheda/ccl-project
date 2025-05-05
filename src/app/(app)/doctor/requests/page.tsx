tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Check, X } from "lucide-react"; // Import icons
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore"; // Import doc and updateDoc
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: any;
}
export default function DoctorRequestsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); // Initialize useToast


  const getInitials = (name?: string | null): string => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "appointments"),
 where("doctorId", "==", user.uid),
 orderBy("createdAt", "desc") // Order by creation date
      );
      const querySnapshot = await getDocs(q);
      const appointmentsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Appointment)
      );
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Add user to dependency array

  const handleApprove = async (appointmentId: string) => {
    setIsLoading(true);
    const appointmentRef = doc(db, "appointments", appointmentId);
    try {
      // Update the status of the existing document
      await updateDoc(appointmentRef, {
 status: "confirmed",
      });
      // Update UI state
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'confirmed' } : apt));
      toast({ title: "Approved", description: "Appointment confirmed." });
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast({ title: "Error", description: "Could not approve the appointment.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (appointmentId: string) => {
    setIsLoading(true);
    const appointmentRef = doc(db, "appointments", appointmentId);
    try {
      // Update the status of the existing document
      await updateDoc(appointmentRef, { status: "confirmed"
      });
      // Update UI state
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'rejected' } : apt));
      toast({ title: "Rejected", description: "Appointment rejected.", variant: "destructive" });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast({ title: "Error", description: "Could not reject the appointment.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>

 <Card>
          <CardHeader>
            <CardTitle>Appointment List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : appointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://picsum.photos/seed/${appointment.doctorId}/100/100`} alt={appointment.doctorName} />
                            <AvatarFallback>{getInitials(appointment.doctorName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{appointment.doctorName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
 {/* Conditionally render buttons based on status */}
 {appointment.status === 'pending' && (
 <div className="flex gap-2 mt-2">
 <Button size="sm" variant="outline" onClick={() => handleApprove(appointment.id)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
 <Check className="h-4 w-4 mr-1" /> Approve
 </Button>
 <Button size="sm" variant="outline" onClick={() => handleReject(appointment.id)} className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
 <X className="h-4 w-4 mr-1" /> Reject
 </Button>
 {/* Reschedule functionality would go here if needed */}
 </div>
 )}

                      </TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>{appointment.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground p-8">
                No appointments found.
              </div>
            )}
          </CardContent>
        </Card>
 </div>
 </AppLayout>
  );
}