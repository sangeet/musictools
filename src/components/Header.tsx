"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white dark:bg-black transition-all duration-200 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 ${scrolled ? "h-12" : "h-16"}`}
    >
      <div className="font-bold text-xl">
        <Link href="/" className="hover:underline text-inherit">Music Tools</Link>
      </div>
      <nav className="flex gap-4 items-center relative">
        <Link href="/" className="button font-medium">Home</Link>
        <div className="relative" ref={dropdownRef}>
          <button
            className="button font-medium"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            Tools
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
              <Link href="/tools/progressions" className="block px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700">Progressions</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
