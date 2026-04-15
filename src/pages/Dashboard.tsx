import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { LayoutDashboard, Users, Clock, CalendarCheck, CheckCircle } from "lucide-react";
import type { Lead } from "@/types/crm";

const STATUS_FLOW: Record<string, string> = {
  novo: "em atendimento",
  "em atendimento": "agendado",
  agendado: "fechado",
};

const STATUS_COLORS: Record<string, string> = {
  novo: "bg-[hsl(var(--status-novo))] text-primary-foreground",
  "em atendimento": "bg-[hsl(var(--status-atendimento))] text-primary-foreground",
  agendado: "bg-[hsl(var(--status-agendado))] text-accent-foreground",
  fechado: "bg-[hsl(var(--status-fechado))] text-primary-foreground",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  novo: <Users className="h-4 w-4" />,
  "em atendimento": <Clock className="h-4 w-4" />,
  agendado: <CalendarCheck className="h-4 w-4" />,
  fechado: <CheckCircle className="h-4 w-4" />,
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return data as unknown as Lead[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status atualizado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const counts = {
    novo: leads?.filter((p) => p.status === "novo").length ?? 0,
    "em atendimento": leads?.filter((p) => p.status === "em atendimento").length ?? 0,
    agendado: leads?.filter((p) => p.status === "agendado").length ?? 0,
    fechado: leads?.filter((p) => p.status === "fechado").length ?? 0,
  };

  const statCards = [
    { label: "Novos", value: counts.novo, icon: Users, color: "text-[hsl(var(--status-novo))]" },
    { label: "Em Atendimento", value: counts["em atendimento"], icon: Clock, color: "text-[hsl(var(--status-atendimento))]" },
    { label: "Agendados", value: counts.agendado, icon: CalendarCheck, color: "text-[hsl(var(--status-agendado))]" },
    { label: "Fechados", value: counts.fechado, icon: CheckCircle, color: "text-[hsl(var(--status-fechado))]" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Painel de Leads</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : !leads?.length ? (
            <p className="text-muted-foreground">Nenhum lead registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.telefone}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[p.status] ?? ""}>
                          <span className="flex items-center gap-1">
                            {STATUS_ICONS[p.status]}
                            {p.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.criado_em).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {STATUS_FLOW[p.status] ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatus.mutate({ id: p.id, status: STATUS_FLOW[p.status] })
                            }
                          >
                            → {STATUS_FLOW[p.status]}
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Finalizado</span>
                        )}
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
