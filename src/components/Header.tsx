"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function ToolsDropdown({ open, setOpen, dropdownRef }: { open: boolean, setOpen: (v: boolean) => void, dropdownRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, dropdownRef, setOpen]);

  return (
    <div className="relative" ref={dropdownRef as React.RefObject<HTMLDivElement>}>
      <button
        className="button font-medium"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Tools
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
          <Link href="/tools/progressions" className="block px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700">Progressions</Link>
        </div>
      )}
    </div>
  );
}

function UserDropdown({ user, open, setOpen }: { user: any, open: boolean, setOpen: (v: boolean) => void }) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-lg text-gray-700 dark:text-gray-100 focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        title={user.user_metadata?.full_name || user.email}
      >
        {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
          <button
            className="block w-full px-4 py-2 text-left text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700"
            onClick={async () => {
              await supabase.auth.signOut();
              setOpen(false);
            }}
          >Logout</button>
        </div>
      )}
    </div>
  );
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white dark:bg-black transition-all duration-200 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 ${scrolled ? "h-12" : "h-16"}`}
    >
      <div className="font-bold text-xl">
        <Link href="/" className="hover:underline text-inherit">Music Tools</Link>
      </div>
      <nav className="flex gap-4 items-center relative">
        <Link href="/" className="button font-medium">Home</Link>
        <ToolsDropdown open={toolsDropdownOpen} setOpen={setToolsDropdownOpen} dropdownRef={toolsDropdownRef} />
        {/* Auth UI */}
        {!user ? (
          <Link href="/auth" className="button font-medium">Login</Link>
        ) : (
          <UserDropdown user={user} open={userDropdownOpen} setOpen={setUserDropdownOpen} />
        )}
      </nav>
    </header>
  );
};

export default Header;
