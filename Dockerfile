# Use uma imagem base do Python mais recente (Python 3.13.5)
FROM python:3.13-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivo de requirements
COPY backend/requirements.txt .

# Atualizar pip para a versão mais recente
RUN pip install --upgrade pip

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY database/ ./database/

# Criar diretório para o banco de dados se não existir
RUN mkdir -p database

# Criar usuário não-root para segurança
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expor a porta da aplicação
EXPOSE 5000

# Definir variáveis de ambiente
ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Comando para iniciar a aplicação
CMD ["python", "backend/app.py"]

