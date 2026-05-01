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
  data_inicio: string
  data_fim: string
  status: string
}

export default function Home() {
  const router = useRouter()

  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [diaria, setDiaria] = useState('')
  const [caminhao, setCaminhao] = useState('')
  const [retro, setRetro] = useState('')
  const [status, setStatus] = useState('Aberta')

  useEffect(() => {
    const logado = localStorage.getItem('logado')
    if (!logado) router.push('/login')
    else carregar()
  }, [])

  async function carregar() {
    const { data } = await supabase
      .from('medicoes')
      .select('*')
      .order('id', { ascending: false })

    setMedicoes(data || [])
  }

  function moeda(v: number) {
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const totalCalculado =
    Number(diaria || 0) +
    Number(caminhao || 0) +
    Number(retro || 0)

  async function salvar() {
    if (!dataInicio || !dataFim) return alert('Preencha o período')

    await supabase.from('medicoes').insert({
      periodo: `${dataInicio} até ${dataFim}`,
      diaria,
      caminhao,
      retro,
      status,
      total: totalCalculado,
    })

    setDataInicio('')
    setDataFim('')
    setDiaria('')
    setCaminhao('')
    setRetro('')

    carregar()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir?')) return
    await supabase.from('medicoes').delete().eq('id', id)
    carregar()
  }

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  const totalGeral = medicoes.reduce((acc, m) => acc + Number(m.total || 0), 0)

  return (
    <div className="min-h-screen bg-slate-100 md:flex">

      {/* MENU PC */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:bg-slate-950 md:text-white">

        <div className="flex flex-col items-center border-b border-slate-800 p-6">
          <img
            src="/logopainel.png"
            className="mb-4 h-24 w-24 object-contain"
          />
          <h1 className="text-center font-bold">Oliveira Construção</h1>
        </div>

        <nav className="flex-1 space-y-2 p-4">

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex w-full gap-2 rounded-xl bg-slate-800 p-3"
          >
            📊 Painel
          </button>

          <button
            onClick={() => document.getElementById('medicoes')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex w-full gap-2 rounded-xl p-3 hover:bg-slate-800"
          >
            📄 Medições
          </button>

          <button
            onClick={() => document.getElementById('resumo')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex w-full gap-2 rounded-xl p-3 hover:bg-slate-800"
          >
            📁 Relatórios
          </button>

          <button
            onClick={() => alert('Em breve')}
            className="flex w-full gap-2 rounded-xl p-3 hover:bg-slate-800"
          >
            ⚙️ Config
          </button>

        </nav>

        <button onClick={sair} className="m-4 bg-red-600 p-2 rounded">
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="w-full p-4 md:ml-64">

        {/* TOPO MOBILE */}
        <div className="mb-4 md:hidden bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <img src="/logopainel.png" className="h-12" />
            <button onClick={sair} className="bg-red-600 text-white px-3 py-1 rounded">
              Sair
            </button>
          </div>

          {/* MENU MOBILE */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <button onClick={() => window.scrollTo({ top: 0 })} className="bg-black text-white p-2 text-xs rounded">📊 Painel</button>
            <button onClick={() => document.getElementById('medicoes')?.scrollIntoView()} className="bg-gray-200 p-2 text-xs rounded">📄 Medições</button>
            <button onClick={() => document.getElementById('resumo')?.scrollIntoView()} className="bg-gray-200 p-2 text-xs rounded">📁 Relatórios</button>
            <button onClick={() => alert('Em breve')} className="bg-gray-200 p-2 text-xs rounded">⚙️</button>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">

          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="border p-2 rounded" />

          <input placeholder="Diária" value={diaria} onChange={e => setDiaria(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Caminhão" value={caminhao} onChange={e => setCaminhao(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Retro" value={retro} onChange={e => setRetro(e.target.value)} className="border p-2 rounded" />

          <button onClick={salvar} className="col-span-full bg-blue-600 text-white p-2 rounded">
            Salvar
          </button>

        </div>

        {/* CARDS */}
        <div id="resumo" className="grid md:grid-cols-3 gap-4 mb-6">
          <Card titulo="Total Geral" valor={moeda(totalGeral)} />
          <Card titulo="Medições" valor={medicoes.length} />
          <Card titulo="Última" valor={medicoes[0] ? moeda(medicoes[0].total) : 'R$ 0'} />
        </div>

        {/* TABELA */}
        <div id="medicoes" className="bg-white p-4 rounded shadow">
          <table className="w-full">
            <thead>
              <tr>
                <th>Período</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {medicoes.map(m => (
                <tr key={m.id}>
                  <td>{m.periodo}</td>
                  <td>{moeda(Number(m.total))}</td>
                  <td>
                    <button onClick={() => excluir(m.id)} className="bg-red-600 text-white px-2 py-1 rounded">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </main>
    </div>
  )
}

function Card({ titulo, valor }: any) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500">{titulo}</p>
      <h2 className="text-xl font-bold">{valor}</h2>
    </div>
  )
}