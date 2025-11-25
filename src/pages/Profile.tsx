/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Bell,
  Shield,
  Palette,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const { user } = useAuth();
  const { holdings, watchlist } = usePortfolio();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Preferences state - load from localStorage
  const [emailNotifications, setEmailNotifications] = useState(
    () => localStorage.getItem("emailNotifications") !== "false"
  );
  const [priceAlerts, setPriceAlerts] = useState(
    () => localStorage.getItem("priceAlerts") !== "false"
  );
  const [marketUpdates, setMarketUpdates] = useState(
    () => localStorage.getItem("marketUpdates") !== "false"
  );
  const [aiInsights, setAiInsights] = useState(
    () => localStorage.getItem("aiInsights") !== "false"
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [chartType, setChartType] = useState(
    () => localStorage.getItem("chartType") || "line"
  );
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("currency") || "USD"
  );
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [showRiskDisclaimer, setShowRiskDisclaimer] = useState(
    () => localStorage.getItem("riskDisclaimerDisabled") !== "true"
  );


  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Sync dark mode with document class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First, try to fetch existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

      // If profile doesn't exist, create it
      if (error || !data) {
        console.log('Profile does not exist, creating...');
        
        // Create profile for existing user
        // Google OAuth provides: full_name, name, or avatar_url in user_metadata
        const googleName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.user_metadata?.display_name ||
                          null;
        const googleAvatar = user.user_metadata?.avatar_url || 
                            user.user_metadata?.picture ||
                            null;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            full_name: googleName || user.email?.split('@')[0] || '',
            avatar_url: googleAvatar || null,
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Even if creation fails, continue with empty profile
          setProfile(null);
          setFullName(googleName || user.email?.split('@')[0] || '');
        } else {
          setProfile(newProfile);
          setFullName(newProfile?.full_name || googleName || user.email?.split('@')[0] || '');
        }
      } else {
        // Profile exists, use it
        // But also check if Google OAuth name is available and profile name is empty
        const googleName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.user_metadata?.display_name ||
                          null;
        
        if (!data.full_name && googleName) {
          // Update profile with Google name if profile name is empty
          setFullName(googleName);
        } else {
          setFullName(data?.full_name || googleName || user.email?.split('@')[0] || '');
        }
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Set defaults even on error
      const googleName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.display_name ||
                        null;
      setProfile(null);
      setFullName(googleName || user.email?.split('@')[0] || '');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Use upsert to create if doesn't exist, update if exists
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: profile?.avatar_url || null,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || "Failed to update profile");
    }
  };

 const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    }
  };

  const handleSavePreferences = () => {
    // Save all preferences to localStorage
    localStorage.setItem("emailNotifications", String(emailNotifications));
    localStorage.setItem("priceAlerts", String(priceAlerts));
    localStorage.setItem("marketUpdates", String(marketUpdates));
    localStorage.setItem("aiInsights", String(aiInsights));
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    localStorage.setItem("chartType", chartType);
    localStorage.setItem("currency", currency);
    localStorage.setItem("timezone", timezone);
    
    toast.success("Preferences saved successfully!");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getTotalHoldings = () => holdings.length;
  const getTotalWatchlist = () => watchlist.length;
  
  // Calculate success rate (placeholder - would need actual trading data)
  const getSuccessRate = () => {
    // This would be calculated from actual trading data
    // For now, return a placeholder
    return null;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-heading font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Profile Card */}
          <Card className="lg:col-span-1 p-6 h-fit animate-slide-up">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24">
            
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-3xl font-bold text-white">
                 {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
               
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {loading ? "Loading..." : (
                  profile?.full_name || 
                  user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  user?.user_metadata?.display_name ||
                  user?.email?.split('@')[0] || 
                  "User"
                )}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                  {user?.email}
              </p>
              <div className="text-xs text-muted-foreground">
                Member since {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Holdings</span>
                <span className="font-semibold">{getTotalHoldings()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Watchlist Items</span>
                <span className="font-semibold">{getTotalWatchlist()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Portfolio Value</span>
                <span className="font-semibold text-success">
                  {holdings.length > 0 ? 'Active' : 'Empty'}
                </span>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="account" className="animate-slide-up">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5 text-secondary" />
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                  </div>

                  <div className="space-y-4">
                   <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon" disabled>
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                   <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <Separator />

                    <Button
                      onClick={handleSaveProfile}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-5 w-5 text-secondary" />
                    <h3 className="text-xl font-semibold">Security</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                    
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                       value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

 <Button 
                      variant="outline"
                      onClick={handleUpdatePassword}
                      disabled={!newPassword || !confirmPassword}
                    >
                      Update Password
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="h-5 w-5 text-secondary" />
                    <h3 className="text-xl font-semibold">Notification Settings</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotif">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your portfolio
                        </p>
                      </div>
                      <Switch
                        id="emailNotif"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="priceAlerts">Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when stocks hit target prices
                        </p>
                      </div>
                      <Switch
                        id="priceAlerts"
                        checked={priceAlerts}
                        onCheckedChange={setPriceAlerts}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketUpdates">Market Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Daily market summary and insights
                        </p>
                      </div>
                      <Switch 
                        id="marketUpdates" 
                        checked={marketUpdates}
                        onCheckedChange={setMarketUpdates}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="aiInsights">AI Insights</Label>
                        <p className="text-sm text-muted-foreground">
                          Personalized AI recommendations
                        </p>
                      </div>
                      <Switch 
                        id="aiInsights" 
                        checked={aiInsights}
                        onCheckedChange={setAiInsights}
                      />
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      className="bg-secondary hover:bg-secondary/90 mt-4"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Palette className="h-5 w-5 text-secondary" />
                    <h3 className="text-xl font-semibold">Display Preferences</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle between light and dark theme
                        </p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={darkMode}
                        onCheckedChange={(checked) => {
                          setDarkMode(checked);
                          localStorage.setItem("theme", checked ? "dark" : "light");
                        }}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Default Chart Type</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button 
                          variant={chartType === "line" ? "default" : "outline"}
                          onClick={() => setChartType("line")}
                        >
                          Line Chart
                        </Button>
                        <Button 
                          variant={chartType === "candlestick" ? "default" : "outline"}
                          onClick={() => setChartType("candlestick")}
                        >
                          Candlestick
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Currency Display</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <Button 
                          variant={currency === "USD" ? "default" : "outline"}
                          onClick={() => setCurrency("USD")}
                        >
                          USD ($)
                        </Button>
                        <Button 
                          variant={currency === "EUR" ? "default" : "outline"}
                          onClick={() => setCurrency("EUR")}
                        >
                          EUR (€)
                        </Button>
                        <Button 
                          variant={currency === "GBP" ? "default" : "outline"}
                          onClick={() => setCurrency("GBP")}
                        >
                          GBP (£)
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="riskDisclaimer">Risk Disclaimer</Label>
                        <p className="text-sm text-muted-foreground">
                          Show risk warning on Screener and Analysis pages
                        </p>
                      </div>
                      <Switch
                        id="riskDisclaimer"
                        checked={showRiskDisclaimer}
                        onCheckedChange={(checked) => {
                          setShowRiskDisclaimer(checked);
                          if (checked) {
                            localStorage.removeItem("riskDisclaimerDisabled");
                          } else {
                            localStorage.setItem("riskDisclaimerDisabled", "true");
                          }
                          toast.success(`Risk disclaimer ${checked ? "enabled" : "disabled"}`);
                        }}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Input
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="e.g., America/New_York"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </p>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      className="bg-secondary hover:bg-secondary/90 mt-4"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
