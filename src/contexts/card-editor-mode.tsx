"use client";

import { createContext, useContext } from "react";

export type CardEditorMode = {
  isAdmin: boolean;
  memberId: string;
  cardIndex: string;
  backHref: string;
};

const CardEditorModeContext = createContext<CardEditorMode | null>(null);

export function CardEditorModeProvider({
  value,
  children,
}: {
  value: CardEditorMode;
  children: React.ReactNode;
}) {
  return (
    <CardEditorModeContext.Provider value={value}>
      {children}
    </CardEditorModeContext.Provider>
  );
}

export function useCardEditorMode() {
  return useContext(CardEditorModeContext);
}
