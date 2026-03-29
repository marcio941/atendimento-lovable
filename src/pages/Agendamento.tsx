import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

export default function Agendamento() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim() || !dataHora) {
      toast.error("Preencha nome, telefone e data/hora.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("agendamentos").insert({
      nome: nome.trim(),
      telefone: telefone.trim(),
      data_hora: new Date(dataHora).toISOString(),
      observacao: observacao.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao agendar: " + error.message);
    } else {
      toast.success("Agendamento criado com sucesso!");
      setNome("");
      setTelefone("");
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
              <CardDescription>Agende um atendimento com data e hora</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Nome do cliente" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
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
