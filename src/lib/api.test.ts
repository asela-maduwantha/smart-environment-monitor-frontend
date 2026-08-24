import { describe, expect, it } from "vitest";
import { ApiError, unwrapCollection, unwrapEntity } from "./api";

describe("API payload normalization", () => {
  it("accepts direct and named collection payloads", () => {
    const devices = [{ id: "ESP32_01" }];
    expect(unwrapCollection(devices, "devices")).toEqual(devices);
    expect(unwrapCollection({ devices }, "devices")).toEqual(devices);
  });

  it("unwraps named entity payloads", () => {
    const device = { id: "ESP32_01" };
    expect(unwrapEntity({ device }, "device")).toEqual(device);
  });

  it("rejects malformed collection payloads", () => {
    expect(() => unwrapCollection({ devices: null }, "devices")).toThrow(ApiError);
  });
});
