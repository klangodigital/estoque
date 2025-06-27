from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import pandas as pd
from functools import wraps

app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///estoque.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'sua-chave-secreta-aqui-mude-em-producao'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)  # Permite requisições de qualquer origem com credenciais

# Configuração do Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Por favor, faça login para acessar esta página.'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# Modelos do banco de dados

class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_login = db.Column(db.DateTime)
    
    def definir_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)
    
    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'ultimo_login': self.ultimo_login.isoformat() if self.ultimo_login else None
        }
    
    def __repr__(self):
        return f'<Usuario {self.email}>'

class Lente(db.Model):
    __tablename__ = 'lentes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    marca = db.Column(db.String(50), nullable=False)
    grau_esferico = db.Column(db.String(20), nullable=False)
    grau_cilindrico = db.Column(db.String(20), nullable=True)
    eixo = db.Column(db.String(10), nullable=True)
    quantidade = db.Column(db.Integer, nullable=False, default=0)
    preco = db.Column(db.Float, nullable=False, default=0.0)
    descricao = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'marca': self.marca,
            'grau_esferico': self.grau_esferico,
            'grau_cilindrico': self.grau_cilindrico,
            'eixo': self.eixo,
            'quantidade': self.quantidade,
            'preco': self.preco,
            'descricao': self.descricao,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

    def __repr__(self):
        return f'<Lente {self.nome} - {self.marca} - {self.grau_esferico}>'

# Decorador para verificar autenticação via API
def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'erro': 'Acesso negado. Faça login primeiro.'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Rotas de autenticação

@app.route('/api/registro', methods=['POST'])
def registro():
    dados = request.get_json()
    
    if not dados or not all(k in dados for k in ('nome', 'email', 'senha')):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    # Verificar se o email já existe
    if Usuario.query.filter_by(email=dados['email']).first():
        return jsonify({'erro': 'Email já cadastrado'}), 400
    
    # Criar novo usuário
    usuario = Usuario(
        nome=dados['nome'],
        email=dados['email']
    )
    usuario.definir_senha(dados['senha'])
    
    db.session.add(usuario)
    db.session.commit()
    
    return jsonify({'mensagem': 'Usuário registrado com sucesso'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    dados = request.get_json()
    
    if not dados or not all(k in dados for k in ('email', 'senha')):
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400
    
    usuario = Usuario.query.filter_by(email=dados['email']).first()
    
    if usuario and usuario.verificar_senha(dados['senha']) and usuario.ativo:
        login_user(usuario, remember=True)
        usuario.ultimo_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Login realizado com sucesso',
            'usuario': usuario.to_dict()
        }), 200
    
    return jsonify({'erro': 'Email ou senha inválidos'}), 401

@app.route('/api/logout', methods=['POST'])
@api_login_required
def logout():
    logout_user()
    return jsonify({'mensagem': 'Logout realizado com sucesso'}), 200

@app.route('/api/usuario-atual', methods=['GET'])
@api_login_required
def usuario_atual():
    return jsonify(current_user.to_dict())

# Rotas principais

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def pagina_login():
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

# API Routes para lentes (protegidas por autenticação)

@app.route('/api/lentes', methods=['GET'])
@api_login_required
def obter_lentes():
    # Parâmetros de busca
    nome = request.args.get('nome', '')
    marca = request.args.get('marca', '')
    grau = request.args.get('grau', '')
    
    query = Lente.query
    
    if nome:
        query = query.filter(Lente.nome.contains(nome))
    if marca:
        query = query.filter(Lente.marca.contains(marca))
    if grau:
        query = query.filter(Lente.grau_esferico.contains(grau))
    
    lentes = query.all()
    return jsonify([lente.to_dict() for lente in lentes])

@app.route('/api/lentes/<int:lente_id>', methods=['GET'])
@api_login_required
def obter_lente(lente_id):
    lente = Lente.query.get_or_404(lente_id)
    return jsonify(lente.to_dict())

@app.route('/api/lentes', methods=['POST'])
@api_login_required
def adicionar_lente():
    dados = request.get_json()
    
    if not dados or not all(k in dados for k in ('nome', 'marca', 'grau_esferico', 'quantidade', 'preco')):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    lente = Lente(
        nome=dados['nome'],
        marca=dados['marca'],
        grau_esferico=dados['grau_esferico'],
        grau_cilindrico=dados.get('grau_cilindrico', ''),
        eixo=dados.get('eixo', ''),
        quantidade=dados['quantidade'],
        preco=dados['preco'],
        descricao=dados.get('descricao', '')
    )
    
    db.session.add(lente)
    db.session.commit()
    
    return jsonify(lente.to_dict()), 201

@app.route('/api/lentes/<int:lente_id>', methods=['PUT'])
@api_login_required
def atualizar_lente(lente_id):
    lente = Lente.query.get_or_404(lente_id)
    dados = request.get_json()
    
    if not dados:
        return jsonify({'erro': 'Dados não fornecidos'}), 400
    
    lente.nome = dados.get('nome', lente.nome)
    lente.marca = dados.get('marca', lente.marca)
    lente.grau_esferico = dados.get('grau_esferico', lente.grau_esferico)
    lente.grau_cilindrico = dados.get('grau_cilindrico', lente.grau_cilindrico)
    lente.eixo = dados.get('eixo', lente.eixo)
    lente.quantidade = dados.get('quantidade', lente.quantidade)
    lente.preco = dados.get('preco', lente.preco)
    lente.descricao = dados.get('descricao', lente.descricao)
    
    db.session.commit()
    
    return jsonify(lente.to_dict())

@app.route('/api/lentes/<int:lente_id>', methods=['DELETE'])
@api_login_required
def excluir_lente(lente_id):
    lente = Lente.query.get_or_404(lente_id)
    db.session.delete(lente)
    db.session.commit()
    
    return jsonify({'mensagem': 'Lente excluída com sucesso'})

@app.route('/api/lentes/<int:lente_id>/ajustar-estoque', methods=['POST'])
@api_login_required
def ajustar_estoque(lente_id):
    lente = Lente.query.get_or_404(lente_id)
    dados = request.get_json()
    
    if not dados or 'tipo' not in dados or 'quantidade' not in dados:
        return jsonify({'erro': 'Tipo e quantidade são obrigatórios'}), 400
    
    tipo = dados['tipo']  # 'entrada' ou 'saida'
    quantidade = dados['quantidade']
    
    if tipo == 'entrada':
        lente.quantidade += quantidade
    elif tipo == 'saida':
        if lente.quantidade < quantidade:
            return jsonify({'erro': 'Quantidade insuficiente em estoque'}), 400
        lente.quantidade -= quantidade
    else:
        return jsonify({'erro': 'Tipo deve ser "entrada" ou "saida"'}), 400
    
    db.session.commit()
    
    return jsonify(lente.to_dict())

# Rotas para relatórios e dashboard

@app.route('/api/relatorios/resumo', methods=['GET'])
@api_login_required
def resumo_estoque():
    lentes = Lente.query.all()
    
    total_itens = len(lentes)
    total_quantidade = sum(lente.quantidade for lente in lentes)
    valor_total = sum(lente.quantidade * lente.preco for lente in lentes)
    
    # Lentes com estoque baixo (menos de 5 unidades)
    estoque_baixo = [lente.to_dict() for lente in lentes if lente.quantidade < 5]
    
    # Marcas mais populares
    marcas = {}
    for lente in lentes:
        if lente.marca in marcas:
            marcas[lente.marca] += lente.quantidade
        else:
            marcas[lente.marca] = lente.quantidade
    
    return jsonify({
        'total_itens': total_itens,
        'total_quantidade': total_quantidade,
        'valor_total': valor_total,
        'estoque_baixo': estoque_baixo,
        'marcas': marcas
    })

@app.route('/api/relatorios/exportar', methods=['GET'])
@api_login_required
def exportar_relatorio():
    lentes = Lente.query.all()
    
    # Converter para DataFrame do pandas
    dados = []
    for lente in lentes:
        dados.append({
            'ID': lente.id,
            'Nome': lente.nome,
            'Marca': lente.marca,
            'Grau Esférico': lente.grau_esferico,
            'Grau Cilíndrico': lente.grau_cilindrico,
            'Eixo': lente.eixo,
            'Quantidade': lente.quantidade,
            'Preço': lente.preco,
            'Valor Total': lente.quantidade * lente.preco,
            'Descrição': lente.descricao
        })
    
    df = pd.DataFrame(dados)
    
    # Salvar como Excel
    nome_arquivo = f'relatorio_estoque_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    caminho_arquivo = f'/tmp/{nome_arquivo}'
    df.to_excel(caminho_arquivo, index=False)
    
    return jsonify({
        'mensagem': 'Relatório exportado com sucesso',
        'arquivo': nome_arquivo,
        'caminho': caminho_arquivo
    })

# The initialization logic should be called within the application context
# when the application starts, not necessarily tied to a request decorator.
# This ensures it runs only once.
def initialize_app():
    with app.app_context():
        db.create_all()
        
        # Criar usuário administrador padrão se não existir
        admin = Usuario.query.filter_by(email='admin@sistema.com').first()
        if not admin:
            admin = Usuario(
                nome='Administrador',
                email='admin@sistema.com'
            )
            admin.definir_senha('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Usuário administrador criado: admin@sistema.com / admin123")

if __name__ == '__main__':
    initialize_app() # Call the initialization function here
    app.run(host='0.0.0.0', port=5000, debug=True)
