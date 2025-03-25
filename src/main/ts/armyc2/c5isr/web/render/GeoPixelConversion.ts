


import { type double } from "../../../../armyc2/c5isr/graphics2d/BasicTypes";
import { RendererSettings } from "../../renderer/utilities/RendererSettings";



export class GeoPixelConversion {

    public static readonly INCHES_PER_METER: double = 39.3700787;
    public static readonly METERS_PER_DEG: double = 40075017 / 360; // Earth's circumference in meters / 360 degrees

    public static metersPerPixel(scale: double): double {
        let step1: double = scale / RendererSettings.getInstance().getDeviceDPI();
        return step1 / GeoPixelConversion.INCHES_PER_METER;
    }

    public static lat2y(latitude: double, scale: double, latOrigin: double, metPerPix: double): double {

        let latRem: double = -(latitude - latOrigin);
        let pixDis: double = (latRem * GeoPixelConversion.METERS_PER_DEG) / metPerPix;
        return pixDis;
    }

    public static y2lat(yPosition: double, scale: double, latOrigin: double, metPerPix: double): double {

        let latitude: double = latOrigin - ((yPosition * metPerPix) / GeoPixelConversion.METERS_PER_DEG);
        return latitude;
    }

    public static long2x(longitude: double, scale: double, longOrigin: double, latitude: double, metPerPix: double, normalize: boolean): double {

        let longRem: double = longitude - longOrigin;
        if (normalize) {
            if (longRem > 180) {
                longRem -= 360;
            }
            if (longRem < -180) {
                longRem += 360;
            }
        }
        let metersPerDeg: double = GeoPixelConversion.GetMetersPerDegAtLat(latitude);
        let pixDis: double = (longRem * metersPerDeg) / metPerPix;
        return pixDis;
    }

    public static x2long(xPosition: double, scale: double, longOrigin: double, latitude: double, metPerPix: double): double {

        let metersPerDeg: double = GeoPixelConversion.GetMetersPerDegAtLat(latitude);
        let longitude: double = longOrigin + ((xPosition * metPerPix) / metersPerDeg);

        if (longitude < -180) {
            longitude += 360;
        } else {
            if (longitude > 180) {
                longitude -= 360;
            }
        }


        return longitude;
    }

    public static Deg2Rad(deg: double): double {
        let conv_factor: double = (2.0 * Math.PI) / 360.0;
        return (deg * conv_factor);
    }

    public static GetMetersPerDegAtLat(lat: double): double {
        // Convert latitude to radians
        lat = GeoPixelConversion.Deg2Rad(lat);
        // Set up "Constants"
        let p1: double = 111412.84; // longitude calculation term 1

        let p2: double = -93.5; // longitude calculation term 2

        let p3: double = 0.118; // longitude calculation term 3

        // Calculate the length of a degree of longitude in meters at given
        // latitude
        let longlen: double = (p1 * Math.cos(lat)) + (p2 * Math.cos(3 * lat)) + (p3 * Math.cos(5 * lat));

        return longlen;
    }
}
