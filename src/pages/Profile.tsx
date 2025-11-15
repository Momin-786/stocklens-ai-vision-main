/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
    const [showRiskDisclaimer, setShowRiskDisclaimer] = useState(
    () => localStorage.getItem("riskDisclaimerDisabled") !== "true"
  );


 useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFullName(data?.full_name || "");
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error: any) {
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
    toast.success("Preferences saved!");
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
                {loading ? "Loading..." : profile?.full_name || "User"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                  {user?.email}
              </p>
              <div className="text-xs text-muted-foreground">
                Member since Jan 2024
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Analyzed</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Watchlist Items</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-success">89%</span>
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
                      <Switch id="marketUpdates" />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="aiInsights">AI Insights</Label>
                        <p className="text-sm text-muted-foreground">
                          Personalized AI recommendations
                        </p>
                      </div>
                      <Switch id="aiInsights" defaultChecked />
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
                          document.documentElement.classList.toggle("dark", checked);
                        }}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Default Chart Type</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button variant="outline">Line Chart</Button>
                        <Button variant="outline">Candlestick</Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Currency Display</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <Button variant="outline">USD ($)</Button>
                        <Button variant="outline">EUR (€)</Button>
                        <Button variant="outline">GBP (£)</Button>
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
                            sessionStorage.clear();
                            toast.success("Risk disclaimer enabled");
                          } else {
                            localStorage.setItem("riskDisclaimerDisabled", "true");
                            toast.success("Risk disclaimer disabled");
                          }
                        }}
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Time Zone</Label>
                      <Input
                        defaultValue="America/New_York (EST)"
                        className="mt-2"
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
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
