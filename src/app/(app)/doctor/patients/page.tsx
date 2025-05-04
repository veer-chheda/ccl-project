"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";

// Mock data - replace with Firestore fetching (query appointments where doctorId matches, then get unique patientIds)
const mockPatients = [
  { id: 'pat1', name: 'Alice Smith', lastAppointment: '2024-07-15', nextAppointment: '2024-08-15', avatar: 'https://picsum.photos/seed/alice/100/100', dataAiHint: 'female patient' },
  { id: 'pat2', name: 'Bob Johnson', lastAppointment: '2024-07-14', nextAppointment: null, avatar: 'https://picsum.photos/seed/bob/100/100', dataAiHint: 'male patient' },
  { id: 'pat3', name: 'Charlie Brown', lastAppointment: '2023-12-01', nextAppointment: '2024-07-30', avatar: 'https://picsum.photos/seed/charlie/100/100', dataAiHint: 'young man portrait' },
  { id: 'pat4', name: 'Diana Prince', lastAppointment: '2024-07-13', nextAppointment: null, avatar: 'https://picsum.photos/seed/diana/100/100', dataAiHint: 'woman looking serious' },
];

export default function DoctorPatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPatients = mockPatients.filter(pat =>
        pat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name?: string | null): string => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
        <Card>
            <CardHeader>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>View and manage your patients.</CardDescription>
                 <div className="relative mt-2 pt-2">
                  <Search className="absolute left-2.5 top-4.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-8 w-full md:w-1/2 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
            </CardHeader>
            <CardContent>
                 {filteredPatients.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Last Visit</TableHead>
                                <TableHead>Next Visit</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPatients.map((pat) => (
                                <TableRow key={pat.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={pat.avatar} alt={pat.name} data-ai-hint={pat.dataAiHint} />
                                                <AvatarFallback>{getInitials(pat.name)}</AvatarFallback>
                                            </Avatar>
                                            <span>{pat.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{pat.lastAppointment ? new Date(pat.lastAppointment).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>{pat.nextAppointment ? new Date(pat.nextAppointment).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                         <Button variant="ghost" size="icon" asChild title="View Records">
                                             {/* Link needs to point to a patient-specific record view */}
                                            <Link href={`/doctor/records/${pat.id}`}>
                                                <FileText className="h-4 w-4" />
                                            </Link>
                                         </Button>
                                         <Button variant="ghost" size="icon" asChild title="Open Chat">
                                             {/* Link needs to point to messages, potentially pre-selecting the conversation */}
                                            <Link href={`/doctor/messages?patient=${pat.id}`}>
                                                <MessageSquare className="h-4 w-4" />
                                            </Link>
                                         </Button>
                                          {/* Add other actions like 'View Profile' */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No matching patients found.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
