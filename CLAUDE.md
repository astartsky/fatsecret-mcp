# Claude Code Instructions

## Testing

**Always use the `vitest-expert` agent** for writing, extending, and working with tests.

```bash
# Run tests
npm test              # watch mode
npm run test:run      # single run
npm run test:coverage # with coverage report
```

### Test Structure

```
src/__tests__/
├── oauth/           # OAuth signature and requests
├── utils/           # Utilities (encoding, date)
├── methods/         # API methods
└── client.test.ts   # Client
```

### Mocking Strategy

- `node-fetch` — for HTTP request tests
- `makeApiRequest`/`makeOAuthRequest` — for method tests
- All methods from `methods/index.js` — for client tests

## Schema Validation

**Always use the `zod-expert` agent** for creating, updating, or debugging Zod validation schemas.

The agent is especially useful for:
- Creating new validation schemas
- Migrating from Zod v3 to v4
- Debugging validation errors
- Optimizing schema performance
