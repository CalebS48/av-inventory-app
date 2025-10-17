// Load environment variables for local development
require('dotenv').config();
const mongoose = require('mongoose');

// --- Reusable Database Connection ---
// We connect once and reuse the connection across function invocations for performance.
let connection = null;
const mongoURI = process.env.MONGODB_URI;

const connectToDatabase = async () => {
  if (connection && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection.');
    return;
  }
  console.log('Creating new database connection.');
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  connection = mongoose.connection;
};

// --- Item Schema (The structure of your data) ---
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    location: {
        floor: { type: Number, required: true },
        room: { type: String, required: true, trim: true }
    }
}, { timestamps: true });

// Avoid recompiling the model if it already exists
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

// --- The Main Serverless Function Handler ---
exports.handler = async (event, context) => {
  // Ensure the function doesn't exit before async operations are complete
  context.callbackWaitsForEmptyEventLoop = false;
  
  await connectToDatabase();
  
  const { httpMethod, path, body } = event;
  const pathParts = path.replace('/.netlify/functions/items', '').split('/').filter(Boolean);
  const itemId = pathParts[0];

  try {
    switch (httpMethod) {
      // GET: Fetch items
      case 'GET':
        const items = await Item.find();
        return { statusCode: 200, body: JSON.stringify(items) };

      // POST: Add a new item
      case 'POST':
        const newItemData = JSON.parse(body);
        const newItem = new Item(newItemData);
        await newItem.save();
        return { statusCode: 201, body: JSON.stringify({ message: 'Item added successfully!', item: newItem }) };

      // PUT: Update an existing item (e.g., quantity)
      case 'PUT':
        if (!itemId) return { statusCode: 400, body: 'Error: Item ID is required for updates.' };
        const updatedData = JSON.parse(body);
        const updatedItem = await Item.findByIdAndUpdate(itemId, updatedData, { new: true });
        if (!updatedItem) return { statusCode: 404, body: 'Error: Item not found.' };
        return { statusCode: 200, body: JSON.stringify({ message: 'Item updated!', item: updatedItem }) };

      // DELETE: Remove an item
      case 'DELETE':
        if (!itemId) return { statusCode: 400, body: 'Error: Item ID is required for deletion.' };
        const deletedItem = await Item.findByIdAndDelete(itemId);
        if (!deletedItem) return { statusCode: 404, body: 'Error: Item not found.' };
        return { statusCode: 200, body: JSON.stringify({ message: 'Item deleted successfully.' }) };

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error('Operation failed:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'An internal server error occurred.' }) };
  }
};
