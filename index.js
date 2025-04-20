const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const metadataRoutes = require('./routes/metadata.routes');
const contactsRoutes = require('./routes/contact.routes');
const companyRoutes = require('./routes/company.routes');
const configurationRoutes = require('./routes/configuration.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/api/v1/metadata', metadataRoutes);
app.use('/api/v1/contacts', contactsRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/configurations', configurationRoutes);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
