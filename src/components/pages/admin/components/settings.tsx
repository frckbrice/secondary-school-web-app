'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Switch } from '../../../../components/ui/switch';
import { useToast } from '../../../../hooks/use-toast';
import { useLanguage } from '../../../../hooks/use-language';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];
const THEMES = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsManagement() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<any>({
    siteName: '',
    contactEmail: '',
    maintenanceMode: false,
    logoUrl: '',
    theme: 'auto',
    address: '',
    phone: '',
    facebook: '',
    twitter: '',
    announcementText: '',
    announcementEnabled: false,
    languageDefault: 'fr',
    languagesAvailable: ['fr', 'en'],
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({ ...settings, ...data });
        setLogoPreview(data.logoUrl || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
    // eslint-disable-next-line
    }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleField = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    let logoUrl = settings.logoUrl;
    if (logoFile) {
      // Upload logo to /api/file-uploads (simulate Cloudinary/local)
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('relatedType', 'site-logo');
      formData.append('relatedId', 'site-logo');
      try {
        const res = await fetch('/api/file-uploads', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) logoUrl = data.url;
      } catch {
        setError('Logo upload failed');
        setSaving(false);
        return;
      }
    }

    // update the settings with the site logo
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, logoUrl }),
      });
      if (!res.ok) throw new Error('Save failed');

      const updated = await res.json();
      setSettings(updated);
      setLogoPreview(updated.logoUrl || null);
      setLogoFile(null);
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Paramètres enregistrés avec succès.'
            : 'Settings saved successfully.',
        variant: 'success',
      });
    } catch {
      setError('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg">
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  // Pseudo admin check (replace with real auth)
  const isAdmin = true;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-600">
          {language === 'fr' ? 'Accès refusé' : 'Access denied'}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {language === 'fr' ? 'Paramètres Administrateur' : 'Admin Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="siteName"
                  >
                    {language === 'fr' ? 'Nom du site' : 'Site Name'}
                  </label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={e => handleField('siteName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="contactEmail"
                  >
                    {language === 'fr' ? 'Email de contact' : 'Contact Email'}
                  </label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={e => handleField('contactEmail', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="address"
                  >
                    {language === 'fr' ? 'Adresse' : 'Address'}
                  </label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={e => handleField('address', e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="phone"
                  >
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={e => handleField('phone', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {language === 'fr'
                      ? 'Mode maintenance'
                      : 'Maintenance Mode'}
                  </span>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={v => handleField('maintenanceMode', v)}
                    aria-label={
                      language === 'fr'
                        ? 'Activer le mode maintenance'
                        : 'Enable maintenance mode'
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {language === 'fr'
                      ? 'Bannière Annonce'
                      : 'Announcement Banner'}
                  </span>
                  <Switch
                    checked={settings.announcementEnabled}
                    onCheckedChange={v => handleField('announcementEnabled', v)}
                    aria-label={
                      language === 'fr'
                        ? 'Activer la bannière'
                        : 'Enable announcement banner'
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="announcementText"
                  >
                    {language === 'fr'
                      ? 'Texte de la bannière'
                      : 'Announcement Text'}
                  </label>
                  <Input
                    id="announcementText"
                    value={settings.announcementText}
                    onChange={e =>
                      handleField('announcementText', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400">Logo</span>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="theme"
                >
                  {language === 'fr' ? 'Thème' : 'Theme'}
                </label>
                <Select
                  value={settings.theme}
                  onValueChange={v => handleField('theme', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="languageDefault"
                >
                  {language === 'fr' ? 'Langue par défaut' : 'Default Language'}
                </label>
                <Select
                  value={settings.languageDefault}
                  onValueChange={v => handleField('languageDefault', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="languagesAvailable"
                >
                  {language === 'fr'
                    ? 'Langues disponibles'
                    : 'Available Languages'}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {LANGUAGES.map(l => (
                    <label key={l.value} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={settings.languagesAvailable?.includes(l.value)}
                        onChange={e => {
                          const arr = settings.languagesAvailable || [];
                          if (e.target.checked) {
                            handleField('languagesAvailable', [
                              ...arr,
                              l.value,
                            ]);
                          } else {
                            handleField(
                              'languagesAvailable',
                              arr.filter((v: string) => v !== l.value)
                            );
                          }
                        }}
                      />
                      {l.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="facebook"
                >
                  Facebook
                </label>
                <Input
                  id="facebook"
                  value={settings.facebook}
                  onChange={e => handleField('facebook', e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="twitter"
                >
                  Twitter
                </label>
                <Input
                  id="twitter"
                  value={settings.twitter}
                  onChange={e => handleField('twitter', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving
                  ? language === 'fr'
                    ? 'Enregistrement...'
                    : 'Saving...'
                  : language === 'fr'
                    ? 'Enregistrer'
                    : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
