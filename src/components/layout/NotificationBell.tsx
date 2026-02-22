import { useEffect, useState } from "react";
import {
    Bell,
    Circle,
    CheckCheck,
    CreditCard,
    HandCoins,
    Info,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: 'fee_reminder' | 'settlement_reminder' | 'general';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    data: any;
}

export function NotificationBell() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (profile?.id) {
            fetchNotifications();
            subscribeToNotifications();
        }
    }, [profile]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("recipient_id", profile?.id)
            .order("created_at", { ascending: false })
            .limit(10);

        setNotifications(data || []);
        setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
    };

    const subscribeToNotifications = () => {
        const channel = supabase
            .channel(`user_notifications:${profile?.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${profile?.id}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
                    setUnreadCount(prev => prev + 1);
                    toast(newNotif.title, {
                        description: newNotif.message,
                        icon: <Bell className="h-4 w-4" />
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllRead = async () => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("recipient_id", profile?.id)
            .eq("is_read", false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'fee_reminder': return <CreditCard className="h-4 w-4 text-warning" />;
            case 'settlement_reminder': return <HandCoins className="h-4 w-4 text-primary" />;
            default: return <Info className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-primary/10 group transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive border-2 border-background">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-xl border-muted/50">
                <div className="flex items-center justify-between p-2 mb-1">
                    <DropdownMenuLabel className="p-0 text-lg font-bold">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-tighter" onClick={markAllRead}>
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator className="mx-0" />

                <div className="max-h-[400px] overflow-y-auto py-1 scrollbar-hide">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-10" />
                            <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer mb-1 focus:bg-muted/50 ${!n.read ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                                onClick={() => markAsRead(n.id)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        {getIcon(n.type)}
                                        <span className="font-bold text-sm">{n.title}</span>
                                    </div>
                                    {!n.is_read && <Circle className="h-2 w-2 fill-primary text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium italic opacity-70">
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatDate(n.created_at)}
                                </span>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator className="mx-0" />
                <div className="p-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Feezy v2.0 Platform</p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
