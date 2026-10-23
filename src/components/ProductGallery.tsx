'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { store } from '@/config/product';

export default function ProductGallery() {
  const [active, setActive] = useState(0);
  const images = store.images;
  const move = (delta: number) => setActive((current) => (current + delta + images.length) % images.length);
  return <div>
    <div style={{ position: 'relative', aspectRatio: '1 / 1.06', overflow: 'hidden', borderRadius: 6, background: '#fff4f7' }}>
      <Image src={images[active].src} alt={images[active].alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectFit: 'cover', objectPosition: 'center 50%' }}/>
      {images.length > 1 && <><button type="button" aria-label="Previous product photo" onClick={() => move(-1)} style={arrow('left')}><ChevronLeft size={19}/></button><button type="button" aria-label="Next product photo" onClick={() => move(1)} style={arrow('right')}><ChevronRight size={19}/></button></>}
    </div>
    {images.length > 1 ? <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 12 }}>{images.map((image, index) => <button key={image.src} type="button" aria-label={`Show product photo ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} style={{ width: 8, height: 8, borderRadius: '50%', border: 0, padding: 0, background: index === active ? '#a85d78' : '#decbd2', cursor: 'pointer' }}/>)}</div> : <div style={{ textAlign: 'center', paddingTop: 12, fontSize: 11, color: '#806a73' }}>Seller-supplied product photo · More authentic photos can be added</div>}
  </div>;
}

function arrow(side: 'left'|'right'): React.CSSProperties {
  return { position: 'absolute', zIndex: 1, top: '50%', [side]: 12, transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', border: '1px solid #ffffffa6', background: '#fffefce8', color: '#49343c', display: 'grid', placeItems: 'center', cursor: 'pointer' };
}
