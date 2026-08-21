"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { observePublisherChats } from '@/lib/firebase/chat';
import { getUserProfile } from '@/lib/firebase/user';
import { Chat } from '@/types/chat';
import { UserProfile } from '@/types/user';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function PublisherChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = observePublisherChats(user.uid, (chatList) => {
      setChats(chatList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-[#AEC279] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-24 pt-6 px-6">
      {/* Header */}
      <div className="flex w-full items-center space-x-4 pb-6">
        <button onClick={() => router.back()} className="text-[var(--primary)] hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[var(--primary)] text-lg font-bold flex-1">
          Learner Conversations
        </h1>
      </div>

      {chats.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 opacity-50">
          <MessageSquare className="w-16 h-16 text-white mb-4" />
          <span className="text-white text-sm">No learner conversations yet.</span>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {chats.map(chat => (
            <PublisherChatItem 
              key={chat.chatId} 
              chat={chat} 
              onClick={() => router.push(`/chat?skillId=${chat.skillId}&studentId=${chat.studentId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PublisherChatItem({ chat, onClick }: { chat: Chat, onClick: () => void }) {
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getUserProfile(chat.studentId).then(profile => {
      if (profile) setStudentProfile(profile as UserProfile);
    }).catch(console.error);
  }, [chat.studentId]);

  return (
    <div 
      onClick={onClick}
      className="w-full flex items-center bg-[#3F483A]/30 border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-[#3F483A]/50 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-[#3F483A] flex items-center justify-center shrink-0 overflow-hidden">
        {studentProfile?.profileImageUrl ? (
          <img src={studentProfile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-xl">{(studentProfile?.name || "U").charAt(0).toUpperCase()}</span>
        )}
      </div>
      
      <div className="flex flex-col flex-1 mx-4 overflow-hidden">
        <span className="text-white text-[15px] font-bold truncate">
          {studentProfile?.name || "Loading..."}
        </span>
        <span className="text-[var(--primary)] text-[11px] font-medium truncate mt-0.5">
          {chat.skillTitle}
        </span>
        <span className="text-white/60 text-[13px] truncate mt-1">
          {chat.lastMessage || "No messages yet"}
        </span>
      </div>

      {chat.publisherUnreadCount > 0 && (
        <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
          <span className="text-[#20271E] text-[10px] font-bold">
            {chat.publisherUnreadCount}
          </span>
        </div>
      )}
    </div>
  );
}
