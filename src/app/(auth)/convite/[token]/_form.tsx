"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aceitarConvite, type AceitarConviteState } from "./actions";

const initialState: AceitarConviteState = {};

export function AceiteForm({ token, email }: { token: string; email: string }) {
  const action = aceitarConvite.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Seu nome</Label>
          <Input
            id="nome"
            name="nome"
            type="text"
            placeholder="Como quer ser chamado(a)"
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="email"
            required
          />
          <p className="text-xs text-muted-foreground">
            Use o mesmo e-mail do convite.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Criar senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {state.success}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 mt-6">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Aceitar convite e entrar"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
