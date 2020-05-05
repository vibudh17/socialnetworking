const express = require('express');
const app = express();
const connectDB = require('./config/db');
const port = process.env.port || 5000;
app.listen(port, () => console.log(`Server started on port: ${port}`));
//Connect DB
connectDB();
app.get('/', (req, res) => res.send('API Running!'));
//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
