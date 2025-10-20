"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getTelegram } from "./useTelegram"

type User = {
  id: string | null
  username: string | null
}

type UserContextType = {
  user: User
  setUser: (user: User) => void
}

const UserContext = createContext<UserContextType>({
  user: { id: null, username: null },
  setUser: () => {},
})

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: null, username: null })

  useEffect(() => {
    const load = async () => {
      const tg = await getTelegram()

      if (tg && tg.initDataUnsafe?.user) {
        const { id, username } = tg.initDataUnsafe.user
        setUser({
          id: String(id), // 👈 гарантированно строка
          username: username || null,
        })
      } else {
        // 🔹 Мок-данные для dev-режима
        setUser({
          id: "999999", // 👈 строка
          username: "dev_user",
        })
      }
    }

    load()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
