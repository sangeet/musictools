import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UkuleleChordMelody from "@/components/UkuleleChordMelody";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ukulele Chord Melody Studio (CAGFD System) | MusicTools",
  description: "Find chord inversions, movable CAGFD shapes, and match voicings to top melody notes for ukulele chord melody arrangements.",
};

export default function UkuleleChordMelodyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <UkuleleChordMelody />
      </main>
      <Footer />
    </div>
  );
}
