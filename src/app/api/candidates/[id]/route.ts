// app/api/candidates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCandidate, updateCandidate, deleteCandidate } from '@/lib/db/candidates';
import { candidateUpdateSchema } from '@/lib/validation/candidate-schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await getCandidate(params.id);
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: candidate });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = candidateUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const candidate = await updateCandidate(params.id, validation.data);
    return NextResponse.json({ success: true, data: candidate });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update candidate', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCandidate(params.id);
    return NextResponse.json({ success: true, message: 'Candidate deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete candidate', message: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
