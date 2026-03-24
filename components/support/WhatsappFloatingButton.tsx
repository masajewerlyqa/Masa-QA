"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/97466055546?text=Hello%20MASA%20team%2C%20I%20need%20assistance";

export function WhatsappFloatingButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MASA support on WhatsApp"
      className="
        fixed z-50 flex items-center justify-center rounded-full
        bg-primary text-white shadow-lg
        transition-all duration-200 ease-in-out
        hover:bg-primary/85 hover:shadow-xl hover:scale-105
        active:scale-95
        w-12 h-12 bottom-[88px] right-4
        md:w-14 md:h-14 md:bottom-6 md:right-6
        group animate-whatsapp-pulse
      "
    >
      <MessageCircle className="w-[22px] h-[22px] md:w-[26px] md:h-[26px]" />

      <span
        className="
          pointer-events-none absolute right-full mr-3 whitespace-nowrap
          rounded-md bg-masa-dark px-3 py-1.5 text-xs font-sans text-white
          opacity-0 transition-opacity duration-200
          group-hover:opacity-100
          hidden md:block
        "
      >
        Need help?
      </span>
    </a>
  );
}
