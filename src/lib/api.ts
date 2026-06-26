import { useUserStore } from "@/store/user-store";
import axios, { AxiosResponse } from "axios";

export const Api = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_URL?.trim() || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const res: AxiosResponse = await Api.get("/auth/refresh");
        return Api(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().clearUser();
        window.location.href = `/auth/login`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
