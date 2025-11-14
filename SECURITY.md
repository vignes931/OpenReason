# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Security Considerations

### 1. API Key Management

**Critical**: Never commit API keys to version control.

- Store keys in `.env` file (gitignored)
- Use environment variables in production
- Rotate keys regularly
- Use separate keys for dev/staging/prod

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
XAI_API_KEY=...
```

### 2. Input Validation

OpenReason implements multiple security layers:

**Safety Filter** (`sentience_filter.ts`)

- Blocks harmful content requests
- Filters personal information extraction
- Prevents illegal activity instructions
- Detects manipulation attempts

**Query Sanitization**

- Maximum query length: 10,000 characters
- Unicode normalization
- SQL injection prevention (if using custom DB queries)
- No arbitrary code execution

### 3. Output Sanitization

**Constraint Engine** validates all LLM outputs:

- No contradictory statements
- Evidence-based reasoning required
- Confidence calibration enforced
- No circular reasoning allowed

### 4. Rate Limiting

Implement rate limiting in production:

```typescript
// Recommended: Use rate-limiter-flexible
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});
```

### 5. Data Privacy

**Memory System**

- All data stored locally in `./data/ucr_memory.db`
- No data transmitted to third parties (except LLM providers)
- Episodic memory can be cleared: `rm ./data/ucr_memory.db`
- No PII collection by default

**LLM Provider Data**

- Queries sent to OpenAI/Anthropic/Google/XAI
- Subject to each provider's data retention policies
- Use provider's data privacy APIs for sensitive applications
- Consider self-hosted models for maximum privacy

### 6. Prompt Injection Prevention

OpenReason includes built-in prompt injection defenses:

```typescript
// Constitutional constraints prevent manipulation
const constraints = [
  "no contradictions",
  "evidence required",
  "no manipulation",
];
```

**Best Practices**:

- Validate user input before reasoning
- Use structured output formats
- Monitor constraint violations
- Log suspicious queries

### 7. Dependency Security

**Regular Updates**

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

**Current Dependencies**:

- `@langchain/*` - Actively maintained
- `@anthropic-ai/sdk` - Official SDK
- `keyv` - Minimal attack surface
- All packages audited for known CVEs

### 8. Database Security

**SQLite via Keyv**:

- Local file storage only
- No network exposure
- WAL mode for consistency
- Regular backups recommended

```bash
# Backup database
cp ./data/openreason_memory.db ./backups/openreason_memory_$(date +%Y%m%d).db
```

### 9. Error Handling

**Never expose**:

- API keys in error messages
- Internal file paths
- Stack traces to end users
- Database structure details

```typescript
// Good
return { verdict: "error: request failed", conf: 0 };

// Bad
return { verdict: `error: ${err.stack}`, conf: 0 };
```

### 10. Production Deployment

**Checklist**:

- [ ] Environment variables configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error logging configured (without sensitive data)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Regular backups scheduled

## Reporting a Vulnerability

**Please do not open public issues for security vulnerabilities.**

Email security concerns to: `[your-security-email]`

Include:

1. Description of vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

**Response Timeline**:

- Acknowledgment: 48 hours
- Initial assessment: 7 days
- Fix deployment: 30 days (for critical issues)

## Security Best Practices for Users

1. **API Keys**: Use separate keys for different environments
2. **Monitoring**: Log all reasoning requests and constraint violations
3. **Auditing**: Review episodic memory periodically
4. **Updates**: Keep OpenReason and dependencies up to date
5. **Testing**: Run security tests before production deployment
6. **Backups**: Regular database backups
7. **Access Control**: Implement authentication for public-facing deployments
8. **Resource Limits**: Set max tokens, timeouts, and query lengths

## Known Limitations

1. **No built-in authentication** - Implement in your application layer
2. **Local database** - Not suitable for distributed systems without modification
3. **LLM provider trust** - Queries sent to third-party APIs
4. **Memory persistence** - Sensitive queries stored locally

## Compliance

OpenReason can be configured for compliance with:

- GDPR (data minimization, right to erasure)
- HIPAA (with proper safeguards and BAAs with providers)
- SOC 2 (logging, access controls)
- CCPA (data privacy, opt-out mechanisms)

**Note**: Compliance is user's responsibility. OpenReason provides tools but does not guarantee compliance.

## Security Roadmap

- [ ] Built-in rate limiting
- [ ] Encrypted database option
- [ ] PII detection and redaction
- [ ] Audit logging framework
- [ ] Security test suite
- [ ] Input sanitization library
- [ ] Output content filtering
- [ ] Self-hosted model support

---

**Last Updated**: November 14, 2025  
**Version**: 0.2.0
