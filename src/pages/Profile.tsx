import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { updateMeta } from "@/utils/meta";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    website: "",
    avatar_url: "",
    bio: "",
    company: "",
    location: "",
  });

  useEffect(() => {
    updateMeta("Profile", "Manage your Promplify profile settings and preferences.", "profile settings, account management, user preferences");
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          navigate("/auth");
          return;
        }

        // Load user data and profile data in parallel
        const [userResponse, profileResponse] = await Promise.all([supabase.auth.getUser(), supabase.from("profiles").select("*").eq("id", session.user.id).single()]);

        if (userResponse.error) throw userResponse.error;
        const { user } = userResponse.data;

        // Merge data, prioritizing profile data
        const profileData =
          profileResponse.error && profileResponse.error.code === "PGRST116"
            ? {}
            : profileResponse.error
            ? (() => {
                throw profileResponse.error;
              })()
            : profileResponse.data;

        const initialProfile = {
          full_name: profileData?.full_name || user?.user_metadata?.full_name || "",
          username: profileData?.username || user?.user_metadata?.username || "",
          website: profileData?.website || "",
          avatar_url: profileData?.avatar_url || user?.user_metadata?.avatar_url || "",
          bio: profileData?.bio || "",
          company: profileData?.company || "",
          location: profileData?.location || "",
        };

        setProfile(initialProfile);
        // Store the initial profile data
        window.localStorage.setItem("initialProfile", JSON.stringify(initialProfile));
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get the initial profile data
      const initialProfile = JSON.parse(window.localStorage.getItem("initialProfile") || "{}");

      // Only include changed fields in the update
      const updates = Object.entries(profile).reduce((acc, [key, value]) => {
        if (value !== initialProfile[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // If nothing has changed, just return
      if (Object.keys(updates).length === 0) {
        toast.success("No changes to save");
        setIsSaving(false);
        return;
      }

      // Update auth metadata only if relevant fields have changed
      if (updates.full_name || updates.username || updates.avatar_url) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: profile.full_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
          },
        });

        if (authError) throw authError;
      }

      // Update profile data with only changed fields
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (profileError) {
        if (profileError.code === "23505") {
          toast.error("Username is already taken. Please choose another one.");
          return;
        }
        throw profileError;
      }

      // Update the stored initial profile data
      window.localStorage.setItem("initialProfile", JSON.stringify(profile));
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SEO
          canonicalPath="/profile"
          title="Profile - Promplify"
          description="Manage your Promplify profile settings and account information."
          keywords="profile, account settings, user profile"
        />
        <meta name="robots" content="noindex, nofollow" />
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        canonicalPath="/profile"
        title="Profile - Promplify"
        description="Manage your Promplify profile settings and account information."
        keywords="profile, account settings, user profile"
      />
      <meta name="robots" content="noindex, nofollow" />
      <Navigation />
      <div className="flex-1">
        <main className="container max-w-2xl mx-auto p-6 pt-32">
          <div className="bg-white shadow-sm rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="max-w-md" placeholder="Your full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="max-w-md" placeholder="Your username" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="max-w-md" placeholder="A short bio about yourself" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="max-w-md" placeholder="Your company name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="max-w-md" placeholder="Your location" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="max-w-md"
                  placeholder="https://your-website.com"
                />
              </div>

              <Button type="submit" disabled={isSaving} className="w-full md:w-auto bg-[#2C106A] hover:bg-[#1F0B4C]">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </main>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
