import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Secure (DB-adjacent) check -- use in admin pages, server actions and route
// handlers. Cached per-request so calling it multiple times during a render
// pass doesn't re-decrypt the cookie repeatedly.
export const verifyAdminSession = cache(async () => {
  const session = await getSession();

  if (!session?.userId || session.role !== "admin") {
    redirect("/admin/login");
  }

  return { userId: session.userId, role: session.role };
});

// Same check but returns null instead of redirecting -- for places (e.g. API
// routes) that need to return a 401/403 themselves.
export const getAdminSession = cache(async () => {
  const session = await getSession();
  if (!session?.userId || session.role !== "admin") return null;
  return { userId: session.userId, role: session.role };
});
