
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { db, auth } from '@/lib/firebase'; // Import db and auth
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Interface for Doctor data fetched from Firestore
interface Doctor {
  id: string; // Firestore document ID
  name: string;
  specialization: string;
  avatar?: string; // Optional avatar URL
  // Add other relevant fields if needed, like clinicAddress, availableHours (might need processing)
}

// Mock available slots - replace with actual availability logic based on selected doctor/date
const mockAvailableSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];

export default function BookAppointmentPage() {
  const { user } = useAuth(); // Get current user
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch doctors from Firestore on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        const doctorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({ title: "Error", description: "Could not load doctors. Please try again later.", variant: "destructive" });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [toast]); // Added toast to dependency array

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const getInitials = (name?: string | null): string => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

   const handleRequestAppointment = async () => { // Make async for potential Firestore operations
        if (!user) {
             toast({ title: "Not Logged In", description: "You must be logged in to book an appointment.", variant: "destructive" });
             return;
        }
        if (!selectedDoctor || !selectedDate || !selectedTime) {
             toast({ title: "Missing Information", description: "Please select a doctor, date, and time.", variant: "destructive" });
             return;
        }
        setIsSubmitting(true);

         // Format date and time for storage/display consistency if needed
        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const requestedDateTime = `${formattedDate} ${selectedTime}`; // Combine for sorting/querying if needed

        console.log("Requesting appointment:", {
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name, // Store doctor name for easy display
            patientId: user.uid,
            patientName: user.displayName || "Patient", // Get patient name from auth profile
            requestedTime: requestedDateTime, // Store combined or separate date/time
            reason: reason,
            status: 'pending' // Initial status
        });

         try {
             // TODO: Implement Firestore logic to create an appointment request document in a 'requests' or 'appointments' collection
             // Example:
             // const docRef = await addDoc(collection(db, 'requests'), {
             //    doctorId: selectedDoctor.id,
             //    doctorName: selectedDoctor.name,
             //    patientId: user.uid,
             //    patientName: user.displayName || "Patient",
             //    requestedDate: formattedDate, // Store date separately?
             //    requestedTime: selectedTime,   // Store time separately?
             //    reason: reason,
             //    status: 'pending',
             //    createdAt: serverTimestamp() // Track request time
             // });
             // console.log("Request document written with ID: ", docRef.id);


             // Simulate API call for now
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast({ title: "Request Sent", description: `Your appointment request for ${selectedDate.toLocaleDateString()} at ${selectedTime} with ${selectedDoctor.name} has been sent.` });

            // Reset form
            setSelectedDoctor(null);
            setSelectedDate(undefined);
            setSelectedTime(undefined);
            setReason("");
            setSearchTerm("");
         } catch (error) {
             console.error("Error sending appointment request:", error);
             toast({ title: "Request Failed", description: "Could not send appointment request. Please try again.", variant: "destructive" });
         } finally {
            setIsSubmitting(false);
         }
   };


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>

        <Card>
          <CardHeader>
            <CardTitle>Find a Doctor</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialization..."
                className="pl-8 w-full md:w-1/2 lg:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
             {isLoadingDoctors ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {/* Skeleton Loader */}
                     {[...Array(3)].map((_, index) => (
                        <Card key={index}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                            </CardContent>
                        </Card>
                     ))}
                 </div>
             ) : filteredDoctors.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {filteredDoctors.map((doctor) => (
                   <Card key={doctor.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedDoctor(doctor)}>
                     <CardContent className="flex items-center gap-4 p-4">
                       <Avatar className="h-16 w-16">
                         {/* Use a placeholder image logic or actual avatar URL if available */}
                         <AvatarImage src={doctor.avatar || `https://picsum.photos/seed/${doctor.id}/100/100`} alt={doctor.name} data-ai-hint={`${doctor.specialization} doctor`} />
                         <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-semibold">{doctor.name}</p>
                         <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             ) : (
                 <p className="text-muted-foreground text-center py-8">No doctors found matching your search.</p>
             )}

          </CardContent>
        </Card>

         {selectedDoctor && (
             <Card>
                 <CardHeader>
                     <CardTitle>Request Appointment with {selectedDoctor.name}</CardTitle>
                     <CardDescription>Select a date and time, and optionally provide a reason for your visit.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <Label>Select Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal"
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? selectedDate.toLocaleDateString() : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                                    />
                                </PopoverContent>
                             </Popover>
                        </div>
                         {selectedDate && (
                             <div>
                                <Label>Select Time</Label>
                                <Select onValueChange={setSelectedTime} value={selectedTime}>
                                     <SelectTrigger className="w-full">
                                        <Clock className="mr-2 h-4 w-4 inline" />
                                        <SelectValue placeholder="Select an available time" />
                                     </SelectTrigger>
                                     <SelectContent>
                                         {/* TODO: Fetch actual available slots for the selected doctor and date */}
                                        {mockAvailableSlots.map(slot => (
                                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                        ))}
                                         {/* Example if no slots: <SelectItem value="none" disabled>No slots available</SelectItem> */}
                                     </SelectContent>
                                 </Select>
                             </div>
                         )}
                     </div>
                     <div>
                        <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                        <Textarea
                             id="reason"
                             placeholder="Briefly describe the reason for your appointment..."
                             value={reason}
                             onChange={(e) => setReason(e.target.value)}
                        />
                     </div>
                     <Button onClick={handleRequestAppointment} disabled={!selectedDate || !selectedTime || isSubmitting}>
                         {isSubmitting ? "Sending Request..." : "Request Appointment"}
                     </Button>
                 </CardContent>
             </Card>
         )}
      </div>
    </AppLayout>
  );
}

    