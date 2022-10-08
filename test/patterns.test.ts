import { assertEquals, assertThrows } from "./deps.ts";
import { Patterns } from "../lib/patterns.ts";

Deno.test("it works", () => {
  const patterns = new Patterns();

  /**
   * All .ts files except ./server.ts
   */
  patterns.add([
    "./**/*.ts",
    "!./server.ts",
  ]);

  assertThrows(() => patterns.test("test"));
  patterns.build();

  assertEquals(patterns.test("./server.ts"), false);
  assertEquals(patterns.test("./client.ts"), true);
  assertEquals(patterns.test("./src/app.ts"), true);
});
