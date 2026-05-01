export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* Título */}
      <h1 className="text-2xl md:text-4xl font-bold mb-4">
        Sistema de Medições
      </h1>

      {/* Botões */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <button className="bg-green-600 text-white p-3 rounded-xl w-full md:w-auto">
          Gerar Dias
        </button>

        <button className="bg-blue-600 text-white p-3 rounded-xl w-full md:w-auto">
          Nova Medição
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Total Geral</p>
          <h2 className="text-2xl font-bold">R$ 0,00</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Medições</p>
          <h2 className="text-2xl font-bold">0</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Última Medição</p>
          <h2 className="text-2xl font-bold">R$ 0,00</h2>
        </div>

      </div>

    </div>
  );
}