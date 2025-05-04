"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipContent } from "@/components/ui/tooltip"; // Import TooltipContent
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  FileText,
  LogOut,
  User,
  Settings,
  Stethoscope,
  Menu,
  ChevronDown,
  ChevronUp, // Add ChevronUp for collapse
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: Array<'doctor' | 'patient'>;
  subItems?: NavItem[]; // Add subItems property
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["doctor", "patient"] },
  {
    href: "/appointments",
    icon: CalendarCheck,
    label: "Appointments",
    roles: ["doctor", "patient"],
    subItems: [
      { href: "/appointments/schedule", icon: CalendarCheck, label: "Schedule", roles: ["doctor"] },
      { href: "/appointments/requests", icon: CalendarCheck, label: "Requests", roles: ["doctor"] },
      { href: "/appointments/book", icon: CalendarCheck, label: "Book", roles: ["patient"] },
      { href: "/appointments/history", icon: CalendarCheck, label: "History", roles: ["doctor", "patient"] },
    ]
   },
  { href: "/messages", icon: MessageSquare, label: "Messages", roles: ["doctor", "patient"] },
  { href: "/records", icon: FileText, label: "Medical Records", roles: ["patient"] },
  // Add more role-specific items here
  { href: "/patients", icon: User, label: "My Patients", roles: ["doctor"] },
];


export function AppLayout({ children }: AppLayoutProps) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
   const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const userRole = userProfile?.role;
  const filteredNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

   // Derive base path for active state checking
   const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
   const basePath = currentPath.split('/').slice(0, 3).join('/'); // e.g., /doctor/dashboard -> /doctor/dashboard, /patient/appointments/book -> /patient/appointments

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
            <Stethoscope className="h-6 w-6" />
            <span className="hidden md:group-data-[collapsible=icon]:hidden">MediConnect</span>
          </Link>
           {isMobile && <SidebarTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SidebarTrigger>}
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                {item.subItems ? (
                  <>
                    <SidebarMenuButton
                       onClick={() => toggleSubMenu(item.label)}
                       isActive={basePath === `/${userRole}${item.href}`} // Check base path for parent active state
                       className="justify-between" // Ensure space for chevron
                       tooltip={{ children: item.label } as TooltipContent} // Cast to TooltipContent type
                     >
                       <div className="flex items-center gap-2">
                         <item.icon />
                         <span className="truncate">{item.label}</span>
                       </div>
                       {openSubMenus[item.label] ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                     </SidebarMenuButton>
                     {openSubMenus[item.label] && (
                       <SidebarMenuSub>
                         {item.subItems
                           .filter(subItem => userRole && subItem.roles.includes(userRole))
                           .map(subItem => (
                           <SidebarMenuSubItem key={subItem.label}>
                             <Link href={`/${userRole}${subItem.href}`} passHref legacyBehavior>
                                <SidebarMenuSubButton
                                   isActive={currentPath === `/${userRole}${subItem.href}`}
                                >
                                   <span className="ml-5">{subItem.label}</span> {/* Indent sub-items */}
                                </SidebarMenuSubButton>
                             </Link>
                           </SidebarMenuSubItem>
                         ))}
                       </SidebarMenuSub>
                     )}
                  </>
                ) : (
                   <Link href={`/${userRole}${item.href}`} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={currentPath === `/${userRole}${item.href}`}
                       tooltip={{ children: item.label } as TooltipContent} // Cast to TooltipContent type
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="w-full justify-start gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                   <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                      <AvatarImage src={user?.photoURL ?? undefined} alt={userProfile?.name ?? 'User'} />
                      <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
                    </Avatar>
                   <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                       <span className="text-sm font-medium truncate">{userProfile?.name ?? user?.email}</span>
                       <span className="text-xs text-muted-foreground capitalize">{userProfile?.role}</span>
                   </div>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => router.push(`/${userRole}/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
               </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem> */}
               <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           {/* Non-mobile trigger shown when collapsed */}
           {!isMobile && (
              <div className="hidden md:block mt-2 group-data-[state=expanded]:group-data-[collapsible=icon]:hidden">
                 <SidebarTrigger className="w-full justify-center" />
              </div>
           )}
        </SidebarFooter>
      </Sidebar>

       {/* Add SidebarInset to manage main content layout */}
      <SidebarInset>
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
