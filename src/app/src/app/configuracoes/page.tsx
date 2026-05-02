'use client'

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="mt-2 text-gray-500">
          Área de configurações do sistema.
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-4 py-2 text-white"
        >
          Voltar ao painel
        </a>
      </div>
    </div>
  )
}