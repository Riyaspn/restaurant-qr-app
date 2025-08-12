// pages/dashboard.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'

export default function Dashboard() {
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' })
  const [qrCodes, setQrCodes] = useState({})

  useEffect(() => {
    loadRestaurant()
    loadMenuItems()
    loadOrders()
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => setOrders(prev => [payload.new, ...prev])
      )
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [])

  const loadRestaurant = async () => {
    const restaurantId = localStorage.getItem('restaurantId')
    if (!restaurantId) return
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()
    setRestaurant(data)
  }

  const loadMenuItems = async () => {
    const restaurantId = localStorage.getItem('restaurantId')
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    setMenuItems(data || [])
  }

  const loadOrders = async () => {
    const restaurantId = localStorage.getItem('restaurantId')
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  const addMenuItem = async (e) => {
    e.preventDefault()
    const restaurantId = localStorage.getItem('restaurantId')
    await supabase.from('menu_items').insert([{
      restaurant_id: restaurantId,
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description
    }])
    setNewItem({ name: '', price: '', description: '' })
    loadMenuItems()
  }

  const generateQR = async (tableNumber) => {
    const url = `${window.location.origin}/menu/${restaurant.id}/${tableNumber}`
    const qrDataURL = await QRCode.toDataURL(url)
    setQrCodes(prev => ({ ...prev, [tableNumber]: qrDataURL }))
  }

  if (!restaurant) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: 1200, margin: '20px auto', padding: 20 }}>
      <h1>🏪 {restaurant.name} Dashboard</h1>

      {/* Menu Items */}
      <section style={{ marginTop: 30 }}>
        <h2>Menu Items</h2>
        <form onSubmit={addMenuItem} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
          <input placeholder="Price" type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
          <input placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
          <button type="submit">Add Item</button>
        </form>
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>{item.name} — ₹{item.price}</li>
          ))}
        </ul>
      </section>

      {/* QR Codes */}
      <section style={{ marginTop: 30 }}>
        <h2>Generate QR Codes</h2>
        {[1,2,3,4,5].map(table => (
          <div key={table} style={{ display: 'inline-block', margin: 10, textAlign: 'center' }}>
            <button onClick={() => generateQR(table)}>Table {table}</button>
            {qrCodes[table] && <img src={qrCodes[table]} alt={`QR ${table}`} width={100} />}
          </div>
        ))}
      </section>

      {/* Orders */}
      <section style={{ marginTop: 30 }}>
        <h2>Recent Orders</h2>
        {orders.map(o => (
          <div key={o.id} style={{ border: '1px solid #ccc', margin: 5, padding: 10 }}>
            <strong>Table {o.table_number}</strong> — ₹{o.total}
          </div>
        ))}
      </section>
    </div>
  )
}
