import { Coins } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 text-center text-slate-600 text-sm pb-8">
      <p className="flex items-center justify-center gap-2">
        <Coins size={16} className="text-yellow-600" />
        For donation, use in-game mail or dm on{" "}
        <span className="text-yellow-600 font-bold">Europe Server</span> to{" "}
        <span className="text-slate-300 font-bold">KOMANDO35</span>
      </p>
    </footer>
  );
}
