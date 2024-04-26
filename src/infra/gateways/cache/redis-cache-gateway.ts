import { createClient } from "redis";

import { CacheGateway } from "@application/gateways/cache-gateway";
import { EnvironmentVariableGateway } from "@application/gateways/environment-variable-gateway";

export class RedisCacheGateway implements CacheGateway {
  private client: any;
  private environmentVariableGateway: EnvironmentVariableGateway;

  public constructor(environmentVariableGateway: EnvironmentVariableGateway) {
    this.environmentVariableGateway = environmentVariableGateway;
  }

  async connect(): Promise<void> {
    const redisUrl = await this.environmentVariableGateway.get("REDIS_URL");

    if (!redisUrl) {
      throw new Error("Redis URL not found");
    }

    this.client = await createClient({ url: redisUrl })
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
