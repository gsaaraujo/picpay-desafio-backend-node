import { Transaction } from "@domain/models/transaction/transaction";
import { TransactionRepository } from "@domain/models/transaction/transaction-repository";

type FakeTransaction = {
  transactionId: string;
};

export class FakeTransactionRepository implements TransactionRepository {
  public fakeTransactions: FakeTransaction[] = [];

  async create(transaction: Transaction): Promise<void> {
    this.fakeTransactions.push({ transactionId: transaction.getId().getValue() });
  }
}
