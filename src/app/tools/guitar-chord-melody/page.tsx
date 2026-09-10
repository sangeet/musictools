import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChordMelodyStudio from "@/components/ChordMelodyStudio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guitar Chord Melody & CAGED Studio | MusicTools",
  description: "Explore Guitar CAGED system voicings, movable chord inversions, and top-melody harmonization on an interactive 6-string fretboard.",
};

export default function GuitarChordMelodyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <ChordMelodyStudio initialInstrument="guitar" />
      </main>
      <Footer />
    </div>
  );
}
