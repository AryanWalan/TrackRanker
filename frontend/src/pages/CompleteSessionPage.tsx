import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SessionCompletionForm } from "../components/SessionCompletionForm";
import {
  ApiError,
  createSessionCompletion,
  getProgress,
  getSessionCompletion,
  getTrainingSession,
  updateSessionCompletion,
} from "../services/trainingSessions";
import type { SessionCompletion } from "../types/sessionCompletion";
import type { CompletionProgressFeedback } from "../types/completionProgressFeedback";
import type { Progress } from "../types/progress";
import type { TrainingSession } from "../types/trainingSession";

export function CompleteSessionPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [completion, setCompletion] = useState<SessionCompletion | null | undefined>();
  const [error, setError] = useState(false);

  useEffect(() => {
    getTrainingSession(id).then(setSession).catch(() => setError(true));
    getSessionCompletion(id)
      .then(setCompletion)
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.status === 404) {
          setCompletion(null);
        } else {
          setError(true);
        }
      });
  }, [id]);

  if (error) {
    return (
      <div className="state-panel error-panel">
        <h1>Completed session could not be loaded</h1>
        <Link className="button secondary" to={`/sessions/${id}`}>Back to Session</Link>
      </div>
    );
  }

  if (!session || completion === undefined) {
    return <p className="state-panel" role="status">Loading completed session…</p>;
  }

  return (
    <section className="form-page">
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">{completion ? "Update outcome" : "Record outcome"}</p>
          <h1>{completion ? "Edit completed session" : "Log completed session"}</h1>
          <p>{session.title}: keep the planned work separate from what actually happened.</p>
        </div>
      </div>
      <SessionCompletionForm
        initialValue={completion ?? undefined}
        submitLabel={completion ? "Save completed session" : "Log completed session"}
        cancelTo={`/sessions/${id}`}
        onSubmit={async (input) => {
          const previousProgress: Progress | null = await getProgress()
            .catch(() => null);
          if (completion) {
            await updateSessionCompletion(id, input);
          } else {
            await createSessionCompletion(id, input);
          }

          const currentProgress: Progress | null = await getProgress()
            .catch(() => null);
          const newlyUnlockedAchievements = previousProgress && currentProgress
            ? currentProgress.achievements.filter((achievement) =>
                achievement.isUnlocked
                && !previousProgress.achievements.some(
                  (previous) => previous.id === achievement.id && previous.isUnlocked,
                ))
            : [];
          const feedback: CompletionProgressFeedback = {
            xpChange: previousProgress && currentProgress
              ? currentProgress.totalXp - previousProgress.totalXp
              : null,
            currentProgress,
            rankIncreased: Boolean(
              previousProgress
              && currentProgress
              && currentProgress.trackRank > previousProgress.trackRank,
            ),
            newlyUnlockedAchievements,
          };

          navigate(`/sessions/${id}`, { state: { progressFeedback: feedback } });
        }}
      />
    </section>
  );
}
