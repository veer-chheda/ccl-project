"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye, PlusCircle } from "lucide-react"; // Added Eye for view, PlusCircle for add note
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from 'next/navigation'; // Use useParams hook

// Mock data - replace with Firestore fetching for specific patientId
const mockPatientData = {
    pat1: {
        name: 'Alice Smith',
        records: [
            { id: 'rec1', name: 'Blood Test Results - July 2024.pdf', uploadDate: '2024-07-16', type: 'Lab Result', url: '#' },
            { id: 'rec3', name: 'Consultation Notes - Dr. Smith.txt', uploadDate: '2024-07-15', type: 'Doctor Note', url: '#' },
        ]
    },
    pat2: {
        name: 'Bob Johnson',
        records: [
             { id: 'rec2', name: 'X-Ray Report - June 2024.docx', uploadDate: '2024-06-22', type: 'Imaging Report', url: '#' },
        ]
    },
    // Add other patients as needed...
};

type RecordType = {
    id: string;
    name: string;
    uploadDate: string;
    type: string;
    url: string;
};

type PatientDataType = {
    name: string;
    records: RecordType[];
} | null;


export default function DoctorViewPatientRecordsPage() {
    const params = useParams();
    const patientId = params.patientId as string; // Get patientId from URL
    const [patientData, setPatientData] = useState<PatientDataType>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        // TODO: Fetch patient info and records from Firestore using patientId
        // Example:
        // const fetchPatientData = async () => {
        //    try {
        //      const patientDocRef = doc(db, 'users', patientId);
        //      const patientDoc = await getDoc(patientDocRef);
        //      if (!patientDoc.exists() || patientDoc.data()?.role !== 'patient') {
        //         throw new Error("Patient not found");
        //      }
        //      const recordsColRef = collection(db, 'users', patientId, 'records');
        //      const recordsSnapshot = await getDocs(recordsColRef);
        //      const records = recordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecordType[];
        //      setPatientData({ name: patientDoc.data()?.name, records });
        //    } catch (error) {
        //       console.error("Error fetching patient data:", error);
        //       toast({ title: "Error", description: "Could not load patient records.", variant: "destructive" });
        //    } finally {
        //       setIsLoading(false);
        //    }
        // }
        // fetchPatientData();

        // Simulate fetching with mock data
        const data = (mockPatientData as any)[patientId] || null;
        setTimeout(() => {
            if (data) {
                setPatientData(data);
            } else {
                 toast({ title: "Error", description: "Patient records not found.", variant: "destructive" });
            }
            setIsLoading(false);
        }, 1000); // Simulate network delay

    }, [patientId, toast]);

    const handleDownload = (url: string, name: string) => {
        console.log("Downloading:", name, url);
         if (url === '#') {
             toast({ title: "Download Unavailable", description: "Mock download URL.", variant:"destructive" });
             return;
         }
         const link = document.createElement('a');
         link.href = url;
         link.download = name;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
    };

     const handleView = (url: string, name: string) => {
        console.log("Viewing:", name, url);
        if (url === '#') {
             toast({ title: "View Unavailable", description: "Mock view URL.", variant:"destructive" });
             return;
         }
        window.open(url, '_blank');
    };

     const handleAddNote = () => {
         console.log("Adding note for patient:", patientId);
         // TODO: Open a modal or navigate to add a new consultation note (upload a file or create text note)
         toast({ title: "Add Note", description: "Functionality to add notes TBD." });
     };


    if (isLoading) {
        return (
            <AppLayout>
                 <div className="space-y-4">
                     <Skeleton className="h-8 w-1/3" /> {/* Title Skeleton */}
                     <Card>
                         <CardHeader>
                             <Skeleton className="h-6 w-1/4" /> {/* Card Title Skeleton */}
                             <Skeleton className="h-4 w-1/2 mt-1" /> {/* Card Desc Skeleton */}
                         </CardHeader>
                         <CardContent>
                             {/* Table Skeleton */}
                             <div className="space-y-2">
                                 <Skeleton className="h-10 w-full" />
                                 <Skeleton className="h-10 w-full" />
                                 <Skeleton className="h-10 w-full" />
                             </div>
                         </CardContent>
                     </Card>
                 </div>
            </AppLayout>
        );
    }

    if (!patientData) {
        return (
             <AppLayout>
                <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
                 <Card>
                     <CardContent className="pt-6">
                         <p className="text-center text-muted-foreground">Could not load records for this patient.</p>
                     </CardContent>
                 </Card>
             </AppLayout>
        );
    }


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Medical Records for {patientData.name}</h1>

         <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                 <div>
                     <CardTitle>Uploaded Documents</CardTitle>
                     <CardDescription>View documents uploaded by the patient or added by medical staff.</CardDescription>
                 </div>
                 <Button onClick={handleAddNote} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Note/Record
                </Button>
            </CardHeader>
            <CardContent>
                {patientData.records.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Uploaded Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patientData.records.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="truncate">{record.name}</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{record.type}</TableCell>
                                    <TableCell>{new Date(record.uploadDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                         <Button variant="ghost" size="icon" onClick={() => handleView(record.url, record.name)} title="View">
                                            <Eye className="h-4 w-4" />
                                         </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleDownload(record.url, record.name)} title="Download">
                                            <Download className="h-4 w-4" />
                                         </Button>
                                          {/* Optionally add delete for doctor-added notes? */}
                                          {/* <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(record.id, record.name)} title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                         </Button> */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No records found for this patient.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
