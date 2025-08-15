import Head from 'next/head'

// ✅ This forces Next.js to export a static .html file with the <Head> content included
export async function getStaticProps() {
  return { props: {} }
}

export default function ShippingPolicy() {
  return (
    <>
      <Head>
        <title>Shipping & Delivery Policy | Restaurant QR App</title>
        <meta
          name="description"
          content="Our partner restaurants aim to deliver food orders within 0–7 days. Read our full delivery policy."
        />
      </Head>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1>Shipping / Delivery Policy</h1>
        <p>Our partner restaurants aim to deliver food orders in a timely manner. Delivery policies are as follows:</p>
        <ul>
          <li>Delivery time may vary based on distance, order size, and restaurant workload.</li>
          <li>Delivery is handled directly by the restaurant or its chosen delivery partner.</li>
          <li>We are not liable for delays caused by external factors such as weather or traffic.</li>
          <li>Delivery charges, if applicable, will be displayed at checkout.</li>
        </ul>
      </main>
    </>
  )
}
