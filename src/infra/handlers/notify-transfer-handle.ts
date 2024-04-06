import { NotifyTransfer } from "@application/services/notify-transfer";
import { EventQueueGateway } from "@application/gateways/event-queue-gateway";

export class NotifyTransferHandle {
  private readonly notifyTransfer: NotifyTransfer;
  private readonly eventQueueGateway: EventQueueGateway;

  public constructor(eventQueueGateway: EventQueueGateway) {
    this.eventQueueGateway = eventQueueGateway;
  }

  async handle(): Promise<unknown> {
    this.eventQueueGateway.subscribe("value_transferred", async () => {
      await this.notifyTransfer.execute();
    });

    return {};
  }
}
