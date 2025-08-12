import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Radio, Link as LinkIcon, Copy, Check } from "lucide-react";

const Setup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blueTeamName, setBlueTeamName] = useState("Blue Team");
  const [redTeamName, setRedTeamName] = useState("Red Team");
  const [draftId, setDraftId] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Generate a random ID for the draft
  const generateDraftId = () => {
    return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(link);
      // Toast notification removed per user request
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const handleCreateDraft = () => {
    if (!blueTeamName.trim() || !redTeamName.trim()) {
      toast({
        title: "Team names required",
        description: "Please enter names for both teams",
        variant: "destructive"
      });
      return;
    }

    const newDraftId = generateDraftId();
    setDraftId(newDraftId);
    
    // Save draft data to sessionStorage
    const draftData = {
      blueTeamName,
      redTeamName,
      blueReady: false,
      redReady: false,
      createdAt: new Date().toISOString()
    };
    
    sessionStorage.setItem(`draft_${newDraftId}`, JSON.stringify(draftData));
    
    // Toast notification removed per user request
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-lol-dark">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-lol-gold mb-2">Champion Draft</h1>
          <p className="text-lol-text opacity-70">Create a new draft session and share links with participants</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Setup Card */}
          <Card className="bg-black/50 border-lol-gold/30">
            <CardHeader>
              <CardTitle className="text-lol-gold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Team Setup
              </CardTitle>
              <CardDescription className="text-lol-text/70">
                Enter the names for both teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Blue Team Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-blue-200">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Blue Team Name
                </label>
                <Input 
                  value={blueTeamName}
                  onChange={(e) => setBlueTeamName(e.target.value)}
                  className="bg-blue-950/20 border-blue-500/30 text-blue-200 placeholder:text-blue-200/50"
                  placeholder="Enter blue team name"
                />
              </div>

              {/* Red Team Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-red-200">
                  <Shield className="h-4 w-4 text-red-500" />
                  Red Team Name
                </label>
                <Input 
                  value={redTeamName}
                  onChange={(e) => setRedTeamName(e.target.value)}
                  className="bg-red-950/20 border-red-500/30 text-red-200 placeholder:text-red-200/50"
                  placeholder="Enter red team name"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateDraft}
                className="w-full bg-lol-gold hover:bg-yellow-500 text-black font-semibold"
              >
                Create Draft Session
              </Button>
            </CardFooter>
          </Card>

          {/* Links Card */}
          <Card className={`bg-black/50 border-lol-gold/30 ${!draftId && 'opacity-50 pointer-events-none'}`}>
            <CardHeader>
              <CardTitle className="text-lol-gold flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Draft Links
              </CardTitle>
              <CardDescription className="text-lol-text/70">
                {draftId ? 'Share these links with the participants' : 'Create a draft to get sharing links'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Link Items */}
              <div className="space-y-3">
                {/* Blue Team Link */}
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-200">Blue Team Captain</span>
                  </div>
                  <div className="relative">
                    <code className="text-xs text-blue-200/70 break-all block p-2 pr-10 rounded bg-blue-950/30">
                      {draftId ? `${window.location.origin}/draft/${draftId}?team=${encodeURIComponent(blueTeamName)}&blue=${encodeURIComponent(blueTeamName)}&red=${encodeURIComponent(redTeamName)}` : 'Link will appear here...'}
                    </code>
                    {draftId && (
                      <button
                        onClick={() => handleCopyLink(`${window.location.origin}/draft/${draftId}?team=${encodeURIComponent(blueTeamName)}&blue=${encodeURIComponent(blueTeamName)}&red=${encodeURIComponent(redTeamName)}`)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-900/30 rounded transition-colors"
                      >
                        {copiedLink === `${window.location.origin}/draft/${draftId}?team=${encodeURIComponent(blueTeamName)}&blue=${encodeURIComponent(blueTeamName)}&red=${encodeURIComponent(redTeamName)}` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Red Team Link */}
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-200">Red Team Captain</span>
                  </div>
                  <div className="relative">
                    <code className="text-xs text-red-200/70 break-all block p-2 pr-10 rounded bg-red-950/30">
                      {draftId ? `${window.location.origin}/draft/${draftId}?team=${encodeURIComponent(redTeamName)}&blue=${encodeURIComponent(blueTeamName)}&red=${encodeURIComponent(redTeamName)}` : 'Link will appear here...'}
                    </code>
                    {draftId && (
                      <button
                        onClick={() => handleCopyLink(`${window.location.origin}/draft/${draftId}?team=${encodeURIComponent(redTeamName)}&blue=${encodeURIComponent(blueTeamName)}&red=${encodeURIComponent(redTeamName)}`)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-red-900/30 rounded transition-colors"
                      >
                        {copiedLink === `${window.location.origin}/draft/${draftId}?team=${encodeURIComponent(redTeamName)}&blue=${encodeURIComponent(blueTeamName)}&red=${encodeURIComponent(redTeamName)}` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-red-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Spectator Link */}
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-200">Spectator View</span>
                  </div>
                  <div className="relative">
                    <code className="text-xs text-purple-200/70 break-all block p-2 pr-10 rounded bg-purple-950/30">
                      {draftId ? `${window.location.origin}/draft/${draftId}?team=spectator` : 'Link will appear here...'}
                    </code>
                    {draftId && (
                      <button
                        onClick={() => handleCopyLink(`${window.location.origin}/draft/${draftId}?team=spectator`)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-purple-900/30 rounded transition-colors"
                      >
                        {copiedLink === `${window.location.origin}/draft/${draftId}?team=spectator` ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-purple-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Broadcast Link */}
                <div className="p-3 rounded-lg bg-green-950/20 border border-green-500/30 opacity-60">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-200">Broadcast View</span>
                  </div>
                  <div className="relative">
                    <div className="text-xs text-green-200/70 block p-2 rounded bg-green-950/30 text-center">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Setup;
