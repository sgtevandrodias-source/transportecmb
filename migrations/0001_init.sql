-- Schema inicial do Rota CMB no Cloudflare D1.
-- Espelha os tipos de src/domain/types.ts. IDs numericos agora sao gerados
-- pelo banco (AUTOINCREMENT) em vez de Date.now() no cliente, ja que varios
-- dispositivos passam a escrever ao mesmo tempo.

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL DEFAULT '',
  perfil TEXT NOT NULL CHECK (perfil IN ('gestor', 'motorista', 'responsavel')),
  senha_hash TEXT NOT NULL,
  senha_salt TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  expira_em TEXT NOT NULL
);

CREATE INDEX idx_sessoes_usuario ON sessoes(usuario_id);

CREATE TABLE pontos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  referencia TEXT NOT NULL DEFAULT '',
  horario TEXT NOT NULL,
  ordem INTEGER NOT NULL
);

CREATE TABLE alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  serie TEXT NOT NULL,
  turno TEXT NOT NULL,
  ponto TEXT NOT NULL,
  responsavel_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE viagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  sentido TEXT NOT NULL CHECK (sentido IN ('ida', 'volta')),
  turno TEXT NOT NULL,
  horario TEXT NOT NULL,
  motorista TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('programada', 'em-andamento', 'finalizada', 'cancelada'))
);

CREATE TABLE embarques (
  viagem_id INTEGER NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  situacao TEXT NOT NULL,
  horario_situacao TEXT,
  PRIMARY KEY (viagem_id, aluno_id)
);

CREATE TABLE confirmacoes (
  sentido TEXT NOT NULL CHECK (sentido IN ('ida', 'volta')),
  viagem_id INTEGER NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  confirmacao TEXT NOT NULL,
  PRIMARY KEY (sentido, viagem_id, aluno_id)
);

CREATE TABLE chegadas (
  viagem_id INTEGER PRIMARY KEY REFERENCES viagens(id) ON DELETE CASCADE,
  horario TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  sentido TEXT NOT NULL,
  destino TEXT NOT NULL
);

CREATE TABLE eventos (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  viagem_id INTEGER NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  aluno_id INTEGER REFERENCES alunos(id) ON DELETE SET NULL,
  autor_id TEXT,
  perfil_autor TEXT NOT NULL,
  criado_em TEXT NOT NULL,
  horario TEXT NOT NULL,
  ponto TEXT,
  observacao TEXT,
  detalhes TEXT
);

CREATE INDEX idx_eventos_viagem ON eventos(viagem_id);
