// File: pages/restaurants/[id].js

import { useState } from 'react'
import { supabase } from '../../services/supabase'

export async function getServerSideProps({ params, query }) {
  const { id } = params
  const tableNumber = query.table || ''

  // Fetch restaurant (only actual columns)
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('id, name')         // removed upi_id, upi_qr_image
    .eq('id', id)
    .single()

  if (restError || !restaurant) {
    return { notFound: true }
  }

  // Fetch available menu items
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name, price, available')
    .eq('restaurant_id', id)
    .eq('available', true)
    .order('created_at')

  if (menuError) console.error('Menu fetch error:', menuError)

  return {
    props: {
      restaurant,
      menuItems: menuItems || [],
      tableNumber
    }
  }
}

export default function RestaurantPage({ restaurant, menuItems, tableNumber }) {
  const [cart, setCart] = useState({})
  const [loading, setLoading] = useState(false)

  const addItem = (itemId) => {
    setCart((c) => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }))
  }

  const placeOrder = async () => {
    if (!tableNumber) {
      alert('Invalid table. Please scan the correct QR code.')
      return
    }
    if (Object.keys(cart).length === 0) {
      alert('Please select at least one item.')
      return
    }
    setLoading(true)

    const itemsArray = menuItems
      .filter((i) => cart[i.id])
      .map((i) => ({ id: i.id, name: i.name, qty: cart[i.id], price: i.price }))

    const total = itemsArray.reduce((sum, i) => sum + i.qty * i.price, 0)

    const { error } = await supabase.from('orders').insert([
      { restaurant_id: restaurant.id, table_number: tableNumber, items: itemsArray, total, status: 'pending' }
    ])

    setLoading(false)
    if (error) {
      alert('Error placing order: ' + error.message)
    } else {
      alert('Order placed successfully!')
      setCart({})
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>{restaurant.name} - Menu</h1>

      <div style={{ margin: '20px 0' }}>
        <label>
          Table Number:{' '}
          <input
            type="text"
            value={tableNumber}
            readOnly
            style={{ padding: 5, width: 80, backgroundColor: '#f3f3f3', border: '1px solid #ccc' }}
          />
        </label>
      </div>

      {menuItems.length === 0 && <p>No menu items available.</p>}
      <ul>
        {menuItems.map((item) => (
          <li key={item.id} style={{ marginBottom: 10 }}>
            <span>{item.name} — ₹{item.price}</span>
            <button onClick={() => addItem(item.id)} style={{ marginLeft: 20, padding: '4px 8px' }}>
              Add
            </button>
            {cart[item.id] && <span style={{ marginLeft: 8 }}>×{cart[item.id]}</span>}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={placeOrder}
          disabled={loading}
          style={{ background: '#0070f3', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 4 }}
        >
          {loading ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}
