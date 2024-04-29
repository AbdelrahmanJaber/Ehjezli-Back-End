const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL);

mongoose.connection.on('connected', () => {
    console.log("connected to mongo instance");
});

mongoose.connection.on('error', (err) => {
    console.log("Error connected to mongo instance", err);
});
