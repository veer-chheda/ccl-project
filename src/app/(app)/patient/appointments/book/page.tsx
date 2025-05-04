"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming Select component exists
import { Search, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker"; // Import DateRange type if needed for range selection, otherwise just Date for single

// Mock data - replace with Firestore fetching
const mockDoctors = [
  { id: 'doc1', name: 'Dr. Emily Carter', specialization: 'Cardiologist', avatar: 'https://picsum.photos/seed/doc1/100/100', dataAiHint: 'doctor portrait' },
  { id: 'doc2', name: 'Dr. John Smith', specialization: 'General Practitioner', avatar: 'https://picsum.photos/seed/doc2/100/100', dataAiHint: 'doctor smiling' },
  { id: 'doc3', name: 'Dr. Sarah Lee', specialization: 'Pediatrician', avatar: 'https://picsum.photos/seed/doc3/100/100', dataAiHint: 'female doctor' },
  { id: 'doc4', name: 'Dr. Michael Chen', specialization: 'Dermatologist', avatar: 'https://picsum.photos/seed/doc4/100/100', dataAiHint: 'male doctor asian' },
];

// Mock available slots - replace with actual availability logic
const mockAvailableSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];

export default function BookAppointmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
   const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
   const [reason, setReason] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { toast } = useToast();

   const filteredDoctors = mockDoctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const handleRequestAppointment = () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) {
             toast({ title: "Missing Information", description: "Please select a doctor, date, and time.", variant: "destructive" });
             return;
        }
        setIsSubmitting(true);
        console.log("Requesting appointment:", {
            doctorId: selectedDoctor.id,
            date: selectedDate.toLocaleDateString(),
            time: selectedTime,
            reason: reason
        });
         // TODO: Implement Firestore logic to create an appointment request document
         // Example: addDoc(collection(db, 'appointments'), { doctorId: selectedDoctor.id, patientId: user.uid, requestedDate: selectedDate, requestedTime: selectedTime, reason, status: 'pending', createdAt: serverTimestamp() });

         // Simulate API call
        setTimeout(() => {
            toast({ title: "Request Sent", description: `Your appointment request for ${selectedDate.toLocaleDateString()} at ${selectedTime} with ${selectedDoctor.name} has been sent.` });
            setIsSubmitting(false);
            // Reset form
            setSelectedDoctor(null);
            setSelectedDate(undefined);
            setSelectedTime(undefined);
            setReason("");
            setSearchTerm("");
        }, 1500);
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
             {filteredDoctors.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {filteredDoctors.map((doctor) => (
                   <Card key={doctor.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedDoctor(doctor)}>
                     <CardContent className="flex items-center gap-4 p-4">
                       <Avatar className="h-16 w-16">
                         <AvatarImage src={doctor.avatar} alt={doctor.name} data-ai-hint={doctor.dataAiHint} />
                         <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-semibold">{doctor.name}</p>                         <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
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
                     <CardDescription>Select a date and time, and provide a reason for your visit.</CardDescription>
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
                                        {mockAvailableSlots.map(slot => (
                                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                        ))}
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
