import { Transaction } from "@domain/models/transaction/transaction";

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>;
}
