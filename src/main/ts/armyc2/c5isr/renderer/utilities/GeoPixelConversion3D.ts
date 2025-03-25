import {type double } from "../../graphics2d/BasicTypes";

import { GeoPixelConversion } from "../../web/render/GeoPixelConversion"

/**
 *
 * 
 */
export class GeoPixelConversion3D {
    public static metersPerPixel(scale: double): double {
        return GeoPixelConversion.metersPerPixel(scale);
    }

    public static lat2y(latitude: double, scale: double, latOrigin: double, metPerPix: double): double {

        let latRem: double = Math.abs(latitude - latOrigin);
        let pixDis: double = 0;
        if (latRem > 0) {
            pixDis = (latRem * GeoPixelConversion.METERS_PER_DEG) / metPerPix;
            if (latitude > latOrigin)//was < M. Deutch 6-20-11
            {
                pixDis = -pixDis;
            }
        }
        return pixDis;
    }

    public static y2lat(yPosition: double, scale: double, latOrigin: double, metPerPix: double): double {

        let latitude: double = latOrigin;
        if (yPosition !== 0) {
            latitude = latOrigin - ((yPosition * metPerPix) / GeoPixelConversion.METERS_PER_DEG);//was + M. Deutch 6-18-11
        }
        return latitude;
    }

    public static long2x(longitude: double, scale: double, longOrigin: double, latitude: double, metPerPix: double): double {

        let longRem: double = Math.abs(longitude - longOrigin);
        let metersPerDeg: double = GeoPixelConversion3D.GetMetersPerDegAtLat(latitude);
        let pixDis: double = 0;
        if (longRem > 0) {
            pixDis = (longRem * metersPerDeg) / metPerPix;
            if (longitude < longOrigin) {
                pixDis = -pixDis;
            }
        }
        return pixDis;
    }

    public static x2long(xPosition: double, scale: double, longOrigin: double, latitude: double, metPerPix: double): double {

        let metersPerDeg: double = GeoPixelConversion3D.GetMetersPerDegAtLat(latitude);
        let longitude: double = longOrigin;
        if (xPosition !== 0) {
            longitude = longOrigin + ((xPosition * metPerPix) / metersPerDeg);
        }
        return longitude;
    }


    public static Deg2Rad(deg: double): double {
        let conv_factor: double = (2.0 * Math.PI) / 360.0;
        return (deg * conv_factor);
    }

    public static GetMetersPerDegAtLat(lat: double): double {
        // Convert latitude to radians
        lat = GeoPixelConversion3D.Deg2Rad(lat);
        // Set up "Constants"
        let p1: double = 111412.84;		// longitude calculation term 1

        let p2: double = -93.5;			// longitude calculation term 2

        let p3: double = 0.118;			// longitude calculation term 3

        // Calculate the length of a degree of longitude in meters at given latitude
        let longlen: double = (p1 * Math.cos(lat)) + (p2 * Math.cos(3 * lat)) + (p3 * Math.cos(5 * lat));

        return longlen;
    }


}
