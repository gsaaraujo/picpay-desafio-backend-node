import { describe, it, expect } from "vitest";

import { Failure } from "@shared/helpers/failure";

import { WalletType } from "@domain/models/transaction/wallet";
import { Transaction } from "@domain/models/transaction/transaction";

describe("transaction", () => {
  it("should create", () => {
    const sut = Transaction.create({
      payerWallet: {
        id: "2277ab29-e3c6-4a5c-b38b-cecb036ede3d",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 322.5,
      },
      payeeWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "16e7de57-ea11-4fbb-8780-468562d2b5d8",
        type: WalletType.COMMON,
        balance: 180,
      },
      value: 100,
    }).getValue() as Transaction;

    expect(sut.getValue().getValue()).toBe(100);
    expect(sut.getPayerWallet().getType()).toBe(WalletType.COMMON);
    expect(sut.getPayerWallet().getBalance().getValue()).toBe(322.5);
    expect(sut.getPayerWallet().getUserId().getValue()).toBe("18852668-ce8e-43f7-9a52-a54a9a223f62");
    expect(sut.getPayeeWallet().getType()).toBe(WalletType.COMMON);
    expect(sut.getPayeeWallet().getBalance().getValue()).toBe(180);
    expect(sut.getPayeeWallet().getUserId().getValue()).toBe("16e7de57-ea11-4fbb-8780-468562d2b5d8");
  });

  it("should reconstitute", () => {
    const sut = Transaction.reconstitute({
      id: "e554fa3a-6e15-4cb6-bad6-ec6213f91ccc",
      payerWallet: {
        id: "2277ab29-e3c6-4a5c-b38b-cecb036ede3d",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 322.5,
      },
      payeeWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "16e7de57-ea11-4fbb-8780-468562d2b5d8",
        type: WalletType.COMMON,
        balance: 180,
      },
      value: 100,
    });

    expect(sut.getId().getValue()).toBe("e554fa3a-6e15-4cb6-bad6-ec6213f91ccc");
    expect(sut.getValue().getValue()).toBe(100);
    expect(sut.getPayerWallet().getType()).toBe(WalletType.COMMON);
    expect(sut.getPayerWallet().getBalance().getValue()).toBe(322.5);
    expect(sut.getPayerWallet().getUserId().getValue()).toBe("18852668-ce8e-43f7-9a52-a54a9a223f62");
    expect(sut.getPayeeWallet().getType()).toBe(WalletType.COMMON);
    expect(sut.getPayeeWallet().getBalance().getValue()).toBe(180);
    expect(sut.getPayeeWallet().getUserId().getValue()).toBe("16e7de57-ea11-4fbb-8780-468562d2b5d8");
  });

  it("should fail if payer and payee are the same", () => {
    const sut = Transaction.create({
      payerWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 322.5,
      },
      payeeWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 180,
      },
      value: 100,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("PAYER_AND_PAYEE_ARE_THE_SAME"));
  });

  it("should fail if the payer is a shopkeeper", () => {
    const transaction = Transaction.create({
      payerWallet: {
        id: "2277ab29-e3c6-4a5c-b38b-cecb036ede3d",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.SHOPKEEPER,
        balance: 322.5,
      },
      payeeWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 180,
      },
      value: 100,
    }).getValue() as Transaction;

    const sut = transaction.transfer();

    expect(sut.getValue()).toStrictEqual(new Failure("SHOPKEEPERS_CANNOT_MAKE_TRANSFERS"));
  });

  it("should fail if the value provided is invalid", () => {
    const sut = Transaction.create({
      payerWallet: {
        id: "2277ab29-e3c6-4a5c-b38b-cecb036ede3d",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 322.5,
      },
      payeeWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "16e7de57-ea11-4fbb-8780-468562d2b5d8",
        type: WalletType.COMMON,
        balance: 180,
      },
      value: -200,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("MONEY_CANNOT_BE_NEGATIVE"));
  });

  it("should fail if the payer have insuficient balance", () => {
    const transaction = Transaction.create({
      payerWallet: {
        id: "2277ab29-e3c6-4a5c-b38b-cecb036ede3d",
        userId: "18852668-ce8e-43f7-9a52-a54a9a223f62",
        type: WalletType.COMMON,
        balance: 322.5,
      },
      payeeWallet: {
        id: "d793ee8d-b553-4191-8832-d2665cc8a3ea",
        userId: "16e7de57-ea11-4fbb-8780-468562d2b5d8",
        type: WalletType.COMMON,
        balance: 180,
      },
      value: 500,
    }).getValue() as Transaction;

    const sut = transaction.transfer();

    expect(sut.getValue()).toStrictEqual(new Failure("INSUFFICIENT_BALANCE"));
  });
});
