"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Idea, Clip, ClipType } from "@/types/idea";
import { ContentWorkspace } from "@/components/ai/ContentWorkspace/index";
import axios from "axios";
import * as api from "@/lib/api";
import Link from "next/link";
import "../editor-print.css"; // Import print styles
import PrintButton from "./print-button"; // Import custom print button

/**
 * Dedicated page for the content editor workspace
 */
export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params?.id as string;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if ID looks valid (UUID format)
  const isValidUUID = (id: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Fetch idea and clips data from API
  useEffect(() => {
    if (!ideaId) {
      router.push("/dashboard");
      return;
    }

    // Check if the ID looks like a valid UUID
    if (!isValidUUID(ideaId)) {
      console.error(`Invalid idea ID format: ${ideaId}. Expected UUID format.`);
      setError(
        `The ID "${ideaId}" doesn't look like a valid idea ID. Please check the URL.`
      );
      setLoading(false);
      return;
    }

    const fetchIdeaData = async () => {
      try {
        setLoading(true);
        // Check for token first
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          console.log("No authentication token found, redirecting to login");
          router.push("/auth");
          return;
        }

        // Fetch idea details
        const ideaData = await api.ideas.getById(ideaId);

        // Transform API data to match our frontend model
        const transformedIdea: Idea = {
          id: ideaData.id,
          title: ideaData.name,
          description: ideaData.category || "No description available",
          tags: ideaData.tags || [],
          clips: [],
        };

        setIdea(transformedIdea);

        // Fetch clips for this idea
        const clipsData = await api.clips.getByIdea(ideaId);

        // Transform API clips to match our frontend model
        interface ApiClip {
          id: string;
          type: string;
          value: string;
          created_at: string;
          tags?: Array<{ name: string }>;
        }

        const transformedClips: Clip[] = Array.isArray(clipsData)
          ? clipsData.map((clip: ApiClip) => ({
              id: clip.id,
              type: clip.type as ClipType,
              content: clip.value,
              created: clip.created_at || new Date().toISOString().slice(0, 10),
              tags: clip.tags?.map((tag) => tag.name) || [],
            }))
          : [];

        setClips(transformedClips);
        setError(null);
      } catch (err) {
        console.error("Error fetching idea data:", err);

        if (axios.isAxiosError(err)) {
          if (err.response) {
            if (err.response.status === 401 || err.response.status === 403) {
              console.log("Authentication error, redirecting to login");
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
              }
              router.push("/auth");
              return;
            } else if (err.response.status === 404) {
              setError(
                `Idea with ID ${ideaId} not found. Please check the URL and try again.`
              );
            } else {
              const detail =
                err.response.data?.detail || "Unknown server error";
              setError(`Server error: ${detail}`);
            }
          } else if (err.request) {
            setError(
              "Failed to connect to the server. Please check your internet connection."
            );
          } else {
            setError(`Failed to load idea: ${err.message || "Unknown error"}`);
          }
        } else {
          setError(
            `Failed to load idea: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdeaData();
  }, [ideaId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar active="Ideas" />
        <main className="flex-1 ml-16 sm:ml-64 transition-all duration-300 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="h-40 bg-gray-200 rounded w-full max-w-4xl mb-4"></div>
            <div className="h-40 bg-gray-200 rounded w-full max-w-4xl mb-4"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar active="Ideas" />
        <main className="flex-1 ml-16 sm:ml-64 transition-all duration-300 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Idea
            </h2>
            <div className="text-neutral-700 mb-6">
              {error || "Idea not found. Please try again."}
            </div>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => router.push(`/dashboard/idea/${ideaId}`)}
              >
                Back to Idea
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar active="Ideas" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col ml-16 sm:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/idea/${ideaId}`}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Idea</span>
            </Link>
            <h1 className="text-xl font-bold text-neutral-800">
              Editing: {idea.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <PrintButton />
            <a
              href={`/dashboard/idea/${ideaId}`}
              className="px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 flex items-center gap-2"
              title="Save and go back to idea"
            >
              <span>Save & Exit</span>
            </a>
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <ContentWorkspace idea={idea} clips={clips} dedicatedPage={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
