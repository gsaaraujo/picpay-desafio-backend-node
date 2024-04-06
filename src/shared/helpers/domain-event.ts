type DomainEventProps = {
  readonly name: string;
  readonly aggregateId: string;
  readonly dateTimeOccurred: Date;
};

export class DomainEvent {
  private readonly props: DomainEventProps;

  public constructor(props: DomainEventProps) {
    this.props = props;
  }

  public getName(): string {
    return this.props.name;
  }

  public getAggregateId(): string {
    return this.props.aggregateId;
  }

  public getDateTimeOccurred(): Date {
    return this.props.dateTimeOccurred;
  }
}
