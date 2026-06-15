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
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Cadastre-se para acessar a plataforma
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              type="text"
              placeholder="Seu nome"
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
              placeholder="voce@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Mínimo 6 caracteres
            </p>
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {state.success}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 mt-6">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Criando..." : "Criar conta"}
          </Button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-900 dark:text-zinc-50 underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
