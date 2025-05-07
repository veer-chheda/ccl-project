"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Search, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

export default function PatientMessagesPage() {
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();

  const hasInitialized = useRef(false); // Added ref to track initial load

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    const q = query(collection(db, "conversations"), where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessage: doc.data().lastMessageText || '',
        timestamp: doc.data().updatedAt ? format(doc.data().updatedAt.toDate(), 'p') : '',
      }));
      setConversations(conversationsData);
      setIsLoadingConversations(false);

      if (!hasInitialized.current && conversationsData.length > 0) {
        setSelectedConversationId(conversationsData[0].id);
        hasInitialized.current = true;
      }
    }, (error) => {
      console.error("Error fetching conversations:", error);
      toast({ title: "Error", description: "Could not load conversations.", variant: "destructive" });
      setIsLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true);
    const q = query(collection(db, "conversations", selectedConversationId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
      setIsLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const doctorsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDoctors(doctorsData);
          setFilteredDoctors(doctorsData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({ title: "Error", description: "Could not load doctors.", variant: "destructive" });
      }
    };

    fetchDoctors();
  }, [toast]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, doctors]);

  const filteredConversations = conversations.filter(conv =>
    conv.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    try {
      const newMessage = {
        senderId: user?.uid,
        senderRole: 'patient',
        text: messageInput,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'conversations', selectedConversationId, 'messages'), newMessage);

      const conversationRef = doc(db, 'conversations', selectedConversationId);
      await updateDoc(conversationRef, {
        lastMessageText: messageInput,
        updatedAt: serverTimestamp(),
      });

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedConversationId) {
      console.log(`Uploading file for ${selectedConversationId}:`, file.name);
      toast({ title: "File Upload", description: `${file.name} selected. Upload functionality TBD.` });
    }
  };

  const handleStartNewConversation = async () => {
    if (!selectedDoctor || !messageInput.trim()) return;

    try {
      const newConversation = {
        patientName: user?.displayName || 'Patient',
        patientId: user?.uid,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        lastMessageText: messageInput,
        updatedAt: serverTimestamp(),
      };
      const conversationRef = await addDoc(collection(db, "conversations"), newConversation);
      setSelectedConversationId(conversationRef.id);

      const newMessage = {
        senderId: user?.uid,
        senderRole: "patient",
        text: messageInput,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "conversations", conversationRef.id, "messages"), newMessage);

      setMessageInput("");
      toast({ title: "Conversation started!", description: "Your conversation with the doctor has been created." });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({ title: "Error", description: "Could not start a new conversation.", variant: "destructive" });
    }
  };

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-var(--header-height,4rem))] border-t">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Messages</h2>
              <Button variant="outline" size="icon" onClick={() => {
                setSelectedConversationId(null);
                setSelectedDoctor(null);
                setMessages([]);
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
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
                  <AvatarImage src={conv.avatar || ''} alt={conv.doctorName} />
                  <AvatarFallback>{conv.doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate">{conv.doctorName}</p>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessageText}</p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span>{conv.updatedAt ? format(conv.updatedAt.toDate(), 'p') : ''}</span>
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
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.doctorAvatar || ''} alt={selectedConversation.doctorName} />
                  <AvatarFallback>{selectedConversation.doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{selectedConversation.doctorName}</h2>
                  <p className="text-sm text-muted-foreground">{selectedConversation.specialization || 'N/A'}</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 space-y-4">
                {isLoadingMessages ? (
                  <p className="text-center text-muted-foreground">Loading messages...</p>
                ) : messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full", msg.senderRole === 'patient' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "rounded-lg px-4 py-2 max-w-[70%]",
                      msg.senderRole === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}>
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">{msg.createdAt ? format(msg.createdAt.toDate(), 'p') : ''}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>

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

          {!selectedConversation && (
            <div className="p-4 border-t flex-1 flex flex-col justify-center items-center">
              <h3 className="text-lg font-semibold mb-2">Start a New Conversation</h3>
              <div className="relative mb-4">
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) => setSelectedDoctor(doctors.find(doc => doc.id === e.target.value))}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
              {selectedDoctor && (
                <div>
                  <Input
                    placeholder={`Message ${selectedDoctor.name}`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button onClick={handleStartNewConversation} disabled={!messageInput.trim()}>
                    Start Conversation
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
