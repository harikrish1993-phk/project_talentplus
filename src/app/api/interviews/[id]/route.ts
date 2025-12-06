import { NextResponse } from 'next/server';
import { getInterview, updateInterview, deleteInterview } from '@/lib/db/interviews';

export async function GET(request: Request, { params }: any) {
  const interview = await getInterview(params.id);
  return NextResponse.json({ interview });
}

export async function PUT(request: Request, { params }: any) {
  const body = await request.json();
  const interview = await updateInterview(params.id, body);
  return NextResponse.json({ interview });
}

export async function DELETE(request: Request, { params }: any) {
  await deleteInterview(params.id);
  return NextResponse.json({ success: true });
}
