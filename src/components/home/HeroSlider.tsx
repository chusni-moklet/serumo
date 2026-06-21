"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const defaultSlides = [
  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=2070&auto=format&fit=crop"
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>(defaultSlides);
  const supabase = createClient();

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from("hero_slides")
        .select("image_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setSlides(data.map(d => d.image_url));
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide})` }}
          />
          {/* Gradient Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 z-10 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-5">
            <span className="text-xs text-white font-medium">🏫 SMK Telkom Malang</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white drop-shadow-md">
            Sewa Ruangan<br />
            <span className="text-yellow-300">Moklet</span> Mudah &<br />
            Transparan
          </h1>
          <p className="text-base text-white/90 mb-7 max-w-md leading-relaxed drop-shadow">
            Booking ruangan sekolah secara online. Lihat virtual tour, pilih fasilitas, dan konfirmasi pembayaran — semua dalam satu platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/rooms">
              <Button size="lg" className="w-full sm:w-auto bg-white text-red-700 hover:bg-red-50 shadow-xl font-semibold">
                Lihat Ruangan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-xl">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-4 sm:left-6 lg:left-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
