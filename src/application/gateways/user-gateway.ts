export interface UserGateway {
  existsById(id: string): Promise<boolean>;
}
