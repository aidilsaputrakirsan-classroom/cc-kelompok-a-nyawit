import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Shield, Database, Users, Mail, ChevronRight, X } from 'lucide-react';

type SettingCategory = 'general' | 'notifications' | 'security' | 'data' | 'users' | 'integrations' | null;

export function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SettingCategory>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const settingSections = [
    {
      id: 'general' as const,
      title: 'General Settings',
      icon: Settings,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      items: ['Company Information', 'Time Zone', 'Currency', 'Language']
    },
    {
      id: 'notifications' as const,
      title: 'Notifications',
      icon: Bell,
      color: '#10B981',
      bgColor: '#ECFDF5',
      items: ['Email Notifications', 'Push Notifications', 'SMS Alerts', 'Slack Integration']
    },
    {
      id: 'security' as const,
      title: 'Security',
      icon: Shield,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      items: ['Two-Factor Authentication', 'Password Policy', 'Session Timeout', 'IP Whitelist']
    },
    {
      id: 'data' as const,
      title: 'Data Management',
      icon: Database,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      items: ['Backup Schedule', 'Data Retention', 'Export Settings', 'Archive Rules']
    },
    {
      id: 'users' as const,
      title: 'User Management',
      icon: Users,
      color: '#6B7280',
      bgColor: '#F3F4F6',
      items: ['User Roles', 'Permissions', 'Invite Users', 'Team Settings']
    },
    {
      id: 'integrations' as const,
      title: 'Integrations',
      icon: Mail,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      items: ['API Keys', 'Webhooks', 'Third-Party Apps', 'SSO Configuration']
    }
  ];

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast({
      title: 'Settings saved',
      description: 'Your settings have been successfully updated.',
    });
  };

  const handleCancel = () => {
    setHasChanges(false);
    setSelectedCategory(null);
  };

  const renderCategoryContent = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Enter company name" defaultValue="Asset Management Inc." onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select defaultValue="utc" onValueChange={handleChange}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                  <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                  <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                  <SelectItem value="gmt">London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="usd" onValueChange={handleChange}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="jpy">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en" onValueChange={handleChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch defaultChecked onCheckedChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch defaultChecked onCheckedChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Slack Integration</Label>
                <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-policy">Password Policy</Label>
              <Select defaultValue="medium" onValueChange={handleChange}>
                <SelectTrigger id="password-policy">
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (8+ characters)</SelectItem>
                  <SelectItem value="medium">Medium (10+ characters, mixed case)</SelectItem>
                  <SelectItem value="high">High (12+ characters, symbols required)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="30" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-whitelist">IP Whitelist</Label>
              <Input id="ip-whitelist" placeholder="Enter IP addresses (comma separated)" onChange={handleChange} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="backup-schedule">Backup Schedule</Label>
              <Select defaultValue="daily" onValueChange={handleChange}>
                <SelectTrigger id="backup-schedule">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention Period (days)</Label>
              <Input id="data-retention" type="number" defaultValue="365" onChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Export</Label>
                <p className="text-sm text-muted-foreground">Automatically export data reports</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archive-rules">Archive After (days)</Label>
              <Input id="archive-rules" type="number" defaultValue="90" onChange={handleChange} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-role">Default User Role</Label>
              <Select defaultValue="viewer" onValueChange={handleChange}>
                <SelectTrigger id="default-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">Users can self-register accounts</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Invite User by Email</Label>
              <div className="flex gap-2">
                <Input id="invite-email" type="email" placeholder="user@example.com" onChange={handleChange} />
                <Button>Send Invite</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-size">Team Size Limit</Label>
              <Input id="team-size" type="number" defaultValue="50" onChange={handleChange} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input id="api-key" type="password" value="sk_live_..." readOnly />
                <Button variant="outline">Regenerate</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input id="webhook-url" placeholder="https://example.com/webhook" onChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Zapier Integration</Label>
                <p className="text-sm text-muted-foreground">Connect with Zapier workflows</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Single Sign-On (SSO)</Label>
                <p className="text-sm text-muted-foreground">Enable SAML-based SSO</p>
              </div>
              <Switch onCheckedChange={handleChange} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedCategory) {
    const section = settingSections.find(s => s.id === selectedCategory);
    if (!section) return null;

    const Icon = section.icon;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-sm hover:underline"
            style={{ color: '#6B7280' }}
          >
            Settings
          </button>
          <ChevronRight className="h-4 w-4" style={{ color: '#6B7280' }} />
          <span className="text-sm font-medium" style={{ color: '#111827' }}>
            {section.title}
          </span>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: section.bgColor }}>
                  <Icon className="h-5 w-5" style={{ color: section.color }} />
                </div>
                <CardTitle style={{ color: '#111827' }}>{section.title}</CardTitle>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" style={{ color: '#6B7280' }} />
              </button>
            </div>
          </CardHeader>
          <CardContent>{renderCategoryContent()}</CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Settings</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
          Manage your application preferences and configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCategory(section.id)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: section.bgColor }}>
                    <Icon className="h-5 w-5" style={{ color: section.color }} />
                  </div>
                  <CardTitle className="text-lg" style={{ color: '#111827' }}>
                    {section.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm" style={{ color: '#6B7280' }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#FEE2E2' }}>
              <div>
                <h4 className="font-medium" style={{ color: '#EF4444' }}>Reset Application</h4>
                <p className="text-sm" style={{ color: '#6B7280' }}>Clear all data and reset to default settings</p>
              </div>
              <Button variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                Reset
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#FEE2E2' }}>
              <div>
                <h4 className="font-medium" style={{ color: '#EF4444' }}>Delete Account</h4>
                <p className="text-sm" style={{ color: '#6B7280' }}>Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

