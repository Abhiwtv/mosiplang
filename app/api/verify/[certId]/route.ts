// app/api/verify/[certId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        vc: true,
        batch: {
          include: {
            exporter: true,
            inspection: {
              include: {
                inspector: true
              }
            }
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { 
          status: "NOT_FOUND", 
          message: "Certificate not found" 
        },
        { status: 404 }
      );
    }

    const isExpired = new Date(certificate.expiresAt) < new Date();
    const inspection = certificate.batch?.inspection;
    const vc = certificate.vc;

    const response = {
      status: isExpired ? "EXPIRED" : "VALID",
      
      certificate_id: certificate.id,
      batch_number: certificate.batchNumber,
      
      verification_urls: {
        inji_verify: vc?.verifyUrl || null,
        this_endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify/${certId}`,
        public_page: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${certId}` // Add this
      },
      
      issued_at: certificate.issuedAt,
      expires_at: certificate.expiresAt,
      is_expired: isExpired,
      checked_at: new Date().toISOString(),
      
      issuer: {
        name: certificate.qaAgencyName,
        did: vc?.issuerDid || null,
        type: "Quality Assurance Agency"
      },
      
      holder: {
        name: certificate.exporterName,
        organization: certificate.batch?.exporter?.organization || null,
        did: vc?.subjectDid || null,
        email: certificate.batch?.exporter?.email || null
      },
      
      product: {
        type: certificate.productType,
        batch_number: certificate.batchNumber,
        origin: certificate.batch?.location || null,
        destination: certificate.batch?.destinationCountry || null,
        quantity: certificate.batch?.quantity || null,
        unit: certificate.batch?.unit || "kg",
        harvest_date: certificate.batch?.harvestDate || null
      },
      
      quality_metrics: inspection ? {
        moisture: inspection.moisture,
        pesticide_residue: inspection.pesticideResidue,
        organic: inspection.organic,
        grade: inspection.grade,
        inspection_date: inspection.inspectedAt,
        inspector: {
          name: inspection.inspector?.name || null,
          organization: inspection.inspector?.organization || null
        },
        notes: inspection.notes
      } : null,
      
      credential_data: vc?.vcJson || null, // Full VC for download
      
      warnings: [
        isExpired && "⚠️ Certificate has EXPIRED",
        !vc?.issuerDid && "⚠️ Issuer DID not found",
      ].filter(Boolean)
    };

    return NextResponse.json(response);

  } catch (err: any) {
    console.error("Verify API Error:", err);
    return NextResponse.json(
      { 
        status: "ERROR", 
        message: err.message
      },
      { status: 500 }
    );
  }
}