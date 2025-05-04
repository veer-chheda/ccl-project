"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock data - replace with Firestore fetching and real-time listeners
const mockConversations = [
  { id: 'conv1', patientName: 'Alice Smith', lastMessage: 'Thanks, Doctor!', timestamp: '10:30 AM', unread: 0, avatar: 'https://picsum.photos/seed/alice/100/100', dataAiHint: 'female patient' },
  { id: 'conv2', patientName: 'Bob Johnson', lastMessage: 'Okay, I will schedule the test.', timestamp: 'Yesterday', unread: 2, avatar: 'https://picsum.photos/seed/bob/100/100', dataAiHint: 'male patient' },
  { id: 'conv3', patientName: 'Charlie Brown', lastMessage: 'Can I get a refill for my prescription?', timestamp: 'Mon', unread: 1, avatar: 'https://picsum.photos/seed/charlie/100/100', dataAiHint: 'young man portrait' },
  { id: 'conv4', patientName: 'Diana Prince', lastMessage: 'See you then.', timestamp: 'Sun', unread: 0, avatar: 'https://picsum.photos/seed/diana/100/100', dataAiHint: 'woman looking serious' },
];

const mockMessages = {
  conv1: [
    { id: 'm1', sender: 'patient', text: 'Hello Dr. Carter, just wanted to confirm my appointment.', time: '09:15 AM' },
    { id: 'm2', sender: 'doctor', text: 'Hi Alice, yes, confirmed for tomorrow at 10 AM.', time: '09:20 AM' },
    { id: 'm3', sender: 'patient', text: 'Thanks, Doctor!', time: '10:30 AM' },
  ],
  conv2: [
     { id: 'm4', sender: 'doctor', text: 'Hi Bob, please schedule the blood test we discussed.', time: 'Yesterday 02:00 PM' },
     { id: 'm5', sender: 'patient', text: 'Okay, I will schedule the test.', time: 'Yesterday 03:15 PM' },
      { id: 'm6', sender: 'patient', text: 'Is fasting required?', time: 'Yesterday 03:16 PM' },
       { id: 'm7', sender: 'patient', text: '?', time: '11:00 AM' },
  ],
  conv3: [
     { id: 'm8', sender: 'patient', text: 'Can I get a refill for my prescription?', time: 'Mon 08:00 AM' },
  ],
   conv4: [], // Empty conversation initially
};


export default function DoctorMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(mockConversations[0]?.id || null); // Select first convo by default
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const selectedMessages = selectedConversationId ? (mockMessages as any)[selectedConversationId] || [] : [];
  const selectedConversation = mockConversations.find(c => c.id === selectedConversationId);

   const filteredConversations = mockConversations.filter(conv =>
    conv.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConversationId) return;
        console.log(`Sending message to ${selectedConversationId}: ${messageInput}`);
        // TODO: Implement Firestore logic to add message to the conversation subcollection
        // Example: addDoc(collection(db, 'chats', selectedConversationId, 'messages'), { senderId: doctorUid, senderRole: 'doctor', text: messageInput, timestamp: serverTimestamp() });

        // Add to mock data for UI update (remove when using Firestore)
         const newMessage = { id: `m${Math.random()}`, sender: 'doctor', text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
         (mockMessages as any)[selectedConversationId].push(newMessage);

        setMessageInput("");
   };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedConversationId) {
            console.log(`Uploading file for ${selectedConversationId}:`, file.name);
            // TODO: Implement Firebase Storage upload logic and then add a message with the file URL to Firestore chat.
            toast({ title: "File Upload", description: `${file.name} selected. Upload functionality TBD.`}); // Placeholder toast
        }
    };

     // Placeholder toast import
     const { toast } = useToast();
     function useToast() { return { toast: (options: any) => console.log("Toast:", options) } }


  return (
    <AppLayout>
       {/* Full height container needed for sidebar layout */}
      <div className="flex h-[calc(100vh-var(--header-height,4rem))] border-t"> {/* Adjust height based on AppLayout header/padding */}

        {/* Conversation List Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col">
           <div className="p-4 border-b">
                <h2 className="text-xl font-semibold mb-2">Conversations</h2>
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
           </div>
          <ScrollArea className="flex-1">
            {filteredConversations.length > 0 ? filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer border-b hover:bg-muted/50",
                  selectedConversationId === conv.id ? "bg-muted" : ""
                )}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <Avatar className="h-10 w-10">
                   <AvatarImage src={conv.avatar} alt={conv.patientName} data-ai-hint={conv.dataAiHint} />
                   <AvatarFallback>{conv.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                   <p className="font-medium truncate">{conv.patientName}</p>
                   <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                    <span>{conv.timestamp}</span>
                    {conv.unread > 0 && <Badge className="mt-1 px-1.5 py-0.5 h-auto leading-tight bg-primary">{conv.unread}</Badge>}
                </div>
              </div>
            )) : (
                <p className="p-4 text-center text-muted-foreground">No conversations found.</p>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                     <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.patientName} data-ai-hint={selectedConversation.dataAiHint} />
                     <AvatarFallback>{selectedConversation.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                 <h2 className="text-lg font-semibold">{selectedConversation.patientName}</h2>
                  {/* Add maybe patient details button or status */}
              </div>

              {/* Messages */}
               <ScrollArea className="flex-1 p-4 space-y-4">
                 {selectedMessages.map((msg: any) => (
                   <div key={msg.id} className={cn("flex", msg.sender === 'doctor' ? 'justify-end' : 'justify-start')}>
                     <div className={cn("rounded-lg px-4 py-2 max-w-[70%]", msg.sender === 'doctor' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                       <p>{msg.text}</p>
                       <p className="text-xs mt-1 opacity-70 text-right">{msg.time}</p>
                     </div>
                   </div>
                 ))}
                 {/* Add a reference point for auto-scrolling */}
                 {/* <div ref={messagesEndRef} /> */}
               </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t flex items-center gap-2 bg-muted/50">
                <Input
                    placeholder="Type your message..."
                    className="flex-1 bg-background"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                 <input
                     type="file"
                     id="file-upload"
                     className="hidden"
                     onChange={handleFileUpload}
                 />
                 <Button variant="ghost" size="icon" asChild>
                     <label htmlFor="file-upload" className="cursor-pointer">
                         <Paperclip className="h-5 w-5" />
                     </label>
                 </Button>
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
