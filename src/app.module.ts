import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { Transfer } from "@application/usecases/transfer";

import { TransferHandler } from "@infra/handlers/transfer-handle";
import { NotifyTransfer } from "@application/services/notify-transfer";
import { GetMetricsHandler } from "@infra/handlers/get-metrics-handle";
import { PrismaUserGateway } from "@infra/gateways/user/prisma-user-gateway";
import { NotifyTransferHandle } from "@infra/handlers/notify-transfer-handle";
import { AxiosHttpClient } from "@infra/adapters/http-client/axios-http-client";
import { PrismaWalletGateway } from "@infra/gateways/wallet/prisma-wallet-gateway";
import { HttpAuthorizerGateway } from "@infra/gateways/authorizer/http-authorizer-gateway";
import { GetTransactionsByCustomerId } from "@application/usecases/get-transactions-by-customer-id";
import { PromClientSystemMetrics } from "@infra/adapters/system-metrics/prom-client-system-metrics";
import { RabbitMqEventQueueGateway } from "@infra/gateways/event-queue/rabbitmq-event-queue-gateway";
import { HttpNotifyTransferGateway } from "@infra/gateways/notify-transfer/http-notify-transfer-gateway";
import { PrismaTransactionRepository } from "@infra/repositories/transaction/prisma-transaction-repository";
import { GetTransactionsByCustomerIdHandler } from "@infra/handlers/get-transactions-by-customer-id-handle";
import { NodeEnvironmentVariableGateway } from "@infra/gateways/environment-variable/node-environment-variable-gateway";

@Module({
  imports: [],
  controllers: [GetMetricsHandler, GetTransactionsByCustomerIdHandler, TransferHandler],
  providers: [
    {
      provide: "PrismaClient",
      useClass: PrismaClient,
    },
    {
      provide: "AxiosHttpClient",
      useClass: AxiosHttpClient,
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
      provide: "PromClientSystemMetrics",
      useFactory: async () => {
        const promClientSystemMetrics = new PromClientSystemMetrics();
        await promClientSystemMetrics.init();
        return promClientSystemMetrics;
      },
    },
    {
      provide: "RabbitMqEventQueueGateway",
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
      provide: "HttpNotifyTransferGateway",
      inject: ["AxiosHttpClient"],
      useFactory: (axiosHttpClient) => new HttpNotifyTransferGateway(axiosHttpClient),
    },
    {
      provide: "Transfer",
      inject: [
        "PrismaTransactionRepository",
        "PrismaWalletGateway",
        "HttpAuthorizerGateway",
        "RabbitMqEventQueueGateway",
      ],
      useFactory: (
        prismaTransactionRepository,
        prismaWalletGateway,
        httpAuthorizerGateway,
        rabbitMqEventQueueGateway,
      ) => {
        return new Transfer(
          prismaTransactionRepository,
          prismaWalletGateway,
          httpAuthorizerGateway,
          rabbitMqEventQueueGateway,
        );
      },
    },
    {
      provide: "GetTransactionsByCustomerId",
      inject: ["PrismaClient"],
      useFactory: (prismaClient) => {
        return new GetTransactionsByCustomerId(prismaClient);
      },
    },
    {
      provide: "NotifyTransfer",
      inject: ["HttpNotifyTransferGateway"],
      useFactory: (httpNotifyTransferGateway) => {
        return new NotifyTransfer(httpNotifyTransferGateway);
      },
    },
    {
      provide: "NotifyTransferHandle",
      inject: ["NotifyTransfer", "RabbitMqEventQueueGateway"],
      useFactory: (notifyTransfer, rabbitMqEventQueueGateway) => {
        const notifyTransferHandle = new NotifyTransferHandle(notifyTransfer, rabbitMqEventQueueGateway);
        notifyTransferHandle.handle();
        return notifyTransferHandle;
      },
    },
  ],
})
export class AppModule {}
