'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, CategorySchema } from '@/lib/schemas';
import { KitInput, KitLabel, KitTextarea } from '@/components/ui/kit/Input';
import { KitButton } from '@/components/ui/kit/Button';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { getApiErrorMessage, showApiToast } from '@/components/ui/kit/Toast';

interface CategoryFormProps {
  onSuccess?: (category: Category) => void;
  onClose?: () => void;
}

function getDefaultFormValues(): Category {
  return {
    name: '',
    description: '',
    bookCount: 0,
  };
}

export function CategoryForm({ onSuccess, onClose }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Category>({
    resolver: zodResolver(CategorySchema),
    defaultValues: getDefaultFormValues(),
  });

  const submitForm = async (data: Category) => {
    try {
      setIsSubmitting(true);
      const categoryData = {
        name: data.name,
        description: data.description || '',
      };

      const response = await apiClient.post<{ data: Category }>('/api/categories', categoryData);

      showApiToast({
        variant: 'success',
        title: 'Category added',
        message: `"${categoryData.name}" was created successfully.`,
      });

      reset();
      onSuccess?.(response.data.data);
      onClose?.();
    } catch (error) {
      console.error('[v0] Category form submission error:', error);
      const message = getApiErrorMessage(error, 'Failed to create category');
      showApiToast({
        variant: 'error',
        title: 'Unable to add category',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <KitLabel htmlFor="category-name">Category Name</KitLabel>
          <KitInput
            id="category-name"
            placeholder="e.g., Historical Fiction"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <KitLabel htmlFor="category-description">Description</KitLabel>
          <KitTextarea
            id="category-description"
            placeholder="Optional description for this category"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-line/60">
        <KitButton
          type="button"
          variant="ghost"
          size="md"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </KitButton>
        <KitButton
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Category'}
        </KitButton>
      </div>
    </form>
  );
}
