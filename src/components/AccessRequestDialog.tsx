import { FormEvent, useState } from "react";
import { CheckCircle2, Send, X } from "lucide-react";
import { submitRegistration, type RegistrationPayload } from "../lib/registration";

interface AccessRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

const initialPayload: RegistrationPayload = {
  name: "",
  email: "",
  company: "",
  useCase: "",
};

export function AccessRequestDialog({ open, onClose }: AccessRequestDialogProps) {
  const [payload, setPayload] = useState<RegistrationPayload>(initialPayload);
  const [state, setState] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function update(field: keyof RegistrationPayload, value: string) {
    setPayload((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    try {
      await submitRegistration(payload);
      setState("submitted");
    } catch (nextError) {
      setState("idle");
      setError(nextError instanceof Error ? nextError.message : "Access request could not be sent.");
    }
  }

  return (
    <div className="access-backdrop" role="presentation">
      <section className="access-dialog" role="dialog" aria-modal="true" aria-labelledby="access-title">
        <button type="button" className="dialog-close" aria-label="Close access request" onClick={onClose}>
          <X size={17} />
        </button>
        {state === "submitted" ? (
          <div className="access-success">
            <CheckCircle2 size={34} />
            <h2 id="access-title">Access request received</h2>
            <p>I will review the workspace context and follow up with the next step.</p>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="access-form" onSubmit={submit}>
            <div>
              <span>Workspace access</span>
              <h2 id="access-title">Request PulseOps access</h2>
              <p>For teams that want to review the incident workspace in a realistic project context.</p>
            </div>
            <label>
              Name
              <input value={payload.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" required />
            </label>
            <label>
              Work email
              <input type="email" value={payload.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required />
            </label>
            <label>
              Company / team
              <input value={payload.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" required />
            </label>
            <label>
              Access context
              <textarea value={payload.useCase} onChange={(event) => update("useCase", event.target.value)} rows={4} required />
            </label>
            {error ? <p className="access-error">{error}</p> : null}
            <button type="submit" disabled={state === "submitting"}>
              <Send size={15} />
              {state === "submitting" ? "Sending..." : "Send request"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
