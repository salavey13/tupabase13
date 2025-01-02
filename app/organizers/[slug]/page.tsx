import { supabase } from '@/utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getOrganizerInfo(slug: string) {
  const { data, error } = await supabase
    .from('organizers')
    .select(`
      *,
      events (
        slug,
        title,
        date
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching organizer info:', error)
    return null
  }

  return data
}

export default async function OrganizerPage({ params }: { params: { slug: string } }) {
  const organizerInfo = await getOrganizerInfo(params.slug)

  if (!organizerInfo) {
    return <div className="container mx-auto py-8">Organizer not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{organizerInfo.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{organizerInfo.description}</p>
            <p><strong>Website:</strong> <a href={organizerInfo.website} target="_blank" rel="noopener noreferrer">{organizerInfo.website}</a></p>
            <h3 className="text-xl font-semibold mt-6 mb-4">Upcoming Events</h3>
            {organizerInfo.events && organizerInfo.events.length > 0 ? (
              <ul className="space-y-2">
                {organizerInfo.events.map((event: any) => (
                  <li key={event.slug}>
                    <Link href={`/events/${event.slug}`}>
                      <span className="text-blue-600 hover:underline">{event.title}</span>
                    </Link>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming events.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

