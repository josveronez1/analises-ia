'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface BDR {
  id: number;
  nome: string;
  createdAt: string;
}

export default function BDRsPage() {
  const [bdrs, setBdrs] = useState<BDR[]>([]);
  const [newBdrName, setNewBdrName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carregar BDRs
  useEffect(() => {
    loadBdrs();
  }, []);

  const loadBdrs = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const validateBdrName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nome do BDR é obrigatório');
      return false;
    }
    if (trimmed.length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (trimmed.length > 50) {
      setError('Nome deve ter no máximo 50 caracteres');
      return false;
    }
    if (bdrs.some(bdr => bdr.nome.toLowerCase() === trimmed.toLowerCase())) {
      setError('Já existe um BDR com este nome');
      return false;
    }
    return true;
  };

  const addBdr = async () => {
    setError(null);
    setSuccess(null);

    if (!validateBdrName(newBdrName)) {
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch('/api/bdrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: newBdrName.trim() }),
      });

      if (response.ok) {
        const newBdr = await response.json();
        setBdrs([...bdrs, newBdr]);
        setNewBdrName('');
        setSuccess('BDR adicionado com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao adicionar BDR');
      }
    } catch (error) {
      console.error('Erro ao adicionar BDR:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsAdding(false);
    }
  };

  const removeBdr = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este BDR? Esta ação não pode ser desfeita.')) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsDeleting(id);

    try {
      const response = await fetch(`/api/bdrs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBdrs(bdrs.filter(bdr => bdr.id !== id));
        setSuccess('BDR removido com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao remover BDR');
      }
    } catch (error) {
      console.error('Erro ao remover BDR:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(null);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAdding) {
      addBdr();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
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
      
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gerenciar BDRs
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

        {/* Formulário para adicionar BDR */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Novo BDR</h2>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Nome do BDR
              </label>
              <input
                type="text"
                value={newBdrName}
                onChange={(e) => setNewBdrName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Digite o nome do BDR (mín. 2 caracteres)"
                maxLength={50}
                disabled={isAdding}
              />
              <p className="text-xs text-gray-700 mt-1">
                {newBdrName.length}/50 caracteres
              </p>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addBdr}
                disabled={isAdding || !newBdrName.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center"
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adicionando...
                  </>
                ) : (
                  'Adicionar BDR'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de BDRs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              BDRs Cadastrados ({bdrs.length})
            </h2>
          </div>

          {bdrs.length === 0 ? (
            <div className="p-8 text-center text-gray-700">
              <div className="text-4xl mb-4">��</div>
              <p className="text-lg font-medium mb-2">Nenhum BDR cadastrado</p>
              <p className="text-sm">Adicione seu primeiro BDR usando o formulário acima.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bdrs.map((bdr) => (
                <div key={bdr.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {bdr.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {bdr.nome}
                        </h3>
                        <p className="text-sm text-gray-700">
                          Cadastrado em {new Date(bdr.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeBdr(bdr.id)}
                      disabled={isDeleting === bdr.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center"
                    >
                      {isDeleting === bdr.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Removendo...
                        </>
                      ) : (
                        'Remover'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        {bdrs.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📊</span>
              <span className="text-blue-800 font-medium">
                Total de BDRs: {bdrs.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}