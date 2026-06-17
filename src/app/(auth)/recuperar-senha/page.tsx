"use client";

import Link from "next/link";
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
import { recuperarSenha, type RecuperarSenhaState } from "./actions";

const initialState: RecuperarSenhaState = {};

export default function RecuperarSenhaPage() {
  const [state, formAction, pending] = useActionState(
    recuperarSenha,
    initialState
  );

  if (state.ok) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifique seu e-mail</CardTitle>
          <CardDescription>
            Se a conta existir, enviamos um link para redefinir a senha. Pode
            demorar alguns minutos para chegar — confira também a pasta de
            spam.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/login"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu e-mail que enviamos um link para redefinir a senha
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="voce@example.com"
              autoComplete="email"
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 mt-6">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link"}
          </Button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Lembrou da senha?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-900 dark:text-zinc-50 underline-offset-4 hover:underline"
            >
              Voltar para o login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
