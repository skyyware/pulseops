# Stage Deployment

PulseOps is deployed as a static frontend with a small registration API on `pulseops.stage.dev`.

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

Deploy from a clean source checkout:

```bash
npm run deploy:stage
```

The deployment script writes `source-revision.txt` into the public directory so the live build can be matched to the source commit.

## Registration API

The access-request API runs as a separate Node.js service behind Apache:

```text
/api/* -> 127.0.0.1:8106
```

The systemd unit lives in `deploy/systemd/pulseops-api.service`. SMTP settings are read from `/etc/skyyware/registration-mail.env` on the stage server. Do not commit SMTP credentials; only commit variable names and deployment instructions.

## Verification

After deploying, verify:

```bash
curl -I https://pulseops.stage.dev
curl https://pulseops.stage.dev/source-revision.txt
curl https://pulseops.stage.dev/api/health
```
