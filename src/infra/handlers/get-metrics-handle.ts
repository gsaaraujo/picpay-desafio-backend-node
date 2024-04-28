import { Controller, Get, Inject } from "@nestjs/common";

import { PromClientSystemMetrics } from "@infra/adapters/system-metrics/prom-client-system-metrics";

@Controller()
export class GetMetricsHandler {
  private readonly promClientSystemMetricsGateway: PromClientSystemMetrics;

  public constructor(
    @Inject("PromClientSystemMetrics")
    promClientSystemMetricsGateway: PromClientSystemMetrics,
  ) {
    this.promClientSystemMetricsGateway = promClientSystemMetricsGateway;
  }

  @Get("/metrics")
  async handle() {
    return this.promClientSystemMetricsGateway.getMetrics();
  }
}
