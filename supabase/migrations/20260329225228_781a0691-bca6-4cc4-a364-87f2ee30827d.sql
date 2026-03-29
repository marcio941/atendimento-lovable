
-- Create table for leads/pistas
CREATE TABLE public.pistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em atendimento', 'agendado', 'fechado')),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scheduling/agendamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for this CRM)
CREATE POLICY "Allow all access to pistas" ON public.pistas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to agendamentos" ON public.agendamentos FOR ALL USING (true) WITH CHECK (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pistas_updated_at
  BEFORE UPDATE ON public.pistas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
