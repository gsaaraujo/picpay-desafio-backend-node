export type WalletDTO = {
  id: string;
  type: string;
  userId: string;
  balance: number;
};

export interface WalletGateway {
  findOneByUserId(userId: string): Promise<WalletDTO | null>;
}
