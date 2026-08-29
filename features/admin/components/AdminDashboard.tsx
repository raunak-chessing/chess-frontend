"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-hot-toast";
import { fetchApi, ApiError } from "@/lib/api-client";

const isAdminSchema = z.object({ isAdmin: z.boolean() });
const flagUserSchema = z.object({ id: z.string() }).passthrough();
const deleteChatSchema = z.object({ messageId: z.string(), deleted: z.boolean() });
const pauseMatchmakingSchema = z.object({ paused: z.boolean() });

export function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [flagUser, setFlagUser] = useState("");
  const [chatId, setChatId] = useState("");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchApi(isAdminSchema, "/api/admin/check")
      .then(() => setAuthorized(true))
      .catch(() => {
        setAuthorized(false);
        router.replace("/");
      });
  }, [router]);

  const handleFlagUser = async () => {
    try {
      await fetchApi(flagUserSchema, "/api/admin/flag-user", {
        method: "POST",
        body: JSON.stringify({ userId: flagUser }),
      });
      toast.success(`User ${flagUser} flagged for cheating!`);
      setFlagUser("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to flag user");
    }
  };

  const handleDeleteChat = async () => {
    try {
      await fetchApi(deleteChatSchema, `/api/admin/chat/${chatId}`, {
        method: "DELETE",
      });
      toast.success(`Chat message ${chatId} deleted!`);
      setChatId("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete message");
    }
  };

  const handleToggleMatchmaking = async () => {
    try {
      const result = await fetchApi(pauseMatchmakingSchema, "/api/admin/matchmaking/pause", {
        method: "POST",
        body: JSON.stringify({ paused: !paused }),
      });
      setPaused(result.paused);
      toast.success(result.paused ? "Matchmaking queue paused!" : "Matchmaking queue resumed!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update matchmaking");
    }
  };

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-red-500 mb-2">Admin Dashboard</h1>
        <p className="text-cc-text-secondary">Manage users, chat, and matchmaking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionHeader>Flag Cheater</SectionHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter User ID"
              value={flagUser}
              onChange={(e) => setFlagUser(e.target.value)}
              className="w-full bg-cc-bg-sidebar text-cc-text-primary px-4 py-2 rounded-lg border border-transparent focus:border-primary transition-colors"
            />
            <button
              onClick={handleFlagUser}
              disabled={!flagUser}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg disabled:opacity-50"
            >
              Flag User
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader>Delete Toxic Message</SectionHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Message ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full bg-cc-bg-sidebar text-cc-text-primary px-4 py-2 rounded-lg border border-transparent focus:border-primary transition-colors"
            />
            <button
              onClick={handleDeleteChat}
              disabled={!chatId}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg disabled:opacity-50"
            >
              Delete Message
            </button>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 flex flex-col items-center justify-center">
          <SectionHeader>Matchmaking Control</SectionHeader>
          <p className="text-cc-text-secondary mb-4 text-center">
            {paused ? "Matchmaking is currently paused." : "Pause the matchmaking queue globally for maintenance."}
          </p>
          <button
            onClick={handleToggleMatchmaking}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg"
          >
            {paused ? "Resume Matchmaking Queues" : "Pause Matchmaking Queues"}
          </button>
        </Card>
      </div>
    </div>
  );
}
