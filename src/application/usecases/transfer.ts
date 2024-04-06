import { z } from "zod";

import { Failure } from "@shared/helpers/failure";
import { Either, Left, Right } from "@shared/helpers/either";

import { WalletGateway } from "@application/gateways/wallet-gateway";
import { AuthorizerGateway } from "@application/gateways/authorizer-gateway";
import { EventQueueGateway } from "@application/gateways/event-queue-gateway";

import { WalletType } from "@domain/models/transaction/wallet";
import { Transaction } from "@domain/models/transaction/transaction";
import { TransactionRepository } from "@domain/models/transaction/transaction-repository";

type Input = {
  payerId: string;
  payeeId: string;
  value: number;
};

type Output = void;

export class Transfer {
  private readonly transactionRepository: TransactionRepository;
  private readonly walletGateway: WalletGateway;
  private readonly authorizerGateway: AuthorizerGateway;
  private readonly eventQueueGateway: EventQueueGateway;

  public constructor(
    transactionRepository: TransactionRepository,
    walletGateway: WalletGateway,
    authorizerGateway: AuthorizerGateway,
    eventQueueGateway: EventQueueGateway,
  ) {
    this.transactionRepository = transactionRepository;
    this.walletGateway = walletGateway;
    this.authorizerGateway = authorizerGateway;
    this.eventQueueGateway = eventQueueGateway;
  }

  async execute(input: Input): Promise<Either<Failure, Output>> {
    const schema = z.object({
      payerId: z
        .string({ required_error: "PAYER_ID_IS_REQUIRED", invalid_type_error: "PAYER_ID_MUST_BE_STRING" })
        .trim()
        .uuid({ message: "PAYER_ID_MUST_BE_UUID" }),
      payeeId: z
        .string({ required_error: "PAYEE_ID_IS_REQUIRED", invalid_type_error: "PAYEE_ID_MUST_BE_STRING" })
        .trim()
        .uuid({ message: "PAYEE_ID_MUST_BE_UUID" }),
      value: z.number({
        required_error: "VALUE_IS_REQUIRED",
        invalid_type_error: "VALUE_MUST_BE_NUMBER",
      }),
    });

    const body = schema.safeParse(input);

    if (!body.success) {
      const failure = new Failure(body.error.errors[0].message);
      return Left.create(failure);
    }

    const isAuthorized = await this.authorizerGateway.authorize();

    if (!isAuthorized) {
      const failure = new Failure("UNAUTHORIZED_TRANSFER");
      return Left.create(failure);
    }

    const payerWallet = await this.walletGateway.findOneByUserId(input.payerId);
    const payeeWallet = await this.walletGateway.findOneByUserId(input.payeeId);

    if (!payerWallet) {
      const failure = new Failure("PAYER_WALLET_NOT_FOUND");
      return Left.create(failure);
    }

    if (!payeeWallet) {
      const failure = new Failure("PAYEE_WALLET_NOT_FOUND");
      return Left.create(failure);
    }

    const transactionOrFailure = Transaction.create({
      payerWallet: {
        id: payerWallet.id,
        userId: payerWallet.userId,
        type: payerWallet.type as WalletType,
        balance: payerWallet.balance,
      },
      payeeWallet: {
        id: payeeWallet.id,
        userId: payeeWallet.userId,
        type: payeeWallet.type as WalletType,
        balance: payeeWallet.balance,
      },
      value: input.value,
    });

    if (transactionOrFailure.isLeft()) {
      return Left.create(transactionOrFailure.getValue());
    }

    const transaction = transactionOrFailure.getValue();
    transaction.subscribe({
      eventName: "value_transferred",
      handler: (event) => {
        this.eventQueueGateway.publish("value_transferred", event);
      },
    });

    const transferedOrFailure = transaction.transfer();

    if (transferedOrFailure.isLeft()) {
      return Left.create(transferedOrFailure.getValue());
    }

    await this.transactionRepository.create(transaction);

    return Right.create(undefined);
  }
}
