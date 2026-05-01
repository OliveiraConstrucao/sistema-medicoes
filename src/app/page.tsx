import { supabase } from './supabaseClient'

export default function Home() {

  async function salvarMedicao() {
    const { data, error } = await supabase
      .from('medicoes')
      .insert([
        {
          periodo: 'Abril 2026',
          total: 100,
          data_inicio: '2026-04-01',
          data_fim: '2026-04-30',
          status: 'Fechado'
        }
      ])

    if (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar')
    } else {
      alert('Salvo com sucesso!')
      console.log(data)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Oliveira Construção</h2>

        <nav className="flex flex-col gap-3">
          <button className="text-left bg-gray-800 p-3 rounded-xl">
            📊 Dashboard
          </button>
          <button className="text-left p-3 rounded-xl hover:bg-gray-800">
            📄 Medições
          </button>
          <button className="text-left p-3 rounded-xl hover:bg-gray-800">
            ⚙️ Configurações
          </button>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-4 md:p-8">

        <h1 className="text-2xl md:text-4xl font-bold mb-4">
          Painel de Controle
        </h1>

        {/* Botões */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <button className="bg-green-600 text-white p-3 rounded-xl">
            Gerar Dias
          </button>

          {/* 👇 BOTÃO CONECTADO */}
          <button 
            onClick={salvarMedicao}
            className="bg-blue-600 text-white p-3 rounded-xl"
          >
            Nova Medição
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card titulo="Total Geral" valor="R$ 0,00" />
          <Card titulo="Medições" valor="0" />
          <Card titulo="Última Medição" valor="R$ 0,00" />
        </div>

        {/* Tabela */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-bold mb-4">Medições recentes</h2>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>Nº</th>
                <th>Período</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>001</td>
                <td>Abril 2026</td>
                <td>R$ 0,00</td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

function Card({ titulo, valor }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h2 className="text-2xl font-bold">{valor}</h2>
    </div>
  );
}