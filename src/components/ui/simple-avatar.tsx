import { cn } from '@/lib/utils';

interface SimpleAvatarProps {
  className?: string;
  children: React.ReactNode;
}

export function SimpleAvatar({ className, children }: SimpleAvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}
