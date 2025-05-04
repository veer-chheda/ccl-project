"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, MessageSquare, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function PatientDashboardPage() {
  // Fetch data specific to patient dashboard here later (e.g., upcoming appointments, recent messages)

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>

         <Card className="bg-primary/10 border-primary/30">
             <CardHeader>
                 <CardTitle>Find a Doctor</CardTitle>
                 <CardDescription>Search and book appointments with available doctors.</CardDescription>
             </CardHeader>
             <CardContent>
                  {/* Basic search placeholder - implement later */}
                  <div className="flex gap-2">
                      {/* <Input placeholder="Search by name or specialization..." /> */}
                      <Button asChild>
                          <Link href="/patient/appointments/book">
                              <Search className="mr-2 h-4 w-4" /> Browse Doctors
                          </Link>
                      </Button>
                  </div>
             </CardContent>
         </Card>


        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div> {/* Replace with actual data */}
              <p className="text-xs text-muted-foreground">
                Next: Dr. Smith, Tomorrow 10 AM
              </p>
               <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                  <Link href="/patient/appointments/history">View Appointments</Link>
               </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div> {/* Replace with actual data */}
              <p className="text-xs text-muted-foreground">
                From Dr. Lee
              </p>
               <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                  <Link href="/patient/messages">Go to Messages</Link>
               </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Files</div> {/* Replace with actual data */}
              <p className="text-xs text-muted-foreground">
                Last updated: 2 days ago
              </p>
               <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                  <Link href="/patient/records">Manage Records</Link>
               </Button>
            </CardContent>
          </Card>
        </div>

         {/* Placeholder for quick actions or health tips */}
         {/* <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="mr-2">Upload Record</Button>
                <Button variant="outline">Request Refill</Button>
            </CardContent>
         </Card> */}
      </div>
    </AppLayout>
  );
}
