"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Target,
} from "lucide-react";

type LeadListItem = {
  _id: string;
  title: string;
  email?: string;
  phone?: string;
  type?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    profileImage?: string;
  } | null;
  team?: {
    _id: string;
    name: string;
  } | null;
};

type TeamOption = {
  _id: string;
  name: string;
};

type SortBy = "createdAt" | "userName" | "title";
type SortOrder = "asc" | "desc";

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [teamId, setTeamId] = useState("all");
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
  }, [debouncedSearch, teamId]);

  useEffect(() => {
    fetch("/api/admin/teams?limit=100&sortBy=name&sortOrder=asc")
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) setTeams(data.teams);
      })
      .catch(console.error);
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        teamId,
        sortBy,
        sortOrder,
        page: String(page),
        limit: "20",
      });

      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLeads(data.leads);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, teamId, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "createdAt" ? "desc" : "asc");
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
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
        <p className="mt-1 text-slate-600">
          Veritabanında {total} lead kaydı
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <div className="lg:col-span-2">
            <Label
              htmlFor="search"
              className="mb-1.5 block text-xs text-slate-500"
            >
              Ara
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="search"
                placeholder="İsim, e-posta, telefon veya şirkete göre ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">Takım</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Takımlar</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  onClick={() => toggleSort("title")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Lead
                  <SortIcon column="title" />
                </button>
              </TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("userName")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Yakalayan
                  <SortIcon column="userName" />
                </button>
              </TableHead>
              <TableHead>Takım</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Oluşturulma
                  <SortIcon column="createdAt" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-slate-500"
                >
                  Lead kayıtları yükleniyor...
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-slate-500"
                >
                  Kriterlere uygun lead bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead._id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/dashboard/leads/${lead._id}`)
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                        <Target className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="font-medium text-slate-900">{lead.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {lead.email || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {lead.phone || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {lead.type || "—"}
                  </TableCell>
                  <TableCell>
                    {lead.user ? (
                      <div className="flex items-center gap-2">
                        <Image
                          src={lead.user.profileImage || "/defaultpp.png"}
                          alt={lead.user.name}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <span className="text-sm">{lead.user.name}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {lead.team?.name || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
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
  );
}
