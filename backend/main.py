from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional

# =============================
# Inicialização do app
# =============================
app = FastAPI(title="Bundy System API", version="1.0")

# =============================
# CORS - permite acesso do frontend
# =============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # pode restringir depois: ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================
# Modelo de dados
# =============================
class Bobina(BaseModel):
    rastro: str
    data: str
    turno: str
    tipo: str
    diametro: str
    comprimento: float
    peso: float
    furos: int
    observacoes: Optional[str] = ""
    status: str
    operador: str
    matricula: str
    linha: str
    criadoEm: str
    qrCode: Optional[str] = None

# =============================
# Funções do Banco de Dados
# =============================
DB_PATH = "backend/bundy.db"

def conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def criar_tabela():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bobinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rastro TEXT UNIQUE,
        data TEXT,
        turno TEXT,
        tipo TEXT,
        diametro TEXT,
        comprimento REAL,
        peso REAL,
        furos INTEGER,
        observacoes TEXT,
        status TEXT,
        operador TEXT,
        matricula TEXT,
        linha TEXT,
        criadoEm TEXT,
        qrCode TEXT
    )
    """)
    conn.commit()
    conn.close()

criar_tabela()

# =============================
# Rotas da API
# =============================

@app.get("/")
def root():
    return {"mensagem": "🚀 API Bundy rodando com sucesso!", "status": "online"}

# --- Listar todas ---
@app.get("/bobinas")
def listar_bobinas():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bobinas ORDER BY id DESC")
    dados = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return dados

# --- Criar nova ---
@app.post("/bobinas")
def criar_bobina(b: Bobina):
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO bobinas (
            rastro, data, turno, tipo, diametro, comprimento, peso,
            furos, observacoes, status, operador, matricula,
            linha, criadoEm, qrCode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b.rastro, b.data, b.turno, b.tipo, b.diametro, b.comprimento, b.peso,
            b.furos, b.observacoes, b.status, b.operador, b.matricula,
            b.linha, b.criadoEm, b.qrCode
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="❌ Rastro já cadastrado.")
    finally:
        conn.close()
    return {"mensagem": "✅ Bobina salva com sucesso!"}

# --- Atualizar existente ---
@app.put("/bobinas/{rastro}")
def atualizar_bobina(rastro: str, b: Bobina):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bobinas WHERE rastro = ?", (rastro,))
    existente = cursor.fetchone()

    if not existente:
        raise HTTPException(status_code=404, detail="Bobina não encontrada.")

    cursor.execute("""
        UPDATE bobinas SET
            data = ?, turno = ?, tipo = ?, diametro = ?, comprimento = ?,
            peso = ?, furos = ?, observacoes = ?, status = ?, operador = ?,
            matricula = ?, linha = ?, criadoEm = ?, qrCode = ?
        WHERE rastro = ?
    """, (
        b.data, b.turno, b.tipo, b.diametro, b.comprimento, b.peso,
        b.furos, b.observacoes, b.status, b.operador, b.matricula,
        b.linha, b.criadoEm, b.qrCode, rastro
    ))
    conn.commit()
    conn.close()
    return {"mensagem": f"✅ Bobina {rastro} atualizada com sucesso!"}

# --- Deletar ---
@app.delete("/bobinas/{rastro}")
def deletar_bobina(rastro: str):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bobinas WHERE rastro = ?", (rastro,))
    conn.commit()
    conn.close()
    return {"mensagem": f"🗑️ Bobina {rastro} removida com sucesso!"}
