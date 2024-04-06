export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = props;
  }

  public isEquals(valueObject: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(valueObject.props);
  }
}
