import { useMutation } from "@tanstack/react-query";

interface LoginCredentials {
  username: string;
  password: string;
}

interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}

interface AuthResponse {
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
    passwordChanged: boolean;
  };
}

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      return response.json();
    },
  });
}

export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }
    },
  });
}
