// pages/index.js
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [loading, setLoading] = useState(false)

  const createRestaurant = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([{ name: restaurantName, owner_email: email }])
        .select()
      if (error) throw error
      localStorage.setItem('restaurantId', data[0].id)
      window.location.href = '/dashboard'
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <h1>🍽️ QR Restaurant Orders</h1>
      <form onSubmit={createRestaurant} style={{ marginTop: 30 }}>
        <h3>Start Free Trial</h3>
        <input
          placeholder="Restaurant Name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '10px 0' }}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '10px 0' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#007cba',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Restaurant'}
        </button>
      </form>
      <div style={{ marginTop: 30 }}>
        <Link href="/dashboard">
          <button style={{
            background: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 4
          }}>
            Already have a restaurant? Go to Dashboard
          </button>
        </Link>
      </div>
    </div>
  )
}
