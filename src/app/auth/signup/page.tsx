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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [globalError, setGlobalError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setGlobalError('');
    try {
      const res = await apiClient.post('/api/auth/signup', data);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        router.push('/user'); // Signup always grants USER role
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo">
          <Icon name="logo" size={28} />
        </div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join the Atlas community today</p>
      </div>

      {globalError && <div className="auth-global-error">{globalError}</div>}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-field">
          <label className="auth-label">Full Name</label>
          <input
            type="text"
            className="auth-input"
            placeholder="John Doe"
            {...register('name')}
          />
          {errors.name && <span className="auth-error">{errors.name.message}</span>}
        </div>

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

        <div className="auth-field">
          <label className="auth-label">Confirm Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link href="/auth/signin" className="auth-link">Sign in</Link>
      </div>
    </div>
  );
}
