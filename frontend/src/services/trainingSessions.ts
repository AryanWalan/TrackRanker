import { API_BASE_URL } from "../config/api";
import type { TrainingSession, TrainingSessionInput } from "../types/trainingSession";
import type {
  CreateSessionCompletionRequest,
  SessionCompletion,
  UpdateSessionCompletionRequest,
} from "../types/sessionCompletion";
import type { ConfidenceHistory } from "../types/confidenceHistory";
import type { Progress } from "../types/progress";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = "The request could not be completed.";
    try {
      const problem = await response.json() as {
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };
      const validationMessage = problem.errors
        ? Object.values(problem.errors).flat()[0]
        : undefined;
      message = validationMessage ?? problem.detail ?? problem.title ?? message;
    } catch {
      // Keep the safe generic message when the server did not return JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getTrainingSessions(): Promise<TrainingSession[]> {
  return request<TrainingSession[]>("/api/training-sessions");
}

export function getTrainingSession(id: string): Promise<TrainingSession> {
  return request<TrainingSession>(`/api/training-sessions/${encodeURIComponent(id)}`);
}

export function createTrainingSession(
  input: TrainingSessionInput,
): Promise<TrainingSession> {
  return request<TrainingSession>("/api/training-sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTrainingSession(
  id: string,
  input: TrainingSessionInput,
): Promise<TrainingSession> {
  return request<TrainingSession>(
    `/api/training-sessions/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export function deleteTrainingSession(id: string): Promise<void> {
  return request<void>(`/api/training-sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getSessionCompletion(sessionId: string): Promise<SessionCompletion> {
  return request<SessionCompletion>(
    `/api/training-sessions/${encodeURIComponent(sessionId)}/completion`,
  );
}

export function createSessionCompletion(
  sessionId: string,
  input: CreateSessionCompletionRequest,
): Promise<SessionCompletion> {
  return request<SessionCompletion>(
    `/api/training-sessions/${encodeURIComponent(sessionId)}/completion`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function updateSessionCompletion(
  sessionId: string,
  input: UpdateSessionCompletionRequest,
): Promise<SessionCompletion> {
  return request<SessionCompletion>(
    `/api/training-sessions/${encodeURIComponent(sessionId)}/completion`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export function deleteSessionCompletion(sessionId: string): Promise<void> {
  return request<void>(
    `/api/training-sessions/${encodeURIComponent(sessionId)}/completion`,
    { method: "DELETE" },
  );
}

export function getConfidenceHistory(): Promise<ConfidenceHistory> {
  return request<ConfidenceHistory>("/api/confidence/history");
}

export function getProgress(): Promise<Progress> {
  return request<Progress>("/api/progress");
}
