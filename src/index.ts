import { Elysia } from "elysia";

const app = new Elysia().get("/", () => {
  return "Hello Elysia"
}).listen(3000);