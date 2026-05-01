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

  const totalCalculado =
    Number(diaria || 0) + Number(caminhao || 0) + Number(retro || 0)

  function moeda(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function formatarData(data: string) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const periodo =
    dataInicio && dataFim
      ? `${formatarData(dataInicio)} até ${formatarData(dataFim)}`
      : ''

  useEffect(() => {
    const logado = localStorage.getItem('logado')

    if (!logado) {
      router.push('/login')
      return
    }

    carregarMedicoes()
  }, [])

  async function carregarMedicoes() {
    const { data, error } = await supabase
      .from('medicoes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao carregar medições')
      console.error(error)
      return
    }

    setMedicoes(data || [])
  }

  async function salvarMedicao() {
    if (!dataInicio || !dataFim) {
      alert('Informe a data inicial e final')
      return
    }

    const { error } = await supabase.from('medicoes').insert([
      {
        periodo,
        diaria: Number(diaria || 0),
        caminhao: Number(caminhao || 0),
        retro: Number(retro || 0),
        total: totalCalculado,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status,
      },
    ])

    if (error) {
      alert('Erro ao salvar medição')
      console.error(error)
      return
    }

    setDataInicio('')
    setDataFim('')
    setDiaria('')
    setCaminhao('')
    setRetro('')
    setStatus('Aberta')

    carregarMedicoes()
  }

  async function excluirMedicao(id: number) {
    if (!confirm('Excluir esta medição?')) return

    const { error } = await supabase.from('medicoes').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir')
      console.error(error)
      return
    }

    carregarMedicoes()
  }

  function gerarPDF(m: Medicao) {
    const janela = window.open('', '_blank')
    if (!janela) return

    janela.document.write(`
      <html>
        <head>
          <title>Medição</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
            }

            .logo {
              width: 100%;
              max-height: 130px;
              object-fit: contain;
              margin-bottom: 20px;
            }

            .titulo {
              background: #000;
              color: #fff;
              text-align: center;
              font-weight: bold;
              padding: 8px;
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #000;
              padding: 10px;
              text-align: center;
            }

            th {
              background: #ddd;
            }

            .total {
              text-align: right;
              margin-top: 25px;
              font-size: 22px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <img src="/logo.png" class="logo" />

          <div class="titulo">DESPESAS COM DIÁRIAS</div>

          <h3>Período: ${m.periodo}</h3>

          <table>
            <thead>
              <tr>
                <th>Diária</th>
                <th>Caminhão</th>
                <th>Retro</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>${moeda(Number(m.diaria || 0))}</td>
                <td>${moeda(Number(m.caminhao || 0))}</td>
                <td>${moeda(Number(m.retro || 0))}</td>
                <td>${moeda(Number(m.total || 0))}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            TOTAL FINAL: ${moeda(Number(m.total || 0))}
          </div>

          <script>
            window.onload = () => window.print()
          </script>
        </body>
      </html>
    `)

    janela.document.close()
  }

  function enviarWhatsApp(m: Medicao) {
    const texto = `Olá, segue medição:

Período: ${m.periodo}
Diária: ${moeda(Number(m.diaria || 0))}
Caminhão: ${moeda(Number(m.caminhao || 0))}
Retro: ${moeda(Number(m.retro || 0))}
Total: ${moeda(Number(m.total || 0))}
Status: ${m.status}`

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  function sair() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  const totalGeral = medicoes.reduce(
    (acc, m) => acc + Number(m.total || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:bg-slate-950 md:text-white">
        <div className="flex flex-col items-center border-b border-slate-800 p-6">
          <img
            src="/logopainel.png"
            alt="Logo Oliveira Construção"
            className="mb-4 h-28 w-28 object-contain"
          />

          <h1 className="text-center text-xl font-bold">
            Oliveira Construção
          </h1>

          <p className="mt-1 text-center text-sm text-slate-400">
            Sistema de Medições
          </p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-left font-medium">
            <span>📊</span>
            Painel
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
            <span>📄</span>
            Medições
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
            <span>📁</span>
            Relatórios
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
            <span>⚙️</span>
            Configurações
          </button>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-4 rounded-xl bg-slate-900 p-3">
            <p className="text-xs text-slate-400">Usuário logado</p>
            <p className="font-bold">Administrador</p>
          </div>

          <button
            onClick={sair}
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="w-full p-3 md:ml-72 md:p-8">
        <div className="mb-5 rounded-2xl bg-white p-4 shadow md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logopainel.png"
                alt="Logo Oliveira Construção"
                className="h-14 w-14 object-contain"
              />

              <div>
                <h1 className="text-lg font-bold">Oliveira Construção</h1>
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
        </div>

        <header className="mb-6 hidden items-center justify-between rounded-2xl bg-white p-5 shadow md:flex">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Painel de Controle
            </h2>
            <p className="text-gray-500">
              Controle de medições, PDFs e envio por WhatsApp.
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 px-4 py-3 text-right">
            <p className="text-xs text-gray-500">Usuário logado</p>
            <p className="font-bold text-slate-900">Administrador</p>
          </div>
        </header>

        <section className="mb-5 rounded-2xl bg-white p-4 shadow md:p-5">
          <h2 className="mb-4 font-bold">Nova Medição</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <input
              type="number"
              placeholder="Diária"
              value={diaria}
              onChange={(e) => setDiaria(e.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <input
              type="number"
              placeholder="Caminhão"
              value={caminhao}
              onChange={(e) => setCaminhao(e.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <input
              type="number"
              placeholder="Retro"
              value={retro}
              onChange={(e) => setRetro(e.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border p-3"
            >
              <option>Aberta</option>
              <option>Fechada</option>
              <option>Enviada</option>
              <option>Paga</option>
            </select>

            <div className="flex items-center rounded-xl border bg-green-50 p-3 font-bold text-green-700">
              Total: {moeda(totalCalculado)}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <button
              onClick={salvarMedicao}
              className="rounded-xl bg-blue-600 p-3 font-bold text-white hover:bg-blue-700"
            >
              Salvar Medição
            </button>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card titulo="Total Geral" valor={moeda(totalGeral)} cor="green" />
          <Card titulo="Medições" valor={String(medicoes.length)} cor="blue" />
          <Card
            titulo="Última Medição"
            valor={medicoes[0] ? moeda(Number(medicoes[0].total)) : 'R$ 0,00'}
            cor="orange"
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-5">
          <h2 className="mb-4 text-lg font-bold">Medições Cadastradas</h2>

          <div className="flex flex-col gap-4 md:hidden">
            {medicoes.map((m) => (
              <div key={m.id} className="rounded-2xl border p-4 shadow-sm">
                <div className="mb-2 flex justify-between gap-3">
                  <strong>{m.periodo}</strong>
                  <span className="font-bold">{moeda(Number(m.total || 0))}</span>
                </div>

                <p>Diária: {moeda(Number(m.diaria || 0))}</p>
                <p>Caminhão: {moeda(Number(m.caminhao || 0))}</p>
                <p>Retro: {moeda(Number(m.retro || 0))}</p>
                <p>Status: {m.status}</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => gerarPDF(m)}
                    className="rounded-lg bg-gray-800 px-3 py-2 text-white"
                  >
                    PDF
                  </button>

                  <button
                    onClick={() => excluirMedicao(m.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-white"
                  >
                    Excluir
                  </button>

                  <button
                    onClick={() => enviarWhatsApp(m)}
                    className="col-span-2 rounded-lg bg-green-600 px-3 py-2 text-white"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left">
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
                    <td className="p-3">{moeda(Number(m.diaria || 0))}</td>
                    <td className="p-3">{moeda(Number(m.caminhao || 0))}</td>
                    <td className="p-3">{moeda(Number(m.retro || 0))}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{moeda(Number(m.total || 0))}</td>
                    <td className="flex flex-wrap gap-2 p-3">
                      <button
                        onClick={() => gerarPDF(m)}
                        className="rounded-lg bg-gray-800 px-3 py-1 text-white"
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => excluirMedicao(m.id)}
                        className="rounded-lg bg-red-600 px-3 py-1 text-white"
                      >
                        Excluir
                      </button>

                      <button
                        onClick={() => enviarWhatsApp(m)}
                        className="rounded-lg bg-green-600 px-3 py-1 text-white"
                      >
                        WhatsApp
                      </button>
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
    green: 'text-green-700 bg-green-50',
    blue: 'text-blue-700 bg-blue-50',
    orange: 'text-orange-700 bg-orange-50',
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