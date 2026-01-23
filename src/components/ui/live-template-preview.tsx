import React from 'react';
import Image from 'next/image';
import { LinkIcon } from 'lucide-react';
import { MdCall, MdEmail, MdSave } from 'react-icons/md';

interface LiveTemplatePreviewProps {
  template?: {
    id: string;
    name: string;
    layout?: 'Center Aligned' | 'Left Aligned' | 'Portrait';
    cardTheme?: string;
    font?: string;
    linkColor?: string;
  };
  profileData?: {
    name: string;
    jobTitle: string;
    company: string;
    location: string;
    bio: string;
  };
  profileImage?: string;
  coverImage?: string;
  companyLogo?: string;
  activeLinks?: Record<string, boolean>;
  linkImages?: Record<string, string>;
  linkOrder?: string[];
}

const defaultProfileData = {
  name: "John Doe",
  jobTitle: "Product Manager", 
  company: "Tech Corp",
  location: "San Francisco, CA",
  bio: "Passionate about creating innovative solutions that make a difference. Always learning and growing in the tech space."
};

const defaultActiveLinks = {
  linkedin: true,
  twitter: true,
  email: true,
  website: true,
  instagram: true,
  facebook: true,
  youtube: false,
  tiktok: false,
  whatsapp: false,
  telegram: false
};

const defaultLinkOrder = ['linkedin', 'twitter', 'email', 'website', 'instagram', 'facebook', 'youtube', 'tiktok', 'whatsapp', 'telegram'];

const defaultLinkImages = {
  linkedin: '/links/linkedin.svg',
  twitter: '/links/twitter.svg', 
  email: '/links/email.svg',
  website: '/links/customlink.svg',
  instagram: '/links/instagram.svg',
  facebook: '/links/facebook.svg',
  youtube: '/links/youtube.svg',
  tiktok: '/links/tiktok.svg',
  snapchat: '/links/snapchat.svg',
  whatsapp: '/links/whatsapp.svg',
  telegram: '/links/telegram.svg',
  discord: '/links/discord.svg',
  spotify: '/links/spotify.svg',
  pinterest: '/links/pinterest.svg',
  threads: '/links/threads.svg',
  twitch: '/links/twitch.svg',
  calendly: '/links/calendly.svg',
  paypal: '/links/paypal.svg',
  venmo: '/links/venmo.svg',
  cashapp: '/links/cashapp.svg',
  etsy: '/links/etsy.svg',
  yelp: '/links/yelp.svg'
};

export default function LiveTemplatePreview({
  template,
  profileData = defaultProfileData,
  profileImage = '/defaultpp.png',
  coverImage,
  companyLogo = '/defaultcompanylogo.png',
  activeLinks = defaultActiveLinks,
  linkImages = defaultLinkImages,
  linkOrder = defaultLinkOrder
}: LiveTemplatePreviewProps) {
  const layout = template?.layout || 'Center Aligned';
  const selectedCardTheme = template?.cardTheme || '#BFDBFE';
  const selectedFont = template?.font || 'Inter';
  const selectedLinkColor = template?.linkColor || '#3B82F6';

  const renderCenterAlignedLayout = () => (
    <div
      className="w-64 h-[520px] flex flex-col moder overflow-auto rounded-[25px] hidden-scrollbar border border-[rgb(189,189,189)]"
      style={{
        backgroundColor: selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme,
        fontFamily: selectedFont,
      }}
    >
      {/* Header with gradient background and profile picture */}
      <div className="h-28 w-full flex justify-center relative">
        {coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={coverImage}
              alt="Cover Photo"
              className="object-cover"
              fill
              sizes="100%"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
        )}
        <div className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10">
          <div className="relative w-full h-full">
            <Image
              src={profileImage}
              className="rounded-full object-cover"
              alt="Profile"
              fill
              sizes="(max-width: 768px) 80px, 80px"
            />
            {/* Company logo badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md">
              <div className="relative w-full h-full">
                <Image
                  src={companyLogo}
                  alt="Company"
                  className="object-contain rounded-full"
                  fill
                  sizes="32px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content section */}
      <div className="mt-12 px-5 flex flex-col items-center text-center">
        <h3 className="font-bold text-sm">{profileData.name}</h3>
        <p className="text-xs mt-1">
          {profileData.jobTitle} at {profileData.company}
        </p>
        <p className="text-xs mt-1">{profileData.location}</p>

        <div className="mt-4 w-full px-2">
          <p className="text-[9px] font-medium leading-relaxed">
            {profileData.bio}
          </p>
        </div>

        {/* Contact button */}
        <div className="flex gap-2 mt-5">
        
                           <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdCall className="text-lg" />
                            <span className="text-xs">Call</span>
                          </button>
        
                          <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdSave className="text-lg" />
                            <span className="text-xs">Save</span>
                          </button>
        
                          <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdEmail className="text-lg" />
                            <span className="text-xs">Mail</span>
                          </button>
        </div>

        {/* Social icons - horizontal layout */}
        <div className="mt-6 w-full px-2 relative">
          <div className="flex flex-wrap justify-center gap-4">
            {linkOrder
              .filter((key) => activeLinks[key as keyof typeof activeLinks])
              .slice(0, 6)
              .map((linkKey) => {
                const linkName = linkKey.charAt(0).toUpperCase() + linkKey.slice(1);
                const linkImageKey = linkKey as keyof typeof linkImages;
                
                const iconComponent = linkImages[linkImageKey] ? (
                  <div className="relative w-5 h-5">
                    <Image
                      src={linkImages[linkImageKey]}
                      alt={linkName}
                      fill
                      sizes="20px"
                    />
                  </div>
                ) : (
                  <LinkIcon className="h-4 w-4 text-white" />
                );

                return (
                  <div key={linkKey} className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                      style={{
                        backgroundColor: selectedLinkColor === "transparent" ? "#3B82F6" : selectedLinkColor,
                      }}
                    >
                      {iconComponent}
                    </div>
                    <span className="text-[9px] font-medium text-center">
                      {linkName}
                    </span>
                  </div>
                );
              })}
          </div>
          {linkOrder.filter((key) => activeLinks[key as keyof typeof activeLinks]).length > 6 && (
            <div className="mt-2 text-center">
              <button className="text-[10px] text-blue-600 font-medium">
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLeftAlignedLayout = () => (
    <div
      className="w-64 h-[520px] flex flex-col rounded-[25px] border overflow-auto hidden-scrollbar border-[rgb(189,189,189)]"
      style={{
        backgroundColor: selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme,
        fontFamily: selectedFont,
      }}
    >
      {/* Header with gradient background and profile picture */}
      <div className="h-28 w-full flex pl-2 justify-start relative">
        {coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={coverImage}
              alt="Cover Photo"
              className="object-cover"
              fill
              sizes="100%"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600" />
        )}
        <div className="w-20 h-20 absolute bg-white p-1 rounded-full -bottom-10">
          <div className="relative w-full h-full">
            <Image
              src={profileImage}
              className="rounded-full object-cover"
              alt="Profile"
              fill
              sizes="(max-width: 768px) 80px, 80px"
            />
            {/* Company logo badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 border border-white shadow-md">
              <div className="relative w-full h-full">
                <Image
                  src={companyLogo}
                  alt="Company"
                  className="object-contain rounded-full"
                  fill
                  sizes="32px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content section */}
      <div className="mt-12 px-5 flex flex-col items-left text-left">
        <h3 className="font-bold text-sm">{profileData.name}</h3>
        <p className="text-xs mt-1">{profileData.jobTitle}</p>
        <p className="text-xs mt-1">{profileData.company}</p>
        <p className="text-xs mt-1">{profileData.location}</p>

        <div className="mt-4 w-full">
          <p className="text-[9px] font-medium leading-relaxed">
            {profileData.bio}
          </p>
        </div>

        {/* Contact button */}
        <div className="flex gap-2 mt-5">
        
                           <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdCall className="text-lg" />
                            <span className="text-xs">Call</span>
                          </button>
        
                          <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdSave className="text-lg" />
                            <span className="text-xs">Save</span>
                          </button>
        
                          <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdEmail className="text-lg" />
                            <span className="text-xs">Mail</span>
                          </button>
        </div>

        {/* Social icons - vertical list */}
        <div className="mt-4 w-full px-2 relative">
          <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 modern-scrollbar card-links-scrollbar">
            {linkOrder
              .filter((key) => activeLinks[key as keyof typeof activeLinks])
              .map((linkKey) => {
                const linkName = linkKey.charAt(0).toUpperCase() + linkKey.slice(1);
                const linkImageKey = linkKey as keyof typeof linkImages;
                
                const iconComponent = linkImages[linkImageKey] ? (
                  <div className="relative w-5 h-5">
                    <Image
                      src={linkImages[linkImageKey]}
                      alt={linkName}
                      fill
                      sizes="20px"
                    />
                  </div>
                ) : (
                  <LinkIcon className="h-4 w-4 text-white" />
                );

                return (
                  <div key={linkKey} className="flex items-center w-full p-2 rounded-md">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center mr-2"
                      style={{
                        backgroundColor: selectedLinkColor === "transparent" ? "#3B82F6" : selectedLinkColor,
                      }}
                    >
                      {iconComponent}
                    </div>
                    <span className="text-xs font-medium">{linkName}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortraitLayout = () => (
    <div
      className="w-64 h-[520px] flex flex-col rounded-[25px] border overflow-auto hidden-scrollbar border-[rgb(189,189,189)]"
      style={{
        backgroundColor: selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme,
        fontFamily: selectedFont,
      }}
    >
      {/* Full profile picture container with background */}
      <div className="w-full relative">
        {/* Profile image with lower z-index */}
        <div className="relative w-full h-72 z-10">
          <Image
            src={profileImage}
            className="object-cover object-center"
            alt="Profile"
            fill
            sizes="100%"
          />
        </div>
        {/* Background gradient overlay with higher z-index */}
        <div 
          className="absolute inset-0 z-20" 
          style={{
            background: `linear-gradient(to top, ${selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme} 0%, ${selectedCardTheme === "transparent" ? "#BFDBFE" : selectedCardTheme} 1%, rgba(255,255,255,0) 100%)`
          }}
        />
        {/* Company logo on bottom right */}
        <div className="absolute -bottom-14 right-4 w-12 h-12 rounded-full bg-white p-0.5">
          <div className="relative w-full h-full">
            <Image
              src={companyLogo}
              alt="Company"
              className="object-contain rounded-full"
              fill
              sizes="48px"
            />
          </div>
        </div>
      </div>
      {/* Content section */}
      <div className="px-5 flex flex-col items-start text-left">
        <h3 className="font-bold text-xl mb-1">{profileData.name}</h3>
        <p className="text-sm mb-0.5">{profileData.jobTitle}</p>
        <p className="text-xs mb-0.5">{profileData.company}</p>
        <p className="text-xs">{profileData.location}</p>

        <div className="mt-3 w-full">
          <p className="text-xs leading-relaxed">{profileData.bio}</p>
        </div>

        {/* Contact button */}
        <div className="flex gap-2 mt-5">
        
                           <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdCall className="text-lg" />
                            <span className="text-xs">Call</span>
                          </button>
        
                          <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdSave className="text-lg" />
                            <span className="text-xs">Save</span>
                          </button>
        
                          <button
                            className="flex-1 text-white py-3 px-4 flex justify-center items-center flex-col gap-1 rounded-lg text-sm font-medium"
                            style={{
                              backgroundColor:
                                selectedLinkColor === "transparent"
                                  ? "#3B82F6"
                                  : selectedLinkColor,
                            }}
                          >
                            <MdEmail className="text-lg" />
                            <span className="text-xs">Mail</span>
                          </button>
        </div>

        {/* Social icons - horizontal layout for portrait mode */}
        <div className="mt-6 w-full px-2 relative">
          <div className="flex flex-wrap justify-center gap-4">
            {linkOrder
              .filter((key) => activeLinks[key as keyof typeof activeLinks])
              .slice(0, 6)
              .map((linkKey) => {
                const linkName = linkKey.charAt(0).toUpperCase() + linkKey.slice(1);
                const linkImageKey = linkKey as keyof typeof linkImages;
                
                const iconComponent = linkImages[linkImageKey] ? (
                  <div className="relative w-5 h-5">
                    <Image
                      src={linkImages[linkImageKey]}
                      alt={linkName}
                      fill
                      sizes="20px"
                    />
                  </div>
                ) : (
                  <LinkIcon className="h-4 w-4 text-white" />
                );

                return (
                  <div key={linkKey} className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                      style={{
                        backgroundColor: selectedLinkColor === "transparent" ? "#3B82F6" : selectedLinkColor,
                      }}
                    >
                      {iconComponent}
                    </div>
                    <span className="text-[9px] font-medium text-center">
                      {linkName}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'Left Aligned':
        return renderLeftAlignedLayout();
      case 'Portrait':
        return renderPortraitLayout();
      default:
        return renderCenterAlignedLayout();
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-xs flex flex-col space-y-5 text-center">
        <p className="text-[#828282] font-semibold">Template Live Preview</p>
      </div>
      <div className="mt-4">
        {renderLayout()}
      </div>
    </div>
  );
}
