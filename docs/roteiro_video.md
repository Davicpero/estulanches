# 🎬 Roteiro do vídeo (≈ 4 minutos)

> Grave a tela com OBS ou a Barra de Jogos do Windows (Win + G).
> Deixe abertos antes de começar: VS Code com o projeto, terminal com os containers rodando, navegador em `localhost:8080` e o `docs/RDM.pdf`.

---

### 1. Apresentação (0:00 – 0:20)
**Tela:** README no GitHub.
> "Olá, eu sou o Davi, do curso Técnico em Desenvolvimento de Sistemas. Este é o EstuLanches, um sistema para a cantina da escola. Antes, os pedidos eram anotados em papel: a fila ficava confusa, produtos em falta continuavam sendo vendidos e ninguém sabia quanto foi vendido no dia. O sistema resolve isso registrando os pedidos com total automático, mostrando o status para a cozinha e controlando o cardápio."

### 2. Dockerfile (0:20 – 1:00)
**Tela:** `Dockerfile` no VS Code.
> "O Dockerfile cria a imagem da aplicação. Parti da imagem oficial `php:8.3-apache`, instalei a extensão `pdo_mysql` para o PHP falar com o MySQL e configurei o Apache para servir só a pasta `public`. Assim, o código de conexão e os testes ficam fora da web. Também usei o `php.ini` de produção e escondi as versões do PHP e do Apache. O Composer instala o PHPUnit. No final tem um `HEALTHCHECK`: o próprio Docker acessa `/saude.php` para saber se a aplicação e o banco estão funcionando."

### 3. docker-compose.yml (1:00 – 1:40)
**Tela:** `docker-compose.yml`.
> "O compose sobe dois serviços. O `db` usa MySQL 8.4 e tem um volume, `dados_mysql`, para os dados não se perderem quando o container é recriado. O `init.sql` cria as tabelas na primeira vez. O banco não tem porta publicada, então só a aplicação consegue acessá-lo, pela rede interna. O `app` é construído pelo Dockerfile, fica na porta 8080 e recebe a configuração do banco por variáveis de ambiente, então nenhuma senha fica no código. O `depends_on` com `service_healthy` faz a aplicação esperar o banco ficar pronto."

**Terminal:** rode e mostre:
```
docker compose ps
docker compose logs app
docker compose logs db
```
> "No `ps` os dois serviços aparecem `healthy` e a porta 8080 está ativa. Nos logs não aparece nenhum erro crítico."

### 4. Testes (1:40 – 2:20)
**Tela:** `tests/Unit/FuncoesTest.php`, depois `tests/Integration/BancoTest.php`.
> "Os testes unitários verificam funções isoladas, sem banco: o cálculo do total, a validação do produto e o fluxo de status. Os testes de integração rodam contra o MySQL de verdade, dentro do Docker: login certo e errado, se a senha está salva como hash, a criação de pedido e se o sistema recusa um produto em falta."

**Terminal:**
```
docker compose exec app vendor/bin/phpunit --testdox
```
> "São 20 testes, e todos passaram."

### 5. Código (2:20 – 2:45)
**Tela:** `app/funcoes.php` → função `criar_pedido`.
> "Aqui está a regra principal. O preço é buscado no banco, não no formulário, então ninguém consegue alterar o valor pelo navegador. O pedido é gravado numa transação: ou entra inteiro, ou não entra nada."

### 6. Demonstração do sistema (2:45 – 3:20)
**Tela:** navegador.
1. Tente entrar com a senha errada para mostrar a mensagem de erro, depois entre com `admin@estulanches.com` / `admin123`.
2. No painel, mostre os pedidos em aberto, os produtos e o vendido hoje.
3. No cardápio, cadastre um produto e marque outro como "em falta".
4. Em Pedidos, registre um pedido e avance o status até "Entregue".
5. Clique em Sair.

### 7. Ficha RDM (3:20 – 3:35)
**Tela:** `docs/RDM.pdf`.
> "Esta é a ficha de registro de mudança: versão 1.0.0, data, parâmetros configurados, resultado dos testes e status final: implantação concluída com sucesso."

### 8. Segurança (3:35 – 3:55)
> "Na segurança: senha com bcrypt, consultas preparadas contra SQL Injection, `htmlspecialchars` contra XSS, sessão que expira em 15 minutos, senhas em variáveis de ambiente, banco fora da internet e só a pasta `public` exposta."

### 9. Escalabilidade para o Brasil todo (3:55 – 4:40)
> "E se fossem 1 milhão de usuários, com 100 mil ao mesmo tempo? Conceitualmente:
> - **Escala horizontal:** em vez de 1 container da aplicação, vários, atrás de um **load balancer** (por exemplo Nginx ou o balanceador da nuvem). Num orquestrador como o **Kubernetes**, o número de containers aumenta e diminui sozinho conforme o acesso.
> - **Aplicação sem estado (stateless):** as sessões saem do container e vão para o **Redis**, então qualquer container atende qualquer usuário.
> - **Banco:** MySQL gerenciado na nuvem, com um banco principal para gravar e **réplicas de leitura** para consultas. Se crescer mais, separar por região ou escola (sharding).
> - **Cache:** o cardápio muda pouco, então pode ficar no Redis e não precisa ir ao banco a cada acesso.
> - **CDN** para CSS e imagens e **filas** (como RabbitMQ) para absorver o pico do intervalo.
> - **Várias regiões** da nuvem, com monitoramento (Prometheus/Grafana) e CI/CD para publicar novas versões sem parar o sistema.
> A vantagem do Docker é que a mesma imagem que roda no meu computador roda em mil servidores."

### 10. Encerramento (4:40 – 4:50)
> "O link do repositório está nos comentários. Obrigado!"
