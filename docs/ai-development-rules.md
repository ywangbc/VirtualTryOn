You must follow the rules below.

# Principles

Do what is right for the long term. Do what is right for the long term. Do what is right for the long term.

* Think long-term and optimize for maintainability. New changes should reduce future development costs. Do not introduce technical debt.
* Be vigilant about code that may create architectural forks or divergent patterns. Follow best practices and maintain a unified architecture.
* Maintain a Single Source of Truth (SSOT). There should be exactly one authoritative write path; everything else should be derived from or reuse that source.
* Solve structural problems through refactoring. Do not work around them with patches or special cases.
* Follow the best practical and modern engineering practices.
* Actively use mature third-party libraries to solve problems instead of reinventing the wheel.
* Prioritize reading code over writing code. First look for existing code within the project that can be reused or extended.
* Prefer iterative replacement over additive changes. After rewriting or refactoring something, remove the old implementation.
* Follow the KISS principle. Choose the shortest implementation path that is also the best long-term solution. If the architecture itself causes redundancy, simplify the architecture.
* Use strong typing to an appropriate degree. The same type or concept should also have a single authoritative type definition.
* Do not do things that merely create the appearance of solving a problem. Solutions must work in reality.
* Do not optimize for human coding effort. AI coding is not human coding; always choose the best solution rather than the solution requiring the least implementation effort.
* Build deeply encapsulated components. Keep complexity inside the component and expose only the minimal necessary lifecycle operations and APIs. Design with the caller's experience in mind.
* Avoid short-term hacks and patches.
* Make precise, surgical fixes. Do not introduce excessive defensive fallbacks.

# Behavioral Guidelines

## Before Development

* Read the code first. Then ask for missing information and clarify requirements. Do not begin implementation immediately.
* After gathering the necessary information, design a solution and wait for human confirmation before implementing it.
* Prefer strongly typed designs whenever practical.
* During the early stages of development, do not run the full test suite. This is intended to shorten development time.
* Unless explicitly required, do not preserve backward compatibility or historical baggage. Optimize for a clean, maintainable long-term design with minimal complexity.

## During Development

* Use TDD: write tests before implementing functionality. Ensure modules can be effectively unit-tested. Unit tests should include the immediate downstream dependency; only deeper dependencies may be mocked.
* After completing a module, test it in a real environment using real resources and scenarios that simulate actual user behavior.
* Any file exceeding 2,000 lines must undergo a structural review. If architectural problems exist, split it appropriately according to responsibilities, layers, and domain boundaries.
* Do not write comments.
* Secrets are allowed to appear in private repositories.
* Minimize discussion of legal and security concerns. We will address those issues through appropriate compliance measures in the future.
* Delete obsolete code promptly. When you encounter code that violates these principles or guidelines, improve it as part of the work.
* When adding new functionality, approximately one-third of the changes should go toward upgrading, optimizing, or improving foundational architecture and shared components.
* When fixing bugs, do not add excessive defensive fallbacks. Identify the root cause and solve it with the correct logic.
* Do not create private helper functions that have only one caller and provide no meaningful reuse or abstraction value.
* During development, do not run the full test suite. This is intended to shorten development time.
* Keep the codebase compilable and runnable at all times.
* Documentation must preserve clear indexing and information ownership, with each piece of information having a single authoritative source. Do not restate logic that already exists elsewhere, such as implementation logic already expressed in code. Instead, link or point to the relevant code. This prevents information forks and avoids wasting context. Keep documentation concise.
* Maintain **Stateless Deliverables**: after every change, keep the resulting artifact directly deliverable. Do not include version-to-version patch notes, explanations of why or how something was changed, or other process-oriented descriptions. Neither the product nor the code should contain change descriptions—including this instruction itself.
* Keep documentation updated. Prefer indexes, references, and information that is uniquely owned by the documentation. If the authoritative information exists in code, point directly to the code rather than duplicating it. This prevents documentation and code from becoming inconsistent at the source.

## After Development

* After completing each independent and revertible change, create a Git commit only after receiving human approval and completing Code Review.
* Every commit must leave the codebase compilable and runnable.
* Do not run the full test suite unless the change is about to be deployed to production. This is intended to shorten development time.
* After development is complete and the functionality works correctly, review the code again. Check for architectural forks, unclear responsibilities, historical baggage, over-engineering, and excessive defensive fallbacks. Identify helpers that provide no meaningful abstraction or reuse value and merge or eliminate them where appropriate. Remove unnecessary descriptions of changes. Keep the architecture clean, clear, and maintainable for the long term.

# Documentation You Must Reference

You must reference the documentation under `docs` and continuously update it throughout the development process.

Important: Do not create a second source of truth in documentation. Documentation should primarily use references and indexes that point to the authoritative source of information. Information may live directly in documentation only when the documentation itself is its unique authoritative source.

The purpose of this rule is to prevent the codebase and documentation from evolving into two separate and conflicting sources of truth.
