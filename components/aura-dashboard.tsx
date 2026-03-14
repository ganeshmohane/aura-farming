"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Flame, Trophy, Volume2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type User = {
  id: number;
  name: string;
  email: string;
  aura: number;
};

type AuraEvent = {
  id: number;
  fromUserName: string | null;
  toUserName: string;
  amount: number;
  reason: string | null;
  createdAt: string;
};

const presets = [
  { label: "Small Win", value: 10 },
  { label: "Legendary Moment", value: 200 },
  { label: "Minor Oops", value: -10 },
  { label: "Generational Aura Loss", value: -250 },
];

function playSyntheticFahhh() {
  const audioContext = new window.AudioContext();
  const bufferSize = audioContext.sampleRate * 0.8;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    const progress = i / data.length;
    const envelope = Math.max(0, 1 - progress * 1.25);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = audioContext.createBufferSource();
  source.buffer = noiseBuffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.8;

  const gain = audioContext.createGain();
  gain.gain.value = 0.5;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  source.start();

  source.onended = () => {
    void audioContext.close();
  };
}

export function AuraDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<AuraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registering, setRegistering] = useState(false);

  const [fromUserId, setFromUserId] = useState<string>("");
  const [toUserId, setToUserId] = useState<string>("");
  const [amount, setAmount] = useState<string>("10");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const [soundBlocked, setSoundBlocked] = useState(false);
  const [soundSource, setSoundSource] = useState<"mp3" | "synth">("mp3");
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const topUser = users[0];
  const totalAura = useMemo(() => users.reduce((sum, user) => sum + user.aura, 0), [users]);

  async function loadData() {
    setError(null);
    try {
      const [usersRes, eventsRes] = await Promise.all([fetch("/api/users"), fetch("/api/events")]);

      const usersJson = await usersRes.json();
      const eventsJson = await eventsRes.json();

      if (!usersRes.ok) throw new Error(usersJson.error ?? "Failed loading users.");
      if (!eventsRes.ok) throw new Error(eventsJson.error ?? "Failed loading events.");

      setUsers(usersJson.users);
      setEvents(eventsJson.events);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const audio = new Audio("/fahhh.mp3");
    audio.preload = "auto";
    audio.volume = 0.9;
    soundRef.current = audio;

    audio.onerror = () => {
      setSoundSource("synth");
      setSoundBlocked(true);
    };

    audio.play().catch(() => {
      setSoundBlocked(true);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  async function playFahhh() {
    if (soundSource === "synth") {
      playSyntheticFahhh();
      setSoundBlocked(false);
      return;
    }

    if (!soundRef.current) return;

    try {
      soundRef.current.currentTime = 0;
      await soundRef.current.play();
      setSoundBlocked(false);
    } catch {
      setSoundBlocked(true);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistering(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not register user");

      setName("");
      setEmail("");
      await loadData();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Unexpected registration error");
    } finally {
      setRegistering(false);
    }
  }

  async function handleGiveAura(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/aura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: fromUserId ? Number(fromUserId) : null,
          toUserId: Number(toUserId),
          amount: Number(amount),
          reason,
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Could not submit aura");

      setReason("");
      await loadData();
    } catch (auraError) {
      setError(auraError instanceof Error ? auraError.message : "Unexpected aura submission error");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
      <section className="rounded-2xl border border-black p-8 md:p-12">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-black px-3 py-1 text-xs uppercase tracking-[0.2em]">
          <Flame className="h-3.5 w-3.5" /> Aura Farming
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Community Aura Board</h1>
        <p className="mt-3 max-w-2xl text-black/70">
          Register users, award aura in real-time, and track current leaderboard standings.
        </p>
        {soundBlocked ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-black p-3 text-sm">
            <span>
              {soundSource === "mp3"
                ? "Autoplay got blocked by browser. Tap to play the fahhh sound."
                : "fahhh.mp3 missing. Tap to play built-in synthetic fahhh sound."}
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => void playFahhh()}>
              <Volume2 className="mr-2 h-4 w-4" /> Play fahhh
            </Button>
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="rounded-md border border-black bg-black px-4 py-2 text-sm text-white">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              Total Aura <Zap className="h-4 w-4" />
            </CardTitle>
            <CardDescription>Sum of all user aura points.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{totalAura}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              #1 Farmer <Trophy className="h-4 w-4" />
            </CardTitle>
            <CardDescription>Current top user.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{topUser?.name ?? "No users yet"}</p>
            <p className="text-sm text-black/70">{topUser ? `${topUser.aura} aura` : "Register to begin."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Users</CardTitle>
            <CardDescription>Registered community members.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{users.length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Register User</CardTitle>
            <CardDescription>Add a new member with name + email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleRegister}>
              <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" disabled={registering}>
                {registering ? "Creating..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Give Aura</CardTitle>
            <CardDescription>Apply positive or negative aura to a user.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleGiveAura}>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="h-10 rounded-md border border-black px-2 text-sm"
                  value={fromUserId}
                  onChange={(event) => setFromUserId(event.target.value)}
                >
                  <option value="">From: Anonymous</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-md border border-black px-2 text-sm"
                  value={toUserId}
                  onChange={(event) => setToUserId(event.target.value)}
                  required
                >
                  <option value="">To user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="rounded-md border border-black px-3 py-2 text-left text-sm hover:bg-black hover:text-white"
                    onClick={() => setAmount(String(preset.value))}
                  >
                    {preset.label} ({preset.value > 0 ? `+${preset.value}` : preset.value})
                  </button>
                ))}
              </div>

              <Input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min={-500}
                max={500}
                required
              />
              <Input
                placeholder="Reason (optional)"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <Button type="submit" disabled={sending || users.length === 0}>
                {sending ? "Submitting..." : "Submit aura event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>All users sorted by current aura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? <p>Loading...</p> : null}
            {users.length === 0 && !loading ? <p className="text-sm text-black/70">No users yet.</p> : null}
            {users.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between border-b border-black/10 pb-2 text-sm">
                <span>
                  #{index + 1} {user.name}
                </span>
                <span className="font-bold">{user.aura}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Aura Events</CardTitle>
            <CardDescription>Latest aura changes across the community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 ? <p className="text-sm text-black/70">No events yet.</p> : null}
            {events.map((event) => (
              <div key={event.id} className="rounded-md border border-black/20 p-3 text-sm">
                <p className="font-medium">
                  {event.fromUserName ?? "Anonymous"} → {event.toUserName}
                </p>
                <p className="font-bold">{event.amount > 0 ? `+${event.amount}` : event.amount} aura</p>
                {event.reason ? <p className="text-black/70">{event.reason}</p> : null}
                <p className="text-xs text-black/50">{event.createdAt}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
