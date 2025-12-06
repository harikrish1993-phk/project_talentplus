// app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCandidates, createCandidate } from '@/lib/db/candidates';
import { candidateSchema } from '@/lib/validation/candidate-schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const filters: any = {};
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('skills')) filters.skills = searchParams.get('skills')?.split(',');
    if (searchParams.get('location')) filters.location = searchParams.get('location');
    if (searchParams.get('search')) filters.search = searchParams.get('search');
    
    const result = await getCandidates(filters, page, limit);
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = candidateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const candidate = await createCandidate(validation.data);
    return NextResponse.json(
      { success: true, data: candidate, message: 'Candidate created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create candidate', message: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
