import { createFileRoute, notFound } from "@tanstack/react-router";
import { Edit, Camera, Mail, Phone, MapPin, Calendar, Award } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getGrupoById, getServoById } from "@/lib/mock-data";

export const Route = createFileRoute("/grupos/$id/servos/$servoId")({
  loader: ({ params }) => {
    const grupo = getGrupoById(params.id);
    const servo = getServoById(params.servoId);
    if (!grupo || !servo) throw notFound();
    return { grupo, servo };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.servo.nome ?? "Servo"} — RCC Barreiras` }],
  }),
  component: ServoPerfilPage,
});

function ServoPerfilPage() {
  const { grupo, servo } = Route.useLoaderData();

  return (
    <AppShell>
      <PageHeader
        title={servo.nome}
        description={`${servo.funcao} • ${grupo.nome}`}
        backTo={`/grupos/${grupo.id}/servos`}
        actions={
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar Servo
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="relative mx-auto h-28 w-28">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {servo.nome
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-secondary text-secondary-foreground hover:bg-accent">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-4 font-semibold">{servo.nome}</h2>
            <p className="text-xs text-muted-foreground">{servo.funcao}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Etapa Formativa</h3>
            </div>
            <div className="mt-3 rounded-md bg-primary/10 p-3">
              <p className="text-sm font-medium text-primary">{servo.etapaFormativa}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold">Ministérios</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {servo.ministerios.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                icon={Calendar}
                label="Data de nascimento"
                value={new Date(servo.dataNascimento).toLocaleDateString("pt-BR")}
              />
              <Field
                icon={Calendar}
                label="Ingresso no grupo"
                value={new Date(servo.ingressoEm).toLocaleDateString("pt-BR")}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Informações de Contato</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field icon={Mail} label="E-mail" value={servo.email} />
              <Field icon={Phone} label="Telefone" value={servo.telefone} />
              <Field
                icon={MapPin}
                label="Endereço"
                value={`${servo.endereco.rua}, ${servo.endereco.numero}`}
              />
              <Field
                icon={MapPin}
                label="Bairro / Cidade"
                value={`${servo.endereco.bairro}, ${servo.endereco.cidade}/${servo.endereco.estado}`}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="text-sm">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
