const express = require('express');
const app = express();

app.use(express.json());

app.use('/users',    require('./src/router/user.router'));
app.use('/products', require('./src/router/product.router'));
app.use('/orders',   require('./src/router/order.router'));

module.exports = app;