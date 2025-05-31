import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";

interface Profile {
  full_name: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  profiles?: Profile;
  recipient_id?: string;
}

interface DatabaseMessage {
  sender_id: string;
  sender: { full_name: string };
  content: string;
  created_at: string;
  is_read: boolean;
}

interface UserConversation {
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface MessageData {
  sender_id: string;
  content: string;
  recipient_id?: string;
}

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Load conversations for admin
  useEffect(() => {
    if (!isAdmin || !user) return;

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          sender_id,
          sender:profiles!chat_messages_sender_id_fkey(full_name),
          content,
          created_at,
          is_read
        `)
        .neq('sender_id', user.id)  // Exclude admin's own messages
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      // Group messages by user and create conversation objects
      const userMap = new Map<string, UserConversation>();
      
      (data as unknown as DatabaseMessage[]).forEach((msg) => {
        // Skip if this is a message from admin to themselves
        if (msg.sender_id === user.id) return;

        if (!userMap.has(msg.sender_id)) {
          userMap.set(msg.sender_id, {
            user_id: msg.sender_id,
            user_name: msg.sender?.full_name || 'Unknown',
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: 0
          });
        }
        
        const conversation = userMap.get(msg.sender_id)!;
        if (!msg.is_read) {
          conversation.unread_count++;
        }
      });

      setConversations(Array.from(userMap.values()));
    };

    void loadConversations();
  }, [isAdmin, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            console.log('New message received:', newMessage);
            
            // For both admin and student views, fetch the complete message with sender data
            const { data: messageData, error: messageError } = await supabase
              .from('chat_messages')
              .select(`
                *,
                sender:profiles!chat_messages_sender_id_fkey(
                  id,
                  full_name
                )
              `)
              .eq('id', newMessage.id)
              .single();

            if (messageError) {
              console.error('Error fetching new message data:', messageError);
              return;
            }

            console.log('New message with sender data:', messageData);

            if (isAdmin) {
              // For admin, only show messages from selected user or from admin
              if (messageData.sender_id === selectedUserId || messageData.sender_id === user.id) {
                setMessages(prev => [...prev, {
                  ...messageData,
                  sender_name: messageData.sender?.full_name || 'Unknown'
                }]);

                // Update conversations if it's a new message from a student
                if (messageData.sender_id !== user.id) {
                  setConversations(prevConversations => {
                    const updated = [...prevConversations];
                    const index = updated.findIndex(c => c.user_id === messageData.sender_id);
                    
                    if (index === -1) {
                      updated.push({
                        user_id: messageData.sender_id,
                        user_name: messageData.sender?.full_name || 'Unknown',
                        last_message: messageData.content,
                        last_message_time: messageData.created_at,
                        unread_count: 1
                      });
                    } else {
                      updated[index] = {
                        ...updated[index],
                        last_message: messageData.content,
                        last_message_time: messageData.created_at,
                        unread_count: updated[index].unread_count + 1
                      };
                    }
                    return updated;
                  });
                }
              }
            } else if (messageData.sender_id === user.id || messageData.recipient_id === user.id) {
              // For regular users, show their messages and admin replies
              console.log('Student view: Handling new message', messageData.id, 'Sender ID:', messageData.sender_id);
              console.log('Student view: New message sender data:', messageData.sender);
              setMessages(prev => [...prev, {
                ...messageData,
                sender_name: messageData.sender?.full_name || 'Unknown'
              }]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, selectedUserId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      console.log('Loading messages for user:', user?.id, 'isAdmin:', isAdmin);
      
      // Modify the query to always include sender profile data
      const query = supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          sender_id,
          recipient_id,
          created_at,
          is_read,
          sender:profiles!chat_messages_sender_id_fkey(
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: true });

      if (isAdmin) {
        if (!selectedUserId) {
          setMessages([]);
          return;
        }
        query.or(`sender_id.eq.${selectedUserId},sender_id.eq.${user.id}`);
      } else {
        // For regular users, show their messages and messages where they are recipient
        query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      console.log('Raw messages data:', data);

      // Process messages and ensure we have sender names
      const messagesWithNames = data.map(msg => {
        console.log('Processing message:', msg.id, 'Sender ID:', msg.sender_id);
        console.log('Message sender data:', msg.sender);

        // Always use the sender data from the join
        return {
          ...msg,
          sender_name: msg.sender?.full_name || 'Unknown'
        };
      });

      console.log('Processed messages with names:', messagesWithNames);
      setMessages(messagesWithNames);
    };

    loadMessages();
  }, [user, isAdmin, selectedUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    setIsLoading(true);
    try {
      const messageData: MessageData = {
        sender_id: user.id,
        content: inputMessage.trim(),
      };

      // If admin is replying to a student, include the recipient_id
      if (isAdmin && selectedUserId) {
        messageData.recipient_id = selectedUserId;
      }

      // First, ensure we have the sender's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      console.log('Sender profile data:', profileData);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select('*, sender:profiles!chat_messages_sender_id_fkey(full_name)')
        .single();

      if (error) throw error;

      // Immediately add the new message to the messages state
      if (data) {
        const senderName = data.sender?.full_name || profileData?.full_name || 'Unknown';
        console.log('Message sender name:', senderName);
        
        setMessages(prev => [...prev, {
          ...data,
          sender_name: senderName
        }]);
      }

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      // Update unread count in conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.user_id === selectedUserId
            ? { ...conv, unread_count: Math.max(0, conv.unread_count - 1) }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const renderAdminInbox = () => (
    <div className="flex h-full">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r bg-white/80 backdrop-blur-sm"
          >
            <div className="p-2 border-b bg-blue-50/50">
              <h3 className="font-semibold text-sm text-blue-900">Conversations</h3>
            </div>
            <ScrollArea className="h-[calc(550px-40px)]">
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => setSelectedUserId(conv.user_id)}
                    className={cn(
                      "w-full p-2 rounded-md text-left hover:bg-blue-50/50 transition-colors",
                      selectedUserId === conv.user_id && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {conv.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {conv.user_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {conv.last_message}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {conv.unread_count > 0 && (
                          <Badge variant="default" className="h-5">
                            {conv.unread_count}
                          </Badge>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {new Date(conv.last_message_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="p-2 border-b flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 md:hidden"
                  onClick={() => setShowSidebar(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {conversations.find(c => c.user_id === selectedUserId)?.user_name.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {conversations.find(c => c.user_id === selectedUserId)?.user_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hidden md:flex"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <ScrollArea ref={scrollRef} className="flex-1 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
              <div className="space-y-2 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 max-w-[85%]",
                      message.sender_id === user?.id ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                    onClick={() => !message.is_read && markAsRead(message.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-200 text-slate-700">
                        {message.sender_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="text-xs text-slate-500 mb-1">
                        {message.sender_name || 'Unknown'}
                      </div>
                      <div
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm",
                          message.sender_id === user?.id
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-slate-200 text-slate-700",
                          !message.is_read && "border-2 border-blue-500"
                        )}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 max-w-[85%] ml-auto">
                    <div className="max-w-[70%] rounded-md px-3 py-1.5 bg-white border border-slate-200">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-2 border-t bg-white/80 backdrop-blur-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-1"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 h-8 text-sm bg-white/50 border-blue-200 focus:border-blue-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-8 w-8 bg-blue-600 hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-blue-900/70 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );

  const renderUserChat = () => (
    <>
      <div className="p-2 border-b flex justify-between items-center bg-white/80 backdrop-blur-sm">
        <h3 className="font-semibold text-sm text-blue-900">Message Campus Assistant</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-blue-50/50"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-3 w-3 text-blue-900/70" />
        </Button>
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="space-y-2 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 max-w-[85%]",
                message.sender_id === user?.id ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-900">
                  {message.sender_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="text-xs text-blue-900/70 mb-1">
                  {message.sender_name || 'Unknown'}
                </div>
                <div
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm",
                    message.sender_id === user?.id
                      ? "bg-blue-600 text-white"
                      : "bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-900"
                  )}
                >
                  {message.content}
                </div>
                <div className="text-xs text-blue-900/70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 max-w-[85%] ml-auto">
              <div className="max-w-[70%] rounded-md px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-blue-200">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t bg-white/80 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-1"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-8 text-sm bg-white/50 border-blue-200 focus:border-blue-500"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-8 w-8 bg-blue-600 hover:bg-blue-700" 
            disabled={isLoading}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[550px]"
          >
            <Card className="h-[550px] flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg border border-blue-100">
              {isAdmin ? renderAdminInbox() : renderUserChat()}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="h-11 w-11 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="h-5 w-5" />
        {isAdmin && conversations.some(c => c.unread_count > 0) && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
          >
            {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
          </Badge>
        )}
      </Button>
    </div>
  );
} 