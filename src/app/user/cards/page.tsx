"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, Plus, Search } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { Api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { isIndividualAccount } from "@/lib/account-type";

interface UserCardItem {
  _id: string;
  cardName?: string;
  name?: string;
  jobTitle?: string;
  company?: string;
  profilePicture?: string;
  coverPhoto?: string;
}

export default function UserCardsPage() {
  const router = useRouter();
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();
  const [cards, setCards] = useState<UserCardItem[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!user?._id) return;

      setIsLoadingCards(true);
      try {
        const response = await Api.get(`/user/${user._id}/card`);
        setCards(response.data?.userCards ?? []);
      } catch (error) {
        console.error("Error fetching cards:", error);
        setCards([]);
      } finally {
        setIsLoadingCards(false);
      }
    };

    if (!isUserLoading && user?._id) {
      fetchCards();
    }
  }, [isUserLoading, user?._id]);

  const filteredCards = cards.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.cardName?.toLowerCase().includes(query) ||
      card.name?.toLowerCase().includes(query) ||
      card.company?.toLowerCase().includes(query) ||
      card.jobTitle?.toLowerCase().includes(query)
    );
  });

  const handleCardClick = (index: number) => {
    router.push(`/team/members/${user?._id}?index=${index}`);
  };

  if (isUserLoading || isLoadingCards) {
    return <PageLoader />;
  }

  if (!isIndividualAccount(user)) {
    router.replace("/team/members");
    return <PageLoader />;
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kartlarınızı görüntüleyin ve düzenleyin
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/team/members/${user?._id}?index=${cards.length}`)
          }
          className="bg-black hover:bg-black/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kart
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kart ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz kart yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              İlk dijital kartvizitinizi oluşturarak başlayın
            </p>
            <Button
              onClick={() =>
                router.push(`/team/members/${user?._id}?index=0`)
              }
              className="bg-black hover:bg-black/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Kart Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, index) => (
            <button
              key={card._id}
              type="button"
              onClick={() => handleCardClick(index)}
              className="text-left group"
            >
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-black/20 cursor-pointer">
                <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200">
                  {card.coverPhoto && card.coverPhoto !== "/defaultcover.jpg" ? (
                    <Image
                      src={card.coverPhoto}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <CardContent className="p-4 pt-10 relative">
                  <div className="absolute -top-8 left-4">
                    <div className="h-16 w-16 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-sm">
                      <Image
                        src={card.profilePicture || "/defaultpp.png"}
                        alt={card.name || "Profile"}
                        width={64}
                        height={64}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base truncate group-hover:text-black">
                      {card.cardName || card.name || "İsimsiz Kart"}
                    </h3>
                    {card.jobTitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {card.jobTitle}
                      </p>
                    )}
                    {card.company && (
                      <p className="text-xs text-muted-foreground truncate">
                        {card.company}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
