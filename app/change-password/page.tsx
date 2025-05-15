"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChangePassword } from "../lib/hooks/use-auth";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const changePassword = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      changePassword.reset();
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      window.location.href = "/";
    } catch (error) {
      // Error is handled by react-query
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please change your password for security reasons
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(changePassword.isError || newPassword !== confirmPassword) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {newPassword !== confirmPassword
                ? "New passwords do not match"
                : changePassword.error?.message || "An error occurred"}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="sr-only">
                Current Password
              </label>
              <Input
                id="current-password"
                name="current-password"
                type="password"
                required
                disabled={changePassword.isPending}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="sr-only">
                New Password
              </label>
              <Input
                id="new-password"
                name="new-password"
                type="password"
                required
                disabled={changePassword.isPending}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                disabled={changePassword.isPending}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={changePassword.isPending}
            className="w-full"
          >
            {changePassword.isPending ? (
              <span className="flex items-center">
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
                Changing password...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
