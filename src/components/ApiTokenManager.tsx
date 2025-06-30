import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { generateApiToken } from "../lib/api-auth";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";

interface ApiToken {
  id: string;
  name: string;
  token: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export function ApiTokenManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState("");
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});

  const toggleTokenVisibility = (tokenId: string) => {
    setVisibleTokens((prev) => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }));
  };

  const formatToken = (token: string, isVisible: boolean) => {
    if (!token) return "";
    if (isVisible) return token;
    return `${token.slice(0, 8)}...${token.slice(-8)}`;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  async function fetchTokens() {
    setIsLoadingTokens(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("api_tokens").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast.error("Failed to fetch API tokens");
    } finally {
      setIsLoadingTokens(false);
    }
  }

  async function handleCreateToken() {
    if (!newTokenName.trim()) {
      toast.error("Please enter a token name");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { token, error } = await generateApiToken(user.id, newTokenName);
      if (error) throw new Error(error);

      setNewTokenValue(token);
      setShowTokenDialog(true);
      setNewTokenName("");
      await fetchTokens();
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create API token");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteToken(tokenId: string) {
    try {
      const { error } = await supabase.from("api_tokens").delete().eq("id", tokenId);

      if (error) throw error;
      toast.success("API token deleted successfully");
      fetchTokens();
    } catch (error) {
      console.error("Error deleting token:", error);
      toast.error("Failed to delete API token");
    }
  }

  async function handleCopyToken() {
    try {
      await navigator.clipboard.writeText(newTokenValue);
      toast.success("Token copied to clipboard");
    } catch (error) {
      console.error("Error copying token:", error);
      toast.error("Failed to copy token");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">API Tokens</h2>
        <p className="text-muted-foreground">Manage your API tokens for programmatic access to your prompts.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input id="tokenName" value={newTokenName} onChange={(e) => setNewTokenName(e.target.value)} placeholder="Enter a name for your token" disabled={isLoading} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreateToken} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white transition-colors shadow-md hover:shadow-lg">
              {isLoading ? "Creating..." : "Create Token"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Tokens</h3>
        {isLoadingTokens ? (
          <div className="space-y-4">
            <Skeleton className="h-[72px] w-full rounded-lg" />
            <Skeleton className="h-[72px] w-full rounded-lg" />
          </div>
        ) : tokens.length === 0 ? (
          <p className="text-muted-foreground">No API tokens found.</p>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1 mr-4">
                  <h4 className="font-medium">{token.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Created: {new Date(token.created_at).toLocaleString()}</p>
                    {token.last_used_at && <p>Last used: {new Date(token.last_used_at).toLocaleString()}</p>}
                    {token.expires_at && <p>Expires: {new Date(token.expires_at).toLocaleString()}</p>}
                  </div>
                </div>
                <Button variant="destructive" onClick={() => handleDeleteToken(token.id)} className="shadow-sm hover:shadow-md transition-all">
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Token Created</DialogTitle>
            <DialogDescription>Copy your API token for use in your applications.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm">{newTokenValue}</div>
            <div className="flex justify-end">
              <Button onClick={handleCopyToken} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white transition-colors shadow-md hover:shadow-lg">
                <Copy className="h-4 w-4" />
                Copy Token
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
