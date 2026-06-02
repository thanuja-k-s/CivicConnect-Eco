import api from "./api";
import { User } from "@/types";
import axios from "axios";

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      console.log("Attempting login for:", email);
      const response = await api.post("/auth/login", { email, password });
      console.log("Login response:", response.data);
      const data = response.data;
      const user: User = {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        token: data.token,
      };
      console.log("Parsed user object:", user);
      return user;
    } catch (error) {
      console.error("Login error details:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      throw new Error("Invalid email or password");
    }
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "citizen" | "worker";
  }): Promise<User> {
    try {
      const response = await api.post("/auth/register", data);
      const user = response.data;
      return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: user.token,
      };
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error("Registration failed. Please check your input and try again.");
    }
  },
};
