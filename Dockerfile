# ==========================================================
#  EstuLanches - imagem da aplicação
#  Base oficial PHP 8.3 + Apache
# ==========================================================
FROM php:8.3-apache

LABEL org.opencontainers.image.title="EstuLanches" \
      org.opencontainers.image.version="1.0.0"

# 1) Extensão para o PHP conversar com o MySQL + unzip (usado pelo Composer)
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# 2) Apache: só a pasta public/ fica acessível pela web
ENV APACHE_DOCUMENT_ROOT=/var/www/estulanches/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
        /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf \
    # Segurança: esconde versão do Apache/PHP e desativa listagem de pastas
    && printf "ServerTokens Prod\nServerSignature Off\n" > /etc/apache2/conf-enabled/seguranca.conf \
    && sed -ri 's/Options Indexes FollowSymLinks/Options FollowSymLinks/' /etc/apache2/apache2.conf \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && echo "expose_php = Off" > "$PHP_INI_DIR/conf.d/seguranca.ini"

# 3) Dependências (PHPUnit para os testes)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/estulanches
COPY composer.json ./
RUN composer install --no-interaction --no-progress

# 4) Código da aplicação
COPY app/ ./app/
COPY public/ ./public/
COPY tests/ ./tests/
COPY phpunit.xml ./
RUN chown -R www-data:www-data /var/www/estulanches

EXPOSE 80

# 5) Docker verifica sozinho se a aplicação está saudável
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
    CMD curl -fs http://localhost/saude.php || exit 1
