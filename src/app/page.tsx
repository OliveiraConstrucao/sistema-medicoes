'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

export default function Home() {
  const router = useRouter()

  const [medicoes, setMedicoes] = useState<any[]>([])
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [diaria, setDiaria] = useState('')
  const [caminhao, setCaminhao] = useState('')
  const [retro, setRetro] = useState('')
  const [status, setStatus] = useState('Aberta')

  const total =
    Number(diaria || 0) +
    Number(caminhao || 0) +
    Number(retro || 0)

  function moeda(v: number) {
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  // 🔒 PROTEÇÃO LOGIN
  useEffect(() => {
    const logado = localStorage.getItem('logado')

    if (!logado) {
      router.push('/login')
      return
    }

    carregarMedicoes()
  }, [])

  async function carregarMedicoes() {
    const { data } = await supabase
      .from('medicoes')
      .select('*')
      .order('id', { ascending: false })

    setMedicoes(data || [])
  }

  async function salvar() {
    if (!dataInicio || !dataFim) {
      alert('Preencha as datas')
      return
    }

    await supabase.from('medicoes').insert([
      {
        periodo: `${dataInicio} até ${dataFim}`,
        diaria: Number(diaria),
        caminhao: Number(caminhao),
        retro: Number(retro),
        total,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status,
      },
    ])

    alert('Salvo!')
    limpar()
    carregarMedicoes()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir?')) return

    await supabase.from('medicoes').delete().eq('id', id)

    carregarMedicoes()
  }

  function limpar() {
    setDataInicio('')
    setDataFim('')
    setDiaria('')
    setCaminhao('')
    setRetro('')
    setStatus('Aberta')
  }

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  function visualizar(m: any) {
    const w = window.open('', '_blank')

    w?.document.write(`
      <html>
      <body style="font-family:Arial;padding:20px">
        <img src="/logo.png" style="width:100%;max-height:120px;object-fit:contain"/>
        <h3>Período: ${m.periodo}</h3>
        <p>Diária: ${moeda(m.diaria)}</p>
        <p>Caminhão: ${moeda(m.caminhao)}</p>
        <p>Retro: ${moeda(m.retro)}</p>
        <h2>Total: ${moeda(m.total)}</h2>
      </body>
      </html>
    `)
  }

  function gerarPDF(m: any) {
    const w = window.open('', '_blank')

    w?.document.write(`
      <html>
      <body onload="window.print()" style="font-family:Arial;padding:20px">
        <img src="/logo.png" style="width:100%;max-height:120px;object-fit:contain"/>
        <h3>Período: ${m.periodo}</h3>
        <p>Diária: ${moeda(m.diaria)}</p>
        <p>Caminhão: ${moeda(m.caminhao)}</p>
        <p>Retro: ${moeda(m.retro)}</p>
        <h2>Total: ${moeda(m.total)}</h2>
      </body>
      </html>
    `)
  }

  function whatsapp(m: any) {
    const texto = `
Medição:
${m.periodo}

Total: ${moeda(m.total)}
    `

    window.open(
      `https://wa.me/?text=${encodeURIComponent(texto)}`,
      '_blank'
    )
  }

  const totalGeral = medicoes.reduce(
    (acc, m) => acc + Number(m.total || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Painel</h1>

        <button
          onClick={sair}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Sair
        </button>
      </div>

      {/* FORM */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <div className="grid md:grid-cols-4 gap-2">
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="border p-2 rounded"/>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Diária" value={diaria} onChange={e => setDiaria(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Caminhão" value={caminhao} onChange={e => setCaminhao(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Retro" value={retro} onChange={e => setRetro(e.target.value)} className="border p-2 rounded"/>
          <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 rounded">
            <option>Aberta</option>
            <option>Fechada</option>
          </select>
        </div>

        <p className="mt-2 font-bold">Total: {moeda(total)}</p>

        <button
          onClick={salvar}
          className="mt-2 bg-blue-600 text-white p-2 rounded"
        >
          Salvar
        </button>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <Card titulo="Total Geral" valor={moeda(totalGeral)} />
        <Card titulo="Medições" valor={medicoes.length} />
        <Card
          titulo="Última"
          valor={
            medicoes[0]
              ? moeda(medicoes[0].total)
              : 'R$ 0,00'
          }
        />
      </div>

      {/* LISTA MOBILE */}
      <div className="md:hidden space-y-3">
        {medicoes.map(m => (
          <div key={m.id} className="bg-white p-3 rounded shadow">
            <b>{m.periodo}</b>
            <p>Total: {moeda(m.total)}</p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => visualizar(m)} className="bg-blue-500 text-white p-1 rounded">Ver</button>
              <button onClick={() => gerarPDF(m)} className="bg-gray-800 text-white p-1 rounded">PDF</button>
              <button onClick={() => excluir(m.id)} className="bg-red-600 text-white p-1 rounded">Excluir</button>
              <button onClick={() => whatsapp(m)} className="bg-green-600 text-white p-1 rounded">Whats</button>
            </div>
          </div>
        ))}
      </div>

      {/* TABELA DESKTOP */}
      <div className="hidden md:block bg-white p-4 rounded shadow">
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
                  <button onClick={() => visualizar(m)} className="bg-blue-500 text-white px-2 rounded">Ver</button>
                  <button onClick={() => gerarPDF(m)} className="bg-gray-800 text-white px-2 rounded">PDF</button>
                  <button onClick={() => excluir(m.id)} className="bg-red-600 text-white px-2 rounded">Excluir</button>
                  <button onClick={() => whatsapp(m)} className="bg-green-600 text-white px-2 rounded">Whats</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Card({ titulo, valor }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500">{titulo}</p>
      <h2 className="text-xl font-bold">{valor}</h2>
    </div>
  )
}