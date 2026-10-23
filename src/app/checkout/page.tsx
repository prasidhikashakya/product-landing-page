import { Suspense } from 'react';
import CheckoutForm from '@/components/CheckoutForm';
import BrandMark from '@/components/BrandMark';

export default function CheckoutPage() {
  return <main style={{ minHeight: '100vh', background: '#fcf8f8' }}><header style={{ background: 'white', borderBottom: '1px solid #ede2e5' }}><div className="container" style={{ height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><BrandMark/><a href="/" style={{ color: '#806a73', fontSize: 12, textDecoration: 'none' }}>← Back to product</a></div></header><section className="container" style={{ maxWidth: 980, paddingBlock: 54 }}><div style={{ textAlign: 'center', marginBottom: 32 }}><div className="eyebrow" style={{ marginBottom: 10 }}>Secure order details</div><h1 className="serif" style={{ fontWeight: 400, fontSize: 42, margin: 0 }}>Complete your order</h1><p style={{ color: '#76656b', fontSize: 14 }}>Pay in cash when your order arrives. No online payment required.</p></div><Suspense fallback={<div className="soft-card" style={{ padding: 32, textAlign: 'center' }}>Loading checkout…</div>}><CheckoutForm/></Suspense></section></main>;
}
