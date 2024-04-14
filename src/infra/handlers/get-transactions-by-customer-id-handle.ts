import { Controller, Get, HttpException, HttpStatus, Inject, Param } from "@nestjs/common";

import { Ok } from "@infra/http/responses/ok";
import { NotFound } from "@infra/http/responses/not-found";
import { BadRequest } from "@infra/http/responses/bad-request";
import { InternalServerError } from "@infra/http/responses/internal-server-error";

import { GetTransactionsByCustomerId } from "@application/usecases/get-transactions-by-customer-id";

@Controller()
export class GetTransactionsByCustomerIdHandler {
  private readonly getTransactionsByCustomerId: GetTransactionsByCustomerId;

  public constructor(
    @Inject("GetTransactionsByCustomerId")
    getTransactionsByCustomerId: GetTransactionsByCustomerId,
  ) {
    this.getTransactionsByCustomerId = getTransactionsByCustomerId;
  }

  @Get("/transactions/customers/:customerId")
  async handle(@Param("customerId") customerId: string): Promise<unknown> {
    const getTransactionsOrFailure = await this.getTransactionsByCustomerId.execute({
      customerId,
    });

    if (getTransactionsOrFailure.isRight()) {
      return new Ok(getTransactionsOrFailure.getValue());
    }

    switch (getTransactionsOrFailure.getValue().getMessage()) {
      case "CUSTOMER_NOT_FOUND":
        throw new HttpException(
          new NotFound({
            message: `The customer with the ID '${customerId}' does not exist in our records`,
            suggestion: "Please check if the customer ID is correct",
            path: `/transactions/customers/${customerId}`,
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.NOT_FOUND,
        );
      case "CUSTOMER_ID_MUST_BE_UUID":
        throw new HttpException(
          new BadRequest({
            message: "The customer ID must be a valid UUID",
            suggestion: "Please check if the customer ID is correct",
            path: `/transactions/customers/${customerId}`,
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      default:
        throw new HttpException(
          new InternalServerError({
            message: "An unexpected error occurred",
            suggestion: "Please try again later",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
