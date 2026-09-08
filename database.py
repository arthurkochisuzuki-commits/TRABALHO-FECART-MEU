from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Banco de dados SQLite local
SQLALCHEMY_DATABASE_URL = "sqlite:///./fecart.db"

# Argumento connect_args={"check_same_thread": False} é necessário apenas para SQLite no FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para a criação dos modelos ORM
Base = declarative_base()

def get_db():
    """
    Dependência (Dependency) do FastAPI para injetar a sessão do banco em cada requisição,
    garantindo que ela seja fechada após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
