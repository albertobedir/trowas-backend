"use client";

import Image from "next/image";
import { ReactNode } from "react";

const BADGE_ICON =
  "/assets/cdn.prod.website-files.com/695982a53e42fad24a9984c4/695982a63e42fad24a998573_magic-wand.svg";

interface SupportPageShellProps {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function SupportPageShell({
  badge,
  title,
  subtitle,
  children,
}: SupportPageShellProps) {
  return (
    <div className="min-h-full w-full">
      <div className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-white via-[#f8fafc] to-[#eef2ff]/40">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 py-10 md:py-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 shadow-sm">
              <Image src={BADGE_ICON} alt="" width={16} height={16} />
              <span className="text-xs font-medium tracking-wide text-black/70">
                {badge}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-black/90 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/55 md:text-base">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 md:py-10">{children}</div>
    </div>
  );
}
