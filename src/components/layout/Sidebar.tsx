tsx
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, MessageSquare, ListChecks, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export function Sidebar() {
  const { user, logOut, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where(user.role === "patient" ? "patientId" : "doctorId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(conversationsData);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="px-0">
          <User className="mr-2 h-4 w-4" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader className="text-left p-4">
          <SheetTitle>
            {user ? (
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.photoURL || ""} alt="Avatar" />
                  <AvatarFallback>{user.displayName?.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h1 className="font-bold">{user.displayName}</h1>
                  <p className="text-muted-foreground text-sm">{user.role}</p>
                </div>
              </div>
            ) : (
              <h1 className="font-bold">Menu</h1>
            )}
          </SheetTitle>
        </SheetHeader>
        {user && (
          <SheetFooter className="flex flex-col gap-2 px-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                </CardTitle>
                <CardDescription>See all your messages</CardDescription>
              </CardHeader>
              <CardContent>
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <Link href={`/${user.role}/messages`} key={conversation.id}>
                    <div className="flex items-center gap-3 py-2 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            user.role === "patient"
                              ? conversation.doctorAvatar || ""
                              : conversation.patientAvatar || ""
                          }
                          alt={
                            user.role === "patient"
                              ? conversation.doctorName || ""
                              : conversation.patientName || ""
                          }
                        />
                        <AvatarFallback>
                          {user.role === "patient"
                            ? conversation.doctorName?.replace("Dr. ", "").split(" ").map((n) => n[0]).join("") || ""
                            : conversation.patientName?.split(" ").map((n) => n[0]).join("") || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">
                          {user.role === "patient"
                            ? conversation.doctorName
                            : conversation.patientName}
                        </p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge className="h-auto leading-tight bg-primary">{conversation.unread}</Badge>
                      )}
                    </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted-foreground">No conversations yet.</p>
                )}
              </CardContent>
            </Card>
            <Link href={`/${user.role}/records`}>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Medical Records
              </Button>
            </Link>
            {user.role === 'doctor' &&
            <Link href={`/${user.role}/requests`}>
              <Button variant="ghost" className="w-full justify-start">
                <ListChecks className="mr-2 h-4 w-4" />
                Requests
              </Button>
            </Link>
            }
            <Separator />
            <Button variant="ghost" className="w-full justify-start" onClick={logOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}