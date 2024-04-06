import { Axios } from "axios";

import { HttpClient } from "@infra/adapters/http-client/http-client";

export class AxiosHttpClient implements HttpClient {
  private readonly axios: Axios;

  public constructor(axios: Axios) {
    this.axios = axios;
  }

  async get(url: string): Promise<unknown> {
    const response = await this.axios.get(url);
    return response.data;
  }

  async post(url: string, body: unknown): Promise<unknown> {
    const response = await this.axios.post(url, body);
    return response.data;
  }

  async put(url: string, body: unknown): Promise<unknown> {
    const response = await this.axios.put(url, body);
    return response.data;
  }

  async patch(url: string, body: unknown): Promise<unknown> {
    const response = await this.axios.patch(url, body);
    return response.data;
  }

  async delete(url: string): Promise<unknown> {
    const response = await this.axios.delete(url);
    return response.data;
  }
}
