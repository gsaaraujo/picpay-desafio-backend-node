import * as promClient from "prom-client";

import { SystemMetrics } from "@infra/adapters/system-metrics/system-metrics";

export class PromClientSystemMetrics implements SystemMetrics {
  async init(): Promise<void> {
    const collectDefaultMetrics = promClient.collectDefaultMetrics;
    collectDefaultMetrics();
  }

  async getMetrics(): Promise<any> {
    return promClient.register.metrics();
  }
}
