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

  const total = Number(diaria || 0) + Number(caminhao || 0) + Number(retro || 0)

  async function salvar() {
    if (!dataInicio || !dataFim) {
      alert('Informe a data inicial e final')
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
    if (!confirm('Excluir esta medição?')) return

    await supabase.from('medicoes').delete().eq('id', id)
    carregar()
  }

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  function gerarPDF(m: Medicao) {
    const janela = window.open('', '_blank')
    if (!janela) return

    janela.document.write(`
      <html>
        <head>
          <title>Medição</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            img { width: 100%; max-height: 130px; object-fit: contain; margin-bottom: 20px; }
            .faixa { background:#000; color:#fff; padding:8px; text-align:center; font-weight:bold; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th, td { border:1px solid #000; padding:10px; text-align:center; }
            th { background:#ddd; }
            .total { text-align:right; font-size:22px; font-weight:bold; margin-top:25px; }
          </style>
        </head>
        <body>
          <img src="/logo.png" />
          <div class="faixa">DESPESAS COM DIÁRIAS</div>
          <h3>Período: ${m.periodo}</h3>

          <table>
            <tr>
              <th>Diária</th>
              <th>Caminhão</th>
              <th>Retro</th>
              <th>Total</th>
            </tr>
            <tr>
              <td>${moeda(Number(m.diaria))}</td>
              <td>${moeda(Number(m.caminhao))}</td>
              <td>${moeda(Number(m.retro))}</td>
              <td>${moeda(Number(m.total))}</td>
            </tr>
          </table>

          <div class="total">TOTAL FINAL: ${moeda(Number(m.total))}</div>

          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function whatsapp(m: Medicao) {
    const texto = `Olá, segue medição:

Período: ${m.periodo}
Diária: ${moeda(Number(m.diaria))}
Caminhão: ${moeda(Number(m.caminhao))}
Retro: ${moeda(Number(m.retro))}
Total: ${moeda(Number(m.total))}
Status: ${m.status}`

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

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
          <a href="/medicoes" className="block rounded-xl bg-slate-800 px-4 py-3">📄 Medições</a>
          <a href="/relatorios" className="block rounded-xl px-4 py-3 hover:bg-slate-800">📁 Relatórios</a>
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
            <a href="/medicoes" className="rounded-xl bg-slate-900 p-2 text-white">📄<br />Medições</a>
            <a href="/relatorios" className="rounded-xl bg-slate-100 p-2">📁<br />Relatórios</a>
            <a href="/configuracoes" className="rounded-xl bg-slate-100 p-2">⚙️<br />Config.</a>
          </div>
        </div>

        <header className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-3xl font-bold">Medições</h2>
          <p className="text-gray-500">Cadastre e gerencie as medições.</p>
        </header>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow">
          <h3 className="mb-4 font-bold">Nova Medição</h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="rounded-xl border p-3" />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="rounded-xl border p-3" />
            <input type="number" placeholder="Diária" value={diaria} onChange={(e) => setDiaria(e.target.value)} className="rounded-xl border p-3" />
            <input type="number" placeholder="Caminhão" value={caminhao} onChange={(e) => setCaminhao(e.target.value)} className="rounded-xl border p-3" />
            <input type="number" placeholder="Retro" value={retro} onChange={(e) => setRetro(e.target.value)} className="rounded-xl border p-3" />

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border p-3">
              <option>Aberta</option>
              <option>Fechada</option>
              <option>Enviada</option>
              <option>Paga</option>
            </select>

            <div className="rounded-xl border bg-green-50 p-3 font-bold text-green-700">
              Total: {moeda(total)}
            </div>
          </div>

          <button onClick={salvar} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">
            Salvar Medição
          </button>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h3 className="mb-4 text-xl font-bold">Medições Cadastradas</h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Período</th>
                  <th className="p-3">Diária</th>
                  <th className="p-3">Caminhão</th>
                  <th className="p-3">Retro</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {medicoes.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{m.periodo}</td>
                    <td className="p-3">{moeda(Number(m.diaria))}</td>
                    <td className="p-3">{moeda(Number(m.caminhao))}</td>
                    <td className="p-3">{moeda(Number(m.retro))}</td>
                    <td className="p-3">{m.status}</td>
                    <td className="p-3 font-bold">{moeda(Number(m.total))}</td>
                    <td className="flex flex-wrap gap-2 p-3">
                      <button onClick={() => gerarPDF(m)} className="rounded-lg bg-gray-800 px-3 py-1 text-white">PDF</button>
                      <button onClick={() => whatsapp(m)} className="rounded-lg bg-green-600 px-3 py-1 text-white">WhatsApp</button>
                      <button onClick={() => excluir(m.id)} className="rounded-lg bg-red-600 px-3 py-1 text-white">Excluir</button>
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