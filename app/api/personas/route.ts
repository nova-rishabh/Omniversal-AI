import { NextResponse } from 'next/server';
import { listPersonas } from '@/lib/personas/persona';

export async function GET() {
  return NextResponse.json(listPersonas());
}
