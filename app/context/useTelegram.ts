"use client"

export const getTelegram = async () => {
  if (typeof window === "undefined") return null

  try {
    const WebApp = (await import("@twa-dev/sdk")).default
    return WebApp
  } catch (err) {
    console.warn("Telegram SDK not found, using mock")
    return null
  }
}
