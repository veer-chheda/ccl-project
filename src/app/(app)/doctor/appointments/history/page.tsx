"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Calendar, Clock, User, Search } from "lucide-react";

// Mock data - replace with Firestore fetching
const mockHistory = [
  { id: 'hist1', patientName: 'Alice Smith', date: '2024-07-15', time: '10:00 AM', status: 'completed', reason: 'Check-up' },
  { id: 'hist2', patientName: 'Bob Johnson', date: '2024-07-14', time: '02:30 PM', status: 'completed', reason: 'Follow-up' },
  { id: 'hist3', patientName: 'Charlie Brown', date: '2024-07-14', time: '11:00 AM', status: 'canceled', reason: 'Patient no-show' },
  { id: 'hist4', patientName: 'Diana Prince', date: '2024-07-13', time: '09:00 AM', status: 'completed', reason: 'New consultation' },
  { id: 'hist5', patientName: 'Alice Smith', date: '2024-06-10', time: '10:00 AM', status: 'completed', reason: 'Check-up' },
];

export default function DoctorHistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'completed': return 'default';
            case 'canceled': return 'destructive';
            default: return 'outline'; // Should ideally not happen in history view
        }
    };

     const getStatusColorClass = (status: string): string => {
        switch (status) {
             case 'completed': return 'bg-green-100 text-green-800 border-green-300';
             case 'canceled': return 'bg-red-100 text-red-800 border-red-300';
             default: return '';
        }
    }

    const filteredHistory = mockHistory.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date desc

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
                {filteredHistory.length > 0 ? (
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
                            {filteredHistory.map((apt) => (
                                <TableRow key={apt.id}>
                                    <TableCell className="font-medium">{apt.patientName}</TableCell>
                                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{apt.time}</TableCell>
                                    <TableCell className="text-muted-foreground">{apt.reason}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getStatusVariant(apt.status)} className={`capitalize ${getStatusColorClass(apt.status)}`}>
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
                  <p className="text-muted-foreground text-center py-8">No matching appointment history found.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}

