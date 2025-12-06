import { NextResponse } from 'next/server';
export async function GET() {
  const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'];
  return NextResponse.json({ success: true, data: skills });
}
