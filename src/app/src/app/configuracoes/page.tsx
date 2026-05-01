'use client'

import { useRouter } from 'next/navigation'

export default function ConfiguracoesPage() {
  const router = useRouter()

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:bg-slate-950 md:text-white">
        <div className="border-b border-slate-800 p-6 text-center">
          <img
            src="/logopainel.png"
            className="mx-auto mb-4 h-24 w-24 object-contain"
          />

          <h1 className="font-bold">Oliveira Construção</h1>
          <p className="text-sm text-slate-400">Sistema de Medições</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <a href="/" className="block rounded-xl px-4 py-3 hover:bg-slate-800">
            📊 Painel
          </a>

          <a href="/medicoes" className="block rounded-xl px-4 py-3 hover:bg-slate-800">
            📄 Medições
          </a>

          <a href="/relatorios" className="block rounded-xl px-4 py-3 hover:bg-slate-800">
            📁 Relatórios
          </a>

          <a href="/configuracoes" className="block rounded-xl bg-slate-800 px-4 py-3">
            ⚙️ Configurações
          </a>
        </nav>

        <div className="p-4">
          <button
            onClick={sair}
            className="w-full rounded-xl bg-red-600 p-3 font-bold"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="w-full p-4 md:ml-64 md:p-8">
        <div className="mb-5 rounded-2xl bg-white p-4 shadow md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <img src="/logopainel.png" className="h-14 w-14 object-contain" />

            <button
              onClick={sair}
              className="rounded-lg bg-red-600 px-3 py-2 text-white"
            >
              Sair
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <a href="/" className="rounded-xl bg-slate-100 p-2">
              📊<br />Painel
            </a>

            <a href="/medicoes" className="rounded-xl bg-slate-100 p-2">
              📄<br />Medições
            </a>

            <a href="/relatorios" className="rounded-xl bg-slate-100 p-2">
              📁<br />Relatórios
            </a>

            <a href="/configuracoes" className="rounded-xl bg-slate-900 p-2 text-white">
              ⚙️<br />Config.
            </a>
          </div>
        </div>

        <header className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-3xl font-bold">Configurações</h2>
          <p className="text-gray-500">
            Área reservada para ajustes do sistema.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h3 className="mb-4 text-xl font-bold">Dados do Sistema</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-bold">Oliveira Construção</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">Usuário</p>
              <p className="font-bold">Administrador</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">Versão</p>
              <p className="font-bold">1.0</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-bold text-green-600">Ativo</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}