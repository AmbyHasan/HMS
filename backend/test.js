import db from "./src/models/index.js";

await db.sequelize.authenticate();

const users = await db.User.findAll({
  include: [
    {
      model: db.Hospital,
      as: "hospital",
    },
  ],
});

console.log(users.length);