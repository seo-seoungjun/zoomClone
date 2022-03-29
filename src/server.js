import express from "express";
import "dotenv/config";

const env = process.env;
const app = express();

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);
app.use("/static", express.static(`${__dirname}/public/js/app.js`));
app.get("/", (req, res) => res.render("index"));
app.get("/*", (req, res) => res.redirect("index"));

app.listen(env.PORT, () =>
  console.log(`Listening to http://localhost:${env.PORT}`)
);
