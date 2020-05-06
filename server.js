const express = require('express');
const app = express();
const connectDB = require('./config/db');
const port = process.env.port || 5000;
app.listen(port, () => console.log(`Server started on port: ${port}`));
//Connect DB
connectDB();

//Init Middleware
//Instead of doing bodyParser.json(), we are gonna to use express.json
app.use(express.json({ extended: false })); // This line allow us to send data through req.body

app.get('/', (req, res) => res.send('API Running!'));

//Define Routes for testing
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
