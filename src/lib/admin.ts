import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Defense-in-depth check for admin server components.
 *
 * The middleware already enforces Basic Auth on /admin pages, so under
 * normal operation this function will always find a valid Authorization
 * header.  If the middleware is ever misconfigured, bypassed, or
 * disabled (e.g. during a deployment error), this second check
 * ensures admin pages still reject unauthenticated requests.
 */
export async function requireAdmin() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // No password configured — allow access (development mode).
  if (!adminPassword) {
    return;
  }

  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);
        const [, password] = decoded.split(":");
        if (password === adminPassword) {
          return; // authenticated
        }
      } catch {
        // malformed base64 — fall through to redirect
      }
    }
  }

  // Not authenticated — redirect to home page.
  redirect("/");
}
