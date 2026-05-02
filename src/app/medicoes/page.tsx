'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabaseClient'

type Medicao = {
  id: number
  periodo: string
  diaria: number
  caminhao: number
  retro: number
  total: number
  status: string
}

export default function MedicoesPage() {
  const router = useRouter()

  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [periodo, setPeriodo] = useState('')
  const [diaria, setDiaria] = useState('')
  const [caminhao, setCaminhao] = useState('')
  const [retro, setRetro] = useState('')
  const [status, setStatus] = useState('Aberta')

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

  async function salvar() {
    const total =
      Number(diaria || 0) +
      Number(caminhao || 0) +
      Number(retro || 0)

    await supabase.from('medicoes').insert([
      {
        periodo,
        diaria: Number(diaria),
        caminhao: Number(caminhao),
        retro: Number(retro),
        total,
        status,
      },
    ])

    setPeriodo('')
    setDiaria('')
    setCaminhao('')
    setRetro('')
    setStatus('Aberta')

    carregar()
  }

  async function excluir(id: number) {
    await supabase.from('medicoes').delete().eq('id', id)
    carregar()
  }

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
          <a href="/" className="block p-3 rounded hover:bg-slate-800">
            📊 Painel
          </a>

          <a href="/medicoes" className="block p-3 rounded bg-slate-800">
            📄 Medições
          </a>

          <a href="/relatorios" className="block p-3 rounded hover:bg-slate-800">
            📁 Relatórios
          </a>

          <a href="/configuracoes" className="block p-3 rounded hover:bg-slate-800">
            ⚙️ Config
          </a>
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
        <h1 className="text-3xl font-bold mb-6">
          Medições
        </h1>

        {/* FORM */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-5 gap-3">
          <input
            placeholder="Período"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Diária"
            value={diaria}
            onChange={(e) => setDiaria(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Caminhão"
            value={caminhao}
            onChange={(e) => setCaminhao(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Retro"
            value={retro}
            onChange={(e) => setRetro(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={salvar}
            className="bg-blue-600 text-white rounded p-2"
          >
            Salvar
          </button>
        </div>

        {/* TABELA */}
        <div className="bg-white p-4 rounded-xl shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>Período</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {medicoes.map((m) => (
                <tr key={m.id} className="border-b">
                  <td>{m.periodo}</td>
                  <td>{moeda(m.total)}</td>
                  <td>
                    <button
                      onClick={() => excluir(m.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
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