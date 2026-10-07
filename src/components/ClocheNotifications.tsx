"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  message: string;
  lien?: string | null;
  lu: boolean;
  createdAt: string;
};

export default function ClocheNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const [connecte, setConnecte] = useState(true);

  async function charger() {
    const res = await fetch("/api/notifications");
    if (res.status === 401) {
      setConnecte(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setNonLues(data.nonLues);
    }
  }

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 30000);
    return () => clearInterval(intervalle);
  }, []);

  async function ouvrirMenu() {
    setOuvert(!ouvert);
  }

  async function marquerLue(id: string) {
    await fetch(`/api/notifications/${id}/lire`, { method: "POST" });
    charger();
  }

  async function toutMarquerLu() {
    await fetch("/api/notifications/tout-lire", { method: "POST" });
    charger();
  }

  if (!connecte) return null;

  return (
    <div className="relative">
      <button
        onClick={ouvrirMenu}
        className="relative rounded-full p-2 hover:bg-gray-100"
        aria-label="Notifications"
      >
        🔔
        {nonLues > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm font-semibold">Notifications</span>
            {nonLues > 0 && (
              <button
                onClick={toutMarquerLu}
                className="text-xs text-primary hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                Aucune notification.
              </p>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.lien || "#"}
                  onClick={() => marquerLue(n.id)}
                  className={`block border-b px-3 py-2 text-sm last:border-0 hover:bg-gray-50 ${
                    !n.lu ? "bg-primary/5" : ""
                  }`}
                >
                  <p className={!n.lu ? "font-medium" : "text-gray-600"}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
