export const store = {
  brand: 'ÉLURE BEAUTY',
  tagline: 'Beauty in Every Detail',
  productName: 'HUXIABEAUTY True Match Foundation',
  price: 1200,
  compareAtPrice: 1500,
  currency: 'NPR',
  // Suggested charges from the supplied brief. Confirm with your courier before launch.
  delivery: { kathmandu: 100, outside: 200 },
  businessEmail: process.env.BUSINESS_EMAIL || 'prasidhikashakya@gmail.com',
  whatsappNumber: '', // Add an international-format number, digits only, to show WhatsApp help.
  images: [{ src: '/images/foundation-main.png', alt: 'HUXIABEAUTY True Match Foundation bottle and box' }],
  benefits: [
    'A lovely addition to your everyday makeup routine',
    'Designed for a smooth, beautiful makeup look',
    'An elegant bottle and packaging for your beauty shelf',
  ],
  faqs: [
    { q: 'What is the price?', a: 'The current suggested offer is NPR 1,200 (regular price NPR 1,500). Please confirm the final selling price before launch.' },
    { q: 'How do I place an order?', a: 'Choose a quantity, enter your name, phone number, email, and full delivery address, then submit. Our team will call to confirm.' },
    { q: 'Do you deliver outside Kathmandu Valley?', a: 'Delivery is available across Nepal where our courier can serve. The delivery charge depends on your location.' },
    { q: 'How long will delivery take?', a: 'The supplied estimate is 1–3 business days inside Kathmandu Valley and 3–7 business days outside. Please confirm timing with your courier.' },
    { q: 'How can I choose my shade?', a: 'The image shows the currently listed shade. Please contact us for guidance and confirm shade availability before ordering.' },
    { q: 'How can I pay?', a: 'This checkout accepts Cash on Delivery only. No online payment is collected.' },
    { q: 'Can I return or exchange it?', a: 'Please contact our support team if your order arrives damaged or incorrect. Confirm your return and exchange policy before launch.' },
  ],
} as const;

export function money(amount: number) {
  return `NPR ${new Intl.NumberFormat('en-IN').format(amount)}`;
}
