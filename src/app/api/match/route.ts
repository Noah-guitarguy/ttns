// POST /api/match
// body: { skills: string[] }
// 200: { matches: CareerMatch[] }
// 400: { error: string }

import { handleMatchRequest } from "../../../lib/matching-handler";

export async function POST(request: Request): Promise<Response> {
  return handleMatchRequest(request);
}
