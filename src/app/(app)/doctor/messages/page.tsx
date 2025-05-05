"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs, addDoc, serverTimestamp,
  orderBy, onSnapshot, doc, updateDoc
} from 'firebase/firestore';
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function DoctorMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [senderInfo, setSenderInfo] = useState<{ [key: string]: { name: string, avatar: string } }>({});
  const { toast } = useToast();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    const q = query(collection(db, "conversations"), where("doctorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageText: doc.data().lastMessageText || '',
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt : null,
      }));
      setConversations(conversationsData);
      setIsLoadingConversations(false);
      if (!selectedConversationId && conversationsData.length > 0) {
        setSelectedConversationId(conversationsData[0].id);
      }
    }, (error) => {
      console.error("Error fetching conversations:", error);
      toast({ title: "Error", description: "Could not load conversations.", variant: "destructive" });
      setIsLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [user, selectedConversationId, toast]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const q = query(
      collection(db, "conversations", selectedConversationId, "messages"),
      orderBy("createdAt", "asc")
    );
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
    if (selectedConversation) {
      setSenderInfo({
        [selectedConversation.patientId]: {
          name: selectedConversation.patientName || 'Patient',
          avatar: selectedConversation.patientAvatar || ''
        },
        [selectedConversation.doctorId]: {
          name: selectedConversation.doctorName || 'Doctor',
          avatar: ''
        }
      });
    }
  }, [selectedConversation]);

  const filteredConversations = conversations
    .filter(conv =>
      conv.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const timeA = a.updatedAt?.toDate?.() || 0;
      const timeB = b.updatedAt?.toDate?.() || 0;
      return timeB - timeA;
    });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    try {
      const newMessage = {
        senderId: user?.uid,
        senderRole: 'doctor',
        senderName: user?.displayName || 'Doctor',
        senderAvatar: user?.avatar || '',
        text: messageInput,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'conversations', selectedConversationId, 'messages'), newMessage);
      await updateDoc(doc(db, 'conversations', selectedConversationId), {
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

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-var(--header-height,4rem))] border-t">
        {/* Sidebar */}
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
                  selectedConversationId === conv.id && "bg-muted"
                )}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conv.patientAvatar || ''} alt={conv.patientName} />
                  <AvatarFallback>{conv.patientName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate">{conv.patientName}</p>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessageText}</p>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span>{conv.timestamp}</span>
                  {conv.unread > 0 && (
                    <Badge className="mt-1 px-1.5 py-0.5 h-auto leading-tight bg-primary">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            )) : (
              <p className="p-4 text-center text-muted-foreground">No conversations found.</p>
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.patientAvatar || ''} alt={selectedConversation.patientName} />
                  <AvatarFallback>{selectedConversation.patientName?.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{selectedConversation.patientName}</h2>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 space-y-4">
                {isLoadingMessages ? (
                  <p className="text-center text-muted-foreground">Loading messages...</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={cn("flex items-end gap-2", msg.senderId === user?.uid ? 'justify-end' : 'justify-start')}
                    >
                      {msg.senderId !== user?.uid && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={senderInfo[msg.senderId]?.avatar || ''} alt={senderInfo[msg.senderId]?.name} />
                          <AvatarFallback>
                            {senderInfo[msg.senderId]?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("flex flex-col", msg.senderId === user?.uid ? 'items-end' : 'items-start')}>
                        <p className="text-xs text-muted-foreground mb-1">
                          {msg.senderId === user?.uid ? 'You' : senderInfo[msg.senderId]?.name || 'Unknown'}
                        </p>
                        <div className={cn("rounded-lg px-4 py-2 max-w-[70%]", msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-70 text-right">
                            {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'p') : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
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
