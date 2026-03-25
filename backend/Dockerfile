FROM php:8.2-cli

WORKDIR /app

# Install system dependencies needed for Laravel
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libmariadb-dev-compat \
    libmariadb-dev

# Clear apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install MySQL PDO and other essential extensions for the unified portal
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy all application files
COPY . .

# Install dependencies without dev requirements
RUN composer install --no-dev --optimize-autoloader

# Create required directories and set permissions
RUN mkdir -p storage bootstrap/cache && \
    chown -R www-data:www-data /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache

EXPOSE 8000

# Cache configurations, run migrations safely, and start the marketplace node
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=8000