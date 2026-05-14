'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@/components/ui/kit/Icon';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const [globalError, setGlobalError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormValues) => {
    setGlobalError('');
    try {
      const res = await apiClient.post('/api/auth/signin', data);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        
        // Redirect based on role
        if (res.data.data.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user');
        }
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo">
          <Icon name="logo" size={28} />
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Atlas account</p>
      </div>

      {globalError && <div className="auth-global-error">{globalError}</div>}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            type="email"
            className="auth-input"
            placeholder="name@example.com"
            {...register('email')}
          />
          {errors.email && <span className="auth-error">{errors.email.message}</span>}
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <span className="auth-error">{errors.password.message}</span>}
        </div>

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="auth-footer">
        Don&apos;t have an account? <Link href="/auth/signup" className="auth-link">Sign up</Link>
      </div>
    </div>
  );
}
