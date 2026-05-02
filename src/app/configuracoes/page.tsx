'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

type Medicao = {
  id: number
  periodo: string
  diaria: number
  caminhao: number
  retro: number
  total: number
  status: string
}

export default function Home() {
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

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  function moeda(v: number) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const totalGeral = medicoes.reduce(
    (acc, m) => acc + Number(m.total || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:bg-slate-950 md:text-white">
        <div className="border-b border-slate-800 p-6 text-center">
          <img
            src="/logopainel.png"
            alt="Logo"
            className="mx-auto mb-4 h-28 w-28 object-contain"
          />

          <h1 className="text-xl font-bold">Oliveira Construção</h1>
          <p className="text-sm text-slate-400">Sistema de Medições</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <a href="/" className="block rounded-xl bg-slate-800 px-4 py-3 font-bold">
            📊 Painel
          </a>

          <a href="/medicoes" className="block rounded-xl px-4 py-3 hover:bg-slate-800">
            📄 Medições
          </a>

          <a href="/relatorios" className="block rounded-xl px-4 py-3 hover:bg-slate-800">
            📁 Relatórios
          </a>

          <a href="/configuracoes" className="block rounded-xl px-4 py-3 hover:bg-slate-800">
            ⚙️ Configurações
          </a>
        </nav>

        <div className="p-4">
          <div className="mb-4 rounded-xl bg-slate-900 p-3">
            <p className="text-xs text-slate-400">Usuário logado</p>
            <p className="font-bold">Administrador</p>
          </div>

          <button
            onClick={sair}
            className="w-full rounded-xl bg-red-600 p-3 font-bold text-white hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="w-full p-4 md:ml-72 md:p-8">
        <div className="mb-5 rounded-2xl bg-white p-4 shadow md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logopainel.png"
                alt="Logo"
                className="h-14 w-14 object-contain"
              />

              <div>
                <h1 className="font-bold">Oliveira Construção</h1>
                <p className="text-sm text-gray-500">Administrador</p>
              </div>
            </div>

            <button
              onClick={sair}
              className="rounded-lg bg-red-600 px-3 py-2 text-white"
            >
              Sair
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <a href="/" className="rounded-xl bg-slate-900 p-2 text-white">
              📊<br />Painel
            </a>

            <a href="/medicoes" className="rounded-xl bg-slate-100 p-2">
              📄<br />Medições
            </a>

            <a href="/relatorios" className="rounded-xl bg-slate-100 p-2">
              📁<br />Relatórios
            </a>

            <a href="/configuracoes" className="rounded-xl bg-slate-100 p-2">
              ⚙️<br />Config.
            </a>
          </div>
        </div>

        <header className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-3xl font-bold text-slate-900">
            Painel de Controle
          </h2>
          <p className="text-gray-500">
            Resumo geral das medições cadastradas.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card titulo="Total Geral" valor={moeda(totalGeral)} cor="green" />
          <Card titulo="Medições" valor={String(medicoes.length)} cor="blue" />
          <Card
            titulo="Última Medição"
            valor={medicoes[0] ? moeda(Number(medicoes[0].total)) : 'R$ 0,00'}
            cor="orange"
          />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Últimas Medições</h3>

            <a
              href="/medicoes"
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
            >
              Nova Medição
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Período</th>
                  <th className="p-3">Diária</th>
                  <th className="p-3">Caminhão</th>
                  <th className="p-3">Retro</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>

              <tbody>
                {medicoes.slice(0, 8).map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{m.periodo}</td>
                    <td className="p-3">{moeda(Number(m.diaria || 0))}</td>
                    <td className="p-3">{moeda(Number(m.caminhao || 0))}</td>
                    <td className="p-3">{moeda(Number(m.retro || 0))}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {moeda(Number(m.total || 0))}
                    </td>
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

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string
  valor: string
  cor: 'green' | 'blue' | 'orange'
}) {
  const cores = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <h2 className={`mt-2 rounded-xl p-3 text-2xl font-bold ${cores[cor]}`}>
        {valor}
      </h2>
    </div>
  )
}