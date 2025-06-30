import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
  image?: string;
  className?: string;
}

export function SocialShare({ title, url, description = "", className = "" }: SocialShareProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description);
  const logoUrl = encodeURIComponent(`${window.location.origin}/logo.svg`);

  // Customize share text for different platforms
  const shareContent = {
    twitter: {
      text: `Check out this AI prompt template: "${title}"${description ? `\n\n${description}` : ""}`,
    },
    facebook: {
      quote: `Check out this AI prompt template: "${title}"${description ? `\n\n${description}` : ""}`,
    },
    linkedin: {
      title: `${title} - AI Prompt Template`,
      summary: description || "Discover and use high-quality AI prompt templates on Promplify",
    },
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.twitter.text)}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(shareContent.facebook.quote)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodeURIComponent(shareContent.linkedin.title)}&summary=${encodeURIComponent(
      shareContent.linkedin.summary
    )}&source=Promplify`,
  };

  const handleShare = async (platform: string) => {
    const shareUrl = shareLinks[platform as keyof typeof shareLinks];
    if (shareUrl) {
      // Calculate window size and position
      const width = 600;
      const height = 400;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      // Open share window with position and size settings
      window.open(
        shareUrl,
        `Share on ${platform}`,
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      // Create text with more information
      const shareText = `${title}\n${description}\n\nCheck out this AI prompt template on Promplify:\n${url}`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-400 mr-1">Share:</span>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white" onClick={() => handleShare("twitter")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M16.99 0h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L3.736 19.5H.426l7.73-8.835L0 0h6.826l4.713 6.231L16.99 0Zm-1.161 17.52h1.833L5.83 1.876H3.863L15.829 17.52Z" />
        </svg>
        <span className="sr-only">Share on X</span>
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white" onClick={() => handleShare("facebook")}>
        <Facebook className="h-4 w-4" />
        <span className="sr-only">Share on Facebook</span>
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white" onClick={() => handleShare("linkedin")}>
        <Linkedin className="h-4 w-4" />
        <span className="sr-only">Share on LinkedIn</span>
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white" onClick={handleCopyLink}>
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Copy link</span>
      </Button>
    </div>
  );
}
