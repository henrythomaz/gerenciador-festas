import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { api } from '@/lib/api-client'
import { useState } from 'react'
import { z } from 'zod'

const searchSchema = z.object({
  token: z.string().optional(),
})

function ResetPassword() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()

  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)
    setErro('')
    setMensagem('')

    try {
      await api(`/password/reset?token=${token}`, {
        method: 'POST',
        body: JSON.stringify({
          senha,
        }),
      })

      setMensagem('Senha redefinida com sucesso!')

      setTimeout(() => {
        navigate({ to: '/login' })
      }, 2000)
    } catch (err: any) {
      setErro(err.message || 'Erro ao redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Token inválido">
        <p>Token não fornecido.</p>

        <div className="mt-4">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Digite sua nova senha."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nova senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Digite sua nova senha"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirmar senha
          </label>

          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Confirme sua senha"
            required
          />
        </div>

        {erro && (
          <p className="text-sm text-red-600">{erro}</p>
        )}

        {mensagem && (
          <p className="text-sm text-green-600">{mensagem}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    </AuthLayout>
  )
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search) => searchSchema.parse(search),
  component: ResetPassword,
})

export default ResetPassword
