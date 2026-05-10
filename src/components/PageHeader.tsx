import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, backTo, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 md:mb-6 flex flex-col gap-3 border-b border-border pb-4 md:pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
