import { PrismaClient } from "@prisma/client";

import { Transaction } from "@domain/models/transaction/transaction";
import { TransactionRepository } from "@domain/models/transaction/transaction-repository";

export class PrismaTransactionRepository implements TransactionRepository {
  private readonly prismaClient: PrismaClient;

  public constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
  }

  async create(transaction: Transaction): Promise<void> {
    await this.prismaClient.$transaction([
      this.prismaClient.transaction.create({
        data: {
          id: transaction.getId().getValue(),
          payerWalletId: transaction.getPayerWallet().getId().getValue(),
          payeeWalletId: transaction.getPayeeWallet().getId().getValue(),
          value: transaction.getValue().getValue(),
        },
      }),
      this.prismaClient.wallet.update({
        where: { id: transaction.getPayerWallet().getId().getValue() },
        data: { balance: transaction.getPayerWallet().getBalance().getValue() },
      }),
      this.prismaClient.wallet.update({
        where: { id: transaction.getPayeeWallet().getId().getValue() },
        data: { balance: transaction.getPayeeWallet().getBalance().getValue() },
      }),
    ]);
  }
}
