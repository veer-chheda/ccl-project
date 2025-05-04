"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";

// Mock data - replace with Firestore fetching
const mockRequests = [
  { id: 'req1', patientName: 'Eve Adams', requestedTime: 'Tomorrow 03:00 PM', reason: 'Follow-up check', status: 'pending' },
  { id: 'req2', patientName: 'Frank Miller', requestedTime: 'Next Tuesday 10:00 AM', reason: 'New patient consultation', status: 'pending' },
  { id: 'req3', patientName: 'Grace Hopper', requestedTime: 'July 30th 01:00 PM', reason: 'Prescription refill', status: 'pending' },
];

export default function DoctorRequestsPage() {

    // Placeholder functions for actions - implement with Firestore updates
    const handleApprove = (requestId: string) => {
        console.log("Approve request:", requestId);
        // Update Firestore status to 'confirmed'
    };

    const handleReject = (requestId: string) => {
        console.log("Reject request:", requestId);
        // Update Firestore status to 'canceled' or remove request
    };

     const handleReschedule = (requestId: string) => {
        console.log("Reschedule request:", requestId);
        // Open a modal or navigate to reschedule interface
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
                {mockRequests.length > 0 ? (
                  <ul className="space-y-4">
                    {mockRequests.filter(req => req.status === 'pending').map((req) => (
                      <li key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-md bg-card gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{req.patientName}</p>
                          <p className="text-sm text-muted-foreground">Requested: {req.requestedTime}</p>
                           {req.reason && <p className="text-sm mt-1">Reason: <span className="italic text-muted-foreground">{req.reason}</span></p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0">
                           <Button size="sm" variant="outline" onClick={() => handleApprove(req.id)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                              <Check className="h-4 w-4 mr-1" /> Approve
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                               <X className="h-4 w-4 mr-1" /> Reject
                           </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleReschedule(req.id)}>
                                <Clock className="h-4 w-4 mr-1" /> Reschedule
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
