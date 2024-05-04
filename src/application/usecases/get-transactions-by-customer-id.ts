import { z } from "zod";
import { PrismaClient } from "@prisma/client";

import { Failure } from "@shared/helpers/failure";
import { Either, Left, Right } from "@shared/helpers/either";

type Input = {
  customerId: string;
};

type Output = {
  id: string;
  payerWalletId: string;
  payeeWalletId: string;
  value: number;
};

export class GetTransactionsByCustomerId {
  private readonly prismaClient: PrismaClient;

  public constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
  }

  async execute(input: Input): Promise<Either<Failure, Output[]>> {
    const schema = z.object({
      customerId: z
        .string({ required_error: "CUSTOMER_ID_IS_REQUIRED", invalid_type_error: "CUSTOMER_ID_MUST_BE_STRING" })
        .trim()
        .uuid({ message: "CUSTOMER_ID_MUST_BE_UUID" }),
    });

    const body = schema.safeParse(input);

    if (!body.success) {
      const failure = new Failure(body.error.errors[0].message);
      return Left.create(failure);
    }

    const exists = await this.prismaClient.user.findUnique({ where: { id: input.customerId } });

    if (!exists) {
      const failure = new Failure("CUSTOMER_NOT_FOUND");
      return Left.create(failure);
    }

    const transactionsORM = await this.prismaClient.transaction.findMany({
      where: {
        OR: [{ payer: { userId: input.customerId } }, { payee: { userId: input.customerId } }],
      },
    });

    const transactionsOutput = transactionsORM.map((transaction) => ({
      id: transaction.id,
      payerWalletId: transaction.payerWalletId,
      payeeWalletId: transaction.payeeWalletId,
      value: transaction.value.toNumber(),
    }));

    return Right.create(transactionsOutput);
  }
}
