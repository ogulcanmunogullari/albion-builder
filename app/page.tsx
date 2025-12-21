import Link from "next/link";
import { PlusCircle, Search, Shield, Share2, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4 space-y-12">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
          Master Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-700">
            Albion Compositions
          </span>
        </h1>
        <p className="text-slate-400 text-lg lg:text-xl font-medium">
          Create, manage, and share professional team builds for Albion Online.
        </p>
      </div>

      <div className="flex flex-col sm:row gap-4 w-full max-w-md">
        <Link
          href="/create"
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 px-8 rounded-2xl transition-all text-lg"
        >
          <PlusCircle size={24} /> Create New Comp
        </Link>
        <Link
          href="/search"
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-white font-black py-4 px-8 rounded-2xl transition-all text-lg"
        >
          <Search size={24} /> Browse Comps
        </Link>
      </div>
    </div>
  );
}
