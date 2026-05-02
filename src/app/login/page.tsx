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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-xl mb-4">Login</h1>

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={entrar}
          className="w-full bg-blue-600 text-white p-2"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}