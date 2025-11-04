# ADR 005: Media storage for MVP

Status: Accepted

## Context

The MVP needs a simple, reliable way to attach images/videos to posts. We are building a local-first app with a single-node backend for MVP.

## Decision

Store media on the local filesystem (or an in-memory reference in tests) and use temporary `storage_ref` URIs for uploads. For posting to X, the worker will stream the file from local storage to the X API.

## Consequences

- Simple to implement and test locally.
- Not suitable for horizontal scale — future work: offload to S3-compatible storage and CDN.
- Security: ensure uploaded files are scanned/validated and access controls applied.

## Related diagrams

- `../diagrams/architecture.mmd` (architecture overview)
- `../diagrams/data-model.mmd` (media entity)
