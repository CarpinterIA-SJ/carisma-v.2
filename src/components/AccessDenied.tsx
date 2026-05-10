import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title?: string;
  message?: string;
  backTo?: string;
}

export function AccessDenied({
  title = "Acesso Restrito",
  message = "Você não tem permissão para acessar esta área.",
  backTo = "/grupos",
}: Props) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link to={backTo} className="mt-6 inline-block">
        <Button variant="outline" size="sm">Voltar</Button>
      </Link>
    </div>
  );
}
