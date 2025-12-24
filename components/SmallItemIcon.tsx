import React from "react";
import ItemLoader from "@/components/ItemLoader";

const SmallItemIcon = React.memo(
  ({ id, name }: { id: string; name: string }) => {
    if (!id) return null;
    return (
      <div className="w-10 h-10 bg-slate-950 rounded border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group">
        <ItemLoader
          src={`https://render.albiononline.com/v1/item/${id}?quality=4`}
          alt={name}
          size={40}
        />
        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30 font-bold border border-slate-700 shadow-xl italic uppercase">
          {name}
        </div>
      </div>
    );
  }
);
SmallItemIcon.displayName = "SmallItemIcon";

export default SmallItemIcon;
