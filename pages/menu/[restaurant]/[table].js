// pages/menu/[restaurant]/[table].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase'

export default function MenuPage() {
  const router = useRouter()
  const { restaurant: restaurantId, table } = router.query
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [notes, setNotes] = useState('')
  const [placed, setPlaced] = useState(false)

  useEffect(() => {
    if (restaurantId) loadRestaurant()
  }, [restaurantId])

  const loadRestaurant = async () => {
    const { data } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single()
    setRestaurant(data)
    const { data: items } = await supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).eq('available', true)
    setMenuItems(items)
  }

  const add = (item) => {
    setCart(c => {
      const found = c.find(x => x.id===item.id)
      if (found) return c.map(x=>x.id===item.id?{...x,quantity:x.quantity+1}:x)
      return [...c, {...item,quantity:1}]
    })
  }

  const placeOrder = async () => {
    if (!cart.length) return
    await supabase.from('orders').insert([{
      restaurant_id: restaurantId,
      table_number: table,
      items: cart,
      total: cart.reduce((sum,i)=>sum+i.price*i.quantity,0),
      customer_notes: notes
    }])
    setPlaced(true)
  }

  if (!restaurant) return <p>Loading...</p>
  if (placed) return <p>✅ Order placed! Thank you. Table {table}</p>

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <h1>{restaurant.name} — Table {table}</h1>
      <ul>
        {menuItems.map(item => (
          <li key={item.id}>
            {item.name} — ₹{item.price} 
            <button onClick={()=>add(item)}>Add</button>
          </li>
        ))}
      </ul>
      <textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
      <button onClick={placeOrder}>Place Order (₹{cart.reduce((s,i)=>s+i.price*i.quantity,0)})</button>
    </div>
  )
}
