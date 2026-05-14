import { cn } from '@/lib/utils';

export type IconName =
  | 'dashboard'
  | 'books'
  | 'plus'
  | 'grid'
  | 'tag'
  | 'settings'
  | 'logo'
  | 'star'
  | 'search'
  | 'chevron-down'
  | 'edit'
  | 'delete';

const paths: Record<IconName, React.ReactNode> = {
  logo: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13V4Z" />
      <path d="M11 4v16" strokeWidth={1} stroke="currentColor" fill="none" opacity={0.4} />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="13" rx="1.5" />
      <rect x="13" y="3" width="8" height="6" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="18" width="8" height="3" rx="1.5" />
    </>
  ),
  books: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V5Z" />
      <path d="M12 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6V5Z" />
      <path d="M7 7h2M7 10h2M15 7h2M15 10h2" stroke="var(--canvas)" strokeWidth={1.2} fill="none" />
    </>
  ),
  plus: (
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" fill="none" />
  ),
  grid: (
    <>
      <circle cx="5" cy="5" r="1.6" />
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="19" cy="5" r="1.6" />
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
      <circle cx="5" cy="19" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
      <circle cx="19" cy="19" r="1.6" />
    </>
  ),
  tag: (
    <>
      <path d="M3 11.5V4a1 1 0 0 1 1-1h7.5a1 1 0 0 1 .7.3l8.5 8.5a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 12.2a1 1 0 0 1-.3-.7Z" />
      <circle cx="7.5" cy="7.5" r="1.4" fill="var(--canvas)" />
    </>
  ),
  settings: (
    <>
      <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
      <path d="M19.4 13a7.5 7.5 0 0 0 0-2l1.8-1.4-2-3.4-2.1.8a7.5 7.5 0 0 0-1.7-1L15 4h-4l-.4 2a7.5 7.5 0 0 0-1.7 1l-2.1-.8-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-1.8 1.4 2 3.4 2.1-.8a7.5 7.5 0 0 0 1.7 1L11 20h4l.4-2a7.5 7.5 0 0 0 1.7-1l2.1.8 2-3.4L19.4 13Z" />
    </>
  ),
  star: (
    <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={1.8} fill="none" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  ),
  'chevron-down': (
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  edit: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="m14 6 4 4" stroke="currentColor" strokeWidth={1.4} fill="none" />
    </>
  ),
  delete: (
    <>
      <path d="M5 7h14" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth={1.8} fill="none" />
      <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth={1.8} fill="none" />
    </>
  ),
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
