import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send } from "lucide-react";
import type { Acompanhamento } from "@/types/crm";

const CANAIS = ["chat", "email", "telefone", "whatsapp"];

export default function Acompanhamentos() {
  const [leadId, setLeadId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [canal, setCanal] = useState("chat");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ["leads-select"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads")
        .select("id, nome, telefone")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: acompanhamentos, isLoading } = useQuery({
    queryKey: ["acompanhamentos"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("acompanhamentos")
        .select("*, leads(nome)")
        .order("enviado_em", { ascending: false });
      if (error) throw error;
      return data as (Acompanhamento & { leads: { nome: string } | null })[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !mensagem.trim()) {
      toast.error("Selecione um lead e escreva uma mensagem.");
      return;
    }
    setLoading(true);
    const { error } = await (supabase as any).from("acompanhamentos").insert({
      lead_id: leadId,
      mensagem: mensagem.trim(),
      canal,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao registrar: " + error.message);
    } else {
      toast.success("Acompanhamento registrado!");
      setMensagem("");
      queryClient.invalidateQueries({ queryKey: ["acompanhamentos"] });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Novo Acompanhamento</CardTitle>
              <CardDescription>Registre um follow-up com um lead</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lead</Label>
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
                <Label>Canal</Label>
                <Select value={canal} onValueChange={setCanal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANAIS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea placeholder="Descreva o acompanhamento..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Registrar Acompanhamento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Acompanhamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : !acompanhamentos?.length ? (
            <p className="text-muted-foreground">Nenhum acompanhamento registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Enviado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acompanhamentos.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.leads?.nome ?? "—"}</TableCell>
                      <TableCell className="max-w-xs truncate">{a.mensagem}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{a.canal}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(a.enviado_em).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
