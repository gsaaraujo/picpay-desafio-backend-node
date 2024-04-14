import * as amqplib from "amqplib";

import { DomainEvent } from "@shared/helpers/domain-event";

import { EventQueueGateway } from "@application/gateways/event-queue-gateway";
import { EnvironmentVariableGateway } from "@application/gateways/environment-variable-gateway";

export class RabbitMqEventQueueGateway implements EventQueueGateway {
  private channel: amqplib.Channel;
  private environmentVariableGateway: EnvironmentVariableGateway;

  public constructor(environmentVariableGateway: EnvironmentVariableGateway) {
    this.environmentVariableGateway = environmentVariableGateway;
  }

  async connect(): Promise<void> {
    const rabbitMqUrl = await this.environmentVariableGateway.get("RABBITMQ_URL");

    if (!rabbitMqUrl) {
      throw new Error("RabbitMQ URL not found");
    }

    const connection = await amqplib.connect(rabbitMqUrl);
    this.channel = await connection.createChannel();
  }

  async publish(eventName: string, event: DomainEvent): Promise<void> {
    await this.channel.assertQueue(eventName, { durable: true });
    this.channel.sendToQueue(eventName, Buffer.from(JSON.stringify(event)), { persistent: true });
  }

  async subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    await this.channel.assertQueue(eventName, { durable: true });
    await this.channel.consume(eventName, async (message) => {
      if (!message) return;

      await handler(JSON.parse(message.content.toString()));
      this.channel.ack(message);
    });
  }
}
