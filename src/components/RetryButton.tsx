import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function RetryButton({ onRetry, isLoading, children = "Try Again" }: RetryButtonProps) {
  return (
    <Button onClick={onRetry} disabled={isLoading} variant="outline" className="gap-2">
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {children}
    </Button>
  );
}
