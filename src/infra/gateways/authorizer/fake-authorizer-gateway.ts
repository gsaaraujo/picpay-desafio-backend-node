import { AuthorizerGateway } from "@application/gateways/authorizer-gateway";

export class FakeAuthorizerGateway implements AuthorizerGateway {
  public isAuthorized = false;

  async authorize(): Promise<boolean> {
    return this.isAuthorized;
  }
}
