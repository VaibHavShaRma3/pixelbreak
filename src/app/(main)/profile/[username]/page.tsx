import { User, Trophy, Gamepad2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `${username}'s Profile` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // TODO: Fetch user data from DB (Phase 4)
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
              <User className="h-8 w-8 text-muted" />
            </div>
            <div>
              <CardTitle className="text-xl">{username}</CardTitle>
              <p className="text-sm text-muted">Player profile</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-4">
              <Gamepad2 className="h-6 w-6 text-neon-cyan" />
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted">Games Played</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-4">
              <Trophy className="h-6 w-6 text-neon-yellow" />
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted">High Scores</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-4">
              <Trophy className="h-6 w-6 text-neon-green" />
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted">Achievements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
