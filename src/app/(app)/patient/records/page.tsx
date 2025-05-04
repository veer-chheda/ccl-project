"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For file input styling if needed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with Firestore/Storage fetching
const mockRecords = [
  { id: 'rec1', name: 'Blood Test Results - July 2024.pdf', uploadDate: '2024-07-16', type: 'Lab Result', url: '#' },
  { id: 'rec2', name: 'X-Ray Report - June 2024.docx', uploadDate: '2024-06-22', type: 'Imaging Report', url: '#' },
  { id: 'rec3', name: 'Consultation Notes - Dr. Smith.txt', uploadDate: '2024-07-15', type: 'Doctor Note', url: '#' },
  { id: 'rec4', name: 'Prescription - Aug 2024.jpg', uploadDate: '2024-08-01', type: 'Prescription', url: '#' },
];

export default function PatientRecordsPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({ title: "No File Selected", description: "Please select a file to upload.", variant: "destructive" });
            return;
        }
        setIsUploading(true);
        console.log("Uploading file:", selectedFile.name);

        // TODO: Implement Firebase Storage upload logic
        // 1. Get a reference: const storageRef = ref(storage, `records/${user.uid}/${selectedFile.name}`);
        // 2. Upload file: const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        // 3. Monitor progress (optional): uploadTask.on('state_changed', ...)
        // 4. On success: getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => { ... });
        // 5. Inside success: Add metadata to Firestore: addDoc(collection(db, 'users', user.uid, 'records'), { name: selectedFile.name, type: selectedFile.type, size: selectedFile.size, url: downloadURL, uploadedAt: serverTimestamp() });

        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({ title: "Upload Successful", description: `${selectedFile.name} has been uploaded.` });
        setIsUploading(false);
        setSelectedFile(null);
         // Clear the file input visually (requires a ref or key change typically)
         const fileInput = document.getElementById('record-upload') as HTMLInputElement;
         if (fileInput) fileInput.value = '';

        // TODO: Refresh the record list after upload
    };

    const handleDelete = (recordId: string, recordName: string) => {
        console.log("Deleting record:", recordId, recordName);
        // TODO: Implement Firestore delete for the record metadata
        // TODO: Implement Firebase Storage delete for the actual file
        toast({ title: "Delete Requested", description: `Deletion for ${recordName} TBD.` });
    };

    const handleDownload = (url: string, name: string) => {
        console.log("Downloading:", name, url);
        // Use the URL to trigger download (e.g., create an anchor tag)
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Medical Records</h1>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Record</CardTitle>
            <CardDescription>Add new medical documents, reports, or images.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Input
                id="record-upload"
                type="file"
                onChange={handleFileChange}
                className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                disabled={isUploading}
            />
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : selectedFile ? `Upload ${selectedFile.name}` : "Upload File"}
            </Button>
          </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Uploaded Records</CardTitle>
                <CardDescription>View and manage your uploaded medical documents.</CardDescription>
            </CardHeader>
            <CardContent>
                {mockRecords.length > 0 ? (
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
                            {mockRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="truncate">{record.name}</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{record.type}</TableCell>
                                    <TableCell>{new Date(record.uploadDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                         <Button variant="ghost" size="icon" onClick={() => handleDownload(record.url, record.name)} title="Download">
                                            <Download className="h-4 w-4" />
                                         </Button>
                                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(record.id, record.name)} title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                         </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">You haven't uploaded any records yet.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
