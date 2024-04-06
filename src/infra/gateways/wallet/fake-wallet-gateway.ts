import { WalletDTO, WalletGateway } from "@application/gateways/wallet-gateway";

type FakeWallet = {
  id: string;
  type: string;
  userId: string;
  balance: number;
};

export class FakeWalletGateway implements WalletGateway {
  public fakeWallets: FakeWallet[] = [];

  async findOneByUserId(userId: string): Promise<WalletDTO | null> {
    const wallet = this.fakeWallets.find((fakeWallet) => fakeWallet.userId === userId);

    if (!wallet) return null;

    return {
      id: wallet.id,
      type: wallet.type,
      userId: wallet.userId,
      balance: wallet.balance,
    };
  }
}
