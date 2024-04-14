import axios, { AxiosInstance } from "axios";
import { describe, it, beforeAll, beforeEach, expect } from "vitest";
import { PrismaClient, UserType as UserTypeORM } from "@prisma/client";

describe("get-transactions-by-customer-id", () => {
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

  it("should get transactions", async () => {
    await makePayer();
    await makePayee();
    await prismaClient.transaction.create({
      data: {
        id: "a65ed7af-4afb-4146-b64f-1e36bcfc8a3b",
        value: 100,
        payerWalletId: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
        payeeWalletId: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
      },
    });

    const sut = await axiosInstance.get("/transactions/customers/fa6fb9dd-e67e-4c33-9c72-4a8990785b65");

    expect(sut.status).toBe(200);
    expect(sut.data).toStrictEqual({
      status: "SUCCESS",
      statusCode: 200,
      statusText: "OK",
      data: [
        {
          id: "a65ed7af-4afb-4146-b64f-1e36bcfc8a3b",
          value: 100,
          payerWalletId: "b8c2f320-1d80-4adf-84ca-6120b9b01f94",
          payeeWalletId: "f8b1f0f5-0b4b-4b3f-8e9c-0e3e4d9d1d1d",
        },
      ],
    });
  });

  it("should fail if customer is not found", async () => {
    const sut = await axiosInstance.get("/transactions/customers/fa6fb9dd-e67e-4c33-9c72-4a8990785b65");

    expect(sut.status).toBe(404);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 404,
      statusText: "NOT_FOUND",
      error: {
        message: "The customer with the ID 'fa6fb9dd-e67e-4c33-9c72-4a8990785b65' does not exist in our records",
        suggestion: "Please check if the customer ID is correct",
        path: "/transactions/customers/fa6fb9dd-e67e-4c33-9c72-4a8990785b65",
        timestamp: expect.any(String),
      },
    });
  });

  it("should fail if customerId is not UUID", async () => {
    const sut = await axiosInstance.get("/transactions/customers/abc");

    expect(sut.status).toBe(400);
    expect(sut.data).toStrictEqual({
      status: "ERROR",
      statusCode: 400,
      statusText: "BAD_REQUEST",
      error: {
        message: "The customer ID must be a valid UUID",
        suggestion: "Please check if the customer ID is correct",
        path: "/transactions/customers/abc",
        timestamp: expect.any(String),
      },
    });
  });
});
