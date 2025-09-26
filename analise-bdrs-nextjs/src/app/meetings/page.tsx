'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface BDR {
  id: number;
  nome: string;
}

interface PreviousAnalysis {
  id: number;
  dataReuniao: string;
  resumo: string;
  metas: string;
  warmerScore: number;
  reframeScore: number;
  rationalDrowningScore: number;
  emotionalImpactScore: number;
  newWayScore: number;
  yourSolutionScore: number;
  pontosAtencao: string;
  recomendacoes: string;
  analiseCompleta: string;
  bdr: {
    id: number;
    nome: string;
  };
}

interface AnalysisResult {
  id: number;
  dataReuniao: string;
  resumo: string;
  metas: string;
  warmerScore: number;
  reframeScore: number;
  rationalDrowningScore: number;
  emotionalImpactScore: number;
  newWayScore: number;
  yourSolutionScore: number;
  pontosAtencao: string;
  recomendacoes: string;
  analiseCompleta: string;
  createdAt: string;
}

export default function MeetingsPage() {
  const [bdrs, setBdrs] = useState<BDR[]>([]);
  const [selectedBdr, setSelectedBdr] = useState<number | null>(null);
  const [selectedBdrName, setSelectedBdrName] = useState<string>('');
  const [dataReuniao, setDataReuniao] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<PreviousAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingBdrs, setIsLoadingBdrs] = useState(true);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);

  // Carregar BDRs
  useEffect(() => {
    loadBdrs();
  }, []);

  // Carregar análise anterior quando BDR for selecionado
  useEffect(() => {
    if (selectedBdr) {
      loadPreviousAnalysis(selectedBdr);
    } else {
      setPreviousAnalysis(null);
    }
  }, [selectedBdr]);

  const loadBdrs = async () => {
    try {
      setIsLoadingBdrs(true);
      const response = await fetch('/api/bdrs');
      if (!response.ok) {
        throw new Error('Erro ao carregar BDRs');
      }
      const data = await response.json();
      setBdrs(data);
    } catch (error) {
      console.error('Erro ao carregar BDRs:', error);
      setError('Erro ao carregar lista de BDRs');
    } finally {
      setIsLoadingBdrs(false);
    }
  };

  const loadPreviousAnalysis = async (bdrId: number) => {
    try {
      setIsLoadingPrevious(true);
      const response = await fetch(`/api/meetings/previous?bdrId=${bdrId}`);
      
      if (response.status === 404) {
        setPreviousAnalysis(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erro ao carregar análise anterior');
      }
      
      const data = await response.json();
      setPreviousAnalysis(data);
    } catch (error) {
      console.error('Erro ao carregar análise anterior:', error);
      setPreviousAnalysis(null);
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  const handleBdrChange = (bdrId: number) => {
    setSelectedBdr(bdrId);
    const bdr = bdrs.find(b => b.id === bdrId);
    setSelectedBdrName(bdr?.nome || '');
    setAnalysisResult(null);
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('audio/')) {
        setError('Por favor, selecione um arquivo de áudio válido');
        return;
      }
      
      // Validar tamanho (máximo 25MB)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        setError('Arquivo muito grande. Máximo permitido: 25MB');
        return;
      }
      
      setAudioFile(file);
      setError(null);
    }
  };

  const validateForm = () => {
    if (!selectedBdr) {
      setError('Selecione um BDR');
      return false;
    }
    if (!dataReuniao) {
      setError('Data da reunião é obrigatória');
      return false;
    }
    if (!audioFile) {
      setError('Arquivo de áudio é obrigatório');
      return false;
    }
    return true;
  };

  const handleAnalyze = async () => {
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('bdrId', selectedBdr!.toString());
      formData.append('dataReuniao', dataReuniao);
      if (audioFile) {
        formData.append('audioFile', audioFile);
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        setSuccess('Análise concluída com sucesso!');
        
        // Recarregar análise anterior para atualizar
        if (selectedBdr) {
          loadPreviousAnalysis(selectedBdr);
        }
        
        // Limpar formulário
        setDataReuniao('');
        setAudioFile(null);
        
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(null), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao analisar reunião');
      }
    } catch (error) {
      console.error('Erro ao analisar:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Análise de Reuniões 1:1
        </h1>

        {/* Mensagens de Sucesso/Erro */}
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

        {/* Seleção de BDR */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecionar BDR</h2>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              BDR *
            </label>
            {isLoadingBdrs ? (
              <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
                Carregando BDRs...
              </div>
            ) : (
              <select
                value={selectedBdr || ''}
                onChange={(e) => handleBdrChange(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              >
                <option value="">Selecione um BDR</option>
                {bdrs.map((bdr) => (
                  <option key={bdr.id} value={bdr.id}>
                    {bdr.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Layout Dividido */}
        {selectedBdr && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lado Esquerdo - Análise Anterior */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Análise Anterior - {selectedBdrName}
              </h2>
              
              {isLoadingPrevious ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando análise anterior...</span>
                </div>
              ) : previousAnalysis ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Data da Reunião:</strong> {formatDate(previousAnalysis.dataReuniao)}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Resumo da Reunião</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <MarkdownRenderer content={previousAnalysis.resumo} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Metas Definidas</h3>
                    <div className="bg-green-50 p-3 rounded-md">
                      <MarkdownRenderer content={previousAnalysis.metas} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {previousAnalysis.warmerScore}/10
                      </div>
                      <div className="text-xs text-gray-900">Warmer</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {previousAnalysis.reframeScore}/10
                      </div>
                      <div className="text-xs text-gray-900">Reframe</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">
                        {previousAnalysis.rationalDrowningScore}/10
                      </div>
                      <div className="text-xs text-gray-900">Rational Drowning</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {previousAnalysis.emotionalImpactScore}/10
                      </div>
                      <div className="text-xs text-gray-900">Emotional Impact</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">
                        {previousAnalysis.newWayScore}/10
                      </div>
                      <div className="text-xs text-gray-900">New Way</div>
                    </div>
                    <div className="text-center p-2 bg-indigo-50 rounded">
                      <div className="text-lg font-bold text-indigo-600">
                        {previousAnalysis.yourSolutionScore}/10
                      </div>
                      <div className="text-xs text-gray-900">Your Solution</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pontos de Atenção</h3>
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <MarkdownRenderer content={previousAnalysis.pontosAtencao} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recomendações</h3>
                    <div className="bg-green-50 p-3 rounded-md">
                      <MarkdownRenderer content={previousAnalysis.recomendacoes} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium mb-2">Nenhuma análise anterior encontrada</p>
                  <p className="text-sm">Esta será a primeira análise para este BDR</p>
                </div>
              )}
            </div>

            {/* Lado Direito - Nova Análise */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Nova Análise - {selectedBdrName}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Data da Reunião *
                  </label>
                  <input
                    type="date"
                    value={dataReuniao}
                    onChange={(e) => setDataReuniao(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Arquivo de Áudio *
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {audioFile && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Arquivo selecionado:</strong> {audioFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        Tamanho: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-700 mt-1">
                    Formatos aceitos: MP3, WAV, M4A, etc. Máximo: 25MB
                  </p>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analisando...
                    </>
                  ) : (
                    'Analisar Reunião 1:1'
                  )}
                </button>
              </div>

              {/* Resultado da Nova Análise */}
              {analysisResult && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Análise Concluída!</h3>
                  <p className="text-sm text-green-700">
                    Nova análise salva com sucesso. A análise anterior foi atualizada.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instruções quando nenhum BDR está selecionado */}
        {!selectedBdr && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Selecione um BDR para começar
            </h2>
            <p className="text-gray-600">
              Escolha um BDR acima para ver a análise anterior e realizar uma nova análise de reunião 1:1
            </p>
          </div>
        )}
      </div>
    </div>
  );
}