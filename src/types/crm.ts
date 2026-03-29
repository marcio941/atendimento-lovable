// Manual types matching the external Supabase schema

export interface Pista {
  id: string;
  nome: string;
  telefone: string;
  mensagem: string | null;
  status: string;
  created_at: string;
}

export interface Agendamento {
  id: string;
  lead_id: string;
  data_hora: string;
  observacao: string | null;
  status: string;
  created_at: string;
}

export interface Acompanhamento {
  id: string;
  lead_id: string;
  mensagem: string | null;
  enviado_em: string;
  canal: string;
}
