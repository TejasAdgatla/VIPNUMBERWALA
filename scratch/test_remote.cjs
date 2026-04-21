const axios = require('axios');

async function test() {
  const url = 'https://vip-backend-sxe3.onrender.com/payments/create-order';
  const payload = {
    amount: 1,
    customer_phone: '8090050091',
    items: ['test-id']
  };

  console.log('Sending request to:', url);
  try {
    const res = await axios.post(url, payload);
    console.log('SUCCESS:', res.data.payment_session_id ? 'Got Session ID' : 'No Session ID');
  } catch (err) {
    console.log('ERROR STATUS:', err.response?.status);
    console.log('ERROR DETAILS:', JSON.stringify(err.response?.data, null, 2));
  }
}

test();
