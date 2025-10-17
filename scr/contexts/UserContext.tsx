// scr/contexts/UserContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/** ------------------ Types ------------------ */
export type Plan = "free" | "pro" | "team";
export interface User {
  id: string;
  email: string;
  subscriptionPlan: Plan;
  subscriptionActive: boolean;
  lastCreditRefresh: string; // ISO date (YYYY-MM-DD)
  creditsLeft: number;
}

interface UserContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshCredits: (u?: User) => Promise<void>;
  upgradeUser: (plan: Plan) => Promise<void>;
}

/** ------------------ Context ------------------ */
const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
};

/** ------------------ Helpers ------------------ */
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * If the stored refresh date is not today, top up credits.
 * (Adjust the numbers to match your product logic.)
 */
async function topUpIfNewDay(u: User, setUser: (v: User) => void) {
  const isNewDay = u.lastCreditRefresh !== todayISO();
  if (!isNewDay) return;

  const topped: User = {
    ...u,
    lastCreditRefresh: todayISO(),
    // Example policy: free gets 500/day, pro 3,000/day, team 10,000/day
    creditsLeft:
      u.subscriptionPlan === "team" ? 10000 : u.subscriptionPlan === "pro" ? 3000 : 500,
  };
  setUser(topped);
}

/** ------------------ Provider ------------------ */
export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Called by screens that need to ensure credits are fresh.
  const refreshCredits = async (incoming?: User) => {
    const base = incoming ?? user;
    if (!base) return;
    await topUpIfNewDay(base, (u) => setUser(u));
  };

  // TEMP: Local demo user initializer (no Supabase).
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Local demo user so build/deploy works without DB
        const userData: User = {
          id: "demo",
          email: "demo@example.com",
          subscriptionPlan: "free",
          subscriptionActive: true,
          lastCreditRefresh: todayISO(),
          creditsLeft: 500,
        };

        setUser(userData);
        await refreshCredits(userData);
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    };

    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional: handler for upgrading plan (pure client for now).
  const upgradeUser = async (plan: Plan) => {
    if (!user) return;
    try {
      // In DB-backed version you would update Supabase here.
      const updated: User = {
        ...user,
        subscriptionPlan: plan,
        subscriptionActive: true,
      };
      setUser(updated);
      await refreshCredits(updated);
    } catch (error) {
      console.error("upgradeUser error:", error);
    }
  };

  const value = useMemo<UserContextValue>(
    () => ({ user, setUser, refreshCredits, upgradeUser }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
