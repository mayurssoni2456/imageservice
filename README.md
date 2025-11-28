# imageservice

Production-ready TypeScript Node.js project

## Features

- 🚀 TypeScript with strict mode
- 📦 ESM modules
- ⚡ esbuild for fast builds
- 🧪 Jest for testing
- 🔥 tsx for development with watch mode
- 📝 pnpm package manager

## Prerequisites

- Node.js 18 or higher
- pnpm (install with `npm install -g pnpm`)

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
pnpm dev
```

## Scripts

- `pnpm dev` - Start development server with watch mode
- `pnpm build` - Build for production
- `pnpm start` - Run production build
- `pnpm test` - Run tests
- `pnpm typecheck` - Type check without emitting files

## Project Structure

```
.
├── src/
│   └── index.ts          # Main entry point
├── tests/
│   └── index.test.ts     # Tests
├── dist/                 # Build output (generated)
├── package.json
├── tsconfig.json
├── esbuild.config.js
├── jest.config.js
└── README.md
```

## License

ISC
