# ÉLURE BEAUTY order funnel

Next.js App Router + TypeScript + Tailwind storefront and Cash on Delivery order flow for Nepal. Product, proposed pricing, delivery fees, FAQ, image list, and store contact are in [`src/config/product.ts`](src/config/product.ts).

## Before launch

The supplied brief marks NPR 1,200/NPR 1,500 and delivery fees as suggestions. Confirm those amounts, courier coverage/timing, shade availability, formula claims, returns policy, supplier details, and the proposed ÉLURE BEAUTY brand/trademark availability before taking orders. No customer testimonials or unverified ingredient, certification, coverage, or skin-type claims are included. The uploaded image is the only real product photo supplied; add authentic product photos to `public/images` and update the `images` array before launch. Product reels are omitted because none were provided.

This funnel accepts Cash on Delivery only. It does not collect eSewa, Khalti, or card payments. Delivery fee is currently set to NPR 100 for Kathmandu Valley and NPR 200 elsewhere, based on the supplied suggested values; edit/confirm in `src/config/product.ts`.

## Local development

1. Install Node.js 20 or later.
2. Run `npm install` and copy `.env.example` to `.env.local`.
3. Add the Google and SMTP values described below.
4. Run `npm run dev`, then visit `http://localhost:3000`.
5. Place a real test order only after setting up a test sheet and email inbox. A successful submission requires the spreadsheet append and both emails to succeed. The thank-you page is reached only after all three succeed.

The server recalculates the product price, quantity subtotal, delivery fee, and total from the central configuration. It ignores browser-supplied totals and product prices. Form input is validated server-side, and the Google/email work runs only in `/api/order` on the server.

## Google Sheets setup

1. Create a Google spreadsheet. Add a tab named `Orders` (or use your chosen tab name). The spreadsheet currently connected for local development uses the tab `Sheet1`.
2. In row 1 add these columns, in order:

   `Order ID | Date & Time | Customer Name | Phone Number | Email Address | Exact Location | Product Name | Quantity | Price Per Piece | Delivery Fee | Total Price | Payment Method | Order Status | Notes`

3. Freeze row 1 and enable **Data → Create a filter**. Format the date column as date/time and price columns as Nepalese rupees if desired.
4. For order status, select the status cells in column M, then choose **Data → Data validation → Dropdown** and add: `New Order`, `Order Confirmed`, `Order Ongoing`, `Delivered`, `Cancelled`.
5. Copy the spreadsheet ID from the URL between `/d/` and `/edit`.
6. In Google Cloud Console, create/select a project, enable the Google Sheets API, and create a service account. Create a JSON key and copy its `client_email` and `private_key` into the server environment variables. Keep the private key secret.
7. Share the spreadsheet with the service account email as an Editor. The app does not create the spreadsheet or tab automatically; create the tab and header row first.
8. Set `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB_NAME`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.

To apply the ÉLURE BEAUTY sheet formatting (header styling, frozen header, filters, dropdown, NPR formatting, alternating rows, and column widths), run `npm run sheet:format`. It creates the header only when the tab is empty and stops if it finds a mismatched header.

The API appends one row per order. Google Sheets must be shared with the service account, and the tab name must match exactly.

## Email setup

The implementation uses Nodemailer over SMTP. With Gmail, use a dedicated sender account with 2-Step Verification and an app password. Put the app password in `SMTP_PASS`; do not use your normal Gmail password. Configure:

- `BUSINESS_EMAIL`: receives order alerts (defaults to the address in product config).
- `EMAIL_FROM`: optional sender/reply-to address. The SMTP account must be allowed to send as this address.
- `SMTP_HOST`, `SMTP_PORT` (465 for implicit TLS or 587 for STARTTLS), `SMTP_USER`, `SMTP_PASS`.
- `BRAND_NAME`: brand in mail copy (the current HTML reads the editable brand config).

`EMAIL_SERVICE_API_KEY` is included in the example for a future provider integration; this build does not use it. SMTP credentials are required for the current email implementation. Both the business alert and customer confirmation are attempted after the order row is written. If the sheet write fails, the request fails before sending email. If an email fails after the row is saved, the API returns a clear error and does not redirect; check the sheet before retrying to avoid a duplicate order.

## Environment variables

Use `.env.local` for local secrets and your hosting provider's encrypted environment settings in production. Never commit `.env.local` or expose Google credentials/SMTP settings through `NEXT_PUBLIC_` variables.

- `NEXT_PUBLIC_SITE_URL`: canonical site URL (metadata/configuration).
- `FRONTEND_URL`: allowed frontend origin for POST `/api/order`; set this to the exact deployed site origin.
- `BUSINESS_EMAIL`, `EMAIL_FROM`, `BRAND_NAME`.
- `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB_NAME`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
- `EMAIL_SERVICE_API_KEY`: reserved for a future email provider; unused currently.

## Vercel deployment

1. Push this project to a Git provider and import it into Vercel.
2. Add all production environment variables in **Project Settings → Environment Variables**. Set `FRONTEND_URL` and `NEXT_PUBLIC_SITE_URL` to your production HTTPS origin. Paste the full service-account private key; multiline newlines and escaped `\\n` are both supported.
3. Confirm the spreadsheet is shared with the service account and that Gmail SMTP credentials work.
4. Deploy. Redeploy after changing environment variables.
5. Test with a small real order and verify its sheet row, business email, customer email, and thank-you page. The API returns success only after the sheet append and both email sends finish.

`FRONTEND_URL` origin checking is applied when an Origin header is present. Same-origin Next.js requests are expected; it is not a substitute for rate limiting or abuse monitoring if the endpoint is exposed to spam.
