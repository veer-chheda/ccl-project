"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function DoctorDashboardPage() {
  // Fetch data specific to doctor dashboard here later (e.g., upcoming appointments, unread messages)

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div> {/* Replace with actual data */}
              <p className="text-xs text-muted-foreground">
                +2 today
              </p>
               <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                  <Link href="/doctor/appointments/schedule">View Schedule</Link>
               </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div> {/* Replace with actual data */}
              <p className="text-xs text-muted-foreground">
                Needs review
              </p>
               <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                  <Link href="/doctor/appointments/requests">Manage Requests</Link>
               </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div> {/* Replace with actual data */}
              <p className="text-xs text-muted-foreground">
                From 4 patients
              </p>
               <Button variant="link" className="px-0 h-auto mt-2 text-primary" asChild>
                  <Link href="/doctor/messages">Go to Messages</Link>
               </Button>
            </CardContent>
          </Card>
        </div>

         {/* Placeholder for Recent Activity or other sections */}
         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No recent activity to display yet.</p>
                {/* List recent activities here */}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
