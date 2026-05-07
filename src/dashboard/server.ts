import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dashboardCss, dashboardHtml, dashboardJs } from "./dashboardAssets";
import {
  loadDashboardSnapshot,
  type ApprovalStatus,
  type DashboardOpportunity,
} from "./dashboardData";
import {
  loadApprovalState,
  markManuallyPosted,
  saveApprovalState,
  updateApprovalState,
  validateApprovalStatus,
} from "./dashboardState";

const defaultPort = 4173;

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

const port = Number(process.env.PORT ?? defaultPort);

server.listen(port, "127.0.0.1", () => {
  console.log(`AAG Distribution Copilot dashboard running at http://127.0.0.1:${port}`);
});

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/") {
      send(response, 200, dashboardHtml, "text/html; charset=utf-8");
      return;
    }

    if (request.method === "GET" && url.pathname === "/dashboard.css") {
      send(response, 200, dashboardCss, "text/css; charset=utf-8");
      return;
    }

    if (request.method === "GET" && url.pathname === "/dashboard.js") {
      send(response, 200, dashboardJs, "text/javascript; charset=utf-8");
      return;
    }

    if (
      request.method === "GET" &&
      (url.pathname === "/api/dashboard" || url.pathname === "/api/snapshot")
    ) {
      const approvalState = loadApprovalState();
      sendJson(response, 200, loadDashboardSnapshot(approvalState));
      return;
    }

    const queueMatch = matchRoute(url.pathname, /^\/api\/opportunities\/([^/]+)\/queue$/);

    if (request.method === "POST" && queueMatch) {
      sendJson(
        response,
        200,
        updateLocalApproval(queueMatch[0], "queued_for_approval", "Queued for approval. No public action was taken."),
      );
      return;
    }

    const approvalMatch = matchRoute(
      url.pathname,
      /^\/api\/approvals\/([^/]+)\/(approve|reject|revise|ignore|escalate|save-draft|mark-posted)$/,
    );

    if (request.method === "POST" && approvalMatch) {
      const [itemId, action] = approvalMatch;

      if (action === "mark-posted") {
        sendJson(response, 200, markLocalPosted(itemId));
        return;
      }

      const mapped = approvalActionToStatus(action);

      sendJson(
        response,
        200,
        updateLocalApproval(itemId, mapped.status, mapped.note),
      );
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/approval-state") {
      const body = await readJsonBody(request);
      const itemId = stringBodyField(body, "itemId");
      const status = stringBodyField(body, "status");
      const note =
        typeof body.note === "string" && body.note.trim() ? body.note : undefined;

      validateApprovalStatus(status);

      const nextState = updateApprovalState(loadApprovalState(), {
        itemId,
        status,
        note: note ?? defaultNoteForStatus(status),
        ...(findOpportunity(itemId) ? { opportunity: findOpportunity(itemId) } : {}),
      });
      const statePath = saveApprovalState(nextState);

      sendJson(response, 200, {
        ok: true,
        statePath: statePath.replace(/\\/g, "/"),
        approvalState: nextState,
      });
      return;
    }

    sendJson(response, 404, {
      error: "Not found",
    });
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function updateLocalApproval(
  itemId: string,
  status: ApprovalStatus,
  note: string,
): Record<string, unknown> {
  const approvalState = loadApprovalState();
  const opportunity = findOpportunity(itemId, approvalState);
  const nextState = updateApprovalState(approvalState, {
    itemId,
    status,
    note,
    ...(opportunity ? { opportunity } : {}),
  });
  const statePath = saveApprovalState(nextState);

  return {
    ok: true,
    itemId,
    status,
    message: note,
    statePath: statePath.replace(/\\/g, "/"),
    snapshot: loadDashboardSnapshot(nextState),
  };
}

function markLocalPosted(itemId: string): Record<string, unknown> {
  const approvalState = loadApprovalState();
  const opportunity = findOpportunity(itemId, approvalState);
  const nextState = markManuallyPosted(approvalState, {
    itemId,
    ...(opportunity ? { opportunity } : {}),
  });
  const statePath = saveApprovalState(nextState);

  return {
    ok: true,
    itemId,
    status: "manually_posted",
    message: "Marked as manually posted. No public action was taken.",
    statePath: statePath.replace(/\\/g, "/"),
    snapshot: loadDashboardSnapshot(nextState),
  };
}

function findOpportunity(
  itemId: string,
  approvalState = loadApprovalState(),
): DashboardOpportunity | undefined {
  const snapshot = loadDashboardSnapshot(approvalState);

  return snapshot.opportunities.find((opportunity) => opportunity.id === itemId);
}

function approvalActionToStatus(action: string): {
  status: ApprovalStatus;
  note: string;
} {
  switch (action) {
    case "approve":
      return {
        status: "approved_for_manual_posting",
        note: "Approved for manual posting. No public action was taken.",
      };
    case "reject":
      return {
        status: "rejected",
        note: "Rejected. No public action was taken.",
      };
    case "revise":
      return {
        status: "needs_revision",
        note: "Revision requested. No public action was taken.",
      };
    case "ignore":
      return {
        status: "ignored",
        note: "Ignored. No public action was taken.",
      };
    case "escalate":
      return {
        status: "escalated",
        note: "Escalated for review. No public action was taken.",
      };
    case "save-draft":
      return {
        status: "saved_draft",
        note: "Draft saved locally. No public action was taken.",
      };
    default:
      throw new Error(`Unsupported approval action: ${action}`);
  }
}

function defaultNoteForStatus(status: ApprovalStatus): string {
  switch (status) {
    case "queued_for_approval":
    case "awaiting_approval":
      return "Queued for approval. No public action was taken.";
    case "approved_for_manual_posting":
      return "Approved for manual posting. No public action was taken.";
    case "rejected":
      return "Rejected. No public action was taken.";
    case "needs_revision":
      return "Revision requested. No public action was taken.";
    case "ignored":
      return "Ignored. No public action was taken.";
    case "escalated":
      return "Escalated for review. No public action was taken.";
    case "saved_draft":
      return "Draft saved locally. No public action was taken.";
    case "manually_posted":
      return "Marked as manually posted. No public action was taken.";
  }
}

function matchRoute(pathname: string, pattern: RegExp): string[] | undefined {
  const match = pathname.match(pattern);

  return match?.slice(1).map((value) => decodeURIComponent(value));
}

function send(
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType: string,
): void {
  response.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  response.end(body);
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  send(response, statusCode, JSON.stringify(body), "application/json; charset=utf-8");
}

function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const parsed = raw ? (JSON.parse(raw) as unknown) : {};

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          reject(new Error("JSON body must be an object."));
          return;
        }

        resolve(parsed as Record<string, unknown>);
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

function stringBodyField(
  body: Record<string, unknown>,
  field: string,
): string {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value;
}
