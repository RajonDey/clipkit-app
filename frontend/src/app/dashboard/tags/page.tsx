"use client";
import Sidebar from "@/components/layout/Sidebar";

export default function TagsPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-brand-50 to-brand-100">
      <Sidebar active="Tags" />
      <main className="flex-1 flex flex-col p-8 ml-16 sm:ml-64 transition-all duration-300">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-900 via-accent-800 to-secondary-700">
            Tags
          </h1>
        </header>
        <section className="flex-1">
          <div className="flex flex-col items-center justify-center h-full text-brand-400">
            <span className="text-5xl mb-4">🏷️</span>
            <p className="text-lg">Tags section coming soon!</p>
          </div>
        </section>
      </main>
    </div>
  );
}
