# 🥪 EstuLanches — Implantação com Docker

Sistema web para a **cantina escolar**: gestão de **cardápio** e **pedidos**, implantado em produção com **Docker** e **Docker Compose**.

**Problema:** os pedidos da cantina eram anotados em papel, a fila virava bagunça, produtos em falta continuavam sendo vendidos e ninguém sabia quanto tinha sido vendido no dia.
**Solução:** os pedidos ficam registrados com itens e total calculado automaticamente, a cozinha acompanha o status (Recebido → Preparando → Pronto → Entregue), o cardápio marca o que está em falta e o painel mostra o vendido no dia.

## Tecnologias
| Camada | Tecnologia |
|---|---|
| Aplicação | PHP 8.3 + Apache (imagem oficial `php:8.3-apache`) |
| Banco | MySQL 8.4 (imagem oficial `mysql:8.4`) |
| Testes | PHPUnit (unitários e de integração) |
| Infra | Dockerfile + Docker Compose |

## Estrutura
```
Dockerfile            cria a imagem da aplicação
docker-compose.yml    sobe app + banco
.env.example          modelo das senhas (copie para .env)
db/init.sql           cria as tabelas e os dados iniciais
app/                  código que NÃO fica exposto na web (conexão, regras, sessão, menu)
public/               telas acessíveis pelo navegador
tests/Unit/           testes unitários (sem banco)
tests/Integration/    testes de integração (com o MySQL do container)
docs/RDM.pdf          ficha de registro de mudança
docs/roteiro_video.md roteiro do vídeo
```

## Como implantar (passo a passo)
Pré-requisito: **Docker Desktop** instalado e aberto.

```bash
# 1. Baixar o projeto
git clone <URL-DO-REPOSITORIO>
cd estulanches

# 2. Definir as senhas (opcional em teste, obrigatório em produção)
copy .env.example .env        # Windows   (Linux/Mac: cp .env.example .env)

# 3. Construir a imagem e subir tudo
docker compose up -d --build

# 4. Verificar o estado dos serviços e portas
docker compose ps

# 5. Auditar os logs de inicialização (procure por ERROR / FATAL)
docker compose logs app
docker compose logs db

# 6. Rodar os testes unitários e de integração
docker compose exec app vendor/bin/phpunit --testdox
```

Acesse **http://localhost:8080**. Login: `admin@estulanches.com`, senha `admin123`.
Status de saúde: **http://localhost:8080/saude.php**

### Comandos úteis
| Comando | Para quê |
|---|---|
| `docker compose ps` | Ver se `app` e `db` estão `Up (healthy)` e as portas |
| `docker compose logs -f app` | Acompanhar os logs em tempo real |
| `docker compose logs db \| findstr /i "error"` | Procurar erros no banco (Windows) |
| `docker compose exec app vendor/bin/phpunit --testsuite Unitarios` | Só os testes unitários |
| `docker compose exec app vendor/bin/phpunit --testsuite Integracao` | Só os de integração |
| `docker compose down` | Parar (os dados continuam no volume) |
| `docker compose down -v` | Parar e **apagar** o banco (recomeça do `init.sql`) |

## Testes
- **Unitários (10)** — `tests/Unit/FuncoesTest.php`: testam funções isoladas, sem banco. Cobrem o cálculo do total do pedido, a validação de produto (nome e preço), o fluxo de status e a formatação em reais.
- **Integração (10)** — `tests/Integration/BancoTest.php`: testam a aplicação conversando com o MySQL real. Cobrem a conexão e as tabelas, login certo e errado, a senha salva como hash, o cadastro de produto, a criação de pedido com o total calculado pelo banco, a recusa de produto em falta e de pedido vazio, o avanço de status e a fila. O que cada teste cria é apagado no final.

## Segurança
- Senhas com `password_hash` (bcrypt), nunca em texto puro.
- Todas as consultas usam `prepare` (PDO), o que evita SQL Injection.
- Toda saída passa por `htmlspecialchars`, o que evita XSS.
- O preço do pedido vem do banco, não do formulário, então o cliente não consegue alterar o valor.
- Sessão com cookie `HttpOnly`/`SameSite`, ID regenerado no login e expiração em 15 minutos.
- Senhas do banco em variáveis de ambiente (`.env`, fora do Git).
- O banco não tem porta publicada: só a aplicação acessa, pela rede interna do Docker.
- Só a pasta `public/` é servida pelo Apache; `app/`, `tests/` e `vendor/` ficam fora da web.
- `php.ini` de produção, `expose_php=Off` e `ServerTokens Prod` (não revela versões).
- Healthchecks e `restart: unless-stopped` (o serviço volta sozinho se cair).

## Telas
| Login | Painel |
|---|---|
| ![](docs/telas/1_login.png) | ![](docs/telas/2_painel.png) |
| **Cardápio** | **Pedidos** |
| ![](docs/telas/3_cardapio.png) | ![](docs/telas/4_pedidos.png) |

## Entregáveis
- [`Dockerfile`](Dockerfile)
- [`docker-compose.yml`](docker-compose.yml)
- [`docs/RDM.pdf`](docs/RDM.pdf)
- Vídeo: _cole aqui o link_
