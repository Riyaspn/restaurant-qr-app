import config from '../config'

export default function SubscriptionPayment() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Monthly Subscription Payment</h1>
      <p>Please click below to pay your monthly subscription.</p>
      <a href={config.subscriptionPaymentLink} target="_blank" rel="noreferrer">
        <button
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Pay Subscription
        </button>
      </a>
    </div>
  )
}
