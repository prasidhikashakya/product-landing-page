'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { store, money } from '@/config/product';

export default function OrderControls({ compact = false }: { compact?: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const go = () => router.push(`/checkout?quantity=${quantity}`);
  return <div>
    {!compact && <><div className="eyebrow" style={{ marginBottom: 12 }}>Select quantity</div><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e7dce0', borderRadius: 4, height: 44 }}>
        <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, flex: '0 0 36px', height: 42, display: 'grid', placeItems: 'center', padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}><Minus size={15}/></button>
        <span aria-live="polite" style={{ width: 36, flex: '0 0 36px', textAlign: 'center', fontSize: 14 }}>{quantity}</span>
        <button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(20, quantity + 1))} style={{ width: 36, flex: '0 0 36px', height: 42, display: 'grid', placeItems: 'center', padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}><Plus size={15}/></button>
      </div><span style={{ color: '#76656b', fontSize: 13 }}>Total <strong style={{ color: '#30282b', marginLeft: 8 }}>{money(store.price * quantity)}</strong></span>
    </div></>}
    <button className="button" onClick={go} style={{ width: compact ? 'auto' : '100%' }}><ShoppingBag size={16}/>{compact ? 'Order now' : 'Continue to checkout'}</button>
  </div>;
}
