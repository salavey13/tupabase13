"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicEvent } from "@/types/event";

interface EventSliderProps {
  events: PublicEvent[];
}

export function EventSlider({ events }: EventSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % events.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [events.length, isAnimating]);

  const prevSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [events.length, isAnimating]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (!events.length) return null;

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <div 
        className="flex transition-transform duration-500 h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {events.map((event, index) => (
          <div key={event.slug} className="w-full flex-shrink-0 relative">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-90" />
            
            <Link href={`/events/${event.slug}`}>
              <div className="absolute bottom-16 left-0 right-0 p-8 matrix-text">
                <h2 className="text-4xl font-bold mb-2">{event.title}</h2>
                <p className="text-xl mb-4">{event.venue?.city}</p>
                <p className="text-gray-300">{event.description}</p>
                {event.ticket_tiers && event.ticket_tiers.length > 0 && (
                  <div className="mt-4">
                    <span className="matrix-button px-4 py-2 rounded-full text-sm">
                      From ${Math.min(...event.ticket_tiers.map((tier) => tier.price))}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="matrix-button absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="matrix-button absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.5)]" 
                : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}