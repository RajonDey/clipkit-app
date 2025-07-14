"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="fixed top-0 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <Link href="/" className="flex items-center group">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="mr-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-orange-400 group-hover:text-yellow-400 transition-colors"
                  >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  </svg>
                </motion.div>
                <span className="text-xl font-bold text-neutral-900 group-hover:text-orange-500 transition-all duration-300">
                  ClipKit
                </span>
              </Link>
            </motion.div>

            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link
                href="/auth"
                className="relative px-4 py-2 rounded-md text-neutral-700 hover:bg-orange-50 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth"
                className="relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-semibold rounded-md bg-gradient-to-r from-orange-400 to-yellow-300 hover:from-orange-500 hover:to-yellow-400 text-white shadow-sm transition-all duration-300"
              >
                Get Started
              </Link>
            </motion.nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate pt-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl px-6 py-16 sm:py-24 lg:px-8"
          >
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-extrabold tracking-tight sm:text-6xl text-neutral-900"
              >
                Collect, organize, and manage your digital content
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-lg leading-8 text-neutral-700"
              >
                Seamlessly save content from anywhere on the web. Organize your
                research, ideas, and inspirations in one place.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10"
              >
                <Link
                  href="/auth"
                  className="relative inline-flex items-center justify-center px-8 py-4 font-semibold tracking-wide overflow-hidden rounded-lg group bg-gradient-to-r from-orange-400 to-yellow-300 hover:from-orange-500 hover:to-yellow-400 text-white shadow-md transition-all duration-300"
                >
                  <span className="relative group-hover:scale-105 transition-transform duration-200">
                    Start Collecting →
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md hover:shadow-xl border border-neutral-200 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="mb-6 text-orange-400 group-hover:text-yellow-400 transition-colors drop-shadow-sm">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-orange-500 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-neutral-600">{card.description}</p>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-orange-50 via-yellow-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-neutral-200 bg-white/90 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-center text-sm text-neutral-400">
            Built with{" "}
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block text-orange-400"
            >
              ❤️
            </motion.span>{" "}
            for better digital organization.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

const featureCards = [
  {
    title: "Track Ideas",
    description: "Organize your thoughts and research in a structured way.",
    icon: (
      <svg
        className="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m16 6 4 14M12 6v14M8 8v12M4 4v16" />
      </svg>
    ),
  },
  {
    title: "Save Content",
    description: "Clip and save anything from the web with one click.",
    icon: (
      <svg
        className="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    title: "Stay Organized",
    description: "Tag, categorize, and find your content easily.",
    icon: (
      <svg
        className="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M12 2v2M12 20v2m-7.07-7.07h2m12.14 0h2M6.34 6.34l1.41 1.41m8.49 8.49l1.41 1.41M6.34 17.66l1.41-1.41m8.49-8.49l1.41-1.41" />
      </svg>
    ),
  },
];
