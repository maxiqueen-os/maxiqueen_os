# 1. Cambiamos Alpine por la imagen estándar basada en Debian (Evita errores Ort::Exception de Transformers.js)
FROM node:20

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar dependencias limpiamente
RUN npm install

# 5. Copiar el resto del código del backend (incluyendo la carpeta public e index.js)
COPY . .

# 6. Hugging Face Spaces requiere exponer el puerto 7860 obligatoriamente
EXPOSE 7860

# 7. Establecer variables de entorno correctas
ENV PORT=7860
ENV NODE_ENV=production

# 8. Dejamos que Hugging Face valide la red usando directamente el app.get('/') de tu index.js sin forzar bucles
# Comando para iniciar tu servidor autónomo y abrir la IP global 0.0.0.0
CMD ["node", "index.js"]