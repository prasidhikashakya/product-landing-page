export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return <a href="/" aria-label="ÉLURE BEAUTY home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none' }}>
    <svg width={compact ? 31 : 39} height={compact ? 31 : 39} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 40C17 33 11 29 12 21c1-7 8-9 12-3 4-6 11-4 12 3 1 8-5 12-12 19Z" stroke="#A85D78" strokeWidth="1.4"/>
      <path d="M24 17c-1-5-5-8-9-9m9 9c1-5 5-8 9-9M24 17v24M14 31c-5 0-8 2-10 5m30-5c5 0 8 2 10 5" stroke="#D8C2A0" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="24" cy="23" r="3" stroke="#A85D78" strokeWidth="1.2"/>
    </svg>
    <span><span className="serif" style={{ fontSize: compact ? 16 : 19, letterSpacing: '.1em' }}>ÉLURE</span><span style={{ display: 'block', fontSize: 8, letterSpacing: '.32em', color: '#8c707a' }}>BEAUTY</span></span>
  </a>;
}
