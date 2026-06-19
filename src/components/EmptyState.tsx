import { FileX, Search, Inbox } from "lucide-react";

interface EmptyStateProps {
  type?: "no-data" | "no-results" | "no-items";
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ type = "no-data", message, action }: EmptyStateProps) {
  const icons = {
    "no-data": Inbox,
    "no-results": Search,
    "no-items": FileX,
  };

  const defaultMessages = {
    "no-data": "No data available",
    "no-results": "No results found",
    "no-items": "No items to display",
  };

  const Icon = icons[type];
  const displayMessage = message || defaultMessages[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-600 font-medium mb-2">{displayMessage}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
