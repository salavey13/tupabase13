"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicEvent, AuthenticatedEvent } from "@/types/event";

interface EventSliderProps {
  events: (PublicEvent | AuthenticatedEvent)[];
}

export function EventSlider({ events }: EventSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <div className="slider">
      <div
        className="slides"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {events.map((event, index) => (
          <div key={event.slug} className="slide">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="slide-image"
              priority={index === 0}
            />
            <Link href={`/events/${event.slug}`}>
              <div className="slide-content">
                <h2 className="text-4xl font-bold mb-2">{event.title}</h2>
                <p className="text-xl mb-4">{event.venue?.city}</p>
                <p className="text-gray-300">{event.description}</p>
                {Array.isArray(event.ticket_tiers) && event.ticket_tiers.length > 0 && (
                  <div className="mt-4">
                    <span className="bg-purple-600 px-4 py-2 rounded-full text-sm">
                      From $
                      {Math.min(
                        ...event.ticket_tiers.map((tier) => tier.price)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        className="slider-button prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        className="slider-button next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="slider-nav">
        {events.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
