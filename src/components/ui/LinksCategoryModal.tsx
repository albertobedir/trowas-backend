"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LinkCard } from "@/components/ui/LinkCard";
import { X, Search, MessageSquare, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { BitPerms, hasPermission } from "@/utils/bitwiseperms";
import Image from 'next/image';


type LinksCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  linkImages: Record<string, string>;
  onLinkSelect: (link: string) => void;
  userperm: string;
};

export function LinksCategoryModal({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  linkImages,
  userperm,
  onLinkSelect
}: LinksCategoryModalProps) {
  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        staggerChildren: 0.05
      }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (      
          <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="h-[660px] p-0 overflow-hidden" aria-describedby="links-category-description">
            <motion.div 
              className="relative h-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="absolute right-2 top-2 z-10"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <div className="p-6">
                <motion.div variants={itemVariants}>
                  <DialogTitle className="text-xl font-semibold mb-2">Add content</DialogTitle>
                  <DialogDescription id="links-category-description" className="">Select from our wide variety of links and contact info below.</DialogDescription>
                </motion.div>
                
                <motion.div variants={itemVariants} className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    type="text"
                    className="w-full bg-gray-100 rounded-full mt-2 pl-10 pr-4 py-2 text-sm focus:outline-none"
                    placeholder="Search content..."
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 pb-2 mb-6">
                  {['Contact', 'Social Media', 'Business', 'Content', 'Real Estate', 'Payment', 'Music', 'More'].map((category, index) => (
                    <motion.button 
                      key={category}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveCategory(category)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="h-[calc(100%-190px)] max-h-[400px] bg-gray-50/80 rounded-lg p-4"
                  layout
                >
                  <CustomScrollArea className="h-full">
                    <motion.div 
                      className="pr-4"
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeCategory}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {activeCategory === 'Contact' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Contact</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <LinkCard isvisible={!hasPermission(BigInt(userperm), BitPerms.text)} icon={<MessageSquare className="h-5 w-5 text-green-500" />} name="Text" color="bg-green-100" onClick={() => onLinkSelect('text')} />
                                <LinkCard isvisible={!hasPermission(BigInt(userperm), BitPerms.call)} icon={<Phone className="h-5 w-5 text-green-500" />} name="Call" color="bg-green-100" onClick={() => onLinkSelect('call')} />
                                <LinkCard isvisible={!hasPermission(BigInt(userperm), BitPerms.email)} icon={<Mail className="h-5 w-5 text-blue-500" />} name="Email" color="bg-blue-100" onClick={() => onLinkSelect('email')} />
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.contactcard)}
                                  icon={<Image src={linkImages.contact || "/links/contactcard.svg"} alt="Contact Card" width={24} height={24} className="h-6 w-6" />} 
                                  name="Contact Card" 
                                  color="bg-gray-100" 
                                  onClick={() => onLinkSelect('contact')}
                                />
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.adress)}
                                  icon={<MapPin className="h-5 w-5 text-red-500" />} 
                                  name="Address" 
                                  color="bg-red-50" 
                                  onClick={() => onLinkSelect('address')}
                                />
                                <LinkCard 
                                 isvisible={!hasPermission(BigInt(userperm), BitPerms.facetime)}
                                  icon={<Image src={linkImages.facetime || "/links/facetime.svg"} alt="FaceTime" width={24} height={24} className="h-6 w-6" />} 
                                  name="FaceTime" 
                                  color="bg-green-50" 
                                  onClick={() => onLinkSelect('facetime')}
                                />
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.whatsapp)}
                                  icon={<Image src={linkImages.whatsapp || "/links/whatsapp.svg"} alt="WhatsApp" width={24} height={24} className="h-6 w-6" />} 
                                  name="WhatsApp" 
                                  color="bg-green-50" 
                                  onClick={() => onLinkSelect('whatsapp')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Social Media' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Social Media</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <LinkCard
                                isvisible={!hasPermission(BigInt(userperm), BitPerms.instagram)} 
                                  icon={<Image src={linkImages.instagram || "/links/instagram.svg"} alt="Instagram" width={24} height={24} className="h-6 w-6" />} 
                                  name="Instagram" 
                                  color="bg-pink-50"
                                  onClick={() => onLinkSelect('instagram')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.linkedin)}
                                  icon={<Image src={linkImages.linkedin || "/links/linkedin.svg"} alt="LinkedIn" width={24} height={24} className="h-6 w-6" />}
                                  name="LinkedIn"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('linkedIn')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.facebook)}
                                  icon={<Image src={linkImages.facebook || "/links/facebook.svg"} alt="Facebook" width={24} height={24} className="h-6 w-6" />}
                                  name="Facebook"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('facebook')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.youtube)}
                                  icon={<Image src={linkImages.youtube || "/links/youtube.svg"} alt="YouTube" width={24} height={24} className="h-6 w-6" />}
                                  name="YouTube"
                                  color="bg-red-50"
                                  onClick={() => onLinkSelect('youtube')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.twitter)}
                                  icon={<Image src={linkImages.twitter || "/links/twitter.svg"} alt="X (Twitter)" width={24} height={24} className="h-6 w-6" />}
                                  name="X (Twitter)"
                                  color="bg-gray-100"
                                  onClick={() => onLinkSelect('twitter')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.tiktok)}
                                  icon={<Image src={linkImages.tiktok || "/links/tiktok.svg"} alt="TikTok" width={24} height={24} className="h-6 w-6" />}
                                  name="TikTok"
                                  color="bg-gray-100"
                                  onClick={() => onLinkSelect('tiktok')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.snapchat)}
                                  icon={<Image src={linkImages.snapchat || "/links/snapchat.svg"} alt="Snapchat" width={24} height={24} className="h-6 w-6" />}
                                  name="Snapchat"
                                  color="bg-yellow-50"
                                  onClick={() => onLinkSelect('snapchat')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.twitch)}
                                  icon={<Image src={linkImages.twitch || "/links/twitch.svg"} alt="Twitch" width={24} height={24} className="h-6 w-6" />}
                                  name="Twitch"
                                  color="bg-purple-50"
                                  onClick={() => onLinkSelect('twitch')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.pinterest)}
                                  icon={<Image src={linkImages.pinterest || "/links/pinterest.svg"} alt="Pinterest" width={24} height={24} className="h-6 w-6" />}
                                  name="Pinterest"
                                  color="bg-red-50"
                                  onClick={() => onLinkSelect('pinterest')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.wechat)}
                                  icon={<Image src={linkImages.wechat || "/links/wechat.svg"} alt="WeChat" width={24} height={24} className="h-6 w-6" />}
                                  name="WeChat"
                                  color="bg-green-50"
                                  onClick={() => onLinkSelect('wechat')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.discord)}
                                  icon={<Image src={linkImages.discord || "/links/discord.svg"} alt="Discord" width={24} height={24} className="h-6 w-6" />}
                                  name="Discord"
                                  color="bg-indigo-50"
                                  onClick={() => onLinkSelect('discord')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.telegram)}
                                  icon={<Image src={linkImages.telegram || "/links/telegram.svg"} alt="Telegram" width={24} height={24} className="h-6 w-6" />}
                                  name="Telegram"
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('telegram')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.thread)}
                                  icon={<Image src={linkImages.threads || "/links/threads.svg"} alt="Thread" width={24} height={24} className="h-6 w-6" />}
                                  name="Thread"
                                  color="bg-gray-50"
                                  onClick={() => onLinkSelect('thread')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.clubhouse)}
                                  icon={<Image src={linkImages.clubhouse || "/links/clubhouse.svg"} alt="Clubhouse" width={24} height={24} className="h-6 w-6" />}
                                  name="Clubhouse"
                                  color="bg-amber-50" 
                                  onClick={() => onLinkSelect('clubhouse')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Business' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Business</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.website)}
                                  icon={<Image src="/globe.svg" alt="Website" width={24} height={24} className="h-6 w-6" />}
                                  name="Website"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('website')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.calendly)}
                                  icon={<Image src={linkImages.calendly || "/links/calendly.svg"} alt="Calendly" width={24} height={24} className="h-6 w-6" />}
                                  name="Calendly"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('calendly')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.calendlyembed)}
                                  icon={<Image src={linkImages.calendly || "/links/calendly_embed.svg"} alt="Calendly Embed" width={24} height={24} className="h-6 w-6" />}
                                  name="Calendly Embed"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('calendly-embed')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.rewiews)}
                                  icon={<Image src="/links/reviews.svg" alt="Reviews" width={24} height={24} className="h-6 w-6" />}
                                  name="Reviews"
                                  color="bg-yellow-50"
                                  onClick={() => onLinkSelect('reviews')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.etsy)}
                                  icon={<Image src="/links/etsy.svg" alt="Etsy" width={24} height={24} className="h-6 w-6" />}
                                  name="Etsy"
                                  color="bg-orange-50"
                                  onClick={() => onLinkSelect('etsy')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.applimk)}
                                  icon={<Image src="/links/app_link.svg" alt="App Link" width={24} height={24} className="h-6 w-6" />}
                                  name="App Link"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('app-link')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.chillpaper)}
                                  icon={<Image src="/links/chili-piper.svg" alt="Chill Paper" width={24} height={24} className="h-6 w-6" />}
                                  name="Chill Paper"
                                  color="bg-gray-50"
                                  onClick={() => onLinkSelect('chill-paper')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.msbookings)}
                                  icon={<Image src="/links/microsoft-bookings.svg" alt="Microsoft Bookings" width={24} height={24} className="h-6 w-6" />}
                                  name="MS Bookings"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('microsoft-bookings')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.booksy)}
                                  icon={<Image src="/links/booksy.svg" alt="Booksy" width={24} height={24} className="h-6 w-6" />}
                                  name="Booksy"
                                  color="bg-teal-50"
                                  onClick={() => onLinkSelect('booksy')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.square)}
                                  icon={<Image src="/links/square.svg" alt="Square" width={24} height={24} className="h-6 w-6" />}
                                  name="Square"
                                  color="bg-gray-50"
                                  onClick={() => onLinkSelect('square')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.yelp)}
                                  icon={<Image src="/links/yelp.svg" alt="Yelp" width={24} height={24} className="h-6 w-6" />}
                                  name="Yelp"
                                  color="bg-red-50"
                                  onClick={() => onLinkSelect('yelp')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Content' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Content</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.embedvideo)}
                                  icon={<Image src="/links/embeddedvideo.svg" alt="Embedded Video" width={24} height={24} className="h-6 w-6" />} 
                                  name="Embed Video" 
                                  color="bg-red-50" 
                                  onClick={() => onLinkSelect('embedded-video')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.textsection)}
                                  icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
                                  name="Text Section"
                                  color="bg-blue-50"
                                  onClick={() => onLinkSelect('text-section')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.file)}
                                  icon={<Image src={linkImages.file || "/links/file.svg"} alt="File" width={24} height={24} className="h-6 w-6" />}
                                  name="File"
                                  color="bg-gray-50"
                                  onClick={() => onLinkSelect('file')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.dropdown)}
                                  icon={<Image src="/links/dropDown.svg" alt="Dropdown" width={24} height={24} className="h-6 w-6" />}
                                  name="Dropdown"
                                  color="bg-gray-50"
                                  onClick={() => onLinkSelect('dropdown')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.featured)}
                                  icon={<Image src="/links/featured.svg" alt="Featured" width={24} height={24} className="h-6 w-6" />}
                                  name="Featured"
                                  color="bg-purple-50"
                                  onClick={() => onLinkSelect('featured')}
                                />
                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.customlink)}
                                  icon={<Image src={linkImages.website || "/links/safari.svg"} alt="Custom Link" width={24} height={24} className="h-6 w-6" />}
                                  name="Custom Link"
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('custom-link')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Real Estate' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Real Estate</h3>
                              <div className="grid grid-cols-3 gap-4">                                <LinkCard 
                              isvisible={!hasPermission(BigInt(userperm), BitPerms.zillow)}
                                  icon={<Image src="/links/zillow.svg" alt="Zillow" width={24} height={24} className="h-6 w-6" />} 
                                  name="Zillow" 
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('zillow')}
                                />
                                <LinkCard 
                                isvisible={!hasPermission(BigInt(userperm), BitPerms.embedvideo)}
                                  icon={<Image src="/links/embeddedvideo.svg" alt="Embedded Video" width={24} height={24} className="h-6 w-6" />} 
                                  name="Embed Video" 
                                  color="bg-red-50" 
                                  onClick={() => onLinkSelect('embedded-video')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Payment' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Payment</h3>
                              <div className="grid grid-cols-3 gap-4">                                <LinkCard 
                              isvisible={!hasPermission(BigInt(userperm), BitPerms.cashapp)}
                                  icon={<Image src="/links/cashapp.svg" alt="Cash App" width={24} height={24} className="h-6 w-6" />} 
                                  name="Cash App" 
                                  color="bg-green-50" 
                                  onClick={() => onLinkSelect('cashapp')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.venmo)}
                                  icon={<Image src="/links/venmo.svg" alt="Venmo" width={24} height={24} className="h-6 w-6" />} 
                                  name="Venmo" 
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('venmo')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.paypal)}
                                  icon={<Image src="/links/paypal.svg" alt="PayPal" width={24} height={24} className="h-6 w-6" />} 
                                  name="PayPal" 
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('paypal')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.zelle)}
                                  icon={<Image src="/links/zelle.svg" alt="Zelle" width={24} height={24} className="h-6 w-6" />} 
                                  name="Zelle" 
                                  color="bg-purple-50" 
                                  onClick={() => onLinkSelect('zelle')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Music' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Music</h3>
                              <div className="grid grid-cols-3 gap-4">                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.spotify)}
                                  icon={<Image src="/links/spotify.svg" alt="Spotify" width={24} height={24} className="h-6 w-6" />} 
                                  name="Spotify" 
                                  color="bg-green-50" 
                                  onClick={() => onLinkSelect('spotify')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.applemusic)}
                                  icon={<Image src="/links/apple.svg" alt="Apple Music" width={24} height={24} className="h-6 w-6" />} 
                                  name="Apple Music" 
                                  color="bg-pink-50" 
                                  onClick={() => onLinkSelect('apple-music')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.soundcloud)}
                                  icon={<Image src="/links/soundcloud.svg" alt="SoundCloud" width={24} height={24} className="h-6 w-6" />} 
                                  name="SoundCloud" 
                                  color="bg-orange-50" 
                                  onClick={() => onLinkSelect('soundcloud')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.podcats)}
                                  icon={<Image src="/links/podcasts.svg" alt="Podcasts" width={24} height={24} className="h-6 w-6" />} 
                                  name="Podcasts" 
                                  color="bg-purple-50" 
                                  onClick={() => onLinkSelect('podcasts')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'More' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">More</h3>
                              <div className="grid grid-cols-3 gap-4">                                <LinkCard
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.poshmark)}
                                  icon={<Image src="/links/poshmark.svg" alt="Poshmark" width={24} height={24} className="h-6 w-6" />} 
                                  name="Poshmark" 
                                  color="bg-red-50" 
                                  onClick={() => onLinkSelect('poshmark')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.mediakits)}
                                  icon={<Image src="/links/mediakits.svg" alt="MediaKits" width={24} height={24} className="h-6 w-6" />} 
                                  name="MediaKits" 
                                  color="bg-indigo-50" 
                                  onClick={() => onLinkSelect('mediakits')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.opensea)}
                                  icon={<Image src="/links/opensea_color.svg" alt="OpenSea" width={24} height={24} className="h-6 w-6" />} 
                                  name="OpenSea" 
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('opensea')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.hoobe)}
                                  icon={<Image src="/links/hoobe.svg" alt="hoo.be" width={24} height={24} className="h-6 w-6" />} 
                                  name="hoo.be" 
                                  color="bg-purple-50" 
                                  onClick={() => onLinkSelect('hoobe')}
                                />                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.linktree)}
                                  icon={<Image src="/links/linktree.svg" alt="Linktree" width={24} height={24} className="h-6 w-6" />} 
                                  name="Linktree" 
                                  color="bg-green-50" 
                                  onClick={() => onLinkSelect('linktree')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {activeCategory === 'Recommended' && (
                            <div>
                              <h3 className="text-sm font-semibold mb-4">Recommended</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <LinkCard isvisible={!hasPermission(BigInt(userperm), BitPerms.text)} icon={<MessageSquare className="h-5 w-5 text-green-500" />} name="Text" color="bg-green-100" onClick={() => onLinkSelect('text')} />
                                <LinkCard isvisible={!hasPermission(BigInt(userperm), BitPerms.email)} icon={<Mail className="h-5 w-5 text-blue-500" />} name="Email" color="bg-blue-100" onClick={() => onLinkSelect('email')} />
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.instagram)}
                                  icon={<Image src={linkImages.instagram || "/links/instagram.svg"} alt="Instagram" width={24} height={24} className="h-6 w-6" />} 
                                  name="Instagram" 
                                  color="bg-pink-50"
                                  onClick={() => onLinkSelect('instagram')}
                                />
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.website)}
                                  icon={<Image src="/globe.svg" alt="Website" width={24} height={24} className="h-6 w-6" />} 
                                  name="Website" 
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('website')}
                                />
                                <LinkCard 
                                  isvisible={!hasPermission(BigInt(userperm), BitPerms.linkedin)}
                                  icon={<Image src={linkImages.linkedIn || "/links/linkedin.svg"} alt="LinkedIn" width={24} height={24} className="h-6 w-6" />} 
                                  name="LinkedIn" 
                                  color="bg-blue-50" 
                                  onClick={() => onLinkSelect('linkedIn')}
                                />
                                <LinkCard isvisible={!hasPermission(BigInt(userperm), BitPerms.call)} icon={<Phone className="h-5 w-5 text-green-500" />} name="Call" color="bg-green-100" onClick={() => onLinkSelect('call')} />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </CustomScrollArea>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
