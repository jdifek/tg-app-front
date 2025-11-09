'use client'
import { useUser } from "../context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const ADMIN_IDS = ['6970790362', '5505526221', '5969166369'];

  if (!user || !ADMIN_IDS.includes(String(user.telegramId))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
        No access
      </div>
    );
  }
  return <div>{children}</div>;
}
