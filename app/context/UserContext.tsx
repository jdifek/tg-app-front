"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api";

export interface User {
  id: number | string; // можно оставить string, если Telegram ID
  telegramId: string;
  firstName?: string;
  first_name?: string;
  phone?: string;
  email?: string;
  quiz?: boolean;
  maskId?: number | null;
  username?: string;
  photoUrl?: string;
  photo_url?: string;
}

// Мок пользователя, если реальный не получен
const MOCK_USER: User = {
  id: "0",
  telegramId: "0",
  first_name: "Мок",
  username: "mock_user",
  photoUrl: "",
  photo_url: "",
};

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

export const UserContext = createContext<UserContextType>({
  user: MOCK_USER,
  setUser: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(MOCK_USER);

  useEffect(() => {
    const handleLogin = (tgUser: any) => {
      api
        .registerUser(tgUser.id.toString(), tgUser.first_name || "User", tgUser.username)
        .then((registeredUser: any) => {
          setUser({
            ...MOCK_USER, // начинаем с мока
            ...registeredUser, // данные с бэка
            telegramId: tgUser.id.toString(),
            first_name: tgUser.first_name || registeredUser.firstName,
            username: tgUser.username || registeredUser.username,
            photoUrl: tgUser.photo_url,
            photo_url: tgUser.photo_url,
          });
        })
        .catch((error) => {
          console.error("User context login error:", error.message);
          // остаётся мок
        });
    };

    const tg = window.Telegram?.WebApp;
    console.log(tg, 'tg');
    
    if (tg) {
      const initData = tg.initDataUnsafe;
      if (initData?.user) {
        handleLogin(initData.user);
        return;
      }
    }

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const tgWebAppData = params.get("tgWebAppData");
    console.log(params, 'params');
    console.log(tgWebAppData, 'tgWebAppData');
    
  if (tgWebAppData) {
  const decodedData = decodeURIComponent(tgWebAppData); // декодируем %7B...%7D
  const dataParams = new URLSearchParams(decodedData);

  const userParam = dataParams.get("user"); // получаем JSON строки
  if (userParam) {
    // иногда Telegram ещё экранирует слеши, поэтому дважды decode
    const userFromUrl = JSON.parse(decodeURIComponent(userParam));
    console.log("Пользователь из URL:", userFromUrl);
    handleLogin(userFromUrl);
    return;
  }
}


    // Фолбек: хардкод
    const hardcodedUser = {
      id: "5969166369",
      first_name: "Денис",
      username: "denis_nickname",
      photo_url:
        "https://t.me/i/userpic/320/ArOpXH92rj_EpmqJ6uB_-vEugbCinOd3VU8tLlkf5DSxI8r40DuBCgyZH4VxImpQ.svg",
    };
    handleLogin(hardcodedUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
