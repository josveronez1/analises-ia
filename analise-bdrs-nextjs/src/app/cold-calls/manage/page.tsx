'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface BDR {
  id: number;
  nome: string;
}

interface ColdCall {
  id: number;
  prospectNome: string;
  prospectEmpresa: string;
  insightComercial: string | null;
  warmerScore: number;
  reframeScore: number;
  rationalDrowningScore: number;
  emotionalImpactScore: number;
  newWayScore: number;
  yourSolutionScore: number;
  pontosAtencao: string;
  recomendacoes: string;
  createdAt: string;
  bdr: BDR;
}

export default function ManageColdCallsPage() {
  const [coldCalls, setColdCalls] = useState<ColdCall[]>([]);
  const [bdrs, setBdrs] = useState<BDR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtros
  const [selectedBdr, setSelectedBdr] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coldCallsResponse, bdrsResponse] = await Promise.all([
        fetch('/api/cold-calls'),
        fetch('/api/bdrs')
      ]);

      if (!coldCallsResponse.ok || !bdrsResponse.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const [coldCallsData, bdrsData] = await Promise.all([
        coldCallsResponse.json(),
        bdrsResponse.json()
      ]);

      setColdCalls(coldCallsData);
      setBdrs(bdrsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta análise?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cold-calls/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setColdCalls(coldCalls.filter(cc => cc.id !== id));
        setSuccess('Análise deletada com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Erro ao deletar análise');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      setError('Erro ao deletar análise');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Filtrar e ordenar dados
  const filteredColdCalls = coldCalls
    .filter(cc => {
      const matchesBdr = !selectedBdr || cc.bdr.id === selectedBdr;
      const matchesSearch = !searchTerm || 
        cc.prospectNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.prospectEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.bdr.nome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesBdr && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const avgScoreA = (a.warmerScore + a.reframeScore + a.rationalDrowningScore + 
                          a.emotionalImpactScore + a.newWayScore + a.yourSolutionScore) / 6;
        const avgScoreB = (b.warmerScore + b.reframeScore + b.rationalDrowningScore + 
                          b.emotionalImpactScore + b.newWayScore + b.yourSolutionScore) / 6;
        return sortOrder === 'asc' ? avgScoreA - avgScoreB : avgScoreB - avgScoreA;
      }
    });

  const getAverageScore = (coldCall: ColdCall) => {
    return ((coldCall.warmerScore + coldCall.reframeScore + coldCall.rationalDrowningScore + 
             coldCall.emotionalImpactScore + coldCall.newWayScore + coldCall.yourSolutionScore) / 6).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Cold Calls
          </h1>
          <Link
            href="/cold-calls"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Nova Análise
          </Link>
        </div>

        {/* Mensagens */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex justify-between items-center">
            <span>{success}</span>
            <button onClick={clearMessages} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                BDR
              </label>
              <select
                value={selectedBdr || ''}
                onChange={(e) => setSelectedBdr(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              >
                <option value="">Todos os BDRs</option>
                {bdrs.map((bdr) => (
                  <option key={bdr.id} value={bdr.id}>
                    {bdr.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, empresa ou BDR..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              >
                <option value="date">Data</option>
                <option value="score">Score Médio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Ordem
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Cold Calls */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Análises ({filteredColdCalls.length})
            </h2>
          </div>

          {filteredColdCalls.length === 0 ? (
            <div className="p-8 text-center text-gray-700">
              <p>Nenhuma análise encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Prospect
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      BDR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Score Médio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredColdCalls.map((coldCall) => (
                    <tr key={coldCall.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coldCall.prospectNome}
                          </div>
                          <div className="text-sm text-gray-700">
                            {coldCall.prospectEmpresa}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coldCall.bdr.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(parseFloat(getAverageScore(coldCall)))}`}>
                          {getAverageScore(coldCall)}/10
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(coldCall.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(coldCall.id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Deletar
                        </button>
                        <button 
                          onClick={() => window.location.href = `/cold-calls/${coldCall.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}