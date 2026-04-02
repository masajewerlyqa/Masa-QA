"use client";

import { useState } from "react";
import { RegisterPathChoice, type RegisterPath } from "./RegisterPathChoice";
import { RegisterForm } from "./RegisterForm";

/**
 * Register flow: first choose Buyer or Seller path, then show the registration form.
 * Seller path sets profile role to pending_seller and redirects to /apply; admin approval upgrades to seller.
 * `initialIntent` from `/register?intent=seller` skips straight to the seller registration form.
 */
function RegisterFlow({ initialIntent }: { initialIntent?: RegisterPath | null }) {
  const [path, setPath] = useState<RegisterPath | null>(() => initialIntent ?? null);

  if (path === null) {
    return <RegisterPathChoice onChoose={setPath} />;
  }

  return (
    <div className="w-full max-w-md">
      <RegisterForm intent={path} onBack={path ? () => setPath(null) : undefined} />
    </div>
  );
}

export { RegisterFlow };
export default RegisterFlow;
