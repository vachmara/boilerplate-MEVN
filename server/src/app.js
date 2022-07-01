const dbConfig = require("../config/db.config")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.get("/", (req, res) => {
	res.json({ message: "Sparkso API" });
  });

const db = require("../models");
const Role = db.role;
db.mongoose
  .connect(`mongodb://${dbConfig.USER}:${dbConfig.PWD}@${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      for(let i = 0; i < db.ROLES.length; i++){
        new Role({
          name: db.ROLES[i]
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
          console.log("added '"+ db.ROLES[i] + "' to roles collection");
        });
      }
    }
  });
}
require('../routes/auth.routes')(app);
require('../routes/user.routes')(app);

app.listen(process.env.PORT || 3333)