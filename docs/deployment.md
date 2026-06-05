# Stage deployment

PulseOps is deployed as a static build to `pulseops.stage.dev`.

## Local build

```bash
npm run build
```

## Git based deploy target

The stage server uses a bare repository with a `post-receive` hook. The hook checks out the pushed static build into:

```text
/srv/www/pulseops.stage.dev/current/public
```

The source repository remains public on GitHub. The stage deployment receives the compiled `dist/` output, which keeps the server simple and avoids installing a frontend build toolchain on production.

## Verification

After deploying, verify:

```bash
curl -I https://pulseops.stage.dev
```
