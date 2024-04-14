import { EnvironmentVariableGateway } from "@application/gateways/environment-variable-gateway";

export class NodeEnvironmentVariableGateway implements EnvironmentVariableGateway {
  async get(key: string): Promise<string | null> {
    return process.env[key] ?? null;
  }
}
