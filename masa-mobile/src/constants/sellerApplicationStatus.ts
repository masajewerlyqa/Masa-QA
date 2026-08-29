/**
 * Seller application statuses, mirroring the web app's state machine.
 *
 * Each status carries what the seller should do next, not just a label: a
 * seller sitting in pending_payment has to know they owe a bank transfer, or
 * they simply wait forever for an approval that cannot come.
 */

export type SellerApplicationStatus =
  | 'pending_payment'
  | 'payment_proof_submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'pending';

type StatusCopy = {
  label: string;
  detail: string;
  /** True when the seller has an action to take (pay, or re-upload proof). */
  needsAction: boolean;
};

const EN: Record<SellerApplicationStatus, StatusCopy> = {
  pending_payment: {
    label: 'Awaiting payment',
    detail:
      'Your application is saved. To continue, pay the one-time registration fee by bank transfer and upload your receipt. We emailed you the bank details and your payment reference.',
    needsAction: true,
  },
  payment_proof_submitted: {
    label: 'Proof submitted',
    detail:
      'We have your payment proof and are checking that the transfer arrived. This is normally reviewed within 24 hours.',
    needsAction: false,
  },
  under_review: {
    label: 'Under review',
    detail: 'Your application is being reviewed. We will email you once a decision is made.',
    needsAction: false,
  },
  approved: {
    label: 'Active',
    detail: 'Your payment is verified and your seller account is active.',
    needsAction: false,
  },
  rejected: {
    label: 'Action required',
    detail:
      'We could not verify your payment. Check the email we sent for the reason, then upload a new proof of payment.',
    needsAction: true,
  },
  expired: {
    label: 'Expired',
    detail: 'This application has expired. Please contact support to reopen it.',
    needsAction: false,
  },
  cancelled: {
    label: 'Cancelled',
    detail: 'This application was cancelled. Please contact support if this is unexpected.',
    needsAction: false,
  },
  // Applications created before the payment flow existed.
  pending: {
    label: 'Submitted',
    detail: 'An admin will review your application. You will be notified once a decision is made.',
    needsAction: false,
  },
};

const AR: Record<SellerApplicationStatus, StatusCopy> = {
  pending_payment: {
    label: 'بانتظار الدفع',
    detail:
      'تم حفظ طلبك. لإكمال الطلب، حوّل رسوم التسجيل لمرة واحدة عبر حوالة بنكية وارفع الإيصال. أرسلنا لك تفاصيل الحساب ومرجع الدفع عبر البريد.',
    needsAction: true,
  },
  payment_proof_submitted: {
    label: 'تم إرسال الإثبات',
    detail: 'استلمنا إثبات الدفع ونتحقق من وصول الحوالة. تتم المراجعة عادةً خلال 24 ساعة.',
    needsAction: false,
  },
  under_review: {
    label: 'قيد المراجعة',
    detail: 'طلبك قيد المراجعة. سنراسلك فور اتخاذ القرار.',
    needsAction: false,
  },
  approved: {
    label: 'نشط',
    detail: 'تم التحقق من دفعتك وحسابك كبائع نشط الآن.',
    needsAction: false,
  },
  rejected: {
    label: 'مطلوب إجراء',
    detail:
      'لم نتمكن من تأكيد دفعتك. راجع البريد الذي أرسلناه لمعرفة السبب، ثم ارفع إثبات دفع جديد.',
    needsAction: true,
  },
  expired: {
    label: 'منتهي',
    detail: 'انتهت صلاحية هذا الطلب. يرجى التواصل مع الدعم لإعادة فتحه.',
    needsAction: false,
  },
  cancelled: {
    label: 'ملغى',
    detail: 'تم إلغاء هذا الطلب. يرجى التواصل مع الدعم إذا كان ذلك غير متوقع.',
    needsAction: false,
  },
  pending: {
    label: 'تم الإرسال',
    detail: 'سيقوم المشرف بمراجعة طلبك، وسيصلك إشعار عند اتخاذ القرار.',
    needsAction: false,
  },
};

export function sellerApplicationStatusCopy(status: string, isArabic: boolean): StatusCopy {
  const table = isArabic ? AR : EN;
  return table[status as SellerApplicationStatus] ?? table.pending;
}
