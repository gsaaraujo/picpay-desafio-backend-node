import { Axios } from "axios";
import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { Transfer } from "@application/usecases/transfer";

import { TransferHandler } from "@infra/handlers/transfer-handle";
import { PrismaUserGateway } from "@infra/gateways/user/prisma-user-gateway";
import { RedisCacheGateway } from "@infra/gateways/cache/redis-cache-gateway";
import { AxiosHttpClient } from "@infra/adapters/http-client/axios-http-client";
import { PrismaWalletGateway } from "@infra/gateways/wallet/prisma-wallet-gateway";
import { HttpAuthorizerGateway } from "@infra/gateways/authorizer/http-authorizer-gateway";
import { GetTransactionsByCustomerId } from "@application/usecases/get-transactions-by-customer-id";
import { RabbitMqEventQueueGateway } from "@infra/gateways/event-queue/rabbitmq-event-queue-gateway";
import { PrismaTransactionRepository } from "@infra/repositories/transaction/prisma-transaction-repository";
import { GetTransactionsByCustomerIdHandler } from "@infra/handlers/get-transactions-by-customer-id-handle";
import { NodeEnvironmentVariableGateway } from "@infra/gateways/environment-variable/node-environment-variable-gateway";

@Module({
  imports: [],
  controllers: [TransferHandler, GetTransactionsByCustomerIdHandler],
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
      provide: "NodeEnvironmentVariableGateway",
      useClass: NodeEnvironmentVariableGateway,
    },
    {
      provide: "RedisCacheGateway",
      useFactory: async () => {
        const redisCacheGateway = new RedisCacheGateway();
        await redisCacheGateway.connect();
        return redisCacheGateway;
      },
    },
    {
      provide: "RabbitMqDomainEventQueueGateway",
      inject: ["NodeEnvironmentVariableGateway"],
      useFactory: async (nodeEnvironmentVariableGateway) => {
        const rabbitMqEventQueueGateway = new RabbitMqEventQueueGateway(nodeEnvironmentVariableGateway);
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
    {
      provide: "GetTransactionsByCustomerId",
      inject: ["PrismaClient", "RedisCacheGateway", "PrismaUserGateway"],
      useFactory: (prismaClient, redisCacheGateway, prismaUserGateway) => {
        return new GetTransactionsByCustomerId(prismaClient, redisCacheGateway, prismaUserGateway);
      },
    },
  ],
})
export class AppModule {}
