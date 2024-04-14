export interface EnvironmentVariableGateway {
  get(key: string): Promise<string | null>;
}
