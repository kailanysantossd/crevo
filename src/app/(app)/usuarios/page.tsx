import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PerfilSelect } from "./_perfil-select";
import type { PerfilUsuario } from "./actions";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nome, email, perfil, created_at")
    .order("created_at", { ascending: false });

  const count = usuarios?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {count} usuário{count === 1 ? "" : "s"} cadastrado
          {count === 1 ? "" : "s"} · Cadastros são feitos pela tela de criar
          conta
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nome}
                    {u.id === user?.id && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (você)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-400">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <PerfilSelect
                      usuarioId={u.id}
                      perfil={u.perfil as PerfilUsuario}
                      disabled={u.id === user?.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
