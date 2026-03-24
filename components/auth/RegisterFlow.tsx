"use client";

import { useState } from "react";
import { RegisterPathChoice, type RegisterPath } from "./RegisterPathChoice";
import { RegisterForm } from "./RegisterForm";

/**
 * Register flow: first choose Buyer or Seller path, then show the registration form.
 * Seller path redirects to /apply after account creation (no seller access until approved).
 */
export function RegisterFlow() {
  const [path, setPath] = useState<RegisterPath | null>(null);

  if (path === null) {
    return <RegisterPathChoice onChoose={setPath} />;
  }

  return (
    <div className="w-full max-w-md">
      <RegisterForm intent={path} onBack={path ? () => setPath(null) : undefined} />
    </div>
  );
}
