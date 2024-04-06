import { PrismaClient } from "@prisma/client";

import { WalletDTO, WalletGateway } from "@application/gateways/wallet-gateway";

export class PrismaWalletGateway implements WalletGateway {
  private readonly prismaClient: PrismaClient;

  public constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
  }

  async findOneByUserId(userId: string): Promise<WalletDTO | null> {
    const wallet = await this.prismaClient.wallet.findFirst({
      where: {
        userId: userId,
      },
      include: { user: true },
    });

    if (!wallet) return null;

    return {
      id: wallet.id,
      userId: wallet.userId,
      type: wallet.user.type,
      balance: wallet.balance.toNumber(),
    };
  }
}
