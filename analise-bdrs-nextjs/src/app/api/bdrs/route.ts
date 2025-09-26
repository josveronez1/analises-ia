import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os BDRs
export async function GET() {
  try {
    const bdrs = await prisma.bDR.findMany({
      orderBy: { nome: 'asc' }
    });
    
    return NextResponse.json(bdrs);
  } catch (error) {
    console.error('Erro ao buscar BDRs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo BDR
export async function POST(request: NextRequest) {
  try {
    const { nome } = await request.json();
    
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    const bdr = await prisma.bDR.create({
      data: { nome: nome.trim() }
    });
    
    return NextResponse.json(bdr, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar BDR:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}