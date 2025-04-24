#!/usr/bin/env bash
# Instalar las dependencias del proyecto
npm install

# Instalar Chrome usando Puppeteer
npx puppeteer browsers install chrome

# Construir la aplicación
npm run build