import { type int, type double, type long } from "../graphics2d/BasicTypes";

import { GeneralPath } from "../graphics2d/GeneralPath"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point } from "../graphics2d/Point"
import { Point2D } from "../graphics2d/Point2D"
import { Shape } from "../graphics2d/Shape"
import { arraysupport } from "../JavaLineArray/arraysupport"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { mdlGeodesic } from "../JavaTacticalRenderer/mdlGeodesic"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { RendererException } from "../renderer/utilities/RendererException"
import { IPathIterator } from "../graphics2d/IPathIterator";


/**
 * A class to provide the utility functions required for calculating the line
 * points.
 *
 *
 */
export class lineutility {

    private static readonly _className: string = "lineutility";
    public static readonly extend_left: int = 0;
    public static readonly extend_right: int = 1;
    public static readonly extend_above: int = 2;
    public static readonly extend_below: int = 3;

    /**
     * Resizes the array to the length speicifed, called by the Channels class.
     *
     * @param pLinePoints the array to resize
     * @param length the length to which to resize the array.
     * @return the resized array
     */
    static ResizeArray(pLinePoints: POINT2[], length: int): POINT2[] {
        let array: POINT2[] = new Array<POINT2>(length);
        try {
            if (pLinePoints.length <= length) {
                return pLinePoints;
            }

            let j: int = 0;
            for (j = 0; j < length; j++) {
                array[j] = new POINT2(pLinePoints[j]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "ResizeArray",
                    new RendererException("Failed inside ResizeArray", exc));
            } else {
                throw exc;
            }
        }
        return array;
    }

    /**
     * post-segments a line segment into 50 pixel intervals
     *
     * @param pt0
     * @param pt1
     * @param shape
     */
    protected static SegmentLineShape(pt0: POINT2, pt1: POINT2, shape: Shape2): void {
        try {
            if (pt0 == null || pt1 == null) {
                return;
            }

            let j: int = 0;
            let n: int = 0;
            let dist: double = lineutility.CalcDistanceDouble(pt0, pt1);
            n = Math.trunc(dist / 25);
            let pt: POINT2;
            shape.lineTo(pt0);
            for (j = 1; j <= n; j++) {
                pt = lineutility.ExtendAlongLineDouble(pt0, pt1, 25);
                shape.lineTo(pt);
            }
            shape.lineTo(pt1);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "SegmentLineShape",
                    new RendererException("Failed inside SegmentLineShape", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Calculates the middle segment for the Direction of Attack Aviation symbol
     *
     * @param pLinePoints the point array
     * @param vblSaveCounter the size of the point array
     * @return the middle segment
     */
    public static GetDirAtkAirMiddleSegment(pLinePoints: POINT2[],
        vblSaveCounter: int): int {
        let middleSegment: int = -1;
        try {
            let d: double = 0;
            let k: int = 0;
            for (k = vblSaveCounter - 1; k > 0; k--) {
                d += lineutility.CalcDistanceDouble(pLinePoints[k], pLinePoints[k - 1]);
                if (d > 60) {
                    break;
                }
            }
            if (d > 60) {
                middleSegment = k;
            } else {
                if (vblSaveCounter <= 3) {
                    middleSegment = 1;
                } else {
                    middleSegment = 2;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetDirAtkAirMiddleSegment",
                    new RendererException("Failed inside GetDirAtkAirMiddleSegment", exc));
            } else {
                throw exc;
            }
        }
        return middleSegment;
    }

    /**
     * Computes the angle in radians between two points
     *
     * @param pt0 the first point
     * @param pt1 the last point
     *
     * @return the angle in radians
     */
    static CalcSegmentAngleDouble(pt0: POINT2,
        pt1: POINT2): double {
        let dAngle: double = 0;
        try {
            //declarations
            let nTemp: int = 0;
            let m: ref<number[]> = new ref();
            //end declarations

            nTemp = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
            if (nTemp === 0) {
                dAngle = Math.PI / 2;
            } else {
                dAngle = Math.atan(m.value[0]);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcSegmentAngleDouble",
                    new RendererException("Failed inside CalcSegmentAngleDouble", exc));
            } else {
                throw exc;
            }
        }
        return dAngle;
    }

    /**
     * POINT2 in previous applications has been a struct that did not require
     * initialization.
     *
     * @param pts array of points to instantiate.
     */
    static InitializePOINT2Array(pts: POINT2[]): void {
        //int j=0;
        if (pts == null || pts.length === 0) {
            return;
        }
        let n: int = pts.length;
        //for (int j = 0; j < pts.length; j++) 
        for (let j: int = 0; j < n; j++) {
            pts[j] = new POINT2();
        }
    }

    /**
     * Calculates the center point of an area using the first vblCounter points
     * in the array.
     *
     * @param pLinePoints the client points
     * @param vblCounter the number of points in the array to use
     *
     * @return the center point
     */
    static CalcCenterPointDouble(pLinePoints: POINT2[],
        vblCounter: int): POINT2 {
        let CenterLinePoint: POINT2 = new POINT2(pLinePoints[0]);
        try {
            //declarations
            let j: int = 0;
            let dMinX: double = pLinePoints[0].x;
            let
                dMinY: double = pLinePoints[0].y;
            let
                dMaxX: double = pLinePoints[0].x;
            let
                dMaxY: double = pLinePoints[0].y;

            //end declarations
            dMinX = pLinePoints[0].x;
            dMinY = pLinePoints[0].y;
            dMaxX = pLinePoints[0].x;
            dMaxY = pLinePoints[0].y;

            for (j = 0; j < vblCounter; j++) {
                if (pLinePoints[j].x < dMinX) {
                    dMinX = pLinePoints[j].x;
                }

                if (pLinePoints[j].y < dMinY) {
                    dMinY = pLinePoints[j].y;
                }

                if (pLinePoints[j].x > dMaxX) {
                    dMaxX = pLinePoints[j].x;
                }

                if (pLinePoints[j].y > dMaxY) {
                    dMaxY = pLinePoints[j].y;
                }

            }	//end for

            CenterLinePoint.x = (dMinX + dMaxX) / 2;
            CenterLinePoint.y = (dMinY + dMaxY) / 2;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcCenterPointDouble",
                    new RendererException("Failed inside CalcCenterPointDouble", exc));
            } else {
                throw exc;
            }
        }
        return CenterLinePoint;
    }

    /**
     * Called by renderer Modifier2 class after ArrayList.ToArray was called,
     * which produces an array of objects.
     *
     * @param pLinePoints
     * @param vblCounter
     * @return
     */
    public static CalcCenterPointDouble2(pLinePoints: POINT2[],
        vblCounter: int): POINT2 {
        let pt0: POINT2 = pLinePoints[0];
        let CenterLinePoint: POINT2 = new POINT2();
        try {
            //declarations
            let j: int = 0;
            let dMinX: double = pt0.x;
            let
                dMinY: double = pt0.y;
            let
                dMaxX: double = pt0.x;
            let
                dMaxY: double = pt0.y;

            //end declarations
            dMinX = pt0.x;
            dMinY = pt0.y;
            dMaxX = pt0.x;
            dMaxY = pt0.y;

            let pt: POINT2;

            for (j = 0; j < vblCounter; j++) {
                pt = pLinePoints[j];
                if (pt.x < dMinX) {
                    dMinX = pt.x;
                }

                if (pt.y < dMinY) {
                    dMinY = pt.y;
                }

                if (pt.x > dMaxX) {
                    dMaxX = pt.x;
                }

                if (pt.y > dMaxY) {
                    dMaxY = pt.y;
                }

            }	//end for

            CenterLinePoint.x = (dMinX + dMaxX) / 2;
            CenterLinePoint.y = (dMinY + dMaxY) / 2;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcCenterPointDouble2",
                    new RendererException("Failed inside CalcCenterPointDouble2", exc));
            } else {
                throw exc;
            }
        }
        return CenterLinePoint;
    }

    /**
     * Calculates the distance in pixels between two points
     *
     * @param p1 the first point
     * @param p2 the last point
     *
     * @return the distance between p1 and p2 in pixels
     */
    public static CalcDistanceDouble(p1: POINT2 | Point2D, p2: POINT2 | Point2D): double {

        let returnValue: double = 0;
        try {
            returnValue = Math.sqrt((p1.getX() - p2.getX())
                * (p1.getX() - p2.getX())
                + (p1.getY() - p2.getY())
                * (p1.getY() - p2.getY()));

            //sanity check
            //return x or y distance if returnValue is 0 or infinity
            let xdist: double = Math.abs(p1.getX() - p2.getX());
            let ydist: double = Math.abs(p1.getY() - p2.getY());
            let max: double = xdist;
            if (ydist > xdist) {
                max = ydist;
            }

            if (returnValue === 0 || !Number.isFinite(returnValue)) {
                if (max > 0) {
                    returnValue = max;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcDistanceDouble",
                    new RendererException("Failed inside CalcDistanceDouble", exc));
            } else {
                throw exc;
            }
        }
        return returnValue;
    }


    /**
     * Computes the slope of a line
     *
     * @param firstLinePoint the first line point
     * @param lastLinePoint the last line point
     * @param slope OUT - object with member to hold the slope of the line
     *
     * @return 1 if successful, else return 0
     */
    static CalcTrueSlopeDouble(firstLinePoint: POINT2,
        lastLinePoint: POINT2,
        slope: ref<number[]>): int//ref is a double
    {
        let result: int = 1;
        try {
            if (slope.value == null) {
                slope.value = new Array<number>(1);
            }

            let deltaX: double = 0;
            let deltaY: double = 0;
            deltaX = firstLinePoint.x - lastLinePoint.x;
            //if (deltaX == 0) 
            if (Math.abs(deltaX) < 1) {
                //deltaX = 1;
                if (deltaX >= 0) {

                    deltaX = 1;
                }

                else {

                    deltaX = -1;
                }

                result = 1;
            }
            deltaY = firstLinePoint.y - lastLinePoint.y;

            slope.value[0] = deltaY / deltaX;	//cannot blow up
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcTrueSlopeDouble",
                    new RendererException("Failed inside CalcTrueSlopeDouble", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }

    /**
     * reverses the first vblCounter points
     *
     * @param pLowerLinePoints OUT - points to reverse
     * @param vblCounter
     */
    static ReversePointsDouble2(pLowerLinePoints: POINT2[],
        vblCounter: int): void {
        try {
            let pResultPoints: POINT2[] = new Array<POINT2>(vblCounter);
            let k: int = 0;
            for (k = 0; k < vblCounter; k++) {
                pResultPoints[k] = new POINT2(pLowerLinePoints[vblCounter - k - 1]);
            }
            for (k = 0; k < vblCounter; k++) {
                pLowerLinePoints[k] = new POINT2(pResultPoints[k]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "ReversePointsDouble2",
                    new RendererException("Failed inside ReversePointsDouble2", exc));
            } else {
                throw exc;
            }
        }
    }

    public static CalcTrueSlopeDoubleForRoutes(firstLinePoint: POINT2,
        lastLinePoint: POINT2,
        slope: ref<number[]>): boolean {
        try {
            let deltaX: double = 0;
            let deltaY: double = 0;
            deltaX = (firstLinePoint.x) as double - (lastLinePoint.x) as double;
            if (Math.abs(deltaX) < 2) //was 2,infinite slope
            {
                return (false);
            }

            deltaY = (firstLinePoint.y) as double - (lastLinePoint.y) as double;
            if (slope.value == null) {
                slope.value = new Array<number>(1);
            }

            slope.value[0] = deltaY / deltaX;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcTrueSlopeDoubleForRoutes",
                    new RendererException("Failed inside CalcTrueSlopeDoubleForRoutes", exc));
            } else {
                throw exc;
            }
        }
        return true;
    }

    /**
     * Computes the slope of a line
     *
     * @param firstLinePoint the first line point
     * @param lastLinePoint the last line point
     * @param slope OUT - object with member to hold the slope of the line
     *
     * @return true if successful
     */
    public static CalcTrueSlopeDouble2(firstLinePoint: POINT2,
        lastLinePoint: POINT2,
        slope: ref<number[]>): boolean {
        let result: boolean = true;
        try {
            let deltaX: double = 0;
            let deltaY: double = 0;
            deltaX = (firstLinePoint.x) as double - (lastLinePoint.x) as double;
            //if (deltaX == 0)
            if (Math.abs(deltaX) < 1) {
                //deltaX = 1;
                if (deltaX >= 0) {

                    deltaX = 1;
                }

                else {

                    deltaX = -1;
                }

                result = false;
            }

            deltaY = (firstLinePoint.y) as double - (lastLinePoint.y) as double;
            if (slope.value == null) {
                slope.value = new Array<number>(1);
            }

            slope.value[0] = deltaY / deltaX;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcTrueSlopeDouble2",
                    new RendererException("Failed inside CalcTrueSlopeDouble2", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }

    /**
     * Calculates the slopes and y intercepts in pixels for the line from pt1 to
     * pt2 and a parallel line a vertical distance from the line
     *
     * @param nDistance the distance in pixels
     * @param linePoint1 first point on the line
     * @param linePoint2 last point on the line
     * @param pdResult OUT - array to hold m, b for both lines
     *
     * @return 1 if the lines are not vertical, else return 0
     */
    static CalcTrueLinesDouble(nDistance: number,
        linePoint1: POINT2,
        linePoint2: POINT2,
        pdResult: ref<number[]>): int //for vertical line e.g. if line equation is x=7
    {
        try {
            //declarations
            let nTemp: int = 0;
            let b: double = 0;
            let delta: double = 0;
            let m: ref<number[]> = new ref();
            //end declarations
            nTemp = lineutility.CalcTrueSlopeDouble(linePoint1, linePoint2, m);
            pdResult.value = new Array<number>(6);
            //Fill the result array with the line parameters
            if (nTemp === 0) //vertical lines
            {
                pdResult.value[3] = linePoint1.x + nDistance as double;	//the lower line eqn, e.g. x=7
                pdResult.value[5] = linePoint1.x - nDistance as double;	//the upper line eqn,
                return 0;
            } else {
                b = linePoint2.y - m.value[0] * linePoint2.x;
                delta = Math.sqrt(m.value[0] * m.value[0] * ((nDistance) as double * (nDistance) as double)
                    + ((nDistance) as double * (nDistance) as double));
                pdResult.value[0] = m.value[0];    //original line eq'n: y = mx + b
                pdResult.value[1] = b;
                pdResult.value[2] = m.value[0];    //lower line eq'n: y = mx + (b+dDistance)
                pdResult.value[3] = b + delta;
                pdResult.value[4] = m.value[0];    //upper line eq'n: y = mx + (b-dDistance)
                pdResult.value[5] = b - delta;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcTrueLinesDouble",
                    new RendererException("Failed inside CalcTrueLinesDouble", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }

    /**
     * Calculates the intersection of two lines.
     *
     * @param m1 slope of first line
     * @param b1 Y intercept of first line
     * @param m2 slope of second line
     * @param b2 Y intercept of second line
     * @param bolVertical1 0 if first line is vertical, else 1
     * @param bolVertical2 0 if second line is vertical, else 1
     * @param X1 X intercept if first line is vertical
     * @param X2 X intercept if 2nd line is vertical.
     *
     * @return intersection point
     */
    public static CalcTrueIntersectDouble2(m1: double,
        b1: double,
        m2: double,
        b2: double,
        bolVertical1: int,
        bolVertical2: int,
        X1: double, //x intercept if line1 is vertical
        X2: double): POINT2 {
        let ptIntersect: POINT2 = new POINT2();
        try {
            //declarations
            let x: double = 0;
            let y: double = 0;
            //end declarations

            //initialize ptIntersect
            ptIntersect.x = X1;
            ptIntersect.y = X2;
            if (bolVertical1 === 0 && bolVertical2 === 0) //both lines vertical
            {
                return ptIntersect;
            }
            //the following 3 if blocks are the only ways to get an intersection
            if (bolVertical1 === 0 && bolVertical2 === 1) //line1 vertical, line2 not
            {
                ptIntersect.x = X1;
                ptIntersect.y = m2 * X1 + b2;
                return ptIntersect;
            }
            if (bolVertical1 === 1 && bolVertical2 === 0) //line2 vertical, line1 not
            {
                ptIntersect.x = X2;
                ptIntersect.y = m1 * X2 + b1;
                return ptIntersect;
            }
            //if either of the lines is vertical function has already returned
            //so both m1 and m2 should be valid
            if (m1 !== m2) {
                x = (b2 - b1) / (m1 - m2);	//cannot blow up
                y = (m1 * x + b1);
                ptIntersect.x = x;
                ptIntersect.y = y;
                return ptIntersect;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcTrueIntersectDouble2",
                    new RendererException("Failed inside CalcTrueIntersectDouble2", exc));
            } else {
                throw exc;
            }
        }
        return ptIntersect;
    }

    /**
     * Calculates an offset point for channel types which require arrows.
     *
     * @param startLinePoint the first point
     * @param endLinePoint the last point
     * @param nOffset the offset in pixels
     *
     * @return the offset point
     */
    static GetOffsetPointDouble(startLinePoint: POINT2,
        endLinePoint: POINT2,
        nOffset: double): POINT2 {
        let tempLinePoint: POINT2 = new POINT2(startLinePoint);
        try {
            //declarations
            let dx: double = endLinePoint.x - startLinePoint.x;
            let
                dy: double = endLinePoint.y - startLinePoint.y;
            let
                dOffset: double = nOffset;
            let
                dHypotenuse: double = 0;
            let
                dAngle: double = 0;

            //end declarations
            if (dx === 0) {
                if (dy > 0) {
                    tempLinePoint.x = endLinePoint.x;
                    tempLinePoint.y = endLinePoint.y + dOffset;
                } else {
                    tempLinePoint.x = endLinePoint.x;
                    tempLinePoint.y = endLinePoint.y - dOffset;
                }
                return tempLinePoint;
            }
            if (dy === 0) {
                if (dx > 0) {
                    tempLinePoint.x = endLinePoint.x + dOffset;
                    tempLinePoint.y = endLinePoint.y;
                } else {
                    tempLinePoint.x = endLinePoint.x - dOffset;
                    tempLinePoint.y = endLinePoint.y;
                }
                return tempLinePoint;
            }

            if (dy === 0) {
                dAngle = 0;
            } else {
                dAngle = Math.atan(dx / dy) + Math.PI / 2;//1.570795;
            }
            dHypotenuse = nOffset;
            if (endLinePoint.x > startLinePoint.x) {
                tempLinePoint.x = endLinePoint.x + dHypotenuse * Math.abs(Math.cos(dAngle));
            } else {
                tempLinePoint.x = endLinePoint.x - dHypotenuse * Math.abs(Math.cos(dAngle));
            }
            if (endLinePoint.y > startLinePoint.y) {
                tempLinePoint.y = endLinePoint.y + dHypotenuse * Math.abs(Math.sin(dAngle));
            } else {
                tempLinePoint.y = endLinePoint.y - dHypotenuse * Math.abs(Math.sin(dAngle));
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetOffsetPointDouble",
                    new RendererException("Failed inside GetOffsetPointDouble", exc));
            } else {
                throw exc;
            }
        }
        return (tempLinePoint);
    }

    /**
     * Used for DMAF
     *
     * @param pLinePoints the client points
     * @return ArrayList of X points
     */
    static LineOfXPoints(tg: TGLight, pLinePoints: POINT2[]): Array<POINT2> {
        let xPoints: Array<POINT2> = new Array();
        try {
            let j: int = 0;
            let k: int = 0;
            let dist: double = 0;
            let iterations: int = 0;
            let frontPt: POINT2;
            let backPt: POINT2;
            let extendFrontAbove: POINT2;
            let extendFrontBelow: POINT2;
            let extendBackAbove: POINT2;
            let extendBackBelow: POINT2;
            let xPoint1: POINT2;
            let xPoint2: POINT2;
            let n: int = pLinePoints.length;
            let xSize: double = arraysupport.getScaledSize(5, tg.get_LineThickness());
            let dIncrement: double = xSize * 4;
            //for (j = 0; j < pLinePoints.length - 1; j++) 
            for (j = 0; j < n - 1; j++) {
                dist = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                iterations = Math.trunc((dist - xSize) / dIncrement);
                if (dist - iterations * dIncrement > dIncrement / 2) {
                    iterations += 1;
                }

                for (k = 0; k < iterations; k++) {
                    frontPt = lineutility.ExtendAlongLineDouble(pLinePoints[j], pLinePoints[j + 1], k * dIncrement - xSize);
                    backPt = lineutility.ExtendAlongLineDouble(pLinePoints[j], pLinePoints[j + 1], k * dIncrement + xSize);
                    extendFrontAbove = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], frontPt, 2, xSize);
                    extendFrontBelow = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], frontPt, 3, xSize);
                    extendBackAbove = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], backPt, 2, xSize);
                    extendBackBelow = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], backPt, 3, xSize);
                    xPoints.push(extendFrontAbove);
                    extendBackBelow.style = 5;
                    xPoints.push(extendBackBelow);
                    xPoints.push(extendBackAbove);
                    extendFrontBelow.style = 5;
                    xPoints.push(extendFrontBelow);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "LineOfXPoints",
                    new RendererException("Failed inside LineOfXPoints", exc));
            } else {
                throw exc;
            }
        }
        return xPoints;
    }

    /**
     * Computes the distance in pixels of pt3 to the line from pt1 to pt2.
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param pt3 point distance to compute
     * @return distance to pt3
     */
    public static CalcDistanceToLineDouble(pt1: POINT2,
        pt2: POINT2,
        pt3: POINT2): double {
        let dResult: double = 0;
        try {
            //declarations
            let m1: double = 1;
            let b: double = 0;
            let b1: double = 0;
            let ptIntersect: POINT2 = new POINT2(pt1);
            let bolVertical: int = 0;
            let m: ref<number[]> = new ref();
            //end declarations

            bolVertical = lineutility.CalcTrueSlopeDouble(pt1, pt2, m);

            //get line y intercepts
            if (bolVertical !== 0 && m.value[0] !== 0) {
                m1 = -1 / m.value[0];
                b = pt1.y - m.value[0] * pt1.x;
                b1 = pt3.y - m1 * pt3.x;
                ptIntersect = lineutility.CalcTrueIntersectDouble2(m.value[0], b, m1, b1, 1, 1, ptIntersect.x, ptIntersect.y);
            }
            if (bolVertical !== 0 && m.value[0] === 0) //horizontal line
            {
                ptIntersect.y = pt1.y;
                ptIntersect.x = pt3.x;
            }
            if (bolVertical === 0) //vertical line
            {
                ptIntersect.y = pt3.y;
                ptIntersect.x = pt1.x;
            }

            dResult = lineutility.CalcDistanceDouble(pt3, ptIntersect);
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                ErrorLogger.LogException(lineutility._className, "CaclDistanceToLineDouble",
                    new RendererException("Failed inside CalcDistanceToLineDouble", exc));
            } else {
                throw exc;
            }
        }
        return dResult;
    }

    /**
     * Calculates a point along a line. Returns the past point if the distance
     * is 0.
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param dist extension distance in pixels from the beginning of the line
     *
     * @return the extension point
     */
    public static ExtendLineDouble(pt1: POINT2,
        pt2: POINT2,
        dist: double): POINT2 {
        let pt3: POINT2 = new POINT2();
        try {
            let dOriginalDistance: double = lineutility.CalcDistanceDouble(pt1, pt2);
            if (dOriginalDistance === 0 || dist === 0) {
                return pt2;
            }

            pt3.x = (dOriginalDistance + dist) / dOriginalDistance * (pt2.x - pt1.x) + pt1.x;
            pt3.y = (dOriginalDistance + dist) / dOriginalDistance * (pt2.y - pt1.y) + pt1.y;
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                ErrorLogger.LogException(lineutility._className, "ExtendLineDouble",
                    new RendererException("Failed inside ExtendLineDouble", exc));
            } else {
                throw exc;
            }
        }
        return pt3;
    }

    /**
     * Extends a point along a line. If dist is 0 returns last point.
     *
     * @param pt1 first point on the line
     * @param pt2 last point on the line
     * @param dist the distance in pixels from pt1
     *
     * @return the extended point
     */
    public static ExtendAlongLineDouble(pt1: POINT2, pt2: POINT2, dist: double): POINT2;

    public static ExtendAlongLineDouble(pt1: POINT2, pt2: POINT2, dist: double, styl: int): POINT2;
    public static ExtendAlongLineDouble(...args: unknown[]): POINT2 {
        switch (args.length) {
            case 3: {
                const [pt1, pt2, dist] = args as [POINT2, POINT2, double];


                let pt3: POINT2 = new POINT2();
                try {
                    let dOriginalDistance: double = lineutility.CalcDistanceDouble(pt1, pt2);
                    if (dOriginalDistance === 0 || dist === 0) {
                        return pt2;
                    }

                    pt3.x = ((dist / dOriginalDistance) * (pt2.x - pt1.x) + pt1.x);
                    pt3.y = ((dist / dOriginalDistance) * (pt2.y - pt1.y) + pt1.y);
                } catch (exc) {
                    if (exc instanceof Error) {
                        //console.log(e.message);
                        ErrorLogger.LogException(lineutility._className, "ExtendAlongLineDouble",
                            new RendererException("Failed inside ExtendAlongLineDouble", exc));
                    } else {
                        throw exc;
                    }
                }
                return pt3;


                break;
            }

            case 4: {
                const [pt1, pt2, dist, styl] = args as [POINT2, POINT2, double, int];


                let pt3: POINT2 = new POINT2();
                try {
                    let dOriginalDistance: double = lineutility.CalcDistanceDouble(pt1, pt2);
                    if (dOriginalDistance === 0 || dist === 0) {
                        return pt2;
                    }

                    pt3.x = (dist / dOriginalDistance * (pt2.x - pt1.x) + pt1.x);
                    pt3.y = (dist / dOriginalDistance * (pt2.y - pt1.y) + pt1.y);
                    pt3.style = styl;
                } catch (exc) {
                    if (exc instanceof Error) {
                        //console.log(e.message);
                        ErrorLogger.LogException(lineutility._className, "ExtendAlongLineDouble",
                            new RendererException("Failed inside ExtendAlongLineDouble", exc));
                    } else {
                        throw exc;
                    }
                }
                return pt3;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public static ExtendAlongLineDouble2(pt1: POINT2, pt2: POINT2, dist: double): POINT2;

    public static ExtendAlongLineDouble2(pt1: Point2D, pt2: Point2D, dist: double): Point2D;
    public static ExtendAlongLineDouble2(...args: unknown[]): POINT2 | Point2D {
        if (args[0] instanceof POINT2) {
            const [pt1, pt2, dist] = args as [POINT2, POINT2, double];

            let pt3: POINT2 = new POINT2();
            try {
                let dOriginalDistance: double = lineutility.CalcDistanceDouble(pt1, pt2);
                if (dOriginalDistance === 0 || dist === 0) {
                    return pt1;
                }

                pt3.x = (dist / dOriginalDistance * (pt2.x - pt1.x) + pt1.x);
                pt3.y = (dist / dOriginalDistance * (pt2.y - pt1.y) + pt1.y);
            } catch (exc) {
                if (exc instanceof Error) {
                    //console.log(e.message);
                    ErrorLogger.LogException(lineutility._className, "ExtendAlongLineDouble2",
                        new RendererException("Failed inside ExtendAlongLineDouble2", exc));
                } else {
                    throw exc;
                }
            }
            return pt3;

        } else {

            const [pt1, pt2, dist] = args as [Point2D, Point2D, double];


            try {
                let dOriginalDistance: double = lineutility.CalcDistanceDouble(pt1, pt2);
                if (dOriginalDistance === 0 || dist === 0) {
                    return new Point2D(pt1.getX(), pt1.getY());
                }

                let x: double = (dist / dOriginalDistance * (pt2.getX() - pt1.getX()) + pt1.getX());
                let y: double = (dist / dOriginalDistance * (pt2.getY() - pt1.getY()) + pt1.getY());
                return new Point2D(x, y);
            } catch (exc) {
                if (exc instanceof Error) {
                    ErrorLogger.LogException(lineutility._className, "ExtendAlongLineDouble2",
                        new RendererException("Failed inside ExtendAlongLineDouble2", exc));
                } else {
                    throw exc;
                }
            }
            return new Point2D(0, 0);
        }
    }


    /**
     * Extends a point above a line
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param pt3 point at which to extend
     * @param d distance in pixels to extend above the line
     * @param X OUT - extended point x value
     * @param Y OUT - extended point y value
     * @param direction direction to extend the line
     *
     * @return 1 if successful, else return 0
     */
    protected static ExtendLineAbove(pt1: POINT2,
        pt2: POINT2,
        pt3: POINT2,
        d: double,
        X: ref<number[]>,
        Y: ref<number[]>,
        direction: int): int {
        try {
            let m: ref<number[]> = new ref();
            let dx: double = 0;
            let dy: double = 0;
            let bolVertical: int = 0;

            X.value = new Array<number>(1);
            Y.value = new Array<number>(1);

            bolVertical = lineutility.CalcTrueSlopeDouble(pt1, pt2, m);
            if (bolVertical === 0) {
                return 0;	//cannot extend above a vertical line
            }
            if (m.value[0] === 0) {
                X.value[0] = pt3.x;
                if (direction === 0) //extend above the line
                {
                    Y.value[0] = pt3.y - Math.abs(d);
                } else //extend below the line
                {
                    Y.value[0] = pt3.y + Math.abs(d);
                }
                return 1;
            }
            //the line is neither vertical nor horizontal
            //else function would already have returned
            if (direction === 0) //extend above the line
            {
                dy = -Math.abs(d / (m.value[0] * Math.sqrt(1 + 1 / (m.value[0] * m.value[0]))));
            } else //extend below the line
            {
                dy = Math.abs(d / (m.value[0] * Math.sqrt(1 + 1 / (m.value[0] * m.value[0]))));
            }

            dx = -m.value[0] * dy;
            X.value[0] = pt3.x + dx;
            Y.value[0] = pt3.y + dy;
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                ErrorLogger.LogException(lineutility._className, "ExtendLineAbove",
                    new RendererException("Failed inside ExtendLineAbove", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }

    /**
     * Extends a point to the left of a line
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param pt3 point at which to extend
     * @param d distance in pixels to extend above the line
     * @param X OUT - extended point x value
     * @param Y OUT - extended point y value
     * @param direction direction to extend the line
     *
     * @return 1 if successful, else return 0
     */
    protected static ExtendLineLeft(pt1: POINT2,
        pt2: POINT2,
        pt3: POINT2,
        d: double,
        X: ref<number[]>,
        Y: ref<number[]>,
        direction: int): int {
        try {
            let m: ref<number[]> = new ref();
            let dx: double = 0;
            let dy: double = 0;
            let bolVertical: int = 0;

            X.value = new Array<number>(1);
            Y.value = new Array<number>(1);

            bolVertical = lineutility.CalcTrueSlopeDouble(pt1, pt2, m);
            if (bolVertical !== 0 && m.value[0] === 0) {
                return 0;	//cannot left of horiz line
            }
            if (bolVertical === 0) //vertical line
            {
                Y.value[0] = pt3.y;
                if (direction === 0) //extend left of the line
                {
                    X.value[0] = pt3.x - Math.abs(d);
                } else //extend right of the line
                {
                    X.value[0] = pt3.x + Math.abs(d);
                }

                return 1;
            }
            //the line is neither vertical nor horizontal
            //else function would already have returned
            if (direction === 0) //extend left of the line
            {
                dx = -Math.abs(d / Math.sqrt(1 + 1 / (m.value[0] * m.value[0])));
            } else //extend right of the line
            {
                dx = Math.abs(d / Math.sqrt(1 + 1 / (m.value[0] * m.value[0])));
            }

            dy = -(1 / m.value[0]) * dx;

            X.value[0] = pt3.x + dx;
            Y.value[0] = pt3.y + dy;
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                ErrorLogger.LogException(lineutility._className, "ExtendLineLeft",
                    new RendererException("Failed inside ExtendLineLeft", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }

    /**
     * Calculates the direction of a point relative to a line
     *
     * @param pt0 first point fo the line
     * @param pt1 last point of the line
     * @param pt2 relative point
     * @deprecated
     * @return 0 if left, 1 if right, 2 if above, 3 if below
     */
    protected static CalcDirectionFromLine(pt0: POINT2,
        pt1: POINT2,
        pt2: POINT2): int {
        let result: int = -1;
        try {
            let m2: double = 0;
            let b1: double = 0;
            let b2: double = 0;
            let m1: ref<number[]> = new ref();
            let ptIntersect: POINT2 = new POINT2();
            //int direction=-1;
            //handle vertical line
            if (pt0.x === pt1.x) {
                if (pt2.x < pt0.x) {
                    return 0;
                } else {
                    return 1;
                }
            }
            //handle horizontal line so that we do not have slope = 0.
            if (pt0.y === pt1.y) {
                if (pt2.y < pt0.y) {
                    return 2;
                } else {
                    return 3;
                }
            }
            lineutility.CalcTrueSlopeDouble(pt0, pt1, m1);
            m2 = -1 / m1.value[0];	//slope for the perpendicular line from the line to pt2
            //b=mx-y line equation for line
            b1 = pt0.y - m1.value[0] * pt0.x;
            //b=mx-y line equation for perpendicular line which contains pt2
            b2 = pt2.y - m2 * pt2.x;
            ptIntersect = lineutility.CalcTrueIntersectDouble2(m1.value[0], b1, m2, b2, 1, 1, 0, 0);
            //compare the intersection point with pt2 to get the direction,
            //i.e. the direction from the line is the same as the direction
            //from the interseciton point.
            if (m1.value[0] > 1) //line is steep, use left/right
            {
                if (pt2.x < ptIntersect.x) {
                    return 0;
                } else {
                    return 1;
                }
            } else //line is not steep, use above/below
            {
                if (pt2.y < ptIntersect.y) {
                    return 2;
                } else {
                    return 3;
                }
            }
            //should not reach this point
            //return direction;
        } catch (e) {
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                throw e;
            }
        }
        return result;
    }

    /**
     * Returns a point extended perpendicularly from a line at a given direction
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param pt0 on line from which to extend
     * @param direction the direction to extend: above, below, left, right
     * @param d the length to extend in pixels
     *
     */
    public static ExtendDirectedLine(pt1: POINT2,
        pt2: POINT2,
        pt0: POINT2,
        direction: int,
        d: double): POINT2;

    /**
     * Returns a point extended perpendicularly from a line at a given direction
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param pt0 on line from which to extend
     * @param direction the direction to extend: above, below, left, right
     * @param d the length to extend in pixels
     * @param style the style to assign the return point
     *
     */
    public static ExtendDirectedLine(pt1: POINT2,
        pt2: POINT2,
        pt0: POINT2,
        direction: int,
        d: double,
        style: int): POINT2;
    public static ExtendDirectedLine(...args: unknown[]): POINT2 {
        switch (args.length) {
            case 5: {
                const [pt1, pt2, pt0, direction, d] = args as [POINT2, POINT2, POINT2, int, double];


                let ptResult: POINT2 = new POINT2();
                try {
                    let X: ref<number[]> = new ref();
                    let Y: ref<number[]> = new ref();
                    ptResult = new POINT2(pt0);
                    switch (direction) {
                        case 0: {	//extend left
                            lineutility.ExtendLineLeft(pt1, pt2, pt0, d, X, Y, 0);
                            break;
                        }

                        case 1: {	//extend right
                            lineutility.ExtendLineLeft(pt1, pt2, pt0, d, X, Y, 1);
                            break;
                        }

                        case 2: {	//extend above
                            lineutility.ExtendLineAbove(pt1, pt2, pt0, d, X, Y, 0);
                            break;
                        }

                        case 3: {	//extend below
                            lineutility.ExtendLineAbove(pt1, pt2, pt0, d, X, Y, 1);
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    ptResult.x = X.value[0];
                    ptResult.y = Y.value[0];
                } catch (exc) {
                    if (exc instanceof Error) {
                        //console.log(e.message);
                        ErrorLogger.LogException(lineutility._className, "ExtendDirectedLine",
                            new RendererException("Failed inside ExtendDirectedLine", exc));
                    } else {
                        throw exc;
                    }
                }
                return ptResult;


                break;
            }

            case 6: {
                let [pt1, pt2, pt0, direction, d, style] = args as [POINT2, POINT2, POINT2, int, double, int];

                let ptResult: POINT2 = new POINT2(pt0);
                try {
                    let X: ref<number[]> = new ref();
                    let Y: ref<number[]> = new ref();
                    //int bolResult=0;
                    //handle parallel, perpendicular cases
                    if (pt1.x === pt2.x) {
                        if (direction === 2) {
                            direction = 0;
                        }
                        if (direction === 3) {
                            direction = 1;
                        }
                    }
                    if (pt1.y === pt2.y) {
                        if (direction === 0) {
                            direction = 2;
                        }
                        if (direction === 1) {
                            direction = 3;
                        }
                    }
                    switch (direction) {
                        case 0: {	//extend left
                            lineutility.ExtendLineLeft(pt1, pt2, pt0, d, X, Y, 0);
                            break;
                        }

                        case 1: {	//extend right
                            lineutility.ExtendLineLeft(pt1, pt2, pt0, d, X, Y, 1);
                            break;
                        }

                        case 2: {	//extend above
                            lineutility.ExtendLineAbove(pt1, pt2, pt0, d, X, Y, 0);
                            break;
                        }

                        case 3: {	//extend below
                            lineutility.ExtendLineAbove(pt1, pt2, pt0, d, X, Y, 1);
                            break;
                        }


                        default:

                    }
                    ptResult.x = X.value[0];
                    ptResult.y = Y.value[0];
                    ptResult.style = style;
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(lineutility._className, "ExtendDirectedLine",
                            new RendererException("Failed inside ExtendDirectedLine", exc));
                    } else {
                        throw exc;
                    }
                }
                return ptResult;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * @deprecated Returns a point extended perpendicularly from a line at a
     * given direction same as original function except it accounts for vertical
     * lines and negative d values
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param pt0 on line from which to extend
     * @param direction the direction to extend: above, below, left, right
     * @param d the length to extend in pixels
     *
     */
    public static ExtendDirectedLineText(pt1: POINT2,
        pt2: POINT2,
        pt0: POINT2,
        direction: int,
        d: double): POINT2 {
        let ptResult: POINT2 = new POINT2();
        try {
            let X: ref<number[]> = new ref();
            let Y: ref<number[]> = new ref();
            ptResult = new POINT2(pt0);
            if (d < 0) {
                switch (direction) {
                    case 0: {
                        direction = lineutility.extend_right;
                        break;
                    }

                    case 1: {
                        direction = lineutility.extend_left;
                        break;
                    }

                    case 2: {
                        direction = lineutility.extend_below;
                        break;
                    }

                    case 3: {
                        direction = lineutility.extend_above;
                        break;
                    }

                    default: {
                        break;
                    }

                }
                d = Math.abs(d);
            }
            if (pt1.y === pt2.y)//horizontal segment
            {
                switch (direction) {
                    case 0: {//left means above
                        direction = lineutility.extend_above;
                        break;
                    }

                    case 1: {//right means below
                        direction = lineutility.extend_below;
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            if (pt1.x === pt2.x)//vertical segment
            {
                switch (direction) {
                    case 2: {//above means left
                        direction = lineutility.extend_left;
                        break;
                    }

                    case 3: {//below means right
                        direction = lineutility.extend_right;
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            switch (direction) {
                case 0: {	//extend left
                    lineutility.ExtendLineLeft(pt1, pt2, pt0, d, X, Y, 0);
                    break;
                }

                case 1: {	//extend right
                    lineutility.ExtendLineLeft(pt1, pt2, pt0, d, X, Y, 1);
                    break;
                }

                case 2: {	//extend above
                    lineutility.ExtendLineAbove(pt1, pt2, pt0, d, X, Y, 0);
                    break;
                }

                case 3: {	//extend below
                    lineutility.ExtendLineAbove(pt1, pt2, pt0, d, X, Y, 1);
                    break;
                }

                default: {
                    break;
                }

            }
            ptResult.x = X.value[0];
            ptResult.y = Y.value[0];
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                ErrorLogger.LogException(lineutility._className, "ExtendDirectedLine",
                    new RendererException("Failed inside ExtendDirectedLine", exc));
            } else {
                throw exc;
            }
        }
        return ptResult;
    }

    /**
     * Calculates a point along a line
     *
     * @param pt1 first line point
     * @param pt2 last line point
     * @param dist extension distance in pixels from the beginning of the line
     * @param styl the line style to assign the point
     *
     * @return the extension point
     */
    static ExtendLine2Double(pt1: POINT2,
        pt2: POINT2,
        dist: double,
        styl: int): POINT2 {
        let pt3: POINT2 = new POINT2();
        try {
            let dOriginalDistance: double = lineutility.CalcDistanceDouble(pt1, pt2);

            pt3.x = pt2.x;
            pt3.y = pt2.y;
            if (dOriginalDistance > 0) {
                pt3.x = ((dOriginalDistance + dist) / dOriginalDistance * (pt2.x - pt1.x) + pt1.x);
                pt3.y = ((dOriginalDistance + dist) / dOriginalDistance * (pt2.y - pt1.y) + pt1.y);
                pt3.style = styl;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "ExtendLine2Double",
                    new RendererException("Failed inside ExtendLine2Double", exc));
            } else {
                throw exc;
            }
        }
        return pt3;
    }

    /**
     * Extends a point at an angle from a line.
     *
     * @param pt0 the first line point
     * @param pt1 the second line point
     * @param pt2 point on line from which to extend
     * @param alpha angle of extension in degrees
     * @param d the distance in pixels to extend
     *
     * @return the extension point
     */
    public static ExtendAngledLine(pt0: POINT2,
        pt1: POINT2,
        pt2: POINT2,
        alpha: double,
        d: double): POINT2 {
        let pt: POINT2 = new POINT2();
        try {
            //first get the angle psi between pt0 and pt1
            let psi: double = Math.atan((pt1.y - pt0.y) / (pt1.x - pt0.x));
            //convert alpha to radians
            let alpha1: double = Math.PI * alpha / 180;

            //theta is the angle of extension from the x axis
            let theta: double = psi + alpha1;
            //dx is the x extension from pt2
            let dx: double = d * Math.cos(theta);
            //dy is the y extension form pt2
            let dy: double = d * Math.sin(theta);
            pt.x = pt2.x + dx;
            pt.y = pt2.y + dy;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "ExtendAngledLine",
                    new RendererException("Failed inside ExtendAngledLine", exc));
            } else {
                throw exc;
            }
        }
        return pt;
    }

    /**
     * Returns an integer indicating the quadrant for the direction of the line
     * from pt1 to pt2
     *
     * @param pt1 first line point
     * @param pt2 second line point
     *
     * @return the quadrant
     */
    public static GetQuadrantDouble(pt1: POINT2,
        pt2: POINT2): int;

    public static GetQuadrantDouble(x1: double, y1: double,
        x2: double, y2: double): int;
    public static GetQuadrantDouble(...args: unknown[]): int {
        switch (args.length) {
            case 2: {
                const [pt1, pt2] = args as [POINT2, POINT2];


                let nQuadrant: int = 1;
                try {
                    if (pt2.x >= pt1.x && pt2.y <= pt1.y) {
                        nQuadrant = 1;
                    }
                    if (pt2.x >= pt1.x && pt2.y >= pt1.y) {
                        nQuadrant = 2;
                    }
                    if (pt2.x <= pt1.x && pt2.y >= pt1.y) {
                        nQuadrant = 3;
                    }
                    if (pt2.x <= pt1.x && pt2.y <= pt1.y) {
                        nQuadrant = 4;
                    }

                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(lineutility._className, "GetQuadrantDouble",
                            new RendererException("Failed inside GetQuadrantDouble", exc));
                    } else {
                        throw exc;
                    }
                }
                return nQuadrant;


                break;
            }

            case 4: {
                const [x1, y1, x2, y2] = args as [double, double, double, double];


                let nQuadrant: int = 1;
                try {
                    //            if(pt2.x>=pt1.x && pt2.y<=pt1.y)
                    //                    nQuadrant=1;
                    //            if(pt2.x>=pt1.x && pt2.y>=pt1.y)
                    //                    nQuadrant=2;
                    //            if(pt2.x<=pt1.x && pt2.y>=pt1.y)
                    //                    nQuadrant=3;
                    //            if(pt2.x<=pt1.x && pt2.y<=pt1.y)
                    //                    nQuadrant=4;

                    if (x2 >= x1 && y2 <= y1) {
                        nQuadrant = 1;
                    }
                    if (x2 >= x1 && y2 >= y1) {
                        nQuadrant = 2;
                    }
                    if (x2 <= x1 && y2 >= y1) {
                        nQuadrant = 3;
                    }
                    if (x2 <= x1 && y2 <= y1) {
                        nQuadrant = 4;
                    }
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(lineutility._className, "GetQuadrantDouble",
                            new RendererException("Failed inside GetQuadrantDouble", exc));
                    } else {
                        throw exc;
                    }
                }
                return nQuadrant;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Returns the smallest x and y pixel values from an array of points
     *
     * @param ptsSeize array of points from which to find minimum vaules
     * @param vblCounter the number of points to test in the array
     * @param x OUT - an object with a member to hold the xminimum
     * @param y OUT - an object with a member to hold the y minimum value
     *
     */
    public static GetPixelsMin(ptsSeize: POINT2[],
        vblCounter: int,
        x: ref<number[]>,
        y: ref<number[]>): void {
        try {
            let xmin: double = Number.POSITIVE_INFINITY;
            let ymin: double = Number.POSITIVE_INFINITY;
            let j: int = 0;

            for (j = 0; j < vblCounter; j++) {
                if (ptsSeize[j].x < xmin) {
                    xmin = ptsSeize[j].x;
                }
                if (ptsSeize[j].y < ymin) {
                    ymin = ptsSeize[j].y;
                }
            }
            x.value = new Array<number>(1);
            y.value = new Array<number>(1);
            x.value[0] = xmin;
            y.value[0] = ymin;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetPixelsMin",
                    new RendererException("Failed inside GetPixelsMin", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Returns the largest x and y pixel values from an array of points
     *
     * @param ptsSeize array of points from which to find maximum values
     * @param vblCounter the number of points to test in the array
     * @param x OUT - an object with a member to hold the x maximum value
     * @param y OUT - an object with a member to hold the y maximum value
     *
     */
    public static GetPixelsMax(ptsSeize: POINT2[],
        vblCounter: int,
        x: ref<number[]>,
        y: ref<number[]>): void {
        try {
            let xmax: double = Number.NEGATIVE_INFINITY;
            let ymax: double = Number.NEGATIVE_INFINITY;
            let j: int = 0;

            for (j = 0; j < vblCounter; j++) {
                if (ptsSeize[j].x > xmax) {
                    xmax = ptsSeize[j].x;
                }
                if (ptsSeize[j].y > ymax) {
                    ymax = ptsSeize[j].y;
                }
            }
            x.value = new Array<number>(1);
            y.value = new Array<number>(1);
            x.value[0] = xmax;
            y.value[0] = ymax;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetPixelsMax",
                    new RendererException("Failed inside GetPixelsMax", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Returns center point for a clockwise arc to connect pts 1 and 2. Also
     * returns an extended point on the line between pt1 and the new center
     * Caller passes a POINT1 array of size 2 for ptsSeize, passes pt1 and pt2
     * in ptsSeize Returns the radius of the 90 degree arc between C (arc
     * center) and pt1
     *
     * @param ptsSeize OUT - two point array also used for the returned two
     * points
     *
     * @return the radius
     */
    static CalcClockwiseCenterDouble(ptsSeize: POINT2[]): double {
        let dRadius: double = 0;
        try {
            //declarations
            let pt1: POINT2 = new POINT2(ptsSeize[0]);
            let pt2: POINT2 = new POINT2(ptsSeize[1]);
            let C: POINT2 = new POINT2(pt1);
            let midPt: POINT2 = new POINT2(pt1);	//the center to calculate
            let E: POINT2 = new POINT2(pt1);	//the extended point to calculate
            let ptYIntercept: POINT2 = new POINT2(pt1);
            let nQuadrant: int = 1;
            let b: double = 0;
            let b1: double = 0;
            let b2: double = 0;
            let dLength: double = 0;
            let m: ref<number[]> = new ref();
            let bolVertical: int = 0;
            let offsetX: ref<number[]> = new ref();
            let offsetY: ref<number[]> = new ref();
            let ptsTemp: POINT2[] = new Array<POINT2>(2);
            //end declarations

            //must offset the points if necessary because there will be calculations
            //extending from the Y Intercept
            ptsTemp[0] = new POINT2(pt1);
            ptsTemp[1] = new POINT2(pt2);
            lineutility.GetPixelsMin(ptsTemp, 2, offsetX, offsetY);
            if (offsetX.value[0] < 0) {
                offsetX.value[0] = offsetX.value[0] - 100;
            } else {
                offsetX.value[0] = 0;
            }
            //end section

            midPt.x = (pt1.x + pt2.x) / 2;
            midPt.y = (pt1.y + pt2.y) / 2;
            dLength = lineutility.CalcDistanceDouble(pt1, pt2);
            dRadius = dLength / Math.sqrt(2);
            nQuadrant = lineutility.GetQuadrantDouble(pt1, pt2);

            bolVertical = lineutility.CalcTrueSlopeDouble(pt1, pt2, m);
            if (bolVertical !== 0 && m.value[0] !== 0) //line not vertical or horizontal
            {
                b = pt1.y - m.value[0] * pt1.x;
                //y intercept of line perpendicular to midPt of pt,p2
                b1 = midPt.y + (1 / m.value[0]) * midPt.x;
                //we want to shift the Y axis to the left by offsetX
                //so we get the new Y intercept at x=offsetX
                b2 = (-1 / m.value[0]) * offsetX.value[0] + b1;
                ptYIntercept.x = offsetX.value[0];
                ptYIntercept.y = b2;
                switch (nQuadrant) {
                    case 1:
                    case 4: {
                        C = lineutility.ExtendLineDouble(ptYIntercept, midPt, dLength / 2);
                        break;
                    }

                    case 2:
                    case 3: {
                        C = lineutility.ExtendLineDouble(ptYIntercept, midPt, -dLength / 2);
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            if (bolVertical !== 0 && m.value[0] === 0) //horizontal line
            {
                C.x = midPt.x;
                if (pt1.x < pt2.x) {
                    C.y = midPt.y + dLength / 2;
                } else {
                    C.y = midPt.y - dLength / 2;
                }
            }
            if (bolVertical === 0) //vertical line
            {
                ptYIntercept.x = offsetX.value[0];
                ptYIntercept.y = midPt.y;
                switch (nQuadrant) {
                    case 1:
                    case 4: {
                        C = lineutility.ExtendLineDouble(ptYIntercept, midPt, dLength / 2);
                        break;
                    }

                    case 2:
                    case 3: {
                        C = lineutility.ExtendLineDouble(ptYIntercept, midPt, -dLength / 2);
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }

            E = lineutility.ExtendLineDouble(C, pt1, 50);
            ptsSeize[0] = new POINT2(C);
            ptsSeize[1] = new POINT2(E);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcClockwiseCenterDouble",
                    new RendererException("Failed inside CalcClockwiseCenterDouble", exc));
            } else {
                throw exc;
            }
        }
        return dRadius;
    }

    /**
     * Computes the points for an arrowhead based on a line segment
     *
     * @param startLinePoint segment start point
     * @param endLinePoint segment end point
     * @param nBiSector bisecotr in pixels
     * @param nBase base size in pixels
     * @param pResultLinePoints OUT - the arrowhead points
     * @param styl the line style to assign the last aroowhead point
     */
    static GetArrowHead4Double(startLinePoint: POINT2,
        endLinePoint: POINT2,
        nBiSector: int,
        nBase: int,
        pResultLinePoints: POINT2[],
        styl: int): void {
        try {
            //declarations
            let j: int = 0;
            let dy: double = (endLinePoint.y - startLinePoint.y) as double;
            let
                dx: double = (endLinePoint.x - startLinePoint.x) as double;
            let
                dSign: double = 1.0;
            let
                AHBY: double = 0;
            let
                AHBX: double = 0;
            let
                AHBLY: double = 0;
            let
                AHBLX: double = 0;
            let
                AHBRY: double = 0;
            let
                AHBRX: double = 0;
            let
                dAngle: double = 0;
            let
                dHypotenuse: double = 0;

            let tempLinePoint: POINT2 = new POINT2(startLinePoint);
            //end declarations

            if (dy === 0) {
                if (dx > 0) {
                    dAngle = Math.PI;
                } else {
                    dAngle = 0;
                }
            } else {
                dAngle = Math.atan(dx / dy) + Math.PI / 2;
            }

            tempLinePoint.style = 0;//PS_SOLID;

            if (dx <= 0.0 && dy <= 0.0) {
                dSign = -1.0;
            }
            if (dx >= 0.0 && dy <= 0.0) {
                dSign = -1.0;
            }
            if (dx <= 0.0 && dy >= 0.0) {
                dSign = 1.0;
            }
            if (dx >= 0.0 && dy >= 0.0) {
                dSign = 1.0;
            }

            dHypotenuse = dSign * nBiSector as double;

            //Find x, y for Arrow Head nBase startLinePoint POINT1
            AHBX = endLinePoint.x as double + dHypotenuse * Math.cos(dAngle);
            AHBY = endLinePoint.y as double - dHypotenuse * Math.sin(dAngle);

            //Half of the arrow head's length will be 10 units
            dHypotenuse = dSign * (nBase / 2.0) as double;

            //Find x, y of Arrow Head nBase Left side end POINT1
            AHBLX = AHBX - dHypotenuse * Math.sin(dAngle);
            AHBLY = AHBY - dHypotenuse * Math.cos(dAngle);

            //Find x, y of Arrow Head nBase Right side end POINT1
            AHBRX = AHBX + dHypotenuse * Math.sin(dAngle);
            AHBRY = AHBY + dHypotenuse * Math.cos(dAngle);

            //replacement, just trying to return the POINT1s
            tempLinePoint.x = AHBLX as int;
            tempLinePoint.y = AHBLY as int;
            pResultLinePoints[0] = new POINT2(tempLinePoint);
            pResultLinePoints[1] = new POINT2(endLinePoint);
            tempLinePoint.x = AHBRX as int;
            tempLinePoint.y = AHBRY as int;
            pResultLinePoints[2] = new POINT2(tempLinePoint);
            switch (styl) {
                case 0: {
                    for (j = 0; j < 2; j++) {
                        pResultLinePoints[j].style = 0;
                    }
                    pResultLinePoints[2].style = 5;
                    break;
                }

                case 9: {
                    for (j = 0; j < 2; j++) {
                        pResultLinePoints[j].style = 9;
                    }
                    pResultLinePoints[2].style = 10;
                    break;
                }

                case 18: {
                    for (j = 0; j < 2; j++) {
                        pResultLinePoints[j].style = 18;
                    }
                    pResultLinePoints[2].style = 5;
                    break;
                }

                default: {
                    for (j = 0; j < 2; j++) {
                        pResultLinePoints[j].style = styl;
                    }
                    pResultLinePoints[2].style = 5;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetArrowhead4Double",
                    new RendererException("Failed inside GetArrowhead4Double", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Returns the midpoint between two points.
     *
     * @param pt0 the first point
     * @param pt1 the second point
     * @param styl the style to assign the mid point
     *
     * @return the mid point
     */
    public static MidPointDouble(pt0: POINT2,
        pt1: POINT2,
        styl: int): POINT2 {
        let ptResult: POINT2 = new POINT2(pt0);
        try {
            ptResult.x = (pt0.x + pt1.x) / 2;
            ptResult.y = (pt0.y + pt1.y) / 2;
            ptResult.style = styl;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "MidPointDouble",
                    new RendererException("Failed inside MidPointDouble", exc));
            } else {
                throw exc;
            }
        }
        return ptResult;
    }

    /**
     * Rotates an the first vblCounter points in the array about its first point
     *
     * @param pLinePoints OUT - the points to rotate
     * @param vblCounter the number of points to rotate
     * @param lAngle the angle in degrees to rotate
     *
     * @return pLinePoints
     */
    protected static RotateGeometryDoubleOrigin(pLinePoints: POINT2[],
        vblCounter: int,
        lAngle: int): POINT2[] {
        try {
            //declarations
            let j: int = 0;
            let dRotate: double = 0;
            let
                dTheta: double = 0;
            let
                dGamma: double = 0;
            let
                x: double = 0;
            let
                y: double = 0;
            //end declarations

            if (lAngle !== 0) {
                let pdCenter: POINT2 = new POINT2();
                dRotate = lAngle as double * Math.PI / 180;
                //pdCenter = CalcCenterPointDouble(pLinePoints,vblCounter);
                pdCenter = new POINT2(pLinePoints[0]);

                for (j = 0; j < vblCounter; j++) {
                    dGamma = Math.PI + Math.atan((pLinePoints[j].y - pdCenter.y)
                        / (pLinePoints[j].x - pdCenter.x));

                    if (pLinePoints[j].x >= pdCenter.x) {
                        dGamma = dGamma + Math.PI;
                    }

                    dTheta = dRotate + dGamma;
                    y = lineutility.CalcDistanceDouble(pLinePoints[j], pdCenter) * Math.sin(dTheta);
                    x = lineutility.CalcDistanceDouble(pLinePoints[j], pdCenter) * Math.cos(dTheta);
                    pLinePoints[j].y = pdCenter.y + y;
                    pLinePoints[j].x = pdCenter.x + x;
                }	//end for

                return pLinePoints;
            }	//end if
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "RotateGeometryDoubleOrigin",
                    new RendererException("Failed inside RotateGeometryDoubleOrigin", exc));
            } else {
                throw exc;
            }
        }
        return pLinePoints;
    }  // end function

    /**
     * Returns a point a distance d pixels perpendicular to the pt0-pt1 line and
     * going toward pt2
     *
     * @param pt0 the first line point
     * @param pt1 the second line point
     * @param pt2 the relative line point
     * @param d the distance in pixels
     * @param styl the linestyle to assign the computed point
     *
     * @return the extended point
     */
    public static ExtendTrueLinePerpDouble(pt0: POINT2,
        pt1: POINT2,
        pt2: POINT2,
        d: double,
        styl: int): POINT2 {
        let ptResult: POINT2 = new POINT2(pt0);
        try {
            let ptYIntercept: POINT2 = new POINT2(pt0);
            let m: ref<number[]> = new ref();
            let b: double = 0;
            let b1: double = 0;	//b is the normal Y intercept (at 0)
            let nTemp: int = 0;			//b1 is the y intercept at offsetX

            //must obtain x minimum to get the y-intercept to the left of
            //the left-most point
            let offsetX: ref<number[]> = new ref();
            let offsetY: ref<number[]> = new ref();
            let pts: POINT2[] = new Array<POINT2>(3);
            pts[0] = new POINT2(pt0);
            pts[1] = new POINT2(pt1);
            pts[2] = new POINT2(pt2);
            lineutility.GetPixelsMin(pts, 3, offsetX, offsetY);

            if (offsetX.value[0] <= 0) //was < 0
            {
                offsetX.value[0] = offsetX.value[0] - 100;
            } else {
                offsetX.value[0] = 0;
            }
            //end section

            nTemp = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
            switch (nTemp) {
                case 0: {	//vertical line
                    if (pt0.y < pt1.y) {
                        ptResult.x = pt2.x - d;
                        ptResult.y = pt2.y;
                    } else {
                        ptResult.x = pt2.x + d;
                        ptResult.y = pt2.y;
                    }
                    break;
                }

                default: {	//non-vertical line
                    if (m.value[0] === 0) {
                        ptResult.x = pt2.x;
                        ptResult.y = pt2.y + d;
                    } else {
                        b = pt2.y as double + (1 / m.value[0]) * pt2.x as double;
                        //we need the y-intercept at the -offset
                        b1 = (-1 / m.value[0]) * offsetX.value[0] + b;
                        ptYIntercept.x = offsetX.value[0];
                        ptYIntercept.y = b1;
                        ptResult = lineutility.ExtendLineDouble(ptYIntercept, pt2, d);
                    }
                    break;
                }

            }
            ptResult.style = styl;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "ExtendTrueLinePerpDouble",
                    new RendererException("Failed inside ExtendTrueLinePerpDouble", exc));
            } else {
                throw exc;
            }
        }
        return ptResult;
    }

    /**
     * Calculates the intersection of 2 lines pelative to a point. if one of the
     * lines is vertical use a distance dWidth above or below the line. pass
     * bolVertical1 = 1, or bolVertical2 = 1 if either line segment is vertical,
     * else pass 0. return the unique intersection in X,Y pointers. p2 is the
     * point that connects the 2 line segments to which the intersecting lines
     * are related, i.e. the intersecting lines are a distance dWidth pixels
     * above or below p2. uses dWidth and lOrient for cases in which at least
     * one of the lines is vertical. for normal lines this function assumes the
     * caller has passed the m, b for the appropriate upper or lower lines to
     * get the desired intgercept. this function is used for calculating the
     * upper and lower channel lines for channel types. For lOrient: see
     * comments in Channels.ConnectTrueDouble2
     *
     * @param m1 slope of the first line
     * @param b1 intercept of the first line
     * @param m2 slope of the second line
     * @param b2 y intercept of the second line
     * @param p2 point that connects the 2 line segments to which the
     * intersecting lines are related
     * @param bolVerticalSlope1 1 if first segment is vertical, else 0
     * @param bolVerticalSlope2 1 if second line segment is vertical, else 0
     * @param dWidth the distance of the intersecting lines from p2 in pixels
     * @param lOrient the orientation of the intersecting lines relative to the
     * segments connecting p2
     * @param X OUT - object holds the x value of the intersection point
     * @param Y OUT - object holds the y value of the intersection point
     */
    static CalcTrueIntersectDouble(m1: double,
        b1: double,
        m2: double,
        b2: double,
        p2: POINT2, //can use for vertical lines
        bolVerticalSlope1: int,
        bolVerticalSlope2: int,
        dWidth: double, //use for vertical lines, use + for upper line, - for lower line
        lOrient: int,
        X: ref<number[]>, //intersection x value
        Y: ref<number[]>): int //intersection y value
    {

        try {
            //case both lines are vertical
            let dWidth2: double = Math.abs(dWidth);
            let b: double = 0;
            let dx: double = 0;
            let dy: double = 0;
            let m: double = 0;
            X.value = new Array<number>(1);
            Y.value = new Array<number>(1);

            //cannot get out of having to do this
            //the problem is caused by inexact slopes which are created by
            //clsLineUtility.DisplayIntersectPixels. This occurs when setting
            //pt2 or pt3 with X or Y on the boundary +/-maxPixels
            //if you try to walk out until you get exactly the same slope
            //it can be thousands of pixels, so you have to accept an arbitrary
            //and, unfortuantely, inexact slope
            if (m1 !== m2 && Math.abs(m1 - m2) <= Number.MIN_VALUE) {
                m1 = m2;
            }
            if (b1 !== b2 && Math.abs(b1 - b2) <= Number.MIN_VALUE) {
                b1 = b2;
            }

            //M. Deutch 10-24-11
            if (b1 === b2 && m1 + b1 === m2 + b2) {
                m1 = m2;
            }

            if (bolVerticalSlope1 === 0 && bolVerticalSlope2 === 0) //both lines vertical
            {
                switch (lOrient) {
                    case 0: {
                        X.value[0] = p2.x - dWidth2;
                        Y.value[0] = p2.y;
                        break;
                    }

                    case 3: {
                        X.value[0] = p2.x + dWidth2;
                        Y.value[0] = p2.y;
                        break;
                    }

                    default: {	//can never occur
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y;
                        break;
                    }

                }
                return 1;
            }
            if (bolVerticalSlope1 === 0 && bolVerticalSlope2 !== 0) //line1 vertical, line2 is not
            {	//there is a unique intersection
                switch (lOrient) {
                    case 0:	//Line1 above segment1
                    case 1: {
                        X.value[0] = p2.x - dWidth2;
                        Y.value[0] = m2 * X.value[0] + b2;
                        break;
                    }

                    case 2:	//Line1 below segment1
                    case 3: {
                        X.value[0] = p2.x + dWidth2;
                        Y.value[0] = m2 * X.value[0] + b2;
                        break;
                    }

                    default: {	//can not occur
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y;
                        break;
                    }

                }
                return 1;
            }
            if (bolVerticalSlope2 === 0 && bolVerticalSlope1 !== 0) //line2 vertical, line1 is not
            {	//there is a unique intersection
                switch (lOrient) {
                    case 0:	//Line1 above segment2
                    case 2: {
                        X.value[0] = p2.x - dWidth2;
                        Y.value[0] = m1 * (X.value[0]) + b1;
                        break;
                    }

                    case 1:	//Line1 below segment2
                    case 3: {
                        X.value[0] = p2.x + dWidth2;
                        Y.value[0] = m1 * (X.value[0]) + b1;
                        break;
                    }

                    default: {	//can not occur
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y;
                        break;
                    }

                }
                return 1;
            }//end if

            //must deal with this case separately because normal lines use m1-m2 as a denominator
            //but we've handled all the vertical cases above so can assume it's not vertical
            //if the b's are different then one is an upper line, the other is a lower, no intersection
            //m and b will be used to build the perpendicular line thru p2 which we will use to
            //build the intersection, so must assume slopes are not 0, handle separately
            if (m1 === m2 && m1 !== 0) {
                if (b1 === b2) //then the intercept is the point joining the 2 segments
                {
                    //build the perpendicular line
                    m = -1 / m1;
                    b = p2.y - m * p2.x;
                    X.value[0] = (b2 - b) / (m - m2);	//intersect the lines (cannot blow up, m = m2 not possible)
                    Y.value[0] = (m1 * (X.value[0]) + b1);
                    return 1;
                } else //can not occur
                {
                    X.value[0] = p2.x;
                    Y.value[0] = p2.y;
                    return 1;
                }
            }
            //slope is zero
            if (m1 === m2 && m1 === 0) {
                switch (lOrient) {
                    case 0:	//Line1 above the line
                    case 1: {	//should never happen
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y - dWidth2;
                        break;
                    }

                    case 3:	//Line1 below the line
                    case 2: {	//should never happen
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y + dWidth2;
                        break;
                    }

                    default: {	//can not occur
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y;
                        break;
                    }

                }
                return 1;
            }

            if (m1 === m2 && b1 === b2 && bolVerticalSlope1 !== 0 && bolVerticalSlope2 !== 0) {
                switch (lOrient) {
                    case 0: {	//Line1 is above the line
                        if (m1 < 0) {
                            dy = m1 * dWidth / Math.sqrt(1 + m1 * m1);	//dy is negative
                            dx = dy / m1;	//dx is negative
                            X.value[0] = p2.x + dx;
                            Y.value[0] = p2.y + dy;
                        }
                        if (m1 > 0) //slope is positive
                        {
                            dy = -m1 * dWidth / Math.sqrt(1 + m1 * m1);	//dy is negative
                            dx = -dy / m1;	//dx is positive
                            X.value[0] = p2.x + dx;
                            Y.value[0] = p2.y + dy;
                        }
                        break;
                    }

                    case 3: {	//Line1 is below the line
                        if (m1 <= 0) {
                            dy = -m1 * dWidth / Math.sqrt(1 + m1 * m1);	//dy is positive
                            dx = dy / m1;	//dx is positive
                            X.value[0] = p2.x + dx;
                            Y.value[0] = p2.y + dy;
                        } else {
                            dy = m1 * dWidth / Math.sqrt(1 + m1 * m1);	//dy is positive
                            dx = -dy / m1;	//dx is negative
                            X.value[0] = p2.x + dx;
                            Y.value[0] = p2.y + dy;
                        }
                        break;
                    }

                    default: {
                        X.value[0] = p2.x;
                        Y.value[0] = p2.y;
                        break;
                    }

                }
                return 1;
            }//end if

            //a normal line. no vertical or identical slopes
            //if m1=m2 function will not reach this point
            X.value[0] = (b2 - b1) / (m1 - m2);	//intersect the lines
            Y.value[0] = (m1 * (X.value[0]) + b1);
            return 1;
        } catch (exc) {
            if (exc instanceof Error) {
                X.value[0] = p2.x;
                Y.value[0] = p2.y;
                ErrorLogger.LogException(lineutility._className, "CalcTrueIntersectDouble",
                    new RendererException("Failed inside ExtendTrueIntersectDouble", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }

    /**
     * Returns the distance in pixels from x1,y1 to x2,y2
     *
     * @param x1 first point x location in pixels
     * @param y1 first point y location in pixels
     * @param x2 second point x location in pixels
     * @param y2 second point y location in pixels
     *
     * @return the distance
     */
    static CalcDistance2(x1: number,
        y1: number,
        x2: number,
        y2: number): double {
        let dResult: double = 0;
        try {
            dResult = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

            //sanity check
            //return x or y distance if return value is 0 or infinity
            let xdist: double = Math.abs(x1 - x2);
            let ydist: double = Math.abs(y1 - y2);
            let max: double = xdist;
            if (ydist > xdist) {
                max = ydist;
            }
            if (dResult === 0 || !Number.isFinite(dResult)) {
                if (max > 0) {
                    dResult = max;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcDistance2",
                    new RendererException("Failed inside CalcDistance2", exc));
            } else {
                throw exc;
            }
        }
        return dResult;
    }
    /**
     * gets the middle line for Rev B air corridors AC, LLTR, MRR, UAV
     * Middle line is handled separately now because the line may have been segmented
     * @param pLinePoints
     * @return 
     */
    protected static GetSAAFRMiddleLine(pLinePoints: POINT2[]): POINT2[] {
        let pts: POINT2[];
        try {
            let j: int = 0;
            let count: int = 0;
            for (j = 0; j < pLinePoints.length - 1; j++) {
                if (pLinePoints[j].style > 0) {
                    count++;
                }
            }
            pts = new Array<POINT2>(count * 2);
            count = 0;
            let dMRR: double = 0;
            let firstSegPt: POINT2;
            let lastSegPt: POINT2 | null = null;
            let pt0: POINT2;
            let pt1: POINT2;
            for (j = 0; j < pLinePoints.length; j++) {
                if (pLinePoints[j].style >= 0 || j === pLinePoints.length - 1) {
                    if (lastSegPt != null) {
                        firstSegPt = new POINT2(lastSegPt);
                        lastSegPt = new POINT2(pLinePoints[j]);
                        dMRR = firstSegPt.style;
                        pt0 = lineutility.ExtendLine2Double(lastSegPt, firstSegPt, -dMRR, 0);
                        pt1 = lineutility.ExtendLine2Double(firstSegPt, lastSegPt, -dMRR, 5);
                        pts[count++] = pt0;
                        pts[count++] = pt1;
                    }
                    else {
                        lastSegPt = new POINT2(pLinePoints[j]);
                    }
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetSAAFRMiddleLine",
                    new RendererException("Failed inside GetSAAFRMiddleLine", exc));
            } else {
                throw exc;
            }
        }
        return pts;
    }
    /**
     * Computes the points for a SAAFR segment
     *
     * @param pLinePoints OUT - the client points also used for the returned
     * points
     * @param lineType the line type
     * @param dMRR the symbol width
     */
    static GetSAAFRSegment(pLinePoints: POINT2[],
        lineType: int,
        dMRR: double): void {
        try {
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();
            let pt5: POINT2 = new POINT2();
            let m: ref<number[]> = new ref();
            let bolVertical: int = lineutility.CalcTrueSlopeDouble(pLinePoints[0], pLinePoints[1], m);
            //shortened line
            //pt1=ExtendLine2Double(pLinePoints[0],pLinePoints[1],-dMRR/2,5);
            //pt0=ExtendLine2Double(pLinePoints[1],pLinePoints[0],-dMRR/2,0);
            pt1 = lineutility.ExtendLine2Double(pLinePoints[0], pLinePoints[1], -dMRR, 5);
            pt0 = lineutility.ExtendLine2Double(pLinePoints[1], pLinePoints[0], -dMRR, 0);
            if (bolVertical !== 0 && m.value[0] < 1) {
                //upper line
                pt2 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 2, dMRR);
                pt2.style = 0;
                pt3 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 2, dMRR);
                pt3.style = 5;
                //lower line
                pt4 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 3, dMRR);
                pt4.style = 0;
                pt5 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 3, dMRR);
                pt5.style = 5;
            } //if( (bolVertical!=0 && m>1) || bolVertical==0)
            else {
                //left line
                pt2 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 0, dMRR);
                pt2.style = 0;
                pt3 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 0, dMRR);
                pt3.style = 5;
                //right line
                pt4 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 1, dMRR);
                pt4.style = 0;
                pt5 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 1, dMRR);
                pt5.style = 5;
            }
            //load the line points
            pLinePoints[0] = new POINT2(pt0);
            pLinePoints[1] = new POINT2(pt1);
            pLinePoints[2] = new POINT2(pt2);
            pLinePoints[3] = new POINT2(pt3);
            pLinePoints[4] = new POINT2(pt4);
            pLinePoints[5] = new POINT2(pt5);
            pLinePoints[5].style = 5;
            pLinePoints[0].style = 5;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetSAAFRSegment",
                    new RendererException("Failed inside GetSAAFRSegment", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Called by arraysupport for SAAFR and AC fill shapes
     * @param pLinePoints
     * @param dMRR
     */
    static GetSAAFRFillSegment(pLinePoints: POINT2[],
        dMRR: double): void {
        try {
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();
            let pt5: POINT2 = new POINT2();
            let m: ref<number[]> = new ref();
            let bolVertical: int = lineutility.CalcTrueSlopeDouble(pLinePoints[0], pLinePoints[1], m);
            if (bolVertical !== 0 && m.value[0] < 1) {
                //upper line
                pt2 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 2, dMRR);
                pt3 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 2, dMRR);
                //lower line
                pt4 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 3, dMRR);
                pt5 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 3, dMRR);
            } //if( (bolVertical!=0 && m>1) || bolVertical==0)
            else {
                //left line
                pt2 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 0, dMRR);
                pt3 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 0, dMRR);
                //right line
                pt4 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[0], 1, dMRR);
                pt5 = lineutility.ExtendDirectedLine(pLinePoints[0], pLinePoints[1], pLinePoints[1], 1, dMRR);
            }
            //load the line points
            pLinePoints[0] = new POINT2(pt2);
            pLinePoints[1] = new POINT2(pt3);
            pLinePoints[2] = new POINT2(pt5);
            pLinePoints[3] = new POINT2(pt4);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetSAAFRFillSegment",
                    new RendererException("Failed inside GetSAAFRFillSegment", exc));
            } else {
                throw exc;
            }
        }
        //return;
    }
    /**
     * Computes an arc.
     *
     * @param pResultLinePoints OUT - contains center and start point and holds
     * the result arc points
     * @param vblCounter the number of client points
     * @param dRadius the arc radius in pixels
     * @param linetype the linetype determines start andgle and end angle for
     * the arc
     *
     */
    static ArcArrayDouble(pResultLinePoints: POINT2[],
        vblCounter: int,
        dRadius: double,
        linetype: int,
        converter: IPointConversion | null): POINT2[] {
        try {
            //declarations
            let startangle: double = 0;
            let  //start of pArcLinePoints
                endangle: double = 0;
            let  //end of the pArcLinePoints
                increment: double = 0;
            let
                //m = 0,
                length: double = 0;
            let  //length of a to e
                M: double = 0;

            let j: int = 0;
            let numarcpts: int = 0;
            let bolVertical: int = 0;
            let m: ref<number[]> = new ref();
            //C is the center of the pArcLinePoints derived from a and e
            let C: POINT2 = new POINT2(pResultLinePoints[0]);
            let
                a: POINT2 = new POINT2(pResultLinePoints[1]);
            let
                e: POINT2 = new POINT2(pResultLinePoints[0]);

            let pArcLinePoints: POINT2[];
            //end declarations

            bolVertical = lineutility.CalcTrueSlopeDouble(a, e, m);
            if (bolVertical !== 0) {
                M = Math.atan(m.value[0]);
            } else {
                if (a.y < e.y) {
                    M = -Math.PI / 2;
                } else {
                    M = Math.PI / 2;
                }
            }
            if (converter != null) {
                let pt02d: Point2D = new Point2D(pResultLinePoints[0].x, pResultLinePoints[0].y);
                let pt12d: Point2D = new Point2D(pResultLinePoints[1].x, pResultLinePoints[1].y);
                //boolean reverseM=false;
                pt02d = converter.PixelsToGeo(pt02d);
                pt12d = converter.PixelsToGeo(pt12d);
                //M=mdlGeodesic.GetAzimuth(pt02d,pt12d);
                M = mdlGeodesic.GetAzimuth(new POINT2(pt02d.getX(), pt02d.getY()), new POINT2(pt12d.getX(), pt12d.getY()));
                M *= (Math.PI / 180);
                if (M < 0) {

                    M += Math.PI;
                }

            }
            length = lineutility.CalcDistanceDouble(a, e);
            if (converter != null) {
                let pt02d: Point2D = new Point2D(pResultLinePoints[0].x, pResultLinePoints[0].y);
                let pt12d: Point2D = new Point2D(pResultLinePoints[1].x, pResultLinePoints[1].y);
                pt02d = converter.PixelsToGeo(pt02d);
                pt12d = converter.PixelsToGeo(pt12d);
                //length=mdlGeodesic.geodesic_distance(pt02d,pt12d,null,null);
                length = mdlGeodesic.geodesic_distance(new POINT2(pt02d.getX(), pt02d.getY()), new POINT2(pt12d.getX(), pt12d.getY()), null, null);
            }
            switch (linetype) {
                case TacticalLines.CLUSTER: {
                    startangle = M - 90 * Math.PI / 180.0;
                    endangle = startangle + 2 * 90 * Math.PI / 180.0;
                    break;
                }

                case TacticalLines.TRIP: {
                    startangle = M - 45 * Math.PI / 180.0;
                    endangle = startangle + 2 * 45 * Math.PI / 180.0;
                    break;
                }

                case TacticalLines.ISOLATE:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH: {
                    startangle = M;
                    endangle = startangle + 330 * Math.PI / 180;
                    break;
                }

                case TacticalLines.TURN: {
                    startangle = M;
                    endangle = startangle + 90 * Math.PI / 180;
                    break;
                }

                case TacticalLines.OCCUPY:
                case TacticalLines.RETAIN:
                case TacticalLines.SECURE: {
                    startangle = M;
                    //if(CELineArrayGlobals.Change1==false)
                    endangle = startangle + 338 * Math.PI / 180;
                    //else
                    //	endangle=startangle+330*pi/180;
                    break;
                }

                default: {
                    startangle = 0;
                    endangle = 2 * Math.PI;
                    break;
                }

            }

            if (a.x < e.x) {
                switch (linetype) {
                    case TacticalLines.ISOLATE:
                    case TacticalLines.CORDONKNOCK:
                    case TacticalLines.CORDONSEARCH: {
                        startangle = M - Math.PI;
                        endangle = startangle + 330 * Math.PI / 180;
                        break;
                    }

                    case TacticalLines.OCCUPY:
                    case TacticalLines.RETAIN:
                    case TacticalLines.SECURE: {
                        startangle = M - Math.PI;
                        //if(CELineArrayGlobals.Change1==false)
                        endangle = startangle + 338 * Math.PI / 180;
                        //else
                        //	endangle=startangle+330*pi/180;
                        break;
                    }

                    case TacticalLines.TURN: {
                        startangle = M - Math.PI;
                        endangle = startangle + 90 * Math.PI / 180;
                        break;
                    }

                    case TacticalLines.CLUSTER: {
                        startangle = M - Math.PI + 90 * Math.PI / 180.0;
                        endangle = startangle - 2 * 90 * Math.PI / 180.0;
                        break;
                    }

                    case TacticalLines.TRIP: {
                        startangle = M - Math.PI + 45 * Math.PI / 180.0;
                        endangle = startangle - 2 * 45 * Math.PI / 180.0;
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }

            numarcpts = 26;
            pArcLinePoints = new Array<POINT2>(numarcpts);
            lineutility.InitializePOINT2Array(pArcLinePoints);
            increment = (endangle - startangle) / (numarcpts - 1);
            if (dRadius !== 0 && length !== 0) {
                C.x = (e.x as double - (dRadius / length)
                    * Math.trunc(a.x as double - e.x as double));
                C.y = (e.y as double - (dRadius / length)
                    * Math.trunc(a.y as double - e.y as double));
            }
            else {
                C.x = e.x;
                C.y = e.y;
            }
            if (converter != null) {
                let C2d: Point2D = new Point2D(pResultLinePoints[0].x, pResultLinePoints[0].y);
                C2d = converter.PixelsToGeo(C2d);
                let az: double = 0;
                let ptGeo2d: Point2D;
                let ptGeo: POINT2;
                let ptPixels: POINT2;
                for (j = 0; j < numarcpts; j++) {
                    az = startangle * 180 / Math.PI + j * increment * 180 / Math.PI;
                    //ptGeo=mdlGeodesic.geodesic_coordinate(C2d,length,az);
                    ptGeo = mdlGeodesic.geodesic_coordinate(new POINT2(C2d.getX(), C2d.getY()), length, az);
                    ptGeo2d = new Point2D(ptGeo.x, ptGeo.y);
                    ptGeo2d = converter.GeoToPixels(ptGeo2d);
                    ptPixels = new POINT2(ptGeo2d.getX(), ptGeo2d.getY());
                    pArcLinePoints[j].x = ptPixels.x;
                    pArcLinePoints[j].y = ptPixels.y;
                }
            }
            else {
                for (j = 0; j < numarcpts; j++) {
                    //pArcLinePoints[j]=pResultLinePoints[0];	//initialize
                    pArcLinePoints[j].x = Math.trunc(dRadius * Math.cos(startangle + j * increment));
                    pArcLinePoints[j].y = Math.trunc(dRadius * Math.sin(startangle + j * increment));
                }

                for (j = 0; j < numarcpts; j++) {
                    pArcLinePoints[j].x += C.x;
                    pArcLinePoints[j].y += C.y;
                }
            }
            for (j = 0; j < numarcpts; j++) {
                pResultLinePoints[j] = new POINT2(pArcLinePoints[j]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "ArcArrayDouble",
                    new RendererException("Failed inside ArcArrayDouble", exc));
            } else {
                throw exc;
            }
        }
        return pResultLinePoints;
    }
    /**
     * Gets geodesic circle using the converter
     * @param Center in pixels
     * @param pt1 a point on the radius in pixels
     * @param numpts number of points to return
     * @param CirclePoints the result points
     * @param converter 
     */
    static CalcCircleDouble2(Center: POINT2,
        pt1: POINT2,
        numpts: int,
        CirclePoints: POINT2[],
        converter: IPointConversion): void {
        try {
            let j: int = 0;
            let increment: double = (Math.PI * 2) / (numpts - 1);
            let ptCenter2d: Point2D = new Point2D(Center.x, Center.y);
            ptCenter2d = converter.PixelsToGeo(ptCenter2d);
            let pt12d: Point2D = new Point2D(pt1.x, pt1.y);
            pt12d = converter.PixelsToGeo(pt12d);
            Center = new POINT2(ptCenter2d.getX(), ptCenter2d.getY());
            pt1 = new POINT2(pt12d.getX(), pt12d.getY());
            let dist: double = mdlGeodesic.geodesic_distance(Center, pt1, null, null);

            //double dSegmentAngle = 2 * Math.PI / numpts;
            let az: double = 0;
            let startangle: double = 0;
            let endAngle: double = Math.PI * 2;
            let ptGeo: POINT2;
            let ptPixels: POINT2;
            let ptGeo2d: Point2D;
            for (j = 0; j < numpts - 1; j++) {
                az = startangle * 180 / Math.PI + j * increment * 180 / Math.PI;
                //ptGeo=mdlGeodesic.geodesic_coordinate(C2d,length,az);
                ptGeo = mdlGeodesic.geodesic_coordinate(Center, dist, az);
                ptGeo2d = new Point2D(ptGeo.x, ptGeo.y);
                ptGeo2d = converter.GeoToPixels(ptGeo2d);
                ptPixels = new POINT2(ptGeo2d.getX(), ptGeo2d.getY());
                CirclePoints[j].x = ptPixels.x;
                CirclePoints[j].y = ptPixels.y;
            }
            CirclePoints[numpts - 1] = new POINT2(CirclePoints[0]);

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcCircleDouble2",
                    new RendererException("Failed inside CalcCircleDouble2", exc));
            } else {
                throw exc;
            }
        }
        return;
    }
    /**
     * Computes the points for a circle. Assumes CirclePoints has been allocated
     * with size numpts.
     *
     * @param Center the cicle center
     * @param radius the circle radius in pixels
     * @param numpts the number of circle points
     * @param CirclePoints - OUT - array of circle points
     * @param styl the style to set the last circle point
     */
    static CalcCircleDouble(Center: POINT2,
        radius: double,
        numpts: int,
        CirclePoints: POINT2[],
        styl: int): void {
        try {
            let j: int = 0;
            let dSegmentAngle: double = 2 * Math.PI / (numpts - 1);
            let x: double = 0;
            let y: double = 0;
            for (j = 0; j < numpts - 1; j++) {
                x = Center.x + (radius * Math.cos(j as double * dSegmentAngle));
                y = Center.y + (radius * Math.sin(j as double * dSegmentAngle));
                CirclePoints[j] = new POINT2(x, y);
                CirclePoints[j].style = styl;
            }
            CirclePoints[numpts - 1] = new POINT2(CirclePoints[0]);

            switch (styl) {
                case 0: {
                    CirclePoints[numpts - 1].style = 0;
                    break;
                }

                case 9: {
                    CirclePoints[numpts - 1].style = 10;
                    break;
                }

                case 11: {
                    CirclePoints[numpts - 1].style = 12;
                    break;
                }

                default: {
                    CirclePoints[numpts - 1].style = 5;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcCircleDouble",
                    new RendererException("Failed inside CalcCircleDouble", exc));
            } else {
                throw exc;
            }
        }
    }

    static CalcCircleShape(Center: POINT2,
        radius: double,
        numpts: int,
        CirclePoints: POINT2[],
        styl: int): Shape2 {
        let shape: Shape2;
        if (styl === 9) {
            shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
        } else {
            shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
        }

        shape.set_Style(styl);
        try {
            let j: int = 0;
            lineutility.CalcCircleDouble(Center, radius, numpts, CirclePoints, styl);
            shape.moveTo(CirclePoints[0]);
            for (j = 1; j < numpts; j++) {
                shape.lineTo(CirclePoints[j]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcCircleShape",
                    new RendererException("Failed inside CalcCircleShape", exc));
            } else {
                throw exc;
            }
        }
        return shape;
    }

    private static GetSquallCurve(StartPt: POINT2,
        EndPt: POINT2,
        pSquallPts: POINT2[],
        sign: int,
        amplitude: double,
        quantity: int): void {
        try {
            let dist: double = lineutility.CalcDistanceDouble(StartPt, EndPt);
            let ptTemp: POINT2 = new POINT2();
            let j: int = 0;
            //end declarations

            //get points along the horizontal segment between StartPt and EndPt2;
            for (j = 0; j < quantity; j++) {
                ptTemp = lineutility.ExtendLineDouble(EndPt, StartPt, -dist * j as double / quantity as double);
                pSquallPts[j].x = ptTemp.x;
                //calculate the sin value along the x axis
                pSquallPts[j].y = ptTemp.y + amplitude * sign * Math.sin(j as double * 180 / quantity as double * Math.PI / 180);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetSquallShape",
                    new RendererException("Failed inside GeSquallShape", exc));
            } else {
                throw exc;
            }
        }
    }
    //caller needs to instantiate sign.value
    /**
     * Gets the squall curves for a line segment Assumes pSquallPts has been
     * allocated the proper number of points.
     *
     * @param StartPt segment start point
     * @param EndPt segment end point
     * @param pSquallPts OUT - the squall points
     * @param sign OUT - an object with a member to hold the starting curve sign
     * for the segment.
     * @param amplitude the sin curve amplitutde
     * @param quantity the number of points for each sin curve
     * @param length the desired length of the curve along the segment for each
     * sin curve
     *
     * @return segment squall points count
     */
    static GetSquallSegment(StartPt: POINT2,
        EndPt: POINT2,
        pSquallPts: POINT2[],
        sign: ref<number[]>,
        amplitude: double,
        quantity: int,
        length: double): int {
        let counter: int = 0;
        try {
            let StartCurvePt: POINT2;
            let EndCurvePt: POINT2;	//use these for the curve points
            let pSquallPts2: POINT2[] = new Array<POINT2>(quantity);
            let dist: double = lineutility.CalcDistanceDouble(StartPt, EndPt);
            let numCurves: int = Math.trunc(dist / length as double);
            let j: int = 0;
            let k: int = 0;
            let EndPt2: POINT2 = new POINT2();
            let angle: double = Math.atan((StartPt.y - EndPt.y) / (StartPt.x - EndPt.x));
            let lAngle: int = Math.trunc((180 / Math.PI) * angle);
            lineutility.InitializePOINT2Array(pSquallPts2);
            //define EndPt2 to be the point dist from StartPt along the x axis
            if (StartPt.x < EndPt.x) {
                EndPt2.x = StartPt.x + dist;
            } else {
                EndPt2.x = StartPt.x - dist;
            }

            EndPt2.y = StartPt.y;

            EndCurvePt = StartPt;
            for (j = 0; j < numCurves; j++) {
                StartCurvePt = lineutility.ExtendLineDouble(EndPt2, StartPt, - (j * length) as double);
                EndCurvePt = lineutility.ExtendLineDouble(EndPt2, StartPt, - ((j + 1) * length) as double);

                //get the curve points
                lineutility.GetSquallCurve(StartCurvePt, EndCurvePt, pSquallPts2, sign.value[0], amplitude, quantity);

                //fill the segment points with the curve points
                for (k = 0; k < quantity; k++) {
                    //pSquallPts[counter].x=pSquallPts2[k].x;
                    //pSquallPts[counter].y=pSquallPts2[k].y;
                    pSquallPts[counter] = new POINT2(pSquallPts2[k]);
                    counter++;
                }
                //reverse the sign

                sign.value[0] = -sign.value[0];
            }
            if (numCurves === 0) {
                pSquallPts[counter] = new POINT2(StartPt);
                counter++;
                pSquallPts[counter] = new POINT2(EndPt);
                counter++;
            }
            //the points are along the x axis. Rotate them about the first point as the origin
            lineutility.RotateGeometryDoubleOrigin(pSquallPts, counter, lAngle);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetSquallSegment",
                    new RendererException("Failed inside GetSquallSegment", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    //temporarily using 2000 pixels
    private static PointInBounds(pt: POINT2): int {
        try {
            //double maxPixels=CELineArrayGlobals.MaxPixels2;
            let maxPixels: double = 100000;//was 2000
            if (Math.abs(pt.x) <= maxPixels && Math.abs(pt.y) <= maxPixels) {
                return 1;
            } else {
                return 0;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "PointInBounds",
                    new RendererException("Failed inside PointInBounds", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }

    /**
     * @param pt
     * @param ul
     * @param lr
     * @return
     */
    private static PointInBounds2(pt: POINT2, ul: POINT2, lr: POINT2): int {
        try {
            let maxX: double = lr.x;
            let minX: double = ul.x;
            let maxY: double = lr.y;
            let minY: double = ul.y;
            if (pt.x <= maxX && pt.x >= minX && pt.y <= maxY && pt.y >= minY) {
                return 1;
            } else {
                return 0;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "PointInBounds2",
                    new RendererException("Failed inside PointInBounds2", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }

    /**
     * Analyzes if line from pt0 to pt 1 intersects a side and returns the
     * intersection or null assumes pt0 to pt1 is not vertical. the caller will
     * replace pt0 with the intersection point if it is not null
     *
     * @param pt0
     * @param pt1
     * @param sidePt0 vertical or horizontal side first point
     * @param sidePt1
     * @return null if it does not intersect the side
     */
    private static intersectSegment(pt0: POINT2, pt1: POINT2, sidePt0: POINT2, sidePt1: POINT2): POINT2 | null {
        let pt: POINT2;
        try {
            if (pt0.x === pt1.x) {
                return null;
            }
            let m: double = (pt1.y - pt0.y) / (pt1.x - pt0.x);
            let dx: double = 0;
            let dy: double = 0;
            let x: double = 0;
            let y: double = 0;
            let upper: POINT2;
            let lower: POINT2;
            let left: POINT2;
            let right: POINT2;
            let bolVertical: boolean = false;
            //the side is either vertical or horizontal
            if (sidePt0.x === sidePt1.x) //vertical side
            {
                bolVertical = true;
                if (sidePt0.y < sidePt1.y) {
                    upper = sidePt0;
                    lower = sidePt1;
                } else {
                    upper = sidePt1;
                    lower = sidePt0;
                }
            } else //horizontal side
            {
                if (sidePt0.x < sidePt1.x) {
                    left = sidePt0;
                    right = sidePt1;
                } else {
                    left = sidePt1;
                    right = sidePt0;
                }
            }
            //travel in the direction from pt0 to pt1 to find the pt0 intersect
            if (bolVertical) {  //the side to intersect is vertical
                dx = upper.x - pt0.x;
                dy = m * dx;
                x = upper.x;
                y = pt0.y + dy;
                //the potential intersection point
                pt = new POINT2(x, y);

                if (pt0.x <= pt.x && pt.x <= pt1.x) //left to right
                {
                    if (upper.y <= pt.y && pt.y <= lower.y) {
                        return pt;
                    }
                } else {
                    if (pt0.x >= pt.x && pt.x >= pt1.x) //right to left
                    {
                        if (upper.y <= pt.y && pt.y <= lower.y) {
                            return pt;
                        }
                    }
                }

            } else //horizontal side
            {
                dy = left.y - pt0.y;
                dx = dy / m;
                x = pt0.x + dx;
                y = left.y;
                //the potential intersection point
                pt = new POINT2(x, y);

                if (pt0.y <= pt.y && pt.y <= pt1.y) {
                    if (left.x <= pt.x && pt.x <= right.x) {
                        return pt;
                    }
                } else {
                    if (pt0.y >= pt.y && pt.y >= pt1.y) {
                        if (left.x <= pt.x && pt.x <= right.x) {
                            return pt;
                        }
                    }
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "intersectSegment",
                    new RendererException("Failed inside intersectSegment", exc));
            } else {
                throw exc;
            }
        }
        return null;
    }

    /**
     * side 1 ----- | | side 0 | | side 2 | | ------ side 3 bounds one segment
     * for autoshapes that need it: bydif, fordif, fix, mnfldfix if null is
     * returned the client should conect the original line points (i.e. no
     * jaggies)
     *
     * @param pt0
     * @param pt1
     * @param ul
     * @param lr
     * @return bounded segment or null
     */
    public static BoundOneSegment(pt0: POINT2, pt1: POINT2, ul: POINT2, lr: POINT2): POINT2[] | null {
        let line: POINT2[] = new Array<POINT2>(2);
        try {
            if (pt0.y < ul.y && pt1.y < ul.y) {
                return null;
            }
            if (pt0.y > lr.y && pt1.y > lr.y) {
                return null;
            }
            if (pt0.x < ul.x && pt1.x < ul.x) {
                return null;
            }
            if (pt0.x > lr.x && pt1.x > lr.x) {
                return null;
            }

            let bolVertical: boolean = false;
            lineutility.InitializePOINT2Array(line);
            if (pt0.x === pt1.x) {
                bolVertical = true;
            }

            if (bolVertical) {
                line[0] = new POINT2(pt0);
                if (line[0].y < ul.y) {
                    line[0].y = ul.y;
                }
                if (line[0].y > lr.y) {
                    line[0].y = lr.y;
                }

                line[1] = new POINT2(pt1);
                if (line[1].y < ul.y) {
                    line[1].y = ul.y;
                }
                if (line[1].y > lr.y) {
                    line[1].y = lr.y;
                }

                return line;
            }

            let dx: double = 0;
            let dy: double = 0;
            let x: double = 0;
            let y: double = 0;
            let m: double = (pt1.y - pt0.y) / (pt1.x - pt0.x);
            let side0Intersect: boolean = false;
            let
                side1Intersect: boolean = false;
            let
                side2Intersect: boolean = false;
            let
                side3Intersect: boolean = false;
            //travel in the direction from pt0 to pt1 to find pt0 intersect
            let ur: POINT2 = new POINT2(lr.x, ul.y);
            let ll: POINT2 = new POINT2(ul.x, lr.y);

            let pt0Intersect: POINT2;
            if (lineutility.PointInBounds2(pt0, ul, lr) === 1) {
                pt0Intersect = pt0;
            }
            if (pt0Intersect == null) {
                pt0Intersect = lineutility.intersectSegment(pt0, pt1, ll, ul);  //interesect side 0
                side0Intersect = true;
            }
            if (pt0Intersect == null) {
                pt0Intersect = lineutility.intersectSegment(pt0, pt1, ul, ur);  //interesect side 1
                side1Intersect = true;
            }
            if (pt0Intersect == null) {
                pt0Intersect = lineutility.intersectSegment(pt0, pt1, ur, lr);  //interesect side 2
                side2Intersect = true;
            }
            if (pt0Intersect == null) {
                pt0Intersect = lineutility.intersectSegment(pt0, pt1, ll, lr);  //interesect side 3
                side3Intersect = true;
            }

            //travel in the direction from pt1 to pt0 to find pt1 intersect
            let pt1Intersect: POINT2;
            if (lineutility.PointInBounds2(pt1, ul, lr) === 1) {
                pt1Intersect = pt1;
            }
            if (pt1Intersect == null && side0Intersect === false) {
                pt1Intersect = lineutility.intersectSegment(pt1, pt0, ll, ul);  //interesect side 0
            }
            if (pt1Intersect == null && side1Intersect === false) {
                pt1Intersect = lineutility.intersectSegment(pt1, pt0, ul, ur);  //interesect side 1
            }
            if (pt1Intersect == null && side2Intersect === false) {
                pt1Intersect = lineutility.intersectSegment(pt1, pt0, ur, lr);  //interesect side 2
            }
            if (pt1Intersect == null && side3Intersect === false) {
                pt1Intersect = lineutility.intersectSegment(pt1, pt0, ll, lr);  //interesect side 3
            }

            if (pt0Intersect != null && pt1Intersect != null) {
                line[0] = pt0Intersect;
                line[1] = pt1Intersect;
                //return line;
            } else {
                line = null;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "BoundOneSegment",
                    new RendererException("Failed inside BoundOneSegment", exc));
            } else {
                throw exc;
            }
        }
        return line;
    }

    private static DisplayIntersectPixels(pt0: POINT2,
        pt1: POINT2,
        pt2x: ref<number[]>,
        pt2y: ref<number[]>,
        pt3x: ref<number[]>,
        pt3y: ref<number[]>): int //POINT2 ul,
    //POINT2 lr)
    {
        let nResult: int = -1;
        try {
            //declarations
            let X: double = 0;
            let Y: double = 0;
            let m: ref<number[]> = new ref();
            //double maxPixels=CELineArrayGlobals.MaxPixels2;
            let maxPixels: double = 2000;
            //double maxX=lr.x,minX=ul.x,maxY=lr.y,minY=ul.y;

            let bol0Inside: int = 0;
            let bol1Inside: int = 0;
            let bolVertical: int = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
            let b: double = pt0.y - m.value[0] * pt0.x;	//the y intercept for the segment line
            let pt2: POINT2;
            let pt3: POINT2;
            //end declarations

            pt2x.value = new Array<number>(1);
            pt2y.value = new Array<number>(1);
            pt3x.value = new Array<number>(1);
            pt3y.value = new Array<number>(1);
            pt2 = new POINT2(pt0);
            pt3 = new POINT2(pt1);

            //diagnostic
            if (pt0.x <= maxPixels && pt0.x >= -maxPixels
                && pt0.y <= maxPixels && pt0.y >= -maxPixels) {
                bol0Inside = 1;
            }
            if (pt1.x <= maxPixels && pt1.x >= -maxPixels
                && pt1.y <= maxPixels && pt1.y >= -maxPixels) {
                bol1Inside = 1;
            }
            //if both points are inside the area then use the whole segment
            if (bol0Inside === 1 && bol1Inside === 1) {
                return 0;
            }
            //if at leat one of the points is inside the area then use some of the segment
            if (bol0Inside === 1 || bol1Inside === 1) {
                nResult = 1;
            }

            //segment is not vertical
            if (bolVertical !== 0) {
                //analysis for side 0, get the intersection for either point if it exists
                //diagnostic
                X = -maxPixels;
                //X=minX;

                Y = m.value[0] * X + b;
                if (pt0.x < -maxPixels && -maxPixels < pt1.x) //pt0 is outside the area
                {
                    if (-maxPixels <= Y && Y <= maxPixels) //intersection is on side 0
                    //if(minY<=Y && Y<=maxY)	//intersection is on side 0
                    {
                        pt2.x = X;
                        pt2.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                }
                if (pt1.x < -maxPixels && -maxPixels < pt0.x) //pt1 is outside the area
                //if(pt1.x<minX && minX<pt0.x)	//pt1 is outside the area
                {
                    if (-maxPixels <= Y && Y <= maxPixels) //intersection is on side 0
                    {
                        pt3.x = X;
                        pt3.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                }

                //analysis for side 1, get the intersection for either point if it exists
                Y = -maxPixels;
                if (m.value[0] !== 0) {
                    X = (Y - b) / m.value[0];
                    if (pt0.y < -maxPixels && -maxPixels < pt1.y) //pt0 is outside the area
                    {
                        if (-maxPixels <= X && X <= maxPixels) //intersection is on side 1
                        {
                            pt2.x = X;
                            pt2.y = Y;
                            nResult = 1;	//use at least some of the pixels
                        }
                    }
                    if (pt1.y <= -maxPixels && -maxPixels <= pt0.y) //pt1 is outside the area
                    {
                        if (-maxPixels < X && X < maxPixels) //intersection is on the boundary
                        {
                            pt3.x = X;
                            pt3.y = Y;
                            nResult = 1;	//use at least some of the pixels
                        }
                    }
                }
                //analysis for side 2, get the intersection for either point if it exists
                X = maxPixels;
                Y = m.value[0] * X + b;
                if (pt0.x < maxPixels && maxPixels < pt1.x) //pt1 is outside the area
                {
                    if (-maxPixels <= Y && Y <= maxPixels) //intersection is on the boundary
                    {
                        pt3.x = X;
                        pt3.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                }
                if (pt1.x < maxPixels && maxPixels < pt0.x) //pt0 is outside the area
                {
                    if (-maxPixels <= Y && Y <= maxPixels) //intersection is on the boundary
                    {
                        pt2.x = X;
                        pt2.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                }

                //analysis for side 3, get the intersection for either point if it exists
                Y = maxPixels;
                if (m.value[0] !== 0) {
                    X = (Y - b) / m.value[0];
                    if (pt0.y < maxPixels && maxPixels < pt1.y) //pt1 is outside the area
                    {
                        if (-maxPixels <= X && X <= maxPixels) //intersection is on the boundary
                        {
                            pt3.x = X;
                            pt3.y = Y;
                            nResult = 1;	//use at least some of the pixels
                        }
                    }
                    if (pt1.y < maxPixels && maxPixels < pt0.y) //pt0 is outside the area
                    {
                        if (-maxPixels <= X && X <= maxPixels) //intersection is on the boundary
                        {
                            pt2.x = X;
                            pt2.y = Y;
                            nResult = 1;	//use at least some of the pixels
                        }
                    }
                }
            }

            //segment is vertical
            if (bolVertical === 0) {
                //analysis for side 1
                X = pt0.x;
                Y = -maxPixels;
                if (-maxPixels < pt0.x && pt0.x < maxPixels) {
                    if (pt0.y <= -maxPixels && -maxPixels <= pt1.y) //pt0 outside the area
                    {
                        pt2.x = X;
                        pt2.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                    if (pt1.y <= -maxPixels && -maxPixels <= pt0.y) //pt1 outside the area
                    {
                        pt3.x = X;
                        pt3.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                }

                //analysis for side 3
                X = pt0.x;
                Y = maxPixels;
                if (-maxPixels < pt0.x && pt0.x < maxPixels) {
                    if (pt0.y <= maxPixels && maxPixels <= pt1.y) //pt1 outside the area
                    {
                        pt3.x = X;
                        pt3.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                    if (pt1.y <= maxPixels && maxPixels <= pt0.y) //pt0 outside the area
                    {
                        pt2.x = X;
                        pt2.y = Y;
                        nResult = 1;	//use at least some of the pixels
                    }
                }
            }

            pt2x.value[0] = pt2.x;
            pt2y.value[0] = pt2.y;
            pt3x.value[0] = pt3.x;
            pt3y.value[0] = pt3.y;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "DisplayIntersectPixels",
                    new RendererException("Failed inside DisplayIntersectPixels", exc));
            } else {
                throw exc;
            }
        }
        return nResult;
    }
    /**
     * Computes Ditch spikes for the ATDITCH line types. This function uses
     * linestyles provided by the caller to skip segments.
     *
     * @param pLinePoints OUT - the client points also used for the return
     * points
     * @param nOldCounter the number of client points
     * @param bWayIs the parallel line to use (0) for inner or outer spikes
     *
     * @return the symbol point count
     */
    static GetDitchSpikeDouble(tg: TGLight, pLinePoints: POINT2[],
        nOldCounter: int,
        bWayIs: int): int {
        let nSpikeCounter: int = 0;
        try {
            //declarations
            let linetype: int = tg.get_LineType();
            let nNumberOfSegments: int = 0;
            let
                lCircleCounter: int = 0;
            let
                bolVertical: int = 0;
            let
                nTemp: int = 0;
            let
                i: int = 0;
            let
                j: int = 0;
            let dPrinter: double = 1.0;
            let dIntLocation1x: double = 0;
            let
                dIntLocation2x: double = 0;
            let
                dIntLocation1y: double = 0;
            let
                dIntLocation2y: double = 0;
            let
                r: double = 0;
            let
                s: double = 0;
            let
                use: double = 0;
            let
                length: double = 0;
            let
                k: double = 0;
            let
                bint: double = 0;
            let pdAnswer: ref<number[]> = new ref();//new double[6];
            let m: ref<number[]> = new ref();

            let UpperLinePoint: POINT2 = new POINT2(pLinePoints[0]);
            let
                Lower1LinePoint: POINT2 = new POINT2(pLinePoints[0]);
            let
                Lower2LinePoint: POINT2 = new POINT2(pLinePoints[0]);
            let
                a: POINT2 = new POINT2(pLinePoints[0]);
            let
                b: POINT2 = new POINT2(pLinePoints[0]);
            let pCirclePoints: POINT2[] = new Array<POINT2>(pLinePoints.length);
            let averagePoint: POINT2 = new POINT2();
            let lastAveragePoint: POINT2 = new POINT2();
            let pTempLinePoints: POINT2[];
            //end declarations

            pTempLinePoints = new Array<POINT2>(nOldCounter);
            for (j = 0; j < nOldCounter; j++) {
                pTempLinePoints[j] = new POINT2(pLinePoints[j]);
            }

            let basePoints: Array<POINT2> = new Array();

            lineutility.InitializePOINT2Array(pCirclePoints);
            nSpikeCounter = nOldCounter;
            let spikeLength: double = arraysupport.getScaledSize(12, tg.get_LineThickness());
            let spikeHeight: double = spikeLength * 1.25;
            let minLength: double = 2 * spikeLength;
            for (i = 0; i < nOldCounter - 1; i++) {
                if (linetype === TacticalLines.ATDITCHM && i === 0) {
                    let radius: double = arraysupport.getScaledSize(4, tg.get_LineThickness());
                    minLength = spikeLength * 2.5 + radius * 2;
                }

                nTemp = lineutility.CalcTrueLinesDouble((spikeHeight * dPrinter), pLinePoints[i], pLinePoints[i + 1], pdAnswer);
                r = pdAnswer.value[3];
                s = pdAnswer.value[5];
                length = lineutility.CalcDistanceDouble(pLinePoints[i], pLinePoints[i + 1]);
                bolVertical = lineutility.CalcTrueSlopeDouble(pLinePoints[i], pLinePoints[i + 1], m);
                nNumberOfSegments = Math.trunc((length - 1) / (spikeLength * dPrinter));

                if (length > minLength * dPrinter) {    //minLength was 24
                    if (bWayIs !== 0) {
                        if (pLinePoints[i].x <= pLinePoints[i + 1].x) {
                            use = r;
                        }
                        if (pLinePoints[i].x >= pLinePoints[i + 1].x) {
                            use = s;
                        }
                    } //end if
                    else {
                        if (pLinePoints[i].x <= pLinePoints[i + 1].x) {
                            use = s;
                        }
                        if (pLinePoints[i].x >= pLinePoints[i + 1].x) {
                            use = r;
                        }
                    }	//end else

                    for (j = 1; j <= nNumberOfSegments; j++) {
                        k = j as double;
                        a = new POINT2(pLinePoints[i]);
                        b = new POINT2(pLinePoints[i + 1]);

                        if (j > 1) {
                            dIntLocation1x = dIntLocation2x;
                        } else {
                            dIntLocation1x
                                = pLinePoints[i].x as double + ((k * spikeLength - spikeLength) * dPrinter / length)
                                * (pLinePoints[i + 1].x - pLinePoints[i].x) as double;
                        }

                        if (j > 1) //added M. Deutch 2-23-99
                        {
                            dIntLocation1y = dIntLocation2y;
                        } else {
                            dIntLocation1y
                                = pLinePoints[i].y as double + ((k * spikeLength - spikeLength / 2) * dPrinter / length)
                                * (pLinePoints[i + 1].y - pLinePoints[i].y) as double;
                        }

                        dIntLocation2x = pLinePoints[i].x as double
                            + ((k * spikeLength + spikeLength / 2) * dPrinter / length)
                            * (pLinePoints[i + 1].x
                                - pLinePoints[i].x) as double;

                        dIntLocation2y = pLinePoints[i].y as double
                            + ((k * spikeLength + spikeLength / 2) * dPrinter / length)
                            * (pLinePoints[i + 1].y
                                - pLinePoints[i].y) as double;

                        if (m.value[0] !== 0 && bolVertical !== 0) {
                            bint = (dIntLocation1y + dIntLocation2y) / 2.0
                                + (1 / m.value[0]) * (dIntLocation1x + dIntLocation2x) / 2.0;
                            //independent of direction
                            UpperLinePoint = lineutility.CalcTrueIntersectDouble2(m.value[0], use, -1 / m.value[0], bint, 1, 1, pLinePoints[0].x, pLinePoints[0].y);
                        }

                        if (bolVertical === 0) //vertical segment
                        {
                            if (dIntLocation1y < dIntLocation2y) {
                                UpperLinePoint.y = dIntLocation1y as int + Math.trunc(length / nNumberOfSegments / 2);
                            } else {
                                UpperLinePoint.y = dIntLocation1y as int - Math.trunc(length / nNumberOfSegments / 2);
                            }
                            if (pLinePoints[i].y < pLinePoints[i + 1].y) {
                                UpperLinePoint.x = dIntLocation1x as int + Math.trunc(length / nNumberOfSegments);
                            } else {
                                UpperLinePoint.x = dIntLocation1x as int - Math.trunc(length / nNumberOfSegments);
                            }
                        }
                        if (m.value[0] === 0 && bolVertical !== 0) {
                            if (dIntLocation1x < dIntLocation2x) {
                                UpperLinePoint.x = dIntLocation1x as int + Math.trunc(length / nNumberOfSegments / 2);
                            } else {
                                UpperLinePoint.x = dIntLocation1x as int - Math.trunc(length / nNumberOfSegments / 2);
                            }
                            if (pLinePoints[i + 1].x < pLinePoints[i].x) {
                                UpperLinePoint.y = dIntLocation1y as int + Math.trunc(length / nNumberOfSegments);
                            } else {
                                UpperLinePoint.y = dIntLocation1y as int - Math.trunc(length / nNumberOfSegments);
                            }
                        }
                        //end section

                        Lower1LinePoint.x = dIntLocation1x;
                        Lower1LinePoint.y = dIntLocation1y;
                        Lower2LinePoint.x = dIntLocation2x;
                        Lower2LinePoint.y = dIntLocation2y;

                        pLinePoints[nSpikeCounter] = new POINT2(Lower1LinePoint);
                        if (linetype === TacticalLines.ATDITCHC || linetype === TacticalLines.ATDITCHM) {
                            pLinePoints[nSpikeCounter].style = 9;
                        }
                        if (j % 2 === 1 && linetype === TacticalLines.ATDITCHM)//diagnostic 1-8-13
                        {
                            pLinePoints[nSpikeCounter].style = 5;
                        }

                        nSpikeCounter++;

                        pLinePoints[nSpikeCounter] = new POINT2(UpperLinePoint);
                        if (linetype === TacticalLines.ATDITCHC || linetype === TacticalLines.ATDITCHM) {
                            pLinePoints[nSpikeCounter].style = 9;
                        }
                        if (j % 2 === 1 && linetype === TacticalLines.ATDITCHM)//diagnostic 1-8-13
                        {
                            pLinePoints[nSpikeCounter].style = 5;
                        }

                        nSpikeCounter++;

                        pLinePoints[nSpikeCounter] = new POINT2(Lower2LinePoint);
                        if (linetype === TacticalLines.ATDITCHC || linetype === TacticalLines.ATDITCHM) {
                            pLinePoints[nSpikeCounter].style = 10;
                        }
                        if (j % 2 === 1 && linetype === TacticalLines.ATDITCHM)//diagnostic 1-8-13
                        {
                            pLinePoints[nSpikeCounter].style = 5;
                        }

                        nSpikeCounter++;

                        if (linetype === TacticalLines.ATDITCHM) {
                            if (j % 2 === 0) {
                                averagePoint = lineutility.MidPointDouble(Lower1LinePoint, Lower2LinePoint, 0);
                                averagePoint = lineutility.MidPointDouble(averagePoint, UpperLinePoint, 0);
                            } else {
                                if (j === 1) {
                                    averagePoint = lineutility.ExtendLineDouble(Lower2LinePoint, Lower1LinePoint, 5);
                                    averagePoint = lineutility.MidPointDouble(averagePoint, UpperLinePoint, 0);
                                }
                            }

                        }
                        //end section
                        if (j > 1 && j < nNumberOfSegments) {
                            basePoints.push(new POINT2(Lower1LinePoint));
                            //if(j==nNumberOfSegments-1)
                            //  basePoints[basePoints.length-1].style=5;
                        } else {
                            if (j === 1) {
                                basePoints.push(new POINT2(pLinePoints[i]));
                            } else {
                                if (j === nNumberOfSegments) {
                                    basePoints.push(new POINT2(pLinePoints[i + 1]));
                                    basePoints[basePoints.length - 1].style = 5;
                                }
                            }

                        }

                        if (linetype === TacticalLines.ATDITCHM && j > 1) {
                            if (j % 2 === 0) {
                                pCirclePoints[lCircleCounter] = lineutility.MidPointDouble(averagePoint, lastAveragePoint, 20);
                                lCircleCounter++;
                            }
                            //end section
                        }
                        if (j < nNumberOfSegments && linetype === TacticalLines.ATDITCHM) {
                            if (j === 1 || j % 2 === 0) {
                                //LastUpperLinePoint = new POINT2(UpperLinePoint);
                                lastAveragePoint = new POINT2(averagePoint);
                            }
                            //end section
                        }
                    }//end for j<numberOfsegments
                } //end if length big enough
                else {
                    //diagnostic
                    pLinePoints[nSpikeCounter].x = pLinePoints[i].x;
                    pLinePoints[nSpikeCounter].y = pLinePoints[i].y;
                    pLinePoints[nSpikeCounter].style = 0;
                    nSpikeCounter++;
                    pLinePoints[nSpikeCounter].x = pLinePoints[i + 1].x;
                    pLinePoints[nSpikeCounter].y = pLinePoints[i + 1].y;
                    pLinePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                }
            }

            for (j = 0; j < nOldCounter; j++) //reverse the first nOldCounter points for
            {
                pLinePoints[j] = new POINT2(pTempLinePoints[nOldCounter - j - 1]); //purpose of drawing
                pLinePoints[j].style = 5;
            }

            if (pLinePoints[nSpikeCounter - 1].style === 0) {
                pLinePoints[nSpikeCounter - 1].style = 5;
            }
            let t: int = basePoints.length;
            //for (j = nSpikeCounter; j < nSpikeCounter + basePoints.length; j++) 
            for (j = nSpikeCounter; j < nSpikeCounter + t; j++) {
                pLinePoints[j] = new POINT2(basePoints[j - nSpikeCounter]);
                //if(linetype == TacticalLines.ATDITCHM && pLinePoints[j].style != 5)
                if (pLinePoints[j].style !== 5) {
                    pLinePoints[j].style = 0;
                }
            }
            nSpikeCounter += basePoints.length;

            if (linetype === TacticalLines.ATDITCHM as int) {
                pLinePoints[nSpikeCounter - 1].style = 5;//was 10
                for (j = nSpikeCounter; j < nSpikeCounter + lCircleCounter; j++) {
                    pLinePoints[j] = new POINT2(pCirclePoints[j - nSpikeCounter]);
                    pLinePoints[j].style = 20;
                }
                nSpikeCounter += lCircleCounter;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "GetDitchSpikeDouble",
                    new RendererException("Failed inside GetDitchSpikeDouble", exc));
            } else {
                throw exc;
            }
        }
        return nSpikeCounter;
    }

    /**
     * Moves pixels if points are identical, used for the channel types
     *
     * @param pLinePoints OUT - client points also for returned points
     */
    static MoveChannelPixels(pLinePoints: POINT2[]): void {
        try {
            if (pLinePoints == null || pLinePoints.length <= 0) {
                return;
            }

            let pixels: number[] = new Array<number>(pLinePoints.length * 2);
            let bolNoRepeats: boolean;
            let j: int = 0;
            let k: int = 0;
            let x1: double = 0;
            let y1: double = 0;
            let x2: double = 0;
            let y2: double = 0;
            let count: int = pLinePoints.length;
            //stuff pixels
            for (j = 0; j < count; j++) {
                pixels[k++] = pLinePoints[j].x;
                pixels[k++] = pLinePoints[j].y;
            }

            bolNoRepeats = false;
            do {
                bolNoRepeats = true;
                for (j = 0; j < count - 1; j++) {
                    x1 = pixels[2 * j];
                    y1 = pixels[2 * j + 1];
                    x2 = pixels[2 * j + 2];
                    y2 = pixels[2 * j + 3];
                    if (x1 === x2 && y1 === y2) //it's the same point
                    {
                        bolNoRepeats = false;
                        pixels[2 * j + 2] = x2 + 1; //move the point
                        break;
                    }
                }
            } while (bolNoRepeats === false);
            //stuff pLinePoints
            k = 0;
            for (j = 0; j < count; j++) {
                pLinePoints[j].x = pixels[k++];
                pLinePoints[j].y = pixels[k++];
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "MoveChannelPixels",
                    new RendererException("Failed inside MoveChannelPixels", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Single Concertina cannot have horizontal first segment
     *
     * @param linetype
     * @param pLinePoints
     */
    static moveSingleCPixels(linetype: int, pLinePoints: POINT2[]): void {
        try {
            switch (linetype) {
                case TacticalLines.SINGLEC: {
                    break;
                }

                default: {
                    return;
                }

            }
            if (pLinePoints.length > 1) {
                if (pLinePoints[1].y === pLinePoints[0].y) {
                    pLinePoints[1].y++;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "MoveSingleCPixels",
                    new RendererException("Failed inside MoveSingleCPixels", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Rotates an the first vblCounter points in the array about its first point
     *
     * @param pLinePoints OUT - the points to rotate
     * @param vblCounter the number of points to rotate
     * @param lAngle the angle in degrees to rotate
     */
    static RotateGeometryDouble(pLinePoints: POINT2[],
        vblCounter: int,
        lAngle: double): void {
        try {
            let j: int = 0;
            let dRotate: double = 0;
            let
                dTheta: double = 0;
            let
                dGamma: double = 0;
            let
                x: double = 0;
            let
                y: double = 0;

            if (lAngle !== 0) //if the angle is 0 no rotation occurs
            {
                let pdCenter: POINT2;
                dRotate = lAngle * Math.PI / 180;
                pdCenter = lineutility.CalcCenterPointDouble(pLinePoints, vblCounter);

                for (j = 0; j < vblCounter; j++) {
                    //added if/else to get rid of divide by zero error 5/12/04 M. Deutch
                    if (pLinePoints[j].x === pdCenter.x) {
                        if ((pLinePoints[j].y > pdCenter.y)) {
                            dGamma = Math.PI + Math.PI / 2;
                        } else {
                            dGamma = Math.PI / 2;
                        }
                    } else {
                        dGamma = Math.PI + Math.atan((pLinePoints[j].y - pdCenter.y)
                            / (pLinePoints[j].x - pdCenter.x));
                    }

                    if (pLinePoints[j].x as double >= pdCenter.x) {
                        dGamma = dGamma + Math.PI;
                    }

                    dTheta = dRotate + dGamma;
                    y = lineutility.CalcDistanceDouble(pLinePoints[j], pdCenter) * Math.sin(dTheta);
                    x = lineutility.CalcDistanceDouble(pLinePoints[j], pdCenter) * Math.cos(dTheta);
                    pLinePoints[j].y = pdCenter.y + y;
                    pLinePoints[j].x = pdCenter.x + x;
                }	//end for

                return;
            }	//end if
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "RotateGeometryDouble",
                    new RendererException("Failed inside RotateGeometryDouble", exc));
            } else {
                throw exc;
            }
        }
    }  // end

    /**
     * Returns the point perpendicular to the line (pt0 to pt1) at the midpoint
     * the same distance from (and on the same side of) the the line as
     * ptRelative.
     *
     * @param pt0 the first point
     * @param pt1 the second point
     * @param ptRelative the point to use for computing the return point
     *
     * @return the point perpendicular to the line at the midpoint
     */
    static PointRelativeToLine(pt0: POINT2,
        pt1: POINT2,
        ptRelative: POINT2): POINT2;

    /**
     * Returns the point perpendicular to the line (pt0 to pt1) at atPoint the
     * same distance from (and on the same side of) the the line as ptRelative.
     *
     * @param pt0 the first point
     * @param pt1 the second point
     * @param atPoint the point on the line at which to compute the extended
     * point
     * @param ptRelative the point to use for computing the return point
     *
     * @return the point perpendicular to the line at ptRelative
     */
    static PointRelativeToLine(pt0: POINT2,
        pt1: POINT2,
        atPoint: POINT2,
        ptRelative: POINT2): POINT2;
    static PointRelativeToLine(...args: unknown[]): POINT2 {
        switch (args.length) {
            case 3: {
                const [pt0, pt1, ptRelative] = args as [POINT2, POINT2, POINT2];


                let ptResult: POINT2 = new POINT2(pt0);
                try {
                    let bolVertical: int = 0;
                    let m: ref<number[]> = new ref();
                    let midPt: POINT2 = lineutility.MidPointDouble(pt0, pt1, 0);
                    let b1: double = 0;
                    let b2: double = 0;
                    //end declarations

                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
                    if (bolVertical === 0) //line is vertical
                    {
                        ptResult.x = ptRelative.x;
                        ptResult.y = midPt.y;
                    }
                    if (bolVertical !== 0 && m.value[0] === 0) {
                        ptResult.x = midPt.x;
                        ptResult.y = ptRelative.y;
                    }
                    if (bolVertical !== 0 && m.value[0] !== 0) {
                        b1 = midPt.y + (1 / m.value[0]) * midPt.x;	//the line perp to midPt
                        b2 = ptRelative.y - m.value[0] * ptRelative.x;	//the line  ptRelative with the slope of pt1-pt2
                        ptResult = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b1, m.value[0], b2, 1, 1, 0, 0);
                    }
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(lineutility._className, "PointRelativeToLine",
                            new RendererException("Failed inside PointRelativeToLine", exc));
                    } else {
                        throw exc;
                    }
                }
                return ptResult;


                break;
            }

            case 4: {
                const [pt0, pt1, atPoint, ptRelative] = args as [POINT2, POINT2, POINT2, POINT2];


                let ptResult: POINT2 = new POINT2(pt0);
                try {
                    let bolVertical: int = 0;
                    let m: ref<number[]> = new ref();
                    let b1: double = 0;
                    let b2: double = 0;

                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
                    if (bolVertical === 0) //line is vertical
                    {
                        ptResult.x = ptRelative.x;
                        ptResult.y = atPoint.y;
                    }
                    if (bolVertical !== 0 && m.value[0] === 0) {
                        ptResult.x = atPoint.x;
                        ptResult.y = ptRelative.y;
                    }
                    if (bolVertical !== 0 && m.value[0] !== 0) {
                        b1 = atPoint.y + (1 / m.value[0]) * atPoint.x;	//the line perp to midPt
                        b2 = ptRelative.y - m.value[0] * ptRelative.x;	//the line  ptRelative with the slope of pt1-pt2
                        ptResult = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b1, m.value[0], b2, 1, 1, 0, 0);
                    }
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(lineutility._className, "PointRelativeToLine",
                            new RendererException("Failed inside PointRelativeToLine", exc));
                    } else {
                        throw exc;
                    }
                }
                return ptResult;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * shift the control point to match the shift that occurs in
     * Channels.GetAXADDouble for CATKBYFIRE. This is because the rotary feature
     * arrow tip must align with the anchor point
     *
     * @param linetype
     * @param pLinePoints the anchor points including the control point
     * @param dist the minimum required distance from the front of the rotary
     * arrow
     */
    public static adjustCATKBYFIREControlPoint(linetype: int,
        pLinePoints: Array<POINT2>,
        dist: double): void {
        try {
            if (linetype !== TacticalLines.CATKBYFIRE) {
                return;
            }

            let dist2: double = lineutility.CalcDistanceDouble(pLinePoints[0], pLinePoints[1]);
            if (dist2 <= dist) {
                return;
            }

            let pt: POINT2;
            let count: int = pLinePoints.length;
            let pt0: POINT2 = new POINT2(pLinePoints[0]);
            let pt1: POINT2 = new POINT2(pLinePoints[1]);
            let controlPt: POINT2 = new POINT2(pLinePoints[count - 1]);
            let pt4: POINT2 = lineutility.PointRelativeToLine(pt0, pt1, pt1, controlPt);
            pt = lineutility.ExtendLineDouble(pt4, controlPt, dist);
            pLinePoints[count - 1] = pt;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "adjustCATKBYFIREControlPoint",
                    new RendererException("Failed inside adjustCATKBYFIREControlPoint", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Returns in pt2 and pt3 the line segment parallel to segment pt0-pt1 which
     * would contain ptRelative. pt2 corresponds to pt0 and pt3 corresponds to
     * pt1.
     *
     * @param pt0 first line point
     * @param pt1 second line point
     * @param ptRelative relative line point
     * @param pt2 OUT - first computed relative line point
     * @param pt3 OUT - second computed relative line point
     */
    public static LineRelativeToLine(pt0: POINT2,
        pt1: POINT2,
        ptRelative: POINT2,
        pt2: POINT2,
        pt3: POINT2): void {
        try {
            let bolVertical: int = 0;
            let m: ref<number[]> = new ref();
            let b1: double = 0;
            let b2: double = 0;
            let pt2Temp: POINT2;
            let pt3Temp: POINT2;

            bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
            if (bolVertical === 0) //line is vertical
            {
                pt2.x = ptRelative.x;
                pt2.y = pt0.y;
                pt3.x = ptRelative.x;
                pt3.y = pt1.y;
            }
            if (bolVertical !== 0 && m.value[0] === 0) //line is horizontal
            {
                pt2.x = pt0.x;
                pt2.y = ptRelative.y;
                pt3.x = pt1.x;
                pt3.y = ptRelative.y;
            }
            if (bolVertical !== 0 && m.value[0] !== 0) {
                b1 = pt0.y + (1 / m.value[0]) * pt0.x;	//the line perp to pt0
                b2 = ptRelative.y - m.value[0] * ptRelative.x;	//the line the ptRelative with the slope of pt0-pt1
                pt2Temp = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b1, m.value[0], b2, 1, 1, 0, 0);

                b1 = pt1.y + (1 / m.value[0]) * pt1.x;	//the line perp to pt1
                //b2=ptRelative.y-m*ptRelative.x;	//the line the ptRelative with the slope of pt0-pt1
                pt3Temp = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b1, m.value[0], b2, 1, 1, 0, 0);

                pt2.x = pt2Temp.x;
                pt2.y = pt2Temp.y;
                pt3.x = pt3Temp.x;
                pt3.y = pt3Temp.y;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "LineRelativeToLine",
                    new RendererException("Failed inside LineRelativeToLine", exc));
            } else {
                throw exc;
            }
        }
    }

    private static CalcMBR(pLinePoints: POINT2[],
        numpts: int,
        ulx: ref<number[]>,
        uly: ref<number[]>,
        lrx: ref<number[]>,
        lry: ref<number[]>): void {
        try {
            let j: int = 0;
            //initialize the MBR
            ulx.value = new Array<number>(1);
            uly.value = new Array<number>(1);
            lrx.value = new Array<number>(1);
            lry.value = new Array<number>(1);
            ulx.value[0] = Number.MAX_VALUE;//was 99999
            uly.value[0] = Number.MAX_VALUE;//was 99999
            lrx.value[0] = -Number.MAX_VALUE;//was -99999
            lry.value[0] = -Number.MAX_VALUE;//was -99999
            for (j = 0; j < numpts; j++) {
                if (pLinePoints[j].x > lrx.value[0]) {
                    lrx.value[0] = pLinePoints[j].x;
                }
                if (pLinePoints[j].y > lry.value[0]) {
                    lry.value[0] = pLinePoints[j].y;
                }
                if (pLinePoints[j].x < ulx.value[0]) {
                    ulx.value[0] = pLinePoints[j].x;
                }
                if (pLinePoints[j].y < uly.value[0]) {
                    uly.value[0] = pLinePoints[j].y;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcMBR",
                    new RendererException("Failed inside CalcMBR", exc));
            } else {
                throw exc;
            }
        }
        return;
    }

    public static CalcMBRPoints(pLinePoints: POINT2[],
        numpts: int,
        ul: POINT2,
        lr: POINT2): void {
        try {
            let j: int = 0;
            ul.x = Number.MAX_VALUE;
            ul.y = Number.MAX_VALUE;
            lr.x = -Number.MAX_VALUE;
            lr.y = -Number.MAX_VALUE;
            for (j = 0; j < numpts; j++) {
                if (pLinePoints[j].x > lr.x) {
                    lr.x = pLinePoints[j].x;
                }
                if (pLinePoints[j].y > lr.y) {
                    lr.y = pLinePoints[j].y;
                }
                if (pLinePoints[j].x < ul.x) {
                    ul.x = pLinePoints[j].x;
                }
                if (pLinePoints[j].y < ul.y) {
                    ul.y = pLinePoints[j].y;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "CalcMBRPoints",
                    new RendererException("Failed inside CalcMBRPoints", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Computes the distance in pixels from upper left to lower right of the
     * minimum bounding rectangle for the first numpts of pLinePoints
     *
     * @param pLinePoints the inpupt point array
     * @param numpts the number of points to use
     *
     * @return the distance in pixels
     */
    static MBRDistance(pLinePoints: POINT2[],
        numpts: int): double {
        let result: double = 0;
        try {
            let ulx: ref<number[]> = new ref();
            let uly: ref<number[]> = new ref();
            let lrx: ref<number[]> = new ref();
            let lry: ref<number[]> = new ref();
            lineutility.CalcMBR(pLinePoints, numpts, ulx, uly, lrx, lry);
            result = Math.sqrt((lrx.value[0] - ulx.value[0]) * (lrx.value[0] - ulx.value[0]) + (lry.value[0] - uly.value[0]) * (lry.value[0] - uly.value[0]));
            //sanity check

            //return x or y distance if returnValue is 0 or infinity
            let xdist: double = Math.abs(lrx.value[0] - ulx.value[0]);
            let ydist: double = Math.abs(lry.value[0] - uly.value[0]);
            let max: double = xdist;
            if (ydist > xdist) {
                max = ydist;
            }

            if (result === 0 || !Number.isFinite(result)) {
                if (max > 0) {
                    result = max;
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "MBRDistance",
                    new RendererException("Failed inside MBRDistance", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }

    /**
     * Swaps two points.
     *
     * @param pt1 OUT - first point
     * @param pt2 OUT - second point
     *
     */
    static Reverse2Points(pt1: POINT2, pt2: POINT2): void {
        try {
            let tempPt: POINT2 = new POINT2();
            //store pt1
            tempPt.x = pt1.x;
            tempPt.y = pt1.y;
            pt1.x = pt2.x;
            pt1.y = pt2.y;
            pt2.x = tempPt.x;
            pt2.y = tempPt.y;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "Reverse2Points",
                    new RendererException("Failed inside Reverse2Points", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Creates a GeneralPath from a Path2D
     *
     * @param shape
     * @return
     */
    public static createStrokedShape(shape: Shape): Shape {
        let newshape: GeneralPath = new GeneralPath(); // Start with an empty shape
        try {
            // Iterate through the specified shape, perturb its coordinates, and
            // use them to build up the new shape.
            let coords: number[] = new Array<number>(6);
            for (let i: PathIterator = shape.getPathIterator(null); !i.isDone(); i.next()) {
                let type: int = i.currentSegment(coords);
                switch (type) {
                    case IPathIterator.SEG_MOVETO: {
                        //perturb(coords, 2);
                        newshape.moveTo(coords[0], coords[1]);
                        break;
                    }

                    case IPathIterator.SEG_LINETO: {
                        //perturb(coords, 2);
                        newshape.lineTo(coords[0], coords[1]);
                        break;
                    }

                    case IPathIterator.SEG_QUADTO: {
                        //perturb(coords, 4);
                        newshape.quadTo(coords[0], coords[1], coords[2], coords[3]);
                        break;
                    }

                    case IPathIterator.SEG_CUBICTO: {
                        //perturb(coords, 6);
                        newshape.curveTo(coords[0], coords[1], coords[2], coords[3],
                            coords[4], coords[5]);
                        break;
                    }

                    case IPathIterator.SEG_CLOSE: {
                        newshape.closePath();
                        break;
                    }
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "createStrokedShape",
                    new RendererException("Failed inside createStrokedShape", exc));
            } else {
                throw exc;
            }
        }
        return newshape;
    }
    //These functions were added to create a minimum bounding polygon
    /**
     * @deprecated Returns the determinant of the point matrix This determinant
     * tells how far p3 is from vector p1p2 and on which side it is
     * @param p1
     * @param p2
     * @param p3
     * @return
     */
    private static distance(p1: Point, p2: Point, p3: Point): int {
        try {
            let x1: int = p1.x;
            let x2: int = p2.x;
            let x3: int = p3.x;
            let y1: int = p1.y;
            let y2: int = p2.y;
            let y3: int = p3.y;
            return x1 * y2 + x3 * y1 + x2 * y3 - x3 * y2 - x2 * y1 - x1 * y3;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "distance",
                    new RendererException("Failed inside distance", exc));
            } else {
                throw exc;
            }
        }
        return 0;
    }

    /**
     * @deprecated Returns the determinant of the point matrix This determinant
     * tells how far p3 is from vector p1p2 and on which side it is
     * @param p1
     * @param p2
     * @param p3
     * @return
     */
    private static distance2(p1: POINT2, p2: POINT2, p3: POINT2): double {
        try {
            let x1: double = p1.x;
            let x2: double = p2.x;
            let x3: double = p3.x;
            let y1: double = p1.y;
            let y2: double = p2.y;
            let y3: double = p3.y;
            return x1 * y2 + x3 * y1 + x2 * y3 - x3 * y2 - x2 * y1 - x1 * y3;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "distance2",
                    new RendererException("Failed inside distance2", exc));
            } else {
                throw exc;
            }
        }
        return 0;
    }
    //Returns the points of convex hull in the correct order
    /**
     * @deprecated @param array
     * @return
     */
    static cHull(array: Array<Point>): Array<Point>;

    /**
     * @deprecated @param points
     * @param l
     * @param r
     * @param path
     */
    static cHull(points: Array<Point>, l: Point, r: Point, path: Array<Point>): void;
    static cHull(...args: unknown[]): Array<Point> | void | null {
        switch (args.length) {
            case 1: {
                const [array] = args as [Array<Point>];


                let size: int = array.length;
                if (size < 2) {
                    return null;
                }

                let l: Point = array[0];
                let r: Point = array[size - 1];
                let path: Array<Point> = new Array<Point>();
                path.push(l);
                lineutility.cHull(array, l, r, path);
                path.push(r);
                lineutility.cHull(array, r, l, path);
                return path;


                break;
            }

            case 4: {
                const [points, l, r, path] = args as [Array<Point>, Point, Point, Array<Point>];



                if (points.length < 3) {
                    return;
                }

                let maxDist: int = 0;
                let tmp: int = 0;
                let p: Point;

                for (let pt of points) {
                    if (pt !== l && pt !== r) {
                        tmp = lineutility.distance(l, r, pt);

                        if (tmp > maxDist) {
                            maxDist = tmp;
                            p = pt;
                        }
                    }
                }

                let left: Array<Point> = new Array<Point>();
                let right: Array<Point> = new Array<Point>();
                left.push(l);
                right.push(p);

                for (let pt of points) {
                    if (lineutility.distance(l, p, pt) > 0) {
                        left.push(pt);
                    } else {
                        if (lineutility.distance(p, r, pt) > 0) {
                            right.push(pt);
                        }
                    }

                }

                left.push(p);
                right.push(r);
                lineutility.cHull(left, l, p, path);
                path.push(p);
                lineutility.cHull(right, p, r, path);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * @deprecated @param array
     * @return
     */
    static cHull2(array: Array<POINT2>): Array<POINT2>;

    /**
     * @deprecated @param points
     * @param l
     * @param r
     * @param path
     */
    static cHull2(points: Array<POINT2>, l: POINT2, r: POINT2, path: Array<POINT2>): void;
    static cHull2(...args: unknown[]): Array<POINT2> | void | null {
        switch (args.length) {
            case 1: {
                const [array] = args as [Array<POINT2>];


                try {
                    let size: int = array.length;
                    if (size < 2) {
                        return null;
                    }

                    let l: POINT2 = array[0];
                    let r: POINT2 = array[size - 1];
                    let path: Array<POINT2> = new Array<POINT2>();
                    path.push(l);
                    lineutility.cHull2(array, l, r, path);
                    path.push(r);
                    lineutility.cHull2(array, r, l, path);
                    return path;
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(lineutility._className, "cHull2",
                            new RendererException("Failed inside cHull2", exc));
                    } else {
                        throw exc;
                    }
                }
                return null;


                break;
            }

            case 4: {
                const [points, l, r, path] = args as [Array<POINT2>, POINT2, POINT2, Array<POINT2>];



                if (points.length < 3) {
                    return;
                }

                let maxDist: double = 0;
                let tmp: double = 0;
                let p: POINT2;

                for (let pt of points) {
                    if (pt !== l && pt !== r) {
                        tmp = lineutility.distance2(l, r, pt);

                        if (tmp > maxDist) {
                            maxDist = tmp;
                            p = pt;
                        }
                    }
                }

                let left: Array<POINT2> = new Array<POINT2>();
                let right: Array<POINT2> = new Array<POINT2>();
                left.push(l);
                right.push(p);

                for (let pt of points) {
                    if (lineutility.distance2(l, p, pt) > 0) {
                        left.push(pt);
                    } else {
                        if (lineutility.distance2(p, r, pt) > 0) {
                            right.push(pt);
                        }
                    }

                }

                left.push(p);
                right.push(r);
                lineutility.cHull2(left, l, p, path);
                path.push(p);
                lineutility.cHull2(right, p, r, path);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public static getExteriorPoints(pLinePoints: POINT2[],
        vblCounter: int,
        lineType: int,
        interior: boolean
    ): void {
        let j: int = 0;
        let index: int = 0;
        let pt0: POINT2;
        let pt1: POINT2;
        let pt2: POINT2;
        let m01: ref<number[]> = new ref();
        let m12: ref<number[]> = new ref();
        let direction: int = 0;
        let intersectPt: POINT2;
        //ref<double[]> m1 = new ref(), m2 = new ref();
        let intersectPoints: Array<POINT2> = new Array();
        let b01: double = 0;
        let b12: double = 0;	//the y intercepts for the lines corresponding to m1,m2 
        let dist: double = pLinePoints[0].style;
        for (j = 0; j < vblCounter; j++) {
            if (j === 0 || j === vblCounter - 1) {
                pt0 = new POINT2(pLinePoints[vblCounter - 2]);
                pt1 = new POINT2(pLinePoints[0]);
                pt2 = new POINT2(pLinePoints[1]);
            } else {
                pt0 = new POINT2(pLinePoints[j - 1]);
                pt1 = new POINT2(pLinePoints[j]);
                pt2 = new POINT2(pLinePoints[j + 1]);
            }
            if (pt1.style > 0) {
                dist = pt1.style;
            }
            //the exterior/interior points
            let pt00: POINT2;
            let pt01: POINT2;
            let pt10: POINT2;
            let pt11: POINT2;

            index = j - 1;
            if (index < 0) {
                index = vblCounter - 1;
            }
            let pts: POINT2[] = new Array<POINT2>(pLinePoints.length);
            let n: int = pLinePoints.length;
            //for (int k = 0; k < pLinePoints.length; k++) 
            for (let k: int = 0; k < n; k++) {
                pts[k] = pLinePoints[k];
            }

            direction = arraysupport.GetInsideOutsideDouble2(pt0, pt1, pts, vblCounter, index, lineType);
            //reverse the direction if these are interior points
            if (interior === true) {
                switch (direction) {
                    case 0: {
                        direction = 1;
                        break;
                    }

                    case 1: {
                        direction = 0;
                        break;
                    }

                    case 2: {
                        direction = 3;
                        break;
                    }

                    case 3: {
                        direction = 2;
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            //pt00-pt01 will be the interior line inside line pt0-pt1
            //pt00 is inside pt0, pt01 is inside pt1
            pt00 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, direction, dist);
            pt01 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, direction, dist);

            //pt10-pt11 will be the interior line inside line pt1-pt2
            //pt10 is inside pt1, pt11 is inside pt2
            index = j;
            if (j === vblCounter - 1) {
                index = 0;
            }
            direction = arraysupport.GetInsideOutsideDouble2(pt1, pt2, pts as POINT2[], vblCounter, index, lineType);
            //reverse the direction if these are interior points
            if (interior === true) {
                switch (direction) {
                    case 0: {
                        direction = 1;
                        break;
                    }

                    case 1: {
                        direction = 0;
                        break;
                    }

                    case 2: {
                        direction = 3;
                        break;
                    }

                    case 3: {
                        direction = 2;
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            pt10 = lineutility.ExtendDirectedLine(pt1, pt2, pt1, direction, dist);
            pt11 = lineutility.ExtendDirectedLine(pt1, pt2, pt2, direction, dist);
            //intersectPt=new POINT2(null);
            //get the intersection of pt01-p00 and pt10-pt11
            //so it it is the interior intersection of pt0-pt1 and pt1-pt2

            //first handle the case of vertical lines.
            if (pt0.x === pt1.x && pt1.x === pt2.x) {
                intersectPt = new POINT2(pt01);
                intersectPoints.push(intersectPt);
                continue;
            }
            //it's the same situation if the slopes are identical,
            //simply use pt01 or pt10 since they already uniquely define the intesection
            lineutility.CalcTrueSlopeDouble2(pt00, pt01, m01);
            lineutility.CalcTrueSlopeDouble2(pt10, pt11, m12);
            //if(m01.dbl==m12.dbl)					
            if (m01.value[0] === m12.value[0]) {
                intersectPt = new POINT2(pt01);
                intersectPoints.push(intersectPt);
                continue;
            }
            //now we are assuming a non-trivial intersection
            //calculate the y-intercepts using y=mx+b (use b=y-mx)
            b01 = pt01.y - m01.value[0] * pt01.x;
            b12 = pt11.y - m12.value[0] * pt11.x;
            intersectPt = lineutility.CalcTrueIntersectDouble2(m01.value[0], b01, m12.value[0], b12, 1, 1, 0, 0);
            intersectPoints.push(intersectPt);
        }//end for
        let n: int = intersectPoints.length;
        //for (j = 0; j < intersectPoints.length; j++) 
        for (j = 0; j < n; j++) {
            pLinePoints[j] = intersectPoints[j];
        }
    }
    public static getDeepCopy(pts: Array<POINT2>): Array<POINT2> {
        let deepCopy: Array<POINT2>;
        try {
            if (pts == null || pts.length === 0) {

                return pts;
            }

            deepCopy = new Array();
            let j: int = 0;
            let pt: POINT2;
            for (j = 0; j < pts.length; j++) {
                pt = new POINT2(pts[j].x, pts[j].y, pts[j].style);
                deepCopy.push(pt);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(lineutility._className, "getDeepCopy",
                    new RendererException("Failed inside getDeepCopy", exc));
            } else {
                throw exc;
            }
        }
        return deepCopy;
    }

}//end lineutility
