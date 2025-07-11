import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - ClipKit",
  description:
    "Sign in or create an account to start organizing your digital content with ClipKit.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
