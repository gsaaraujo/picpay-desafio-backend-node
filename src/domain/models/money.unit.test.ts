/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it } from "vitest";

import { Money } from "@domain/models/money";

import { Failure } from "@shared/helpers/failure";

describe("money", () => {
  it("should create and reconstitute money", () => {
    const money1 = Money.reconstitute({ value: 44.5 });
    const money2 = Money.reconstitute({ value: 174.93 });
    const money3 = Money.reconstitute({ value: 0.32 });

    const sut1 = Money.create({ value: 44.5 });
    const sut2 = Money.create({ value: 174.92999999999998 });
    const sut3 = Money.create({ value: 0.32111111 });

    expect((sut1.getValue() as Money).isEquals(money1)).toBeTruthy();
    expect((sut2.getValue() as Money).isEquals(money2)).toBeTruthy();
    expect((sut3.getValue() as Money).isEquals(money3)).toBeTruthy();
  });

  it("should fail if money is negative", () => {
    const failure = new Failure("MONEY_CANNOT_BE_NEGATIVE");

    const sut = Money.create({ value: -1 });

    expect(sut.getValue()).toStrictEqual(failure);
  });

  it("should fail if money is not number", () => {
    const failure = new Failure("MONEY_MUST_BE_NUMBER");

    const sut1 = Money.create({ value: "1" as any });

    expect(sut1.getValue()).toStrictEqual(failure);
  });
});
