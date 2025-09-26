import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar análise anterior de um BDR
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bdrId = searchParams.get('bdrId');

    if (!bdrId) {
      return NextResponse.json(
        { error: 'BDR ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar a análise mais recente do BDR
    const previousMeeting = await prisma.meeting.findFirst({
      where: {
        bdrId: parseInt(bdrId),
      },
      include: {
        bdr: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        dataReuniao: 'desc',
      },
    });

    if (!previousMeeting) {
      return NextResponse.json(
        { message: 'Nenhuma análise anterior encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(previousMeeting);
  } catch (error) {
    console.error('Erro ao buscar análise anterior:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


