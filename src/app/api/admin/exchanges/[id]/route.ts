import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


async function requireAdminApi() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = params;

    const exchange = await prisma.exchange.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        logoUrl: body.logoUrl || null,
        affiliateUrl: body.affiliateUrl || null,
        score: parseFloat(body.score) || 0,
        foundedYear: body.foundedYear ? parseInt(body.foundedYear) : null,
        headquarters: body.headquarters || null,
        description: body.description || null,
        supportedCoinsCount: parseInt(body.supportedCoinsCount) || 0,
        kycRequired: Boolean(body.kycRequired),
        spotAvailable: Boolean(body.spotAvailable),
        futuresAvailable: Boolean(body.futuresAvailable),
        fees: {
          upsert: {
            create: {
              spotMakerFee: parseFloat(body.spotMakerFee) || 0,
              spotTakerFee: parseFloat(body.spotTakerFee) || 0,
              futuresMakerFee: body.futuresMakerFee ? parseFloat(body.futuresMakerFee) : null,
              futuresTakerFee: body.futuresTakerFee ? parseFloat(body.futuresTakerFee) : null,
              withdrawalFee: body.withdrawalFee ? parseFloat(body.withdrawalFee) : null,
            },
            update: {
              spotMakerFee: parseFloat(body.spotMakerFee) || 0,
              spotTakerFee: parseFloat(body.spotTakerFee) || 0,
              futuresMakerFee: body.futuresMakerFee ? parseFloat(body.futuresMakerFee) : null,
              futuresTakerFee: body.futuresTakerFee ? parseFloat(body.futuresTakerFee) : null,
              withdrawalFee: body.withdrawalFee ? parseFloat(body.withdrawalFee) : null,
            },
          },
        },
      },
      include: {
        fees: true,
        offers: true,
      },
    });

    return NextResponse.json({ exchange });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update exchange";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    await prisma.exchange.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete exchange";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
