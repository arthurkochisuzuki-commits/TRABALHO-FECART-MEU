from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

def generate_uuid():
    """Gera um UUID v4 em formato de string."""
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    nome = Column(String, nullable=True)
    cpf_hash = Column(String, nullable=True) # CPF com hash por LGPD
    consentimento_lgpd = Column(Boolean, default=True)
    data_cadastro = Column(DateTime, default=datetime.utcnow)

    # Relacionamento 1 para N com biometrias
    biometrics = relationship("Biometric", back_populates="user", cascade="all, delete-orphan")


class Biometric(Base):
    __tablename__ = "biometrics"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    descriptor = Column(Text) # Embedding facial armazenado como JSON String (ex: [0.12, 0.55, ...])
    blob_criptografado = Column(Text) # Dados biométricos criptografados em AES-GCM pelo frontend
    data_registro = Column(DateTime, default=datetime.utcnow)

    # Relacionamento inverso com usuário
    user = relationship("User", back_populates="biometrics")


class Log(Base):
    __tablename__ = "logs"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    acao = Column(String) # Ex: "CADASTRO_BIOMETRICO", "EXCLUSAO_LGPD"
    user_id = Column(String, nullable=True)
    detalhes = Column(Text, nullable=True)
    hash_sha256 = Column(String) # Log imutável (Hash SHA-256 do frontend/backend)
    data_hora = Column(DateTime, default=datetime.utcnow)
