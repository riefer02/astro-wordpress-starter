import { useState } from 'react';
import { Alert, AlertDescription } from './alert';
import { X } from 'lucide-react';
import { Button } from './button';

interface DismissibleAlertProps {
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

export function DismissibleAlert({
  variant = 'default',
  className,
  children,
  onDismiss,
}: DismissibleAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Alert variant={variant} className={`relative ${className || ''}`}>
      <AlertDescription className="pr-8">{children}</AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
        onClick={handleDismiss}
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
