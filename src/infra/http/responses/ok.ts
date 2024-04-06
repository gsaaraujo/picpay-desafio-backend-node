import { HttpResponse } from "@infra/http/responses/http-response";

export class Ok extends HttpResponse {
  public constructor(data: unknown) {
    super("SUCCESS", 200, "OK", data);
  }
}
