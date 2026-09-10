import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Practical Tools for <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Musicians</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Eliminate cognitive friction when arranging songs and practicing. Instant inversions, interactive fretboards, and chord-melody harmonization.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Tool #1: Ukulele Chord Melody Studio */}
          <Link
            href="/tools/ukulele-chord-melody"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
                🌴
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  Ukulele Chord Melody Studio
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Interactive CAGFD inversion navigator with a dedicated top-melody filter, realistic G-C-E-A fretboard visualizer, and acoustic strum audio.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">CAGFD System</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Top Melody Filter</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Web Audio Strum</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">High-G / Low-G</span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Open Ukulele Studio</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Tool #2: Guitar Chord Melody Studio */}
          <Link
            href="/tools/guitar-chord-melody"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
                🎸
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  Guitar Chord Melody Studio
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Master CAGED system positions, movable chord inversions, and top-melody note targeting across standard 6-string tuning (E-A-D-G-B-E).
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">CAGED System</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Top Melody Filter</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">6-String Fretboard</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Warm Guitar Audio</span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Open Guitar Studio</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Tool #3: AI Ukulele Chord-Melody Arranger */}
          <Link
            href="/tools/ukulele-arranger"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between md:col-span-2"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
                ✨
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>AI Ukulele Chord-Melody Arranger</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                    Gemini Powered
                  </span>
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Paste any chord chart and lyrics. Gemini automatically extracts the vocal melody contour, while our fretboard engine solves ergonomic chord-melody shapes with audio playback.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Auto Melody Alignment</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">CAGFD Chord Solver</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Interactive Tabs</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">Strum &amp; Song Player</span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Try AI Arranger</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
