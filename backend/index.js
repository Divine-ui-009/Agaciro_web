/*
👉 This will start your server and show logs in the terminal.

---

### 🔹 2. Add a quick test inside your backend
In your `index.js` (or `server.js`) file, add this temporary route:

```js
*/
const express= require('express');
const app = express();

app.get("/test", async (req, res) => {
  try {
    const Product = require("./models/Product"); // adjust path
    const products = await Product.find();
    console.log("Fetched products:", products); // shows in terminal
    res.json(products); // sends response
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
