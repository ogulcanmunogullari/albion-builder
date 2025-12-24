import React from "react";
import { MapPin, Clock, Type } from "lucide-react"; // Type ikonu başlık için eklendi

interface CompHeaderProps {
  title: string;
  setTitle: (val: string) => void;
  rallyPoint: string;
  setRallyPoint: (val: string) => void;
  eventTime: string;
  setEventTime: (val: string) => void;
  isLocked: boolean;
  // Hata durumlarını prop olarak alıyoruz
  errors?: {
    title: boolean;
    rally: boolean;
    time: boolean;
  };
}

export default function CompHeader({
  title,
  setTitle,
  rallyPoint,
  setRallyPoint,
  eventTime,
  setEventTime,
  isLocked,
  errors = { title: false, rally: false, time: false }, // Varsayılan değer
}: CompHeaderProps) {
  // Ortak input stili (Hata varsa border-red-500, yoksa border-slate-800)
  const getInputClass = (hasError: boolean) =>
    `w-full bg-slate-950 p-3 pl-10 rounded-xl border outline-none italic placeholder:text-slate-700 transition-colors ${
      hasError
        ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] text-red-100"
        : "border-slate-800 focus:border-yellow-500 text-slate-100"
    }`;

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
      {/* BAŞLIK ALANI (Artık diğerleri gibi) */}
      <div className="relative">
        <Type
          className={`absolute left-3 top-4.5 ${
            errors.title ? "text-red-500" : "text-slate-500"
          }`}
          size={18}
        />
        <input
          value={title}
          onChange={(e) => !isLocked && setTitle(e.target.value)}
          disabled={isLocked}
          className={`${getInputClass(
            errors.title
          )} text-lg font-black uppercase tracking-wide`}
          placeholder="ENTER EVENT TITLE..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RALLY POINT */}
        <div className="relative">
          <MapPin
            className={`absolute left-3 top-4 ${
              errors.rally ? "text-red-500" : "text-slate-500"
            }`}
            size={18}
          />
          <input
            value={rallyPoint}
            onChange={(e) => !isLocked && setRallyPoint(e.target.value)}
            disabled={isLocked}
            className={getInputClass(errors.rally)}
            placeholder="Enter Deployment Rally Point..."
          />
        </div>

        {/* EVENT TIME */}
        <div className="relative">
          <Clock
            className={`absolute left-3 top-4 ${
              errors.time ? "text-red-500" : "text-slate-500"
            }`}
            size={18}
          />
          <input
            value={eventTime}
            onChange={(e) => !isLocked && setEventTime(e.target.value)}
            disabled={isLocked}
            className={getInputClass(errors.time)}
            placeholder="Enter Event Time (e.g. 18:00 UTC)..."
          />
        </div>
      </div>
    </div>
  );
}
