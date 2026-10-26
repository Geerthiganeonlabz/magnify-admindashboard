'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Contact, Pencil, Loader2 } from 'lucide-react';
import type { AccountProfile } from '@/hooks/useAccount';

interface ProfileInformationCardProps {
  profile: AccountProfile;
  loading: boolean;
  onChange: (patch: Partial<AccountProfile>) => void;
  onUploadAvatar: (file: File) => Promise<void>;
  onError: (message: string) => void;
}

export default function ProfileInformationCard({
  profile,
  loading,
  onChange,
  onUploadAvatar,
  onError,
}: ProfileInformationCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials =
    profile.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'A';

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      onError('Image must be smaller than 2MB.');
      return;
    }

    setUploading(true);
    try {
      await onUploadAvatar(file);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="w-full min-w-0 flex-1 rounded-xl border border-[#C3C6D4] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <Contact className="h-5 w-5 shrink-0 text-[#0040A1] sm:h-6 sm:w-6" />
        <h2 className="text-[18px] font-semibold text-[#1A1C1F] sm:text-[20px] lg:text-[22px]">
          Profile Information
        </h2>
      </div>

      <div className="flex flex-col items-center gap-5 border-b border-[#E8E8ED] pb-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:pb-8 sm:text-left">
        <div className="relative h-[90px] w-[90px] min-w-[90px] shrink-0 sm:h-[100px] sm:w-[100px] sm:min-w-[100px] lg:h-[109px] lg:w-[109px] lg:min-w-[109px]">
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-[#1A1C1F] text-xl font-semibold text-white sm:text-2xl"
            style={{ boxShadow: '0 0 0 4.5px #EDEDF2' }}
          >
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt="Profile"
                width={109}
                height={109}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span>{initials}</span>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            // className="absolute bottom-0 right-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#0040A1] shadow-md disabled:opacity-60"
            aria-label="Change profile picture"
          >
            {/* <Pencil className="h-3 w-3 text-white" /> */}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-[18px] font-semibold text-[#1A1C1F] sm:text-[20px]">
            Your Photo
          </h3>
          <p className="mt-1 text-[14px] text-[#434652] sm:text-[15px]">
            This will be displayed on your profile and internal communications.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-[#DAE2FF] px-4 py-2 text-[14px] font-semibold text-[#002B73] hover:bg-[#c9d6ff] disabled:opacity-60 sm:text-[15px]"
            >
              {uploading ? 'Uploading...' : 'Upload New'}
            </button>
            <button
              type="button"
              onClick={() => onChange({ avatar: '' })}
              disabled={uploading || !profile.avatar}
              className="rounded-lg px-4 py-2 text-[14px] font-semibold text-[#BA1A1A] hover:bg-red-50 disabled:opacity-50 sm:text-[15px]"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-[14px] font-semibold text-[#1A1C1F] sm:text-[15px]">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={profile.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder={loading ? 'Loading...' : 'Your full name'}
            disabled={loading}
            className="rounded-lg border border-[#C3C6D4] px-4 py-3 text-[16px] text-[#1A1C1F] outline-none focus:border-[#0040A1] sm:text-[17px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[14px] font-semibold text-[#1A1C1F] sm:text-[15px]">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder={loading ? 'Loading...' : 'you@example.com'}
            disabled={loading}
            className="rounded-lg border border-[#C3C6D4] px-4 py-3 text-[16px] text-[#1A1C1F] outline-none focus:border-[#0040A1] sm:text-[17px]"
          />
        </div>
      </div>
    </section>
  );
}