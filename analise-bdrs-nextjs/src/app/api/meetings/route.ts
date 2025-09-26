import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST - Analisar Reunião 1:1
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const bdrId = parseInt(formData.get('bdrId') as string);
    const dataReuniao = formData.get('dataReuniao') as string;
    const audioFile = formData.get('audioFile') as File;

    // Validar dados
    if (!bdrId) {
      return NextResponse.json(
        { error: 'BDR é obrigatório' },
        { status: 400 }
      );
    }
    if (!dataReuniao) {
      return NextResponse.json(
        { error: 'Data da reunião é obrigatória' },
        { status: 400 }
      );
    }
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      );
    }

    let transcription = '';
    
    // Transcrever áudio se fornecido
    if (audioFile) {
      const transcriptionResult = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });
      transcription = transcriptionResult.text;
    }

    // Analisar com GPT-4
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em gestão de equipes de vendas (BDRs) e metodologia Conversa Híbrida. 
          Sua função é analisar reuniões 1:1 semanais entre gestor e BDR, focando em desenvolvimento profissional, 
          performance e crescimento. Analise a transcrição/áudio da reunião e forneça insights acionáveis.`
        },
        {
          role: 'user',
          content: `Analise esta reunião 1:1 semanal entre gestor e BDR baseada na metodologia Conversa Híbrida (6 etapas):

${transcription ? `TRANSCRIÇÃO DA REUNIÃO:
${transcription}` : 'AUDIO: Arquivo de áudio fornecido para transcrição'}

INSTRUÇÕES:
1. Analise a qualidade da conversa aplicando as 6 etapas da Conversa Híbrida
2. Identifique pontos fortes e áreas de melhoria do BDR
3. Gere um resumo executivo da reunião
4. Defina metas SMART para a próxima semana
5. Forneça recomendações específicas e acionáveis

### SCORES CONVERSA HÍBRIDA
**Warmer:** X/10 (Como foi o aquecimento/rapport inicial?)
**Reframe:** X/10 (Como o BDR reframou objeções e situações?)
**Rational Drowning:** X/10 (Como lidou com argumentos racionais?)
**Emotional Impact:** X/10 (Como criou impacto emocional?)
**New Way:** X/10 (Como apresentou novas perspectivas?)
**Your Solution:** X/10 (Como posicionou a solução?)

### RESUMO DA REUNIÃO
(Resumo executivo dos principais pontos discutidos)

### METAS DEFINIDAS
(Metas SMART específicas para a próxima semana)

### PONTOS DE ATENÇÃO
(Áreas que precisam de melhoria e desenvolvimento)

### RECOMENDAÇÕES
(Ações específicas e acionáveis para o BDR e gestor)`
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
    const resumoGerado = extractSection(analysisText, 'RESUMO DA REUNIÃO');
    const metasGeradas = extractSection(analysisText, 'METAS DEFINIDAS');
    const pontosAtencao = extractSection(analysisText, 'PONTOS DE ATENÇÃO');
    const recomendacoes = extractSection(analysisText, 'RECOMENDAÇÕES');

    // Salvar no banco
    const meeting = await prisma.meeting.create({
      data: {
        bdrId,
        dataReuniao: new Date(dataReuniao),
        resumo: resumoGerado,
        metas: metasGeradas,
        ...scores,
        analiseCompleta: analysisText,
        pontosAtencao,
        recomendacoes,
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Erro ao analisar reunião:', error);
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