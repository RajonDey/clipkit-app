"use client";

import { useEffect } from "react";
import { auth } from "@/lib/api";

/**
 * TokenManager component that handles token refreshing and validation
 * Add this component to your app layout to ensure tokens are always valid
 */
export const TokenManager: React.FC = () => {
  useEffect(() => {
    // Function to validate and refresh tokens if needed
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Parse the token
        const parts = token.split(".");
        if (parts.length !== 3) {
          console.error("Invalid token format");
          return;
        }

        const payload = JSON.parse(atob(parts[1]));
        const expiry = payload.exp;
        const now = Math.floor(Date.now() / 1000);

        // If token is expired or about to expire (within 5 minutes), refresh it
        if (expiry - now < 300) {
          console.log("Token is expired or about to expire, refreshing...");
          await auth.refreshToken();
        } else {
          console.log(
            `Token valid for ${Math.floor((expiry - now) / 60)} more minutes`
          );
        }
      } catch (error) {
        console.error("Error validating token:", error);
      }
    };

    // Validate token on component mount
    validateToken();

    // Set up a timer to check token validity every 5 minutes
    const intervalId = setInterval(validateToken, 5 * 60 * 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // This component doesn't render anything
  return null;
};
