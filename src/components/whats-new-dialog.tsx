"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Update {
  id: string
  date: string
  title: string
  description: string
  read: boolean
}

interface UpdateStore {
  updates: Update[]
  markAsRead: (id: string) => void
  getUnreadCount: () => number
}

export const useUpdateStore = create<UpdateStore>()(
  persist(
    (set, get) => ({
      updates: [
        {
          id: '1',
          date: "21 Mart 2024",
          title: "Yeni Özellikler Eklendi",
          description: "Mail şablonları özelleştirilebilir hale getirildi. Kartvizit tarama sistemi geliştirildi.",
          read: false
        },
        {
          id: '2',
          date: "15 Mart 2024",
          title: "Performans İyileştirmeleri",
          description: "Sistem performansı artırıldı, sayfa yüklenme süreleri optimize edildi.",
          read: false
        },
        {
          id: '3',
          date: "10 Mart 2024",
          title: "Yeni Tasarım",
          description: "Kullanıcı arayüzü yenilendi, daha modern bir görünüm kazandırıldı.",
          read: false
        }
      ],
      markAsRead: (id: string) => 
        set((state) => ({
          updates: state.updates.map(update => 
            update.id === id ? { ...update, read: true } : update
          )
        })),
      getUnreadCount: () => get().updates.filter(update => !update.read).length,
    }),
    {
      name: 'updates-storage',
      skipHydration: true,
    }
  )
)

interface WhatsNewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsNewDialog({ open, onOpenChange }: WhatsNewDialogProps) {
  const { updates, markAsRead } = useUpdateStore()

  // Handle click on update item
  const handleUpdateClick = (id: string) => {
    markAsRead(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" aria-describedby="whats-new-description">
        <DialogHeader>
          <DialogTitle>Neler Eklendi?</DialogTitle>
          <DialogDescription id="whats-new-description">
            Recent updates and new features added to the application.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className={`relative pl-6 before:absolute before:left-0 before:top-[14px] before:h-2 before:w-2 before:rounded-full 
                  transition-opacity duration-200 ease-in-out cursor-pointer hover:opacity-80
                  ${update.read 
                    ? 'before:bg-sidebar-border opacity-70' 
                    : 'before:bg-sidebar-primary before:animate-pulse'}`}
                onClick={() => handleUpdateClick(update.id)}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {update.date}
                </div>
                <h3 className="font-medium leading-snug mb-1">
                  {update.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {update.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}