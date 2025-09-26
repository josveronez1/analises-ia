import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Análise detalhada de uma cold call específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Buscar a cold call específica
    const coldCall = await prisma.coldCall.findUnique({
      where: { id },
      include: {
        bdr: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!coldCall) {
      return NextResponse.json(
        { error: 'Cold call não encontrada' },
        { status: 404 }
      );
    }

    // Usar análise já existente (sem IA)
    const analysisText = `### ANÁLISE DETALHADA
${coldCall.analiseCompleta}

### PONTOS DE ATENÇÃO
${coldCall.pontosAtencao}

### RECOMENDAÇÕES
${coldCall.recomendacoes}`;

    return NextResponse.json({
      coldCall: {
        id: coldCall.id,
        prospectNome: coldCall.prospectNome,
        prospectEmpresa: coldCall.prospectEmpresa,
        bdr: coldCall.bdr,
        scores: {
          warmerScore: coldCall.warmerScore,
          reframeScore: coldCall.reframeScore,
          rationalDrowningScore: coldCall.rationalDrowningScore,
          emotionalImpactScore: coldCall.emotionalImpactScore,
          newWayScore: coldCall.newWayScore,
          yourSolutionScore: coldCall.yourSolutionScore,
        },
        createdAt: coldCall.createdAt,
      },
      analysisText,
    });
  } catch (error) {
    console.error('Erro ao buscar análise da cold call:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
