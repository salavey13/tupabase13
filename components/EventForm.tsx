"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { Suspense } from "react";
export function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
  // Social Links State
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    facebook: "",
    instagram: "",
  });

  // Organizer State
  const [organizer, setOrganizer] = useState({
    name: "",
    logo: "",
    description: "",
    contactEmail: "",
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (!imageUrl) {
        toast.error("Please upload an event image");
        setLoading(false);
        return;
      }

      const tags = (formData.get("tags") as string)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (tags.length === 0) {
        toast.error("Please add at least one tag");
        setLoading(false);
        return;
      }

      const capacity = parseInt(formData.get("capacity") as string);
      if (isNaN(capacity) || capacity <= 0) {
        toast.error("Please enter a valid capacity");
        setLoading(false);
        return;
      }

      const eventData = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        description: formData.get("description"),
        long_description: formData.get("longDescription"),
        date: formData.get("date"),
        start_time: formData.get("startTime"),
        end_time: formData.get("endTime"),
        image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-images/public/${imageUrl}`,
        venue: {
          name: formData.get("venueName"),
          address: formData.get("venueAddress"),
          city: formData.get("venueCity"),
          coordinates: {
            lat: parseFloat(formData.get("venueLat") as string),
            lng: parseFloat(formData.get("venueLng") as string),
          },
        },
        lineup: [],
        ticket_tiers: [],
        status: "upcoming",
        capacity,
        tickets_remaining: capacity,
        organizer: {
          id: "1",
          name: organizer.name,
          logo: organizer.logo,
          description: organizer.description,
          contactEmail: organizer.contactEmail,
          socialLinks,
        },
        tags,
      };

      const { error } = await supabase.from("events").insert([eventData]);

      if (error) {
        throw error;
      }

      toast.success("Event created successfully");
      router.push("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-gray-900/80 border-gray-800 p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Create New Event</h1>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-white">URL Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="event-name-slug"
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </div>

              <div>
                <Label className="text-white">Event Image</Label>
                <div className="mt-1">
                  <ImageUpload onUpload={setImageUrl} />
                  {imageUrl && (
                    <p className="text-sm text-green-400 mt-2">
                      Image uploaded successfully
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Brief description of the event"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="longDescription" className="text-white">Full Description</Label>
                <Textarea
                  id="longDescription"
                  name="longDescription"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Detailed description of the event"
                  rows={6}
                />
              </div>

              {/* Organizer Information */}
              <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-lg font-semibold text-white">Organizer Information</h3>
                
                <div>
                  <Label htmlFor="organizerName" className="text-white">Organizer Name</Label>
                  <Input
                    id="organizerName"
                    value={organizer.name}
                    onChange={(e) => setOrganizer({...organizer, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="organizerDescription" className="text-white">Description</Label>
                  <Textarea
                    id="organizerDescription"
                    value={organizer.description}
                    onChange={(e) => setOrganizer({...organizer, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Organization description"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="text-white">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={organizer.contactEmail}
                    onChange={(e) => setOrganizer({...organizer, contactEmail: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="contact@example.com"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-2">
                  <Label className="text-white">Social Links</Label>
                  <Input
                    placeholder="Website URL"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white mb-2"
                  />
                  <Input
                    placeholder="Facebook URL"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white mb-2"
                  />
                  <Input
                    placeholder="Instagram URL"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-white">Event Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity" className="text-white">Event Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Number of tickets available"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-white">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime" className="text-white">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venueName" className="text-white">Venue Name</Label>
                <Input
                  id="venueName"
                  name="venueName"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Name of the venue"
                />
              </div>

              <div>
                <Label htmlFor="venueAddress" className="text-white">Venue Address</Label>
                <Input
                  id="venueAddress"
                  name="venueAddress"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Full address of the venue"
                />
              </div>

              <div>
                <Label htmlFor="venueCity" className="text-white">City</Label>
                <Input
                  id="venueCity"
                  name="venueCity"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="City where the event takes place"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueLat" className="text-white">Latitude</Label>
                  <Input
                    id="venueLat"
                    name="venueLat"
                    type="number"
                    step="any"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Venue latitude"
                  />
                </div>

                <div>
                  <Label htmlFor="venueLng" className="text-white">Longitude</Label>
                  <Input
                    id="venueLng"
                    name="venueLng"
                    type="number"
                    step="any"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Venue longitude"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags" className="text-white">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="psytrance, electronic, dance (comma-separated)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="matrix"
                onClick={() => router.push("/events")}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
    </Suspense>
  );
}