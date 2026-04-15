// Types matching the Lovable Cloud database schema

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  mensagem: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  data_hora: string;
  observacao: string | null;
  criado_em: string;
}

export interface Acompanhamento {
  id: string;
  lead_id: string;
  mensagem: string | null;
  enviado_em: string;
  canal: string;
}
