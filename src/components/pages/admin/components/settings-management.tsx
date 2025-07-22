'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../../../../hooks/use-auth';
import { useSettings } from '../../../providers/settings-provider';

const THEMES = [
  { value: 'auto', label: { fr: 'Automatique', en: 'Auto' } },
  { value: 'light', label: { fr: 'Clair', en: 'Light' } },
  { value: 'dark', label: { fr: 'Sombre', en: 'Dark' } },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

export default function SettingsManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { settings, loading: settingsLoading } = useSettings();
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
        languagesAvailable: settings.languagesAvailable || ['fr', 'en'],
      });
      setLogoPreview(settings.logoUrl || null);
    }
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      handleChange('logoFile', file);
    }
  };

  const handleLanguagesChange = (value: string) => {
    let arr = form.languagesAvailable || [];
    if (arr.includes(value)) {
      arr = arr.filter((v: string) => v !== value);
    } else {
      arr = [...arr, value];
    }
    handleChange('languagesAvailable', arr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let logoUrl = form.logoUrl;
      if (form.logoFile) {
        // Upload logo file
        const data = new FormData();
        data.append('file', form.logoFile);
        const res = await fetch('/api/file-uploads', {
          method: 'POST',
          body: data,
        });
        const result = await res.json();
        logoUrl = result.url;
      }
      const payload = {
        ...form,
        logoUrl,
        logoFile: undefined,
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description:
          language === 'fr'
            ? 'Paramètres mis à jour avec succès'
            : 'Settings updated successfully',
        variant: 'success',
      });
    } catch (e: any) {
      setError(e.message);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Pseudo admin check (replace with real auth)
  const isAdmin = user?.role == 'admin' || user?.role == 'super_admin';
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-600">
          {language === 'fr' ? 'Accès refusé' : 'Access denied'}
        </span>
      </div>
    );
  }

  if (settingsLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Paramètres du site' : 'Site Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Site Name (EN/FR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium">
                {language === 'fr' ? 'Nom du site (FR)' : 'Site Name (FR)'}
              </label>
              <Input
                value={form.siteNameFr || ''}
                onChange={e => handleChange('siteNameFr', e.target.value)}
                placeholder="Nom du site en français"
              />
            </div>
            <div>
              <label className="font-medium">
                {language === 'fr' ? 'Nom du site (EN)' : 'Site Name (EN)'}
              </label>
              <Input
                value={form.siteName || ''}
                onChange={e => handleChange('siteName', e.target.value)}
                placeholder="Site name in English"
              />
            </div>
          </div>
          {/* Site Description (EN/FR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium">
                {language === 'fr' ? 'Description (FR)' : 'Description (FR)'}
              </label>
              <Input
                value={form.siteDescriptionFr || ''}
                onChange={e =>
                  handleChange('siteDescriptionFr', e.target.value)
                }
                placeholder="Description en français"
              />
            </div>
            <div>
              <label className="font-medium">
                {language === 'fr' ? 'Description (EN)' : 'Description (EN)'}
              </label>
              <Input
                value={form.siteDescription || ''}
                onChange={e => handleChange('siteDescription', e.target.value)}
                placeholder="Description in English"
              />
            </div>
          </div>
          {/* Contact Email */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Email de contact' : 'Contact Email'}
            </label>
            <Input
              type="email"
              value={form.contactEmail || ''}
              onChange={e => handleChange('contactEmail', e.target.value)}
              placeholder="info@gbhsbafia.cm"
            />
          </div>
          {/* Maintenance Mode */}
          <div className="flex items-center gap-4">
            <label className="font-medium">
              {language === 'fr' ? 'Mode maintenance' : 'Maintenance Mode'}
            </label>
            <Switch
              checked={!!form.maintenanceMode}
              onCheckedChange={val => handleChange('maintenanceMode', val)}
            />
          </div>
          {/* Logo Upload */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Logo du site' : 'Site Logo'}
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain border rounded"
                />
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="block"
              />
            </div>
          </div>
          {/* Theme */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Thème' : 'Theme'}
            </label>
            <Select
              value={form.theme || 'auto'}
              onValueChange={val => handleChange('theme', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Address */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Adresse' : 'Address'}
            </label>
            <Input
              value={form.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              placeholder={language === 'fr' ? 'Adresse' : 'Address'}
            />
          </div>
          {/* Phone */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Téléphone' : 'Phone'}
            </label>
            <Input
              value={form.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="(+237) 699 99 99 99"
            />
          </div>
          {/* Facebook */}
          <div>
            <label className="font-medium">Facebook</label>
            <Input
              value={form.facebook || ''}
              onChange={e => handleChange('facebook', e.target.value)}
              placeholder="Facebook URL"
            />
          </div>
          {/* Twitter */}
          <div>
            <label className="font-medium">Twitter</label>
            <Input
              value={form.twitter || ''}
              onChange={e => handleChange('twitter', e.target.value)}
              placeholder="Twitter URL"
            />
          </div>
          {/* Announcement Text & Toggle */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Bannière d’annonce' : 'Announcement Banner'}
            </label>
            <Input
              value={form.announcementText || ''}
              onChange={e => handleChange('announcementText', e.target.value)}
              placeholder={
                language === 'fr' ? 'Texte de la bannière' : 'Banner text'
              }
            />
            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={!!form.announcementEnabled}
                onCheckedChange={val =>
                  handleChange('announcementEnabled', val)
                }
              />
              <span>
                {language === 'fr' ? 'Activer la bannière' : 'Enable banner'}
              </span>
            </div>
          </div>
          {/* Language Default */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Langue par défaut' : 'Default Language'}
            </label>
            <Select
              value={form.languageDefault || 'fr'}
              onValueChange={val => handleChange('languageDefault', val)}
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
          {/* Languages Available (multi-select) */}
          <div>
            <label className="font-medium">
              {language === 'fr'
                ? 'Langues disponibles'
                : 'Available Languages'}
            </label>
            <div className="flex gap-4">
              {LANGUAGES.map(l => (
                <label key={l.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.languagesAvailable?.includes(l.value)}
                    onChange={() => handleLanguagesChange(l.value)}
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </div>
          {/* Updated At (read-only) */}
          <div>
            <label className="font-medium">
              {language === 'fr' ? 'Dernière mise à jour' : 'Last Updated'}
            </label>
            <Input
              value={
                form.updatedAt ? new Date(form.updatedAt).toLocaleString() : ''
              }
              readOnly
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>
          {/* Error */}
          {error && <div className="text-red-600 font-medium">{error}</div>}
          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading
                ? language === 'fr'
                  ? 'Enregistrement...'
                  : 'Saving...'
                : language === 'fr'
                  ? 'Enregistrer'
                  : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
