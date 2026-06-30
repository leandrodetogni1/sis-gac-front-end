<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Política de Privacidade — SISGAC" });
</script>

<template>
  <legal-shell
    eyebrow="Política de Privacidade"
    title="Política de Privacidade"
    updated-at="30 de junho de 2026"
    other-to="/termos"
    other-label="Termos de Uso"
  >
    <section>
      <h2>1. Quem é o controlador dos dados</h2>
      <p>
        O <strong>SISGAC — Sistema de Gestão de Atividades Complementares</strong> é um software desenvolvido como Trabalho de Conclusão de Curso
        (TCC) por <strong>Leandro De Togni</strong>, vinculado à Universidade Federal de Pelotas (UFPel), destinado à gestão e ao acompanhamento de
        atividades complementares dos cursos de Ciência da Computação e Engenharia de Computação.
      </p>
      <p>
        Para os fins da <strong>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD)</strong>, o controlador dos dados pessoais tratados nesta
        fase é o autor do projeto.
      </p>
      <ul>
        <li><strong>Controlador:</strong> Leandro De Togni</li>
        <li><strong>Contato para assuntos de privacidade:</strong> <contact-email /></li>
        <li><strong>Natureza do sistema:</strong> protótipo acadêmico em fase de testes</li>
      </ul>
      <p>
        Caso o SISGAC venha a ser adotado oficialmente pela UFPel, a Universidade passará a figurar como controladora e esta Política será atualizada
        para refletir os canais e o Encarregado (DPO) institucionais.
      </p>
    </section>

    <section>
      <h2>2. Quais dados pessoais tratamos</h2>
      <p>Tratamos apenas os dados necessários para o funcionamento do sistema:</p>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Dados</th>
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identificação</td>
              <td>Nome, sobrenome, e-mail e foto de perfil</td>
              <td>Conta Google, no momento do login</td>
            </tr>
            <tr>
              <td>Dados acadêmicos</td>
              <td>Matrícula, curso, ano do currículo, situação acadêmica e perfil de acesso</td>
              <td>Informados no cadastro e/ou pela coordenação</td>
            </tr>
            <tr>
              <td>Atividades complementares</td>
              <td>Evento, organização, carga horária, datas, categoria (Ensino, Pesquisa, Extensão), tipo e status</td>
              <td>Cadastrados pelo usuário</td>
            </tr>
            <tr>
              <td>Comprovantes</td>
              <td>Arquivos enviados e seus metadados (nome, tipo e tamanho)</td>
              <td>Enviados pelo usuário</td>
            </tr>
            <tr>
              <td>Convites</td>
              <td>E-mail de pessoas convidadas a acessar o sistema</td>
              <td>Informado por administradores</td>
            </tr>
            <tr>
              <td>Dados técnicos de acesso</td>
              <td>Registros automáticos das ações realizadas e de informações técnicas da conexão (como data, hora e dispositivo)</td>
              <td>Gerados automaticamente, para fins de segurança</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Não tratamos dados pessoais sensíveis e não realizamos decisões automatizadas sem revisão humana — a avaliação das atividades é feita pela
        coordenação.
      </p>
    </section>

    <section>
      <h2>3. Para que usamos os dados e com qual base legal</h2>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Finalidade</th>
              <th>Base legal (LGPD, art. 7º)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Autenticar o acesso e gerenciar a conta</td>
              <td>Execução de contrato e procedimentos preliminares (inc. V)</td>
            </tr>
            <tr>
              <td>Registrar, organizar e avaliar atividades complementares</td>
              <td>Execução de contrato (inc. V) e legítimo interesse (inc. IX)</td>
            </tr>
            <tr>
              <td>Gerar relatórios acadêmicos (ex.: formandos aptos)</td>
              <td>Legítimo interesse (inc. IX)</td>
            </tr>
            <tr>
              <td>Convidar e gerenciar membros administrativos</td>
              <td>Legítimo interesse (inc. IX)</td>
            </tr>
            <tr>
              <td>Garantir a segurança e o bom funcionamento do sistema</td>
              <td>Legítimo interesse (inc. IX) e segurança da informação</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Caso o sistema seja adotado oficialmente pela UFPel, a base legal preponderante poderá passar a ser a execução de políticas públicas (art. 7º,
        inc. III).
      </p>
    </section>

    <section>
      <h2>4. Compartilhamento de dados</h2>
      <p>Não vendemos dados pessoais. O compartilhamento ocorre apenas com:</p>
      <ul>
        <li>
          <strong>Google LLC</strong> — para autenticação via login com conta Google. O tratamento pelo Google segue a política de privacidade própria
          da empresa.
        </li>
        <li><strong>Coordenação e administração do curso</strong> — acessam os dados acadêmicos e os comprovantes para avaliar as atividades.</li>
      </ul>
      <p>
        Os dados são armazenados na infraestrutura da Universidade Federal de Pelotas (UFPel). Poderemos compartilhar dados quando exigido por lei,
        ordem judicial ou autoridade competente.
      </p>
    </section>

    <section>
      <h2>5. Cookies</h2>
      <p>O SISGAC utiliza apenas um cookie estritamente necessário:</p>
      <ul>
        <li>
          <strong>auth_token</strong> — mantém sua sessão autenticada. É um cookie de sessão, do tipo httpOnly, com validade aproximada de 7 dias.
        </li>
      </ul>
      <p>Não utilizamos cookies de análise, marketing ou rastreamento. O script de login do Google poderá definir cookies próprios do Google.</p>
    </section>

    <section>
      <h2>6. Por quanto tempo guardamos os dados</h2>
      <ul>
        <li>
          <strong>Dados de conta e acadêmicos:</strong> mantidos enquanto a conta existir. Por ser fase de testes, podem ser eliminados a qualquer
          momento.
        </li>
        <li>
          <strong>Atividades e comprovantes:</strong> mantidos enquanto a conta existir, para fins de comprovação acadêmica [e por até [prazo] após a
          conclusão do curso].
        </li>
        <li><strong>Registros técnicos de acesso:</strong> mantidos pelo tempo necessário para fins de segurança.</li>
      </ul>
      <p>Encerrada a finalidade, os dados são eliminados ou anonimizados, salvo obrigação legal de guarda.</p>
    </section>

    <section>
      <h2>7. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais razoáveis: conexão criptografada (HTTPS), autenticação por token em cookie httpOnly e controle de
        acesso por perfil. Para garantir a segurança e a integridade do sistema, mantemos registros automáticos das ações realizadas (por exemplo, a
        aprovação ou rejeição de atividades), o que permite identificar usos indevidos e saber quem executou cada ação. Nenhum sistema é totalmente
        imune a incidentes; por ser um protótipo acadêmico, recomenda-se não inserir dados além dos necessários.
      </p>
    </section>

    <section>
      <h2>8. Seus direitos como titular</h2>
      <p>Nos termos do art. 18 da LGPD, você pode solicitar a qualquer momento:</p>
      <ul>
        <li>Confirmação da existência de tratamento;</li>
        <li>Acesso aos seus dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>Portabilidade dos dados;</li>
        <li>Informação sobre com quem seus dados foram compartilhados;</li>
        <li>Revogação do consentimento, quando esta for a base legal aplicável.</li>
      </ul>
    </section>

    <section>
      <h2>9. Como exercer seus direitos</h2>
      <p>
        Envie sua solicitação para <contact-email />. Responderemos no menor prazo possível. Você também pode apresentar
        reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>
    </section>

    <section>
      <h2>10. Dados de menores de idade</h2>
      <p>
        O público do sistema é composto majoritariamente por estudantes maiores de idade. Caso seja identificado titular menor de 18 anos, o
        tratamento observará o melhor interesse do titular, conforme o art. 14 da LGPD.
      </p>
    </section>

    <section>
      <h2>11. Alterações desta Política</h2>
      <p>
        Esta Política pode ser atualizada para refletir mudanças no sistema ou na legislação. A data da última atualização é indicada no topo.
        Alterações relevantes serão comunicadas pelos canais do sistema.
      </p>
    </section>

    <section>
      <h2>12. Contato</h2>
      <p>Dúvidas sobre esta Política ou sobre o tratamento dos seus dados: <contact-email />.</p>
    </section>
  </legal-shell>
</template>
