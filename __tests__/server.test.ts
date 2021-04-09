import server from "../src/server";

afterEach((done) => {
  server.close();
  done();
});

describe("/api/users", () => {
  test("should verify that 2 = 2", () => {
    const a = 2;
    expect(a).toEqual(2);
  });
});
