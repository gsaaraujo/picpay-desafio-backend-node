export interface AuthorizerGateway {
  authorize(): Promise<boolean>;
}
