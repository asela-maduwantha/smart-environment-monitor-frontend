import { describe, expect, it, vi } from "vitest";
import { isTelemetryFresh, rssiQuality } from "./utils";
describe("rssiQuality",()=>{it("maps expected bands",()=>{expect(rssiQuality(-48)).toBe("Excellent");expect(rssiQuality(-58)).toBe("Good");expect(rssiQuality(-68)).toBe("Fair");expect(rssiQuality(-80)).toBe("Weak")})});
describe("isTelemetryFresh",()=>{it("uses an adaptive threshold",()=>{vi.useFakeTimers();vi.setSystemTime(new Date("2026-08-24T12:00:20Z"));expect(isTelemetryFresh("2026-08-24T12:00:10Z",5)).toBe(true);expect(isTelemetryFresh("2026-08-24T12:00:00Z",5)).toBe(false);expect(isTelemetryFresh("2026-08-24T12:00:00Z",15)).toBe(true);vi.useRealTimers()})});
