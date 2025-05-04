"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Assuming you have a Calendar component
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { DateRange } from "react-day-picker"; // Import DateRange type

// Mock data - replace with Firestore fetching
const mockAppointments = [
  { id: 'apt1', patientName: 'Alice Smith', time: '10:00 AM', date: new Date(2024, 6, 25), status: 'confirmed' },
  { id: 'apt2', patientName: 'Bob Johnson', time: '11:30 AM', date: new Date(2024, 6, 25), status: 'confirmed' },
  { id: 'apt3', patientName: 'Charlie Brown', time: '02:00 PM', date: new Date(2024, 6, 26), status: 'pending' },
  { id: 'apt4', patientName: 'Diana Prince', time: '09:00 AM', date: new Date(2024, 6, 27), status: 'confirmed' },
];

export default function DoctorSchedulePage() {
    // Use useState<Date | undefined> for single date selection
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Filter appointments based on the selected date
    const filteredAppointments = mockAppointments.filter(apt =>
      selectedDate && apt.date.toDateString() === selectedDate.toDateString()
    );

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
                    mode="single" // Set mode to single
                    selected={selectedDate}
                    onSelect={setSelectedDate} // Use onSelect for single date
                    className="rounded-md border"
                  />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                 <CardTitle>Appointments for {selectedDate ? selectedDate.toLocaleDateString() : 'Today'}</CardTitle>
                 <CardDescription>View and manage appointments for the selected date.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredAppointments.map((apt) => (
                      <li key={apt.id} className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.time}</p>
                        </div>
                         <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className={apt.status === 'pending' ? 'bg-yellow-500/80 text-yellow-900' : ''}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </Badge>
                        {/* Add actions like 'View Details', 'Reschedule', 'Cancel' */}
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
