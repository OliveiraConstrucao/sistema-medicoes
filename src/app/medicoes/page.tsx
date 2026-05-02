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
  data_inicio: string
  data_fim: string
  status: string
}

export default function MedicoesPage() {
  const router = useRouter()

  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
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

  function formatarData(data: string) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const total =
    Number(diaria || 0) +
    Number(caminhao || 0) +
    Number(retro || 0)

  async function salvar() {
    if (!dataInicio || !dataFim) {
      alert('Informe as datas')
      return
    }

    await supabase.from('medicoes').insert([
      {
        periodo: `${formatarData(dataInicio)} até ${formatarData(dataFim)}`,
        diaria: Number(diaria || 0),
        caminhao: Number(caminhao || 0),
        retro: Number(retro || 0),
        total,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status,
      },
    ])

    setDataInicio('')
    setDataFim('')
    setDiaria('')
    setCaminhao('')
    setRetro('')
    setStatus('Aberta')

    carregar()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir medição?')) return
    await supabase.from('medicoes').delete().eq('id', id)
    carregar()
  }

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  function gerarPDF(m: Medicao) {
    const w = window.open('', '_blank')
    if (!w) return

    w.document.write(`
      <html>
        <head>
          <title>Medição</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            img { width: 100%; max-height: 120px; object-fit: contain; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th, td { border:1px solid #000; padding:10px; text-align:center; }
            th { background:#eee; }
          </style>
        </head>
        <body>
          <img src="/logo.png" />

          <h2>Período: ${m.periodo}</h2>

          <table>
            <tr>
              <th>Diária</th>
              <th>Caminhão</th>
              <th>Retro</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>${moeda(m.diaria)}</td>
              <td>${moeda(m.caminhao)}</td>
              <td>${moeda(m.retro)}</td>
              <td>${moeda(m.total)}</td>
            </tr>
          </table>

          <h2 style="text-align:right;">Total: ${moeda(m.total)}</h2>

          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)

    w.document.close()
  }

  function whatsapp(m: Medicao) {
    const texto = `Medição:

Período: ${m.periodo}
Diária: ${moeda(m.diaria)}
Caminhão: ${moeda(m.caminhao)}
Retro: ${moeda(m.retro)}
Total: ${moeda(m.total)}
Status: ${m.status}`

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`)
  }

  return (
    <div className="min-h-screen bg-slate-100 md:flex">

      {/* MENU LATERAL */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:bg-slate-950 md:text-white">
        <div className="border-b border-slate-800 p-6 text-center">
          <img src="/logopainel.png" className="mx-auto mb-4 h-24 w-24 object-contain" />
          <h1 className="font-bold">Oliveira Construção</h1>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <a href="/" className="block rounded-xl px-4 py-3 hover:bg-slate-800">📊 Painel</a>
          <a href="/medicoes" className="block rounded-xl bg-slate-800 px-4 py-3">📄 Medições</a>
          <a href="/relatorios" className="block rounded-xl px-4 py-3 hover:bg-slate-800">📁 Relatórios</a>
          <a href="/configuracoes" className="block rounded-xl px-4 py-3 hover:bg-slate-800">⚙️ Config</a>
        </nav>

        <button onClick={sair} className="m-4 bg-red-600 p-2 rounded">
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="w-full p-4 md:p-8">

        <h1 className="text-2xl font-bold mb-4">Medições</h1>

        {/* FORM */}
        <div className="bg-white p-4 rounded shadow mb-6 grid gap-3 md:grid-cols-4">
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="border p-2 rounded" />

          <input placeholder="Diária" value={diaria} onChange={e => setDiaria(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Caminhão" value={caminhao} onChange={e => setCaminhao(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Retro" value={retro} onChange={e => setRetro(e.target.value)} className="border p-2 rounded" />

          <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 rounded">
            <option>Aberta</option>
            <option>Fechada</option>
            <option>Enviada</option>
          </select>

          <div className="font-bold text-green-700">
            Total: {moeda(total)}
          </div>

          <button onClick={salvar} className="col-span-full bg-blue-600 text-white p-2 rounded">
            Salvar
          </button>
        </div>

        {/* TABELA */}
        <div className="bg-white p-4 rounded shadow overflow-auto">
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
                  <td>{moeda(m.total)}</td>
                  <td className="flex gap-2">
                    <button onClick={() => gerarPDF(m)} className="bg-gray-800 text-white px-2 rounded">PDF</button>
                    <button onClick={() => whatsapp(m)} className="bg-green-600 text-white px-2 rounded">Whats</button>
                    <button onClick={() => excluir(m.id)} className="bg-red-600 text-white px-2 rounded">Excluir</button>
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