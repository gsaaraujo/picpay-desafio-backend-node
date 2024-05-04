import { describe, it, beforeEach, expect } from "vitest";

import { Failure } from "@shared/helpers/failure";

import { Transfer } from "@application/usecases/transfer";

import { FakeWalletGateway } from "@infra/gateways/wallet/fake-wallet-gateway";
import { FakeAuthorizerGateway } from "@infra/gateways/authorizer/fake-authorizer-gateway";
import { FakeEventQueueGateway } from "@infra/gateways/event-queue/fake-event-queue-gateway";
import { FakeTransactionRepository } from "@infra/repositories/transaction/fake-transaction-repository";

describe("transfer", () => {
  let transfer: Transfer;
  let fakeTransactionRepository: FakeTransactionRepository;
  let fakeWalletGateway: FakeWalletGateway;
  let fakeAuthorizerGateway: FakeAuthorizerGateway;
  let fakeEventQueueGateway: FakeEventQueueGateway;

  beforeEach(() => {
    fakeTransactionRepository = new FakeTransactionRepository();
    fakeWalletGateway = new FakeWalletGateway();
    fakeAuthorizerGateway = new FakeAuthorizerGateway();
    fakeEventQueueGateway = new FakeEventQueueGateway();
    transfer = new Transfer(fakeTransactionRepository, fakeWalletGateway, fakeAuthorizerGateway, fakeEventQueueGateway);
  });

  it("should transfer", async () => {
    fakeAuthorizerGateway.isAuthorized = true;
    fakeWalletGateway.fakeWallets = [
      {
        id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        userId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        type: "COMMON",
        balance: 1000,
      },
      {
        id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        userId: "3ce586df-e49e-495f-927f-594da350cdd2",
        type: "COMMON",
        balance: 1000,
      },
    ];

    const sut = await transfer.execute({
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.getValue()).toBe(undefined);
    expect(fakeTransactionRepository.fakeTransactions.length).toBe(1);
    expect(fakeEventQueueGateway.fakeEvents.length).toBe(1);
  });

  it("should fail if transfer is not authorized", async () => {
    fakeAuthorizerGateway.isAuthorized = false;
    fakeWalletGateway.fakeWallets = [
      {
        id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        userId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        type: "COMMON",
        balance: 1000,
      },
      {
        id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        userId: "3ce586df-e49e-495f-927f-594da350cdd2",
        type: "COMMON",
        balance: 1000,
      },
    ];

    const sut = await transfer.execute({
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("UNAUTHORIZED_TRANSFER"));
  });

  it("should fail if payer wallet is not found", async () => {
    fakeAuthorizerGateway.isAuthorized = true;
    fakeWalletGateway.fakeWallets = [
      {
        id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        userId: "3ce586df-e49e-495f-927f-594da350cdd2",
        type: "COMMON",
        balance: 1000,
      },
    ];

    const sut = await transfer.execute({
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("PAYER_WALLET_NOT_FOUND"));
  });

  it("should fail if payee wallet is not found", async () => {
    fakeAuthorizerGateway.isAuthorized = true;
    fakeWalletGateway.fakeWallets = [
      {
        id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        userId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        type: "COMMON",
        balance: 1000,
      },
    ];

    const sut = await transfer.execute({
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("PAYEE_WALLET_NOT_FOUND"));
  });

  it("should fail if payer and payee are the same", async () => {
    fakeAuthorizerGateway.isAuthorized = true;
    fakeWalletGateway.fakeWallets = [
      {
        id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        userId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        type: "COMMON",
        balance: 1000,
      },
      {
        id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        userId: "3ce586df-e49e-495f-927f-594da350cdd2",
        type: "COMMON",
        balance: 1000,
      },
    ];

    const sut = await transfer.execute({
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      value: 124.5,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("PAYER_AND_PAYEE_ARE_THE_SAME"));
  });

  it("should fail if the payer is a shopkeeper", async () => {
    fakeAuthorizerGateway.isAuthorized = true;
    fakeWalletGateway.fakeWallets = [
      {
        id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        userId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        type: "SHOPKEEPER",
        balance: 1000,
      },
      {
        id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        userId: "3ce586df-e49e-495f-927f-594da350cdd2",
        type: "COMMON",
        balance: 1000,
      },
    ];

    const sut = await transfer.execute({
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.getValue()).toStrictEqual(new Failure("SHOPKEEPERS_CANNOT_MAKE_TRANSFERS"));
  });
});
