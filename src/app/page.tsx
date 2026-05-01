'use client'

import { useMemo, useState } from 'react'

type Medicao = {
  id: string
  periodo: string
  datas: string
  total: number
}

const medicoesIniciais: Medicao[] = [
  {
    id: '005',
    periodo: 'abril_2026',
    datas: '01/04/2026 a 15/04/2026',
    total: 38995,
  },
  {
    id: '006',
    periodo: 'maio_2026',
    datas: '01/05/2026 a 20/05/2026',
    total: 42750,
  },
  {
    id: '007',
    periodo: 'junho_2026',
    datas: '01/06/2026 a 30/06/2026',
    total: 51800,
  },
]

export default function Home() {
  const [busca, setBusca] = useState('')
  const [medicoes] = useState<Medicao[]>(medicoesIniciais)

  const medicoesFiltradas = useMemo(() => {
    return medicoes.filter((m) =>
      m.periodo.toLowerCase().includes(busca.toLowerCase())
    )
  }, [busca, medicoes])

  const totalGeral = medicoes.reduce((soma, m) => soma + m.total, 0)
  const ultimaMedicao = medicoes[0]?.total ?? 0

  function moeda(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f0df] via-[#f7f8fb] to-[#dbe8f8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[300px] bg-slate-900 p-5 text-white lg:block">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl">
            <h1 className="text-2xl font-black">Oliveira Construção</h1>
            <p className="mt-2 text-sm text-slate-300">
              Gestão profissional de medições
            </p>

            <div className="mt-8 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-center text-sm font-bold text-yellow-200">
              🚧 Construindo com a qualidade que você merece
            </div>

            <div className="mt-6 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-center text-xs font-bold text-yellow-200">
              🏗️ Painel operacional
            </div>
          </div>

          <nav className="mt-10 space-y-4">
            <button className="flex w-full items-center gap-3 rounded-2xl bg-yellow-500/20 px-5 py-4 font-bold text-white ring-2 ring-yellow-400">
              📈 Painel de Controle
            </button>

            <button className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 font-bold text-slate-300 hover:bg-white/10">
              🔄 Atualizar medições
            </button>
          </nav>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-slate-300">
            <strong className="text-white">Dica:</strong>
            <p className="mt-2">
              Gere o PDF, revise a medição e compartilhe direto pelo WhatsApp.
            </p>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <header className="grid gap-6 xl:grid-cols-[1fr_360px_220px] xl:items-start">
            <div>
              <span className="rounded-full border border-yellow-400 bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-800">
                Dashboard de medições
              </span>

              <h2 className="mt-6 text-4xl font-black tracking-tight">
                Painel de Controle
              </h2>

              <p className="mt-3 max-w-lg text-lg text-slate-600">
                Acompanhe, edite e compartilhe suas medições em tempo real.
              </p>
            </div>

            <div className="rounded-3xl bg-white/70 p-5 shadow-xl backdrop-blur">
              <h3 className="font-black text-slate-700">📊 Evolução</h3>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Visão rápida
              </p>

              <div className="mt-4 flex items-end gap-4">
                {[70, 65, 68, 75, 70, 35].map((h, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="w-8 rounded-lg bg-yellow-400/80"
                      style={{ height: `${h}px` }}
                    />
                    <p className="mt-2 text-[10px] font-black text-slate-400">
                      Nº 00{i + 5}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full rounded-2xl bg-green-600 px-6 py-4 font-black text-white shadow-lg hover:bg-green-700">
                🔄 Atualizar medições
              </button>

              <button className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg hover:bg-blue-700">
                ➕ Nova medição
              </button>
            </div>
          </header>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <Card titulo="TOTAL GERAL" valor={moeda(totalGeral)} icone="💰" />
            <Card titulo="MEDIÇÕES" valor={String(medicoes.length)} icone="📄" />
            <Card titulo="ÚLTIMA MEDIÇÃO" valor={moeda(ultimaMedicao)} icone="🧾" />
          </section>

          <section className="mt-8 rounded-[32px] border border-yellow-200 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="🔍 Buscar por período..."
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-blue-500"
              />

              <select className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none">
                <option>Ordenar por período</option>
                <option>Maior valor</option>
                <option>Menor valor</option>
              </select>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-left text-white">
                    <th className="p-5">Nº</th>
                    <th className="p-5">PERÍODO</th>
                    <th className="p-5">TOTAL</th>
                    <th className="p-5">AÇÕES</th>
                  </tr>
                </thead>

                <tbody>
                  {medicoesFiltradas.map((medicao) => (
                    <tr key={medicao.id} className="border-b bg-white">
                      <td className="p-5 font-black">Nº {medicao.id}</td>

                      <td className="p-5">
                        <p className="text-lg font-black">{medicao.periodo}</p>
                        <p className="text-sm text-slate-500">{medicao.datas}</p>
                      </td>

                      <td className="p-5 font-black">{moeda(medicao.total)}</td>

                      <td className="p-5">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">
                            📄 PDF
                          </button>

                          <button className="rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white hover:bg-green-700">
                            📲 WhatsApp
                          </button>

                          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-700">
                            📤 Compartilhar
                          </button>

                          <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600">
                            ✏️ Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

function Card({
  titulo,
  valor,
  icone,
}: {
  titulo: string
  valor: string
  icone: string
}) {
  return (
    <div className="rounded-[28px] border-t-4 border-yellow-400 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black tracking-widest text-slate-500">
          {titulo}
        </p>

        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-3">
          {icone}
        </div>
      </div>

      <h3 className="mt-6 text-3xl font-black">{valor}</h3>
    </div>
  )
}