export interface RegistrationPayload {
  name: string;
  email: string;
  company: string;
  useCase: string;
}

export interface RegistrationResponse {
  status: "received" | "invalid" | "failed";
  emailSent?: boolean;
  message?: string;
  receivedAt?: string;
}

export async function submitRegistration(payload: RegistrationPayload): Promise<RegistrationResponse> {
  const response = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as RegistrationResponse;
  if (!response.ok) {
    throw new Error(body.message ?? `Registration failed with status ${response.status}`);
  }

  return body;
}
