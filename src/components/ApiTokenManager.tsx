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
            <Button onClick={handleCreateToken} disabled={isLoading} className="bg-[#2C106A] hover:bg-[#1F0B4C] text-white transition-colors">
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
                <div>
                  <h4 className="font-medium">{token.name}</h4>
                  <p className="text-sm text-muted-foreground">Created: {new Date(token.created_at).toLocaleDateString()}</p>
                  {token.last_used_at && <p className="text-sm text-muted-foreground">Last used: {new Date(token.last_used_at).toLocaleDateString()}</p>}
                  {token.expires_at && <p className="text-sm text-muted-foreground">Expires: {new Date(token.expires_at).toLocaleDateString()}</p>}
                </div>
                <Button variant="destructive" onClick={() => handleDeleteToken(token.id)}>
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
            <DialogDescription>Please copy your API token now. You won't be able to see it again!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm">{newTokenValue}</div>
            <div className="flex justify-end">
              <Button onClick={handleCopyToken} className="flex items-center gap-2 bg-[#2C106A] hover:bg-[#1F0B4C] text-white transition-colors">
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
