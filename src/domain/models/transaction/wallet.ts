import { Entity } from "@shared/helpers/entity";
import { UUID } from "@shared/domain/models/uuid";
import { Failure } from "@shared/helpers/failure";
import { Either, Left, Right } from "@shared/helpers/either";

import { Money } from "@domain/models/money";

export enum WalletType {
  COMMON = "COMMON",
  SHOPKEEPER = "SHOPKEEPER",
}

type WalletProps = {
  type: WalletType;
  userId: UUID;
  balance: Money;
};

type CreateWalletProps = {
  userId: string;
  type: WalletType;
  balance: number;
};

type ReconstituteWalletProps = {
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
};

export class Wallet extends Entity<WalletProps> {
  public static create(props: CreateWalletProps): Either<Failure, Wallet> {
    const userIdOrFailure = UUID.create({ value: props.userId });
    const balanceOrFailure = Money.create({ value: props.balance });

    if (userIdOrFailure.isLeft()) return Left.create(userIdOrFailure.getValue());
    if (balanceOrFailure.isLeft()) return Left.create(balanceOrFailure.getValue());

    const wallet = new Wallet({
      type: props.type,
      userId: userIdOrFailure.getValue(),
      balance: balanceOrFailure.getValue(),
    });
    return Right.create(wallet);
  }

  public static reconstitute(props: ReconstituteWalletProps): Wallet {
    return new Wallet(
      {
        type: props.type,
        userId: UUID.reconstitute({ value: props.userId }),
        balance: Money.reconstitute({ value: props.balance }),
      },
      UUID.reconstitute({ value: props.id }),
    );
  }

  public debit(value: number): Either<Failure, void> {
    const valueOrFailure = Money.create({ value });

    if (valueOrFailure.isLeft()) {
      return Left.create(valueOrFailure.getValue());
    }

    const valueToDebit = valueOrFailure.getValue();

    if (this.props.balance.getValue() < valueToDebit.getValue()) {
      const failure = new Failure("INSUFFICIENT_BALANCE");
      return Left.create(failure);
    }

    const newBalanceOrFailure = Money.create({
      value: this.props.balance.getValue() - valueToDebit.getValue(),
    });

    if (newBalanceOrFailure.isLeft()) {
      return Left.create(newBalanceOrFailure.getValue());
    }

    this.props.balance = newBalanceOrFailure.getValue();
    return Right.create(undefined);
  }

  public credit(value: number): Either<Failure, void> {
    const valueOrFailure = Money.create({ value });

    if (valueOrFailure.isLeft()) {
      return Left.create(valueOrFailure.getValue());
    }

    const valueToCredit = valueOrFailure.getValue();

    const newBalanceOrFailure = Money.create({
      value: this.props.balance.getValue() + valueToCredit.getValue(),
    });

    if (newBalanceOrFailure.isLeft()) {
      return Left.create(newBalanceOrFailure.getValue());
    }

    this.props.balance = newBalanceOrFailure.getValue();
    return Right.create(undefined);
  }

  public getUserId(): UUID {
    return this.props.userId;
  }

  public getBalance(): Money {
    return this.props.balance;
  }

  public getType(): WalletType {
    return this.props.type;
  }
}
