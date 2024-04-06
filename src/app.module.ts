import { Axios } from "axios";
import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { Transfer } from "@application/usecases/transfer";

import { TransferHandler } from "@infra/handlers/transfer-handle";
import { PrismaUserGateway } from "@infra/gateways/user/prisma-user-gateway";
import { PrismaWalletGateway } from "@infra/gateways/wallet/prisma-wallet-gateway";
import { AxiosHttpClient } from "@infra/adapters/http-client/axios-http-client";
import { HttpAuthorizerGateway } from "@infra/gateways/authorizer/http-authorizer-gateway";
import { PrismaTransactionRepository } from "@infra/gateways/transaction/prisma-transaction-repository";
import { RabbitMqEventQueueGateway } from "@infra/adapters/domain-event-queue/rabbitmq-event-queue-gateway";

@Module({
  imports: [],
  controllers: [TransferHandler],
  providers: [
    {
      provide: "PrismaClient",
      useClass: PrismaClient,
    },
    {
      provide: "Axios",
      useClass: Axios,
    },
    {
      provide: "AxiosHttpClient",
      inject: ["Axios"],
      useFactory: (axios) => new AxiosHttpClient(axios),
    },
    {
      provide: "PrismaTransactionRepository",
      inject: ["PrismaClient"],
      useFactory: (prismaClient) => new PrismaTransactionRepository(prismaClient),
    },
    {
      provide: "PrismaUserGateway",
      inject: ["PrismaClient"],
      useFactory: (prismaClient) => new PrismaUserGateway(prismaClient),
    },
    {
      provide: "RabbitMqDomainEventQueueGateway",
      useFactory: async () => {
        const rabbitMqEventQueueGateway = new RabbitMqEventQueueGateway();
        await rabbitMqEventQueueGateway.connect();
        return rabbitMqEventQueueGateway;
      },
    },
    {
      provide: "PrismaWalletGateway",
      inject: ["PrismaClient"],
      useFactory: (prismaClient) => new PrismaWalletGateway(prismaClient),
    },
    {
      provide: "HttpAuthorizerGateway",
      inject: ["AxiosHttpClient"],
      useFactory: (axiosHttpClient) => new HttpAuthorizerGateway(axiosHttpClient),
    },
    {
      provide: "Transfer",
      inject: [
        "PrismaTransactionRepository",
        "PrismaWalletGateway",
        "HttpAuthorizerGateway",
        "RabbitMqDomainEventQueueGateway",
      ],
      useFactory: (
        prismaTransactionRepository,
        prismaWalletGateway,
        httpAuthorizerGateway,
        rabbitMqDomainEventQueueGateway,
      ) => {
        return new Transfer(
          prismaTransactionRepository,
          prismaWalletGateway,
          httpAuthorizerGateway,
          rabbitMqDomainEventQueueGateway,
        );
      },
    },
  ],
})
export class AppModule {}
