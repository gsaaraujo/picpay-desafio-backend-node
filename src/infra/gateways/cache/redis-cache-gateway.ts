import { createClient } from "redis";

import { CacheGateway } from "@application/gateways/cache-gateway";

export class RedisCacheGateway implements CacheGateway {
  private client: any;

  async connect(): Promise<void> {
    this.client = await createClient()
      .on("error", () => {})
      .connect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }
}
