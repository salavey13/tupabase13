import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  rank: number;
}

export function Leaderboard({ eventSlug }: { eventSlug: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, users(username), score')
        .eq('event_slug', eventSlug)
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        const rankedData = data.map((entry, index) => ({
          ...entry,
          username: entry.users[0]?.username,
          rank: index + 1
        }));
        setLeaderboard(rankedData);
      }
    };

    fetchLeaderboard();
    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, fetchLeaderboard)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventSlug]);

  return (
    <Card className="bg-black text-green-500 border-green-500">
      <CardHeader>
        <CardTitle>Matrix Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-green-500">Rank</TableHead>
              <TableHead className="text-green-500">Hacker</TableHead>
              <TableHead className="text-green-500">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.user_id} className={entry.rank === 1 ? 'bg-green-900' : ''}>
                <TableCell>
                  <Badge variant="default" className="text-green-500 border-green-500">
                    {entry.rank}
                  </Badge>
                </TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell>{entry.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

