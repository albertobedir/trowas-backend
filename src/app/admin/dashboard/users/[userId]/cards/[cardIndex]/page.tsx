"use client";

import { useParams } from "next/navigation";
import MemberDetailPage from "@/app/team/members/[memberId]/page";
import { CardEditorModeProvider } from "@/contexts/card-editor-mode";

export default function AdminUserCardEditPage() {
  const { userId, cardIndex } = useParams<{
    userId: string;
    cardIndex: string;
  }>();

  return (
    <CardEditorModeProvider
      value={{
        isAdmin: true,
        memberId: userId,
        cardIndex,
        backHref: `/admin/dashboard/users/${userId}/cards`,
      }}
    >
      <MemberDetailPage />
    </CardEditorModeProvider>
  );
}
