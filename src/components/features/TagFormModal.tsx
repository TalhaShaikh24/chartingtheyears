'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TagForm } from './TagForm';
import { Tag } from '@/lib/schemas';

interface TagFormModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (tag: Tag) => void;
}

export function TagFormModal({ open, onOpenChange, onSuccess }: TagFormModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Sync internal state when the parent controls the modal via `open` prop
  useEffect(() => {
    setIsOpen(open ?? false);
  }, [open]);

  const handleSuccess = (tag: Tag) => {
    handleOpenChange(false);
    onSuccess?.(tag);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Tag</DialogTitle>
          <DialogDescription>
            Create a new tag to organize your books
          </DialogDescription>
        </DialogHeader>
        <TagForm onSuccess={handleSuccess} onClose={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
