export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  private readonly value: L;

  public constructor(value: L) {
    this.value = value;
  }

  static create = <L, R>(l: L): Either<L, R> => {
    return new Left<L, R>(l);
  };

  public isLeft(): this is Left<L, R> {
    return true;
  }

  public isRight(): this is Right<L, R> {
    return false;
  }

  public getValue(): L {
    return this.value;
  }
}

export class Right<L, R> {
  private readonly value: R;

  public constructor(value: R) {
    this.value = value;
  }

  static create = <L, R>(r: R): Either<L, R> => {
    return new Right<L, R>(r);
  };

  public isLeft(): this is Left<L, R> {
    return false;
  }

  public isRight(): this is Right<L, R> {
    return true;
  }

  public getValue(): R {
    return this.value;
  }
}
