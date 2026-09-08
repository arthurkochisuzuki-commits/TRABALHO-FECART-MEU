from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==========================================
# Schemas para Usuários (Users)
# ==========================================
class UserCreate(BaseModel):
    id: Optional[str] = None
    nome: Optional[str] = None
    cpf_hash: Optional[str] = None
    consentimento_lgpd: bool = True

class UserResponse(BaseModel):
    id: str
    nome: Optional[str]
    cpf_hash: Optional[str]
    consentimento_lgpd: bool
    data_cadastro: datetime

    class Config:
        from_attributes = True # Compatibilidade com ORM (Pydantic V2)
        orm_mode = True # Compatibilidade com ORM (Pydantic V1)

# ==========================================
# Schemas para Biometria (Biometrics)
# ==========================================
class BiometricCreate(BaseModel):
    id: Optional[str] = None
    user_id: str
    descriptor: str
    blob_criptografado: str

class BiometricResponse(BaseModel):
    id: str
    user_id: str
    data_registro: datetime

    class Config:
        from_attributes = True
        orm_mode = True

# ==========================================
# Schemas para Logs de Auditoria (Logs)
# ==========================================
class LogCreate(BaseModel):
    id: Optional[str] = None
    acao: str
    user_id: Optional[str] = None
    detalhes: Optional[str] = None
    hash_sha256: str

class LogResponse(BaseModel):
    id: str
    acao: str
    data_hora: datetime
    
    class Config:
        from_attributes = True
        orm_mode = True

# ==========================================
# Schema para Requisição de Reconhecimento Facial
# ==========================================
class VerifyFaceRequest(BaseModel):
    image_base64: str = Field(..., description="Imagem em Base64 para verificação facial")
