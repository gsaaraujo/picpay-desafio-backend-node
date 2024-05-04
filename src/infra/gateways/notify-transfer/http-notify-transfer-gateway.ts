import { TransferNotifierGateway } from "@application/gateways/transfer-notifier-gateway";

import { HttpClient } from "@infra/adapters/http-client/http-client";

export class HttpNotifyTransferGateway implements TransferNotifierGateway {
  private readonly httpClient: HttpClient;

  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async notify(): Promise<void> {
    await this.httpClient.post("https://run.mocky.io/v3/d69923ff-f6fc-4063-8074-a8946b0b627c", {});
  }
}
