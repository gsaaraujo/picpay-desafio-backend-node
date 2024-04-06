import { HttpResponse, HttpResponseError } from "@infra/http/responses/http-response";

export class BadRequest extends HttpResponse {
  public constructor(error: HttpResponseError) {
    super("ERROR", 400, "BAD_REQUEST", undefined, error);
  }
}
