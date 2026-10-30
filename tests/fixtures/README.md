# Integration fixtures

Integration suites should use Testcontainers for PostgreSQL, NATS JetStream, and
authentication fixtures. The adapters in this repository remain injectable so
unit tests do not require containers.
