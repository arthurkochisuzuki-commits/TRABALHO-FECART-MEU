# SecureVision AI (FECART) - Backend API

Esta é a API Backend robusta em Python para o sistema de alta segurança **SecureVision AI**.
Substitui a comunicação anterior via Supabase e implementa de forma nativa:
- REST API com FastAPI (Rotas retrocompatíveis: `/rest/v1/...`).
- Integração de modelos PyTorch de Deep Learning em tempo real (MobileFaceNet/ArcFace) via rota `/api/v1/verify-face`.
- Persistência com SQLite (SQLAlchemy), incluindo tratamento de registros LGPD, logs imutáveis e exclusão/esquecimento.

## Estrutura de Arquivos
- `main.py`: Arquivo principal da aplicação FastAPI e rotas REST.
- `database.py`: Configurações de conexão com o banco de dados SQLite.
- `models.py`: Tabelas do banco usando o ORM do SQLAlchemy.
- `schemas.py`: Validação estrita de dados de Entrada/Saída com Pydantic.
- `face_recognition.py`: Script de Visão Computacional, carrega a rede PyTorch, faz inferência e calcula a similaridade do cosseno.
- `requirements.txt`: Dependências do projeto.

## Instalação e Execução

### 1. Criar um Ambiente Virtual (Opcional, mas Recomendado)
```bash
# Crie e ative um ambiente virtual (Windows PowerShell)
python -m venv venv
.\venv\Scripts\Activate
```

### 2. Instalar Dependências
Instale todos os pacotes necessários:
```bash
pip install -r requirements.txt
```
*(Caso haja problemas com a versão do PyTorch na sua máquina, instale-o acessando o site oficial: https://pytorch.org/get-started/locally/)*

### 3. Ajuste de Pesos do Modelo (Deep Learning)
No arquivo `face_recognition.py`, há a inicialização da classe `FaceVerifier`. 
Caso tenha seus pesos finais treinados (ex: `modelo_fecart.pth`), passe o caminho do arquivo para o construtor:
```python
face_verifier = FaceVerifier(model_path="./pesos/modelo_fecart.pth")
```
Se não for passado, ele usará pesos aleatórios para demonstração inicial. A arquitetura mock também pode ser substituída pela sua arquitetura real.

### 4. Executar o Servidor FastAPI
Execute com o Uvicorn. O recarregamento automático (`--reload`) facilita o desenvolvimento.
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Testes e Documentação Interativa
Com o servidor rodando, você pode testar todas as rotas de API diretamente pelo navegador:
- Acesse a interface Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Ou Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Lógica de Reconhecimento Facial na API
O endpoint `POST /api/v1/verify-face` espera um JSON:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSk..."
}
```
A IA decodifica a Base64, transforma em tensor `[1, 3, 112, 112]`, processa no PyTorch gerando um vetor de features contínuas, e varre a tabela SQLite de biometrias calculando a Similaridade de Cosseno. Se passar o `threshold` seguro (ex: 0.55), retorna `match: true`.
