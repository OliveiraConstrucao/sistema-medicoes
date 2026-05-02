'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      {/* MENU */}
      <aside className="hidden md:flex md:w-72 md:flex-col bg-slate-950 text-white">
        <div className="p-6 text-center border-b border-slate-800">
          <img
            src="/logopainel.png"
            className="mx-auto mb-3 w-20 h-20 object-contain"
          />
          <h1 className="font-bold">Oliveira Construção</h1>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/" className="block p-3 bg-slate-800 rounded">
            📊 Painel
          </Link>

          <Link href="/medicoes" className="block p-3 rounded hover:bg-slate-800">
            📄 Medições
          </Link>

          <Link href="/relatorios" className="block p-3 rounded hover:bg-slate-800">
            📁 Relatórios
          </Link>

          <Link href="/configuracoes" className="block p-3 rounded hover:bg-slate-800">
            ⚙️ Configurações
          </Link>
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={sair}
            className="w-full bg-red-600 p-3 rounded text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">
          Painel de Controle
        </h1>

        <p className="text-gray-500">
          Sistema funcionando corretamente.
        </p>
      </main>
    </div>
  )
}