'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabaseClient'

export default function Home() {
  const router = useRouter()

  const [medicoes, setMedicoes] = useState<any[]>([])
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [diaria, setDiaria] = useState('')
  const [caminhao, setCaminhao] = useState('')
  const [retro, setRetro] = useState('')
  const [status, setStatus] = useState('Aberta')

  // 🔒 proteção login
  useEffect(() => {
    const logado = localStorage.getItem('logado')
    if (!logado) {
      router.push('/login')
    } else {
      carregar()
    }
  }, [])

  async function carregar() {
    const { data } = await supabase.from('medicoes').select('*').order('id', { ascending: false })
    setMedicoes(data || [])
  }

  async function salvar() {
    if (!inicio || !fim) return alert('Preencha o período')

    const total =
      (parseFloat(diaria || '0') || 0) +
      (parseFloat(caminhao || '0') || 0) +
      (parseFloat(retro || '0') || 0)

    await supabase.from('medicoes').insert({
      periodo: `${inicio} até ${fim}`,
      diaria,
      caminhao,
      retro,
      status,
      total,
    })

    setInicio('')
    setFim('')
    setDiaria('')
    setCaminhao('')
    setRetro('')

    carregar()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir medição?')) return
    await supabase.from('medicoes').delete().eq('id', id)
    carregar()
  }

  function gerarPDF(m: any) {
    const w = window.open('', '_blank')

    if (!w) return

    w.document.write(`
      <html>
      <head>
        <title>PDF</title>
        <style>
          body { font-family: Arial; padding: 30px }
          img { width: 250px; margin-bottom: 20px }
          table { width: 100%; border-collapse: collapse; margin-top: 20px }
          td, th { border: 1px solid #000; padding: 10px; text-align: center }
        </style>
      </head>
      <body>

        <img src="/logo.png" />

        <h3>Período: ${m.periodo}</h3>

        <table>
          <tr>
            <th>Diária</th>
            <th>Caminhão</th>
            <th>Retro</th>
            <th>Total</th>
          </tr>
          <tr>
            <td>R$ ${m.diaria}</td>
            <td>R$ ${m.caminhao}</td>
            <td>R$ ${m.retro}</td>
            <td>R$ ${m.total}</td>
          </tr>
        </table>

        <h2>Total Final: R$ ${m.total}</h2>

        <script>
          window.onload = () => window.print()
        </script>

      </body>
      </html>
    `)
  }

  function logout() {
    localStorage.removeItem('logado')
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* MENU LATERAL */}
      <aside className="w-64 bg-black text-white p-5 flex flex-col">

        <img src="/logopainel.png" className="w-24 mx-auto mb-6" />

        <h1 className="text-center font-bold mb-10">Sistema</h1>

        <nav className="space-y-4">
          <div className="bg-gray-800 p-2 rounded">Dashboard</div>
          <div className="bg-gray-800 p-2 rounded">Medições</div>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-600 p-2 rounded"
        >
          Sair
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6">

        <h1 className="text-2xl font-bold mb-6">Painel</h1>

        {/* FORM */}
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-3">

          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="border p-2" />
          <input type="date" value={fim} onChange={e => setFim(e.target.value)} className="border p-2" />

          <input placeholder="Diária" value={diaria} onChange={e => setDiaria(e.target.value)} className="border p-2" />
          <input placeholder="Caminhão" value={caminhao} onChange={e => setCaminhao(e.target.value)} className="border p-2" />

          <input placeholder="Retro" value={retro} onChange={e => setRetro(e.target.value)} className="border p-2" />

          <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2">
            <option>Aberta</option>
            <option>Fechado</option>
          </select>

          <button onClick={salvar} className="col-span-2 bg-blue-600 text-white p-2 rounded">
            Salvar Medição
          </button>
        </div>

        {/* LISTA */}
        <div className="bg-white p-4 rounded shadow">

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Período</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {medicoes.map((m) => (
                <tr key={m.id} className="border-t">
                  <td>{m.periodo}</td>
                  <td>R$ {m.total}</td>
                  <td className="space-x-2">

                    <button
                      onClick={() => gerarPDF(m)}
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                    >
                      PDF
                    </button>

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