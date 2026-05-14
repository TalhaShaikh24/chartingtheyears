'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, SettingsSchema } from '@/lib/schemas';
import { Card } from '@/components/ui/kit/Card';
import { KitInput, KitLabel } from '@/components/ui/kit/Input';
import { KitSelect } from '@/components/ui/kit/Select';
import { KitButton } from '@/components/ui/kit/Button';
import apiClient from '@/lib/apiClient';
import { getApiErrorMessage, showApiToast } from '@/components/ui/kit/Toast';

interface Stats {
  totalBooks: number;
  totalCategories: number;
  totalTags: number;
  averageRating: number;
  activeCountries: number;
}

export default function SettingsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Settings>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      siteName: 'Charting the Years',
      tagline: 'Interactive atlas of historical literature',
      adminEmail: 'ryan@historybookmap.com',
      defaultLanguage: 'English',
      defaultEra: '1900-1920',
      booksPerPage: 20,
      mapStyle: 'Dark ocean',
      // Display Options
      displayTheme: 'system',
      fontFamily: '',
      fontScale: 1,
      density: 1,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const settingsResponse = await apiClient.get<{ data: Settings }>('/api/settings');
        reset(settingsResponse.data.data);

        const statsResponse = await apiClient.get<{ data: Stats }>('/api/settings/stats');
        setStats(statsResponse.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (data: Settings) => {
    try {
      setIsSaving(true);
      await apiClient.patch('/api/settings', data);
      showApiToast({
        variant: 'success',
        title: 'Settings saved',
        message: 'Your configuration changes have been applied.',
      });
    } catch (err) {
      showApiToast({
        variant: 'error',
        title: 'Unable to save settings',
        message: getApiErrorMessage(err, 'Save request failed'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-surface-2 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Site settings */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Site settings</h2>
          <div className="space-y-5">
            <div>
              <KitLabel>Site name</KitLabel>
              <KitInput {...register('siteName')} />
              {errors.siteName && (
                <p className="mt-1 text-xs text-danger">{errors.siteName.message}</p>
              )}
            </div>
            <div>
              <KitLabel>Tagline</KitLabel>
              <KitInput {...register('tagline')} />
            </div>
            <div>
              <KitLabel>Admin email</KitLabel>
              <KitInput type="email" {...register('adminEmail')} />
              {errors.adminEmail && (
                <p className="mt-1 text-xs text-danger">{errors.adminEmail.message}</p>
              )}
            </div>
            <div>
              <KitLabel>Default language</KitLabel>
              <KitSelect
                {...register('defaultLanguage')}
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'French', label: 'French' },
                  { value: 'German', label: 'German' },
                  { value: 'Spanish', label: 'Spanish' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Display options (limited fields) */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Display options</h2>
          <div className="space-y-5">
            <div>
              <KitLabel>Default era</KitLabel>
              <KitInput {...register('defaultEra')} />
            </div>
            <div>
              <KitLabel>Books per page</KitLabel>
              <KitSelect
                {...register('booksPerPage', { valueAsNumber: true })}
                options={[
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 50, label: '50' },
                ]}
              />
            </div>
            <div>
              <KitLabel>Map style</KitLabel>
              <KitSelect
                {...register('mapStyle')}
                options={[
                  { value: 'Dark Ocean', label: 'Dark Ocean' },
                  { value: 'Light Ocean', label: 'Light Ocean' },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Database overview */}
      {stats && (
        <Card className="bg-surface-2/60">
          <h2 className="text-2xl font-semibold mb-6">Database overview</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <DbStat value={stats.totalBooks} label="Books" />
            <DbStat value={stats.totalTags} label="Tags" />
            <DbStat value={stats.totalCategories} label="Categories" />
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <KitButton type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save settings'}
        </KitButton>
        <KitButton type="button" variant="outline" onClick={() => reset()}>
          Reset to defaults
        </KitButton>
      </div>
    </form>
  );
}

function DbStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-surface-3/60 p-8 text-center">
      <div className="text-5xl font-semibold text-ink-soft">{value}</div>
      <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-ink-mute">{label}</div>
    </div>
  );
}
