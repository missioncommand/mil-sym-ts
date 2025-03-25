
import { type double } from "../../graphics2d/BasicTypes";

/**
 * Units of Measure to be used with {@link MilStdAttributes#DistanceUnits}
 * Default is meters.
 */
export class DistanceUnit {
    private static readonly FEET_PER_METER: double = 3.28084;
    private static readonly FLIGHT_LEVEL_PER_METER: double = 0.0328084; // hundreds of feet
    public readonly conversionFactor: double = 0;
    public readonly label: string;

    public constructor(conversionFactor: double, label: string) {
        this.conversionFactor = conversionFactor;
        this.label = label;
    }

    public static parse(distanceUnitText: string): DistanceUnit | null {
        if (distanceUnitText == null) {
            return null;
        }
        let parts: string[] = distanceUnitText.split(",");
        if (parts.length !== 2) {
            return null;
        }
        let conversionFactor: double = parseFloat(parts[0].trim());
        let label: string = parts[1].trim();

        return new DistanceUnit(conversionFactor, label);
    }

    public toAttribute(): string {
        return this.conversionFactor + "," + this.label;
    }

    public static METERS: DistanceUnit = new DistanceUnit(1, "M");
    public static FEET: DistanceUnit = new DistanceUnit(DistanceUnit.FEET_PER_METER, "FT");
    public static FLIGHT_LEVEL: DistanceUnit = new DistanceUnit(DistanceUnit.FLIGHT_LEVEL_PER_METER, "FL");
}