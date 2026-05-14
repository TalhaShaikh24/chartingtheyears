'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import { Category } from '@/lib/schemas';

interface CategoryFormModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (category: Category) => void;
}

export function CategoryFormModal({ open, onOpenChange, onSuccess }: CategoryFormModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Sync internal state when the parent controls the modal via `open` prop
  useEffect(() => {
    setIsOpen(open ?? false);
  }, [open]);

  const handleSuccess = (category: Category) => {
    handleOpenChange(false);
    onSuccess?.(category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your books
          </DialogDescription>
        </DialogHeader>
        <CategoryForm onSuccess={handleSuccess} onClose={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
