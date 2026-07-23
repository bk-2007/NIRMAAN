import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nirmaan_enterprise_super_secret_jwt_key_2026"
);

interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "JURY" | "COORDINATOR";
  roomId?: string;
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("nirmaan_token")?.value;

    let decoded: TokenPayload | null = null;
    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        decoded = verified.payload as unknown as TokenPayload;
      } catch {
        decoded = null;
      }
    }

    // Auth pages (login & root)
    if (pathname === "/login" || pathname === "/") {
      if (decoded) {
        if (decoded.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else if (decoded.role === "JURY") {
          return NextResponse.redirect(new URL("/jury/dashboard", request.url));
        } else if (decoded.role === "COORDINATOR") {
          return NextResponse.redirect(new URL("/coord/dashboard", request.url));
        }
      }
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    // Protected route checking
    const isAdminRoute = pathname.startsWith("/admin");
    const isJuryRoute = pathname.startsWith("/jury");
    const isCoordRoute = pathname.startsWith("/coord");

    if (isAdminRoute || isJuryRoute || isCoordRoute) {
      if (!decoded) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (isAdminRoute && decoded.role !== "ADMIN") {
        return new NextResponse("Forbidden: Admin access required", { status: 403 });
      }

      if (isJuryRoute && decoded.role !== "JURY") {
        return new NextResponse("Forbidden: Jury access required", { status: 403 });
      }

      if (isCoordRoute && decoded.role !== "COORDINATOR") {
        return new NextResponse("Forbidden: Coordinator access required", { status: 403 });
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/jury/:path*", "/coord/:path*", "/login", "/"],
};
