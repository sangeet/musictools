import React from "react";
import Header from "@/components/Header";
import UkuleleArrangerStudio from "@/components/UkuleleArrangerStudio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Ukulele Chord-Melody Arranger | MusicTools",
  description: "Drop any chord chart and lyrics. Uses Gemini AI and CAGFD theory solver to automatically generate playable ukulele chord-melody arrangements.",
};

export default function UkuleleArrangerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UkuleleArrangerStudio />
      </main>
    </div>
  );
}
