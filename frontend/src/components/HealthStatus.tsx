import { useEffect, useState } from "react";
import { getHealth } from "../services/health";

type HealthState =
  | { kind: "loading" }
  | { kind: "connected" }
  | { kind: "error" };

export function HealthStatus() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then(() => setState({ kind: "connected" }))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({ kind: "error" });
        }
      });

    return () => controller.abort();
  }, []);

  if (state.kind === "loading") {
    return <p className="status loading" role="status">Checking connection</p>;
  }

  if (state.kind === "error") {
    return (
      <p className="status error" role="status">
        Connection unavailable
      </p>
    );
  }

  return (
    <p className="status connected" role="status">
      System connected
    </p>
  );
}
