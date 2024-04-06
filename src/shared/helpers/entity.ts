import * as crypto from "node:crypto";

import { UUID } from "@shared/domain/models/uuid";

export abstract class Entity<T> {
  protected props: T;
  protected readonly _id: UUID;

  protected constructor(props: T, id?: UUID) {
    this._id = id ?? UUID.reconstitute({ value: crypto.randomUUID() });
    this.props = props;
  }

  public getId(): UUID {
    return this._id;
  }
}
