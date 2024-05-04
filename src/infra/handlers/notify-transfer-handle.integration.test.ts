import * as amqplib from "amqplib";
import { expect, it, beforeAll, describe, beforeEach } from "vitest";
import { PrismaClient, UserType as UserTypeORM } from "@prisma/client";

import { ValueTransferred } from "@domain/events/value-transferred";

describe("notify-transfer-handle", () => {
  let channel: amqplib.Channel;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
    const connection = await amqplib.connect(process.env.RABBITMQ_URL ?? "");
    channel = await connection.createChannel();
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

  it("should trigger the notify transfer through a event in queue", async () => {
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
    const valueTransferred = new ValueTransferred({
      name: "value_transferred",
      aggregateId: "a65ed7af-4afb-4146-b64f-1e36bcfc8a3b",
      dateTimeOccurred: new Date(),
    });

    channel.sendToQueue("value_transferred", Buffer.from(JSON.stringify(valueTransferred)), { persistent: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const messages = await channel.assertQueue("value_transferred");

    expect(messages.messageCount).toBe(0);
  });
});
