const express = require("express");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const metadataRoutes = require("./routes/metadata.routes");
const contactsRoutes = require("./routes/contacts.routes");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Initialize Sequelize with Neon Postgres
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // For Neon's self-signed cert
    },
  },
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

// app.get("/", (req, res) => {
//   res.send("Hello, Express with Postgres and Sequelize!");
// });

app.use("/api/v1/metadata", metadataRoutes);
app.use("/api/v1/contacts", contactsRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Export the sequelize object so that models can use it
module.exports = { sequelize };
