const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

function convert(object) {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
}

app.get("/players/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const booksArray = await db.all(getBooksQuery);
  const booksList = booksArray.map(convert);
  response.send(booksList);
});

app.post("/players/", async (request, response) => {
  const requestBody = request.body;
  const addPlayerQuery = `
    INSERT INTO
    cricket_team(player_name,jersey_number,role)
    VALUES
    ('${requestBody.playerName}',
        ${requestBody.jerseyNumber},
        '${requestBody.role}');
    `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id= ${playerId};`;
  const booksArray = await db.get(getBooksQuery);
  response.send(convert(booksArray));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const requestBody = request.body;
  const addPlayerQuery = `
    UPDATE
    cricket_team
    SET
    player_name='${requestBody.playerName}',
    jersey_number=${requestBody.jerseyNumber},
    role='${requestBody.role}'
    WHERE
    player_id = ${playerId};
    `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
        DELETE FROM 
        cricket_team
        WHERE 
        player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
