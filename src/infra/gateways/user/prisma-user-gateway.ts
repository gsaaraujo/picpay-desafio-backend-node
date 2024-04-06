import { PrismaClient } from "@prisma/client";

import { UserGateway } from "@application/gateways/user-gateway";

export class PrismaUserGateway implements UserGateway {
  private readonly prismaClient: PrismaClient;

  public constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
  }

  public async existsById(id: string): Promise<boolean> {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
    });

    return !!user;
  }
}
