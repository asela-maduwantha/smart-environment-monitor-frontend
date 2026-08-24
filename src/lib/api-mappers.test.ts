import { describe, expect, it } from "vitest";
import { mapChartReading, mapDevice, mapReading } from "./api-mappers";

const reading = {
  id: "reading-1", deviceId: "ESP32_01", temperature: 28.2, humidity: 59.9,
  light: 987, motion: false, wifiSignal: -49, recordedAt: "2026-08-24T18:47:34.555Z",
};

describe("backend API mappers", () => {
  it("uses the public deviceId for API navigation", () => {
    const device = mapDevice({ id: "database-uuid", deviceId: "ESP32_01", name: "Node", location: "Room", status: "OFFLINE", lastSeenAt: reading.recordedAt, latestReading: reading });
    expect(device.id).toBe("ESP32_01");
    expect(device.status).toBe("offline");
    expect(device.wifiRssi).toBe(-49);
  });

  it("maps telemetry and chart field names", () => {
    expect(mapReading(reading).temperatureC).toBe(28.2);
    expect(mapReading(reading).timestamp).toBe(reading.recordedAt);
    expect(mapChartReading({ timestamp: reading.recordedAt, temperature: 28, humidity: 60, light: 900 }).lightValue).toBe(900);
  });
});
