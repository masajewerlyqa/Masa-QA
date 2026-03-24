# Admin seller application details view

## Where to open it

- From **Admin → Seller applications**, click **View** on any row to open the full application details at `/admin/seller-applications/[id]`.

## What is shown

The detail page shows the full seller application in sections:

1. **Contact & business** – Brand/store name, contact person full name, email, phone, store location.
2. **Applicant account** – Profile name and email of the user who submitted the form.
3. **Store description** – Long text description of the store (if provided).
4. **Logo & certificate** – Logo image (if uploaded) and a link to view/download the business certificate or license file.
5. **Social links** – Website, Instagram, Facebook, LinkedIn (if provided).
6. **Review** – Reviewed at, reviewed by, and notes (if the application has been reviewed).

Logo and certificate files are stored in private Supabase Storage buckets. The page uses the **service role** client to generate **signed URLs** (1 hour expiry) so admins can view them without making the buckets public.

---

## Field sources

### From `seller_applications` (application form data)

| Field | Column | Description |
|-------|--------|-------------|
| Brand / store name | `business_name` | Name of the brand or store. |
| Contact person (full name) | `contact_full_name` | Full name of the contact person. |
| Email | `contact_email` | Contact email. |
| Phone | `contact_phone` | Contact phone. |
| Store location | `store_location` | Address or city/region. |
| Store description | `business_description` | Long text description. |
| Logo | `logo_path` | Path in Storage bucket `store-logos`; file loaded via signed URL. |
| Certificate / license | `license_path` | Path in Storage bucket `store-licenses`; file loaded via signed URL. |
| Social links | `social_links` | JSONB: e.g. `{ website, instagram, facebook, linkedin }`. |
| Status, created_at, reviewed_at, review_notes | Same names | Application and review metadata. |

### From `profiles` (applicant – user who submitted)

Joined via **user_id** (applicant):

| Shown as | Column | Description |
|----------|--------|-------------|
| Profile name | `profiles.full_name` | Display name on the account. |
| Profile email | `profiles.email` | Account email. |

### From `profiles` (reviewer – admin who reviewed)

Joined via **reviewed_by**:

| Shown as | Column | Description |
|----------|--------|-------------|
| Reviewed by | `reviewer.full_name` or `reviewer.email` | Admin who approved/rejected. |

---

## Files changed

- **app/admin/seller-applications/[id]/page.tsx** – New detail page: loads full application, builds signed URLs for logo and license with the service client, renders all sections with MASA Card/Badge/Button styling.
- **app/admin/seller-applications/page.tsx** – Added “View” link (with Eye icon) to each row linking to the detail page; kept Approve/Reject for pending applications.
- **docs/ADMIN_SELLER_APPLICATION_VIEW.md** – This documentation.
