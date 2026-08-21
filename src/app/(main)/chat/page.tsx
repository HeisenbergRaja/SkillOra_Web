"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSkillById } from '@/lib/firebase/skills';
import { getUserProfile } from '@/lib/firebase/user';
import { getOrCreateChat, observeMessages, sendMessage, markAsRead } from '@/lib/firebase/chat';
import { Chat, ChatMessage } from '@/types/chat';
import { Skill } from '@/types/skill';
import { UserProfile } from '@/types/user';
import { ArrowLeft, Send } from 'lucide-react';

export default function ChatScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const skillId = searchParams.get('skillId');
  const studentIdParam = searchParams.get('studentId');
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.uid || "";
  const isPublisherView = Boolean(studentIdParam && studentIdParam !== "null" && studentIdParam.trim() !== "");

  useEffect(() => {
    if (!currentUserId) {
      setErrorMessage("Please sign in to continue");
      setIsLoading(false);
      return;
    }

    if (!skillId || skillId === "null") {
      setErrorMessage("Unable to open this conversation (Invalid ID)");
      setIsLoading(false);
      return;
    }

    let unsubscribeMessages: (() => void) | undefined;

    const initializeChat = async () => {
      try {
        // 1. Load Skill
        const skillData = await getSkillById(skillId);
        if (!skillData) {
          setErrorMessage("Skill not found");
          setIsLoading(false);
          return;
        }
        setSkill(skillData);

        // 2. Determine target participants
        const targetStudentId = isPublisherView ? studentIdParam! : currentUserId;
        const targetPublisherId = skillData.creatorId;

        // 3. Get or Create Chat
        const chatData = await getOrCreateChat(skillData.id, skillData.title, targetPublisherId, targetStudentId);
        if (!chatData) {
          setErrorMessage("Chat creation returned null");
          setIsLoading(false);
          return;
        }
        setChat(chatData);

        // 4. Load Other User Profile
        const otherUid = isPublisherView ? studentIdParam! : targetPublisherId;
        const otherUserData = await getUserProfile(otherUid);
        if (otherUserData) {
          setOtherUser(otherUserData as UserProfile);
        }

        // 5. Start observing messages
        unsubscribeMessages = observeMessages(chatData.chatId, (msgs) => {
          setMessages(msgs);
          setIsLoading(false); // First snapshot turns off loading
          
          // Mark as read
          markAsRead(chatData.chatId, !isPublisherView).catch(console.error);
        });

      } catch (error: any) {
        console.error("Unexpected error in ChatScreen", error);
        setErrorMessage("An error occurred: " + error.message);
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [skillId, currentUserId, studentIdParam, isPublisherView]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chat || !skill) return;
    
    const text = inputText.trim();
    setInputText("");
    
    try {
      const receiverId = isPublisherView ? studentIdParam! : skill.creatorId;
      await sendMessage(chat.chatId, currentUserId, receiverId, text);
    } catch (e) {
      console.error("Failed to send message", e);
      alert("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white mb-4">{errorMessage}</p>
        <button 
          onClick={() => router.back()}
          className="bg-[#AEC279] text-[#20271E] px-6 py-2 rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col pt-6 max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex w-full px-6 py-4 items-center space-x-4 bg-transparent shrink-0">
        <button onClick={() => router.back()} className="text-white hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-[#3F483A] flex items-center justify-center overflow-hidden shrink-0">
          {otherUser?.profileImageUrl ? (
            <img src={otherUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold">{(otherUser?.name || "U").charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex flex-col flex-1">
          <span className="text-white text-sm font-bold">{otherUser?.name || "User"}</span>
          <span className="text-white/60 text-[11px]">
            {isPublisherView ? `Student • ${skill?.title}` : `Creator • ${skill?.title}`}
          </span>
        </div>
      </div>

      {/* Course Info Card */}
      <div className="px-6 shrink-0 mt-2">
        <div className="w-full bg-[#3F483A]/60 rounded-2xl p-3 flex items-center">
          <div className="w-9 h-9 rounded-lg bg-[#20271E] flex items-center justify-center shrink-0">
            {/* Using a placeholder SVG or just a generic icon since Dashboard lucide is generic */}
            <div className="w-4 h-4 bg-[#AEC279] rounded-sm opacity-80" />
          </div>
          <div className="flex flex-col flex-1 ml-3">
            <span className="text-white text-xs font-bold">{skill?.title}</span>
            <span className="text-white/60 text-[10px]">
              {isPublisherView ? "Chatting with learner" : `Ask ${otherUser?.name || "the creator"} anything about this skill`}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-white/50 text-sm text-center">
              {isPublisherView ? "No messages from student yet." : "Ask the creator your first question!"}
            </span>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.messageId} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#AEC279] text-[#20271E] rounded-tr-sm' : 'bg-[#3F483A] text-white rounded-tl-sm'}`}
                >
                  {msg.text}
                </div>
                <span className="text-white/40 text-[10px] mt-1 px-1">
                  {formatTime(msg.sentAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 shrink-0 mb-20 md:mb-4 bg-transparent">
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-[#3F483A]/60 rounded-full px-4 py-3 flex items-center border border-white/5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="bg-transparent flex-1 text-sm text-white placeholder-white/50 focus:outline-none"
              maxLength={2000}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${inputText.trim() ? 'bg-[#AEC279] text-[#20271E]' : 'bg-[#3F483A] text-white/50'}`}
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
