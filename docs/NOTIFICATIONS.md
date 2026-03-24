# Notifications

Buyers, sellers, and admins see only their own notifications. Notifications are stored in the `notifications` table and created by server-side flows using the service role.

## Who sees notifications

- **Buyer**: Order status updated (when a seller changes their order status).
- **Seller**: New order (when a buyer places an order that includes the seller’s products); seller application approved/rejected (applicant is the seller).
- **Admin**: New seller application (when someone submits an application).

All roles use the same **Notifications** entry in the profile dropdown (top-right). The unread count is shown next to “Notifications” and on the `/notifications` page.

## Notification types (stored in DB)

| type | title | Recipient | Created when |
|------|--------|-----------|--------------|
| `new_seller_application` | New seller application | All admins | User submits seller application (apply form). |
| `seller_application_approved` | Application approved | Applicant | Admin approves application. |
| `seller_application_rejected` | Application rejected | Applicant | Admin rejects application. |
| `new_order` | New order | Store owner(s) | Buyer completes checkout; one per store that has items in the order. |
| `order_status_updated` | Order update | Order’s customer | Seller updates order status (e.g. shipped, delivered). |

## Storage

- **Table**: `notifications` (id, user_id, type, title, body, data JSONB, read_at, created_at).
- **RLS**: Users can SELECT and UPDATE only their own rows. Inserts are done with the **service role** (bypasses RLS) so any user can be notified.

## UI

- **Profile menu**: “Notifications” links to `/notifications`. Unread count shown when > 0.
- **Page** `/notifications`: List of notifications (newest first). Unread have a dot and “Mark read”; “Mark all as read” at the top. Clicking a row (or its link) goes to a relevant page when applicable:
  - `order_status_updated` → `/account/orders/[orderId]`
  - `new_order` → `/seller/orders/[orderId]`
  - `new_seller_application` → `/admin/seller-applications`
  - `seller_application_approved` → `/seller`

## Files

| File | Purpose |
|------|--------|
| `lib/notifications.ts` | createNotification, getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead; notifyAdminsNewSellerApplication, notifyApplicantApplicationApproved, notifyApplicantApplicationRejected, notifySellersNewOrder, notifyBuyerOrderStatusUpdated. |
| `app/(site)/apply/actions.ts` | notifyAdminsNewSellerApplicationAction (called from apply form after submit). |
| `components/seller/SellerApplicationForm.tsx` | After successful upsert, calls notifyAdminsNewSellerApplicationAction. |
| `app/admin/seller-applications/actions.ts` | After approve: notifyApplicantApplicationApproved; after reject: notifyApplicantApplicationRejected. |
| `app/(site)/checkout/actions.ts` | After order + items created: notifySellersNewOrder(orderId, storeIds). |
| `app/seller/orders/actions.ts` | After status update: notifyBuyerOrderStatusUpdated(customerId, orderId, newStatus). |
| `app/(site)/notifications/page.tsx` | Notifications list page (server). |
| `app/(site)/notifications/NotificationsList.tsx` | Client list with mark read / mark all read and links. |
| `app/(site)/notifications/actions.ts` | markNotificationReadAction, markAllNotificationsReadAction. |
| `app/(site)/layout.tsx` | Fetches getUnreadNotificationCount(user.id), passes to Navbar. |
| `components/Navbar.tsx`, `components/auth/NavbarAuth.tsx` | Pass notificationCount; “Notifications” link to `/notifications` with badge. |

## How to test notifications locally

1. **Prerequisites**: Migrations applied. At least one admin, one seller (with store and products), and one buyer (customer) account.

2. **New seller application (admin)**
   - Log in as a user who is not yet a seller. Go to `/apply` and submit the seller application form.
   - Log in as an **admin**. Open the profile menu → Notifications. You should see “New seller application” and the unread count.
   - Open `/notifications`. Click “Mark read” or “Mark all as read”. Count in menu should update.

3. **Application approved (seller)**
   - As **admin**, go to `/admin/seller-applications`, open the pending application, and approve it.
   - Log in as the **applicant** (the user who applied). Profile menu → Notifications should show “Application approved”.
   - Open `/notifications` and confirm the notification and link to `/seller`.

4. **Application rejected (seller)**
   - Create another application (e.g. different user or re-apply flow if supported). As admin, reject it (with or without notes).
   - Log in as the applicant. Notifications should show “Application rejected” with body including notes if provided.

5. **New order (seller)**
   - Log in as a **buyer**. Add a product (from a seller’s store) to the cart and complete checkout (shipping form, place order).
   - Log in as the **seller** who owns that product’s store. Notifications should show “New order”. Click it → should go to seller order detail for that order.

6. **Order status updated (buyer)**
   - As **seller**, go to `/seller/orders`, open an order, and change status (e.g. to Shipped or Delivered).
   - Log in as the **buyer** (customer who placed that order). Notifications should show “Order update” with the new status. Click → `/account/orders/[id]`.

7. **Mark read and count**
   - Generate several notifications for one user. Open `/notifications`. Use “Mark read” on one and “Mark all as read”. Navbar count should decrease and then become 0 after a refresh or revalidation.
