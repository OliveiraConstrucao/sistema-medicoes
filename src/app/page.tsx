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
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [diaria, setDiaria] = useState('')
  const [caminhao, setCaminhao] = useState('')
  const [retro, setRetro] = useState('')
  const [status, setStatus] = useState('Aberta')
  const [salvando, setSalvando] = useState(false)

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

  const periodoCalculado =
    dataInicio && dataFim
      ? `${formatarData(dataInicio)} até ${formatarData(dataFim)}`
      : ''

  async function carregarMedicoes() {
    const { data, error } = await supabase
      .from('medicoes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao carregar medições')
      return
    }

    setMedicoes(data || [])
  }

  useEffect(() => {
    const logado = localStorage.getItem('logado')

    if (!logado) {
      router.push('/login')
      return
    }

    carregarMedicoes()
  }, [])

  async function salvarMedicao() {
    if (!dataInicio || !dataFim) {
      alert('Informe a data inicial e final')
      return
    }

    setSalvando(true)

    const payload = {
      periodo: periodoCalculado,
      diaria: Number(diaria || 0),
      caminhao: Number(caminhao || 0),
      retro: Number(retro || 0),
      total: totalCalculado,
      data_inicio: dataInicio,
      data_fim: dataFim,
      status,
    }

    const { error } = editandoId
      ? await supabase.from('medicoes').update(payload).eq('id', editandoId)
      : await supabase.from('medicoes').insert([payload])

    setSalvando(false)

    if (error) {
      console.error(error)
      alert('Erro ao salvar')
      return
    }

    alert(editandoId ? 'Medição atualizada!' : 'Medição salva!')
    limparFormulario()
    carregarMedicoes()
  }

  function editarMedicao(m: Medicao) {
    setEditandoId(m.id)
    setDataInicio(m.data_inicio || '')
    setDataFim(m.data_fim || '')
    setDiaria(String(m.diaria || ''))
    setCaminhao(String(m.caminhao || ''))
    setRetro(String(m.retro || ''))
    setStatus(m.status || 'Aberta')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluirMedicao(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta medição?')) return

    const { error } = await supabase.from('medicoes').delete().eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao excluir')
      return
    }

    carregarMedicoes()
  }

  function limparFormulario() {
    setEditandoId(null)
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

  function montarHtmlPDF(m: Medicao) {
    function formatarDataBR(data: string) {
      const [ano, mes, dia] = data.split('-')
      return `${dia}/${mes}/${ano}`
    }

    function obterDiaSemana(data: Date) {
      return data.toLocaleDateString('pt-BR', { weekday: 'long' })
    }

    function gerarDiasEntreDatas(inicio: string, fim: string) {
      const dias = []
      const atual = new Date(inicio + 'T00:00:00')
      const final = new Date(fim + 'T00:00:00')

      while (atual <= final) {
        if (atual.getDay() !== 0) dias.push(new Date(atual))
        atual.setDate(atual.getDate() + 1)
      }

      return dias
    }

    const dias = gerarDiasEntreDatas(m.data_inicio, m.data_fim)

    let subtotalDiaria = 0
    let subtotalCaminhao = 0
    let subtotalRetro = 0
    let subtotalGeral = 0

    const linhas = dias
      .map((dia, index) => {
        const sabado = dia.getDay() === 6

        const valorDiaria = Number(m.diaria || 0)
        const valorCaminhao = Number(m.caminhao || 0)
        const valorRetro = sabado ? 0 : Number(m.retro || 0)
        const totalDia = valorDiaria + valorCaminhao + valorRetro

        subtotalDiaria += valorDiaria
        subtotalCaminhao += valorCaminhao
        subtotalRetro += valorRetro
        subtotalGeral += totalDia

        return `
          <tr class="${sabado ? 'sabado' : ''}">
            <td>${index + 1}</td>
            <td>${dia.toLocaleDateString('pt-BR')}</td>
            <td>${obterDiaSemana(dia)}</td>
            <td>${moeda(valorDiaria)}</td>
            <td>${moeda(valorCaminhao)}</td>
            <td>${moeda(valorRetro)}</td>
            <td>${moeda(totalDia)}</td>
          </tr>
        `
      })
      .join('')

    return `
      <html>
        <head>
          <title>Medição</title>
          <style>
            @page { size: A4 portrait; margin: 6mm; }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 0;
              color: #111;
            }

            .print-btn {
              text-align: center;
              margin-bottom: 12px;
            }

            .print-btn button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 10px 18px;
              border-radius: 8px;
              cursor: pointer;
            }

            .container {
              border: 2px solid #111;
              width: 100%;
            }

            .logo {
              text-align: center;
              padding: 5px;
            }

            .logo img {
              width: 100%;
              max-height: 140px;
              object-fit: contain;
            }

            .faixa {
              background: #111;
              color: white;
              text-align: center;
              font-weight: bold;
              padding: 6px;
              font-size: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th, td {
              border: 1px solid #111;
              padding: 4px;
              text-align: center;
            }

            th {
              background: #111;
              color: white;
            }

            .descricao th {
              background: #ddd;
              color: #111;
            }

            .periodo {
              text-align: center;
              font-weight: bold;
              padding: 5px;
              border-left: 1px solid #111;
              border-right: 1px solid #111;
            }

            .sabado td {
              color: #b00000;
              font-weight: bold;
            }

            .subtotal td,
            .total-final td,
            .cinza td {
              background: #ddd;
              font-weight: bold;
            }

            .extras-title {
              background: #111;
              color: white;
              font-weight: bold;
            }

            .total-final td {
              font-size: 16px;
            }

            @media print {
              .print-btn { display: none; }
            }
          </style>
        </head>

        <body>
          <div class="print-btn">
            <button onclick="window.print()">Imprimir / Salvar PDF</button>
          </div>

          <div class="container">
            <div class="logo">
              <img src="/logo.png" />
            </div>

            <div class="faixa">DESPESAS COM DIÁRIAS</div>

            <table class="descricao">
              <thead>
                <tr>
                  <th>DESCRIÇÃO</th>
                  <th>VALOR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DIÁRIA: LÉO MAIS 1 COLABORADOR</td>
                  <td>${moeda(Number(m.diaria || 0))}</td>
                </tr>
              </tbody>
            </table>

            <div class="periodo">
              DIAS TRABALHADOS: ${formatarDataBR(m.data_inicio)} a ${formatarDataBR(m.data_fim)}
            </div>

            <table>
              <thead>
                <tr>
                  <th>DIAS</th>
                  <th>DIA DO MÊS</th>
                  <th>DIA DA SEMANA</th>
                  <th>DIÁRIA/LÉO</th>
                  <th>CAMINHÃO</th>
                  <th>RETRO</th>
                  <th>TOTAL</th>
                </tr>
              </thead>

              <tbody>
                ${linhas}

                <tr class="subtotal">
                  <td colspan="3">SUBTOTAL DIÁRIAS</td>
                  <td>${moeda(subtotalDiaria)}</td>
                  <td>${moeda(subtotalCaminhao)}</td>
                  <td>${moeda(subtotalRetro)}</td>
                  <td>${moeda(subtotalGeral)}</td>
                </tr>

                <tr>
                  <td colspan="7" style="height: 22px;"></td>
                </tr>

                <tr>
                  <td colspan="7" class="extras-title">SERVIÇOS EXTRAS</td>
                </tr>

                <tr class="cinza">
                  <td>TIPO</td>
                  <td>DATA</td>
                  <td colspan="4">DESCRIÇÃO</td>
                  <td>VALOR</td>
                </tr>

                <tr>
                  <td>EXTRA</td>
                  <td>-</td>
                  <td colspan="4">-</td>
                  <td>${moeda(0)}</td>
                </tr>

                <tr class="total-final">
                  <td colspan="6">TOTAL FINAL</td>
                  <td>${moeda(subtotalGeral)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `
  }

  function visualizarPDF(m: Medicao) {
    const janela = window.open('', '_blank')
    if (janela) {
      janela.document.write(montarHtmlPDF(m))
      janela.document.close()
    }
  }

  function gerarPDF(m: Medicao) {
    const janela = window.open('', '_blank')
    if (janela) {
      janela.document.write(montarHtmlPDF(m))
      janela.document.close()

      janela.onload = () => {
        setTimeout(() => {
          janela.print()
        }, 800)
      }
    }
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

  const totalGeral = medicoes.reduce(
    (acc, m) => acc + Number(m.total || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:bg-slate-950 md:text-white">
        <div className="flex flex-col items-center border-b border-slate-800 p-6">
          <div className="mb-3 flex h-28 w-28 items-center justify-center rounded-full bg-white p-2 shadow">
            <img
              src="/logopainel.png"
              alt="Logo Oliveira Construção"
              className="h-full w-full rounded-full object-contain"
            />
          </div>

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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white p-1 shadow">
                <img
                  src="/logopainel.png"
                  alt="Logo Oliveira Construção"
                  className="h-full w-full rounded-full object-contain"
                />
              </div>

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
          <h2 className="mb-4 font-bold">
            {editandoId ? 'Editar Medição' : 'Nova Medição'}
          </h2>

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
              disabled={salvando}
              className="rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {salvando
                ? 'Salvando...'
                : editandoId
                ? 'Atualizar Medição'
                : 'Salvar Medição'}
            </button>

            {editandoId && (
              <button
                onClick={limparFormulario}
                className="rounded-xl bg-gray-500 p-3 font-bold text-white"
              >
                Cancelar
              </button>
            )}
          </div>
        </section>

        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card titulo="Total Geral" valor={moeda(totalGeral)} destaque="green" />
          <Card titulo="Medições" valor={String(medicoes.length)} destaque="blue" />
          <Card
            titulo="Última Medição"
            valor={medicoes[0] ? moeda(Number(medicoes[0].total)) : 'R$ 0,00'}
            destaque="orange"
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
                  <button onClick={() => editarMedicao(m)} className="rounded-lg bg-yellow-500 px-3 py-2 text-white">Editar</button>
                  <button onClick={() => excluirMedicao(m.id)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Excluir</button>
                  <button onClick={() => visualizarPDF(m)} className="rounded-lg bg-blue-600 px-3 py-2 text-white">Visualizar</button>
                  <button onClick={() => gerarPDF(m)} className="rounded-lg bg-gray-800 px-3 py-2 text-white">PDF</button>
                  <button onClick={() => enviarWhatsApp(m)} className="col-span-2 rounded-lg bg-green-600 px-3 py-2 text-white">WhatsApp</button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1100px] text-left">
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
                      <button onClick={() => editarMedicao(m)} className="rounded-lg bg-yellow-500 px-3 py-1 text-white">Editar</button>
                      <button onClick={() => excluirMedicao(m.id)} className="rounded-lg bg-red-600 px-3 py-1 text-white">Excluir</button>
                      <button onClick={() => visualizarPDF(m)} className="rounded-lg bg-blue-600 px-3 py-1 text-white">Visualizar</button>
                      <button onClick={() => gerarPDF(m)} className="rounded-lg bg-gray-800 px-3 py-1 text-white">PDF</button>
                      <button onClick={() => enviarWhatsApp(m)} className="rounded-lg bg-green-600 px-3 py-1 text-white">WhatsApp</button>
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
  destaque,
}: {
  titulo: string
  valor: string
  destaque: 'green' | 'blue' | 'orange'
}) {
  const cores = {
    green: 'text-green-700 bg-green-50',
    blue: 'text-blue-700 bg-blue-50',
    orange: 'text-orange-700 bg-orange-50',
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <h2 className={`mt-2 rounded-xl p-3 text-2xl font-bold ${cores[destaque]}`}>
        {valor}
      </h2>
    </div>
  )
}