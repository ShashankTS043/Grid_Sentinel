from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base

# This creates a file named 'grid.db' in your project folder
DATABASE_URL = "sqlite:///./grid.db"

# "check_same_thread=False" is needed only for SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# The SessionLocal is what we use to actually write data
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Creates the tables if they don't exist"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database Tables Created Successfully")