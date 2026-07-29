import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "../services/health";

type HealthState =
  | { kind: "loading" }
  | { kind: "connected"; health: HealthResponse }
  | { kind: "error" };

export function HealthStatus() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then((health) => setState({ kind: "connected", health }))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({ kind: "error" });
        }
      });

    return () => controller.abort();
  }, []);

  if (state.kind === "loading") {
    return <p className="status loading" role="status">Checking backend connection…</p>;
  }

  if (state.kind === "error") {
    return (
      <p className="status error" role="status">
        Backend unavailable. Start the API and try again.
      </p>
    );
  }

  return (
    <p className="status connected" role="status">
      Backend connected: {state.health.application}
    </p>
  );
}
