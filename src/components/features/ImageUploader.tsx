'use client';

import { useCallback, useRef, useState } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  value: string | null;
  onChange: (base64: string | null) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported format. Use JPG, PNG, WEBP, or GIF.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is 5 MB.`;
    }
    return null;
  };

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const base64 = await fileToBase64(file);
        onChange(base64);
      } catch {
        setError('Failed to process the image. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = () => {
    setError(null);
    onChange(null);
  };

  return (
    <div className="img-uploader">
      {value ? (
        <div className="img-uploader-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Book cover preview" className="img-uploader-preview-img" />
          <div className="img-uploader-preview-actions">
            <button
              type="button"
              className="img-uploader-btn img-uploader-btn--replace"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              Replace image
            </button>
            <button
              type="button"
              className="img-uploader-btn img-uploader-btn--remove"
              onClick={handleRemove}
              disabled={loading}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`img-uploader-zone${dragOver ? ' img-uploader-zone--over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          aria-label="Upload book cover image"
        >
          {loading ? (
            <span className="img-uploader-spinner" aria-label="Processing image" />
          ) : (
            <>
              <span className="img-uploader-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
              <p className="img-uploader-label">
                <strong>Drag & drop</strong> or <span className="img-uploader-browse">click to browse</span>
              </p>
              <p className="img-uploader-hint">JPG, PNG, WEBP, GIF — max 5 MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="img-uploader-error" role="alert">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="img-uploader-input-hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
