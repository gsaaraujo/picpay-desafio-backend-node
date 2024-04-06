import { DomainEvent } from "@shared/helpers/domain-event";

export interface EventQueueGateway {
  connect(): Promise<void>;
  publish(eventName: string, event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void>;
}
