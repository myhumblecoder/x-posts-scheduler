# ADR 002: LLM integration choice for content generation

Status: Accepted

Context
-------
The product needs LLM-powered generation for drafts and optional image generation. Options include cloud-hosted APIs and local inference engines.

Decision
--------
- Use a local-first approach: prefer a local LLM runtime (e.g., Ollama or local model runtime) for privacy and offline capability. Provide a documented fallback to cloud LLM APIs for environments without local runtimes.

Rationale
---------
- Local models reduce privacy and operational surface for MVP and improve latency in many environments.
- Fallback to cloud lets developers and CI use hosted models when local runtimes aren't available.

Consequences
------------
- Implementation complexity: add a small adapter layer to swap providers.
- Testing: mock LLM outputs in unit tests; provide a local test runner mode that runs without contacting real LLMs.
