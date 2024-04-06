import { Entity } from "@shared/helpers/entity";
import { DomainEvent } from "@shared/helpers/domain-event";

type Subscriber = {
  eventName: string;
  handler: (event: DomainEvent) => void;
};

export abstract class AggregateRoot<T> extends Entity<T> {
  private readonly subscribers: Subscriber[] = [];

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  protected notify(event: DomainEvent) {
    for (const subscriber of this.subscribers) {
      if (subscriber.eventName === event.getName()) {
        subscriber.handler(event);
      }
    }
  }
}
