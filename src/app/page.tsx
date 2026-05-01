'use client'

import { useEffect, useState } from 'react'
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
  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [diaria, setDiaria] = useState('')
  const [caminhao, setCaminhao] = useState('')
  const [retro, setRetro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
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

  async function salvarMedicao() {
    if (!dataInicio || !dataFim) {
      alert('Informe a data inicial e final')
      return
    }

    setSalvando(true)

    if (editandoId) {
      const { error } = await supabase
        .from('medicoes')
        .update({
          periodo: periodoCalculado,
          diaria: Number(diaria || 0),
          caminhao: Number(caminhao || 0),
          retro: Number(retro || 0),
          total: totalCalculado,
          data_inicio: dataInicio,
          data_fim: dataFim,
          status,
        })
        .eq('id', editandoId)

      setSalvando(false)

      if (error) {
        console.error(error)
        alert('Erro ao atualizar')
        return
      }

      alert('Medição atualizada!')
    } else {
      const { error } = await supabase.from('medicoes').insert([
        {
          periodo: periodoCalculado,
          diaria: Number(diaria || 0),
          caminhao: Number(caminhao || 0),
          retro: Number(retro || 0),
          total: totalCalculado,
          data_inicio: dataInicio,
          data_fim: dataFim,
          status,
        },
      ])

      setSalvando(false)

      if (error) {
        console.error(error)
        alert('Erro ao salvar')
        return
      }

      alert('Medição salva!')
    }

    limparFormulario()
    carregarMedicoes()
  }

  function editarMedicao(m: Medicao) {
    setEditandoId(m.id)
    setDiaria(String(m.diaria || ''))
    setCaminhao(String(m.caminhao || ''))
    setRetro(String(m.retro || ''))
    setDataInicio(m.data_inicio || '')
    setDataFim(m.data_fim || '')
    setStatus(m.status || 'Aberta')
  }

  async function excluirMedicao(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir esta medição?')

    if (!confirmar) return

    const { error } = await supabase.from('medicoes').delete().eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao excluir')
      return
    }

    alert('Medição excluída!')
    carregarMedicoes()
  }

  function limparFormulario() {
    setEditandoId(null)
    setDiaria('')
    setCaminhao('')
    setRetro('')
    setDataInicio('')
    setDataFim('')
    setStatus('Aberta')
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
      const dataAtual = new Date(inicio + 'T00:00:00')
      const dataFinal = new Date(fim + 'T00:00:00')

      while (dataAtual <= dataFinal) {
        if (dataAtual.getDay() !== 0) {
          dias.push(new Date(dataAtual))
        }

        dataAtual.setDate(dataAtual.getDate() + 1)
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
        const isSabado = dia.getDay() === 6

        const valorDiaria = Number(m.diaria || 0)
        const valorCaminhao = Number(m.caminhao || 0)
        const valorRetro = isSabado ? 0 : Number(m.retro || 0)
        const totalDia = valorDiaria + valorCaminhao + valorRetro

        subtotalDiaria += valorDiaria
        subtotalCaminhao += valorCaminhao
        subtotalRetro += valorRetro
        subtotalGeral += totalDia

        return `
          <tr class="${isSabado ? 'sabado' : ''}">
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
          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #111;
          }

          .container {
            border: 2px solid #111;
            width: 100%;
            margin: 0 auto;
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

          .faixa-preta {
            background: #111;
            color: #fff;
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
            font-weight: bold;
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

          .subtotal td {
            background: #ddd;
            font-weight: bold;
          }

          .extras-title {
            background: #111;
            color: white;
            text-align: center;
            font-weight: bold;
          }

          .cinza td {
            background: #ddd;
            font-weight: bold;
          }

          .total-final td {
            background: #ddd;
            font-size: 16px;
            font-weight: bold;
          }

          .acoes-visualizacao {
            text-align: center;
            margin-bottom: 15px;
          }

          .acoes-visualizacao button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          @media print {
            .acoes-visualizacao {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="acoes-visualizacao">
          <button onclick="window.print()">Imprimir / Salvar PDF</button>
        </div>

        <div class="container">
          <div class="logo">
            <img src="/logo.png" />
          </div>

          <div class="faixa-preta">
            DESPESAS COM DIÁRIAS
          </div>

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

    const link = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(link, '_blank')
  }

  useEffect(() => {
    carregarMedicoes()
  }, [])

  const totalGeral = medicoes.reduce(
    (acc, m) => acc + Number(m.total || 0),
    0
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Oliveira Construção</h2>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-4">
          Painel de Controle
        </h1>

        <div className="bg-white p-5 rounded-2xl shadow mb-6">
          <h2 className="font-bold mb-4">
            {editandoId ? 'Editar Medição' : 'Nova Medição'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border p-3 rounded-xl"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Diária"
              value={diaria}
              onChange={(e) => setDiaria(e.target.value)}
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Caminhão"
              value={caminhao}
              onChange={(e) => setCaminhao(e.target.value)}
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              placeholder="Retro"
              value={retro}
              onChange={(e) => setRetro(e.target.value)}
              className="border p-3 rounded-xl"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-3 rounded-xl"
            >
              <option>Aberta</option>
              <option>Fechada</option>
              <option>Enviada</option>
              <option>Paga</option>
            </select>

            <div className="flex items-center font-bold">
              Total: {moeda(totalCalculado)}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={salvarMedicao}
              disabled={salvando}
              className="bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50"
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
                className="bg-gray-500 text-white p-3 rounded-xl"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card titulo="Total Geral" valor={moeda(totalGeral)} />
          <Card titulo="Medições" valor={String(medicoes.length)} />
          <Card
            titulo="Última Medição"
            valor={medicoes[0] ? moeda(Number(medicoes[0].total)) : 'R$ 0,00'}
          />
        </div>

        <div className="bg-white p-5 rounded-2xl shadow overflow-x-auto">
          <h2 className="font-bold mb-4">Medições</h2>

          <table className="w-full text-left min-w-[1100px]">
            <thead>
              <tr className="border-b">
                <th>Período</th>
                <th>Diária</th>
                <th>Caminhão</th>
                <th>Retro</th>
                <th>Status</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {medicoes.map((m) => (
                <tr key={m.id} className="border-b">
                  <td>{m.periodo}</td>
                  <td>{moeda(Number(m.diaria || 0))}</td>
                  <td>{moeda(Number(m.caminhao || 0))}</td>
                  <td>{moeda(Number(m.retro || 0))}</td>
                  <td>{m.status}</td>
                  <td>{moeda(Number(m.total || 0))}</td>
                  <td className="flex gap-2 py-2 flex-wrap">
                    <button
                      onClick={() => editarMedicao(m)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirMedicao(m.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Excluir
                    </button>

                    <button
                      onClick={() => visualizarPDF(m)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                    >
                      Visualizar
                    </button>

                    <button
                      onClick={() => gerarPDF(m)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-lg"
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => enviarWhatsApp(m)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg"
                    >
                      WhatsApp
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

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h2 className="text-2xl font-bold">{valor}</h2>
    </div>
  )
}