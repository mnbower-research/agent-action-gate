/// <reference types="node" />

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { evaluateAction } from "./actionGate/evaluateAction";
import { logDecision } from "./actionGate/logging/decisionLogger";
import type { ActionGateInput } from "./actionGate/types";

const serviceName = "agent-action-gate";
const defaultPort = 3333;
const maxBodyBytes = 1_000_000;

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/health") {
    handleHealth(request, response);
    return;
  }

  if (url.pathname === "/evaluate") {
    await handleEvaluate(request, response);
    return;
  }

  sendJson(response, 404, {
    error: "not_found",
    message: `No route found for ${url.pathname}.`,
  });
});

server.listen(getPort(), () => {
  const address = server.address();
  const port =
    typeof address === "object" && address !== null ? address.port : getPort();

  console.log(`${serviceName} listening on http://localhost:${port}`);
  console.log("Routes: GET /health, POST /evaluate");
});

function handleHealth(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  if (request.method !== "GET") {
    sendMethodNotAllowed(response, ["GET"]);
    return;
  }

  sendJson(response, 200, {
    ok: true,
    service: serviceName,
  });
}

async function handleEvaluate(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, ["POST"]);
    return;
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(await readRequestBody(request));
  } catch (error) {
    sendJson(response, 400, {
      error: "invalid_json",
      message:
        error instanceof BodyTooLargeError
          ? error.message
          : "Request body must be valid JSON.",
    });
    return;
  }

  if (!isActionGateInput(parsedBody)) {
    sendJson(response, 400, {
      error: "invalid_request_shape",
      message:
        "Request body must include userRequest and proposedAction with tool and actionType.",
    });
    return;
  }

  const result = evaluateAction(parsedBody);

  try {
    logDecision(parsedBody, result);
  } catch (error) {
    console.warn("Failed to write Agent Action Gate decision log.", error);
  }

  sendJson(response, 200, result);
}

async function readRequestBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let bytesRead = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytesRead += buffer.byteLength;

    if (bytesRead > maxBodyBytes) {
      throw new BodyTooLargeError(
        `Request body must be ${maxBodyBytes} bytes or less.`,
      );
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function isActionGateInput(value: unknown): value is ActionGateInput {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.userRequest !== "string") {
    return false;
  }

  if (!isRecord(value.proposedAction)) {
    return false;
  }

  return (
    typeof value.proposedAction.tool === "string" &&
    typeof value.proposedAction.actionType === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendMethodNotAllowed(
  response: ServerResponse,
  allowedMethods: string[],
): void {
  response.setHeader("Allow", allowedMethods.join(", "));
  sendJson(response, 405, {
    error: "method_not_allowed",
    message: `Use ${allowedMethods.join(" or ")} for this route.`,
  });
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function getPort(): number {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return defaultPort;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    console.warn(
      `Invalid PORT value "${rawPort}", falling back to ${defaultPort}.`,
    );
    return defaultPort;
  }

  return port;
}

class BodyTooLargeError extends Error {}
