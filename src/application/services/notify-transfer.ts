import { Failure } from "@shared/helpers/failure";
import { Either, Right } from "@shared/helpers/either";

import { TransferNotifierGateway } from "@application/gateways/transfer-notifier-gateway";

type Output = void;

export class NotifyTransfer {
  private readonly transferNotifierGateway: TransferNotifierGateway;

  public constructor(transferNotifierGateway: TransferNotifierGateway) {
    this.transferNotifierGateway = transferNotifierGateway;
  }

  async execute(): Promise<Either<Failure, Output>> {
    await this.transferNotifierGateway.notify();
    return Right.create(undefined);
  }
}
