import http from "node:http";
import process from "node:process";
import nodemailer from "nodemailer";

const port = Number(process.env.PORT ?? 8096);
const productName = process.env.PRODUCT_NAME ?? "PulseOps";
const notifyTo = process.env.REGISTRATION_NOTIFY_TO ?? "admin@stage.dev";

function env(name, fallback = "") {
  return process.env[name] ?? fallback;
}

function readSmtpConfig() {
  const host = env("SMTP_HOST") || env("SPRING_MAIL_HOST") || env("QUARKUS_MAILER_HOST");
  const portValue = env("SMTP_PORT") || env("SPRING_MAIL_PORT") || env("QUARKUS_MAILER_PORT") || "587";
  const username = env("SMTP_USERNAME") || env("SPRING_MAIL_USERNAME") || env("QUARKUS_MAILER_USERNAME");
  const password = env("SMTP_PASSWORD") || env("SPRING_MAIL_PASSWORD") || env("QUARKUS_MAILER_PASSWORD");
  const from = env("APP_MAIL_FROM") || env("QUARKUS_MAILER_FROM") || username;

  return {
    configured: Boolean(host && username && password && from),
    host,
    port: Number(portValue),
    username,
    password,
    from,
  };
}

function json(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(payload));
}

async function parseBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function clean(value) {
  return String(value ?? "").trim();
}

function validate(payload) {
  const data = {
    name: clean(payload.name),
    email: clean(payload.email),
    company: clean(payload.company),
    useCase: clean(payload.useCase),
  };

  if (data.name.length < 2) {
    return { error: "Please enter a contact name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: "Please enter a valid email address." };
  }
  if (data.company.length < 2) {
    return { error: "Please enter a company or team." };
  }
  if (data.useCase.length < 12) {
    return { error: "Please describe the access context briefly." };
  }

  return { data };
}

async function sendRegistration(data) {
  const smtp = readSmtpConfig();
  if (!smtp.configured) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: false,
    requireTLS: true,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  const submittedAt = new Date().toISOString();
  await transporter.sendMail({
    from: `"Sascha Dobrochynskyy" <${smtp.from}>`,
    to: notifyTo,
    replyTo: data.email,
    subject: `[${productName}] Access request from ${data.company}`,
    text: [
      `${productName} access request`,
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Company / team: ${data.company}`,
      `Submitted: ${submittedAt}`,
      "",
      "Use case:",
      data.useCase,
    ].join("\n"),
  });

  return true;
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    return json(response, 204, {});
  }

  if (request.method === "GET" && request.url === "/api/health") {
    return json(response, 200, { status: "ok", product: productName, generatedAt: new Date().toISOString() });
  }

  if (request.method === "POST" && request.url === "/api/registrations") {
    try {
      const parsed = validate(await parseBody(request));
      if (parsed.error) {
        return json(response, 422, { status: "invalid", message: parsed.error });
      }

      const emailSent = await sendRegistration(parsed.data);
      return json(response, 202, { status: "received", emailSent, receivedAt: new Date().toISOString() });
    } catch (error) {
      return json(response, 500, { status: "failed", message: "Registration request could not be processed." });
    }
  }

  return json(response, 404, { status: "not_found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`${productName} registration service listening on 127.0.0.1:${port}`);
});
