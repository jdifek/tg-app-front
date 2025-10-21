import axios from "axios";
import { User } from "./context/UserContext";

// Типы
export type ExtraFieldType = {
  id: number;
  key: string;
  value: string;
};

export type FeatureType = {
  id: number;
  name: string;
};

export type ReviewType = {
  id: number;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export type MasksType = {
  id: number;
  name: string;
  instructions: string | null;
  imageUrl: string | null;
  price: number | null;
  weight: number | null;
  viewArea: string | null;
  sensors: number | null;
  power: string | null;
  shadeRange: string | null;
  material: string | null;
  description: string | null;
  link: string | null;
  installment: string | null;
  size: string | null;
  days: number | null;
  features: FeatureType[];
  reviews: ReviewType[];
  ExtraField: ExtraFieldType[];
};

type VideoType = {
  id: number;
  title: string;
  url?: string;
  description?: string;
  duration?: string;
  thumbnailUrl?: string;
};

// API config
export const API_URL =
process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для возврата response.data напрямую
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// Типизированный API
export default {
  getUserMasks: async (telegramId: string): Promise<MasksType[]> => {
    const response = await api.get(`/user/${telegramId}/masks`);
    console.log("Raw API response:", response); // Для отладки
    
    // Если response.data содержит массив
    if (response && response.data) {
      return response.data;
    }
    
    // Если response сам является массивом
    if (Array.isArray(response)) {
      return response;
    }
    
    // Если ничего не найдено
    return [];
  },
  registerUser: (telegramId: string, firstName: string): Promise<User> =>
    api.post("/register", { telegramId, firstName }),

  getUser: (telegramId: string): Promise<User> =>
    api.get(`/user/${telegramId}`),

  getMasks: (): Promise<MasksType[]> => api.get("/masks"),

  getMaskDetails: (id: number): Promise<MasksType> => api.get(`/masks/${id}`),

  getMaskInstructions: (id: number): Promise<string> =>
    api.get(`/masks/${id}/instructions`),

  getCatalog: (name: string): Promise<MasksType[]> =>
    api.get("/catalog", { params: { name } }),
  addUserMask: (telegramId: string, maskId: number): Promise<void> =>
    api.post(`/user/${telegramId}/add-mask`, { maskId }),

  getVideos: (): Promise<VideoType[]> => api.get("/videos"),

  updateProfile: (
    telegramId: string,
    phone?: string,
    email?: string,
    quiz?: boolean,
    add?: boolean
  ): Promise<User> =>
    api.post("/profile", { telegramId, phone, email, quiz, add }),
};

// Экспорт типов
export type { VideoType };