"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, ChevronRight } from "lucide-react";

type UserCardListItem = {
  _id: string;
  cardName?: string;
  name?: string;
  jobTitle?: string | null;
  profilePicture?: string;
  cardLayout?: string;
  createdAt?: string;
};

export default function AdminUserCardsListPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [cards, setCards] = useState<UserCardListItem[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const [cardsRes, userRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}/cards`),
        fetch(`/api/admin/users/${userId}`),
      ]);
      const cardsData = await cardsRes.json();
      const userData = await userRes.json();

      if (cardsRes.ok) setCards(cardsData.cards || []);
      if (userRes.ok) setUserName(userData.name || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/dashboard/users/${userId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">User Cards</h2>
        <p className="mt-1 text-slate-600">
          {userName ? `${userName} · ` : ""}
          {cards.length} card{cards.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500 shadow-sm">
          Loading cards...
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <CreditCard className="mx-auto mb-3 h-8 w-8 text-slate-400" />
          <p className="text-slate-600">No cards found for this user.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {cards.map((card, index) => (
            <button
              key={card._id}
              type="button"
              onClick={() =>
                router.push(`/admin/dashboard/users/${userId}/cards/${index}`)
              }
              className="flex w-full items-center justify-between rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50/30"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={card.profilePicture || "/defaultpp.png"}
                  alt={card.cardName || card.name || "Card"}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div>
                  <p className="font-semibold text-slate-900">
                    {card.cardName || card.name || `Card ${index + 1}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {card.jobTitle || "No job title"} · {card.cardLayout || "—"}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">
                    {card._id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{formatDate(card.createdAt)}</span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
