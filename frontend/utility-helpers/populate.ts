const axios = require("axios");

const populate = async () => {
  let token1;
  let body;
  let config;

  // Issue an access token for User 1.
  body = {};
  config = {
    headers: {
      "Content-Type": "application/json",
    },
    auth: {
      username: "john.doe@protonmail.com",
      password: "123",
    },
  };

  try {
    const response = await axios.post("http://localhost:5000/api/tokens", body, config);
    token1 = response.data.token;
  } catch (err) {
    console.error("'Issue an access token for User 1.' has failed...");
    console.error(err.toStrng());
    throw err;
  }

  // Create several Entry resources for User 1.
  const entryPayloads = [
    {
      timezone: "-05:00",
      localTime: "2021-01-17 19:00",
      content: "Hello from New York!",
    },
    {
      timezone: "-08:00",
      localTime: "2021-02-17 16:00",
      content: "Hello from San Francisco!",
    },
    {
      timezone: "-06:00",
      localTime: "2021-03-17 18:00",
      content: "Hello from Wisconsin!",
    },
  ];

  for (let eP of entryPayloads) {
    body = JSON.stringify(eP);
    config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token1,
      },
    };
    try {
      const response = await axios.post(
        "http://localhost:5000/api/entries",
        eP,
        config
      );
    } catch (err) {
      console.error("'Create several entry resources for User 1.' has failed...");
      console.error("... with the following entry in entryPayloads:");
      console.error(eP);
      console.error("...");
      console.error(err.toString());
      console.error(err);
      throw err;
    }
  }
};

const promise = populate();

promise
  .then(() => {
    console.log(`${new Date().toISOString()} - ${__filename} - success`);
  })
  .catch(() => {
    console.log(`${new Date().toISOString()} - ${__filename} - failure`);
  });
