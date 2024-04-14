type TransactionDTO = {
  id: string;
  value: number;
  payeeWalletId: string;
  payerWalletId: string;
};

export interface TransactionGateway {
  findAllByCustomerId(customerId: string): Promise<TransactionDTO[]>;
}
