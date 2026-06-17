"use client";

import { useActionState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redefinirSenha, type RedefinirSenhaState } from "./actions";

const initialState: RedefinirSenhaState = {};

export default function RedefinirSenhaPage() {
  const [state, formAction, pending] = useActionState(
    redefinirSenha,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir nova senha</CardTitle>
        <CardDescription>
          Escolha uma senha nova com pelo menos 6 caracteres
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha">Nova senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar senha</Label>
            <Input
              id="confirmar"
              name="confirmar"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
