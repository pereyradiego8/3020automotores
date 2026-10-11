import { NextResponse } from 'next/server';

export const revalidate = 1800;

export async function GET() {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/blue', {
      next: { revalidate: 1800 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'No se pudo consultar la cotización.' }, { status: 502 });
    }

    const quote: { venta?: number; fechaActualizacion?: string } = await response.json();
    if (typeof quote.venta !== 'number' || !Number.isFinite(quote.venta) || quote.venta <= 0) {
      return NextResponse.json({ error: 'La cotización recibida no es válida.' }, { status: 502 });
    }

    return NextResponse.json(
      { venta: quote.venta, fechaActualizacion: quote.fechaActualizacion ?? null },
      { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json({ error: 'No se pudo consultar la cotización.' }, { status: 502 });
  }
}
