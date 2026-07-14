// TRD 4.1 — Input Form
import { useState } from "react";
import type { ReviewInputs } from "../types";

interface Props {
  onSubmit: (inputs: ReviewInputs) => void;
  loading: boolean;
}

export function InputForm({ onSubmit, loading }: Props) {
  // TODO: implement form fields per TRD 4.1
  return (
    <div>
      <p>InputForm — TODO</p>
      <button disabled={loading}>Run PreFlight</button>
    </div>
  );
}
