import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST - Analisar Cold Call
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const bdrId = parseInt(formData.get('bdrId') as string);
    const prospectNome = formData.get('prospectNome') as string;
    const prospectEmpresa = formData.get('prospectEmpresa') as string;
    const insightComercial = formData.get('insightComercial') as string;
    const audioFile = formData.get('audioFile') as File;

    // Validar dados
    if (!bdrId || !prospectNome || !prospectEmpresa || !audioFile) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Transcrever áudio com Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    // Analisar com GPT-4
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: `Analise este cold call baseado na metodologia Conversa Híbrida (6 etapas):

BDR: ${prospectNome}
Prospect: ${prospectNome}
Empresa: ${prospectEmpresa}
Insight Comercial: ${insightComercial}

Transcrição: ${transcription.text}

Avalie cada etapa de 0 a 10 e forneça:

### SCORES CONVERSA HÍBRIDA
**Warmer:** X/10
**Reframe:** X/10
**Rational Drowning:** X/10
**Emotional Impact:** X/10
**New Way:** X/10
**Your Solution:** X/10

### ANÁLISE DETALHADA
(Análise completa da ligação)

### PONTOS DE ATENÇÃO
(Áreas que precisam de melhoria)

### RECOMENDAÇÕES
(Ações específicas para melhorar)`
        }
      ]
    });

    const analysisText = analysis.choices[0].message.content || '';

    // Extrair scores
    const scores = {
      warmerScore: extractScore(analysisText, 'Warmer'),
      reframeScore: extractScore(analysisText, 'Reframe'),
      rationalDrowningScore: extractScore(analysisText, 'Rational Drowning'),
      emotionalImpactScore: extractScore(analysisText, 'Emotional Impact'),
      newWayScore: extractScore(analysisText, 'New Way'),
      yourSolutionScore: extractScore(analysisText, 'Your Solution'),
    };

    // Extrair seções
    const pontosAtencao = extractSection(analysisText, 'PONTOS DE ATENÇÃO');
    const recomendacoes = extractSection(analysisText, 'RECOMENDAÇÕES');

    // Salvar no banco
    const coldCall = await prisma.coldCall.create({
      data: {
        bdrId,
        prospectNome,
        prospectEmpresa,
        insightComercial,
        ...scores,
        analiseCompleta: analysisText,
        pontosAtencao,
        recomendacoes,
      },
    });

    return NextResponse.json(coldCall);
  } catch (error) {
    console.error('Erro ao analisar cold call:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Listar todas as análises de Cold Calls
export async function GET() {
  try {
    const coldCalls = await prisma.coldCall.findMany({
      include: {
        bdr: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(coldCalls);
  } catch (error) {
    console.error('Erro ao buscar cold calls:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para extrair scores
function extractScore(text: string, step: string): number {
  const regex = new RegExp(`${step}.*?(\\d+)/10`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1]) : 5;
}

// Função para extrair seções
function extractSection(text: string, section: string): string {
  const regex = new RegExp(`${section}[\\s\\S]*?(?=###|$)`, 'i');
  const match = text.match(regex);
  return match ? match[0].replace(section, '').trim() : 'Não encontrado';
}