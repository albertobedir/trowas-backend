"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onPasswordReset: (newPassword: string) => Promise<void>;
  userEmail?: string;
}

interface PasswordRequirement {
  text: string;
  regex: RegExp;
  met: boolean;
}

export function PasswordResetDialog({
  isOpen,
  onPasswordReset,
  userEmail
}: PasswordResetDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Şifre gereksinimleri
  const passwordRequirements: PasswordRequirement[] = [
    {
      text: "En az 8 karakter",
      regex: /.{8,}/,
      met: newPassword.length >= 8
    },
    {
      text: "En az 1 büyük harf",
      regex: /[A-Z]/,
      met: /[A-Z]/.test(newPassword)
    },
    {
      text: "En az 1 küçük harf", 
      regex: /[a-z]/,
      met: /[a-z]/.test(newPassword)
    },
    {
      text: "En az 1 rakam",
      regex: /[0-9]/,
      met: /[0-9]/.test(newPassword)
    },
    {
      text: "En az 1 özel karakter (!@#$%^&*)",
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
    }
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await onPasswordReset(newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}} // Kapatmayı engellemek için boş fonksiyon
      modal
    >
      <DialogContent 
        className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()} // Dışarı tıklamayı engellemek için
        onEscapeKeyDown={(e) => e.preventDefault()} // Escape tuşunu engellemek için
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Yeni Şifre Oluştur
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Güvenliğiniz için lütfen güçlü bir şifre oluşturun. Bu işlem zorunludur ve devam etmek için gereklidir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Kullanıcı email bilgisi (varsa) */}
          {userEmail && (
            <div className="text-sm text-gray-500 text-center">
              Hesap: {userEmail}
            </div>
          )}

          {/* Yeni Şifre */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifrenizi girin"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Şifre Gereksinimleri */}
          {newPassword && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Şifre Gereksinimleri:</Label>
              <div className="space-y-1">
                {passwordRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {requirement.met ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={cn(
                      requirement.met ? "text-green-600" : "text-gray-500"
                    )}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Şifre Onayı */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Onayı</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-500">Şifreler eşleşmiyor</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="text-sm text-green-500 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Şifreler eşleşiyor
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Şifre Güncelleniyor...
              </div>
            ) : (
              "Şifreyi Güncelle"
            )}
          </Button>

          {/* Reset Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleReset}
            disabled={isLoading}
          >
            Temizle
          </Button>
        </form>

        {/* Güvenlik Uyarısı */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Güvenlik İpucu:</strong> Şifrenizi kimseyle paylaşmayın ve güvenli bir yerde saklayın. 
            Bu şifre hesabınızın güvenliği için kritik öneme sahiptir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
