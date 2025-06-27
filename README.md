# Sistema de Gerenciamento de Estoque de Lentes Oftalmológicas

Um sistema web moderno e completo para gerenciar estoque de lentes oftalmológicas, desenvolvido com Flask, autenticação de usuários, dashboard interativo com gráficos e funcionalidades avançadas de relatórios.

## 🚀 Características Principais

### ✨ Funcionalidades Gerais
- **Interface Web Moderna**: Design responsivo e intuitivo com experiência de usuário aprimorada
- **Sistema de Autenticação**: Login seguro com proteção de rotas e gerenciamento de sessões
- **Dashboard Interativo**: Visualizações gráficas em tempo real com Chart.js
- **Gestão Completa de Estoque**: Adicionar, editar, remover e buscar lentes com facilidade
- **Controle Avançado de Estoque**: Ajustar quantidades de entrada e saída com histórico
- **Relatórios e Exportação**: Gerar e exportar relatórios detalhados em Excel
- **Busca Inteligente**: Filtros avançados por nome, marca, grau e outros critérios

### 📊 Dashboard e Relatórios
- **Estatísticas em Tempo Real**: Total de itens, unidades e valor do estoque
- **Gráficos Interativos**: Distribuição por marca e análise de valores
- **Alertas de Estoque Baixo**: Identificação automática de itens com estoque crítico
- **Exportação de Dados**: Relatórios completos em formato Excel (.xlsx)

### 🔧 Especificações Técnicas
- **Campos Específicos**: Grau esférico, cilíndrico, eixo, marca, preço e descrição
- **Validação de Dados**: Verificação automática de integridade dos dados
- **Responsividade**: Interface adaptável para desktop, tablet e mobile
- **Containerização**: Deploy fácil com Docker e Docker Compose
- **Arquitetura Escalável**: Estrutura preparada para expansão e novos recursos

## 📋 Pré-requisitos

### Requisitos de Sistema
- **Sistema Operacional**: Ubuntu 22.04 LTS ou superior (recomendado)
- **Docker**: Versão 27.0 ou superior
- **Docker Compose**: Versão 2.37 ou superior
- **Python**: 3.13.5 (para desenvolvimento local)
- **Memória RAM**: Mínimo 2GB, recomendado 4GB
- **Espaço em Disco**: Mínimo 1GB livre

### Portas Utilizadas
- **5000**: Aplicação Flask (HTTP)
- **80**: Proxy reverso (se configurado)

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask 3.1.1**: Framework web principal
- **Flask-SQLAlchemy 3.1.1**: ORM para banco de dados
- **Flask-Login 0.6.3**: Gerenciamento de autenticação
- **Flask-CORS 5.0.0**: Suporte a requisições cross-origin
- **SQLAlchemy 2.0.36**: Engine de banco de dados
- **Werkzeug 3.1.3**: Utilitários WSGI e segurança
- **bcrypt 4.2.1**: Criptografia de senhas
- **pandas 2.2.3**: Manipulação de dados para relatórios
- **openpyxl 3.1.5**: Geração de arquivos Excel

### Frontend
- **HTML5**: Estrutura semântica moderna
- **CSS3**: Estilos responsivos com Flexbox e Grid
- **JavaScript ES6+**: Funcionalidades interativas
- **Chart.js**: Biblioteca de gráficos interativos
- **Design Responsivo**: Compatível com todos os dispositivos

### Infraestrutura
- **Docker**: Containerização da aplicação
- **SQLite**: Banco de dados embarcado (desenvolvimento)
- **Gunicorn 23.0.0**: Servidor WSGI para produção

## 📥 Instalação

### Método 1: Docker (Recomendado)

#### 1. Clonar o Repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd gerenciamento_estoque_atualizado
```

#### 2. Construir e Executar com Docker Compose
```bash
# Construir as imagens
docker-compose build

# Executar em segundo plano
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

#### 3. Acessar a Aplicação
- **URL Principal**: http://localhost:5000
- **Login**: http://localhost:5000/login
- **Dashboard**: http://localhost:5000/dashboard

### Método 2: Instalação Local

#### 1. Preparar o Ambiente Python
```bash
# Instalar Python 3.13 (Ubuntu)
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.13 python3.13-venv python3.13-dev

# Criar ambiente virtual
python3.13 -m venv venv
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip
```

#### 2. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Configurar Banco de Dados
```bash
# O banco será criado automaticamente na primeira execução
# Localização: backend/estoque.db
```

#### 4. Executar a Aplicação
```bash
# Modo desenvolvimento
python app.py

# Modo produção com Gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

## 🔐 Configuração Inicial

### Usuário Administrador Padrão
O sistema cria automaticamente um usuário administrador na primeira execução:

- **Email**: admin@sistema.com
- **Senha**: admin123

**⚠️ IMPORTANTE**: Altere essas credenciais imediatamente após o primeiro login por motivos de segurança.

### Configurações de Segurança
Edite o arquivo `backend/app.py` e altere:

```python
app.config['SECRET_KEY'] = 'sua-chave-secreta-muito-segura-aqui'
```

## 📖 Guia de Uso

### 1. Primeiro Acesso
1. Acesse http://localhost:5000/login
2. Faça login com as credenciais padrão
3. Acesse o Dashboard para visualizar as estatísticas
4. Comece adicionando suas primeiras lentes

### 2. Gerenciamento de Lentes
- **Adicionar**: Preencha o formulário com os dados da lente
- **Editar**: Clique no botão "Editar" na listagem
- **Excluir**: Use o botão "Excluir" (confirmação necessária)
- **Buscar**: Use os filtros de busca por nome, marca ou grau

### 3. Controle de Estoque
- **Ajustar Estoque**: Use o botão "Estoque" para entrada/saída
- **Monitorar**: Acompanhe alertas de estoque baixo no dashboard
- **Relatórios**: Exporte dados completos em Excel

### 4. Dashboard e Relatórios
- **Estatísticas**: Visualize totais e valores em tempo real
- **Gráficos**: Analise distribuição por marca e valores
- **Exportação**: Gere relatórios detalhados em Excel

## 🔧 Configuração Avançada

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=sqlite:///estoque.db
CORS_ORIGINS=http://localhost:3000,https://seudominio.com
```

### Configuração de Produção

#### Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### SSL/HTTPS com Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Backup do Banco de Dados
```bash
# Backup
cp backend/estoque.db backup/estoque_$(date +%Y%m%d_%H%M%S).db

# Restauração
cp backup/estoque_YYYYMMDD_HHMMSS.db backend/estoque.db
```

## 🐛 Solução de Problemas

### Problemas Comuns

#### Erro de Conexão com o Banco
```bash
# Verificar permissões
chmod 664 backend/estoque.db
chown www-data:www-data backend/estoque.db
```

#### Porta 5000 em Uso
```bash
# Encontrar processo usando a porta
sudo lsof -i :5000

# Matar processo
sudo kill -9 [PID]
```

#### Problemas de CORS
Verifique se o CORS está configurado corretamente no backend:
```python
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
```

### Logs e Debugging
```bash
# Logs do Docker
docker-compose logs -f app

# Logs locais
tail -f logs/app.log

# Debug mode
export FLASK_DEBUG=1
python app.py
```

## 📊 Monitoramento

### Métricas Importantes
- **Tempo de Resposta**: < 200ms para operações básicas
- **Uso de Memória**: < 512MB em operação normal
- **Espaço em Disco**: Monitorar crescimento do banco de dados

### Health Check
```bash
curl -f http://localhost:5000/ || exit 1
```

## 🔄 Atualizações

### Processo de Atualização
1. **Backup**: Sempre faça backup antes de atualizar
2. **Pull**: Baixe as últimas alterações
3. **Build**: Reconstrua as imagens Docker
4. **Deploy**: Execute a nova versão
5. **Verificação**: Teste todas as funcionalidades

```bash
# Backup
docker-compose exec app cp /app/backend/estoque.db /app/backup/

# Atualização
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificação
docker-compose logs -f
```

## 🤝 Contribuição

### Diretrizes para Contribuição
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as alterações
4. Adicione testes se necessário
5. Envie um Pull Request

### Estrutura do Projeto
```
gerenciamento_estoque_atualizado/
├── backend/
│   ├── app.py              # Aplicação principal Flask
│   ├── requirements.txt    # Dependências Python
│   └── instance/          # Banco de dados SQLite
├── frontend/
│   ├── index.html         # Interface principal
│   ├── login.html         # Página de login
│   ├── dashboard.html     # Dashboard com gráficos
│   ├── estilo.css         # Estilos CSS
│   └── script.js          # JavaScript
├── Dockerfile             # Configuração Docker
├── docker-compose.yml     # Orquestração Docker
└── README.md             # Este arquivo
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- **Documentação**: Consulte este README
- **Issues**: Abra uma issue no repositório
- **Email**: [seu-email@dominio.com]

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Integração com APIs de fornecedores
- [ ] Sistema de notificações por email
- [ ] Relatórios avançados com filtros personalizados
- [ ] Interface mobile nativa
- [ ] Integração com sistemas de vendas
- [ ] Backup automático na nuvem

### Melhorias Planejadas
- [ ] Performance otimizada para grandes volumes
- [ ] Suporte a múltiplas filiais
- [ ] Controle de acesso por níveis
- [ ] Auditoria completa de operações
- [ ] Dashboard executivo
- [ ] API REST completa para integrações

---

**Desenvolvido com ❤️ por Manus AI**

*Última atualização: Junho 2025*

