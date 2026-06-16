import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PerfilSelect } from "./_perfil-select";
import { ConvitesPendentes } from "./_convites-pendentes";
import type { PerfilUsuario } from "./actions";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: usuarios }, { data: convites }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, perfil, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("convites")
      .select("id, token, email, perfil, created_at, expira_em, cliente:clientes(nome)")
      .is("aceito_em", null)
      .gt("expira_em", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const count = usuarios?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            {count} pessoa{count === 1 ? "" : "s"} na sua agência
          </p>
        </div>
        <Link href="/usuarios/convidar" className={buttonVariants()}>
          Convidar pessoa
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pessoas com acesso</CardTitle>
        </CardHeader>
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
                      <span className="ml-2 text-xs text-muted-foreground">
                        (você)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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

      {convites && convites.length > 0 && (
        <ConvitesPendentes convites={convites} />
      )}
    </div>
  );
}
