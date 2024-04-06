import { Failure } from "@shared/helpers/failure";
import { ValueObject } from "@shared/helpers/value-object";
import { Either, Left, Right } from "@shared/helpers/either";

type UUIDProps = {
  value: string;
};

export class UUID extends ValueObject<UUIDProps> {
  public static create(props: UUIDProps): Either<Failure, UUID> {
    const uidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    if (!uidPattern.test(props.value)) {
      const failure = new Failure("INVALID_UUID");
      return Left.create(failure);
    }

    const uid = new UUID(props);
    return Right.create(uid);
  }

  public static reconstitute(props: UUIDProps): UUID {
    return new UUID(props);
  }

  public getValue(): string {
    return this.props.value;
  }
}
