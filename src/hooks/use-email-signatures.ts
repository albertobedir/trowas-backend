import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Api } from "@/lib/api";

export interface EmailSignature {
  _id: string;
  name: string;
  html: string;
  css?: string;
  theme?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  teamId: string;
  settings?: {
    jobTitle?: string;
    companyName?: string;
    location?: string;
    phoneNumber?: string;
    email?: string;
    pronouns?: string;
    profilePic?: string;
    companyLogo?: string;
    bannerImage?: string;
    links?: Array<{ id: string; type: string; url: string }>;
    colorIcons?: boolean;
    disclaimer?: string;
    theme?: string;
  };
}

interface UseEmailSignaturesProps {
  teamId?: string;
  enabled?: boolean;
}

export function useEmailSignatures({ teamId, enabled = true }: UseEmailSignaturesProps = {}) {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignatures = useCallback(async () => {
    if (!teamId) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await Api.get(`/email-signature/get-all`);
      setSignatures(response.data.signatures);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch email signatures");
      console.error("Error fetching email signatures:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]); // teamId bağımlılığını ekle

  const createSignature = async (signatureData: Partial<EmailSignature>) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', 'New Email Signature');

      const response = await Api.post("/email-signature/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSignatures(prev => [response.data.signature, ...prev]);
      window.location.href = `/toolkit/mail-signature/${response.data.data._id}`;
      return response.data.signature;

    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create email signature");
      console.error("Error creating email signature:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignature = async (id: string, signatureData: Partial<EmailSignature>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/email-signatures/${id}`, signatureData);

      setSignatures(prev =>
        prev.map(sig => sig._id === id ? response.data.signature : sig)
      );

      return response.data.signature;
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update email signature");
      console.error("Error updating email signature:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSignature = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/email-signatures/${id}`);
      setSignatures(prev => prev.filter(sig => sig._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete email signature");
      console.error("Error deleting email signature:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && teamId) {
      fetchSignatures();
    }
  }, [teamId, enabled, fetchSignatures]);

  return {
    signatures,
    isLoading,
    error,
    fetchSignatures,
    createSignature,
    updateSignature,
    deleteSignature
  };
}
