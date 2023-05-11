const routers = {};

routers.patient = require("./patientRoutes");
routers.doctor = require("./doctorRoutes");
routers.chatbot = require("./chatbotRoutes");
routers.hospital = require("./hospitalRoutes");
routers.experience = require("./experienceRoutes");
routers.service = require("./serviceRoutes");
routers.family = require("./familyRoutes");
routers.scan = require("./scanRoutes");
routers.report = require("./reportRoutes");
routers.comment = require("./commentRoutes");
routers.post = require("./postRoutes");
routers.community = require("./communityRoutes");
routers.file = require("./fileRoutes");
routers.message = require("./messageRoutes");
routers.appointment = require("./appointmentRoutes");
routers.ml = require("./MLroutes");
routers.notification = require("./notificationRoutes");
routers.stripe = require("./stripeRoutes");
routers.appointmentRequest = require("./appointmentRequestRoutes");
routers.admin = require("./adminRoutes");
routers.review = require("./reviewRoutes");
routers.complaint = require('./complaintRoutes');

module.exports = routers;
