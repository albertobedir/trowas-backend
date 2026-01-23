import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SubteamDropdown } from "@/components/ui/SubteamDropdown"
import { use } from "react"
import { LuUsers } from "react-icons/lu";

interface Subteam {
  id: string
  name: string
  avatar: string
  members: string[] // user ID'lerinin listesi
}

interface TeamSelectorButtonProps {
  avatarSrc?: string
  subteams: Subteam[]
  onSelect?: (selected: string[]) => void
  userd?: string
}

export function TeamSelectorButton({
  avatarSrc,
  subteams,
  userd,
  onSelect,
}: TeamSelectorButtonProps) {
  console.log(userd);
  return (
    <div className="flex items-center gap-2 px-2 py-1 w-16 rounded-full border bg-background shadow-sm">
      <SubteamDropdown subteams={subteams} userd={userd} />
    </div>
  )
}
