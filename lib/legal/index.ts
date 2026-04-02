/**
 * Legal / policy content and versioning.
 * - Customer T&Cs body: `./customer-terms-sections`
 * - Version constant (DB + signup metadata): `./customer-terms-version`
 */
export { CUSTOMER_TERMS_VERSION, type LegalDocumentId } from "./customer-terms-version";
export {
  CUSTOMER_TERMS_SECTIONS,
  getTermsTitle,
  sectionTitle,
  sectionIntro,
  sectionBullets,
  sectionParagraphs,
  type CustomerTermsSection,
} from "./customer-terms-sections";

export { MERCHANT_TERMS_VERSION } from "./merchant-terms-version";
export {
  MERCHANT_TERMS_SECTIONS,
  getMerchantTermsTitle,
  merchantSectionTitle,
  merchantSectionIntro,
  merchantSectionBullets,
  merchantSectionParagraphs,
  merchantSubsections,
  merchantSecondaryIntro,
  merchantSecondaryBullets,
  type MerchantTermsSection,
  type MerchantTermsSubsection,
} from "./merchant-terms-sections";
