'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import apiClient from '@/lib/apiClient';
import './TagSelect.css';

interface TagSelectProps {
  value: string;
  onChange: (value: string) => void;
}

interface Tag {
  _id: string;
  name: string;
  bookCount: number;
}

export function TagSelect({ value, onChange }: TagSelectProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get<{ data: Tag[] }>('/api/tags')
      .then(res => setTags(res.data.data))
      .catch(err => console.error('Failed to fetch tags', err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tagName: string) => {
    onChange(tagName);
    setIsOpen(false);
  };

  return (
    <div className="tag-select-container" ref={dropdownRef}>
      <button 
        type="button" 
        className="tag-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="tag-select-value">{value || 'All tags'}</span>
        <span className={`tag-select-chevron ${isOpen ? 'open' : ''}`}>
          <Icon name="chevron-down" size={14} />
        </span>
      </button>

      {isOpen && (
        <div className="tag-select-dropdown" role="listbox">
          <button
            type="button"
            className={`tag-select-option ${!value ? 'selected' : ''}`}
            onClick={() => handleSelect('')}
            role="option"
            aria-selected={!value}
          >
            All tags
          </button>
          {tags.map(tag => (
            <button
              key={tag._id}
              type="button"
              className={`tag-select-option ${value === tag.name ? 'selected' : ''}`}
              onClick={() => handleSelect(tag.name)}
              role="option"
              aria-selected={value === tag.name}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
