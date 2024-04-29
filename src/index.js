const express = require("express");
require("./db/mongoose");

const driverRouter = require("./routers/driver");
const driverCarInfoRouter = require("./routers/driverCarInfo");
const availableDriversRouter = require("./routers/availableDrivers");
const ordersDriversRouter = require("./routers/ordersDrivers");
const MessagesRouter = require("./routers/Messages");
const Traffic = require("./routers/traffic");

const studentRouter = require("./routers/student");
const originPlacesRouter = require("./routers/originPlaces");
const carRouter = require("./routers/cars");
const destinationPlacesRouter = require("./routers/destinationPlaces");

const MlForOrdersRouter = require("./routers/MlForOrders");

const adminRouter = require("./routers/admin");

const orderRouter = require("./routers/order");

const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.use(express.json());

app.use(driverRouter);

app.use(driverCarInfoRouter);

app.use(availableDriversRouter);

app.use(studentRouter);

app.use(originPlacesRouter);

app.use(carRouter);

app.use(destinationPlacesRouter);

app.use(adminRouter);

app.use(MlForOrdersRouter);

app.use(orderRouter);

app.use(ordersDriversRouter);

app.use(MessagesRouter);

app.use(Traffic);

app.listen(PORT, () => {
  console.log("Scheduler Server is up and running on port " + PORT);
});
