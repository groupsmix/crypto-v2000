"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { User, Mail, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          {message && (
            <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-md border border-input bg-muted pl-10 pr-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed at this time.
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>

      {/* Security Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-sm font-medium mb-1">Change Password</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Password change functionality coming soon.
            </p>
            <Button variant="outline" size="sm" disabled className="opacity-50">
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 text-destructive">
          Danger Zone
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-sm font-medium mb-1">Sign Out</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Sign out of your account on this device.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
