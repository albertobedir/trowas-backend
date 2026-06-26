"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Search, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

type MemberItem = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  roles?: { teamRole?: string };
};

export function SubteamMembersEditor({
  subTeamId,
  members,
  availableMembers,
  onUpdated,
}: {
  subTeamId: string;
  members: MemberItem[];
  availableMembers: MemberItem[];
  onUpdated: (data: {
    members: MemberItem[];
    availableMembers: MemberItem[];
  }) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedInSubteam, setSelectedInSubteam] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const filter = (list: MemberItem[]) => {
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term),
    );
  };

  const filteredInSubteam = useMemo(
    () => filter(members),
    [members, search],
  );
  const filteredAvailable = useMemo(
    () => filter(availableMembers),
    [availableMembers, search],
  );

  const toggle = (id: string, inSubteam: boolean) => {
    if (inSubteam) {
      setSelectedInSubteam((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelectedAvailable((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
  };

  const handleUpdate = async () => {
    if (selectedInSubteam.length === 0 && selectedAvailable.length === 0) {
      toast.error("Select members to add or remove");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subteams/${subTeamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          add: selectedAvailable,
          remove: selectedInSubteam,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      onUpdated({
        members: data.members,
        availableMembers: data.availableMembers,
      });
      setSelectedInSubteam([]);
      setSelectedAvailable([]);
      toast.success("Members updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update members",
      );
    } finally {
      setSaving(false);
    }
  };

  const MemberTable = ({
    title,
    count,
    list,
    selected,
    inSubteam,
  }: {
    title: string;
    count: number;
    list: MemberItem[];
    selected: string[];
    inSubteam: boolean;
  }) => (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
        <h4 className="text-sm font-semibold text-slate-900">
          {title}{" "}
          <span className="font-normal text-slate-500">({count})</span>
        </h4>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={list.length > 0 && selected.length === list.length}
            onChange={(e) => {
              const ids = list.map((m) => m._id);
              if (inSubteam) {
                setSelectedInSubteam(e.target.checked ? ids : []);
              } else {
                setSelectedAvailable(e.target.checked ? ids : []);
              }
            }}
            className="h-4 w-4 rounded"
          />
          Select all
        </label>
      </div>
      <Table>
        <TableBody>
          {list.length === 0 ? (
            <TableRow>
              <TableCell className="py-8 text-center text-sm text-slate-500">
                No members found
              </TableCell>
            </TableRow>
          ) : (
            list.map((member) => (
              <TableRow key={member._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(member._id)}
                      onChange={() => toggle(member._id, inSubteam)}
                      className="h-4 w-4 rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/admin/dashboard/users/${member._id}`)
                      }
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <Image
                        src={member.profileImage || "/defaultpp.png"}
                        alt={member.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs capitalize text-slate-500">
                  {member.roles?.teamRole || "member"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-amber-500 text-slate-900 hover:bg-amber-400"
        >
          {saving ? "Updating..." : "Update Members"}
        </Button>
      </div>

      <p className="text-sm text-slate-500">
        Select members on the left to remove from sub-team, or on the right to
        add. Then click Update Members.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <UserMinus className="h-4 w-4" />
            In Sub-team
          </div>
          <MemberTable
            title="Part of Sub-team"
            count={filteredInSubteam.length}
            list={filteredInSubteam}
            selected={selectedInSubteam}
            inSubteam
          />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <UserPlus className="h-4 w-4" />
            Available from Team
          </div>
          <MemberTable
            title="Not in Sub-team"
            count={filteredAvailable.length}
            list={filteredAvailable}
            selected={selectedAvailable}
            inSubteam={false}
          />
        </div>
      </div>
    </div>
  );
}
