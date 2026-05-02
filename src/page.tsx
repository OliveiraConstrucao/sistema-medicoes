'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-950 text-white flex flex-col">
        <div className="p-6 text-center border-b border-slate-800">
          <img src="/logopainel.png" className="mx-auto w-20" />
          <h1 className="font-bold mt-2">Oliveira Construção</h1>
        </div>

        <nav className="p-4 space-y-2">
          <button onClick={() => router.push('/')} className="block w-full p-3 bg-slate-800 rounded">Painel</button>
          <button onClick={() => router.push('/medicoes')} className="block w-full p-3 rounded hover:bg-slate-800">Medições</button>
          <button onClick={() => router.push('/relatorios')} className="block w-full p-3 rounded hover:bg-slate-800">Relatórios</button>
          <button onClick={() => router.push('/configuracoes')} className="block w-full p-3 rounded hover:bg-slate-800">Config</button>
        </nav>
      </aside>

      <main className="flex-1 p-10 bg-gray-100">
        <h1 className="text-3xl font-bold">Painel</h1>
        <p className="text-gray-500 mt-2">Sistema funcionando corretamente</p>
      </main>
    </div>
  )
}