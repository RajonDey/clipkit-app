"use client";

import { useEffect, useState } from "react";

export default function TokenDebugger() {
  const [token, setToken] = useState<string | null>(null);
  const [decodedHeader, setDecodedHeader] = useState<string | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<string>("Checking...");
  const [fixedToken, setFixedToken] = useState<string | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      setTokenStatus("No token found in localStorage");
      return;
    }

    // Check if token is wrapped in quotes
    let tokenToCheck = storedToken;
    if (storedToken.startsWith('"') && storedToken.endsWith('"')) {
      const unquotedToken = storedToken.slice(1, -1);
      setFixedToken(unquotedToken);
      tokenToCheck = unquotedToken;

      // Show warning about quoted token
      setTokenStatus(
        "WARNING: Token is wrapped in quotes, which may cause problems"
      );
    }

    // Try to decode token parts
    try {
      const parts = tokenToCheck.split(".");
      if (parts.length !== 3) {
        setTokenStatus(
          `Invalid token format: ${parts.length} parts (expected 3)`
        );
        return;
      }

      // Decode header
      try {
        const headerBase64 = parts[0];
        // Add padding if needed
        const paddedHeaderBase64 =
          headerBase64 + "=".repeat((4 - (headerBase64.length % 4)) % 4);
        const decodedHeaderJson = atob(paddedHeaderBase64);
        setDecodedHeader(decodedHeaderJson);
      } catch (e) {
        console.error("Error decoding header:", e);
        setDecodedHeader("Error decoding header");
      }

      // Decode payload
      try {
        const payloadBase64 = parts[1];
        // Add padding if needed
        const paddedPayloadBase64 =
          payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
        const decodedPayloadJson = atob(paddedPayloadBase64);
        setDecodedPayload(decodedPayloadJson);

        // Check expiration
        const payload = JSON.parse(decodedPayloadJson);
        if (payload.exp) {
          const expTime = new Date(payload.exp * 1000);
          const now = new Date();
          if (expTime > now) {
            const timeLeft = Math.floor(
              (expTime.getTime() - now.getTime()) / 1000
            );
            const hoursLeft = Math.floor(timeLeft / 3600);
            const minutesLeft = Math.floor((timeLeft % 3600) / 60);
            setTokenStatus(
              `Valid token, expires at ${expTime.toLocaleString()} (${hoursLeft}h ${minutesLeft}m remaining)`
            );
          } else {
            setTokenStatus(`Token expired at ${expTime.toLocaleString()}`);
          }
        } else {
          setTokenStatus("Token valid but no expiration found");
        }
      } catch (e) {
        console.error("Error decoding payload:", e);
        setDecodedPayload("Error decoding payload");
        setTokenStatus(
          `Error decoding token: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    } catch (e) {
      setTokenStatus(
        `Error processing token: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  const fixToken = () => {
    if (!token) return;

    // Remove quotes if present
    let cleanToken = token;
    if (token.startsWith('"') && token.endsWith('"')) {
      cleanToken = token.slice(1, -1);
    }

    // Store fixed token
    localStorage.setItem("token", cleanToken);
    setTokenStatus("Token fixed and saved to localStorage");

    // Recheck token
    checkToken();
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setToken(null);
    setDecodedHeader(null);
    setDecodedPayload(null);
    setFixedToken(null);
    setTokenStatus("Token cleared from localStorage");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Token Debugger</h1>

      <div className="mb-4 p-2 bg-gray-100 rounded">
        <div className="font-semibold">Status:</div>
        <div
          className={`${
            tokenStatus.includes("Valid") ? "text-green-600" : "text-red-600"
          }`}
        >
          {tokenStatus}
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={checkToken}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Token
        </button>

        {fixedToken && (
          <button
            onClick={fixToken}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Fix Token (Remove Quotes)
          </button>
        )}

        {token && (
          <button
            onClick={clearToken}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear Token
          </button>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Token</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
          {token || "No token found"}
        </pre>
      </div>

      {fixedToken && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Fixed Token (quotes removed)
          </h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {fixedToken}
          </pre>
        </div>
      )}

      {decodedHeader && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Decoded Header</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {(() => {
              try {
                return JSON.stringify(JSON.parse(decodedHeader), null, 2);
              } catch {
                return decodedHeader;
              }
            })()}
          </pre>
        </div>
      )}

      {decodedPayload && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Decoded Payload</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {(() => {
              try {
                return JSON.stringify(JSON.parse(decodedPayload), null, 2);
              } catch {
                return decodedPayload;
              }
            })()}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <a href="/dashboard" className="text-blue-500 hover:underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
