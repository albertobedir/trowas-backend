import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { LuUsers } from "react-icons/lu";
import { Api } from "@/lib/api" // api.patch() için api import'u

interface Subteam {
  id: string
  name: string
  avatar: string
  members: string[]
}

interface SubteamDropdownProps {
  subteams: Subteam[]
  userd?: string
}

export function SubteamDropdown({ subteams, userd }: SubteamDropdownProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (userd) {
      const initiallySelected = subteams
        .filter((team) => team.members?.includes(userd))
        .map((team) => team.id)
      setSelected(initiallySelected)
    }
  }, [subteams, userd])

  const handleToggle = async (id: string, isChecked: boolean) => {
    setSelected((prev) =>
      isChecked ? [...prev, id] : prev.filter((s) => s !== id)
    )

    try {
      if (isChecked) {
        // Kullanıcı ekleniyor
        await Api.post(`/subteam/${id}/assign`, { add: [userd] })
      } else {
        // Kullanıcı çıkarılıyor
        await Api.post(`/subteam/${id}/assign`, { remove: [userd] })
      }
    } catch (error) {
      console.error("İstek sırasında hata oluştu:", error)
    }
  }

  const filtered = subteams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="ml-auto h-8 w-12 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center gap-1.5"
        >
          <LuUsers className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 p-4 rounded-xl shadow-xl space-y-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full bg-muted text-sm"
        />

        <div className="max-h-60 overflow-y-auto space-y-2">
          {filtered.map((team) => {
            const isChecked = selected.includes(team.id)
            return (
              <div
                key={team.id}
                className="flex items-center justify-between px-2 py-1 hover:bg-accent rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={team.avatar} />
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{team.name}</span>
                </div>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggle(team.id, Boolean(checked))
                  }
                />
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
