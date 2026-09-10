import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-8 text-slate-500 text-xs text-center">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-medium text-slate-400">
          MusicTools &bull; Interactive suite for musicians, arrangers, and songwriters.
        </p>
        <p>
          Designed for modern web browsers &bull; Built with Next.js &amp; Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
