'use client';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { store, money } from '@/config/product';

export default function CheckoutForm() {
  const search = useSearchParams();
  const initialQuantity = Math.max(1, Math.min(20, Number(search.get('quantity')) || 1));
  const [quantity, setQuantity] = useState(initialQuantity);
  const [area, setArea] = useState('kathmandu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const delivery = area === 'kathmandu' ? store.delivery.kathmandu : store.delivery.outside;
  const subtotal = quantity * store.price;
  const total = subtotal + delivery;
  const feeCaption = useMemo(() => area === 'kathmandu' ? 'Kathmandu Valley' : 'Outside Kathmandu Valley', [area]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    Object.assign(payload, { productName: store.productName, quantity, deliveryArea: area, pricePerPiece: store.price, deliveryFee: delivery, totalPrice: total, paymentMethod: 'Cash on Delivery' });
    try {
      const response = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We couldn’t submit your order. Please try again.');
      const params = new URLSearchParams({ orderId: result.orderId, product: store.productName, quantity: String(quantity), total: String(total) });
      window.location.assign(`/thank-you?${params.toString()}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'We couldn’t submit your order. Please try again.'); setLoading(false); }
  }

  return <form onSubmit={submit} className="soft-card" style={{ padding: 'clamp(20px,4vw,38px)' }}><div className="checkout-grid" style={{ display: 'grid', gap: 32 }}><div><h2 className="serif" style={{ fontWeight: 400, fontSize: 24, marginTop: 0 }}>Your details</h2><div style={{ display: 'grid', gap: 16 }}><label style={label}>Full name<input className="input" name="name" required autoComplete="name" placeholder="Your full name" maxLength={100}/></label><label style={label}>Phone number<input className="input" name="phone" required type="tel" autoComplete="tel" placeholder="98XXXXXXXX" maxLength={20}/></label><label style={label}>Email address<input className="input" name="email" required type="email" autoComplete="email" placeholder="you@example.com" maxLength={254}/></label><label style={label}>Exact delivery location<textarea className="input" name="location" required autoComplete="street-address" placeholder="Kindly share your exact location" maxLength={500} rows={3} style={{ resize: 'vertical' }}/></label><label style={label}>Delivery area<select className="input" value={area} onChange={e => setArea(e.target.value)}><option value="kathmandu">Kathmandu Valley</option><option value="outside">Outside Kathmandu Valley</option></select></label><label style={label}>Shade (optional)<input className="input" name="shade" placeholder="Please confirm availability" maxLength={100}/><span style={{ fontSize: 11, fontWeight: 400, color: '#897b80' }}>Shade availability is subject to confirmation.</span></label></div></div><aside style={{ borderRadius: 6, background: '#fff8f9', padding: 22, alignSelf: 'start' }}><h2 className="serif" style={{ fontWeight: 400, fontSize: 23, margin: '0 0 18px' }}>Order summary</h2><div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>{store.productName}</div><label style={{ ...label, marginBottom: 16 }}>Quantity<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button type="button" className="button button-outline" style={qtyButton} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button type="button" className="button button-outline" style={qtyButton} onClick={() => setQuantity(Math.min(20, quantity + 1))}>＋</button></div></label><div style={row}><span>Price per piece</span><strong>{money(store.price)}</strong></div><div style={row}><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div style={row}><span>Delivery · {feeCaption}</span><strong>{money(delivery)}</strong></div><div style={{ ...row, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8dadd', fontSize: 15 }}><strong>Total</strong><strong style={{ color: '#a85d78' }}>{money(total)}</strong></div><div style={{ marginTop: 18, padding: 13, background: 'white', border: '1px solid #ede2e5', borderRadius: 4, fontSize: 12, lineHeight: 1.6 }}><strong>Payment method</strong><br/>Cash on Delivery</div><p style={{ fontSize: 10, color: '#897b80', lineHeight: 1.6 }}>*Delivery fees are suggested amounts. Confirm courier charges before launch.</p></aside></div>{error && <div role="alert" style={{ background: '#fff0f0', color: '#9c3131', border: '1px solid #f0caca', borderRadius: 4, padding: 13, marginTop: 20, fontSize: 13 }}>{error}</div>}<button className="button" type="submit" disabled={loading} style={{ marginTop: 24, width: '100%', opacity: loading ? .72 : 1 }}>{loading ? 'Submitting order…' : `Place COD order · ${money(total)}`}</button><p style={{ textAlign: 'center', fontSize: 10, color: '#897b80', marginBottom: 0 }}>Your details are sent securely to the store to process your order.</p></form>;
}
const label: React.CSSProperties = { display: 'grid', gap: 7, fontSize: 12, fontWeight: 600, color: '#4b3b41' };
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: '#76656b', marginTop: 12 };
const qtyButton: React.CSSProperties = { minHeight: 34, width: 36, padding: 0, fontSize: 16 };
