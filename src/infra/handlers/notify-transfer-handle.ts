import { NotifyTransfer } from "@application/services/notify-transfer";
import { EventQueueGateway } from "@application/gateways/event-queue-gateway";

export class NotifyTransferHandle {
  private readonly notifyTransfer: NotifyTransfer;
  private readonly eventQueueGateway: EventQueueGateway;

  public constructor(notifyTransfer: NotifyTransfer, eventQueueGateway: EventQueueGateway) {
    this.notifyTransfer = notifyTransfer;
    this.eventQueueGateway = eventQueueGateway;
  }

  async handle(): Promise<void> {
    await this.eventQueueGateway.subscribe("value_transferred", async () => {
      await this.notifyTransfer.execute();
    });
  }
}
