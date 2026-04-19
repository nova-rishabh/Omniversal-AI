import { NextResponse } from 'next/server';
import { listPersonas } from '@/lib/personas/shakespeare';

export async function GET() {
  return NextResponse.json(listPersonas());
}
