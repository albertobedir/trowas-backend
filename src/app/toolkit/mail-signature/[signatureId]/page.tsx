"use client";

import React, { useEffect, useState } from "react";
import {
  EmailSignatureDocument,
  EmailSignatureForm,
} from "@/components/email-signature/email-signature-form";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { Api } from "@/lib/api";

export default function MailSignatureEditPage() {
  const router = useRouter();
  const params = useParams();
  const signatureId = params.signatureId as string;
  const [signature, setSignature] = useState<EmailSignatureDocument | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignature = async () => {
      if (!signatureId) return;

      try {
        setIsFetching(true);
        setFetchError(null);
        const response = await Api.get(`/email-signature/${signatureId}`);
        setSignature(response.data.signature);
      } catch (error) {
        console.error("Error fetching email signature:", error);
        setFetchError("Failed to load email signature.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSignature();
  }, [signatureId]);

  const handleSuccess = () => {
    router.push("/toolkit/mail-signature");
  };

  const handleCancel = () => {
    router.push("/toolkit/mail-signature");
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <PageLoader text="Loading signature..." />
      </div>
    );
  }

  if (fetchError || !signature) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 to-white px-4">
        <p className="text-muted-foreground">{fetchError || "Signature not found."}</p>
        <Button variant="outline" onClick={() => router.push("/toolkit/mail-signature")}>
          Back to signatures
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-white">
      <div className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/95 p-6 backdrop-blur-md">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/toolkit/mail-signature")}
            className="mr-4 rounded-xl p-2 transition-all duration-200 hover:scale-105 hover:bg-slate-100"
            aria-label="Back"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-2xl font-bold text-transparent">
              Edit Email Signature
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {signature.signatureName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid h-[calc(100vh-120px)] grid-cols-1 lg:grid-cols-2">
        <div className="modern-scrollbar overflow-y-auto border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50/30 p-6 pb-10">
          <EmailSignatureForm
            key={signatureId}
            signatureId={signatureId}
            initialSignature={signature}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>

        <div className="relative bg-gradient-to-br from-slate-50/50 to-white">
          <div className="sticky top-0 bg-white/80 p-6 backdrop-blur-sm">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-xl font-semibold text-transparent">
                  Signature Preview
                </h3>
                <div className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
              </div>
              <div
                id="signature-preview"
                className="min-h-[300px] rounded-xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
