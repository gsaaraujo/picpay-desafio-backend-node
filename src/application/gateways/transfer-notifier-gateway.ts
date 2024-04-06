export interface TransferNotifierGateway {
  notify(): Promise<void>;
}
