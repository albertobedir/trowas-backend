"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Lock, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [rootNumber, setRootNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rootNumber, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Giriş başarısız");
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Giriş başarısız. Kök numaranızı ve şifrenizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900/80 text-white shadow-2xl backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
            <Shield className="h-7 w-7 text-amber-400" />
          </div>
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Rol Card"
              width={120}
              height={40}
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Girişi</CardTitle>
          <CardDescription className="text-slate-400">
            Yönetim paneline erişmek için bilgilerinizi girin
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="rootNumber" className="text-sm text-slate-300">
                Kök Numara
              </label>
              <Input
                id="rootNumber"
                type="text"
                inputMode="numeric"
                placeholder="873462837"
                value={rootNumber}
                onChange={(e) => setRootNumber(e.target.value)}
                className="border-slate-600 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-slate-300">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-600 bg-slate-800 pr-10 text-white placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400"
              disabled={loading}
            >
              {loading ? (
                "Giriş yapılıyor..."
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Giriş Yap
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
