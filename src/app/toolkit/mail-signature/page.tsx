"use client"

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePageLoading } from "@/hooks/use-page-loading";
import { EmailSignatureDialog } from "@/components/email-signature/email-signature-dialog";
import { ManageMembersDialog } from "@/components/email-signature/manage-members-dialog";
import { useTeamMembersStore } from '@/store/team-members-store';
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Api } from "@/lib/api";

// Mock data for email signatures
interface EmailSignature {
  updatedAt: string;
  users: any;
  createdAt: string;
  signatureName: string;
  _id: string;
  dateCreated: string;
  lastModified: string;
  assignedMembers: number;
  previewImage?: string;
}

// Mock data for team members
interface Member {
  _id: string | null | undefined;
  name: string;
  email: string;
  profileImage?: string;
}


export default function MailSignaturePage() {
  const isLoading = usePageLoading();
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const { members, fetchMembers } = useTeamMembersStore();
    useEffect(() => {
      fetchMembers();
  
    }, [fetchMembers]);
  // Mock team ID for demonstration
  const teamId = "team123";
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleSignatureCreated = () => {
    // In a real app, we would refresh the signatures from the API
    console.log("Signature created, should refresh data");
  };

  const handleUpdateMembers = async (signatureId: string, updatedMembers: Member[]) => {
    try {
      // Get current signature data to compare
      const response = await Api.get(`/email-signature/${signatureId}`);
      const currentMembers = response.data.signature.users || [];

      // Find added and removed members
      const add = updatedMembers.filter(member => 
        !currentMembers.some((current: any) => current._id === member._id)
      ).map(member => member._id);

      const remove = currentMembers
        .filter((current: any) => !updatedMembers.some(member => member._id === current._id))
        .map((member: any) => member._id);

      // Only make the API call if there are changes
      if (add.length > 0 || remove.length > 0) {
        await Api.patch(`/email-signature/${signatureId}/assign`, {
          add,
          remove
        });
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Error updating members:', error);
      return Promise.reject(error);
    }
  };
  useEffect(() => {
    Api.get("/email-signature/get-all").then(response => {
      setSignatures(response.data.signatures || []);
    });
  }, []);
  const handleSignatureClick = (signatureId: string) => {
    router.push(`/toolkit/mail-signature/${signatureId}`);
  };
  
  if (isLoading) {
    return <PageSkeleton variant="simple" />;
  }
  console.log("Signatures:", signatures);
  return (
    <div className="container mx-auto py-6 px-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Email Signature Templates <span className="text-sm text-gray-400">({signatures.length})</span></h1>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm rounded-full">
            Set Up Email Integrations
          </Button>
          <EmailSignatureDialog 
            teamId={teamId}
            onSuccess={handleSignatureCreated}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader className="">
            <TableRow className="bg-gray-50 ">
              <TableHead className="w-[400px]">Signature Name</TableHead>
              <TableHead className="cursor-pointer" onClick={toggleSortDirection}>
                Date Created
                {sortDirection === "asc" ? <ChevronUp className="inline ml-1" size={14} /> : <ChevronDown className="inline ml-1" size={14} />}
              </TableHead>
              <TableHead>Assigned members</TableHead>
              <TableHead className="text-right">Assign members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signatures.map((signature) => (
              <TableRow key={signature._id} className="hover:bg-gray-50">
                <TableCell className="cursor-pointer" onClick={() => handleSignatureClick(signature._id)}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 border rounded flex items-center justify-center bg-gray-50">
                      {signature.previewImage ? (
                        <Image src={signature.previewImage} alt={signature.signatureName} width={40} height={30} />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{signature.signatureName}</p>
                      <p className="text-xs text-gray-500">Last modified: {signature.updatedAt}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="cursor-pointer" onClick={() => handleSignatureClick(signature._id)}>{signature.createdAt}</TableCell>
                <TableCell className="cursor-pointer" onClick={() => handleSignatureClick(signature._id)}>{signature.users.length} members</TableCell>
                <TableCell className="text-right">
                  <ManageMembersDialog
                    signatureId={signature._id}
                    signatureName={signature.signatureName}
                    currentMembers={members.slice(0, signature.users.length)}
                    allTeamMembers={members}
                    onSave={(members) => handleUpdateMembers(signature._id, members)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}