'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface BDR {
  id: number;
  nome: string;
}

interface AnalysisResult {
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
  analiseCompleta: string;
  createdAt: string;
}

export default function ColdCallsPage() {
  const [bdrs, setBdrs] = useState<BDR[]>([]);
  const [selectedBdr, setSelectedBdr] = useState<number | null>(null);
  const [prospectNome, setProspectNome] = useState('');
  const [prospectEmpresa, setProspectEmpresa] = useState('');
  const [insightComercial, setInsightComercial] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingBdrs, setIsLoadingBdrs] = useState(true);

  // Carregar BDRs
  useEffect(() => {
    loadBdrs();
  }, []);

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
    if (!prospectNome.trim()) {
      setError('Nome do prospect é obrigatório');
      return false;
    }
    if (prospectNome.trim().length < 2) {
      setError('Nome do prospect deve ter pelo menos 2 caracteres');
      return false;
    }
    if (!prospectEmpresa.trim()) {
      setError('Empresa do prospect é obrigatória');
      return false;
    }
    if (prospectEmpresa.trim().length < 2) {
      setError('Empresa deve ter pelo menos 2 caracteres');
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
      formData.append('prospectNome', prospectNome.trim());
      formData.append('prospectEmpresa', prospectEmpresa.trim());
      formData.append('insightComercial', insightComercial.trim());
      formData.append('audioFile', audioFile!);

      const response = await fetch('/api/cold-calls', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        setSuccess('Análise concluída com sucesso!');
        
        // Limpar formulário
        setProspectNome('');
        setProspectEmpresa('');
        setInsightComercial('');
        setAudioFile(null);
        setSelectedBdr(null);
        
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(null), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao analisar cold call');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Análise de Cold Calls
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados do Cold Call</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
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
                  onChange={(e) => setSelectedBdr(parseInt(e.target.value))}
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

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Nome do Prospect *
              </label>
              <input
                type="text"
                value={prospectNome}
                onChange={(e) => setProspectNome(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Nome do prospect (mín. 2 caracteres)"
                maxLength={100}
              />
              <p className="text-xs text-gray-700 mt-1">
                {prospectNome.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Empresa do Prospect *
              </label>
              <input
                type="text"
                value={prospectEmpresa}
                onChange={(e) => setProspectEmpresa(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Empresa do prospect (mín. 2 caracteres)"
                maxLength={100}
              />
              <p className="text-xs text-gray-700 mt-1">
                {prospectEmpresa.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Insight Comercial (Opcional)
              </label>
              <input
                type="text"
                value={insightComercial}
                onChange={(e) => setInsightComercial(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Insight comercial sobre o prospect"
                maxLength={200}
              />
              <p className="text-xs text-gray-700 mt-1">
                {insightComercial.length}/200 caracteres
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Arquivo de Áudio *
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
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
            disabled={isAnalyzing || isLoadingBdrs}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center justify-center"
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
              'Analisar Cold Call'
            )}
          </button>
        </div>

        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Resultado da Análise</h2>
              <span className="text-sm text-gray-700">
                {new Date(analysisResult.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResult.warmerScore}/10
                </div>
                <div className="text-sm text-gray-900">Warmer</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResult.reframeScore}/10
                </div>
                <div className="text-sm text-gray-900">Reframe</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analysisResult.rationalDrowningScore}/10
                </div>
                <div className="text-sm text-gray-900">Rational Drowning</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analysisResult.emotionalImpactScore}/10
                </div>
                <div className="text-sm text-gray-900">Emotional Impact</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analysisResult.newWayScore}/10
                </div>
                <div className="text-sm text-gray-900">New Way</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysisResult.yourSolutionScore}/10
                </div>
                <div className="text-sm text-gray-900">Your Solution</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pontos de Atenção</h3>
                <p className="text-gray-700 whitespace-pre-line bg-yellow-50 p-3 rounded-md">
                  {analysisResult.pontosAtencao}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Recomendações</h3>
                <p className="text-gray-700 whitespace-pre-line bg-green-50 p-3 rounded-md">
                  {analysisResult.recomendacoes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}