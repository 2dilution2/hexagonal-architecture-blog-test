import { FastifyRequest, FastifyReply, FastifyError } from "fastify";

export interface StandardError {
  type: string;
  title: string;
  detail: string;
  statusCode: number;
}

export function standardizeError(error: Error | FastifyError): StandardError {
  // Fastify 검증 에러
  if ("validation" in error) {
    return {
      type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
      title: "Validation Error",
      detail: error.message || "Invalid request",
      statusCode: 400,
    };
  }

  // 비즈니스 로직 에러
  const message = error.message || "Internal Server Error";
  const statusCode = getStatusCodeFromMessage(message);

  return {
    type: "about:blank",
    title: getTitleFromStatusCode(statusCode),
    detail: message,
    statusCode,
  };
}

function getStatusCodeFromMessage(message: string): number {
  if (message.includes("USER_ALREADY_EXISTS") || message.includes("EMAIL_ALREADY_EXISTS")) {
    return 409;
  }
  if (message.includes("INVALID_CREDENTIALS") || message.includes("INVALID_REFRESH_TOKEN")) {
    return 401;
  }
  if (message.includes("USER_NOT_FOUND") || message.includes("NOT_FOUND")) {
    return 404;
  }
  if (message.includes("FORBIDDEN") || message.includes("권한")) {
    return 403;
  }
  if (message.includes("VALIDATION") || message.includes("Invalid")) {
    return 400;
  }
  return 500;
}

function getTitleFromStatusCode(statusCode: number): string {
  const titles: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Internal Server Error",
  };
  return titles[statusCode] || "Error";
}

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const standardized = standardizeError(error);
  reply.code(standardized.statusCode).send({
    type: standardized.type,
    title: standardized.title,
    detail: standardized.detail,
  });
}
