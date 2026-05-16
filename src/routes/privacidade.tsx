import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Conexão Carisma" },
      {
        name: "description",
        content:
          "Política de Privacidade do Conexão Carisma em conformidade com a LGPD (Lei nº 13.709/2018).",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            Última atualização: 15 de maio de 2026
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. Quem somos</h2>
          <p>
            O <strong>Conexão Carisma</strong> é uma plataforma da Renovação Carismática
            Católica (RCC) da Diocese de Barreiras/BA destinada a coordenadores,
            secretários e tesoureiros dos grupos de oração, para gerenciamento de servos,
            mensalidades, eventos e recibos.
          </p>
          <p>
            Esta Política descreve como tratamos seus dados pessoais em conformidade com
            a Lei Geral de Proteção de Dados — Lei nº 13.709/2018 (LGPD).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. Dados que coletamos</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Identificação e contato:</strong> nome completo e e-mail informados
              no cadastro.
            </li>
            <li>
              <strong>Credenciais:</strong> senha em formato cifrado (hash) — não temos
              acesso à senha em texto puro.
            </li>
            <li>
              <strong>Perfil eclesial:</strong> função no grupo (coordenador, secretário
              ou tesoureiro) e grupo de oração vinculado.
            </li>
            <li>
              <strong>Dados de uso:</strong> registros técnicos de autenticação (data,
              hora e IP da requisição) gerados automaticamente pela infraestrutura
              (Supabase) para fins de segurança.
            </li>
            <li>
              <strong>Dado pessoal sensível:</strong> a afiliação religiosa decorre
              implicitamente do uso desta plataforma. Tratamos este dado com base no
              consentimento explícito do titular (art. 11, I da LGPD).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. Finalidades do tratamento</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Autenticar e autorizar o acesso ao sistema.</li>
            <li>Permitir a gestão de servos, grupos, mensalidades, recibos e eventos.</li>
            <li>Emitir comprovantes e relatórios internos da RCC Diocesana.</li>
            <li>Cumprir obrigações legais e regulatórias aplicáveis à RCC.</li>
            <li>Garantir a segurança da plataforma e investigar incidentes.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. Bases legais</h2>
          <p>
            Tratamos seus dados com fundamento nas seguintes hipóteses do art. 7º e do
            art. 11 da LGPD:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Consentimento</strong> do titular (art. 7º, I e art. 11, I),
              registrado no momento do cadastro.
            </li>
            <li>
              <strong>Legítimo interesse</strong> do controlador (art. 7º, IX) para
              prevenção de fraudes e segurança da plataforma.
            </li>
            <li>
              <strong>Cumprimento de obrigação legal</strong> (art. 7º, II) quando
              aplicável.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. Compartilhamento</h2>
          <p>
            Seus dados não são vendidos nem repassados a terceiros para fins comerciais.
            São processados pelos seguintes operadores estritamente necessários ao
            funcionamento da plataforma:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Supabase</strong> (banco de dados e autenticação) —{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                política de privacidade
              </a>
              .
            </li>
            <li>
              <strong>Netlify</strong> (hospedagem da aplicação web) —{" "}
              <a
                href="https://www.netlify.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                política de privacidade
              </a>
              .
            </li>
          </ul>
          <p>
            Esses operadores podem manter cópias dos dados em data centers fora do Brasil.
            Exigimos deles cláusulas contratuais de proteção de dados compatíveis com a
            LGPD.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. Retenção</h2>
          <p>
            Os dados são mantidos enquanto sua conta estiver ativa. Após a solicitação de
            exclusão ou após período de inatividade superior a 24 meses, os dados de
            identificação são anonimizados ou eliminados, exceto quando a retenção for
            obrigatória por lei.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">7. Direitos do titular</h2>
          <p>Você pode, a qualquer momento, solicitar:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Confirmação da existência de tratamento;</li>
            <li>Acesso aos seus dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>
              Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados
              em desconformidade;
            </li>
            <li>Portabilidade dos dados a outro fornecedor;</li>
            <li>Eliminação dos dados tratados com base no consentimento;</li>
            <li>Informação sobre compartilhamento;</li>
            <li>Revogação do consentimento.</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, escreva para o Encarregado de
            Proteção de Dados pelo canal indicado abaixo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">8. Segurança</h2>
          <p>
            Adotamos medidas técnicas e administrativas para proteger seus dados:
            criptografia em trânsito (HTTPS/TLS), senhas armazenadas com hash, controle
            de acesso por perfil (RLS no banco de dados) e auditoria de tentativas de
            autenticação. Nenhum sistema é 100% seguro — em caso de incidente que
            represente risco aos titulares, comunicaremos ANPD e os afetados nos prazos
            da LGPD.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">9. Encarregado (DPO)</h2>
          <p>
            Encarregado de Proteção de Dados da RCC Diocesana de Barreiras:
            <br />
            E-mail: <a href="mailto:encarregado@conexaocarisma.org" className="text-primary hover:underline">encarregado@conexaocarisma.org</a>
          </p>
          <p className="text-muted-foreground">
            O nome do Encarregado será divulgado nesta página assim que a RCC Diocesana
            formalizar a designação.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">10. Alterações</h2>
          <p>
            Esta Política pode ser atualizada. Mudanças relevantes serão comunicadas pelo
            e-mail cadastrado ou por aviso na própria plataforma. A versão vigente é
            sempre a publicada nesta página, com a data de atualização indicada no topo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">11. Foro</h2>
          <p>
            Fica eleito o foro da Comarca de Barreiras/BA para dirimir quaisquer dúvidas
            decorrentes desta Política, com renúncia a qualquer outro, por mais
            privilegiado que seja.
          </p>
        </section>

        <footer className="border-t pt-6 text-xs text-muted-foreground">
          <p>
            Veja também os{" "}
            <Link to="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}
