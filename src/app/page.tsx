import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
            <span>✨</span>
            <span>Interactive Music Theory &amp; Arrangement Suite</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Practical Tools for <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Musicians</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Eliminate cognitive friction when arranging songs and practicing. Instant inversions, interactive fretboards, and chord-melody harmonization.
          </p>
        </div>

        {/* Tools Catalog */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Featured Tools</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">1 Tool Live</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tool #1: Ukulele Chord Melody Studio */}
            <Link
              href="/tools/ukulele-chord-melody"
              className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
                    🌴
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold">
                    Live
                  </span>
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
                <span>Open Studio</span>
                <span>&rarr;</span>
              </div>
            </Link>

            {/* Future Tool Placeholder 1 */}
            <div className="border border-slate-800/60 bg-slate-900/30 rounded-2xl p-6 flex flex-col justify-between opacity-75">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    🎸
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                    In Development
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-300">Guitar CAGED Navigator</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Master triad inversions, spread voicings, and CAGED box positions across the 6-string fretboard with melody-first harmonization.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-500 text-xs font-mono">CAGED</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-500 text-xs font-mono">Drop-2 &amp; Drop-3</span>
                </div>
              </div>
            </div>

            {/* Future Tool Placeholder 2 */}
            <div className="border border-slate-800/60 bg-slate-900/30 rounded-2xl p-6 flex flex-col justify-between opacity-75">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    ⭕
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                    Planned
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-300">Circle of Fifths &amp; Modal Hub</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    Interactive key wheel with secondary dominants, tritone substitutions, and modal borrowing visualizer.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-500 text-xs font-mono">Modal Interchange</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-500 text-xs font-mono">Harmonic Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
