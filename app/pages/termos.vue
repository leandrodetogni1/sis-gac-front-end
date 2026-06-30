<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Termos de Uso — SISGAC" });
</script>

<template>
  <legal-shell
    eyebrow="Termos de Uso"
    title="Termos de Uso"
    updated-at="30 de junho de 2026"
    other-to="/privacidade"
    other-label="Política de Privacidade"
  >
    <section>
      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e utilizar o <strong>SISGAC — Sistema de Gestão de Atividades Complementares</strong>, você declara ter lido, compreendido e
        concordado com estes Termos de Uso e com a <NuxtLink to="/privacidade">Política de Privacidade</NuxtLink>. Caso não concorde, não utilize o
        sistema.
      </p>
    </section>

    <section>
      <h2>2. Definições</h2>
      <ul>
        <li><strong>SISGAC</strong>: A aplicação web de gestão de atividades complementares.</li>
        <li><strong>Usuário:</strong> qualquer pessoa que acessa o sistema com uma conta autenticada.</li>
        <li><strong>Aluno:</strong> usuário com perfil de estudante, que registra suas atividades complementares.</li>
        <li><strong>Coordenação / Administrador:</strong> usuário responsável por avaliar atividades, gerenciar regras e emitir relatórios.</li>
        <li><strong>Atividade:</strong> registro de atividade complementar cadastrado por um aluno.</li>
        <li><strong>Comprovante:</strong> documento enviado para comprovar uma atividade.</li>
      </ul>
    </section>

    <section>
      <h2>3. Sobre o sistema</h2>
      <p>
        O SISGAC permite que estudantes dos cursos de Ciência da Computação e Engenharia de Computação registrem suas atividades complementares,
        enviem comprovantes e acompanhem seu progresso por categoria (Ensino, Pesquisa e Extensão), enquanto a coordenação avalia e valida esses
        registros conforme as regras do currículo.
      </p>
      <p>
        O sistema foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e encontra-se em <strong>fase de testes</strong>. Ele não substitui
        processos oficiais da UFPel, salvo se e quando for formalmente adotado pela instituição.
      </p>
    </section>

    <section>
      <h2>4. Cadastro e acesso</h2>
      <ul>
        <li>O acesso é feito por meio de login com conta Google.</li>
        <li>Para concluir o cadastro, o usuário deve informar dados acadêmicos (matrícula, curso e ano do currículo).</li>
        <li>O usuário é responsável pela veracidade e atualização das informações fornecidas.</li>
        <li>O acesso é pessoal e intransferível. Você é responsável por todas as ações realizadas em sua conta.</li>
      </ul>
    </section>

    <section>
      <h2>5. Responsabilidades do usuário</h2>
      <p>Ao utilizar o sistema, você se compromete a:</p>
      <ul>
        <li>Fornecer informações verdadeiras, exatas e atualizadas;</li>
        <li>Enviar apenas comprovantes autênticos e legítimos, referentes a atividades efetivamente realizadas;</li>
        <li>Não compartilhar suas credenciais de acesso;</li>
        <li>Utilizar o sistema de boa-fé e em conformidade com a legislação e as normas do curso.</li>
      </ul>
    </section>

    <section>
      <h2>6. Envio de comprovantes e veracidade</h2>
      <p>
        Ao enviar um comprovante, você declara que o documento é <strong>autêntico</strong> e corresponde a uma atividade real. O envio de documentos
        falsos, adulterados ou fraudulentos é vedado e poderá acarretar a rejeição da atividade, além de eventual responsabilização acadêmica e legal.
      </p>
      <p>
        A validação das atividades é realizada pela coordenação/administração, que pode verificar, aprovar ou rejeitar os registros conforme as regras
        do currículo e do curso.
      </p>
    </section>

    <section>
      <h2>7. Condutas proibidas</h2>
      <p>É proibido:</p>
      <ul>
        <li>Inserir dados falsos ou de terceiros sem autorização;</li>
        <li>Enviar conteúdo ilícito, ofensivo ou que viole direitos de terceiros;</li>
        <li>Tentar acessar áreas, contas ou dados sem autorização;</li>
        <li>Tentar burlar mecanismos de segurança, sobrecarregar ou comprometer o funcionamento do sistema;</li>
        <li>Utilizar o sistema para finalidade diversa da gestão de atividades complementares.</li>
      </ul>
    </section>

    <section>
      <h2>8. Perfis de acesso e avaliação</h2>
      <p>
        O sistema possui perfis distintos: <strong>alunos</strong> registram suas atividades; <strong>coordenação/administração</strong>
        avaliam, validam, gerenciam regras e geram relatórios (como a relação de formandos aptos). As decisões sobre aproveitamento de carga horária
        seguem as regras de cada curso e currículo e são de responsabilidade da coordenação.
      </p>
    </section>

    <section>
      <h2>9. Conteúdo e propriedade</h2>
      <ul>
        <li>
          O usuário é responsável pelo conteúdo e pelos documentos que envia, e concede ao sistema autorização para armazená-los e processá-los
          exclusivamente para as finalidades descritas nestes Termos e na Política de Privacidade.
        </li>
        <li>
          A identidade visual, o nome "SISGAC" e o código-fonte pertencem ao seu autor, ressalvados eventuais direitos da UFPel em caso de adoção
          institucional.
        </li>
      </ul>
    </section>

    <section>
      <h2>10. Disponibilidade e natureza experimental</h2>
      <p>
        O SISGAC é disponibilizado <strong>"no estado em que se encontra"</strong>, como protótipo acadêmico em fase de testes. Não há garantia de
        disponibilidade contínua, ausência de erros ou exatidão dos resultados, e podem ocorrer indisponibilidades ou perda de dados. Recomenda-se
        manter cópias próprias dos comprovantes enviados.
      </p>
    </section>

    <section>
      <h2>11. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela legislação, o autor do sistema não se responsabiliza por danos decorrentes do uso ou da indisponibilidade do
        SISGAC, nem por decisões acadêmicas oficiais, que permanecem regidas pelos processos e normas da UFPel.
      </p>
    </section>

    <section>
      <h2>12. Suspensão e encerramento</h2>
      <p>
        Podemos suspender ou encerrar o acesso de usuários que violem estes Termos. O usuário pode encerrar o uso a qualquer momento saindo da sua
        conta. Solicitações de exclusão de dados seguem o disposto na
        <NuxtLink to="/privacidade">Política de Privacidade</NuxtLink>.
      </p>
    </section>

    <section>
      <h2>13. Privacidade</h2>
      <p>O tratamento de dados pessoais é descrito na <NuxtLink to="/privacidade">Política de Privacidade</NuxtLink>, que integra estes Termos.</p>
    </section>

    <section>
      <h2>14. Alterações dos Termos</h2>
      <p>
        Estes Termos podem ser atualizados a qualquer momento. A data da última atualização consta no topo. O uso continuado do sistema após
        alterações implica concordância com a versão vigente.
      </p>
    </section>

    <section>
      <h2>15. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de [Pelotas/RS] para dirimir eventuais controvérsias, com
        renúncia a qualquer outro, por mais privilegiado que seja.
      </p>
    </section>

    <section>
      <h2>16. Contato</h2>
      <p>Dúvidas sobre estes Termos de Uso: <contact-email />.</p>
    </section>
  </legal-shell>
</template>
