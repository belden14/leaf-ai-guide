import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile | AgriVision AI" },
      {
        name: "description",
        content:
          "Update your farmer profile details such as name and farm location, and manage your AgriVision AI account.",
      },
      { property: "og:title", content: "Your AgriVision AI profile" },
      { property: "og:description", content: "Manage your farmer account details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id;
      if (!id) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, location")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      setEmail(data?.email ?? auth.user?.email ?? "");
      setFullName(data?.full_name ?? "");
      setLocation(data?.location ?? "");
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id;
    if (!id) {
      setSaving(false);
      toast.error("Your session has expired. Please sign in again.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ id, full_name: fullName, email, location });
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile. Please try again.");
      return;
    }
    toast.success("Profile updated.");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-2 text-muted-foreground">
          These details help tailor guidance to your farm. Your diagnoses remain private to you.
        </p>

        <form className="surface-card mt-6 space-y-5 p-6" onSubmit={save}>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Farm location</Label>
            <Input
              id="location"
              placeholder="District, country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving || loading}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={signOut}>
              Log out
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
