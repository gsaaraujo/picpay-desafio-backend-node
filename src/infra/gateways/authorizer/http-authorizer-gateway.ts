import { HttpClient } from "@infra/adapters/http-client/http-client";

import { AuthorizerGateway } from "@application/gateways/authorizer-gateway";

type AuthorizeResponse = {
  isAuthorized: boolean;
};

export class HttpAuthorizerGateway implements AuthorizerGateway {
  private readonly httpClient: HttpClient;

  public constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public async authorize(): Promise<boolean> {
    const response = await this.httpClient.get("https://run.mocky.io/v3/b2ac548e-63f0-4164-96cf-c51ea8879993");
    const data = response as AuthorizeResponse;
    return data.isAuthorized;
  }
}
