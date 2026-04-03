# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it
responsibly:

1. **Do not** open a public issue.
2. Email the maintainers at **security@gaiacommons.org** with:
   - A description of the vulnerability.
   - Steps to reproduce the issue.
   - Any potential impact.
3. You will receive an acknowledgment within **48 hours**.
4. A fix will be developed and released as soon as possible, typically within
   **7 days** for critical issues.

## Security Practices

- Dependencies are monitored via Dependabot and `npm audit`.
- All pull requests undergo automated dependency review.
- Rate limiting is applied to API and catch-all routes.
- Input validation includes length guards to prevent ReDoS attacks.
