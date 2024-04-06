import { EventQueueGateway } from "@application/gateways/event-queue-gateway";
import { DomainEvent } from "@shared/helpers/domain-event";

type FakeEvent = {
  eventName: string;
  event: DomainEvent;
};

export class FakeEventQueueGateway implements EventQueueGateway {
  public fakeEvents: FakeEvent[] = [];

  async connect(): Promise<void> {
    //
  }

  async publish(eventName: string, event: DomainEvent): Promise<void> {
    this.fakeEvents.push({ eventName, event });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    //
  }
}
