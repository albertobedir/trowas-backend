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
} from "lucide-react";

type UserListItem = {
  _id: string;
  name: string;
  email: string;
  username: string;
  accountType: "individual" | "corporate";
  isVipMember: boolean;
  profileImage?: string;
  createdAt: string;
  uniqueUrlName?: string;
  roles?: { userRole?: string };
};

type SortBy = "name" | "email" | "createdAt" | "accountType" | "username";
type SortOrder = "asc" | "desc";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountType, setAccountType] = useState("all");
  const [userRole, setUserRole] = useState("all");
  const [isVipMember, setIsVipMember] = useState("all");
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
  }, [debouncedSearch, accountType, userRole, isVipMember]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        accountType,
        userRole,
        isVipMember,
        sortBy,
        sortOrder,
        page: String(page),
        limit: "20",
      });

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    accountType,
    userRole,
    isVipMember,
    sortBy,
    sortOrder,
    page,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        <h2 className="text-2xl font-bold text-slate-900">Kullanıcılar</h2>
        <p className="mt-1 text-slate-600">
          Veritabanında {total} kullanıcı
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="mb-1.5 block text-xs text-slate-500">
              Ara
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="search"
                placeholder="İsim, e-posta veya kullanıcı adına göre ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">
              Hesap Türü
            </Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="individual">Bireysel</SelectItem>
                <SelectItem value="corporate">Kurumsal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">
              Kullanıcı Rolü
            </Label>
            <Select value={userRole} onValueChange={setUserRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-slate-500">
              VIP Durumu
            </Label>
            <Select value={isVipMember} onValueChange={setIsVipMember}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Sadece VIP</SelectItem>
                <SelectItem value="false">VIP Olmayan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  İsim
                  <SortIcon column="name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("email")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  E-posta
                  <SortIcon column="email" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("username")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Kullanıcı Adı
                  <SortIcon column="username" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("accountType")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Tür
                  <SortIcon column="accountType" />
                </button>
              </TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>VIP</TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="flex items-center font-medium hover:text-slate-900"
                >
                  Katılım
                  <SortIcon column="createdAt" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  Kullanıcılar yükleniyor...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  Kriterlere uygun kullanıcı bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/admin/dashboard/users/${user._id}`)
                  }
                >
                  <TableCell>
                    <Image
                      src={user.profileImage || "/defaultpp.png"}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell className="text-slate-600">
                    {user.username || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.accountType === "corporate"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.accountType}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize text-slate-600">
                    {user.roles?.userRole || "user"}
                  </TableCell>
                  <TableCell>
                    {user.isVipMember ? (
                      <span className="text-amber-600">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(user.createdAt)}
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
