"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function connectlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
  );
}