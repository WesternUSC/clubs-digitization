// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  // Configure the paths you want to protect
  pages: {
    signIn: "/login", // Redirect unauthenticated users here
  },
})

// Protect these paths only (regex supported)
export const config = {
  matcher: ["/dashboard/:path*"], // adjust as needed
}
