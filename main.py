from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

# Importações do projeto
from database import engine, Base, get_db
import models, schemas
from face_recognition import face_verifier

# Criar as tabelas no banco de dados SQLite ao iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SecureVision AI (FECART) Backend",
    description="API robusta com FastAPI e PyTorch, substituindo o antigo Supabase, compatível com as rotas REST originais do frontend.",
    version="1.0.0"
)

# ==========================================
# MIDDLEWARE CORS
# ==========================================
# Permite que o frontend (Javascript puro) consuma a API sem bloqueios de CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # ATENÇÃO: Em produção, mude para o domínio do seu frontend (ex: ["https://meudominio.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================
# ENDPOINTS REST (COMPATIBILIDADE COM SUPABASE)
# ==============================================================

@app.post("/rest/v1/users", response_model=schemas.UserResponse, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Cadastra um novo usuário, processando consentimento LGPD."""
    db_user = models.User(**user.model_dump() if hasattr(user, 'model_dump') else user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/rest/v1/users")
def get_users(select: str = None, request: Request = None, db: Session = Depends(get_db)):
    """
    Lista usuários ou retorna o count.
    O frontend Supabase costuma chamar GET /rest/v1/users?select=count para checar conexão/quantidade.
    """
    if select == "count":
        count = db.query(models.User).count()
        return [{"count": count}]
    
    # Lista limitada para evitar sobrecarga (Paginação ideal em produção)
    return db.query(models.User).limit(100).all()

@app.delete("/rest/v1/users")
def delete_user(id: str = None, request: Request = None, db: Session = Depends(get_db)):
    """
    Direito ao esquecimento / Expurgo LGPD.
    Espera-se a query param: ?id=eq.UUID-DO-USUARIO
    """
    if not id or not id.startswith("eq."):
        raise HTTPException(status_code=400, detail="Formato de query inválido. Esperado: ?id=eq.X")
    
    user_id = id.split("eq.")[1]
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    db.delete(db_user)
    db.commit()
    return Response(status_code=204) # Supabase deleta com 204 No Content

@app.post("/rest/v1/biometrics", status_code=201)
def create_biometric(bio: schemas.BiometricCreate, db: Session = Depends(get_db)):
    """Armazena o descritor facial e o blob criptografado (AES-GCM Web Crypto)."""
    db_bio = models.Biometric(**bio.model_dump() if hasattr(bio, 'model_dump') else bio.dict())
    db.add(db_bio)
    db.commit()
    db.refresh(db_bio)
    return db_bio

@app.delete("/rest/v1/biometrics")
def delete_biometric(user_id: str = None, request: Request = None, db: Session = Depends(get_db)):
    """
    Remove biometrias de um usuário.
    Espera-se a query param: ?user_id=eq.UUID-DO-USUARIO
    """
    if not user_id or not user_id.startswith("eq."):
        raise HTTPException(status_code=400, detail="Formato de query inválido. Esperado: ?user_id=eq.X")
    
    uid = user_id.split("eq.")[1]
    
    db_bios = db.query(models.Biometric).filter(models.Biometric.user_id == uid).all()
    if not db_bios:
        raise HTTPException(status_code=404, detail="Biometria não encontrada.")
    
    for bio in db_bios:
        db.delete(bio)
    db.commit()
    return Response(status_code=204)

@app.post("/rest/v1/logs", status_code=201)
def create_log(log: schemas.LogCreate, db: Session = Depends(get_db)):
    """Cria um registro imutável de log de auditoria com hash SHA-256."""
    db_log = models.Log(**log.model_dump() if hasattr(log, 'model_dump') else log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# ==============================================================
# ENDPOINT DE IA E PROCESSAMENTO FACIAL (PYTORCH VIA API)
# ==============================================================

@app.post("/api/v1/verify-face")
def verify_face(req: schemas.VerifyFaceRequest, db: Session = Depends(get_db)):
    """
    Recebe imagem (Base64) da webcam via frontend, extrai embeddings via PyTorch
    (MobileFaceNet/ArcFace) e retorna similaridade com usuários cadastrados.
    """
    try:
        # 1. Gerar o vetor de embedding (128-D ou 512-D) via PyTorch
        embedding_tensor = face_verifier.get_embedding(req.image_base64)
        
        # 2. Buscar todas as biometrias cadastradas no banco de dados SQLite
        biometrics = db.query(models.Biometric).all()
        
        best_match_user_id = None
        highest_similarity = -1.0
        
        # Limiar de confiança (Threshold). Para CosFace/ArcFace na prática costuma ser entre 0.4 e 0.6
        threshold = 0.55 
        
        for bio in biometrics:
            try:
                # O descritor foi salvo pelo frontend/cadastro. Ele é uma string JSON contendo o array/vetor
                saved_embedding = json.loads(bio.descriptor)
                
                # 3. Calcular similaridade do cosseno
                sim = face_verifier.cosine_similarity(embedding_tensor, saved_embedding)
                
                if sim > highest_similarity:
                    highest_similarity = sim
                    best_match_user_id = bio.user_id
            except Exception as e:
                # Ignora falhas pontuais de parse de descritores malformados e continua
                print(f"[Aviso] Biometria malformada ignorada (ID {bio.id}): {e}")
                continue
                
        # 4. Avaliar se o resultado passou do limiar estrito de segurança
        if highest_similarity >= threshold and best_match_user_id:
            user = db.query(models.User).filter(models.User.id == best_match_user_id).first()
            return {
                "status": "success",
                "match": True,
                "similarity": highest_similarity,
                "user_id": best_match_user_id,
                "user_name": user.nome if user else "Desconhecido"
            }
        else:
            return {
                "status": "success",
                "match": False,
                "similarity": highest_similarity,
                "message": "Nenhum usuário foi correspondido com o grau de segurança exigido."
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno no processamento PyTorch: {str(e)}")
