"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { auth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "@/components/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  name: z.string().optional(),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      let result;
      console.log("Starting authentication process...");

      if (isRegister && data.name) {
        console.log("Attempting to register user:", data.email);
        try {
          result = await auth.register({
            email: data.email,
            password: data.password,
            name: data.name,
          });
          console.log("Register response:", result);
        } catch (error) {
          console.error("Register API error:", error);
          throw new Error(
            `Registration failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else {
        console.log("Attempting to login user:", data.email);
        try {
          result = await auth.login({
            username: data.email,
            password: data.password,
          });
          console.log("Login response:", result);
        } catch (error) {
          console.error("Login API error:", error);
          throw new Error(
            `Login failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      // Check if we have a valid token
      if (result && result.access_token) {
        console.log("Setting token:", result.access_token);

        // Ensure we don't store with quotes
        let tokenToStore = result.access_token;
        if (
          typeof tokenToStore === "string" &&
          tokenToStore.startsWith('"') &&
          tokenToStore.endsWith('"')
        ) {
          tokenToStore = tokenToStore.slice(1, -1);
          console.log("Removed quotes from token before storing");
        }

        localStorage.setItem("token", tokenToStore);

        // Verify the token was set correctly
        const storedToken = localStorage.getItem("token");
        console.log("Verified stored token:", storedToken);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        console.error("Invalid response format, missing access_token:", result);
        alert("Login failed: Invalid server response");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      // Check for network errors (Failed to fetch)
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        alert(
          "Network error: Unable to connect to the authentication server. Please check if the backend server is running."
        );
      } else if (error instanceof Error) {
        alert(`Login failed: ${error.message}`);
      } else {
        alert("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            {isRegister && (
              <Input
                id="name"
                placeholder="Name"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                {...form.register("name")}
              />
            )}
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...form.register("email")}
            />
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              {...form.register("password")}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isRegister ? "Sign Up" : "Sign In"}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-brand-50 px-2 text-brand-500">
            Or continue with
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          className="underline text-accent-600 hover:text-accent-500 transition-colors"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
