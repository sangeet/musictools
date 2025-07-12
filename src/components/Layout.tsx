import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1 w-full mx-auto max-w-6xl px-4 py-8">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
