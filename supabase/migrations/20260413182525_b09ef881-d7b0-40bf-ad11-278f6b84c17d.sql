
CREATE TABLE public.acompanhamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.pistas(id) ON DELETE CASCADE,
  mensagem TEXT,
  canal TEXT NOT NULL DEFAULT 'chat',
  enviado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.acompanhamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to acompanhamentos"
  ON public.acompanhamentos
  FOR ALL
  USING (true)
  WITH CHECK (true);
