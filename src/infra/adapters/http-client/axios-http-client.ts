import axios from "axios";

import { HttpClient } from "@infra/adapters/http-client/http-client";

export class AxiosHttpClient implements HttpClient {
  async get(url: string): Promise<unknown> {
    const response = await axios.get(url);
    return response.data;
  }

  async post(url: string, body: unknown): Promise<unknown> {
    const response = await axios.post(url, body);
    return response.data;
  }

  async put(url: string, body: unknown): Promise<unknown> {
    const response = await axios.put(url, body);
    return response.data;
  }

  async patch(url: string, body: unknown): Promise<unknown> {
    const response = await axios.patch(url, body);
    return response.data;
  }

  async delete(url: string): Promise<unknown> {
    const response = await axios.delete(url);
    return response.data;
  }
}
