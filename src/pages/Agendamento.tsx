import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

export default function Agendamento() {
  const [leadId, setLeadId] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: leads } = useQuery({
    queryKey: ["pistas-select"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads")
        .select("id, nome, telefone")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !dataHora) {
      toast.error("Selecione um lead e a data/hora.");
      return;
    }
    setLoading(true);
    const selectedLead = leads?.find((l: any) => l.id === leadId);
    if (!selectedLead) {
      toast.error("Lead não encontrado.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("agendamentos").insert({
      nome: selectedLead.nome,
      telefone: selectedLead.telefone,
      data_hora: new Date(dataHora).toISOString(),
      observacao: observacao.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao agendar: " + error.message);
    } else {
      toast.success("Agendamento criado com sucesso!");
      setLeadId("");
      setDataHora("");
      setObservacao("");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <CalendarDays className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Novo Agendamento</CardTitle>
              <CardDescription>Agende um atendimento vinculado a um lead</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead">Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads?.map((lead: any) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nome} — {lead.telefone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataHora">Data e Hora</Label>
              <Input id="dataHora" type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea id="observacao" placeholder="Alguma observação..." value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Agendando..." : "Agendar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
