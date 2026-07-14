import { createFileRoute, Link } from '@tanstack/react-router'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { login } from '@/lib/auth'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password: senha })
      // redirecionar para dashboard ou /
    } catch (err: any) {
      setErro(err.message)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* campos */}
      </form>
    </AuthLayout>
  )
}
