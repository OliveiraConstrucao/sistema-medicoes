'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [senha, setSenha] = useState('')
  const router = useRouter()

  function entrar() {
    if (senha === 'oliveira2105') {
      localStorage.setItem('logado', 'true')
      router.push('/')
    } else {
      alert('Senha incorreta')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-center text-2xl font-bold">
          Oliveira Construção
        </h1>

        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mb-4 w-full rounded-xl border p-3"
        />

        <button
          onClick={entrar}
          className="w-full rounded-xl bg-blue-600 p-3 text-white"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}