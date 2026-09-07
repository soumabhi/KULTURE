"use client";

import Image from "next/image";

export default function LogoStatic() {
  return (
    <div className="flex justify-center items-center">
      <Image
        src="/kultur.png"
        alt="Kultur"
        width={220}
        height={88}
        priority
        draggable={false}
        className="block h-auto w-auto"
      />
    </div>
  );
}
