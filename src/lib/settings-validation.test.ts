import { describe, expect, it } from "vitest";
import { validateSettings } from "./settings-validation";
const valid={highTemperature:30,lowTemperature:18,highHumidity:80,lowHumidity:30,lowLight:100,highLight:900,samplingIntervalSeconds:5,publishIntervalSeconds:10};
describe("validateSettings",()=>{it("accepts valid settings",()=>expect(validateSettings(valid)).toEqual({}));it("rejects inverted ranges and invalid intervals",()=>{const errors=validateSettings({...valid,lowTemperature:31,samplingIntervalSeconds:0});expect(errors.lowTemperature).toBeTruthy();expect(errors.samplingIntervalSeconds).toBeTruthy()})});
