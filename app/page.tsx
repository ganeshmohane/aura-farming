import { ArrowUpRight, Flame, Trophy, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  { title: "Great joke in standup", value: "+80 aura" },
  { title: "Legendary assist", value: "+220 aura" },
  { title: "Reply-all mistake", value: "-35 aura" },
  { title: "Generational aura loss", value: "-400 aura" },
];

const leaderboard = [
  { name: "Maya", aura: "+3,220" },
  { name: "Theo", aura: "+2,980" },
  { name: "Jules", aura: "+2,740" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-8">
      <section className="rounded-2xl border border-black p-8 md:p-12">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-black px-3 py-1 text-xs uppercase tracking-[0.2em]">
          <Flame className="h-3.5 w-3.5" /> Aura Farming
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          Farm your vibe.
          <br />
          Track your aura.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-black/70 md:text-lg">
          A playful social app for teams and friend groups where every legendary
          win, funny fail, and iconic moment shifts your aura score.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Start Farming</Button>
          <Button variant="outline">View Leaderboard</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Current Aura <Zap className="h-4 w-4" />
            </CardTitle>
            <CardDescription>
              Your profile score updates in real time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-black">+1,840</p>
            <p className="mt-2 text-sm text-black/70">+140 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Leaderboard <Trophy className="h-4 w-4" />
            </CardTitle>
            <CardDescription>Top farmers this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {leaderboard.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between border-b border-black/10 pb-2"
              >
                <span>{entry.name}</span>
                <span className="font-semibold">{entry.aura}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Daily Give Limit</CardTitle>
            <CardDescription>Keep reactions meaningful and fair.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">7 / 10</p>
            <p className="mt-2 text-sm text-black/70">
              3 aura reactions remaining today.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Aura Events</h2>
          <button className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
            Open full activity feed <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <Card key={action.title} className="border-dashed">
              <CardContent className="flex items-center justify-between p-5">
                <p className="font-medium">{action.title}</p>
                <p className="text-lg font-black">{action.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
