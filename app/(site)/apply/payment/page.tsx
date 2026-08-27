import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formatIban,
  getBankTransferDetails,
  getPlanAmountQar,
} from "@/lib/seller/bank-transfer";
import { parseSellerPlanId } from "@/lib/seller-plans";
import { PaymentProofUpload } from "./PaymentProofUpload";
import { SellerPaymentStatusBadge } from "./SellerPaymentStatusBadge";

export const metadata = { title: "Seller Registration Payment | MASA" };

export default async function SellerPaymentPage() {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/login?next=/apply/payment");
  }

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("seller_applications")
    .select(
      "id, status, seller_plan, payment_reference, payment_amount_qar, payment_proof_submitted_at, rejection_reason, review_notes"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // Nothing to pay for until an application exists.
  if (!application) {
    redirect("/apply");
  }

  const planId = parseSellerPlanId(application.seller_plan) ?? "basic";
  const amountQar = application.payment_amount_qar ?? getPlanAmountQar(planId);
  const bank = getBankTransferDetails();
  const status = application.status as string;
  const isActive = status === "approved";
  const awaitingReview = status === "payment_proof_submitted" || status === "under_review";
  const wasRejected = status === "rejected";
  const rejectionReason = application.rejection_reason ?? application.review_notes;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="font-luxury text-3xl text-primary">Seller registration payment</h1>
        <SellerPaymentStatusBadge status={status} />
      </header>

      {isActive ? (
        <section className="rounded-lg border border-green-200 bg-green-50 p-6 space-y-3 font-sans">
          <h2 className="font-medium text-green-900">Your seller account is active</h2>
          <p className="text-sm text-green-800">
            Your payment has been verified and your account is activated. You can start adding
            products from your seller dashboard.
          </p>
          <Link
            href="/seller"
            className="inline-block bg-primary text-white px-5 py-2.5 rounded text-sm hover:bg-primary/90"
          >
            Open seller dashboard
          </Link>
        </section>
      ) : (
        <>
          {wasRejected && rejectionReason && (
            <section
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-5 space-y-2 font-sans"
            >
              <h2 className="font-medium text-red-900">We could not verify your payment</h2>
              <p className="text-sm text-red-800">{rejectionReason}</p>
              <p className="text-sm text-red-800">
                Please review the details below and upload a new proof of payment.
              </p>
            </section>
          )}

          <section className="rounded-lg border border-primary/15 bg-white p-6 space-y-4 font-sans">
            <h2 className="font-luxury text-xl text-primary">Amount due</h2>
            <dl className="divide-y divide-primary/10">
              <Row label="Plan" value={planId === "basic" ? "Basic" : "Premium"} />
              <Row label="Amount" value={`${amountQar.toLocaleString("en-US")} QAR`} />
              <Row label="Billing" value="One-time registration fee" />
              {application.payment_reference && (
                <Row label="Payment reference" value={application.payment_reference} mono />
              )}
            </dl>
          </section>

          <section className="rounded-lg border border-primary/15 bg-white p-6 space-y-4 font-sans">
            <h2 className="font-luxury text-xl text-primary">Bank transfer details</h2>
            {bank ? (
              <>
                <dl className="divide-y divide-primary/10">
                  <Row label="Bank" value={bank.bankName} />
                  <Row label="Account name" value={bank.accountName} />
                  <Row label="IBAN" value={formatIban(bank.iban)} mono />
                </dl>
                <p className="text-sm text-masa-gray">
                  Please quote your payment reference on the transfer so we can match it to your
                  application.
                </p>
              </>
            ) : (
              <p className="text-sm text-masa-gray">
                Our bank details are not published yet. Please contact support and we will send
                them to you directly.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-primary/15 bg-white p-6 space-y-4 font-sans">
            <h2 className="font-luxury text-xl text-primary">Upload proof of payment</h2>
            {awaitingReview ? (
              <div className="rounded-md border border-primary/15 bg-masa-light/60 p-4 space-y-1">
                <p className="text-sm font-medium text-masa-dark">Payment proof submitted</p>
                <p className="text-sm text-masa-gray">Status: Under review</p>
                <p className="text-sm text-masa-gray">
                  Applications are normally reviewed within 24 hours. We will email you once it has
                  been checked — there is no need to upload again unless we ask.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-masa-gray">
                  Upload your bank transfer receipt as a JPG, PNG, or PDF (max 5 MB).
                </p>
                <PaymentProofUpload />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-sm text-masa-gray">{label}</dt>
      <dd className={`text-sm font-medium text-masa-dark ${mono ? "font-mono tracking-wide" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
