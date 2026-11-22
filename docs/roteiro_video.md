# 🎬 Roteiro do vídeo (≈ 4 min 30 s)

**Antes de gravar, deixe aberto:**
- o VS Code com o projeto;
- o terminal com o Docker rodando;
- o navegador em `localhost:3000`;
- o arquivo `docs/RDM.pdf`.

Para gravar a tela, aperte **Win + G** ou use o OBS.

---

### 1. Apresentação (20 s)
**Mostrar:** o repositório no GitHub.

**Falar:** "Olá, eu sou o Davi Cavalheiro Pero, do curso Técnico em Desenvolvimento de Sistemas. Este é o EstuLanches, um sistema para a cantina da escola. Antes, os pedidos eram anotados em papel: a fila ficava confusa, vendiam produto que já tinha acabado e ninguém sabia quanto foi vendido no dia. O sistema registra os pedidos com o total automático, mostra o status para a cozinha e controla o cardápio. Usei JavaScript nas duas pontas: Node.js com Express no servidor, JavaScript puro no navegador e PostgreSQL como banco."

### 2. Dockerfile (35 s)
**Mostrar:** o `Dockerfile`.

**Falar:** "O Dockerfile cria a imagem da aplicação. Uso a imagem oficial do Node 22 na versão Alpine, que é bem pequena. Primeiro copio o `package.json` e rodo `npm ci --omit=dev`, que instala só as dependências de produção. Depois copio o código. O container roda com o usuário `node`, não como root, o que é mais seguro. No final tem um HEALTHCHECK: o próprio Docker acessa a rota `/saude` para saber se o sistema e o banco estão funcionando."

### 3. Docker Compose (45 s)
**Mostrar:** o `docker-compose.yml`.

**Falar:** "O compose sobe dois serviços. O `db` usa PostgreSQL 17, com um volume para os dados não se perderem, e o `sql.sql` cria as tabelas na primeira vez. O banco não tem porta aberta para fora: só a aplicação acessa ele, pela rede interna. O `app` é construído pelo Dockerfile, fica na porta 3000 e recebe a configuração do banco por variáveis de ambiente, então nenhuma senha fica no código. O `depends_on` faz a aplicação esperar o banco ficar saudável."

**Terminal:** rode `docker compose ps`.

**Falar:** "Os dois serviços estão rodando e saudáveis, e a porta 3000 está ativa."

**Terminal:** rode `docker compose logs app` e depois `docker compose logs db`.

**Falar:** "Nos logs aparece 'EstuLanches rodando na porta 3000', e o banco iniciou sem nenhum erro crítico."

### 4. Testes (40 s)
**Mostrar:** `tests/unit/regras.test.js` e depois `tests/integracao/api.test.js`.

**Falar:** "Usei o test runner nativo do Node. Os testes unitários testam as regras sozinhas, sem banco: o cálculo do total, a validação do produto e a ordem dos status. Os testes de integração sobem a API e testam com o PostgreSQL de verdade: login certo e errado, se a senha está criptografada, se uma rota sem login é bloqueada, se o pedido é criado com o total certo e se o sistema recusa produto em falta."

**Terminal:** rode `docker compose exec app npm test`.

**Falar:** "São 20 testes, e todos passaram."

### 5. Código (30 s)
**Mostrar:** em `src/server.js`, a rota `app.post('/api/pedidos'`.

**Falar:** "Esta é a rota que cria o pedido. O preço é buscado no banco, não vem do navegador, então ninguém consegue alterar o valor. O pedido é gravado numa transação, com BEGIN e COMMIT: ou salva tudo, ou não salva nada. E as consultas usam `$1` e `$2`, que protegem contra SQL Injection."

**Mostrar:** `public/js/pedidos.js`.

**Falar:** "No navegador uso JavaScript puro com `fetch` para chamar a API, e o `textContent` para mostrar os dados, o que evita XSS."

### 6. Demonstração do sistema (35 s)
**Mostrar no navegador:**
1. Entre com a senha errada e mostre a mensagem de erro.
2. Entre com `admin@estulanches.com` e a senha `admin123`.
3. No painel, mostre os pedidos em aberto e o vendido hoje.
4. No cardápio, cadastre um produto e marque outro como "em falta".
5. Em Pedidos, faça um pedido e avance o status até "ENTREGUE".
6. Clique em **Sair**.

### 7. Ficha RDM (15 s)
**Mostrar:** `docs/RDM.pdf`.

**Falar:** "Esta é a ficha de registro de mudança, com a versão 1.0.0, a data e o horário, os parâmetros configurados, o resultado dos testes e o status final: implantação concluída com sucesso."

### 8. Segurança (20 s)
**Falar:** "Na segurança: a senha é salva com bcrypt; as consultas são parametrizadas contra SQL Injection; o `textContent` evita XSS; o login expira em 15 minutos; as senhas ficam em variáveis de ambiente; o banco não fica exposto; e o container roda sem permissão de root."

### 9. Escalabilidade para o Brasil todo (45 s)
**Falar:** "E se fossem 1 milhão de usuários, com 100 mil ao mesmo tempo? A ideia seria:
- **vários containers** da aplicação atrás de um **balanceador de carga**, e o **Kubernetes** aumenta ou diminui a quantidade sozinho, conforme o acesso;
- as sessões iriam para o **Redis**, para qualquer container atender qualquer usuário;
- o PostgreSQL seria gerenciado na nuvem, com um servidor principal para gravar e **réplicas só de leitura**, além de um pool de conexões como o PgBouncer;
- o cardápio, que muda pouco, ficaria em **cache**, e os arquivos HTML e JS numa **CDN**;
- uma **fila de mensagens** absorveria o pico do intervalo;
- e o sistema rodaria em **várias regiões da nuvem**, com monitoramento e CI/CD.

A vantagem do Docker é que a mesma imagem que roda no meu computador roda em mil servidores."

### 10. Encerramento (10 s)
**Falar:** "O link do repositório está nos comentários. Obrigado!"
