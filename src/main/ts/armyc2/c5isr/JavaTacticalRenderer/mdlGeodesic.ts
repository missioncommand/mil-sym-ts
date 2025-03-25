import { type double, type int } from "../graphics2d/BasicTypes";

import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"

/**
 * Class to calculate the geodesic based shapes for the Fire Support Areas
 *
 */
export class mdlGeodesic {
    private static readonly _className: string = "mdlGeodesic";
    private static readonly sm_a: double = 6378137;

    private static DegToRad(deg: double): double {
        return deg / 180.0 * Math.PI;
    }

    private static RadToDeg(rad: double): double {
        return rad / Math.PI * 180.0;
    }
    /**
     * Returns the azimuth from true north between two points
     * @param c1
     * @param c2
     * @return the azimuth from c1 to c2
     */
    public static GetAzimuth(c1: POINT2,
        c2: POINT2): double {//was private
        let theta: double = 0;
        try {
            let lat1: double = mdlGeodesic.DegToRad(c1.y);
            let lon1: double = mdlGeodesic.DegToRad(c1.x);
            let lat2: double = mdlGeodesic.DegToRad(c2.y);
            let lon2: double = mdlGeodesic.DegToRad(c2.x);
            //formula
            //θ = atan2( sin(Δlong).cos(lat2),
            //cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong) )
            //var theta:Number = Math.atan2( Math.sin(lon2-lon1)*Math.cos(lat2),
            //Math.cos(lat1)*Math.sin(lat2) − Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1) );
            let y: double = Math.sin(lon2 - lon1);
            y *= Math.cos(lat2);
            let x: double = Math.cos(lat1);
            x *= Math.sin(lat2);
            let z: double = Math.sin(lat1);
            z *= Math.cos(lat2);
            z *= Math.cos(lon2 - lon1);
            x = x - z;
            theta = Math.atan2(y, x);
            theta = mdlGeodesic.RadToDeg(theta);
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                //clsUtility.WriteFile("Error in mdlGeodesic.GetAzimuth");
                ErrorLogger.LogException(mdlGeodesic._className, "GetAzimuth",
                    new RendererException("Failed inside GetAzimuth", exc));
            } else {
                throw exc;
            }
        }
        return theta;//RadToDeg(k);
    }
    /**
     * Calculates the distance in meters between two geodesic points.
     * Also calculates the azimuth from c1 to c2 and from c2 to c1.
     *
     * @param c1 the first point
     * @param c2 the last point
     * @param a12 OUT - an object with a member to hold the calculated azimuth in degrees from c1 to c2
     * @param a21 OUT - an object with a member to hold the calculated azimuth in degrees from c2 to c1
     * @return the distance in meters between c1 and c2
     */
    public static geodesic_distance(c1: POINT2,
        c2: POINT2,
        a12: ref<number[]> | null,
        a21: ref<number[]> | null): double {
        let h: double = 0;
        try {
            //formula
            //R = earth’s radius (mean radius = 6,371km)
            //Δlat = lat2− lat1
            //Δlong = long2− long1
            //a = sin²(Δlat/2) + cos(lat1).cos(lat2).sin²(Δlong/2)
            //c = 2.atan2(√a, √(1−a))
            //d = R.c
            if (a12 != null && a21 != null) {
                a12.value = new Array<number>(1);
                a21.value = new Array<number>(1);
                //set the azimuth
                a12.value[0] = mdlGeodesic.GetAzimuth(c1, c2);
                a21.value[0] = mdlGeodesic.GetAzimuth(c2, c1);
            }
            //c1.x+=360;
            let dLat: double = mdlGeodesic.DegToRad(c2.y - c1.y);
            let dLon: double = mdlGeodesic.DegToRad(c2.x - c1.x);

            let b: double = 0;
            let lat1: double = 0;
            let lat2: double = 0;
            let e: double = 0;
            let f: double = 0;
            let g: double = 0;
            let k: double = 0;
            b = Math.sin(dLat / 2);
            lat1 = mdlGeodesic.DegToRad(c1.y);
            lat2 = mdlGeodesic.DegToRad(c2.y);
            e = Math.sin(dLon / 2);
            f = Math.cos(lat1);
            g = Math.cos(lat2);
            //uncomment this to test calculation
            //var a:Number = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(DegToRad(c1.y)) * Math.cos(DegToRad(c2.y)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            let a: double = b * b + f * g * e * e;
            h = Math.sqrt(a);
            k = Math.sqrt(1 - a);
            h = 2 * Math.atan2(h, k);
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                //clsUtility.WriteFile("Error in mdlGeodesic.geodesic_distance");
                ErrorLogger.LogException(mdlGeodesic._className, "geodesic_distance",
                    new RendererException("Failed inside geodesic_distance", exc));
            } else {
                throw exc;
            }
        }
        return mdlGeodesic.sm_a * h;
    }
    /**
     * Calculates a geodesic point and given distance and azimuth from the srating geodesic point
     *
     * @param start the starting point
     * @param distance the distance in meters
     * @param azimuth the azimuth or bearing in degrees
     *
     * @return the calculated point
     */
    public static geodesic_coordinate(start: POINT2,
        distance: double,
        azimuth: double): POINT2 {
        let pt: POINT2;
        try {
            //formula
            //lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(θ))
            //lon2 = lon1 + atan2(sin(θ)*sin(d/R)*cos(lat1), cos(d/R)−sin(lat1)*sin(lat2))

            let a: double = 0;
            let b: double = 0;
            let c: double = 0;
            let d: double = 0;
            let e: double = 0;
            let f: double = 0;
            let g: double = 0;
            let h: double = 0;
            let
                j: double = 0;
            let k: double = 0;
            let l: double = 0;
            let m: double = 0;
            let n: double = 0;
            let p: double = 0;
            let q: double = 0;

            a = mdlGeodesic.DegToRad(start.y);
            b = Math.cos(a);
            c = mdlGeodesic.DegToRad(azimuth);
            d = Math.sin(a);
            e = Math.cos(distance / mdlGeodesic.sm_a);
            f = Math.sin(distance / mdlGeodesic.sm_a);
            g = Math.cos(c);
            //uncomment to test calculation
            //var lat2:Number = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(DegToRad(distance / sm_a)) + Math.cos(DegToRad(start.y)) * Math.sin(DegToRad(distance / sm_a)) * Math.cos(DegToRad(azimuth))));
            //lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(θ))
            //var lat2:Number = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(distance / sm_a) + Math.cos(DegToRad(start.y)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(azimuth))));
            //double lat2 = RadToDeg(Math.asin(Math.sin(DegToRad(start.y)) * Math.cos(distance / sm_a) + Math.cos(DegToRad(start.y)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(azimuth))));
            let lat: double = mdlGeodesic.RadToDeg(Math.asin(d * e + b * f * g));
            h = Math.sin(c);
            k = Math.sin(h);
            l = Math.cos(a);
            m = mdlGeodesic.DegToRad(lat);
            n = Math.sin(m);
            p = Math.atan2(h * f * b, e - d * n);
            //uncomment to test calculation
            //var lon2:Number = start.x + DegToRad(Math.atan2(Math.sin(DegToRad(azimuth)) * Math.sin(DegToRad(distance / sm_a)) * Math.cos(DegToRad(start.y)), Math.cos(DegToRad(distance / sm_a)) - Math.sin(DegToRad(start.y)) * Math.sin(DegToRad(lat))));
            //lon2 = lon1 + atan2(sin(θ)*sin(d/R)*cos(lat1), cos(d/R)−sin(lat1)*sin(lat2))
            //var lon2:Number = start.x + RadToDeg(Math.atan2(Math.sin(DegToRad(azimuth)) * Math.sin(distance / sm_a) * Math.cos(DegToRad(start.y)), Math.cos(distance / sm_a) - Math.sin(DegToRad(start.y)) * Math.sin(DegToRad(lat2))));
            let lon: double = start.x + mdlGeodesic.RadToDeg(p);
            pt = new POINT2(lon, lat);
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in mdlGeodesic.geodesic_distance");
                ErrorLogger.LogException(mdlGeodesic._className, "geodesic_coordinate",
                    new RendererException("Failed inside geodesic_coordinate", exc));
            } else {
                throw exc;
            }
        }
        return pt;
    }
    /**
     * Calculates an arc from geodesic point and uses them for the change 1 circular symbols
     *
     * @param pPoints array of 3 points, currently the last 2 points are the same. The first point
     * is the center and the next point defines the radius.
     *
     * @return points for the geodesic circle
     */
    public static GetGeodesicArc(pPoints: POINT2[]): Array<POINT2> | null {
        let pPoints2: Array<POINT2> = new Array();
        try {
            if (pPoints == null) {
                return null;
            }
            if (pPoints.length < 3) {
                return null;
            }

            let ptCenter: POINT2 = new POINT2(pPoints[0]);
            let pt1: POINT2 = new POINT2(pPoints[1]);
            let pt2: POINT2 = new POINT2(pPoints[2]);
            let ptTemp: POINT2;
            let a12b: ref<number[]> = new ref();
            let dist2: double = 0.0;
            let dist1: double = 0.0;
            let a12: ref<number[]> = new ref();
            let a21: ref<number[]> = new ref();
            //distance and azimuth from the center to the 1st point
            dist1 = mdlGeodesic.geodesic_distance(ptCenter, pt1, a12, a21);
            let saveAzimuth: double = a21.value[0];
            //distance and azimuth from the center to the 2nd point
            dist2 = mdlGeodesic.geodesic_distance(ptCenter, pt2, a12b, a21);
            //if the points are nearly the same we want 360 degree range fan
            if (Math.abs(a21.value[0] - saveAzimuth) <= 1) {
                if (a12.value[0] < 360) {
                    a12.value[0] += 360;
                }

                a12b.value[0] = a12.value[0] + 360;
            }

            let a12c: ref<number[]> = new ref();
            let j: int = 0;
            if (a12b.value[0] < 0) {
                a12b.value[0] = 360 + a12b.value[0];
            }
            if (a12.value[0] < 0) {
                a12.value[0] = 360 + a12.value[0];
            }
            if (a12b.value[0] < a12.value[0]) {
                a12b.value[0] = a12b.value[0] + 360;
            }
            a12c.value = new Array<number>(1);
            for (j = 0; j <= 100; j++) {

                a12c.value[0] = a12.value[0] + (j as double / 100.0) * (a12b.value[0] - a12.value[0]);
                ptTemp = mdlGeodesic.geodesic_coordinate(ptCenter, dist1, a12c.value[0]);
                pPoints2.push(ptTemp);
            }

            //if the points are nearly the same we want 360 degree range fan
            //with no line from the center
            if (Math.abs(a21.value[0] - saveAzimuth) > 1) {
                pPoints2.push(ptCenter);
            }

            if (a12.value[0] < a12b.value[0]) {
                pPoints2.push(pt1);
            } else {
                pPoints2.push(pt2);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in mdlGeodesic.GetGeodesicArc");
                ErrorLogger.LogException(mdlGeodesic._className, "GetGeodesicArc",
                    new RendererException("Failed inside GetGeodesicArc", exc));
            } else {
                throw exc;
            }
        }
        return pPoints2;
    }
    /**
     * Calculates the sector points for a sector range fan.
     *
     * @param pPoints array of 3 points. The first point
     * is the center and the next two points define either side of the sector
     * @param pPoints2 OUT - the calculated geodesic sector points
     *
     * @return true if the sector is a circle
     */
    public static GetGeodesicArc2(pPoints: Array<POINT2>,
        pPoints2: Array<POINT2>): boolean {
        let circle: boolean = false;
        try {
            let ptCenter: POINT2 = new POINT2(pPoints[0]);
            let pt1: POINT2 = new POINT2(pPoints[1]);
            let pt2: POINT2 = new POINT2(pPoints[2]);

            let a12b: ref<number[]> = new ref();
            //double dist2 = 0d;
            let dist1: double = 0;
            let a12: ref<number[]> = new ref();
            let a21: ref<number[]> = new ref();
            //double lat2c = 0.0;
            //distance and azimuth from the center to the 1st point
            //geodesic_distance(lonCenter, latCenter, lon1, lat1, ref dist1, ref a12, ref a21);
            dist1 = mdlGeodesic.geodesic_distance(ptCenter, pt1, a12, a21);
            let saveAzimuth: double = a21.value[0];
            //distance and azimuth from the center to the 2nd point
            //geodesic_distance(lonCenter, latCenter, lon2, lat2, ref dist2, ref a12b, ref a21);
            let dist2: double = mdlGeodesic.geodesic_distance(ptCenter, pt2, a12b, a21);
            //if the points are nearly the same we want 360 degree range fan
            if (Math.abs(a21.value[0] - saveAzimuth) <= 1) {
                if (a12.value[0] < 360) {
                    a12.value[0] += 360;
                }
                a12b.value[0] = a12.value[0] + 360;
                circle = true;
            }

            //assume caller has set pPoints2 as new Array

            let a12c: ref<number[]> = new ref();
            a12c.value = new Array<number>(1);
            let j: int = 0;
            let pPoint: POINT2 = new POINT2();
            if (a12b.value[0] < 0) {
                a12b.value[0] = 360 + a12b.value[0];
            }
            if (a12.value[0] < 0) {
                a12.value[0] = 360 + a12.value[0];
            }
            if (a12b.value[0] < a12.value[0]) {
                a12b.value[0] = a12b.value[0] + 360;
            }
            for (j = 0; j <= 100; j++) {

                a12c.value[0] = a12.value[0] + (j as double / 100) * (a12b.value[0] - a12.value[0]);
                pPoint = mdlGeodesic.geodesic_coordinate(ptCenter, dist1, a12c.value[0]);
                pPoints2.push(pPoint);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                //clsUtility.WriteFile("Error in mdlGeodesic.GetGeodesicArc2");
                ErrorLogger.LogException(mdlGeodesic._className, "GetGeodesicArc2",
                    new RendererException("Failed inside GetGeodesicArc2", exc));
            } else {
                throw exc;
            }
        }
        return circle;
    }
    /**
     * returns intersection of two lines, each defined by a point and a bearing
     * <a href="http://creativecommons.org/licenses/by/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by/3.0/88x31.png"></a><br>This work is licensed under a <a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0 Unported License</a>.
     * @param p1 1st point
     * @param brng1 first line bearing in degrees from true north
     * @param p2 2nd point
     * @param brng2 2nd point bearing in degrees from true north
     * @return
     * @deprecated
     */
    public static IntersectLines(p1: POINT2,
        brng1: double,
        p2: POINT2,
        brng2: double): POINT2 | null {
        let ptResult: POINT2;
        try {
            let lat1: double = mdlGeodesic.DegToRad(p1.y);//p1._lat.toRad();
            let lon1: double = mdlGeodesic.DegToRad(p1.x);//p1._lon.toRad();
            let lat2: double = mdlGeodesic.DegToRad(p2.y);//p2._lat.toRad();
            let lon2: double = mdlGeodesic.DegToRad(p2.x);//p2._lon.toRad();
            let brng13: double = mdlGeodesic.DegToRad(brng1);//brng1.toRad();
            let brng23: double = mdlGeodesic.DegToRad(brng2);//brng2.toRad();
            let dLat: double = lat2 - lat1;
            let dLon: double = lon2 - lon1;


            let dist12: double = 2 * Math.asin(Math.sqrt(Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)));

            if (dist12 === 0) {
                return null;
            }

            let brngA: double = Math.acos((Math.sin(lat2) - Math.sin(lat1) * Math.cos(dist12)) /
                (Math.sin(dist12) * Math.cos(lat1)));

            if (Number.isNaN(brngA)) {
                brngA = 0;  // protect against rounding
            }
            let brngB: double = Math.acos((Math.sin(lat1) - Math.sin(lat2) * Math.cos(dist12)) /
                (Math.sin(dist12) * Math.cos(lat2)));

            let brng12: double = 0;
            let brng21: double = 0;
            if (Math.sin(lon2 - lon1) > 0) {
                brng12 = brngA;
                brng21 = 2 * Math.PI - brngB;
            } else {
                brng12 = 2 * Math.PI - brngA;
                brng21 = brngB;
            }

            let alpha1: double = (brng13 - brng12 + Math.PI) % (2 * Math.PI) - Math.PI;  // angle 2-1-3
            let alpha2: double = (brng21 - brng23 + Math.PI) % (2 * Math.PI) - Math.PI;  // angle 1-2-3

            if (Math.sin(alpha1) === 0 && Math.sin(alpha2) === 0) {
                return null;  // infinite intersections
            }
            if (Math.sin(alpha1) * Math.sin(alpha2) < 0) {
                return null;       // ambiguous intersection
            }
            //alpha1 = Math.abs(alpha1);
            //alpha2 = Math.abs(alpha2);  // ... Ed Williams takes abs of alpha1/alpha2, but seems to break calculation?
            let alpha3: double = Math.acos(-Math.cos(alpha1) * Math.cos(alpha2) +
                Math.sin(alpha1) * Math.sin(alpha2) * Math.cos(dist12));

            let dist13: double = Math.atan2(Math.sin(dist12) * Math.sin(alpha1) * Math.sin(alpha2),
                Math.cos(alpha2) + Math.cos(alpha1) * Math.cos(alpha3));

            let lat3: double = Math.asin(Math.sin(lat1) * Math.cos(dist13) +
                Math.cos(lat1) * Math.sin(dist13) * Math.cos(brng13));
            let dLon13: double = Math.atan2(Math.sin(brng13) * Math.sin(dist13) * Math.cos(lat1),
                Math.cos(dist13) - Math.sin(lat1) * Math.sin(lat3));
            let lon3: double = lon1 + dLon13;
            lon3 = (lon3 + Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180..180º

            //return new POINT2(lat3.toDeg(), lon3.toDeg());
            ptResult = new POINT2(mdlGeodesic.RadToDeg(lon3), mdlGeodesic.RadToDeg(lat3));

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(mdlGeodesic._className, "IntersectLines",
                    new RendererException("Failed inside IntersectLines", exc));
            } else {
                throw exc;
            }
        }
        return ptResult;
    }
    /**
     * Normalizes geo points for arrays which span the IDL
     *
     * @param geoPoints
     * @return
     */
    public static normalize_points(geoPoints: Array<POINT2>): Array<POINT2> {
        let normalizedPts: Array<POINT2>;
        try {
            if (geoPoints == null || geoPoints.length === 0) {
                return normalizedPts;
            }

            let j: int = 0;
            let minx: double = geoPoints[0].x;
            let maxx: double = minx;
            let spansIDL: boolean = false;
            let pt: POINT2;
            let n: int = geoPoints.length;
            //for (j = 1; j < geoPoints.length; j++) 
            for (j = 1; j < n; j++) {
                pt = geoPoints[j];
                if (pt.x < minx) {
                    minx = pt.x;
                }
                if (pt.x > maxx) {
                    maxx = pt.x;
                }
            }
            if (maxx - minx > 180) {
                spansIDL = true;
            }

            if (!spansIDL) {
                return geoPoints;
            }

            normalizedPts = new Array();
            n = geoPoints.length;
            //for (j = 0; j < geoPoints.length; j++) 
            for (j = 0; j < n; j++) {
                pt = geoPoints[j];
                if (pt.x < 0) {
                    pt.x += 360;
                }
                normalizedPts.push(pt);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(mdlGeodesic._className, "normalize_pts",
                    new RendererException("Failed inside normalize_pts", exc));
            } else {
                throw exc;
            }
        }
        return normalizedPts;
    }

    /**
     * calculates the geodesic MBR, intended for regular shaped areas
     *
     * @param geoPoints
     * @return
     */
    public static geodesic_mbr(geoPoints: Array<POINT2>): Rectangle2D | null {
        let rect2d: Rectangle2D;
        try {
            if (geoPoints == null || geoPoints.length === 0) {
                return null;
            }

            let normalizedPts: Array<POINT2> = mdlGeodesic.normalize_points(geoPoints);
            let ulx: double = normalizedPts[0].x;
            let lrx: double = ulx;
            let uly: double = normalizedPts[0].y;
            let lry: double = uly;
            let j: int = 0;
            let pt: POINT2;
            let n: int = normalizedPts.length;
            //for(j=1;j<normalizedPts.length;j++)
            for (j = 1; j < n; j++) {
                pt = normalizedPts[j];
                if (pt.x < ulx) {

                    ulx = pt.x;
                }

                if (pt.x > lrx) {

                    lrx = pt.x;
                }


                if (pt.y > uly) {

                    uly = pt.y;
                }

                if (pt.y < lry) {

                    lry = pt.y;
                }

            }
            let ul: POINT2 = new POINT2(ulx, uly);
            let ur: POINT2 = new POINT2(lrx, uly);
            let lr: POINT2 = new POINT2(lrx, lry);
            let width: double = mdlGeodesic.geodesic_distance(ul, ur, null, null);
            let height: double = mdlGeodesic.geodesic_distance(ur, lr, null, null);
            rect2d = new Rectangle2D(ulx, uly, width, height);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(mdlGeodesic._className, "geodesic_mbr",
                    new RendererException("Failed inside geodesic_mbr", exc));
            } else {
                throw exc;
            }
        }
        return rect2d;
    }

    /**
     * Currently used by AddModifiers for greater accuracy on center labels
     *
     * @param geoPoints
     * @return
     */
    public static geodesic_center(geoPoints: Array<POINT2>): POINT2 | null {
        let pt: POINT2;
        try {
            if (geoPoints == null || geoPoints.length === 0) {
                return null;
            }


            let rect2d: Rectangle2D = mdlGeodesic.geodesic_mbr(geoPoints);
            let deltax: double = rect2d.getWidth() / 2;
            let deltay: double = rect2d.getHeight() / 2;
            let ul: POINT2 = new POINT2(rect2d.x, rect2d.y);
            //first walk east by deltax
            let ptEast: POINT2 = mdlGeodesic.geodesic_coordinate(ul, deltax, 90);
            //next walk south by deltay;
            pt = mdlGeodesic.geodesic_coordinate(ptEast, deltay, 180);

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(mdlGeodesic._className, "geodesic_center",
                    new RendererException("Failed inside geodesic_center", exc));
            } else {
                throw exc;
            }
        }
        return pt;
    }
    /**
     * rotates a point from a center point in degrees
     * @param ptCenter center point to rotate about
     * @param ptRotate point to rotate
     * @param rotation rotation angle in degrees
     * @return 
     */
    private static geoRotatePoint(ptCenter: POINT2, ptRotate: POINT2, rotation: double): POINT2 | null {
        try {
            let bearing: double = mdlGeodesic.GetAzimuth(ptCenter, ptRotate);
            let dist: double = mdlGeodesic.geodesic_distance(ptCenter, ptRotate, null, null);
            return mdlGeodesic.geodesic_coordinate(ptCenter, dist, bearing + rotation);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(mdlGeodesic._className, "geoRotatePoint",
                    new RendererException("Failed inside geoRotatePoint", exc));
            } else {
                throw exc;
            }
        }
        return null;
    }
    /**
     * Calculates points for a geodesic ellipse and rotates the points by rotation
     * @param ptCenter
     * @param majorRadius
     * @param minorRadius
     * @param rotation  rotation angle in degrees
     * @return 
     */
    public static getGeoEllipse(ptCenter: POINT2, majorRadius: double, minorRadius: double, rotation: double): POINT2[] {
        let pEllipsePoints: POINT2[];
        try {
            pEllipsePoints = new Array<POINT2>(37);
            //int l=0;
            let pt: POINT2;
            let dFactor: double = 0;
            let azimuth: double = 0;
            let a: double = 0;
            let b: double = 0;
            let dist: double = 0;
            let bearing: double = 0;
            let ptLongitude: POINT2;
            let ptLatitude: POINT2;
            for (let l: int = 1; l < 37; l++) {
                dFactor = (10.0 * l) * Math.PI / 180.0;
                a = majorRadius * Math.cos(dFactor);
                b = minorRadius * Math.sin(dFactor);
                //dist=Math.sqrt(a*a+b*b);
                //azimuth = (10.0 * l);// * Math.PI / 180.0;  
                //azimuth=90-azimuth;
                //pt = geodesic_coordinate(ptCenter,dist,azimuth);                
                //pt = geodesic_coordinate(ptCenter,dist,azimuth);                
                ptLongitude = mdlGeodesic.geodesic_coordinate(ptCenter, a, 90);
                ptLatitude = mdlGeodesic.geodesic_coordinate(ptCenter, b, 0);
                //pt=new POINT2(ptLatitude.x,ptLongitude.y);
                pt = new POINT2(ptLongitude.x, ptLatitude.y);
                //pEllipsePoints[l-1]=pt;
                pEllipsePoints[l - 1] = mdlGeodesic.geoRotatePoint(ptCenter, pt, -rotation);
            }
            pEllipsePoints[36] = new POINT2(pEllipsePoints[0]);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(mdlGeodesic._className, "GetGeoEllipse",
                    new RendererException("GetGeoEllipse", exc));
            } else {
                throw exc;
            }
        }
        return pEllipsePoints;
    }
}
