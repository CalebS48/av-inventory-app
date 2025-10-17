import React, { useState, useEffect, useCallback } from 'react'; // <-- Import useCallback

// API endpoint for your serverless function
const API_ENDPOINT = '/.netlify/functions/items';

function RoomView({ location, onBack }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItemName, setNewItemName] = useState('');

  // Function to fetch inventory data, now wrapped in useCallback
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error('Failed to fetch data.');
      }
      const allItems = await response.json();
      // Filter items for the currently selected room
      const roomItems = allItems.filter(
        item => item.location.floor === location.floor && item.location.room === location.room
      );
      setItems(roomItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [location.floor, location.room]); // <-- Dependencies for useCallback

  // useEffect hook now correctly includes fetchItems in its dependency array
  useEffect(() => {
    fetchItems();
  }, [fetchItems]); // <-- Correct dependency

  // Function to handle adding a new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return; // Prevent adding empty items

    const newItem = {
      name: newItemName.trim(),
      quantity: 1,
      category: 'Uncategorized', // Default category
      location: {
        floor: location.floor,
        room: location.room
      }
    };
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) throw new Error('Failed to add item.');
      
      setNewItemName(''); // Clear input field
      fetchItems(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to update an item's quantity (+1 or -1)
  const handleUpdateQuantity = async (item, amount) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity < 0) return; // Prevent negative quantity

    try {
      await fetch(`${API_ENDPOINT}/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      fetchItems(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to delete an item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await fetch(`${API_ENDPOINT}/${itemId}`, { method: 'DELETE' });
      fetchItems(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <p className="message">Loading inventory...</p>;
  if (error) return <p className="message error">Error: {error}</p>;

  return (
    <div className="room-view">
      <button onClick={onBack} className="back-button">← Back to Dashboard</button>
      <h3>Inventory for: {location.room}</h3>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="add-item-form">
        <input 
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add new item name (e.g., 20ft XLR Cable)"
        />
        <button type="submit">Add Item</button>
      </form>
      
      {/* Inventory List */}
      <ul className="inventory-list">
        {items.length === 0 ? (
          <p>This room is empty.</p>
        ) : (
          items.map(item => (
            <li key={item._id} className="inventory-item">
              <span className="item-name">{item.name}</span>
              <div className="item-controls">
                <button onClick={() => handleUpdateQuantity(item, -1)}>−</button>
                <span className="item-quantity">{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item, 1)}>+</button>
                <button onClick={() => handleDeleteItem(item._id)} className="delete-button">🗑️</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default RoomView;
