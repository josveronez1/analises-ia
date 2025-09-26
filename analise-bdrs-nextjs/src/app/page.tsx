'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Card from '@/components/ui/Card';
import FilterBar, { FilterSelect } from '@/components/ui/FilterBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import RadarChart from '@/components/charts/RadarChart';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface DashboardData {
  period: string;
  bdrId: number | null;
  totalAnalises: number;
  averages: {
    warmerScore: number;
    reframeScore: number;
    rationalDrowningScore: number;
    emotionalImpactScore: number;
    newWayScore: number;
    yourSolutionScore: number;
  };
  analysisText: string;
  bdrs: Array<{id: number; nome: string}>;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedBdr, setSelectedBdr] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedBdr]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedPeriod) params.append('period', selectedPeriod);
      if (selectedBdr) params.append('bdrId', selectedBdr.toString());
      
      const response = await fetch(`/api/dashboard?${params}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar dados');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
  };

  // Preparar dados para o gráfico de radar
  const radarData = data ? [
    {
      subject: 'Warmer',
      score: data.averages.warmerScore,
      fullMark: 10,
    },
    {
      subject: 'Reframe',
      score: data.averages.reframeScore,
      fullMark: 10,
    },
    {
      subject: 'Rational Drowning',
      score: data.averages.rationalDrowningScore,
      fullMark: 10,
    },
    {
      subject: 'Emotional Impact',
      score: data.averages.emotionalImpactScore,
      fullMark: 10,
    },
    {
      subject: 'New Way',
      score: data.averages.newWayScore,
      fullMark: 10,
    },
    {
      subject: 'Your Solution',
      score: data.averages.yourSolutionScore,
      fullMark: 10,
    },
  ] : [];

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'últimos 7 dias';
      case '30d': return 'últimos 30 dias';
      case '90d': return 'últimos 90 dias';
      default: return 'últimos 7 dias';
    }
  };

  const getBdrLabel = () => {
    if (!data?.bdrId) return 'Todos os BDRs';
    const bdr = data.bdrs.find(b => b.id === data.bdrId);
    return bdr ? bdr.nome : 'BDR selecionado';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner size="lg" text="Carregando dashboard..." className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto p-6">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Análise de Cold Calls - {getPeriodLabel(data.period)} - {getBdrLabel()}
            </p>
          </div>
          
          {/* Filtros */}
          <FilterBar>
            <FilterSelect
              value={selectedPeriod}
              onChange={(value) => setSelectedPeriod(value as '7d' | '30d' | '90d')}
              options={[
                { value: '7d', label: 'Últimos 7 dias' },
                { value: '30d', label: 'Últimos 30 dias' },
                { value: '90d', label: 'Últimos 90 dias' },
              ]}
              placeholder="Período"
            />
            
            <FilterSelect
              value={selectedBdr?.toString() || ''}
              onChange={(value) => setSelectedBdr(value ? parseInt(value) : null)}
              options={data.bdrs.map(bdr => ({ value: bdr.id.toString(), label: bdr.nome }))}
              placeholder="Todos os BDRs"
            />
          </FilterBar>
        </div>

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Análises</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalAnalises}</p>
            </div>
          </Card>

          <Card className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">BDRs Analisados</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.bdrId ? '1' : data.bdrs.length}
              </p>
            </div>
          </Card>

          <Card className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Período</p>
              <p className="text-2xl font-bold text-gray-900">
                {getPeriodLabel(data.period)}
              </p>
            </div>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico Radar */}
          <Card 
            title="Scores - Conversa Híbrida"
            subtitle={`Média dos últimos ${getPeriodLabel(data.period)}`}
          >
            {data.totalAnalises > 0 ? (
              <RadarChart data={radarData} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma análise encontrada</p>
                  <p className="text-sm">Realize análises de Cold Calls para ver os dados</p>
                </div>
              </div>
            )}
          </Card>

          {/* Análise Textual */}
          <Card 
            title="Análise Detalhada"
            subtitle="Insights e recomendações baseadas nos dados"
          >
            {data.totalAnalises > 0 ? (
              <div className="h-80 overflow-y-auto">
                <MarkdownRenderer content={data.analysisText} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma análise disponível</p>
                  <p className="text-sm">Realize análises de Cold Calls para ver insights</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}