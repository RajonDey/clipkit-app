"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthDiagnostic } from "@/components/auth/AuthDiagnostic";

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FormData {
  name?: string;
  email: string;
  password: string;
}

export default function AuthenticationPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      // Prepare the request body based on whether it's login or register
      let body;
      let headers;

      if (isLogin) {
        // For login, use URLSearchParams (form data)
        const loginData = new URLSearchParams();
        loginData.append("username", formData.email);
        loginData.append("password", formData.password);
        body = loginData;
        headers = {
          "Content-Type": "application/x-www-form-urlencoded",
        };
      } else {
        // For registration, keep using JSON
        body = JSON.stringify({
          username: formData.email,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        headers = {
          "Content-Type": "application/json",
        };
      }

      // Log the request details
      console.log(
        `Sending ${
          isLogin ? "login" : "registration"
        } request to: ${API_URL}${endpoint}`
      );
      console.log("Headers:", headers);
      console.log(
        "Body:",
        body instanceof URLSearchParams ? body.toString() : body
      );

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Error response:", data); // For debugging
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            throw new Error(
              data.detail.map((err: { msg: string }) => err.msg).join(", ")
            );
          } else if (typeof data.detail === "string") {
            throw new Error(data.detail);
          } else {
            // Handle case where detail is an object
            throw new Error(JSON.stringify(data.detail));
          }
        }
        throw new Error(
          "Authentication failed. Please check your credentials."
        );
      }

      if (!isLogin) {
        // If registration successful, show success message and switch to login
        setError("");
        setFormData((prev) => ({
          ...prev,
          name: "",
          password: "",
        }));
        setIsLogin(true);
        // Show success message
        const successMsg =
          "Registration successful! Please login with your credentials.";
        setError(successMsg); // We'll style this differently
        return;
      }

      // For login success
      console.log("Login successful, response data:", data);

      // Store the tokens
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        console.log("Access token stored in localStorage");

        // Verify token was stored properly
        const storedToken = localStorage.getItem("token");
        console.log(
          `Verified token storage: ${storedToken ? "success" : "failed"}`
        );
        console.log(
          `Stored token (first 15 chars): ${storedToken?.substring(0, 15)}...`
        );
      } else {
        console.error("No access_token in response data:", data);
      }

      if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
        console.log("Refresh token stored in localStorage");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center group cursor-pointer">
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
                  className="h-8 w-8 text-orange-400 group-hover:text-orange-500 transition-colors"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </motion.div>
              <span className="text-xl font-bold text-neutral-900 group-hover:text-orange-500 transition-all duration-300">
                ClipKit
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-neutral-200">
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold tracking-tight text-neutral-900"
              >
                {isLogin ? "Welcome back" : "Create your account"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-neutral-500"
              >
                {isLogin
                  ? "Enter your details to access your account"
                  : "Start organizing your digital content"}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {error && (
                <div
                  className={`mb-4 p-3 text-sm rounded-lg ${
                    error.includes("successful")
                      ? "text-green-600 bg-green-50"
                      : "text-red-500 bg-red-50"
                  }`}
                >
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:shadow-[0_0_0_2px_rgba(255,140,0,0.15)] transition-all bg-neutral-50 outline-none"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:shadow-[0_0_0_2px_rgba(255,140,0,0.15)] transition-all bg-neutral-50 outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:shadow-[0_0_0_2px_rgba(255,140,0,0.15)] transition-all bg-neutral-50 outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-400 to-yellow-300 bg-[length:200%_100%] bg-left hover:bg-right hover:from-orange-500 hover:to-yellow-400 text-white rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-[background-position,background-color] duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    <span>{isLogin ? "Sign in" : "Create account"}</span>
                  )}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer">
                    <svg
                      className="h-5 w-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>

              {/* Auth Diagnostic Tool */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <details className="text-sm text-neutral-500">
                  <summary className="cursor-pointer font-medium">
                    Troubleshooting Tools
                  </summary>
                  <div className="mt-3">
                    <AuthDiagnostic />
                  </div>
                </details>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
