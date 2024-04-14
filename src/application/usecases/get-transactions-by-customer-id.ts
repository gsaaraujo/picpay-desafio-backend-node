import { z } from "zod";
import { PrismaClient } from "@prisma/client";

import { Failure } from "@shared/helpers/failure";
import { Either, Left, Right } from "@shared/helpers/either";

import { UserGateway } from "@application/gateways/user-gateway";
import { CacheGateway } from "@application/gateways/cache-gateway";

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
  private readonly cacheGateway: CacheGateway;
  private readonly userGateway: UserGateway;

  public constructor(prismaClient: PrismaClient, cacheGateway: CacheGateway, userGateway: UserGateway) {
    this.prismaClient = prismaClient;
    this.cacheGateway = cacheGateway;
    this.userGateway = userGateway;
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

    const exists = await this.userGateway.existsById(input.customerId);

    if (!exists) {
      const failure = new Failure("CUSTOMER_NOT_FOUND");
      return Left.create(failure);
    }

    const transactionsSerialized = await this.cacheGateway.get("GetTransactionsByCustomerId");

    if (transactionsSerialized) {
      return Right.create(JSON.parse(transactionsSerialized));
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

    await this.cacheGateway.set("GetTransactionsByCustomerId", JSON.stringify(transactionsOutput));
    return Right.create(transactionsOutput);
  }
}
