import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Dados para o dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const bdrId = searchParams.get('bdrId');

    // Calcular data de início baseada no período
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Filtros baseados nos parâmetros
    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: now,
      },
      ...(bdrId && { bdrId: parseInt(bdrId) }),
    };

    // Buscar todas as análises de Cold Calls no período
    const coldCalls = await prisma.coldCall.findMany({
      where: whereClause,
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

    // Calcular médias dos scores
    const averages = {
      warmerScore: 0,
      reframeScore: 0,
      rationalDrowningScore: 0,
      emotionalImpactScore: 0,
      newWayScore: 0,
      yourSolutionScore: 0,
    };

    if (coldCalls.length > 0) {
      averages.warmerScore = coldCalls.reduce((sum, call) => sum + call.warmerScore, 0) / coldCalls.length;
      averages.reframeScore = coldCalls.reduce((sum, call) => sum + call.reframeScore, 0) / coldCalls.length;
      averages.rationalDrowningScore = coldCalls.reduce((sum, call) => sum + call.rationalDrowningScore, 0) / coldCalls.length;
      averages.emotionalImpactScore = coldCalls.reduce((sum, call) => sum + call.emotionalImpactScore, 0) / coldCalls.length;
      averages.newWayScore = coldCalls.reduce((sum, call) => sum + call.newWayScore, 0) / coldCalls.length;
      averages.yourSolutionScore = coldCalls.reduce((sum, call) => sum + call.yourSolutionScore, 0) / coldCalls.length;
    }

    // Análise textual baseada nos dados existentes (sem IA)
    let analysisText = '';
    if (coldCalls.length > 0) {
      const totalScore = (averages.warmerScore + averages.reframeScore + averages.rationalDrowningScore + 
                         averages.emotionalImpactScore + averages.newWayScore + averages.yourSolutionScore) / 6;
      
      const getScoreLevel = (score: number) => {
        if (score >= 8) return 'excelente';
        if (score >= 6) return 'bom';
        if (score >= 4) return 'regular';
        return 'precisa melhorar';
      };

      const getBestScore = () => {
        const scores = [
          { name: 'Warmer', value: averages.warmerScore },
          { name: 'Reframe', value: averages.reframeScore },
          { name: 'Rational Drowning', value: averages.rationalDrowningScore },
          { name: 'Emotional Impact', value: averages.emotionalImpactScore },
          { name: 'New Way', value: averages.newWayScore },
          { name: 'Your Solution', value: averages.yourSolutionScore },
        ];
        return scores.reduce((best, current) => current.value > best.value ? current : best);
      };

      const getWorstScore = () => {
        const scores = [
          { name: 'Warmer', value: averages.warmerScore },
          { name: 'Reframe', value: averages.reframeScore },
          { name: 'Rational Drowning', value: averages.rationalDrowningScore },
          { name: 'Emotional Impact', value: averages.emotionalImpactScore },
          { name: 'New Way', value: averages.newWayScore },
          { name: 'Your Solution', value: averages.yourSolutionScore },
        ];
        return scores.reduce((worst, current) => current.value < worst.value ? current : worst);
      };

      const bestScore = getBestScore();
      const worstScore = getWorstScore();

      analysisText = `### ANÁLISE GERAL
Performance ${getScoreLevel(totalScore)} com score médio de ${totalScore.toFixed(1)}/10 baseado em ${coldCalls.length} análises dos últimos ${period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '90 dias'}.

### PONTOS FORTES
- ${bestScore.name}: ${bestScore.value.toFixed(1)}/10 - Esta é a área de maior destaque
- Score médio geral: ${totalScore.toFixed(1)}/10

### PONTOS DE ATENÇÃO
- ${worstScore.name}: ${worstScore.value.toFixed(1)}/10 - Área que precisa de mais atenção
- Foco em melhorar as técnicas de ${worstScore.name.toLowerCase()}

### RECOMENDAÇÕES
- Treinar especificamente a área de ${worstScore.name}
- Manter o bom desempenho em ${bestScore.name}
- Realizar mais análises para ter dados mais consistentes`;
    }

    // Buscar BDRs para o filtro
    const bdrs = await prisma.bDR.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json({
      period,
      bdrId: bdrId ? parseInt(bdrId) : null,
      totalAnalises: coldCalls.length,
      averages,
      analysisText,
      bdrs,
      coldCalls: coldCalls.map(call => ({
        id: call.id,
        prospectNome: call.prospectNome,
        prospectEmpresa: call.prospectEmpresa,
        bdr: call.bdr,
        scores: {
          warmerScore: call.warmerScore,
          reframeScore: call.reframeScore,
          rationalDrowningScore: call.rationalDrowningScore,
          emotionalImpactScore: call.emotionalImpactScore,
          newWayScore: call.newWayScore,
          yourSolutionScore: call.yourSolutionScore,
        },
        createdAt: call.createdAt,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}