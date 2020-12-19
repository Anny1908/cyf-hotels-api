const express = require("express");
const { request } = require("http");
const app = express();
const port = 7950;
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_hotels',
    password: 'migracode20',
    port: 5432
});

app.get("/hotels", function(req, res) {
    pool
        .query("SELECT * FROM hotels")
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.post("/hotels", function(req, res) {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;

    if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
        return res
            .status(400)
            .send("The number of rooms should be a positive integer.");
    }

    pool
        .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
        .then((result) => {
            if (result.rows.length > 0) {
                return res
                    .status(400)
                    .send("A hotel with the same name already exists!");
            } else {
                const query =
                    "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
                pool
                    .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
                    .then(() => res.send("Hotel created!"))
                    .catch((e) => console.error(e));
            }
        });
})

app.post("/customers", function(req, res) {
    const newClienteName = req.body.name;
    const newClienteEmail = req.body.email;
    const newClienteAddress = req.body.postcode;
    const newClienteCity = req.body.city;
    const newClientePostcode = req.body.postcode;
    const newClienteCountry = req.body.country;

    pool
        .query("SELECT * FROM customers WHERE name=$1", [newClienteName])
        .then((result) => {
            if (result.rows.length > 0) {
                return res
                    .status(400)
                    .send("A customers with the same name already exists!");
            } else {
                const query =
                    "INSERT INTO customers (name, email, address, city, postcode, country)VALUES ($1, $2, $3, $4, $5, $6)";
                pool
                    .query(query, [newClienteName, newClienteEmail, newClienteAddress, newClienteCity, newClientePostcode, newClienteCountry])
                    .then(() => res.send("Customers Name created!"))
                    .catch((e) => console.error(e));
            }
        });
})

app.get("/hotels", function(req, res) {
    const hotelNameQuery = req.query.name;
    let query = `SELECT * FROM hotels ORDER BY name`;

    if (hotelNameQuery) {
        query = `SELECT * FROM hotels WHERE name LIKE '%${hotelNameQuery}%' ORDER BY name`;
    }

    pool
        .query(query)
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.get("/hotels/:hotelId", function(req, res) {
    const hotelId = req.params.hotelId;

    pool
        .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.get("/customers", function(req, res) {
    let query = `SELECT * FROM customers ORDER BY name`;
    pool
        .query(query)
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.get("/customers/:customerId", function(req, res) {
    const customerId = req.params.customerId;

    pool
        .query("SELECT * FROM customers WHERE id=$1", [customerId])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.get("/customers/:customerId/bookings", function(req, res) {
    const customerId = req.params.customerId;
    pool
        .query(`SELECT bookings.checkin_date, bookings.nights, hotels.name, hotels.postcode FROM bookings INNER JOIN hotels ON hotels.id = bookings.hotel_id where bookings.customer_id = $1`, [customerId])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));

})

app.put("/customers/:customerId", function(req, res) {
    const customerId = req.params.customerId;
    const newEmail = req.body.email;
    if (newEmail === "") {
        return res
            .status(400)
            .send("Error campo vacio ");
    }
    pool
        .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
        .then(() => res.send(`Customer ${customerId} updated!`))
        .catch((e) => console.error(e));
})


// ENDPOINT ENTRIES
/*
const getTonto = (request, response) => {
    response.send('OKAY :) !')
}

const getFromDatabase = (request, response) => {
    pool.query('select * from hotels', (error, result) => {
        response.send(result.rows)
    });
}

const getProductsAndSupplierNames = (request, response) => {
    pool.query(`select p.product_name, s.supplier_name from products p
    join suppliers s on s.id = p.supplier_id`, (result, error) => {
        response.send(result.rows)
    });
}

const getProductsAndSupplierNameByProductName = (request, response) => {
        // /products?name=Oly
        let name = request.query.name
        pool.query(`select p.product_name, s.supplier_name from products p
    join suppliers s on s.id = p.supplier_id
    where p.product_name like '%${name}%';`, (error, result) => {
            response.send(result.rows)
        });
    }
    /*app.get("/hotels", function(req, res) {
        pool.query('SELECT * FROM hotels', (error, result) => {
            res.json(result.rows);
        });
    // FUNCTIONS
    // ENDPOINTS

app.get('/get-tonto', getTonto)

app.get('/get-from-db', getFromDatabase)

// If you don't have it already, add a new GET endpoint /products to load all the 
//product names along with their supplier names
app.get('/products', getProductsAndSupplierNames)

// Update the previous GET endpoint /products to filter the list of products by 
//name using a query parameter, for example /products?name=Cup. This endpoint should 
//still work even if you don't use the name query parameter!
app.get('/products-by-name', getProductsAndSupplierNameByProductName)
*/

app.listen(port, () => console.log(`Great! Server listening at port ${port} ...`))