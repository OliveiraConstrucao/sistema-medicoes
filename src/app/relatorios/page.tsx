'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

type Medicao = {
  id: number
  periodo: string
  total: number
  status: string
}

export default function RelatoriosPage() {
  const router = useRouter()
  const [medicoes, setMedicoes] = useState<Medicao[]>([])

  useEffect(() => {
    if (!localStorage.getItem('logado')) {
      router.push('/login')
      return
    }

    carregar()
  }, [])

  async function carregar() {
    const { data } = await supabase
      .from('medicoes')
      .select('*')
      .order('id', { ascending: false })

    setMedicoes(data || [])
  }

  function moeda(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  const totalGeral = medicoes.reduce((acc, m) => acc + Number(m.total || 0), 0)
  const abertas = medicoes.filter((m) => m.status === 'Aberta').length
  const fechadas = medicoes.filter((m) => m.status === 'Fechada').length

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:bg-slate-950 md:text-white">
        <div className="border-b border-slate-800 p-6 text-center">
          <img src="/logopainel.png" className="mx-auto mb-4 h-24 w-24 object-contain" />
          <h1 className="font-bold">Oliveira Construção</h1>
          <p className="text-sm text-slate-400">Sistema de Medições</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <a href="/" className="block rounded-xl px-4 py-3 hover:bg-slate-800">📊 Painel</a>
          <a href="/medicoes" className="block rounded-xl px-4 py-3 hover:bg-slate-800">📄 Medições</a>
          <a href="/relatorios" className="block rounded-xl bg-slate-800 px-4 py-3">📁 Relatórios</a>
          <a href="/configuracoes" className="block rounded-xl px-4 py-3 hover:bg-slate-800">⚙️ Configurações</a>
        </nav>

        <div className="p-4">
          <button onClick={sair} className="w-full rounded-xl bg-red-600 p-3 font-bold">
            Sair
          </button>
        </div>
      </aside>

      <main className="w-full p-4 md:ml-64 md:p-8">
        <div className="mb-5 rounded-2xl bg-white p-4 shadow md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <img src="/logopainel.png" className="h-14 w-14 object-contain" />
            <button onClick={sair} className="rounded-lg bg-red-600 px-3 py-2 text-white">
              Sair
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <a href="/" className="rounded-xl bg-slate-100 p-2">📊<br />Painel</a>
            <a href="/medicoes" className="rounded-xl bg-slate-100 p-2">📄<br />Medições</a>
            <a href="/relatorios" className="rounded-xl bg-slate-900 p-2 text-white">📁<br />Relatórios</a>
            <a href="/configuracoes" className="rounded-xl bg-slate-100 p-2">⚙️<br />Config.</a>
          </div>
        </div>

        <header className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-3xl font-bold">Relatórios</h2>
          <p className="text-gray-500">Resumo financeiro das medições cadastradas.</p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card titulo="Total Geral" valor={moeda(totalGeral)} />
          <Card titulo="Medições Abertas" valor={String(abertas)} />
          <Card titulo="Medições Fechadas" valor={String(fechadas)} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h3 className="mb-4 text-xl font-bold">Resumo por Medição</h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Período</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>

              <tbody>
                {medicoes.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="p-3">{m.periodo}</td>
                    <td className="p-3">{m.status}</td>
                    <td className="p-3 font-bold">{moeda(Number(m.total || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <h2 className="mt-2 rounded-xl bg-blue-50 p-3 text-2xl font-bold text-blue-700">
        {valor}
      </h2>
    </div>
  )
}