import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Bell, Check, Info, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "src/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover"
import { ScrollArea } from "src/components/ui/scroll-area"
import { Separator } from "src/components/ui/separator"
import { cn } from "src/lib/utils"

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const channel = supabase.channel('notification_updates')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    
    if (!error) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);
    
    if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 px-2">
                    Mark all as read
                </Button>
            )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : notifications.length > 0 ? (
                <div className="flex flex-col">
                    {notifications.map((n) => (
                        <button
                            key={n.id}
                            className={cn(
                                "flex flex-col gap-1 p-4 text-left transition-colors hover:bg-muted/50",
                                !n.is_read && "bg-primary/5"
                            )}
                            onClick={() => markAsRead(n.id)}
                        >
                            <div className="flex items-center gap-2">
                                {getTypeIcon(n.type)}
                                <span className="font-semibold text-xs">{n.title}</span>
                                <span className="ml-auto text-[10px] text-muted-foreground">
                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {n.message}
                            </p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                </div>
            )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8" onClick={() => setOpen(false)}>
                Close
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
