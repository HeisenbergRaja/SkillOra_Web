import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firebase/user';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { profile, user } = useAuth();
  
  const [dept, setDept] = useState(profile?.dept || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserProfile(user.uid, {
        dept: dept.trim(),
        college: college.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60">
      <div className="w-full max-w-md bg-[#252D21] rounded-[24px] overflow-hidden border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-white text-lg font-bold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-white/60 text-sm font-medium pl-1">Department</label>
            <input 
              type="text" 
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#AEC279] transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-white/60 text-sm font-medium pl-1">College / University</label>
            <input 
              type="text" 
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Skillora Academy"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#AEC279] transition-colors"
              required
            />
          </div>
          
          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-[#AEC279] text-[#20271E] font-bold hover:bg-[#9AB063] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-[#20271E] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
