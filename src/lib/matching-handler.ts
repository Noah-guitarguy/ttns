import { findCareerMatches } from "./matching-algo";
import type { CareerMatch } from "../types/outcomes";

interface MatchResponse {
  matches: CareerMatch[];
}

const MAX_BODY_CHARS = 100_000;

function errorResponse(status: 400 | 500, error: string): Response {
  return Response.json({ error }, { status });
}

export async function handleMatchRequest(
  request: Request,
): Promise<Response> {
  let text: string;
  try {
    text = await request.text();
  } catch {
    return errorResponse(400, "Request body could not be read.");
  }

  if (text.length > MAX_BODY_CHARS) {
    return errorResponse(400, "Request body is too large.");
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("skills" in body) ||
    !Array.isArray(body.skills) ||
    body.skills.length === 0 ||
    body.skills.some((skill) => typeof skill !== "string" || skill.trim() === "")
  ) {
    return errorResponse(
      400,
      'Invalid request. "skills" must be a non-empty array of strings.',
    );
  }

  try {
    const response: MatchResponse = {
      matches: findCareerMatches(body.skills),
    };
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error(
      "[api/match] unexpected failure:",
      error instanceof Error ? error.name : typeof error,
    );
    return errorResponse(500, "Career matches could not be generated.");
  }
}
