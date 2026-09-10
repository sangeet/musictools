"use client";

import Link from "next/link";
import React, { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg shadow-md shadow-amber-900/20 group-hover:scale-105 transition-transform">
            🌴
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-tight leading-tight group-hover:text-amber-400 transition-colors">
              MusicTools
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Musician&apos;s Workbench
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition-colors"
          >
            All Tools
          </Link>
          <Link
            href="/tools/ukulele-chord-melody"
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <span>Ukulele</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              CAGFD
            </span>
          </Link>
          <Link
            href="/tools/guitar-chord-melody"
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <span>Guitar</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              CAGED
            </span>
          </Link>
          <Link
            href="/tools/ukulele-arranger"
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <span>AI Arranger</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ✨ Beta
            </span>
          </Link>
          <a
            href="https://github.com/sangeet/musictools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </a>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-white text-sm"
          >
            All Tools
          </Link>
          <Link
            href="/tools/ukulele-chord-melody"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-amber-400 hover:bg-slate-900 text-sm font-semibold"
          >
            Ukulele Chord Melody (CAGFD)
          </Link>
          <Link
            href="/tools/guitar-chord-melody"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-amber-400 hover:bg-slate-900 text-sm font-semibold"
          >
            Guitar Chord Melody (CAGED)
          </Link>
          <Link
            href="/tools/ukulele-arranger"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-amber-400 hover:bg-slate-900 text-sm font-semibold flex items-center justify-between"
          >
            <span>AI Ukulele Arranger</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ✨ Beta
            </span>
          </Link>
          <a
            href="https://github.com/sangeet/musictools"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-900 text-sm"
          >
            GitHub
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
