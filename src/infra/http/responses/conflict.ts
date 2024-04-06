import { HttpResponse, HttpResponseError } from "@infra/http/responses/http-response";

export class Conflict extends HttpResponse {
  public constructor(error: HttpResponseError) {
    super("ERROR", 409, "CONFLICT", undefined, error);
  }
}
