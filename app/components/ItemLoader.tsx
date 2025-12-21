import React, { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react"; // Dönen ikonumuz

interface ItemLoaderProps {
  src: string;
  alt: string;
  size?: number; // width ve height için tek değer
  className?: string;
}

export default function ItemLoader({
  src,
  alt,
  size = 64,
  className = "",
}: ItemLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-black/20 rounded ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. Yükleniyor Animasyonu (Sadece isLoading true ise görünür) */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse z-10">
          <Loader2 className="animate-spin text-yellow-500" size={size / 2} />
        </div>
      )}

      {/* 2. Gerçek Resim */}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        unoptimized
        className={`object-contain transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        // 3. Resim yüklendiği an state'i güncelle
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)} // Hata olsa bile spinner döngüsünde kalmasın
      />
    </div>
  );
}
