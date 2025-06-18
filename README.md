# Socket.IO + Redis State Sync Monorepo (TypeScript)

## Structure

- `apps/server`: Express, Socket.io, Redis, TypeScript backend
- `apps/client`: React, Redux, Tailwind, Socket.io, TypeScript frontend
- `packages/shared`: Shared TypeScript types

### Add development .env file with the following content to the root of this project:
```txt
REDIS_SERVER=redis://redis:6379
```

### Install & Run

1. Run `npm install` at the root.
2. Build shared types: `npm run build --workspace=packages/shared`
3. In two terminals, run:
   - `npm run dev --workspace=apps/server`
   - `npm run dev --workspace=apps/client`