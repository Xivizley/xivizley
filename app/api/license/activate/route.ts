import { NextRequest, NextResponse } from 'next/server';
import { validateLicenseKey } from '@/lib/services/licenseService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ success: false, message: 'Lisans anahtarı gereklidir.' }, { status: 400 });
    }

    const validation = validateLicenseKey(key);
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      tier: validation.tier,
      message: validation.message,
      activatedAt: validation.activatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'İstek işlenirken hata oluştu.' }, { status: 500 });
  }
}
