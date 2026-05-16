import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Conexão Carisma" },
      {
        name: "description",
        content:
          "Termos de Uso da plataforma Conexão Carisma — RCC Diocese de Barreiras.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-sm leading-relaxed">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: 15 de maio de 2026</p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. Aceitação</h2>
          <p>
            Ao criar uma conta no <strong>Conexão Carisma</strong> você declara que leu,
            compreendeu e aceitou integralmente estes Termos de Uso e a{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            . Caso não concorde com qualquer disposição, não utilize a plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. Quem pode usar</h2>
          <p>
            A plataforma é destinada aos membros designados dos grupos de oração da
            Renovação Carismática Católica da Diocese de Barreiras/BA — em especial
            coordenadores, secretários e tesoureiros — com cadastro previamente
            aprovado pelo administrador da Diocese.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. Cadastro e credenciais</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Os dados informados no cadastro devem ser verdadeiros e atualizados.</li>
            <li>
              A senha é pessoal e intransferível. Você é responsável por mantê-la em
              sigilo e por todas as ações realizadas com sua conta.
            </li>
            <li>
              O acesso só é liberado após aprovação manual do administrador. A RCC
              Diocesana pode recusar ou revogar acessos a qualquer momento.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. Uso permitido</h2>
          <p>
            Você concorda em utilizar a plataforma exclusivamente para as finalidades
            previstas — gestão dos grupos de oração, servos, mensalidades, recibos e
            eventos da RCC Diocesana — e em conformidade com a legislação aplicável.
          </p>
          <p>É vedado, sem prejuízo de outras condutas vedadas por lei:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Compartilhar suas credenciais com terceiros;</li>
            <li>
              Acessar dados ou áreas para as quais você não tenha autorização expressa;
            </li>
            <li>Inserir dados falsos, ofensivos, ilegais ou de terceiros sem permissão;</li>
            <li>
              Tentar burlar mecanismos de segurança, automação não autorizada ou
              engenharia reversa do sistema;
            </li>
            <li>Utilizar a plataforma para finalidades comerciais ou de marketing.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. Propriedade intelectual</h2>
          <p>
            O nome <strong>Conexão Carisma</strong>, o conteúdo da plataforma, marcas e
            sinais distintivos da RCC Diocesana de Barreiras são protegidos por
            propriedade intelectual e seu uso depende de autorização prévia. O conteúdo
            inserido pelos usuários permanece de titularidade deles, sendo concedida à
            RCC Diocesana licença para armazenar, processar e exibir tais dados dentro
            da própria plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. Disponibilidade</h2>
          <p>
            A plataforma é fornecida "no estado em que se encontra". Empreendemos
            esforços razoáveis para mantê-la disponível, mas não garantimos ausência de
            falhas, interrupções ou erros. Janelas de manutenção podem ocorrer sem
            aviso prévio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">7. Suspensão e encerramento</h2>
          <p>
            A RCC Diocesana pode suspender ou encerrar o acesso de qualquer usuário, com
            ou sem aviso prévio, em caso de descumprimento destes Termos, da Política de
            Privacidade ou de obrigações legais, sem prejuízo de eventuais medidas
            judiciais cabíveis.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">8. Limitação de responsabilidade</h2>
          <p>
            Na máxima extensão permitida pela legislação aplicável, a RCC Diocesana não
            se responsabiliza por danos indiretos, lucros cessantes ou prejuízos
            decorrentes do uso ou da indisponibilidade da plataforma. Em qualquer
            hipótese, a responsabilidade total estará limitada aos valores efetivamente
            pagos pelo usuário pela utilização do serviço — se houver.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">9. Alterações</h2>
          <p>
            Estes Termos podem ser atualizados. Alterações relevantes serão comunicadas
            por e-mail ou por aviso na plataforma. O uso continuado após a comunicação
            implica concordância com a nova versão.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">10. Lei aplicável e foro</h2>
          <p>
            Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da
            Comarca de Barreiras/BA, com renúncia a qualquer outro, por mais
            privilegiado que seja, para dirimir controvérsias decorrentes deste
            instrumento.
          </p>
        </section>

        <footer className="border-t pt-6 text-xs text-muted-foreground">
          <p>
            Veja também a{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}
