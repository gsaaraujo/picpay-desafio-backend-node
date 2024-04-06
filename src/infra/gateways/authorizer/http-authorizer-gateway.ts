import { HttpClient } from "@infra/adapters/http-client/http-client";

import { AuthorizerGateway } from "@application/gateways/authorizer-gateway";

// type AuthorizeResponse = {
//   authorized: boolean;
// };

export class HttpAuthorizerGateway implements AuthorizerGateway {
  private readonly httpClient: HttpClient;

  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public async authorize(): Promise<boolean> {
    // const response = (await this.httpClient.get("/authorize")) as AuthorizeResponse;
    return true;
  }
}
