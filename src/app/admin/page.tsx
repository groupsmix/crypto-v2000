import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | CryptoCompare AI",
  description: "Admin dashboard for CryptoCompare AI.",
};

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Admin panel coming soon.</p>
      </div>
    </main>
  );
}
