import axios, { AxiosInstance } from "axios";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient, UserType as UserTypeORM } from "@prisma/client";

describe("transfer-handler", () => {
  let prismaClient: PrismaClient;
  let axiosInstance: AxiosInstance;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
    axiosInstance = axios.create({
      baseURL: process.env.API_URL,
      validateStatus: () => true,
    });
  });

  beforeEach(async () => {
    await prismaClient.transaction.deleteMany();
    await prismaClient.wallet.deleteMany();
    await prismaClient.user.deleteMany();
  });

  const makePayer = async (userTypeOrm?: UserTypeORM): Promise<void> => {
    await prismaClient.user.create({
      data: {
        id: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        type: userTypeOrm ?? UserTypeORM.COMMON,
        fullName: "Edward Elric",
        email: "edward.elric@gmail.com",
        cpf: "10404117031",
        password: "f65e3951691846329d8693b326faf153",
      },
    });

    await prismaClient.wallet.create({
      data: {
        id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        userId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        balance: 1000,
      },
    });
  };

  const makePayee = async (): Promise<void> => {
    await prismaClient.user.create({
      data: {
        id: "3ce586df-e49e-495f-927f-594da350cdd2",
        type: UserTypeORM.COMMON,
        fullName: "Alphonse Elric",
        email: "alphonse.elric@gmail.com",
        cpf: "42185551094",
        password: "f65e3951691846329d8693b326faf153",
      },
    });

    await prismaClient.wallet.create({
      data: {
        id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        userId: "3ce586df-e49e-495f-927f-594da350cdd2",
        balance: 1000,
      },
    });
  };

  it("should transfer", async () => {
    await makePayer();
    await makePayee();

    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    const payerWallet = await prismaClient.wallet.findUnique({ where: { id: "b8c2f320-1d80-4adf-84ca-6120b9b01f94" } });
    const payeeWallet = await prismaClient.wallet.findUnique({ where: { id: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d" } });
    const transaction = await prismaClient.transaction.findFirst({
      where: {
        AND: [
          { payerWalletId: "b8c2f320-1d80-4adf-84ca-6120b9b01f94" },
          { payeeWalletId: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d" },
        ],
      },
    });

    expect(sut.status).toBe(200);
    expect(sut.data).toStrictEqual({
      status: "SUCCESS",
      statusCode: 200,
      statusText: "OK",
      data: {},
    });
    expect(payerWallet?.balance.toNumber()).toBe(875.5);
    expect(payeeWallet?.balance.toNumber()).toBe(1124.5);
    expect(transaction?.value.toNumber()).toBe(124.5);
  });

  it("should fail if payerId is not UUID", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: "123",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The payer ID must be a valid UUID",
        suggestion: "Please check if the payer ID is correct",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payerId is not string", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: 123,
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The payer ID must be string",
        suggestion: "Please check if the payer ID is correct",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payerId is not provided", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The payer ID is required",
        suggestion: "Please provide the payer ID",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payeeId is not string", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: 123,
      value: 124.5,
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The payee ID must be string",
        suggestion: "Please check if the payee ID is correct",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payeeId is not UUID", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "123",
      value: 124.5,
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The payee ID must be a valid UUID",
        suggestion: "Please check if the payee ID is correct",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payeeId is not provided", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      value: 124.5,
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The payee ID is required",
        suggestion: "Please provide the payee ID",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if value is not a number", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: "124.5",
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The value of the transfer must be a number",
        suggestion: "Please check if the value is a number",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if value is not provided", async () => {
    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
    });

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The value of the transfer is required",
        suggestion: "Please provide the value of the transfer",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payer and payee are the same", async () => {
    await makePayer();
    await makePayee();

    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      value: 124.5,
    });

    expect(sut.status).toBe(409);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 409,
      statusText: "CONFLICT",
      error: {
        message: "The payer and payee cannot be the same",
        suggestion: "Please check if the payer and payee IDs are different",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if the payer is a shopkeeper", async () => {
    await makePayer(UserTypeORM.SHOPKEEPER);
    await makePayee();

    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.status).toBe(409);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 409,
      statusText: "CONFLICT",
      error: {
        message: "The payer is a shopkeeper and therefore cannot make transfers",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payer wallet is not found", async () => {
    await makePayee();

    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.status).toBe(404);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 404,
      statusText: "NOT_FOUND",
      error: {
        message: "The payer with the ID 'fa6fb9dd-e67e-4c33-9c72-4a8990785b65' does not exist in our records",
        suggestion: "Please check if the payer ID is correct",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if payee wallet is not found", async () => {
    await makePayer();

    const sut = await axiosInstance.post("/transfer", {
      payerId: "fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
      payeeId: "3ce586df-e49e-495f-927f-594da350cdd2",
      value: 124.5,
    });

    expect(sut.status).toBe(404);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 404,
      statusText: "NOT_FOUND",
      error: {
        message: "The payee with the ID '3ce586df-e49e-495f-927f-594da350cdd2' does not exist in our records",
        suggestion: "Please check if the payee ID is correct",
        path: "/transfer",
        timestamp: expect.any(String),
      },
    });
  });
});
