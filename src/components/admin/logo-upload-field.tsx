"use client";

import { useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

type LogoUploadFieldProps = {
  label?: string;
  value: string;
  preview: string | null;
  fileName?: string;
  fallbackImage?: string;
  onUrlChange: (value: string) => void;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
};

export function LogoUploadField({
  label = "Logo",
  value,
  preview,
  fileName,
  fallbackImage = "/defaultcompanylogo.png",
  onUrlChange,
  onFileSelect,
  onClearFile,
}: LogoUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <Image
          src={preview || value || fallbackImage}
          alt={label}
          width={64}
          height={64}
          className="h-16 w-16 rounded-lg border object-cover"
        />
        <div className="flex-1 space-y-2">
          <Input
            value={value}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
          />
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3.5 w-3.5" />
              Upload from Computer
            </Button>
            {fileName && (
              <>
                <span className="truncate text-xs text-slate-500">
                  {fileName}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearFile}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Enter a URL or upload from your device. Upload takes priority on
            save.
          </p>
        </div>
      </div>
    </div>
  );
}
