# Security Policy

## Reporting a Vulnerability

If you believe you have found a security vulnerability in any package
published from this repository (or in the repository tooling itself),
please **do not open a public issue**.

Use **[GitHub Private Vulnerability Reporting][pvr]** instead:

1. Go to the [Security tab][security] of this repository.
2. Click **Report a vulnerability**.
3. Fill in the form. The maintainers receive the report privately and
   coordinate a fix and disclosure with you.

[pvr]: https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability
[security]: https://github.com/ui5-community/ui5-ecosystem-showcase/security

## Supported Versions

Only the latest published version of each package is supported with
security fixes. Older majors do not receive backports unless explicitly
called out in a release note.

## Scope

In scope:

- The packages published from `packages/*` to npm under the
  `ui5-community` org.
- The CI workflows under `.github/workflows/` and the release
  configuration that produces those packages.

Out of scope:

- Demo applications under `showcases/*`. These exist to exercise the
  middleware/task extensions and are not intended for production use.
- Vulnerabilities in third-party dependencies that are already tracked
  by Dependabot or upstream advisories — please report those upstream.
