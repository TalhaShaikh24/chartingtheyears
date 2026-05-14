'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tag, TagSchema } from '@/lib/schemas';
import { KitInput, KitLabel } from '@/components/ui/kit/Input';
import { KitButton } from '@/components/ui/kit/Button';
import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { getApiErrorMessage, showApiToast } from '@/components/ui/kit/Toast';

interface TagFormProps {
  onSuccess?: (tag: Tag) => void;
  onClose?: () => void;
}

function getDefaultFormValues(): Tag {
  return {
    name: '',
    bookCount: 0,
  };
}

export function TagForm({ onSuccess, onClose }: TagFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Tag>({
    resolver: zodResolver(TagSchema),
    defaultValues: getDefaultFormValues(),
  });

  const submitForm = async (data: Tag) => {
    try {
      setIsSubmitting(true);
      const tagData = {
        name: data.name,
      };

      const response = await apiClient.post<{ data: Tag }>('/api/tags', tagData);

      showApiToast({
        variant: 'success',
        title: 'Tag added',
        message: `"${tagData.name}" was created successfully.`,
      });

      reset();
      onSuccess?.(response.data.data);
      onClose?.();
    } catch (error) {
      console.error('[v0] Tag form submission error:', error);
      const message = getApiErrorMessage(error, 'Failed to create tag');
      showApiToast({
        variant: 'error',
        title: 'Unable to add tag',
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
          <KitLabel htmlFor="tag-name">Tag Name</KitLabel>
          <KitInput
            id="tag-name"
            placeholder="e.g., Historical"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
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
          {isSubmitting ? 'Adding...' : 'Add Tag'}
        </KitButton>
      </div>
    </form>
  );
}
