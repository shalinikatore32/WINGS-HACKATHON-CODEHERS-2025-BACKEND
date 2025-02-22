const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connection = require("./connection/connectDB");
const userRouter = require("./routes/user");
const eventRouter = require("./routes/event");
const routes = require("./routes/router"); 
const publicEventRouter = require("./routes/public-eventRoute");
const eventRegisterRoute = require("./routes/eventRegisterRoute");
const ticketRouter = require("./routes/ticketRoute");
// const eventRoutes = require("./routes/eventRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");
const feedbackRoutes=require("./routes/feedbackRoute");
const { sendAttendanceLinks } = require("./controllers/cronJobs");
const attendeeCountRoute=require("./routes/attendeeCountRoute");
const eventTrendsRoute = require("./routes/eventTrendsRoutes")
const eventDistributionRoute=require("./routes/eventDistribution");


const corsOptions = {
  origin: "http://localhost:3000",
  methods: "POST,GET,PUT,DELETE,PATCH,HEAD",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());


app.use("/api", routes);
app.use('/api', userRouter);
app.use("/api", publicEventRouter);
app.use("/api", ticketRouter);
app.use("/api", eventRouter);
// app.use("/events", eventRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/feedback", feedbackRoutes);
sendAttendanceLinks();

app.use("/api", eventRegisterRoute);
app.use("/api", eventDistributionRoute);
app.use("/api", attendeeCountRoute);
app.use("/api",eventTrendsRoute);

connection()
  .then(() => {
    console.log("Your database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});