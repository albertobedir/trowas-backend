"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

type TeamListItem = {
  _id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  subteamCount: number;
  owner?: { _id: string; name: string; email: string };
  teamSettings?: { customSubdomain?: string; logo?: string };
};

type SortBy = "name" | "createdAt" | "memberCount";
type SortOrder = "asc" | "desc";

export default function AdminTeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        sortBy,
        sortOrder,
        page: String(page),
        limit: "20",
      });

      const res = await fetch(`/api/admin/teams?${params}`);
      const data = await res.json();

      if (res.ok) {
        setTeams(data.teams);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortBy }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-400" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-amber-600" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-amber-600" />
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Teams</h2>
        <p className="mt-1 text-slate-600">
          {total} team{total !== 1 ? "s" : ""} in the database
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:items-end">
          <div>
            <Label htmlFor="search" className="mb-1.5 block text-xs text-slate-500">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="search"
                placeholder="Search by name, subdomain, or email domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Team Name
                  <SortIcon column="name" />
                </button>
              </TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("memberCount")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Members
                  <SortIcon column="memberCount" />
                </button>
              </TableHead>
              <TableHead>Sub-teams</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Created
                  <SortIcon column="createdAt" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  Loading teams...
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  No teams found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow
                  key={team._id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/dashboard/teams/${team._id}`)
                  }
                >
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-slate-600">
                    {team.owner?.name || "—"}
                    {team.owner?.email && (
                      <span className="block text-xs text-slate-400">
                        {team.owner.email}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {team.teamSettings?.customSubdomain || "—"}
                  </TableCell>
                  <TableCell>{team.memberCount}</TableCell>
                  <TableCell>{team.subteamCount}</TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(team.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
