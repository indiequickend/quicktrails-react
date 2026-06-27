import { NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// Optimistic check only (cookie presence + signature), runs on every request
// to /admin/*. The real authorization check (verifyAdminSession in
// src/lib/dal.js) still runs server-side on every admin page/action -- this
// just avoids rendering the admin shell for obviously-unauthenticated users.
export default async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/waypoint/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/waypoint")) {
    const cookie = req.cookies.get("qt_session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId || session.role !== "admin") {
      return NextResponse.redirect(new URL("/waypoint/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/waypoint/:path*"],
};
