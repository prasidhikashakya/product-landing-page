import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { store } from '@/config/product';

export const runtime = 'nodejs';
const schema = z.object({
  name: z.string().trim().min(2).max(100), phone: z.string().trim().min(7).max(20).regex(/^[+\d()\s.-]+$/),
  email: z.string().trim().email().max(254), location: z.string().trim().min(5).max(500),
  quantity: z.coerce.number().int().min(1).max(20), deliveryArea: z.enum(['kathmandu', 'outside']),
  shade: z.string().trim().max(100).optional().default(''),
});

function env(name: string) { return process.env[name]?.trim() || ''; }
function esc(input: string) { return input.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }
function codHtml(order: Order, customer: boolean) {
  const e = esc;
  const rows = `<tr><td style="padding:9px 0;color:#806a73">Product</td><td style="padding:9px 0;text-align:right;font-weight:bold">${e(order.product)}</td></tr><tr><td style="padding:9px 0;color:#806a73">Quantity</td><td style="padding:9px 0;text-align:right;font-weight:bold">${order.quantity}</td></tr><tr><td style="padding:9px 0;color:#806a73">Price per piece</td><td style="padding:9px 0;text-align:right;font-weight:bold">NPR ${order.price}</td></tr><tr><td style="padding:9px 0;color:#806a73">Delivery</td><td style="padding:9px 0;text-align:right;font-weight:bold">NPR ${order.delivery}</td></tr><tr><td style="padding:12px 0;border-top:1px solid #eadde1;font-weight:bold">Total</td><td style="padding:12px 0;border-top:1px solid #eadde1;text-align:right;font-weight:bold;color:#a85d78">NPR ${order.total}</td></tr>`;
  const detail = customer ? `<p style="margin:0 0 12px">Hi ${e(order.name)},</p><p style="margin:0 0 18px;line-height:1.7">Thank you for your order. We have received it successfully. Our sales representative will call you soon to confirm your order.</p>` : `<p style="margin:0 0 18px;line-height:1.7">A new Cash on Delivery order has been received. Please call the customer soon to confirm this order.</p><h3 style="font-size:14px">Customer details</h3><p style="line-height:1.8;margin:0 0 16px">${e(order.name)}<br/>${e(order.phone)}<br/>${e(order.email)}<br/>${e(order.location)}<br/>Delivery area: ${order.deliveryArea === 'kathmandu' ? 'Kathmandu Valley' : 'Outside Kathmandu Valley'}${order.shade ? `<br/>Shade requested: ${e(order.shade)}` : ''}</p>`;
  const brand=env('BRAND_NAME') || store.brand;
  return `<!doctype html><html><body style="margin:0;background:#fcf8f8;font-family:Arial,sans-serif;color:#30282b"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:25px 12px;background:#fcf8f8"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #ede2e5"><tr><td style="padding:24px 30px;background:#30282b;color:#fff;font-family:Georgia,serif;font-size:20px;letter-spacing:3px">${e(brand)}<div style="font:10px Arial,sans-serif;letter-spacing:2px;color:#e9ccd6;margin-top:5px">${e(store.tagline)}</div></td></tr><tr><td style="padding:30px">${detail}<h2 style="font:26px Georgia,serif;font-weight:normal;margin:0 0 8px">${customer ? 'Your order details' : 'Order received'}</h2><p style="font-size:12px;color:#806a73;margin:0 0 12px">Order ID: <strong>${order.id}</strong> · ${order.date}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;border-top:1px solid #eadde1;border-bottom:1px solid #eadde1">${rows}</table><p style="margin:17px 0;padding:13px;background:#fff4f7;font-size:13px">Payment method: <strong>Cash on Delivery</strong><br/>Order status: <strong>New Order</strong></p>${customer ? `<p style="line-height:1.6">Questions? Reply to <a style="color:#a85d78" href="mailto:${e(env('EMAIL_FROM') || store.businessEmail)}">${e(env('EMAIL_FROM') || store.businessEmail)}</a></p><p>Thank you,<br/><strong>${e(brand)}</strong></p>` : ''}</td></tr></table></td></tr></table></body></html>`;
}
type Order = { id:string; date:string; name:string; phone:string; email:string; location:string; product:string; quantity:number; price:number; delivery:number; total:number; deliveryArea:string; shade:string };

async function saveOrder(order: Order) {
  const id=env('GOOGLE_SHEET_ID'), email=env('GOOGLE_SERVICE_ACCOUNT_EMAIL'), key=env('GOOGLE_PRIVATE_KEY'), tab=env('GOOGLE_SHEET_TAB_NAME') || 'Orders';
  if (!id || !email || !key) throw new Error('Order records are not configured yet. Please contact the store directly.');
  const auth = new google.auth.GoogleAuth({ credentials:{ client_email:email, private_key:key.replace(/\\n/g,'\n') }, scopes:['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets=google.sheets({ version:'v4', auth });
  const values=[[order.id,order.date,order.name,order.phone,order.email,order.location,order.product,order.quantity,order.price,order.delivery,order.total,'Cash on Delivery','New Order',order.shade ? `Shade requested: ${order.shade}` : '']];
  await sheets.spreadsheets.values.append({ spreadsheetId:id, range:`'${tab.replace(/'/g,"''")}'!A:N`, valueInputOption:'RAW', insertDataOption:'INSERT_ROWS', requestBody:{values} });
}

async function sendEmails(order: Order) {
  const host=env('SMTP_HOST'), user=env('SMTP_USER'), pass=env('SMTP_PASS'), to=env('BUSINESS_EMAIL') || store.businessEmail;
  if (!host || !user || !pass) throw new Error('Email notifications are not configured yet. Please contact the store directly.');
  const port=Number(env('SMTP_PORT') || 465);
  const transporter=nodemailer.createTransport({ host, port, secure:port===465, auth:{user,pass} });
  const emailAddress=env('EMAIL_FROM') || user;
  const brand=env('BRAND_NAME') || store.brand;
  const from=`${brand} <${emailAddress}>`;
  const business=await transporter.sendMail({ from, to, replyTo:emailAddress, subject:`New Product Order Received - ${order.id}`, html:codHtml(order,false) });
  try {
    await transporter.sendMail({ from, to:order.email, replyTo:emailAddress, subject:`Your Order Has Been Received - ${brand}`, html:codHtml(order,true) });
  } catch (error) { throw new Error(`The order was recorded and the store was notified (${business.messageId}), but the customer email could not be sent. Please contact the customer.`, {cause:error}); }
}

export async function POST(request: NextRequest) {
  const frontend=env('FRONTEND_URL');
  const origin=request.headers.get('origin');
  if (frontend && origin && new URL(frontend).origin !== origin) return NextResponse.json({error:'Request origin is not allowed.'},{status:403});
  let raw:unknown;
  try { raw=await request.json(); } catch { return NextResponse.json({error:'Please submit a valid order form.'},{status:400}); }
  const parsed=schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message || 'Please check the order details.'},{status:400});
  const now=new Date();
  const quantity=parsed.data.quantity, price=store.price, delivery=parsed.data.deliveryArea==='kathmandu'?store.delivery.kathmandu:store.delivery.outside;
  const order:Order={ id:`EL-${now.toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`, date:now.toLocaleString('en-GB',{timeZone:'Asia/Kathmandu',dateStyle:'medium',timeStyle:'short'}), name:parsed.data.name, phone:parsed.data.phone, email:parsed.data.email, location:parsed.data.location, product:store.productName, quantity, price, delivery, total:quantity*price+delivery, deliveryArea:parsed.data.deliveryArea, shade:parsed.data.shade };
  try { await saveOrder(order); } catch (error) { console.error('Order sheet write failed',error); return NextResponse.json({error:error instanceof Error ? error.message : 'We could not record your order. Please try again.'},{status:503}); }
  try { await sendEmails(order); } catch (error) { console.error('Order email failed',order.id,error); return NextResponse.json({error:error instanceof Error ? error.message : 'Your order was recorded, but notifications failed. Please contact the store before resubmitting.'},{status:502}); }
  return NextResponse.json({ok:true,orderId:order.id},{status:201});
}
