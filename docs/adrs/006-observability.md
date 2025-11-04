# ADR 006 — Observability (logging, metrics, alerts)

Status: Proposed

## Context

To operate the scheduler and posting service in production we need basic observability: logs, metrics, and alerts for failure modes (failed posts, OAuth errors, worker stalls, rate-limit errors).

## Decision

- Logs: structured JSON logs with timestamps and a request/post identifier. For the MVP, logs can be written to stdout and captured by the platform (e.g., Vercel/Render). For production, forward logs to a central aggregator (e.g., Logflare, Datadog, or an ELK stack).
- Metrics: expose a Prometheus-compatible metrics endpoint for worker throughput, retry counts, success/failure rates, queue depth, and scheduled jobs processed per minute.
- Tracing: instrument critical paths (posting worker and OAuth token refreshes) with simple tracing (OpenTelemetry) if supported by the host.
- Alerts: configure alerts for repeated failed posting attempts (error rate), worker backlog growth (queue depth thresholds), and rate-limit throttling from the X API.

## Consequences

- Adding observability improves operational readiness but requires the team to pick and maintain specific tooling. For many small teams, starting with logs + Prometheus metrics + PagerDuty/Slack alert integration is sufficient.

## Implementation notes

- Add a lightweight metrics exporter (e.g., prom-client for Node) and expose `/metrics` for scraping.
- Use structured logging libraries (pino or bunyan) for consistent JSON logs.
- Deploy alert rules in your monitoring platform to catch the high-priority symptoms listed above.
