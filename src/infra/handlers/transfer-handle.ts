import { Body, Controller, HttpCode, HttpException, HttpStatus, Inject, Post } from "@nestjs/common";

import { Ok } from "@infra/http/responses/ok";
import { Conflict } from "@infra/http/responses/conflict";
import { NotFound } from "@infra/http/responses/not-found";

import { Transfer } from "@application/usecases/transfer";
import { BadRequest } from "@infra/http/responses/bad-request";
import { InternalServerError } from "@infra/http/responses/internal-server-error";

type Input = {
  payerId: string;
  payeeId: string;
  value: number;
};

@Controller()
export class TransferHandler {
  private readonly transfer: Transfer;

  public constructor(
    @Inject("Transfer")
    transfer: Transfer,
  ) {
    this.transfer = transfer;
  }

  @HttpCode(200)
  @Post("transfer")
  async handle(@Body() input: Input): Promise<unknown> {
    const transfer = await this.transfer.execute({
      payerId: input.payerId,
      payeeId: input.payeeId,
      value: input.value,
    });

    if (transfer.isRight()) {
      return new Ok({});
    }

    switch (transfer.getValue().getMessage()) {
      case "PAYER_WALLET_NOT_FOUND":
        throw new HttpException(
          new NotFound({
            message: `The payer with the ID '${input.payerId}' does not exist in our records`,
            suggestion: "Please check if the payer ID is correct",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.NOT_FOUND,
        );
      case "PAYEE_WALLET_NOT_FOUND":
        throw new HttpException(
          new NotFound({
            message: `The payee with the ID '${input.payeeId}' does not exist in our records`,
            suggestion: "Please check if the payee ID is correct",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.NOT_FOUND,
        );
      case "UNAUTHORIZED_TRANSFER":
        throw new HttpException(
          new Conflict({
            message: "The transaction could not be authorized",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.CONFLICT,
        );
      case "PAYER_AND_PAYEE_ARE_THE_SAME":
        throw new HttpException(
          new Conflict({
            message: "The payer and payee cannot be the same",
            suggestion: "Please check if the payer and payee IDs are different",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.CONFLICT,
        );
      case "SHOPKEEPERS_CANNOT_MAKE_TRANSFERS":
        throw new HttpException(
          new Conflict({
            message: "The payer is a shopkeeper and therefore cannot make transfers",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.CONFLICT,
        );
      case "PAYER_ID_MUST_BE_STRING":
        throw new HttpException(
          new BadRequest({
            message: "The payer ID must be string",
            suggestion: "Please check if the payer ID is correct",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "PAYER_ID_MUST_BE_UUID":
        throw new HttpException(
          new BadRequest({
            message: "The payer ID must be a valid UUID",
            suggestion: "Please check if the payer ID is correct",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "PAYER_ID_IS_REQUIRED":
        throw new HttpException(
          new BadRequest({
            message: "The payer ID is required",
            suggestion: "Please provide the payer ID",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "PAYEE_ID_MUST_BE_STRING":
        throw new HttpException(
          new BadRequest({
            message: "The payee ID must be string",
            suggestion: "Please check if the payee ID is correct",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "PAYEE_ID_MUST_BE_UUID":
        throw new HttpException(
          new BadRequest({
            message: "The payee ID must be a valid UUID",
            suggestion: "Please check if the payee ID is correct",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "PAYEE_ID_IS_REQUIRED":
        throw new HttpException(
          new BadRequest({
            message: "The payee ID is required",
            suggestion: "Please provide the payee ID",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "VALUE_MUST_BE_NUMBER":
        throw new HttpException(
          new BadRequest({
            message: "The value of the transfer must be a number",
            suggestion: "Please check if the value is a number",
            path: "/transfer",
            timestamp: new Date().toISOString(),
          }),
          HttpStatus.BAD_REQUEST,
        );
      case "VALUE_IS_REQUIRED":
        throw new HttpException(
          new BadRequest({
            message: "The value of the transfer is required",
            suggestion: "Please provide the value of the transfer",
            path: "/transfer",
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
