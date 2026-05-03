import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { action } = req.body;

  // ── CREATE ORDER ──
  if (action === 'create_order') {
    try {
      const { amount, currency = 'INR', plan } = req.body;
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay uses paise
          currency,
          receipt: `order_${Date.now()}`,
          notes: { plan }
        })
      });
      const order = await response.json();
      if (order.error) return res.status(400).json({ error: order.error.description });
      return res.status(200).json(order);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── VERIFY PAYMENT ──
  if (action === 'verify_payment') {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        return res.status(200).json({ verified: true, payment_id: razorpay_payment_id });
      } else {
        return res.status(400).json({ verified: false, error: 'Invalid signature' });
      }
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
