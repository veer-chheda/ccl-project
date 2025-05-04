"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button
import { Calendar, Clock, UserMd /* Assuming custom icon or use BriefcaseMedical */ } from "lucide-react"; // Use appropriate icons

// Mock data - replace with Firestore fetching
const mockHistory = [
  { id: 'hist1', doctorName: 'Dr. John Smith', date: '2024-07-15', time: '10:00 AM', status: 'completed', notes: 'Routine check-up, all good.' },
  { id: 'hist2', doctorName: 'Dr. Emily Carter', date: '2024-06-20', time: '02:30 PM', status: 'completed', notes: 'Discussed test results.' },
  { id: 'hist3', doctorName: 'Dr. Sarah Lee', date: '2024-05-10', time: '11:00 AM', status: 'canceled', notes: 'Patient canceled.' },
   { id: 'hist4', doctorName: 'Dr. John Smith', date: '2024-07-26', time: '09:00 AM', status: 'confirmed', notes: '' }, // Upcoming confirmed
    { id: 'hist5', doctorName: 'Dr. Michael Chen', date: '2024-07-28', time: '01:00 PM', status: 'pending', notes: '' }, // Pending request
];

export default function PatientHistoryPage() {

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'completed': return 'default';
            case 'confirmed': return 'default'; // Or maybe a specific color like blue/green?
            case 'pending': return 'secondary'; // Yellowish/Orange?
            case 'canceled': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusColorClass = (status: string): string => {
        switch (status) {
             case 'completed': return 'bg-green-100 text-green-800 border-green-300'; // More distinct completed
             case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300'; // Blue for confirmed
             case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Yellow for pending
             case 'canceled': return 'bg-red-100 text-red-800 border-red-300'; // Red for canceled
             default: return '';
        }
    }


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <Card>
            <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>View your past, upcoming, and pending appointments.</CardDescription>
            </CardHeader>
            <CardContent>
                {mockHistory.length > 0 ? (
                  <ul className="space-y-4">
                    {mockHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date desc
                        .map((apt) => (
                      <li key={apt.id} className="p-4 border rounded-md bg-card hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                           <div className="flex items-center gap-2 mb-2 sm:mb-0">
                               {/* Replace UserMd with a real icon if available or use BriefcaseMedical */}
                               <BriefcaseMedical className="h-5 w-5 text-primary" />
                               <p className="font-semibold">{apt.doctorName}</p>
                           </div>
                            <Badge
                                variant={getStatusVariant(apt.status)}
                                className={`capitalize ${getStatusColorClass(apt.status)}`}
                            >
                                {apt.status}
                            </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1.5"/>
                                {new Date(apt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                           <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5"/>
                                {apt.time}
                           </div>
                        </div>
                         {apt.notes && apt.status === 'completed' && (
                             <p className="text-sm mt-2 pt-2 border-t border-dashed">Notes: <span className="italic text-muted-foreground">{apt.notes}</span></p>
                         )}
                         {/* Add Cancel/Reschedule buttons for 'pending' or 'confirmed' appointments */}
                         {(apt.status === 'pending' || apt.status === 'confirmed') && (
                             <div className="mt-3 flex gap-2">
                                 <Button size="sm" variant="outline">Reschedule</Button>
                                 <Button size="sm" variant="destructive" className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200">Cancel</Button>
                             </div>
                         )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-8">You have no appointment history.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}


// Custom Icon Placeholder (if needed)
const BriefcaseMedical = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 11v4" />
        <path d="M14 13h-4" />
        <path d="M3 6V5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1" />
        <path d="M5 6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4" />
        <path d="M9 6V4" />
        <path d="M15 6V4" />
    </svg>
);
