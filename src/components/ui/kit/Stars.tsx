import { Icon } from './Icon';

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 text-ink">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          size={size}
          className={i <= value ? 'text-ink' : 'text-ink/20'}
        />
      ))}
    </div>
  );
}
