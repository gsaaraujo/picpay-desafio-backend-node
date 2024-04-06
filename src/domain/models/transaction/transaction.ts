import { UUID } from "@shared/domain/models/uuid";
import { Failure } from "@shared/helpers/failure";
import { Either, Left, Right } from "@shared/helpers/either";

import { Money } from "@domain/models/money";
import { AggregateRoot } from "@shared/helpers/aggregate-root";
import { Wallet, WalletType } from "@domain/models/transaction/wallet";
import { ValueTransferred } from "@domain/events/value-transferred";

type TransactionProps = {
  payerWallet: Wallet;
  payeeWallet: Wallet;
  value: Money;
};

type CreateTransactionProps = {
  payerWallet: {
    id: string;
    userId: string;
    type: WalletType;
    balance: number;
  };
  payeeWallet: {
    id: string;
    userId: string;
    type: WalletType;
    balance: number;
  };
  value: number;
};

type ReconstituteTransactionProps = {
  id: string;
  payerWallet: {
    id: string;
    userId: string;
    type: WalletType;
    balance: number;
  };
  payeeWallet: {
    id: string;
    userId: string;
    type: WalletType;
    balance: number;
  };
  value: number;
};

export class Transaction extends AggregateRoot<TransactionProps> {
  public static create(props: CreateTransactionProps): Either<Failure, Transaction> {
    const payerWallet = Wallet.reconstitute({
      id: props.payerWallet.id,
      type: props.payerWallet.type,
      userId: props.payerWallet.userId,
      balance: props.payerWallet.balance,
    });
    const payeeWallet = Wallet.reconstitute({
      id: props.payeeWallet.id,
      type: props.payeeWallet.type,
      userId: props.payeeWallet.userId,
      balance: props.payeeWallet.balance,
    });
    const valueOrFailure = Money.create({ value: props.value });

    if (valueOrFailure.isLeft()) return Left.create(valueOrFailure.getValue());

    if (payerWallet.getId().isEquals(payeeWallet.getId())) {
      const failure = new Failure("PAYER_AND_PAYEE_ARE_THE_SAME");
      return Left.create(failure);
    }

    const transactionOrFailure = new Transaction({
      payerWallet: payerWallet,
      payeeWallet: payeeWallet,
      value: valueOrFailure.getValue(),
    });
    return Right.create(transactionOrFailure);
  }

  public static reconstitute(props: ReconstituteTransactionProps): Transaction {
    return new Transaction(
      {
        payerWallet: Wallet.reconstitute({
          id: props.payerWallet.userId,
          userId: props.payerWallet.userId,
          type: props.payerWallet.type,
          balance: props.payerWallet.balance,
        }),
        payeeWallet: Wallet.reconstitute({
          id: props.payeeWallet.userId,
          userId: props.payeeWallet.userId,
          type: props.payeeWallet.type,
          balance: props.payeeWallet.balance,
        }),
        value: Money.reconstitute({ value: props.value }),
      },
      UUID.reconstitute({ value: props.id }),
    );
  }

  public transfer(): Either<Failure, void> {
    if (this.props.payerWallet.getType() === "SHOPKEEPER") {
      const failure = new Failure("SHOPKEEPERS_CANNOT_MAKE_TRANSFERS");
      return Left.create(failure);
    }

    const debitedOrFailure = this.props.payerWallet.debit(this.props.value.getValue());
    const creditedOrFailure = this.props.payeeWallet.credit(this.props.value.getValue());

    if (debitedOrFailure.isLeft()) return Left.create(debitedOrFailure.getValue());
    if (creditedOrFailure.isLeft()) return Left.create(creditedOrFailure.getValue());

    this.notify(
      new ValueTransferred({
        name: "value_transferred",
        aggregateId: this.getId().getValue(),
        dateTimeOccurred: new Date(),
      }),
    );
    return Right.create(undefined);
  }

  public getPayerWallet(): Wallet {
    return this.props.payerWallet;
  }

  public getPayeeWallet(): Wallet {
    return this.props.payeeWallet;
  }

  public getValue(): Money {
    return this.props.value;
  }
}
