import nodemailer from "nodemailer";

interface OrderItemEmailData {
  title: string;
  quantity: number;
  unitPriceCents: number;
  sku?: string | null;
}

interface OrderEmailAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
}

interface SendOrderConfirmationParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  items: OrderItemEmailData[];
  totalCents: number;
  paymentMethod: string;
  shippingAddress: OrderEmailAddress;
}

interface SendOrderCancellationParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  reason?: string;
  paymentMethod?: string | null;
  totalCents: number;
}

interface SendOrderStatusUpdateParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
}

interface SendResellerDecisionEmailParams {
  toEmail: string;
  recipientName: string;
  businessName: string;
  reason?: string;
}

// Helper to get or create nodemailer transporter
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Development fallback: transport that logs to console
  return null;
}

const FROM_EMAIL = process.env.SMTP_FROM || `"Cartygo Marketplace" <orders@cartygo.com>`;
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function formatINR(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * 1. Send Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(params: SendOrderConfirmationParams) {
  const { toEmail, customerName, orderNumber, items, totalCents, paymentMethod, shippingAddress } = params;

  const subject = `Order Confirmed: #${orderNumber} — Cartygo`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0;">
          <strong style="color: #0F172A; font-size: 14px;">${item.title}</strong>
          ${item.sku ? `<div style="color: #64748B; font-size: 11px;">SKU: ${item.sku}</div>` : ""}
        </td>
        <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid #E2E8F0; color: #334155; font-size: 13px;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-weight: bold; font-size: 14px;">
          ${formatINR(item.unitPriceCents * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Bar -->
          <div style="background: #0B101D; padding: 28px 32px; text-align: center; border-bottom: 3px solid #E8A33D;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">CARTYGO</div>
            <div style="color: #E8A33D; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">Verified Reseller Marketplace</div>
          </div>

          <!-- Hero Success -->
          <div style="padding: 32px 32px 20px 32px; text-align: center;">
            <div style="display: inline-block; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 26px; margin-bottom: 16px;">
              ✓
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0F172A;">Thank You for Your Order!</h1>
            <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;">
              Hi ${customerName}, your order has been successfully placed and verified.
            </p>
          </div>

          <!-- Order Summary Badge -->
          <div style="margin: 0 32px; background: #F1F5F9; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700;">Order Reference</div>
              <div style="font-size: 16px; font-weight: 800; color: #0F172A; font-family: monospace; margin-top: 2px;">#${orderNumber}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700;">Payment Mode</div>
              <div style="font-size: 13px; font-weight: 700; color: #0066FF; margin-top: 2px;">${paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment (Card)"}</div>
            </div>
          </div>

          <!-- Items Table -->
          <div style="padding: 24px 32px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">Ordered Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #CBD5E1;">
                  <th style="text-align: left; padding-bottom: 8px; color: #64748B; font-size: 11px; text-transform: uppercase;">Product</th>
                  <th style="text-align: center; padding-bottom: 8px; color: #64748B; font-size: 11px; text-transform: uppercase;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px; color: #64748B; font-size: 11px; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding-top: 16px; font-size: 15px; font-weight: 800; color: #0F172A;">Total Paid:</td>
                  <td style="padding-top: 16px; text-align: right; font-size: 18px; font-weight: 900; color: #D97706;">
                    ${formatINR(totalCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="margin: 0 32px 24px 32px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
            <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-bottom: 6px; text-transform: uppercase;">Delivery Address:</div>
            <div style="font-size: 13px; color: #334155; line-height: 1.5;">
              <strong>${customerName}</strong><br />
              ${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br />
              ${shippingAddress.city}, ${shippingAddress.state || ""} - ${shippingAddress.postalCode}<br />
              Phone: ${shippingAddress.phone || "N/A"}
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; padding: 0 32px 32px 32px;">
            <a href="${APP_URL}/orders?placed=${orderNumber}" style="display: inline-block; background: #0B101D; color: #E8A33D; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
              TRACK YOUR ORDER →
            </a>
          </div>

          <!-- Footer Trust Guarantee -->
          <div style="background: #F1F5F9; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B;">
            <div style="font-weight: 700; color: #0F172A; margin-bottom: 4px;">🛡️ Cartygo Escrow & Buyer Protection</div>
            Your funds are held in secure escrow until you receive and verify your package.
            <div style="margin-top: 12px; font-size: 11px; color: #94A3B8;">
              © ${new Date().getFullYear()} Cartygo Marketplace Inc. All rights reserved.
            </div>
          </div>

        </div>
      </body>
    </html>
  `;

  await deliverEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * 2. Send Order Cancellation Email
 */
export async function sendOrderCancellationEmail(params: SendOrderCancellationParams) {
  const { toEmail, customerName, orderNumber, reason, paymentMethod, totalCents } = params;

  const subject = `Order Cancelled: #${orderNumber} — Cartygo`;

  const refundMessage =
    paymentMethod === "COD"
      ? "As this was a Cash on Delivery (COD) order, no money was charged."
      : `Your online payment of ${formatINR(totalCents)} will be automatically refunded to your original payment method within 3–5 business days.`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Bar -->
          <div style="background: #0B101D; padding: 28px 32px; text-align: center; border-bottom: 3px solid #EF4444;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">CARTYGO</div>
            <div style="color: #F87171; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">Order Cancellation Notice</div>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #991B1B;">Order #${orderNumber} Has Been Cancelled</h2>
              <p style="margin: 0; font-size: 13px; color: #7F1D1D;">
                Hi ${customerName}, your cancellation request for order <strong>#${orderNumber}</strong> has been processed successfully.
              </p>
            </div>

            <div style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
              <strong>Refund Information:</strong><br />
              ${refundMessage}
            </div>

            ${
              reason
                ? `<div style="font-size: 13px; color: #64748B; margin-bottom: 24px;">
                    <strong>Reason for Cancellation:</strong> ${reason}
                   </div>`
                : ""
            }

            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}" style="display: inline-block; background: #0B101D; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                RETURN TO MARKETPLACE
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #F1F5F9; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
            Need help with your cancellation? Contact Cartygo support at support@cartygo.com.<br />
            © ${new Date().getFullYear()} Cartygo Marketplace Inc.
          </div>

        </div>
      </body>
    </html>
  `;

  await deliverEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * 3. Send Order Status Update Email (Fulfilling, Shipped, Delivered)
 */
export async function sendOrderStatusUpdateEmail(params: SendOrderStatusUpdateParams) {
  const { toEmail, customerName, orderNumber, status, trackingNumber, carrier } = params;

  const subject = `Order #${orderNumber} Update: Now ${status} — Cartygo`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <div style="background: #0B101D; padding: 28px 32px; text-align: center; border-bottom: 3px solid #E8A33D;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">CARTYGO</div>
            <div style="color: #E8A33D; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">Order Status Update</div>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0F172A;">
              Your order is on the move!
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
              Hi ${customerName}, your order <strong>#${orderNumber}</strong> has been updated to:
            </p>

            <div style="display: inline-block; padding: 8px 16px; border-radius: 20px; background: #EEF2FF; border: 1px solid #C7D2FE; color: #3730A3; font-weight: 800; font-size: 14px; margin-bottom: 24px;">
              ${status}
            </div>

            ${
              trackingNumber
                ? `<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
                     <strong>Carrier:</strong> ${carrier || "Express Delivery"}<br />
                     <strong>Tracking ID:</strong> <span style="font-family: monospace; font-weight: bold;">${trackingNumber}</span>
                   </div>`
                : ""
            }

            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}/orders" style="display: inline-block; background: #0B101D; color: #E8A33D; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: 800; font-size: 13px;">
                VIEW ORDER DETAILS
              </a>
            </div>
          </div>

          <div style="background: #F1F5F9; padding: 16px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
            © ${new Date().getFullYear()} Cartygo Marketplace Inc.
          </div>
        </div>
      </body>
    </html>
  `;

  await deliverEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * 4. Send Retailer Application Approved Email
 */
export async function sendResellerApprovalEmail(params: SendResellerDecisionEmailParams) {
  const { toEmail, recipientName, businessName } = params;

  const subject = `🎉 Congratulations! Your Cartygo Retailer Account is Approved — ${businessName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Bar -->
          <div style="background: #0B101D; padding: 28px 32px; text-align: center; border-bottom: 3px solid #10B981;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">CARTYGO</div>
            <div style="color: #34D399; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">Verified Retailer Partnership</div>
          </div>

          <!-- Hero Section -->
          <div style="padding: 36px 32px 20px 32px; text-align: center;">
            <div style="display: inline-block; background: #ECFDF5; border: 2px solid #10B981; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 30px; margin-bottom: 16px;">
              🎉
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0F172A;">
              You're Approved as a Cartygo Retailer!
            </h1>
            <p style="margin: 10px 0 0 0; color: #475569; font-size: 15px; line-height: 1.5;">
              Hi <strong>${recipientName}</strong>, we are thrilled to welcome <strong>${businessName}</strong> to the Cartygo Merchant Network! Your seller profile has been verified and activated.
            </p>
          </div>

          <!-- Status Highlight Card -->
          <div style="margin: 0 32px 24px 32px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 11px; color: #166534; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Account Status</div>
                <div style="font-size: 16px; font-weight: 800; color: #15803D; margin-top: 2px;">ACTIVE & VERIFIED VENDOR</div>
              </div>
              <div style="background: #15803D; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800;">
                0% COMMISSION
              </div>
            </div>
          </div>

          <!-- Key Retailer Benefits -->
          <div style="padding: 0 32px 24px 32px;">
            <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">
              Your Retailer Privileges are Ready:
            </h3>

            <div style="margin-bottom: 12px; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
              <strong style="color: #0F172A; font-size: 14px;">⚡ Instant Product Listings & Zero Fee</strong>
              <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">Publish your entire catalog, set custom pricing, and enjoy 0% marketplace commission.</p>
            </div>

            <div style="margin-bottom: 12px; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
              <strong style="color: #0F172A; font-size: 14px;">🛡️ Cartygo Escrow & Buyer Trust</strong>
              <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">Your products receive the verified badge, boosting shopper conversions with automated escrow payouts.</p>
            </div>

            <div style="padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
              <strong style="color: #0F172A; font-size: 14px;">📊 Reseller Dashboard & Real-Time Orders</strong>
              <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">Manage inventory, fulfill new orders, view logistics tracking, and withdraw sales revenue.</p>
            </div>
          </div>

          <!-- Primary CTA -->
          <div style="text-align: center; padding: 0 32px 32px 32px;">
            <a href="${APP_URL}/reseller/dashboard" style="display: inline-block; background: #0B101D; color: #F59E0B; text-decoration: none; padding: 15px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; border: 1px solid #F59E0B;">
              OPEN RETAILER DASHBOARD →
            </a>
            <div style="margin-top: 10px; font-size: 12px; color: #64748B;">
              Direct access: <a href="${APP_URL}/reseller/dashboard" style="color: #2563EB;">${APP_URL}/reseller/dashboard</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #F1F5F9; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B;">
            <div style="font-weight: 700; color: #0F172A; margin-bottom: 4px;">Cartygo Merchant Success Team</div>
            Have questions about catalog uploads or payouts? Contact us at merchant@cartygo.com.<br />
            © ${new Date().getFullYear()} Cartygo Marketplace Inc. All rights reserved.
          </div>

        </div>
      </body>
    </html>
  `;

  await deliverEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * 5. Send Retailer Application Rejected / Cancelled Email
 */
export async function sendResellerRejectionEmail(params: SendResellerDecisionEmailParams) {
  const { toEmail, recipientName, businessName, reason } = params;

  const subject = `Update regarding your Cartygo Retailer Application — ${businessName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Bar -->
          <div style="background: #0B101D; padding: 28px 32px; text-align: center; border-bottom: 3px solid #EF4444;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">CARTYGO</div>
            <div style="color: #F87171; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">Retailer Verification Notice</div>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #991B1B;">
                Retailer Application Status: Cancelled / Not Approved
              </h2>
              <p style="margin: 0; font-size: 14px; color: #7F1D1D; line-height: 1.5;">
                Dear <strong>${recipientName}</strong>, thank you for your interest in selling on Cartygo for <strong>${businessName}</strong>. Following a review by our onboarding team, we are unable to approve your application at this time.
              </p>
            </div>

            ${
              reason
                ? `<div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                      Reason / Review Notes:
                    </div>
                    <div style="font-size: 14px; color: #0F172A; line-height: 1.5;">
                      ${reason}
                    </div>
                   </div>`
                : ""
            }

            <div style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
              If you have any questions or feel that this decision was reached in error, or if you would like to provide updated documentation (GSTIN, legal license, or warehouse credentials), our merchant support team will be glad to assist you.
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:support@cartygo.com?subject=Appeal%20Reseller%20Application%20-%20${encodeURIComponent(businessName)}" style="display: inline-block; background: #0B101D; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                CONTACT MERCHANT SUPPORT
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #F1F5F9; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
            Cartygo Merchant Compliance & Operations<br />
            © ${new Date().getFullYear()} Cartygo Marketplace Inc. All rights reserved.
          </div>

        </div>
      </body>
    </html>
  `;

  await deliverEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * 6. Send Retailer Information Requested Email
 */
export async function sendResellerInfoRequestedEmail(params: SendResellerDecisionEmailParams) {
  const { toEmail, recipientName, businessName, reason } = params;

  const subject = `Action Required: Additional Information Needed for Cartygo Retailer Account — ${businessName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Bar -->
          <div style="background: #0B101D; padding: 28px 32px; text-align: center; border-bottom: 3px solid #F59E0B;">
            <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff;">CARTYGO</div>
            <div style="color: #FBBF24; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700;">Action Required</div>
          </div>

          <div style="padding: 32px;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0F172A;">
              Additional Verification Required
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.5;">
              Hi <strong>${recipientName}</strong>, our merchant review team has reviewed your application for <strong>${businessName}</strong> and requires additional information before we can approve your retailer account.
            </p>

            ${
              reason
                ? `<div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 4px;">
                      Requested Details:
                    </div>
                    <div style="font-size: 14px; color: #78350F; line-height: 1.5;">
                      ${reason}
                    </div>
                   </div>`
                : ""
            }

            <div style="text-align: center; margin-top: 24px;">
              <a href="${APP_URL}/reseller/onboarding" style="display: inline-block; background: #0B101D; color: #F59E0B; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 800; font-size: 13px; border: 1px solid #F59E0B;">
                UPDATE RETAILER APPLICATION →
              </a>
            </div>
          </div>

          <div style="background: #F1F5F9; padding: 16px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8;">
            © ${new Date().getFullYear()} Cartygo Marketplace Inc.
          </div>
        </div>
      </body>
    </html>
  `;

  await deliverEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * Underlying email delivery handler with automatic fallback
 */
async function deliverEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transporter = getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`[Email Sent] Successfully delivered to ${to}: "${subject}"`);
      return;
    } catch (err) {
      console.error(`[Email Error] Failed to send email via SMTP to ${to}:`, err);
    }
  }

  // Fallback if no SMTP configured or error in dev:
  console.log(`\n======================================================`);
  console.log(`📧 [Cartygo Email Dispatch Fallback]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Notice: To send live emails over internet, configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env`);
  console.log(`======================================================\n`);
}
