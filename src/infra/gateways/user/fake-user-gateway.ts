import { UserGateway } from "@application/gateways/user-gateway";

type FakeUser = {
  id: string;
};

export class FakeUserGateway implements UserGateway {
  public fakeUsers: FakeUser[] = [];

  async existsById(id: string): Promise<boolean> {
    return this.fakeUsers.some((user) => user.id === id);
  }
}
