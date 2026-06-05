interface MetricInputProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export function MetricInput({ label, value, unit, min, max, step, onChange }: MetricInputProps) {
  return (
    <label className="metric-control">
      <span>
        {label}
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
