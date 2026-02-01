import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCertificateById, formatCertificateForDisplay } from '@/services/certificate.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const certificate = await getCertificateById(id);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    const formatted = formatCertificateForDisplay(certificate);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Get certificate error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}
