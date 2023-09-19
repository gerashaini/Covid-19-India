const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => { I
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });                                                I
    app.Listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieNamePascalCase = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_Name,
    population: dbObject.population,
  };
};

//1 Returns a list of all states in the state table
app.get("/states/", async (request, response) => {
  const getAllStateQuery = `
        SELECT
        *
        FROM
        state;`;
  const statesArray = await db.all(getAllStateQuery);
  response.send(
    statesArray.map((stateobject) => convertMovieNamePascalCase(stateobject))
  );
});

//2 Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
        SELECT
        *
        FROM
        state
        WHERE
        state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  //console.log(state);
  response.send(convertStateNamePascalCase(state));
});

//3 Creates a district in the district table. district_id is auto-incremented
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const { directorId, movieName, Lead Actor } = movieDetails;
  const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
  } = districtDetails;
  const addDistrictQuery = `
        INSERT INTO
        district (district_name,state_id,cases,cured,active,deaths)
        VALUES
        (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths});`;

  const dbResponse = await db.run(addDistrictQuery);
  //console.log(dbResponse);
  response.send("District Successfully Added");
});

const convertDistrictPascalCase = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//4 Returns a district based on the district ID
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
        SELECT
        *
        FROM
        district
        WHERE
        district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  //console.log(district);
  response.send(convertDistrictsPascalCase(district));
});


//5 Deletes the district from the district table based on the district ID

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
        DELETE FROM
        district
        WHERE
        district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//6 Updates the details of a specific district based on the district ID

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
  } = districtDetails;
  const updateDistrictQuery = `
        UPDATE
        district (district_name,state_id,cases,cured,active,deaths)
        SET
        district_name = '${districtName}',
        state_id =${stateId},
        cases =${cases},
        cured =${cured},
        active =${active},
        deaths =${deaths}
        WHERE
        district_id =${districtId};`;
  await db.run(updateDistrictQuery);
  //console.log(dbResponse);
  response.send("District Details Updated");
});


//7 Returns the statistics of total cases, cured, active, deaths of a specific state based on the state ID
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getDistrictQuery = `
        SELECT
        SUM(cases) as totalCases,
        SUM(cured) as totalCured,
        SUM(active) as totalActive,
        SUM(deaths) as totalDeaths,
        FROM
        district
        WHERE
        state_id = ${stateId};`;
  const district = await db.get(getDistrictQuery);
  //console.log(district);
  response.send(district);
});

//7 Returns an object containing the state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
        SELECT
        State_name AS stateN
        FROM
        district INNER JOIN state ON district.state_id = state.state_id
        WHERE
        district_id = ${districtId};`;
  const stateName = await db.get(getDistrictQuery);
  //console.log(stateName);
  response.send(stateName);
});

module.exports = app;
