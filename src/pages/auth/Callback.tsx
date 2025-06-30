import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Callback() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          // Update user metadata to mark email as confirmed
          await supabase.auth.updateUser({
            data: { email_confirmed: true },
          });

          toast.success("Email verified successfully! Redirecting to dashboard...");
          navigate("/dashboard");
        } else {
          toast.error("Invalid or expired verification link. Please try registering again.");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("An error occurred during verification. Please try again.");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return null;
}
