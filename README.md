# Vitrin+

Vite + React + Firebase tabanli magazacilik yonetim araci.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Netlify ayarlari `netlify.toml` icindedir:

- build command: `npm run build`
- publish directory: `dist`
- Node version: `22`

## Secrets

`.env`, `.secrets/`, `.tools/`, `.cache/`, `node_modules/`, `dist/` ve manuel Netlify importleri git disinda tutulur.
