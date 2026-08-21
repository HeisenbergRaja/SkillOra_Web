import React, { useState } from 'react';
import { Camera, Edit2 } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

interface ProfileCardProps {
  name: string;
  dept: string;
  college: string;
  credits: number;
  profileImageUrl?: string;
}

export const ProfileCard = ({ name, dept, college, credits, profileImageUrl }: ProfileCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-[#3F483A] rounded-[20px] py-6 flex flex-col items-center relative">
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <Edit2 className="w-4 h-4 text-white/80" />
        </button>

        <div className="relative mb-4">
        <div className="w-[90px] h-[90px] rounded-full bg-[#AEC279] border-[3px] border-white/40 flex items-center justify-center overflow-hidden">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[var(--background)] text-4xl font-bold">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-7 h-7 rounded-full bg-[#20271E] border-2 border-[#3F483A] flex items-center justify-center cursor-pointer">
          <Camera className="text-white/80 w-3.5 h-3.5" />
        </div>
      </div>

      <h2 className="text-white text-xl font-bold">{name}</h2>
      <span className="text-white/80 text-sm font-medium mt-1">{dept}</span>
      <span className="text-white/50 text-[11px] mt-0.5 mb-4">{college}</span>

        <div className="bg-[var(--background)]/30 rounded-[20px] px-3 py-1 flex items-center space-x-1">
          <span className="text-sm">💰</span>
          <span className="text-[#AEC279] text-sm font-bold">{credits} Credits</span>
        </div>
      </div>
      
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </>
  );
};
