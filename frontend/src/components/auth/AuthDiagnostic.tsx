"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface TestUser {
  user: {
    email: string;
    name: string;
    id: string;
  };
  login_credentials?: {
    email: string;
    password: string;
  };
  access_token?: string;
  refresh_token?: string;
  message: string;
  verification_result?: boolean;
}

export function AuthDiagnostic() {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [testUser, setTestUser] = useState<TestUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    // Check if backend is online
    const checkBackend = async () => {
      try {
        await axios.get(`${API_URL}/docs`);
        setBackendStatus("online");
      } catch {
        // Ignore the error object itself
        setBackendStatus("offline");
        setError(`Cannot connect to backend at ${API_URL}`);
      }
    };

    checkBackend();
  }, [API_URL]);

  const createTestUser = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/debug/create-test-user`);
      setTestUser(response.data);
    } catch {
      // Ignore the error object itself
      setError(`Failed to create test user. Check console for details.`);
    }
  };

  const resetTestUserPassword = async () => {
    try {
      setError(null);
      const response = await axios.get(
        `${API_URL}/debug/reset-test-user-password`
      );
      setTestUser(response.data);
    } catch {
      // Ignore the error object itself
      setError(
        `Failed to reset test user password. Check console for details.`
      );
    }
  };

  const checkCurrentAuth = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found in localStorage");
        return;
      }

      console.log(`Checking token: ${token.substring(0, 15)}...`);

      const response = await axios.get(`${API_URL}/debug/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Auth check response:", response.data);
      alert(`Authenticated as: ${response.data.user.email}`);
    } catch (error) {
      console.error("Authentication check failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(
          `Auth check failed: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else {
        setError("Failed to check authentication. See console for details.");
      }
    }
  };

  return (
    <div className="p-4 mt-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-bold mb-2">Authentication Diagnostic</h2>

      <div className="mb-4">
        <p>
          Backend Status:
          <span
            className={
              backendStatus === "online"
                ? "text-green-600 font-bold ml-2"
                : backendStatus === "offline"
                ? "text-red-600 font-bold ml-2"
                : "text-yellow-600 font-bold ml-2"
            }
          >
            {backendStatus.toUpperCase()}
          </span>
        </p>
        <p className="text-sm text-gray-600">API URL: {API_URL}</p>
      </div>

      {error && (
        <div className="p-2 mb-4 bg-red-100 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {backendStatus === "online" && (
        <div className="mb-4 flex flex-col gap-3">
          <button
            onClick={createTestUser}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Test User
          </button>

          <button
            onClick={resetTestUserPassword}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Reset Test User Password
          </button>

          <button
            onClick={checkCurrentAuth}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Check Current Authentication
          </button>

          {testUser && (
            <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-md">
              <p className="font-bold text-green-800">
                {testUser.message || "Test User Created"}
              </p>
              <p>Email: {testUser.user.email}</p>
              <p>
                Password:{" "}
                {testUser.login_credentials?.password || "testpassword"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You can now login with these credentials
              </p>
              {testUser.verification_result !== undefined && (
                <p className="font-semibold mt-1">
                  Password verification:
                  <span
                    className={
                      testUser.verification_result
                        ? "text-green-600 ml-1"
                        : "text-red-600 ml-1"
                    }
                  >
                    {testUser.verification_result ? "SUCCESS" : "FAILED"}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
