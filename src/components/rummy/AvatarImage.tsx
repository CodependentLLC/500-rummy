"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  name: string;
  className?: string;
  fallbackSrc?: string;
};

export function AvatarImage({ src, name, className = "", fallbackSrc }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setCurrentSrc(src); setFailed(false); }, [src]);
  if (failed) return <span className={`${className} avatar-fallback`}>{name.slice(0, 1)}</span>;
  return <img className={className} src={currentSrc} alt={name}
    onError={() => {
      if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      else setFailed(true);
    }} />;
}
