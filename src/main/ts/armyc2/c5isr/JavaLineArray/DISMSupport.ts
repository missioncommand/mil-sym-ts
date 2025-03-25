import { type int, type double } from "../graphics2d/BasicTypes";

import { BasicStroke } from "../graphics2d/BasicStroke"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { CELineArray } from "../JavaLineArray/CELineArray"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { clsUtility } from "../JavaTacticalRenderer/clsUtility";


/**
 * A class which imported many of the C++ functions from Trident
 * Systems Dismounted Intelligence Situational Awareness System (DISM) for
 * rendering Mil-Standard-2525 tactical lines. This class does not get instantiated
 * Much of the code is still the original DISM code.
 *
 */
export class DISMSupport {
    private static readonly LEFT_SIDE: int = 0;
    private static readonly RIGHT_SIDE: int = 1;
    private static readonly COLINEAR: int = 2;

    private static readonly CONST_PI: double = Math.PI;
    private static readonly maxLength: double = 100;
    private static readonly minLength: double = 2.5;    //was 5
    private static readonly _className: string = "DISMSupport";

    //    protected static void setMinLength(double mLength)
    //    {
    //        minLength=mLength;
    //    }
    private static GetTGFontSize(iLength: double): double {
        let result: double = -1;
        try {
            if (iLength < 20) {

                result = 0;
            }

            else {
                if (iLength < 50) {

                    result = 1;
                }

                else {
                    if (iLength > 250) {

                        result = 3;
                    }

                    else {

                        result = 2;
                    }

                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetTGFontSize",
                    new RendererException("Failed inside GetTGFontSize", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }
    private static ArcApproximationDouble(left: double, top: double, right: double, bottom: double,
        startx: double, starty: double, endx: double, endy: double, lpoints: POINT2[]): void {

        try {
            let dstartx: double = startx;
            let dstarty: double = starty;
            let dendx: double = endx;
            let dendy: double = endy;
            let a: double = 0;
            let b: double = 0;
            let ctrX: double = 0;
            let ctrY: double = 0;
            let x1: double = 0;
            let y1: double = 0;
            let x2: double = 0;
            let y2: double = 0;
            let startAngle: double = 0;
            let endAngle: double = 0;
            let angleIncrement: double = 0;
            let t: double = 0;

            let i: int = 0;
            if (left > right) {
                let temp: double = left;
                left = right;
                right = temp;
            }
            if (top > bottom) {
                let temp: double = top;
                top = bottom;
                bottom = temp;
            }

            a = (right - left) / 2.0;
            b = (bottom - top) / 2.0;
            ctrX = left + a;
            ctrY = top + b;

            x1 = dstartx - ctrX;
            x2 = dendx - ctrX;
            y1 = ctrY - dstarty;
            y2 = ctrY - dendy;

            if (y1 === 0) {
                if (x1 > 0) {
                    startAngle = 0;
                }

                else {
                    startAngle = DISMSupport.CONST_PI;
                }

            }
            else {
                if (x1 === 0) {
                    if (y1 > 0) {
                        startAngle = DISMSupport.CONST_PI * 0.5;
                    }

                    else {
                        startAngle = DISMSupport.CONST_PI * -0.5;
                    }

                }
                else {
                    startAngle = Math.atan2(y1, x1);
                }

            }


            if (y2 === 0) {
                if (x2 > 0) {
                    endAngle = 0;
                }

                else {
                    endAngle = DISMSupport.CONST_PI;
                }

            }
            else {
                if (x2 === 0) {
                    if (y2 > 0) {
                        endAngle = DISMSupport.CONST_PI * 0.5;
                    }

                    else {
                        endAngle = DISMSupport.CONST_PI * -0.5;
                    }

                }
                else {
                    endAngle = Math.atan2(y2, x2);
                }

            }


            if (endAngle <= startAngle) {
                endAngle += 2 * DISMSupport.CONST_PI;
            }

            angleIncrement = (endAngle - startAngle) / 16.0;

            for (t = startAngle; i < 17; t += angleIncrement, i++) {
                lpoints[i].x = ctrX + a * Math.cos(t);
                lpoints[i].y = ctrY - b * Math.sin(t);
            }
            return;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "ArcApproximationDouble",
                    new RendererException("Failed inside ArcApproximationDouble", exc));
            } else {
                throw exc;
            }
        }
    }
    private static DrawOpenRectangleDouble(points: POINT2[], pointsCorner: POINT2[], resultpts: POINT2[]): void {
        try {
            // draw open-ended rectangle
            let point_mid: POINT2 = new POINT2();
            let j: int = 0;
            //	POINT1 pts[4];
            point_mid.x = (points[0].x + points[1].x) / 2;
            point_mid.y = (points[0].y + points[1].y) / 2;
            pointsCorner[0].x = points[0].x - point_mid.x + points[2].x;
            pointsCorner[0].y = points[0].y - point_mid.y + points[2].y;
            pointsCorner[1].x = points[1].x - point_mid.x + points[2].x;
            pointsCorner[1].y = points[1].y - point_mid.y + points[2].y;
            resultpts[0] = new POINT2(points[1]);
            resultpts[1] = new POINT2(pointsCorner[1]);
            resultpts[2] = new POINT2(pointsCorner[0]);
            resultpts[3] = new POINT2(points[0]);
            for (j = 0; j < 4; j++) {
                resultpts[j].style = 0;
            }
            resultpts[3].style = 5;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "DrawOpenRectangleDouble",
                    new RendererException("Failed inside DrawOpenRectangleDouble", exc));
            } else {
                throw exc;
            }
        }
        return;
    }
    private static DetermineDirectionDouble(points: POINT2[]): int {
        let result: int = 0;
        try {
            let dP0P1M: double = 0;
            let iP0P1B: double = 0;
            if (points[0].x === points[1].x) {
                if (points[2].x < points[0].x) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                // dP0P1M = slope of line between Point0 and Point1
                dP0P1M = (points[0].y - points[1].y) as double / (points[0].x - points[1].x) as double;
                // iP0P1B = b component of y=mx+b equation of line
                iP0P1B = (points[0].y - dP0P1M * points[0].x);
                if (((points[2].y - iP0P1B) / dP0P1M) > points[2].x) {
                    return 1;
                } else {
                    return 0;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "DetermineDirectionDouble",
                    new RendererException("Failed inside DetermineDirectionDouble", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }
    private static CalcEndpieceDeltasDouble(points: POINT2[], piDeltaX: ref<number[]>, piDeltaY: ref<number[]>,
        dAngleDelta: double
    ): void {
        try {
            // find midpoint between point0 and point1
            let pntMid: POINT2 = new POINT2();
            let iDiagEOL_length: double = 0;
            let dAngle1: double = 0;

            pntMid.x = (points[0].x + points[1].x) / 2;
            pntMid.y = (points[0].y + points[1].y) / 2;
            // iDiagEOL_length = length of the diagonal on end of line from line out to endpoint
            iDiagEOL_length = ((Math.sqrt // height of graphic
                (
                    (points[1].x - points[0].x) * (points[1].x - points[0].x) +
                    (points[1].y - points[0].y) * (points[1].y - points[0].y)) +
                Math.sqrt // length of graphic
                    (
                        (points[2].x - pntMid.x) * (points[2].x - pntMid.x) +
                        (points[2].y - pntMid.y) * (points[2].y - pntMid.y))) / 20);

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length as double > DISMSupport.maxLength / 5 * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength / 5 * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            // dAngle1 = angle used to calculate the end-piece deltas
            dAngle1 = Math.atan2(points[2].y - pntMid.y, points[2].x - pntMid.x) + dAngleDelta;
            //	dAngle1 = atan2(points[2].y - pntMid.y, points[2].x - pntMid.x) + dAngleDelta;
            piDeltaX.value = new Array<number>(1);
            piDeltaY.value = new Array<number>(1);
            piDeltaX.value[0] = (iDiagEOL_length * Math.cos(dAngle1));
            piDeltaY.value[0] = (iDiagEOL_length * Math.sin(dAngle1));
            return;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "CalcEndpieceDeltasDouble",
                    new RendererException("Failed inside CalcEndpieceDeltasDouble", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Calculates the points for DELAY, WITHDRAW, WDRAWUP, RETIRE
     *
     * @param points OUT - the client points, also used for the returned points.
     */
    static GetDelayGraphicEtcDouble(points: POINT2[]): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(2);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let iLength: double = 0;
            let iRadius: double = 0;
            let iDiagEOL_length: double = 0;
            let dAngle1: double = 0;
            let iDeltaX1: double = 0;
            let iDeltaY1: double = 0;
            let iDeltaX2: double = 0;
            let iDeltaY2: double = 0;
            let ptArcCenter: POINT2 = new POINT2();
            let arcpoints: POINT2[] = new Array<POINT2>(17);
            let deltapoints: POINT2[] = new Array<POINT2>(4);
            let j: int = 0;

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(arcpoints);
            lineutility.InitializePOINT2Array(deltapoints);

            points[counter] = new POINT2(savepoints[0]);
            points[counter].style = 14;
            counter++;
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 5;
            counter++;

            iLength = Math.sqrt((savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y));
            iRadius = Math.sqrt((savepoints[2].x - savepoints[1].x) * (savepoints[2].x - savepoints[1].x) +
                (savepoints[2].y - savepoints[1].y) * (savepoints[2].y - savepoints[1].y)) / 2;
            iDiagEOL_length = (iLength + iRadius * 2) / 20;

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {   //was minLength
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle1 = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);

            iDeltaX1 = (iDiagEOL_length * Math.cos(dAngle1 - DISMSupport.CONST_PI / 4));
            iDeltaY1 = (iDiagEOL_length * Math.sin(dAngle1 - DISMSupport.CONST_PI / 4));
            iDeltaX2 = (iDiagEOL_length * Math.cos(dAngle1 + DISMSupport.CONST_PI / 4));
            iDeltaY2 = (iDiagEOL_length * Math.sin(dAngle1 + DISMSupport.CONST_PI / 4));
            DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints);


            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints[j]);
                counter++;
            }
            // draw the semicircle
            ptArcCenter.x = (savepoints[1].x + savepoints[2].x) / 2;
            ptArcCenter.y = (savepoints[1].y + savepoints[2].y) / 2;


            let reverseArc: boolean = DISMSupport.ReverseDelayArc(savepoints);
            if (reverseArc === false) {
                DISMSupport.ArcApproximationDouble((ptArcCenter.x - iRadius), (ptArcCenter.y - iRadius),
                    (ptArcCenter.x + iRadius), (ptArcCenter.y + iRadius),
                    savepoints[1].x, savepoints[1].y, savepoints[2].x, savepoints[2].y, arcpoints);
            } else {
                DISMSupport.ArcApproximationDouble((ptArcCenter.x - iRadius), (ptArcCenter.y - iRadius),
                    (ptArcCenter.x + iRadius), (ptArcCenter.y + iRadius),
                    savepoints[2].x, savepoints[2].y, savepoints[1].x, savepoints[1].y, arcpoints);
            }

            for (j = 0; j < 17; j++) {
                points[counter] = new POINT2(arcpoints[j]);
                points[counter].style = 0;
                counter++;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDelayGraphicEtcDouble",
                    new RendererException("Failed inside GetDelayGraphicEtcDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for SCREEN, COVER, GUARD, SARA.
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param lineType the line type.
     */
    static GetDISMCoverDouble(points: POINT2[],
        lineType: int): int {
        let counter: int = 0;
        try {
            let pt0: POINT2 = new POINT2(points[0]);
            let pt1: POINT2 = new POINT2(points[1]);
            let pt2: POINT2 = new POINT2(points[2]);
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();

            lineutility.LineRelativeToLine(pt1, pt2, pt0, pt3, pt4);
            //now we have the pt3-pt4 line which pt0 is on
            //get the corresponding point back on the original line
            lineutility.LineRelativeToLine(pt3, pt0, pt1, pt2, pt4);
            let quadrant: int = lineutility.GetQuadrantDouble(pt0, pt4);

            pt1 = new POINT2(points[1]);
            pt2 = new POINT2(points[2]);
            let sign: int = 0;
            if (pt1.x < pt2.x && (quadrant === 1 || quadrant === 4)) {

                sign = -1;
            }

            else {
                if (pt1.x > pt2.x && (quadrant === 2 || quadrant === 3)) {

                    sign = -1;
                }

                else {

                    sign = 1;
                }

            }


            let initialPt: POINT2 = new POINT2(points[0]);
            initialPt.style = 0;
            let endPt0: POINT2 = new POINT2(points[1]);
            endPt0.style = 0;
            let endPt1: POINT2 = new POINT2(points[2]);
            endPt1.style = 0;

            // Get length of each line from initial point
            let length1: double = lineutility.CalcDistanceDouble(initialPt, endPt0);
            let length2: double = lineutility.CalcDistanceDouble(initialPt, endPt1);
            length1 = Math.min(length1, length2);

            if (DISMSupport.GetTGFontSize(length1) > 0) {
                let delta: double = length1 / 15;

                let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
                if (delta > DISMSupport.maxLength * DPIScaleFactor) {
                    delta = DISMSupport.maxLength * DPIScaleFactor;
                }
                if (delta < DISMSupport.minLength * DPIScaleFactor) {
                    delta = DISMSupport.minLength * DPIScaleFactor;
                }

                let ptsJaggyLine: POINT2[] = new Array<POINT2>(4);
                lineutility.InitializePOINT2Array(ptsJaggyLine);

                // Draw jaggy line 1
                let angle0: double = Math.atan2(initialPt.y - endPt0.y, initialPt.x - endPt0.x);
                let deltaX0a: double = Math.cos(angle0 + sign * DISMSupport.CONST_PI / 4) * delta;
                let deltaY0a: double = Math.sin(angle0 + sign * DISMSupport.CONST_PI / 4) * delta;
                ptsJaggyLine[0] = new POINT2(initialPt);
                if (lineType !== TacticalLines.SARA) {
                    ptsJaggyLine[0].x -= 30 * Math.cos(angle0);  //was 20
                    ptsJaggyLine[0].y -= 30 * Math.sin(angle0);
                }
                let midPt0: POINT2 = lineutility.MidPointDouble(ptsJaggyLine[0], endPt0, 0);
                ptsJaggyLine[1].x = midPt0.x - deltaX0a;
                ptsJaggyLine[1].y = midPt0.y - deltaY0a;
                ptsJaggyLine[2].x = midPt0.x + deltaX0a;
                ptsJaggyLine[2].y = midPt0.y + deltaY0a;
                ptsJaggyLine[3] = new POINT2(endPt0);
                for (let j: int = 0; j < 4; j++) {
                    points[counter] = new POINT2(ptsJaggyLine[j]);
                    counter++;
                }
                points[counter - 1].style = 5;

                // Draw Arrow 1
                let deltaX0b: double = Math.cos(angle0 - sign * DISMSupport.CONST_PI / 4) * delta;
                let deltaY0b: double = Math.sin(angle0 - sign * DISMSupport.CONST_PI / 4) * delta;
                ptsJaggyLine[0].x = ptsJaggyLine[3].x + deltaX0a;
                ptsJaggyLine[0].y = ptsJaggyLine[3].y + deltaY0a;
                ptsJaggyLine[1] = new POINT2(ptsJaggyLine[3]);
                ptsJaggyLine[2].x = ptsJaggyLine[3].x + deltaX0b;
                ptsJaggyLine[2].y = ptsJaggyLine[3].y + deltaY0b;
                for (let j: int = 0; j < 3; j++) {
                    points[counter] = new POINT2(ptsJaggyLine[j]);
                    points[counter].style = 0;
                    if (lineType === TacticalLines.SARA) {
                        points[counter].style = 9;
                    }

                    counter++;
                }
                points[counter - 1].style = 5;
                if (lineType === TacticalLines.SARA) {
                    points[counter - 1].style = 9;
                    points[counter] = new POINT2(points[counter - 3]);
                    points[counter].style = 10;
                    counter++;
                }

                // Draw jaggy line 2
                let angle1: double = Math.atan2(initialPt.y - endPt1.y, initialPt.x - endPt1.x);
                let deltaX1a: double = Math.cos(angle1 - sign * DISMSupport.CONST_PI / 4) * delta;
                let deltaY1a: double = Math.sin(angle1 - sign * DISMSupport.CONST_PI / 4) * delta;
                ptsJaggyLine[0] = new POINT2(initialPt);
                if (lineType !== TacticalLines.SARA) {
                    ptsJaggyLine[0].x -= 30 * Math.cos(angle1);  //was 20
                    ptsJaggyLine[0].y -= 30 * Math.sin(angle1);
                }
                let midPt1: POINT2 = lineutility.MidPointDouble(ptsJaggyLine[0], endPt1, 0);
                ptsJaggyLine[1].x = midPt1.x - deltaX1a;
                ptsJaggyLine[1].y = midPt1.y - deltaY1a;
                ptsJaggyLine[2].x = midPt1.x + deltaX1a;
                ptsJaggyLine[2].y = midPt1.y + deltaY1a;
                ptsJaggyLine[3] = new POINT2(endPt1);
                for (let j: int = 0; j < 4; j++) {
                    points[counter] = new POINT2(ptsJaggyLine[j]);
                    counter++;
                }
                points[counter - 1].style = 5;

                // Draw Arrow 2
                let deltaX1b: double = Math.cos(angle1 + sign * DISMSupport.CONST_PI / 4) * delta;
                let deltaY1b: double = Math.sin(angle1 + sign * DISMSupport.CONST_PI / 4) * delta;
                ptsJaggyLine[0].x = ptsJaggyLine[3].x + deltaX1a;
                ptsJaggyLine[0].y = ptsJaggyLine[3].y + deltaY1a;
                ptsJaggyLine[1] = new POINT2(ptsJaggyLine[3]);
                ptsJaggyLine[2].x = ptsJaggyLine[3].x + deltaX1b;
                ptsJaggyLine[2].y = ptsJaggyLine[3].y + deltaY1b;
                for (let j: int = 0; j < 3; j++) {
                    points[counter] = new POINT2(ptsJaggyLine[j]);
                    points[counter].style = 0;
                    if (lineType === TacticalLines.SARA) {

                        points[counter].style = 9;
                    }


                    counter++;
                }
                points[counter - 1].style = 5;
                if (lineType === TacticalLines.SARA) {
                    points[counter - 1].style = 9;
                    points[counter] = new POINT2(points[counter - 3]);
                    points[counter].style = 10;
                    counter++;
                }
            } else {
                points[0] = new POINT2(initialPt);
                points[0].style = 0;
                points[1] = new POINT2(endPt0);
                points[1].style = 5;
                points[2] = new POINT2(initialPt);
                points[2].style = 0;
                points[3] = new POINT2(endPt1);
                return 4;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMcoverDouble",
                    new RendererException("Failed inside GetDISMCoverDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * rev C uses 4 
     * @param points
     * @param linetype
     * @return
     */
    static GetDISMCoverDoubleRevC(points: POINT2[],
        linetype: int,
        vblSaveCounter: int): int {
        let counter: int = 0;
        try {
            // switch points[1] and points[2] if they are backwards
            let dAngle0: double = 0;
            let dDeltaX0: double = 0;
            let dDeltaY0: double = 0;
            let dDeltaX1: double = 0;
            let dDeltaY1: double = 0;
            let iLengthPt0Pt1: double = 0;
            let iLengthPt0Pt2: double = 0;
            let iDelta: double = 0;
            let j: int = 0;
            let t: int = 1;
            let iFontSize: double = 0;
            let iLetterOffset: double = 0;
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let pts: POINT2[] = new Array<POINT2>(2);
            let ptsJaggyLine: POINT2[] = new Array<POINT2>(4);
            //float scale = 1;
            let goLeftThenRight: boolean = false;
            let sign: int = 1;

            //rev C with 4 points
            let origPoints: POINT2[];
            if (vblSaveCounter === 4) {
                origPoints = new Array<POINT2>(4);
                for (j = 0; j < vblSaveCounter; j++) {

                    origPoints[j] = new POINT2(points[j]);
                }


                //reorder points
                points[1] = origPoints[0];
                points[2] = origPoints[3];
                points[0].x = (origPoints[1].x + origPoints[2].x) / 2;
                points[0].y = (origPoints[1].y + origPoints[2].y) / 2;
            }

            //added section for jaggy line orientation M. Deutch 6-24-11
            let pt0: POINT2 = new POINT2(points[0]);
            let pt1: POINT2 = new POINT2(points[1]);
            let pt2: POINT2 = new POINT2(points[2]);
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();

            lineutility.LineRelativeToLine(pt1, pt2, pt0, pt3, pt4);
            //now we have the pt3-pt4 line which pt0 is on
            //get the corresponding point back on the original line
            lineutility.LineRelativeToLine(pt3, pt0, pt1, pt2, pt4);
            let quadrant: int = lineutility.GetQuadrantDouble(pt0, pt4);

            pt1 = new POINT2(points[1]);
            pt2 = new POINT2(points[2]);
            if (pt1.x < pt2.x && quadrant === 1) {

                sign = -1;
            }

            else {
                if (pt1.x > pt2.x && quadrant === 2) {

                    sign = -1;
                }

                else {
                    if (pt1.x > pt2.x && quadrant === 3) {

                        sign = -1;
                    }

                    else {
                        if (pt1.x < pt2.x && quadrant === 4) {

                            sign = -1;
                        }

                    }

                }

            }

            if (linetype === TacticalLines.SARA) {

                t = 0;
            }


            if (points[1].x <= points[2].x) {

                goLeftThenRight = true;
            }


            //save the points in the correct order
            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
                savepoints[j].style = 0;
            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(ptsJaggyLine);

            iLengthPt0Pt1 = Math.sqrt((savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y));
            iLengthPt0Pt2 = Math.sqrt((savepoints[2].x - savepoints[0].x) * (savepoints[2].x - savepoints[0].x) +
                (savepoints[2].y - savepoints[0].y) * (savepoints[2].y - savepoints[0].y));

            if (iLengthPt0Pt1 > iLengthPt0Pt2) {
                iLengthPt0Pt1 = iLengthPt0Pt2;
            }
            iFontSize = DISMSupport.GetTGFontSize(iLengthPt0Pt1);
            if (iFontSize > 0) {
                iDelta = iLengthPt0Pt1 / 15;//was 15

                let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
                if (iDelta > DISMSupport.maxLength * DPIScaleFactor) {
                    iDelta = DISMSupport.maxLength * DPIScaleFactor;
                }
                if (iDelta < DISMSupport.minLength * DPIScaleFactor) {
                    iDelta = DISMSupport.minLength * DPIScaleFactor;
                }

                // left side: draw letter in from the jaggy line
                if (vblSaveCounter < 4)//rev b
                {
                    if (goLeftThenRight) {

                        savepoints[0].x -= 30 * t;
                    }
                    //was 20
                    else {

                        savepoints[0].x += 30 * t;
                    }
                    //was 20

                    iLetterOffset = 0;
                    ptsJaggyLine[0].x = savepoints[0].x - iLetterOffset * 2;//was -
                    ptsJaggyLine[0].y = savepoints[0].y;
                    ptsJaggyLine[0].x -= iLetterOffset;
                    dAngle0 = Math.atan2(ptsJaggyLine[0].y - savepoints[1].y, ptsJaggyLine[0].x - savepoints[1].x);
                    pts[0].x = (ptsJaggyLine[0].x + savepoints[1].x) / 2;
                    pts[0].y = (ptsJaggyLine[0].y + savepoints[1].y) / 2;
                    dDeltaX0 = Math.cos(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    dDeltaY0 = Math.sin(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    ptsJaggyLine[1].x = pts[0].x - dDeltaX0;    //was -
                    ptsJaggyLine[1].y = pts[0].y - dDeltaY0;    //was -
                    ptsJaggyLine[2].x = pts[0].x + dDeltaX0;    //was +
                    ptsJaggyLine[2].y = pts[0].y + dDeltaY0;    //was +
                    ptsJaggyLine[3] = new POINT2(savepoints[1]);
                    for (j = 0; j < 4; j++) {
                        points[counter] = new POINT2(ptsJaggyLine[j]);
                        counter++;
                    }
                    points[counter - 1].style = 5;
                }//end rev b
                else    //rev c
                {
                    ptsJaggyLine[0] = new POINT2(origPoints[1]);
                    dAngle0 = Math.atan2(ptsJaggyLine[0].y - origPoints[0].y, ptsJaggyLine[0].x - origPoints[0].x);
                    pts[0].x = (ptsJaggyLine[0].x + origPoints[0].x) / 2;
                    pts[0].y = (ptsJaggyLine[0].y + origPoints[0].y) / 2;
                    dDeltaX0 = Math.cos(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    dDeltaY0 = Math.sin(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    ptsJaggyLine[1].x = pts[0].x - dDeltaX0;    //was -
                    ptsJaggyLine[1].y = pts[0].y - dDeltaY0;    //was -
                    ptsJaggyLine[2].x = pts[0].x + dDeltaX0;    //was +
                    ptsJaggyLine[2].y = pts[0].y + dDeltaY0;    //was +
                    //ptsJaggyLine[3] = new POINT2(savepoints[1]);
                    ptsJaggyLine[3] = new POINT2(origPoints[0]);
                    for (j = 0; j < 4; j++) {
                        points[counter] = new POINT2(ptsJaggyLine[j]);
                        counter++;
                    }
                    points[counter - 1].style = 5;
                }//end rev c

                // draw arrow at end of line
                dDeltaX1 = Math.cos(dAngle0 - sign * DISMSupport.CONST_PI / 4) * iDelta;   //was -
                dDeltaY1 = Math.sin(dAngle0 - sign * DISMSupport.CONST_PI / 4) * iDelta;   //was -
                if (vblSaveCounter < 4) {
                    ptsJaggyLine[0].x = savepoints[1].x + dDeltaX0; //was +
                    ptsJaggyLine[0].y = savepoints[1].y + dDeltaY0; //was +
                }
                else {
                    ptsJaggyLine[0].x = origPoints[0].x + dDeltaX0; //was +
                    ptsJaggyLine[0].y = origPoints[0].y + dDeltaY0; //was +                    
                }
                if (vblSaveCounter < 4) {

                    ptsJaggyLine[1] = new POINT2(savepoints[1]);
                }

                else {

                    ptsJaggyLine[1] = new POINT2(origPoints[0]);
                }


                if (vblSaveCounter < 4) {
                    ptsJaggyLine[2].x = savepoints[1].x + dDeltaX1; //was +
                    ptsJaggyLine[2].y = savepoints[1].y + dDeltaY1; //was +
                }
                else {
                    ptsJaggyLine[2].x = origPoints[0].x + dDeltaX1; //was +
                    ptsJaggyLine[2].y = origPoints[0].y + dDeltaY1; //was +                    
                }
                for (j = 0; j < 3; j++) {
                    points[counter] = new POINT2(ptsJaggyLine[j]);
                    points[counter].style = 0;
                    if (linetype === TacticalLines.SARA) {
                        points[counter].style = 9;
                    }

                    counter++;
                }

                points[counter - 1].style = 5;
                if (linetype === TacticalLines.SARA) {
                    points[counter - 1].style = 9;
                    points[counter] = new POINT2(points[counter - 3]);
                    points[counter].style = 10;
                    counter++;
                }

                // right side: draw letter and jaggy line
                if (vblSaveCounter < 4)    //rev b
                {
                    if (goLeftThenRight) {

                        savepoints[0].x += 60 * t;
                    }
                    //was 40
                    else {

                        savepoints[0].x -= 60 * t;
                    }
                    //wass 40

                    ptsJaggyLine[0].x = savepoints[0].x + iLetterOffset * 2;
                    ptsJaggyLine[0].y = savepoints[0].y;
                    ptsJaggyLine[0].x += iLetterOffset;
                    dAngle0 = Math.atan2(ptsJaggyLine[0].y - savepoints[2].y, ptsJaggyLine[0].x - savepoints[2].x);
                    pts[0].x = (ptsJaggyLine[0].x + savepoints[2].x) / 2;
                    pts[0].y = (ptsJaggyLine[0].y + savepoints[2].y) / 2;
                    dDeltaX0 = Math.cos(dAngle0 - sign * DISMSupport.CONST_PI / 4) * iDelta;   //was -
                    dDeltaY0 = Math.sin(dAngle0 - sign * DISMSupport.CONST_PI / 4) * iDelta;   //was -
                    ptsJaggyLine[1].x = pts[0].x - dDeltaX0;    //was -
                    ptsJaggyLine[1].y = pts[0].y - dDeltaY0;    //was -
                    ptsJaggyLine[2].x = pts[0].x + dDeltaX0;    //was +
                    ptsJaggyLine[2].y = pts[0].y + dDeltaY0;    //was +
                    ptsJaggyLine[3] = new POINT2(savepoints[2]);
                    for (j = 0; j < 4; j++) {
                        points[counter] = new POINT2(ptsJaggyLine[j]);
                        counter++;
                    }
                    points[counter - 1].style = 5;
                    // draw arrow at end of line
                    dDeltaX1 = Math.cos(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    dDeltaY1 = Math.sin(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    ptsJaggyLine[0].x = savepoints[2].x + dDeltaX0;
                    ptsJaggyLine[0].y = savepoints[2].y + dDeltaY0;
                    ptsJaggyLine[1] = savepoints[2];
                    ptsJaggyLine[2].x = savepoints[2].x + dDeltaX1;
                    ptsJaggyLine[2].y = savepoints[2].y + dDeltaY1;
                }//end rev b
                else    //rev c
                {
                    ptsJaggyLine[0] = new POINT2(origPoints[2]);
                    dAngle0 = Math.atan2(ptsJaggyLine[0].y - origPoints[3].y, ptsJaggyLine[0].x - origPoints[3].x);
                    pts[0].x = (ptsJaggyLine[0].x + origPoints[3].x) / 2;
                    pts[0].y = (ptsJaggyLine[0].y + origPoints[3].y) / 2;
                    dDeltaX0 = Math.cos(dAngle0 - sign * DISMSupport.CONST_PI / 4) * iDelta;   //was -
                    dDeltaY0 = Math.sin(dAngle0 - sign * DISMSupport.CONST_PI / 4) * iDelta;   //was -
                    ptsJaggyLine[1].x = pts[0].x - dDeltaX0;    //was -
                    ptsJaggyLine[1].y = pts[0].y - dDeltaY0;    //was -
                    ptsJaggyLine[2].x = pts[0].x + dDeltaX0;    //was +
                    ptsJaggyLine[2].y = pts[0].y + dDeltaY0;    //was +
                    //ptsJaggyLine[3] = new POINT2(savepoints[2]);
                    ptsJaggyLine[3] = new POINT2(origPoints[3]);
                    for (j = 0; j < 4; j++) {
                        points[counter] = new POINT2(ptsJaggyLine[j]);
                        counter++;
                    }
                    points[counter - 1].style = 5;
                    // draw arrow at end of line
                    dDeltaX1 = Math.cos(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    dDeltaY1 = Math.sin(dAngle0 + sign * DISMSupport.CONST_PI / 4) * iDelta;   //was +
                    ptsJaggyLine[0].x = origPoints[3].x + dDeltaX0;
                    ptsJaggyLine[0].y = origPoints[3].y + dDeltaY0;
                    ptsJaggyLine[1] = new POINT2(origPoints[3]);
                    ptsJaggyLine[2].x = origPoints[3].x + dDeltaX1;
                    ptsJaggyLine[2].y = origPoints[3].y + dDeltaY1;
                }//end rev c

                for (j = 0; j < 3; j++) {
                    points[counter] = new POINT2(ptsJaggyLine[j]);
                    points[counter].style = 0;
                    if (linetype === TacticalLines.SARA) {

                        points[counter].style = 9;
                    }


                    counter++;
                }
                points[counter - 1].style = 5;
                if (linetype === TacticalLines.SARA) {
                    points[counter - 1].style = 9;
                    points[counter] = new POINT2(points[counter - 3]);
                    points[counter].style = 10;
                    counter++;
                }
            }
            else {
                points[0] = new POINT2(savepoints[0]);
                points[0].style = 0;
                points[1] = new POINT2(savepoints[1]);
                points[1].style = 5;
                points[2] = new POINT2(savepoints[0]);
                points[2].style = 0;
                points[3] = new POINT2(savepoints[2]);
                return 4;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMcoverDoubleRevC",
                    new RendererException("Failed inside GetDISMCoverDoubleRevc", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for BYPASS
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMBypassDouble(points: POINT2[],
        linetype: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            let rectpts: POINT2[] = new Array<POINT2>(4);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let iDeltaX: ref<number[]> = new ref();
            let iDeltaY: ref<number[]> = new ref();
            let bPointsRight: int = 0;

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pointsCorner);
            lineutility.InitializePOINT2Array(rectpts);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);

            DISMSupport.DrawOpenRectangleDouble(savepoints, pointsCorner, rectpts);
            for (j = 0; j < 4; j++) {
                points[counter] = rectpts[j];
                counter++;
            }

            bPointsRight = DISMSupport.DetermineDirectionDouble(savepoints);

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX, iDeltaY, DISMSupport.CONST_PI / 4);

            if ((savepoints[0].y - savepoints[1].y) < 0) {// Point0 is higher than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                }
            } else {// Point0 is lower than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                }
            }

            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints1[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints2[j]);
                counter++;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMBypassDouble",
                    new RendererException("Failed inside GetDISMBypassDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for BREACH.
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMBreachDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            let rectpts: POINT2[] = new Array<POINT2>(4);
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let iDeltaX: ref<number[]> = new ref();
            let iDeltaY: ref<number[]> = new ref();
            let bPointsRight: int = 0;
            let j: int = 0;
            let savepoints: POINT2[] = new Array<POINT2>(3);

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pointsCorner);
            lineutility.InitializePOINT2Array(rectpts);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);

            DISMSupport.DrawOpenRectangleDouble(savepoints, pointsCorner, rectpts);
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(rectpts[j]);
                counter++;
            }

            bPointsRight = DISMSupport.DetermineDirectionDouble(savepoints);

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX, iDeltaY, DISMSupport.CONST_PI / 4);

            if ((savepoints[0].y - savepoints[1].y) < 0) {// Point0 is higher than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints2);
                }
            } else {// Point0 is lower than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints2);
                }
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints1[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints2[j]);
                counter++;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMBreachDouble",
                    new RendererException("Failed inside GetDISMBreachDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for CANALIZE
     *
     * @param points - OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMCanalizeDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            let rectpts: POINT2[] = new Array<POINT2>(4);
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let j: int = 0;
            let iDeltaX: ref<number[]> = new ref();
            let iDeltaY: ref<number[]> = new ref();
            let bPointsRight: int = 0;
            let savepoints: POINT2[] = new Array<POINT2>(3);

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pointsCorner);
            lineutility.InitializePOINT2Array(rectpts);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);

            DISMSupport.DrawOpenRectangleDouble(savepoints, pointsCorner, rectpts);

            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(rectpts[j]);
                counter++;
            }

            bPointsRight = DISMSupport.DetermineDirectionDouble(savepoints);

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX, iDeltaY, DISMSupport.CONST_PI / 4);

            if ((savepoints[0].y - savepoints[1].y) < 0) {// Point0 is higher than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints2);
                }
            } else {// Point0 is lower than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], -iDeltaY.value[0], iDeltaX.value[0], deltapoints2);
                }
            }

            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints1[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints2[j]);
                counter++;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMCanalizeDouble",
                    new RendererException("Failed inside GetDISMCanalizeDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    /**
     * Gets shape for Feint, decoy, or dummy indicator. Does not check if tactical graphic should have indicator
     * @param tg used to get line color and stroke
     * @param ptA bottom left point of triangle
     * @param ptC bottom right point of triangle
     * @return Dummy indicator shape
     */
    public static getFDIShape(tg: TGLight, ptA: POINT2, ptC: POINT2): Shape2;

    /**
     * Gets shape for Feint, decoy, or dummy indicator for symbols with arrowhead. Does not check if tactical graphic should have indicator
     * Extends each point outside arrow as necessary
     * @param tg used to get line color and stroke
     * @param ptA bottom left point of arrow
     * @param ptB arrow point
     * @param ptC bottom right point of arrow
     * @return Dummy indicator shape
     */
    public static getFDIShape(tg: TGLight, ptA: POINT2, ptB: POINT2, ptC: POINT2): Shape2;
    public static getFDIShape(...args: unknown[]): Shape2 | null {
        switch (args.length) {
            case 3: {
                const [tg, ptA, ptC] = args as [TGLight, POINT2, POINT2];


                try {
                    let midPt: POINT2 = lineutility.MidPointDouble(ptA, ptC, 0);
                    let len: double = lineutility.CalcDistanceDouble(ptA, midPt);
                    let ptB: POINT2 = lineutility.ExtendDirectedLine(ptA, ptC, midPt, lineutility.extend_above, len);
                    let shape: Shape2 = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(ptA);
                    shape.lineTo(ptB);
                    shape.lineTo(ptC);
                    shape.set_Style(1);
                    shape.setLineColor(tg.get_LineColor());

                    let stroke: BasicStroke = clsUtility.getLineStroke(tg.get_LineThickness(), shape.get_Style(), BasicStroke.CAP_SQUARE, BasicStroke.JOIN_MITER);
                    shape.setStroke(stroke);
                    return shape;
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(DISMSupport._className, "getFDIShape",
                            new RendererException("Failed inside getFDIShape", exc));
                    } else {
                        throw exc;
                    }
                }
                return null;


                break;
            }

            case 4: {
                let [tg, ptA, ptB, ptC] = args as [TGLight, POINT2, POINT2, POINT2];


                try {
                    // Extend ptA and ptC .25w
                    let w: double = lineutility.CalcDistanceDouble(ptA, ptC);
                    ptC = lineutility.ExtendLineDouble(ptA, ptC, w * .25);
                    ptA = lineutility.ExtendLineDouble(ptC, ptA, w * .25);

                    // Extend ptB .5w
                    let midPt: POINT2 = lineutility.MidPointDouble(ptA, ptC, 0);
                    w = lineutility.CalcDistanceDouble(midPt, ptB);
                    ptB = lineutility.ExtendLineDouble(midPt, ptB, w * .5);

                    let shape: Shape2 = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(ptA);
                    shape.lineTo(ptB);
                    shape.lineTo(ptC);
                    shape.set_Style(1);
                    shape.setLineColor(tg.get_LineColor());

                    let stroke: BasicStroke = clsUtility.getLineStroke(tg.get_LineThickness(), shape.get_Style(), BasicStroke.CAP_SQUARE, BasicStroke.JOIN_MITER);
                    shape.setStroke(stroke);
                    return shape;
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(DISMSupport._className, "getFDIShape",
                            new RendererException("Failed inside getFDIShape", exc));
                    } else {
                        throw exc;
                    }
                }
                return null;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Calculates the points for DISRUPT
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMDisruptDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(2);
            let ptsArrow: POINT2[] = new Array<POINT2>(3);
            let ptCenter: POINT2 = new POINT2();
            let j: int = 0;
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let dAngle1: double = 0;
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let deltapoints3: POINT2[] = new Array<POINT2>(4);
            let iDiagEOL_length: double = 0;
            let iDeltaX1: double = 0;
            let iDeltaY1: double = 0;
            let iDeltaX2: double = 0;
            let iDeltaY2: double = 0;

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(ptsArrow);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);
            lineutility.InitializePOINT2Array(deltapoints3);

            //	DrawLine(destination, mask, color, points, 2, 2);
            points[counter] = new POINT2(savepoints[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 5;
            counter++;
            //	pts[0] = points[1];
            //	pts[1] = points[2];
            //	DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(savepoints[2]);
            points[counter].style = 5;
            counter++;

            ptCenter.x = (savepoints[0].x + savepoints[1].x) / 2;
            ptCenter.y = (savepoints[0].y + savepoints[1].y) / 2;
            ptsArrow[0] = new POINT2(savepoints[2]);
            ptsArrow[1].x = ptCenter.x + (savepoints[2].x - savepoints[1].x) * 4 / 5;
            ptsArrow[1].y = ptCenter.y + (savepoints[2].y - savepoints[1].y) * 4 / 5;
            ptsArrow[2].x = savepoints[0].x + (savepoints[2].x - savepoints[1].x) * 3 / 5;
            ptsArrow[2].y = savepoints[0].y + (savepoints[2].y - savepoints[1].y) * 3 / 5;

            pts[0].x = ptCenter.x - (savepoints[2].x - savepoints[1].x) / 5;
            pts[0].y = ptCenter.y - (savepoints[2].y - savepoints[1].y) / 5;
            pts[1] = new POINT2(ptsArrow[1]);
            //	DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0] = new POINT2(savepoints[0]);
            pts[1] = new POINT2(ptsArrow[2]);
            //	DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // the following code is very similar to CalcEndpieceDeltas
            iDiagEOL_length = ((Math.sqrt // height of graphic
                (
                    (savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                    (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y)) +
                Math.sqrt // length of graphic
                    (
                        (savepoints[2].x - savepoints[1].x) * (savepoints[2].x - savepoints[1].x) +
                        (savepoints[2].y - savepoints[1].y) * (savepoints[2].y - savepoints[1].y))) / 15);

            //M. Deutch 8-18-04
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {//was minLength
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;   //was minLength
            }

            // dAngle1 = angle used to calculate the end-piece deltas
            dAngle1 = Math.atan2(savepoints[1].y - savepoints[2].y, savepoints[1].x - savepoints[2].x);
            //	dAngle1 = atan2(savepoints[1].y - savepoints[2].y, savepoints[1].x - savepoints[2].x);
            iDeltaX1 = (iDiagEOL_length * Math.cos(dAngle1 - DISMSupport.CONST_PI / 6));
            iDeltaY1 = (iDiagEOL_length * Math.sin(dAngle1 - DISMSupport.CONST_PI / 6));
            iDeltaX2 = (iDiagEOL_length * Math.cos(dAngle1 + DISMSupport.CONST_PI / 6));
            iDeltaY2 = (iDiagEOL_length * Math.sin(dAngle1 + DISMSupport.CONST_PI / 6));

            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[0],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints1);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[1],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints2);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[2],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints3);
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints1[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints2[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints3[j]);
                counter++;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMDisruptDouble",
                    new RendererException("Failed inside GetDISMDisruptDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for CONTAIN
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMContainDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(3);
            let ptCenter: POINT2 = new POINT2();
            let ptPerp: POINT2 = new POINT2(); // point used to draw perpendicular line
            let iPerpLength: double = 0;
            let j: int = 0;
            let dAngle1: double = 0;
            let d: double = 0;
            let dCosAngle1: double = 0;
            let dSinAngle1: double = 0;
            let iRadius: double = 0;
            let iDiagEOL_length: double = 0;
            let dAngle2: double = 0;
            let dDeltaX1: double = 0;
            let dDeltaY1: double = 0;
            let dDeltaX2: double = 0;
            let dDeltaY2: double = 0;
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let arcpoints: POINT2[] = new Array<POINT2>(17);

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(arcpoints);

            ptCenter.x = (savepoints[0].x + savepoints[1].x) / 2;
            ptCenter.y = (savepoints[0].y + savepoints[1].y) / 2;

            //added section M. Deutch   8-10-06
            //reverse points 0 and 1 if necessary to ensure arc
            //has correct orientation
            let m: ref<number[]> = new ref();
            let ptRelative: POINT2 = lineutility.PointRelativeToLine(savepoints[0], savepoints[1], savepoints[2]);

            lineutility.CalcTrueSlopeDouble2(savepoints[0], savepoints[1], m);
            if (m.value[0] !== 0) {
                if (savepoints[0].y > savepoints[1].y) {
                    if (ptRelative.x > ptCenter.x) {
                        lineutility.Reverse2Points(savepoints[0], savepoints[1]);
                    }
                }
                if (savepoints[0].y < savepoints[1].y) {
                    if (ptRelative.x < ptCenter.x) {
                        lineutility.Reverse2Points(savepoints[0], savepoints[1]);
                    }
                }
            } else {
                if (savepoints[0].x < savepoints[1].x) {
                    if (ptRelative.y > ptCenter.y) {
                        lineutility.Reverse2Points(savepoints[0], savepoints[1]);
                    }
                }
                if (savepoints[0].x > savepoints[1].x) {
                    if (ptRelative.y < ptCenter.y) {
                        lineutility.Reverse2Points(savepoints[0], savepoints[1]);
                    }
                }
            }
            //end section

            iPerpLength = Math.sqrt((ptCenter.x - savepoints[2].x) * (ptCenter.x - savepoints[2].x) + (ptCenter.y - savepoints[2].y) * (ptCenter.y - savepoints[2].y));
            if (iPerpLength < 1) {
                iPerpLength = 1;
            }

            dAngle1 = Math.atan2(savepoints[0].y - savepoints[1].y, savepoints[0].x - savepoints[1].x);
            dCosAngle1 = Math.cos(dAngle1 + DISMSupport.CONST_PI / 2);
            dSinAngle1 = Math.sin(dAngle1 + DISMSupport.CONST_PI / 2);

            ptPerp.x = ptCenter.x + dCosAngle1 * iPerpLength;
            ptPerp.y = ptCenter.y + dSinAngle1 * iPerpLength;

            pts[0] = new POINT2(ptCenter);

            pts[1] = new POINT2(savepoints[2]);

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 14;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw arrowhead
            iRadius = Math.sqrt((ptCenter.x - savepoints[0].x) * (ptCenter.x - savepoints[0].x) + (ptCenter.y - savepoints[0].y) * (ptCenter.y - savepoints[0].y));
            iDiagEOL_length = (iPerpLength + iRadius) / 20;

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle2 = Math.atan2(ptPerp.y - ptCenter.y, ptPerp.x - ptCenter.x);
            dDeltaX1 = Math.cos(dAngle2 + DISMSupport.CONST_PI / 4);
            dDeltaY1 = Math.sin(dAngle2 + DISMSupport.CONST_PI / 4);
            dDeltaX2 = Math.cos(dAngle2 - DISMSupport.CONST_PI / 4);
            dDeltaY2 = Math.sin(dAngle2 - DISMSupport.CONST_PI / 4);
            pts[0].x = ptCenter.x + dDeltaX1 * iDiagEOL_length;
            pts[0].y = ptCenter.y + dDeltaY1 * iDiagEOL_length;
            pts[1] = new POINT2(ptCenter);
            pts[2].x = ptCenter.x + dDeltaX2 * iDiagEOL_length;
            pts[2].y = ptCenter.y + dDeltaY2 * iDiagEOL_length;
            //end section
            for (j = 0; j < 3; j++) {
                points[counter] = new POINT2(pts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw arc
            DISMSupport.ArcApproximationDouble(ptCenter.x - iRadius, ptCenter.y - iRadius,
                ptCenter.x + iRadius, ptCenter.y + iRadius,
                savepoints[0].x, savepoints[0].y, savepoints[1].x, savepoints[1].y, arcpoints);

            for (j = 0; j < 17; j++) {
                points[counter] = new POINT2(arcpoints[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw spokes inside arc
            pts[0] = new POINT2(savepoints[0]);
            pts[1].x = (pts[0].x + ptCenter.x) / 2;
            pts[1].y = (pts[0].y + ptCenter.y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0] = new POINT2(savepoints[1]);
            pts[1].x = (pts[0].x + ptCenter.x) / 2;
            pts[1].y = (pts[0].y + ptCenter.y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }
            //	DrawLine(destination, mask, color, pts, 2, 2);

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = ptCenter.x - (ptPerp.x - ptCenter.x) * iRadius / iPerpLength;
            pts[0].y = ptCenter.y - (ptPerp.y - ptCenter.y) * iRadius / iPerpLength;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = ptCenter.x - dDeltaX1 * iRadius;
            pts[0].y = ptCenter.y - dDeltaY1 * iRadius;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = ptCenter.x - dDeltaX2 * iRadius;
            pts[0].y = ptCenter.y - dDeltaY2 * iRadius;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            dDeltaX1 = Math.cos(dAngle2 + DISMSupport.CONST_PI / 8);
            dDeltaY1 = Math.sin(dAngle2 + DISMSupport.CONST_PI / 8);
            dDeltaX2 = Math.cos(dAngle2 - DISMSupport.CONST_PI / 8);
            dDeltaY2 = Math.sin(dAngle2 - DISMSupport.CONST_PI / 8);
            pts[0].x = ptCenter.x - dDeltaX1 * iRadius;
            pts[0].y = ptCenter.y - dDeltaY1 * iRadius;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = ptCenter.x - dDeltaX2 * iRadius;
            pts[0].y = ptCenter.y - dDeltaY2 * iRadius;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            dDeltaX1 = Math.cos(dAngle2 + 3 * DISMSupport.CONST_PI / 8);
            dDeltaY1 = Math.sin(dAngle2 + 3 * DISMSupport.CONST_PI / 8);
            dDeltaX2 = Math.cos(dAngle2 - 3 * DISMSupport.CONST_PI / 8);
            dDeltaY2 = Math.sin(dAngle2 - 3 * DISMSupport.CONST_PI / 8);
            pts[0].x = ptCenter.x - dDeltaX1 * iRadius;
            pts[0].y = ptCenter.y - dDeltaY1 * iRadius;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = ptCenter.x - dDeltaX2 * iRadius;
            pts[0].y = ptCenter.y - dDeltaY2 * iRadius;
            pts[1].x = (ptCenter.x + pts[0].x) / 2;
            pts[1].y = (ptCenter.y + pts[0].y) / 2;
            d = lineutility.CalcDistanceDouble(pts[0], pts[1]);
            if (d > DISMSupport.maxLength * DPIScaleFactor) //shorten the spoke
            {
                pts[1] = lineutility.ExtendLineDouble(pts[1], pts[0], -DISMSupport.maxLength * DPIScaleFactor);
            }

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMContainDouble",
                    new RendererException("Failed inside GetDISMContainDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for FIX, MNFLDFIX
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMFixDouble(points: POINT2[], linetype: int, clipBounds: Rectangle2D | null): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(3);
            let savepoints: POINT2[] | null = new Array<POINT2>(2);
            let dAngle1: double = 0;
            let dLength: double = 0;
            let dJaggyHalfAmp: double = 0;
            let dJaggyHalfPeriod: double = 0;
            let dDeltaXOut: double = 0;
            let dDeltaYOut: double = 0;
            let dDeltaXAlong: double = 0;
            let dDeltaYAlong: double = 0;
            let iNumJaggies: int = 0;
            let i: int = 0;
            let j: int = 0;

            for (j = 0; j < 2; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            let drawJaggies: boolean = true;
            if (clipBounds != null) {
                let ul: POINT2 = new POINT2(clipBounds.getMinX(), clipBounds.getMinY());
                let lr: POINT2 = new POINT2(clipBounds.getMaxX(), clipBounds.getMaxY());
                savepoints = lineutility.BoundOneSegment(savepoints[0], savepoints[1], ul, lr);
            }
            if (savepoints == null) {
                savepoints = new Array<POINT2>(2);
                for (j = 0; j < 2; j++) {
                    savepoints[j] = new POINT2(points[j]);
                }
                drawJaggies = false;
            }

            lineutility.InitializePOINT2Array(pts);
            //reverse the points

            dAngle1 = Math.atan2(savepoints[0].y - savepoints[1].y, savepoints[0].x - savepoints[1].x);
            dLength = Math.sqrt((savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y));
            //arraysupport tries to set jaggylength before the points get bounded
            dJaggyHalfAmp = dLength / 15; // half the amplitude of the "jaggy function"

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dJaggyHalfAmp > DISMSupport.maxLength * DPIScaleFactor) {
                dJaggyHalfAmp = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (dJaggyHalfAmp < DISMSupport.minLength * DPIScaleFactor) {
                dJaggyHalfAmp = DISMSupport.minLength * DPIScaleFactor;
            }

            dJaggyHalfPeriod = dJaggyHalfAmp / 1.5; // half the period of the "jaggy function"
            dDeltaXOut = Math.cos(dAngle1 + DISMSupport.CONST_PI / 2) * dJaggyHalfAmp; // X-delta out from the center line
            dDeltaYOut = Math.sin(dAngle1 + DISMSupport.CONST_PI / 2) * dJaggyHalfAmp; // Y-delta out from the center line
            dDeltaXAlong = Math.cos(dAngle1) * dJaggyHalfPeriod; // X-delta along the center line
            dDeltaYAlong = Math.sin(dAngle1) * dJaggyHalfPeriod; // Y-delta along the center line
            iNumJaggies = Math.trunc(dLength / dJaggyHalfPeriod) - 3;
            i = 2;
            pts[0] = new POINT2(savepoints[1]);
            pts[1].x = savepoints[1].x + dDeltaXAlong * 1.5;
            pts[1].y = savepoints[1].y + dDeltaYAlong * 1.5;
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = savepoints[1].x + dDeltaXOut + dDeltaXAlong * i;
            pts[0].y = savepoints[1].y + dDeltaYOut + dDeltaYAlong * i;
            i++;
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            if (drawJaggies) {

                while (i <= iNumJaggies) {
                    pts[1].x = savepoints[1].x - dDeltaXOut + dDeltaXAlong * i;
                    pts[1].y = savepoints[1].y - dDeltaYOut + dDeltaYAlong * i;
                    i++;
                    pts[2].x = savepoints[1].x + dDeltaXOut + dDeltaXAlong * i;
                    pts[2].y = savepoints[1].y + dDeltaYOut + dDeltaYAlong * i;
                    i++;
                    for (j = 0; j < 3; j++) {
                        points[counter] = new POINT2(pts[j]);
                        points[counter].style = 0;
                        counter++;
                    }
                    points[counter - 1].style = 5;
                    pts[0] = new POINT2(pts[2]);
                }
            }


            pts[1] = new POINT2(pts[0]);
            pts[0].x = savepoints[1].x + dDeltaXAlong * i;
            pts[0].y = savepoints[1].y + dDeltaYAlong * i;
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[1] = new POINT2(savepoints[0]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw arrowhead
            pts[0].x = savepoints[0].x + dDeltaXOut / 1.5 - dDeltaXAlong;
            pts[0].y = savepoints[0].y + dDeltaYOut / 1.5 - dDeltaYAlong;
            pts[2].x = savepoints[0].x - dDeltaXOut / 1.5 - dDeltaXAlong;
            pts[2].y = savepoints[0].y - dDeltaYOut / 1.5 - dDeltaYAlong;
            for (j = 0; j < 3; j++) {
                points[counter] = new POINT2(pts[j]);
                if (linetype === TacticalLines.MNFLDFIX) {
                    points[counter].style = 9;
                } else {
                    points[counter].style = 0;
                }
                counter++;
            }
            if (linetype === TacticalLines.MNFLDFIX) {
                points[counter - 1].style = 10;
            } else {
                points[counter - 1].style = 5;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMFixDouble",
                    new RendererException("Failed inside GetDISMFixDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for CLEAR.
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMClearDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let j: int = 0;
            let pts: POINT2[] = new Array<POINT2>(2);
            let ptsArrow: POINT2[] = new Array<POINT2>(3);
            let ctrX: double = ((points[0].x + points[1].x) / 2);
            let ctrY: double = ((points[0].y + points[1].y) / 2);
            let iDeltaX1: ref<number[]> = new ref();
            let iDeltaY1: ref<number[]> = new ref();
            let iDeltaX2: ref<number[]> = new ref();
            let iDeltaY2: ref<number[]> = new ref();
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let deltapoints3: POINT2[] = new Array<POINT2>(4);

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(ptsArrow);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);
            lineutility.InitializePOINT2Array(deltapoints3);

            //DrawLine(destination, mask, color, points, 2, 2);
            points[counter] = new POINT2(savepoints[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = ctrX;
            pts[0].y = ctrY;
            pts[1] = new POINT2(savepoints[2]);
            ptsArrow[0] = new POINT2(pts[0]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = (savepoints[0].x + ctrX) / 2;
            pts[0].y = (savepoints[0].y + ctrY) / 2;
            pts[1].x = savepoints[2].x + savepoints[0].x - pts[0].x;
            pts[1].y = savepoints[2].y + savepoints[0].y - pts[0].y;
            ptsArrow[1] = new POINT2(pts[0]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = (savepoints[1].x + ctrX) / 2;
            pts[0].y = (savepoints[1].y + ctrY) / 2;
            pts[1].x = savepoints[2].x + savepoints[1].x - pts[0].x;
            pts[1].y = savepoints[2].y + savepoints[1].y - pts[0].y;
            ptsArrow[2] = new POINT2(pts[0]);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX1, iDeltaY1, DISMSupport.CONST_PI / 6);
            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX2, iDeltaY2, -DISMSupport.CONST_PI / 6);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[0],
                iDeltaX1.value[0], iDeltaY1.value[0], iDeltaX2.value[0], iDeltaY2.value[0], deltapoints1);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[1],
                iDeltaX1.value[0], iDeltaY1.value[0], iDeltaX2.value[0], iDeltaY2.value[0], deltapoints2);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[2],
                iDeltaX1.value[0], iDeltaY1.value[0], iDeltaX2.value[0], iDeltaY2.value[0], deltapoints3);
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints1[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints2[j]);
                counter++;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints3[j]);
                counter++;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMClearDouble",
                    new RendererException("Failed inside GetDISMClearDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    private static IsSeizeArcReversed(pPoints: POINT2[]): boolean {
        try {
            let dAngle1: double = Math.atan2(pPoints[0].y - pPoints[1].y, pPoints[0].x - pPoints[1].x);
            let dDeltaX1: double = Math.cos(dAngle1 + DISMSupport.CONST_PI / 4);
            let dDeltaY1: double = Math.sin(dAngle1 + DISMSupport.CONST_PI / 4);
            let dDeltaX2: double = Math.cos(dAngle1 - DISMSupport.CONST_PI / 4);
            let dDeltaY2: double = Math.sin(dAngle1 - DISMSupport.CONST_PI / 4);

            let dChordLength: double = Math.sqrt((pPoints[1].x - pPoints[0].x) * (pPoints[1].x - pPoints[0].x) +
                (pPoints[1].y - pPoints[0].y) * (pPoints[1].y - pPoints[0].y));
            let dArcRadius: double = dChordLength / 1.414213562373; // sqrt(2) == 1.414213562373
            let ptArcCenter: POINT2 = new POINT2();

            //get the default center
            ptArcCenter.x = pPoints[0].x - dDeltaX1 * dArcRadius;
            ptArcCenter.y = pPoints[0].y - dDeltaY1 * dArcRadius;
            let d: double = lineutility.CalcDistanceDouble(ptArcCenter, pPoints[2]);

            //get the alternate center if the arc is reversed
            let ptArcCenterReversed: POINT2 = new POINT2();
            ptArcCenterReversed.x = pPoints[0].x - dDeltaX2 * dArcRadius;
            ptArcCenterReversed.y = pPoints[0].y - dDeltaY2 * dArcRadius;
            let dReversed: double = lineutility.CalcDistanceDouble(ptArcCenterReversed, pPoints[2]);

            if (dReversed > d) {
                return true;
            } else {
                return false;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "IsSeizeArcReversed",
                    new RendererException("Failed inside IsSeizeArcReversed", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }
    /**
     * Calculates the points for SEIZE
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMSeizeDouble(points: POINT2[],
        linetype: int,
        radius: double): int {
        let counter: int = 0;
        try {
            let ptArcCenter: POINT2 = new POINT2();
            let ptArcStart: POINT2 = new POINT2();
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let scale: double = 0.9;
            let iCircleRadius: double = (25 * scale);
            let arcpoints: POINT2[] = new Array<POINT2>(17);
            let pts: POINT2[] = new Array<POINT2>(3);
            let dAngle1: double = 0;
            let dDeltaX1: double = 0;
            let dDeltaY1: double = 0;
            let dDeltaX2: double = 0;
            let dDeltaY2: double = 0;
            let dChordLength: double = 0;
            let dArcRadius: double = 0;
            let j: int = 0;
            let dDeltaX3: double = 0;
            let dDeltaY3: double = 0;
            let iDiagEOL_length: double = 0;
            let factor: double = 1;

            if (radius > 0) {

                iCircleRadius = radius;
            }



            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            //if radius is 0 then it is rev B
            let client: string = CELineArray.getClient();
            if (!client.startsWith("cpof") && radius === 0) {
                dArcRadius = lineutility.CalcDistanceDouble(savepoints[0], savepoints[1]);
                if (iCircleRadius > dArcRadius / 2) {

                    iCircleRadius = dArcRadius / 2;
                }

            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(arcpoints);
            // draw circle
            DISMSupport.ArcApproximationDouble(savepoints[0].x - iCircleRadius, savepoints[0].y - iCircleRadius,
                savepoints[0].x + iCircleRadius, savepoints[0].y + iCircleRadius,
                savepoints[0].x, savepoints[0].y, savepoints[0].x, savepoints[0].y, arcpoints);
            for (j = 0; j < 17; j++) {
                points[counter] = new POINT2(arcpoints[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw arc
            dAngle1 = Math.atan2(savepoints[0].y - savepoints[1].y, savepoints[0].x - savepoints[1].x);
            dDeltaX1 = Math.cos(dAngle1 + DISMSupport.CONST_PI / 4);
            dDeltaY1 = Math.sin(dAngle1 + DISMSupport.CONST_PI / 4);
            dDeltaX2 = Math.cos(dAngle1 - DISMSupport.CONST_PI / 4);
            dDeltaY2 = Math.sin(dAngle1 - DISMSupport.CONST_PI / 4);

            let isArcReversed: boolean = DISMSupport.IsSeizeArcReversed(savepoints);

            if (isArcReversed === false) {
                ptArcStart.x = savepoints[0].x - dDeltaX2 * iCircleRadius;
                ptArcStart.y = savepoints[0].y - dDeltaY2 * iCircleRadius;
                dChordLength = Math.sqrt((savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                    (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y));
                dArcRadius = dChordLength / 1.414213562373; // sqrt(2) == 1.414213562373
                ptArcCenter.x = savepoints[0].x - dDeltaX1 * dArcRadius;
                ptArcCenter.y = savepoints[0].y - dDeltaY1 * dArcRadius;

                DISMSupport.ArcApproximationDouble((ptArcCenter.x - dArcRadius), (ptArcCenter.y - dArcRadius),
                    (ptArcCenter.x + dArcRadius), (ptArcCenter.y + dArcRadius),
                    savepoints[1].x, savepoints[1].y, ptArcStart.x, ptArcStart.y, arcpoints);
            } else //arc is reversed
            {
                ptArcStart.x = savepoints[0].x - dDeltaX1 * iCircleRadius;
                ptArcStart.y = savepoints[0].y - dDeltaY1 * iCircleRadius;
                dChordLength = Math.sqrt((savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                    (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y));
                dArcRadius = dChordLength / 1.414213562373; // sqrt(2) == 1.414213562373
                ptArcCenter.x = savepoints[0].x - dDeltaX2 * dArcRadius;
                ptArcCenter.y = savepoints[0].y - dDeltaY2 * dArcRadius;
                DISMSupport.ArcApproximationDouble((ptArcCenter.x - dArcRadius), (ptArcCenter.y - dArcRadius),
                    (ptArcCenter.x + dArcRadius), (ptArcCenter.y + dArcRadius),
                    ptArcStart.x, ptArcStart.y, savepoints[1].x, savepoints[1].y, arcpoints);
            }

            for (j = 0; j < 17; j++) {
                points[counter] = new POINT2(arcpoints[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw arrow
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dChordLength / 8 > DISMSupport.maxLength * DPIScaleFactor) {
                factor = dChordLength / (8 * DISMSupport.maxLength * DPIScaleFactor);
            }
            if (factor === 0) {
                factor = 1;
            }


            if (isArcReversed === false) {
                pts[0].x = savepoints[1].x - (savepoints[1].x - savepoints[0].x) / (8 * factor);
                pts[0].y = savepoints[1].y - (savepoints[1].y - savepoints[0].y) / (8 * factor);
                pts[1] = new POINT2(savepoints[1]);
                dDeltaX3 = Math.cos(dAngle1 + DISMSupport.CONST_PI / 2);
                dDeltaY3 = Math.sin(dAngle1 + DISMSupport.CONST_PI / 2);
                iDiagEOL_length = (dChordLength / 8);
                pts[2].x = savepoints[1].x + dDeltaX3 * iDiagEOL_length / factor;
                pts[2].y = savepoints[1].y + dDeltaY3 * iDiagEOL_length / factor;
            } //DrawLine(destination, mask, color, pts, 3, 2);
            //diagnostic arc reversed
            else {
                pts[0].x = savepoints[1].x - (savepoints[1].x - savepoints[0].x) / (8 * factor);
                pts[0].y = savepoints[1].y - (savepoints[1].y - savepoints[0].y) / (8 * factor);
                pts[1] = new POINT2(savepoints[1]);
                dDeltaX3 = Math.cos(dAngle1 - DISMSupport.CONST_PI / 2);
                dDeltaY3 = Math.sin(dAngle1 - DISMSupport.CONST_PI / 2);
                iDiagEOL_length = (dChordLength / 8);
                pts[2].x = savepoints[1].x + dDeltaX3 * iDiagEOL_length / factor;
                pts[2].y = savepoints[1].y + dDeltaY3 * iDiagEOL_length / factor;
            }
            //end diagnostic


            //diagnostic
            //end diagnostic

            for (j = 0; j < 3; j++) {
                points[counter] = new POINT2(pts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMSeizeDouble",
                    new RendererException("Failed inside GetDISMSeizeDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Used twice for RIP to determine if the points are clockwise.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param px
     * @param py
     * @return RIGHT_SIDE if 3 points are clockwise
     */
    private static side(x1: double, y1: double, x2: double, y2: double, px: double, py: double): int {
        let dx1: double = 0;
        let dx2: double = 0;
        let dy1: double = 0;
        let dy2: double = 0;
        try {
            let o: double = 0;

            dx1 = x2 - x1;
            dy1 = y2 - y1;
            dx2 = px - x1;
            dy2 = py - y1;
            o = (dx1 * dy2) - (dy1 * dx2);
            if (o > 0.0) {
                return (DISMSupport.LEFT_SIDE);
            }
            if (o < 0.0) {
                return (DISMSupport.RIGHT_SIDE);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "side",
                    new RendererException("Failed inside side", exc));
            } else {
                throw exc;
            }
        }
        return (DISMSupport.COLINEAR);
    }

    /**
     * Calculates the points for RIP
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type
     */
    static GetDISMRIPDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            // draw the straight lines
            let pts: POINT2[] = new Array<POINT2>(2);
            let savepoints: POINT2[] = new Array<POINT2>(4);
            let j: int = 0;
            let iLengthPt0Pt1: double = 0;
            let iDiagEOL_length: double = 0;
            let dAngle1: double = 0;
            let iDeltaX1: double = 0;
            let iDeltaY1: double = 0;
            let iDeltaX2: double = 0;
            let iDeltaY2: double = 0;
            let iLengthPt2Pt3: double = 0;
            let iRadius: double = 0;
            let deltapoints: POINT2[] = new Array<POINT2>(4);
            let arcpoints: POINT2[] = new Array<POINT2>(17);
            let ptArcCenter: POINT2 = new POINT2();

            let clockwise: boolean = false;
            let side01: int = DISMSupport.side(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
            let side12: int = DISMSupport.side(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
            if (side01 === DISMSupport.RIGHT_SIDE && side12 === DISMSupport.RIGHT_SIDE) {

                clockwise = true;
            }

            else {
                if (side01 === DISMSupport.RIGHT_SIDE && side12 === DISMSupport.COLINEAR) {

                    clockwise = true;
                }

                else {
                    if (side01 === DISMSupport.COLINEAR && side12 === DISMSupport.RIGHT_SIDE) {

                        clockwise = true;
                    }

                }

            }


            for (j = 0; j < 4; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(deltapoints);
            lineutility.InitializePOINT2Array(arcpoints);

            points[counter] = new POINT2(savepoints[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 5;
            counter++;

            pts[0] = new POINT2(savepoints[2]);
            pts[1] = new POINT2(savepoints[3]);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw the arrowhead on line between savepoints 0 and 1
            pts[0] = new POINT2(savepoints[0]);
            pts[1] = new POINT2(savepoints[1]);
            iLengthPt0Pt1 = Math.sqrt((pts[1].x - pts[0].x) * (pts[1].x - pts[0].x) +
                (pts[1].y - pts[0].y) * (pts[1].y - pts[0].y));
            iDiagEOL_length = iLengthPt0Pt1 / 8;

            //M. Deutch 8-19-04
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle1 = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
            iDeltaX1 = (iDiagEOL_length * Math.cos(dAngle1 - DISMSupport.CONST_PI / 4));
            iDeltaY1 = (iDiagEOL_length * Math.sin(dAngle1 - DISMSupport.CONST_PI / 4));
            iDeltaX2 = (iDiagEOL_length * Math.cos(dAngle1 + DISMSupport.CONST_PI / 4));
            iDeltaY2 = (iDiagEOL_length * Math.sin(dAngle1 + DISMSupport.CONST_PI / 4));
            DISMSupport.DrawEndpieceDeltasDouble(pts[0],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints);
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 3].style = 5;
            points[counter - 1].style = 5;
            // draw the arrowhead on line between savepoints 2 and 3
            pts[0] = new POINT2(savepoints[2]);
            pts[1] = new POINT2(savepoints[3]);
            iLengthPt2Pt3 = Math.sqrt((pts[1].x - pts[0].x) * (pts[1].x - pts[0].x) +
                (pts[1].y - pts[0].y) * (pts[1].y - pts[0].y));
            iDiagEOL_length = iLengthPt2Pt3 / 8;

            //M. Deutch 8-19-04
            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle1 = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
            iDeltaX1 = (iDiagEOL_length * Math.cos(dAngle1 - DISMSupport.CONST_PI / 4));
            iDeltaY1 = (iDiagEOL_length * Math.sin(dAngle1 - DISMSupport.CONST_PI / 4));
            iDeltaX2 = (iDiagEOL_length * Math.cos(dAngle1 + DISMSupport.CONST_PI / 4));
            iDeltaY2 = (iDiagEOL_length * Math.sin(dAngle1 + DISMSupport.CONST_PI / 4));
            DISMSupport.DrawEndpieceDeltasDouble(pts[0],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints);
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(deltapoints[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 3].style = 5;
            points[counter - 1].style = 5;

            // draw the semicircle
            iRadius = (Math.sqrt((savepoints[2].x - savepoints[1].x) * (savepoints[2].x - savepoints[1].x) +
                (savepoints[2].y - savepoints[1].y) * (savepoints[2].y - savepoints[1].y)) / 2);
            ptArcCenter.x = (savepoints[1].x + savepoints[2].x) / 2;
            ptArcCenter.y = (savepoints[1].y + savepoints[2].y) / 2;

            if (clockwise === false) {
                DISMSupport.ArcApproximationDouble((ptArcCenter.x - iRadius), (ptArcCenter.y - iRadius),
                    (ptArcCenter.x + iRadius), (ptArcCenter.y + iRadius),
                    savepoints[2].x, savepoints[2].y, savepoints[1].x, savepoints[1].y, arcpoints);
            }
            else {
                DISMSupport.ArcApproximationDouble((ptArcCenter.x - iRadius), (ptArcCenter.y - iRadius),
                    (ptArcCenter.x + iRadius), (ptArcCenter.y + iRadius),
                    savepoints[1].x, savepoints[1].y, savepoints[2].x, savepoints[2].y, arcpoints);
            }
            for (j = 0; j < 17; j++) {
                points[counter] = new POINT2(arcpoints[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMRIPDouble",
                    new RendererException("Failed inside GetDISMRIPDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for BYDIF
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMByDifDouble(points: POINT2[],
        linetype: int,
        clipBounds: Rectangle2D | null): int {
        let counter: int = 0;
        try {
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            let rectpts: POINT2[] = new Array<POINT2>(4);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let savepoints2: POINT2[] | null = new Array<POINT2>(2);
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let pts: POINT2[] = new Array<POINT2>(3);
            //POINT2 pt0 = new POINT2();
            //POINT2 pt1 = new POINT2();
            let iDeltaX: ref<number[]> = new ref();
            let iDeltaY: ref<number[]> = new ref();
            let bPointsRight: int = 0;
            let dAngle1: double = 0;
            let dLength: double = 0;
            let dJaggyHalfAmp: double = 0;
            let dJaggyHalfPeriod: double = 0;
            let dDeltaXOut: double = 0;
            let dDeltaYOut: double = 0;
            let dDeltaXAlong: double = 0;
            let dDeltaYAlong: double = 0;
            let iNumJaggies: int = 0;
            let i: int = 0;
            let j: int = 0;
            //int pointcounter = 0;
            //int[] segments = null;
            //end declarations
            //lineutility.WriteFile("made it this far");
            //ok to here

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pointsCorner);
            lineutility.InitializePOINT2Array(rectpts);
            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);

            DISMSupport.DrawOpenRectangleDouble(savepoints, pointsCorner, rectpts);
            //save the back side for use by the jagged line
            savepoints2[0] = new POINT2(rectpts[1]);
            savepoints2[1] = new POINT2(rectpts[2]);

            //diagnostic these hard coded because JavalineArray does not know the bounds
            if (clipBounds != null) {
                let ul: POINT2 = new POINT2(clipBounds.getMinX(), clipBounds.getMinY());
                let lr: POINT2 = new POINT2(clipBounds.getMaxX(), clipBounds.getMaxY());
                savepoints2 = lineutility.BoundOneSegment(savepoints2[0], savepoints2[1], ul, lr);
            }
            let drawJaggies: boolean = true;
            if (savepoints2 == null) {
                savepoints2 = new Array<POINT2>(2);
                savepoints2[0] = new POINT2(rectpts[1]);
                savepoints2[1] = new POINT2(rectpts[2]);
                drawJaggies = false;
            }
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(rectpts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[1].style = 5;
            points[counter - 1].style = 5;

            dAngle1 = Math.atan2(savepoints2[0].y - savepoints2[1].y, savepoints2[0].x - savepoints2[1].x);
            dLength = Math.sqrt((savepoints2[1].x - savepoints2[0].x) * (savepoints2[1].x - savepoints2[0].x) +
                (savepoints2[1].y - savepoints2[0].y) * (savepoints2[1].y - savepoints2[0].y));
            dJaggyHalfAmp = dLength / 15; // half the amplitude of the "jaggy function"

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dJaggyHalfAmp > DISMSupport.maxLength * DPIScaleFactor) {
                dJaggyHalfAmp = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (dJaggyHalfAmp < DISMSupport.minLength * DPIScaleFactor) {
                dJaggyHalfAmp = DISMSupport.minLength * DPIScaleFactor;
            }

            dJaggyHalfPeriod = dJaggyHalfAmp / 1.5; // half the period of the "jaggy function"
            dDeltaXOut = Math.cos(dAngle1 + DISMSupport.CONST_PI / 2) * dJaggyHalfAmp; // X-delta out from the center line
            dDeltaYOut = Math.sin(dAngle1 + DISMSupport.CONST_PI / 2) * dJaggyHalfAmp; // Y-delta out from the center line
            dDeltaXAlong = Math.cos(dAngle1) * dJaggyHalfPeriod; // X-delta along the center line
            dDeltaYAlong = Math.sin(dAngle1) * dJaggyHalfPeriod; // Y-delta along the center line

            iNumJaggies = Math.trunc(dLength / dJaggyHalfPeriod) - 3;
            i = 2;
            pts[0] = new POINT2(savepoints2[1]);
            pts[1].x = savepoints2[1].x + dDeltaXAlong * 1.5;
            pts[1].y = savepoints2[1].y + dDeltaYAlong * 1.5;
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = savepoints2[1].x + dDeltaXOut + dDeltaXAlong * i;
            pts[0].y = savepoints2[1].y + dDeltaYOut + dDeltaYAlong * i;
            i++;
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            if (drawJaggies) {
                //diagnostic
                while (i <= iNumJaggies) {
                    pts[1].x = savepoints2[1].x - dDeltaXOut + dDeltaXAlong * i;
                    pts[1].y = savepoints2[1].y - dDeltaYOut + dDeltaYAlong * i;
                    i++;
                    pts[2].x = savepoints2[1].x + dDeltaXOut + dDeltaXAlong * i;
                    pts[2].y = savepoints2[1].y + dDeltaYOut + dDeltaYAlong * i;
                    i++;
                    for (j = 0; j < 3; j++) {
                        points[counter] = new POINT2(pts[j]);
                        points[counter].style = 0;
                        counter++;
                    }
                    points[counter - 1].style = 5;
                    pts[0] = new POINT2(pts[2]);
                }
            }



            pts[1] = new POINT2(pts[0]);
            pts[0].x = savepoints2[1].x + dDeltaXAlong * i;
            pts[0].y = savepoints2[1].y + dDeltaYAlong * i;
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[1] = new POINT2(savepoints2[0]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            bPointsRight = DISMSupport.DetermineDirectionDouble(savepoints);

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX, iDeltaY, DISMSupport.CONST_PI / 4);

            if ((savepoints[0].y - savepoints[1].y) < 0) {// Point0 is higher than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                }
            } else {// Point0 is lower than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                }
            }
            points[counter] = new POINT2(deltapoints1[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 10;
            counter++;

            points[counter] = new POINT2(deltapoints2[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 10;
            counter++;

        } catch (exc) {
            if (exc instanceof Error) {
                //lineutility.WriteFile(exc.message);
                ErrorLogger.LogException(DISMSupport._className, "GetDISMByDifDouble",
                    new RendererException("Failed inside GetDISMByDifDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for PENETRATE
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMPenetrateDouble(points: POINT2[], linetype: int): void {
        try {
            let arrowpts: POINT2[] = new Array<POINT2>(3);
            let midpt: POINT2 = new POINT2();
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let j: int = 0;
            let d: double = 0;

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }
            lineutility.InitializePOINT2Array(arrowpts);

            points[0].x = savepoints[0].x;
            points[0].y = savepoints[0].y;
            points[0].style = 0;
            points[1].x = savepoints[1].x;
            points[1].y = savepoints[1].y;
            points[1].style = 5;

            midpt = lineutility.MidPointDouble(savepoints[0], savepoints[1], 0);

            points[2] = new POINT2(savepoints[2]);

            points[3] = new POINT2(midpt);
            points[3].style = 5;
            d = lineutility.MBRDistance(savepoints, 3);

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (d / 5 > DISMSupport.maxLength * DPIScaleFactor) {
                d = 5 * DISMSupport.maxLength * DPIScaleFactor;
            }
            if (d / 5 < DISMSupport.minLength * DPIScaleFactor) {
                d = 5 * DISMSupport.minLength * DPIScaleFactor;
            }
            let client: string = CELineArray.getClient();
            if (client === "cpof3d" || client === "cpof2d") {
                if (d < 400 * DPIScaleFactor) {

                    d = 400 * DPIScaleFactor;
                }

            }
            else {
                if (d < 150 * DPIScaleFactor) {

                    d = 150 * DPIScaleFactor;
                }

            }
            if (d > 600 * DPIScaleFactor) {

                d = 600 * DPIScaleFactor;
            }


            lineutility.GetArrowHead4Double(points[2], points[3], Math.trunc(d / 20), Math.trunc(d / 20), arrowpts, 0);
            for (j = 0; j < 3; j++) {
                points[4 + j] = new POINT2(arrowpts[j]);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMPenetrateDouble",
                    new RendererException("Failed inside GetDISMPenetrateDouble", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Calculates the points for BYIMP
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMByImpDouble(points: POINT2[],
        linetype: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            let rectpts: POINT2[] = new Array<POINT2>(4);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let midpt: POINT2 = new POINT2();
            let pts: POINT2[] = new Array<POINT2>(6);
            let ptRelative: POINT2 = new POINT2();
            let iDeltaX: ref<number[]> = new ref();
            let iDeltaY: ref<number[]> = new ref();
            let bPointsRight: int = 0;
            let dMBR: double = lineutility.MBRDistance(points, 3);
            //end declarations

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dMBR > 40 * DISMSupport.maxLength * DPIScaleFactor) {
                dMBR = 40 * DISMSupport.maxLength * DPIScaleFactor;
            }
            if (dMBR < 5 * DISMSupport.minLength * DPIScaleFactor) {
                dMBR = 5 * DISMSupport.minLength * DPIScaleFactor;
            }
            if (dMBR > 250 * DPIScaleFactor) {

                dMBR = 250 * DPIScaleFactor;
            }

            if (dMBR / 15 > lineutility.CalcDistanceDouble(points[0], points[1])) {

                // Don't let gap be wider than channel
                dMBR = 15 * lineutility.CalcDistanceDouble(points[0], points[1]);
            }


            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(rectpts);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);
            lineutility.InitializePOINT2Array(pts);
            lineutility.InitializePOINT2Array(pointsCorner);

            DISMSupport.DrawOpenRectangleDouble(savepoints, pointsCorner, rectpts);

            points[counter] = new POINT2(rectpts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(rectpts[1]);
            points[counter].style = 0;
            counter++;
            midpt = lineutility.MidPointDouble(rectpts[1], rectpts[2], 0);
            pts[0] = lineutility.ExtendLine2Double(rectpts[1], midpt, -dMBR / 30, 5);
            pts[1] = lineutility.ExtendLine2Double(rectpts[1], midpt, dMBR / 30, 5);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 5;
            counter++;

            ptRelative = lineutility.PointRelativeToLine(rectpts[0], rectpts[1], pts[0]);
            pts[2] = lineutility.ExtendLineDouble(ptRelative, pts[0], -dMBR / 30);

            pts[3] = lineutility.ExtendLineDouble(ptRelative, pts[0], dMBR / 30);

            points[counter] = new POINT2(pts[2]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[3]);
            points[counter].style = 5;
            counter++;
            ptRelative = lineutility.PointRelativeToLine(rectpts[2], rectpts[3], pts[1]);
            pts[4] = lineutility.ExtendLineDouble(ptRelative, pts[1], -dMBR / 30);

            pts[5] = lineutility.ExtendLineDouble(ptRelative, pts[1], dMBR / 30);
            points[counter] = new POINT2(pts[4]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[5]);
            points[counter].style = 5;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(rectpts[2]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(rectpts[3]);
            points[counter].style = 5;
            counter++;

            bPointsRight = DISMSupport.DetermineDirectionDouble(savepoints);

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX, iDeltaY, DISMSupport.CONST_PI / 4);

            if ((savepoints[0].y - savepoints[1].y) < 0) {// Point0 is higher than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                }
            } else {// Point0 is lower than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                }
            }

            points[counter] = new POINT2(deltapoints1[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 10;
            counter++;

            points[counter] = new POINT2(deltapoints2[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 10;
            counter++;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMByImpDouble",
                    new RendererException("Failed inside GetDISMByImpDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for SPTBYFIRE
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMSupportByFireDouble(points: POINT2[],
        linetype: int): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(3);
            let savepoints: POINT2[] = new Array<POINT2>(4);
            let j: int = 0;
            let iDiagEOL_length: double = 0;
            let dAngle1: double = 0;
            let iDeltaX1: double = 0;
            let iDeltaY1: double = 0;
            let iDeltaX2: double = 0;
            let iDeltaY2: double = 0;

            for (j = 0; j < 4; j++) {
                savepoints[j] = new POINT2(points[j]);
            }
            DISMSupport.ReorderSptByFirePoints(savepoints);

            lineutility.InitializePOINT2Array(pts);
            // draw line connecting points 1 & 2
            points[counter] = new POINT2(savepoints[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 5;
            counter++;

            // draw line connecting savepoints 1 & 3
            pts[0] = new POINT2(savepoints[0]);
            pts[1] = new POINT2(savepoints[2]);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw arrow at end of line
            iDiagEOL_length = (Math.sqrt(
                (savepoints[0].x - savepoints[1].x) * (savepoints[0].x - savepoints[1].x) +
                (savepoints[0].y - savepoints[1].y) * (savepoints[0].y - savepoints[1].y)) / 10);

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle1 = Math.atan2(savepoints[0].y - savepoints[2].y, savepoints[0].x - savepoints[2].x);
            iDeltaX1 = (Math.cos(dAngle1 + DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaY1 = (Math.sin(dAngle1 + DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaX2 = (Math.cos(dAngle1 - DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaY2 = (Math.sin(dAngle1 - DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            pts[0].x = savepoints[2].x + iDeltaX1;
            pts[0].y = savepoints[2].y + iDeltaY1;
            pts[1] = new POINT2(savepoints[2]);
            pts[2].x = savepoints[2].x + iDeltaX2;
            pts[2].y = savepoints[2].y + iDeltaY2;
            //DrawLine(destination, mask, color, pts, 3, 2);
            for (j = 0; j < 3; j++) {
                points[counter] = new POINT2(pts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw line connecting savepoints 2 & 4
            pts[0] = new POINT2(savepoints[1]);
            pts[1] = new POINT2(savepoints[3]);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw arrow at end of line
            dAngle1 = Math.atan2(savepoints[1].y - savepoints[3].y, savepoints[1].x - savepoints[3].x);
            iDeltaX1 = (Math.cos(dAngle1 + DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaY1 = (Math.sin(dAngle1 + DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaX2 = (Math.cos(dAngle1 - DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaY2 = (Math.sin(dAngle1 - DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            pts[0].x = savepoints[3].x + iDeltaX1;
            pts[0].y = savepoints[3].y + iDeltaY1;
            pts[1] = new POINT2(savepoints[3]);
            pts[2].x = savepoints[3].x + iDeltaX2;
            pts[2].y = savepoints[3].y + iDeltaY2;
            //DrawLine(destination, mask, color, pts, 3, 2);
            for (j = 0; j < 3; j++) {
                points[counter] = new POINT2(pts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw lines on the back of the graphic
            dAngle1 = Math.atan2(savepoints[1].y - savepoints[0].y, savepoints[1].x - savepoints[0].x);
            iDiagEOL_length *= 2;
            iDeltaX1 = (Math.cos(dAngle1 - DISMSupport.CONST_PI / 4) * iDiagEOL_length);
            iDeltaY1 = (Math.sin(dAngle1 - DISMSupport.CONST_PI / 4) * iDiagEOL_length);
            iDeltaX2 = (Math.cos(dAngle1 + DISMSupport.CONST_PI / 4) * iDiagEOL_length);
            iDeltaY2 = (Math.sin(dAngle1 + DISMSupport.CONST_PI / 4) * iDiagEOL_length);
            pts[0].x = savepoints[0].x - iDeltaX1;
            pts[0].y = savepoints[0].y - iDeltaY1;
            pts[1] = new POINT2(savepoints[0]);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = savepoints[1].x + iDeltaX2;
            pts[0].y = savepoints[1].y + iDeltaY2;
            pts[1] = new POINT2(savepoints[1]);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMSupportbyFireDouble",
                    new RendererException("Failed inside GetDISMSupportByFireDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    private static ReorderAtkByFirePoints(points: POINT2[]): void {
        try {
            //assume the points were ordered correctly. then pt0 is above the line from pt1 to pt2
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let ptAboveLine: POINT2 = new POINT2();
            let ptBelowLine: POINT2 = new POINT2();
            let ptLeftOfLine: POINT2 = new POINT2();
            let ptRightOfLine: POINT2 = new POINT2();
            let distToLine: double = 0;
            let distanceToPointAboveLine: double = 0;
            let distanceToPointBelowLine: double = 0;
            let distanceToPointLeftOfLine: double = 0;
            let distanceToPointRightOfLine: double = 0;
            for (let j: int = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            if (Math.abs(savepoints[1].x - savepoints[2].x) > 2) {
                distToLine = lineutility.CalcDistanceToLineDouble(savepoints[1], savepoints[2], savepoints[0]);
                ptAboveLine = lineutility.ExtendDirectedLine(savepoints[1], savepoints[2], savepoints[2], 2, distToLine);
                ptBelowLine = lineutility.ExtendDirectedLine(savepoints[1], savepoints[2], savepoints[2], 3, distToLine);
                distanceToPointAboveLine = lineutility.CalcDistanceDouble(savepoints[0], ptAboveLine);
                distanceToPointBelowLine = lineutility.CalcDistanceDouble(savepoints[0], ptBelowLine);
                if (distanceToPointAboveLine < distanceToPointBelowLine) {
                    //then pt2 - pt3 should be left to right
                    if (savepoints[2].x < savepoints[1].x) {
                        lineutility.Reverse2Points(savepoints[1], savepoints[2]);
                    }


                } else {
                    if (savepoints[2].x > savepoints[1].x) {
                        lineutility.Reverse2Points(savepoints[1], savepoints[2]);
                    }

                }
            } else //the last 2 points form a vertical line
            {
                distToLine = lineutility.CalcDistanceToLineDouble(savepoints[1], savepoints[2], savepoints[0]);
                ptLeftOfLine = lineutility.ExtendDirectedLine(savepoints[1], savepoints[2], savepoints[2], 0, distToLine);
                ptRightOfLine = lineutility.ExtendDirectedLine(savepoints[1], savepoints[2], savepoints[2], 1, distToLine);
                distanceToPointLeftOfLine = lineutility.CalcDistanceDouble(savepoints[0], ptLeftOfLine);
                distanceToPointRightOfLine = lineutility.CalcDistanceDouble(savepoints[0], ptRightOfLine);
                if (distanceToPointRightOfLine < distanceToPointLeftOfLine) {
                    if (savepoints[2].y < savepoints[1].y) {
                        lineutility.Reverse2Points(savepoints[1], savepoints[2]);
                    }
                } else {
                    if (savepoints[2].y > savepoints[1].y) {
                        lineutility.Reverse2Points(savepoints[1], savepoints[2]);
                    }
                }
            }
            points[1].x = savepoints[1].x;
            points[1].y = savepoints[1].y;
            points[2].x = savepoints[2].x;
            points[2].y = savepoints[2].y;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "ReorderAtkByFirePoints",
                    new RendererException("Failed inside GetDISMSupportByFireDouble", exc));
            } else {
                throw exc;
            }
        }
    }
    private static ReorderSptByFirePoints(points: POINT2[]): void {
        try {
            //assume the points were ordered correctly. then pt0 is above the line from pt1 to pt2
            let ptAboveLine: POINT2 = new POINT2();
            let ptBelowLine: POINT2 = new POINT2();
            let ptLeftOfLine: POINT2 = new POINT2();
            let ptRightOfLine: POINT2 = new POINT2();
            let distToLine: double = 0;
            let distanceToPointAboveLine: double = 0;
            let distanceToPointBelowLine: double = 0;
            let distanceToPointLeftOfLine: double = 0;
            let distanceToPointRightOfLine: double = 0;

            let midpt: POINT2 = lineutility.MidPointDouble(points[0], points[1], 0);
            if (Math.abs(points[2].x - points[3].x) > 2) {
                distToLine = lineutility.CalcDistanceToLineDouble(points[1], points[2], midpt);
                ptAboveLine = lineutility.ExtendDirectedLine(points[1], points[2], points[2], 2, distToLine);
                ptBelowLine = lineutility.ExtendDirectedLine(points[1], points[2], points[2], 3, distToLine);
                distanceToPointAboveLine = lineutility.CalcDistanceDouble(points[0], ptAboveLine);
                distanceToPointBelowLine = lineutility.CalcDistanceDouble(points[0], ptBelowLine);
                if (distanceToPointAboveLine < distanceToPointBelowLine) {
                    //then pt2 - pt3 should be left to right
                    if (points[2].x < points[1].x) {
                        lineutility.Reverse2Points(points[0], points[1]);
                        lineutility.Reverse2Points(points[2], points[3]);
                    }
                } else {
                    if (points[2].x > points[1].x) {
                        lineutility.Reverse2Points(points[0], points[1]);
                        lineutility.Reverse2Points(points[2], points[3]);
                    }
                }
            } else //the last 2 points form a vertical line
            {
                distToLine = lineutility.CalcDistanceToLineDouble(points[1], points[2], midpt);
                ptLeftOfLine = lineutility.ExtendDirectedLine(points[1], points[2], points[2], 0, distToLine);
                ptRightOfLine = lineutility.ExtendDirectedLine(points[1], points[2], points[2], 1, distToLine);
                distanceToPointLeftOfLine = lineutility.CalcDistanceDouble(points[0], ptLeftOfLine);
                distanceToPointRightOfLine = lineutility.CalcDistanceDouble(points[0], ptRightOfLine);
                if (distanceToPointLeftOfLine < distanceToPointRightOfLine) {
                    //then pt2 - pt3 should be left to right
                    if (points[2].y > points[1].y) {
                        lineutility.Reverse2Points(points[0], points[1]);
                        lineutility.Reverse2Points(points[2], points[3]);
                    }
                } else {
                    if (points[2].y < points[1].y) {
                        lineutility.Reverse2Points(points[0], points[1]);
                        lineutility.Reverse2Points(points[2], points[3]);
                    }
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "ReorderSptByFire",
                    new RendererException("Failed inside ReorderSptByFirePoints", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Calculates the points for ATKBYFIRE
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMATKBYFIREDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(3);
            let ptMid: POINT2 = new POINT2();
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let j: int = 0;
            let iDiagEOL_length: double = 0;
            let dAngle1: double = 0;
            let iDeltaX1: double = 0;
            let iDeltaY1: double = 0;
            let iDeltaX2: double = 0;
            let iDeltaY2: double = 0;

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            DISMSupport.ReorderAtkByFirePoints(savepoints);

            lineutility.InitializePOINT2Array(pts);
            // draw line across back
            pts[0] = new POINT2(savepoints[1]);
            pts[1] = new POINT2(savepoints[2]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw perpendicular line
            ptMid.x = (savepoints[1].x + savepoints[2].x) / 2;
            ptMid.y = (savepoints[1].y + savepoints[2].y) / 2;
            pts[0] = new POINT2(ptMid);
            pts[1] = new POINT2(savepoints[0]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // draw arrowhead
            iDiagEOL_length = ((Math.sqrt // height of graphic
                (
                    (savepoints[1].x - savepoints[2].x) * (savepoints[1].x - savepoints[2].x) +
                    (savepoints[1].y - savepoints[2].y) * (savepoints[1].y - savepoints[2].y)) +
                Math.sqrt // length of graphic
                    (
                        (savepoints[0].x - ptMid.x) * (savepoints[0].x - ptMid.x) +
                        (savepoints[0].y - ptMid.y) * (savepoints[0].y - ptMid.y))) / 20);
            //if(iDiagEOL_length<10)
            //	iDiagEOL_length=10;
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iDiagEOL_length > DISMSupport.maxLength / 5 * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength / 5 * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle1 = Math.atan2(ptMid.y - savepoints[0].y, ptMid.x - savepoints[0].x);
            iDeltaX1 = (Math.cos(dAngle1 + DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaY1 = (Math.sin(dAngle1 + DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaX2 = (Math.cos(dAngle1 - DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            iDeltaY2 = (Math.sin(dAngle1 - DISMSupport.CONST_PI / 6) * iDiagEOL_length);
            pts[0].x = savepoints[0].x + iDeltaX1;
            pts[0].y = savepoints[0].y + iDeltaY1;
            pts[1] = new POINT2(savepoints[0]);
            pts[2].x = savepoints[0].x + iDeltaX2;
            pts[2].y = savepoints[0].y + iDeltaY2;
            //DrawLine(destination, mask, color, pts, 3, 2);
            for (j = 0; j < 3; j++) {
                points[counter] = new POINT2(pts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            // draw lines on the back of the graphic
            dAngle1 = Math.atan2(savepoints[1].y - savepoints[2].y, savepoints[1].x - savepoints[2].x);
            iDeltaX1 = (Math.cos(dAngle1 - DISMSupport.CONST_PI / 4) * iDiagEOL_length * 2);
            iDeltaY1 = (Math.sin(dAngle1 - DISMSupport.CONST_PI / 4) * iDiagEOL_length * 2);
            iDeltaX2 = (Math.cos(dAngle1 + DISMSupport.CONST_PI / 4) * iDiagEOL_length * 2);
            iDeltaY2 = (Math.sin(dAngle1 + DISMSupport.CONST_PI / 4) * iDiagEOL_length * 2);

            pts[0].x = savepoints[1].x + iDeltaX1;
            pts[0].y = savepoints[1].y + iDeltaY1;
            pts[1] = new POINT2(savepoints[1]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            pts[0].x = savepoints[2].x - iDeltaX2;
            pts[0].y = savepoints[2].y - iDeltaY2;
            pts[1] = new POINT2(savepoints[2]);
            //DrawLine(destination, mask, color, pts, 2, 2);
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMAtkByFireDouble",
                    new RendererException("Failed inside GetDISMAtkByFireDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for GAP
     *
     * @param points OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMGapDouble(points: POINT2[], linetype: int): int {
        try {
            let savepoints: POINT2[] = new Array<POINT2>(4);
            let pts: POINT2[] = new Array<POINT2>(2);
            let j: int = 0;
            let dMBR: double = lineutility.MBRDistance(points, 4);
            //end declarations

            for (j = 0; j < 4; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(pts);
            //M. Deutch 8-19-04
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dMBR / 10 > DISMSupport.maxLength * DPIScaleFactor) {
                dMBR = 10 * DISMSupport.maxLength * DPIScaleFactor;
            }
            if (dMBR / 10 < DISMSupport.minLength * DPIScaleFactor) {
                dMBR = 10 * DISMSupport.minLength * DPIScaleFactor;
            }

            points[0] = new POINT2(savepoints[0]);
            points[0].style = 0;
            points[1] = new POINT2(savepoints[1]);
            points[1].style = 5;
            points[2] = new POINT2(savepoints[2]);
            points[2].style = 0;
            points[3] = new POINT2(savepoints[3]);
            points[3].style = 5;

            let dist: double = dMBR / 10;
            if (dist > 20 * DPIScaleFactor) {

                dist = 20 * DPIScaleFactor;
            }

            let dist2: double = dist;

            //get the extension point
            pts[0] = lineutility.ExtendLineDouble(savepoints[1], savepoints[0], dist);
            pts[1] = lineutility.ExtendLineDouble(savepoints[2], savepoints[0], dist2);
            points[4] = new POINT2(points[0]);
            points[4].style = 0;
            points[5] = lineutility.MidPointDouble(pts[0], pts[1], 5);
            //get the extension point
            pts[0] = lineutility.ExtendLineDouble(savepoints[0], savepoints[1], dist);
            pts[1] = lineutility.ExtendLineDouble(savepoints[3], savepoints[1], dist2);
            points[6] = new POINT2(points[1]);
            points[6].style = 0;
            points[7] = lineutility.MidPointDouble(pts[0], pts[1], 5);
            //get the extension point
            pts[0] = lineutility.ExtendLineDouble(savepoints[0], savepoints[2], dist2);
            pts[1] = lineutility.ExtendLineDouble(savepoints[3], savepoints[2], dist);
            points[8] = new POINT2(points[2]);
            points[8].style = 0;
            points[9] = lineutility.MidPointDouble(pts[0], pts[1], 5);
            //get the extension point
            pts[0] = lineutility.ExtendLineDouble(savepoints[1], savepoints[3], dist2);
            pts[1] = lineutility.ExtendLineDouble(savepoints[2], savepoints[3], dist);
            points[10] = new POINT2(points[3]);
            points[10].style = 0;
            points[11] = lineutility.MidPointDouble(pts[0], pts[1], 5);

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMGapDouble",
                    new RendererException("Failed inside GetDISMGapDouble", exc));
            } else {
                throw exc;
            }
        }
        return 12;
    }
    /**
     * Calculates the points for MNFLDDIS
     *
     * @param points - OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMMinefieldDisruptDouble(points: POINT2[], linetype: int): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(2);
            let ptsArrow: POINT2[] = new Array<POINT2>(3);
            let ptCenter: POINT2 = new POINT2();
            let j: int = 0;
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let dAngle1: double = 0;
            let d: double = 0;
            let dist: double = 0;
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let deltapoints3: POINT2[] = new Array<POINT2>(4);
            let iDiagEOL_length: double = 0;
            let iDeltaX1: double = 0;
            let iDeltaY1: double = 0;
            let iDeltaX2: double = 0;
            let iDeltaY2: double = 0;
            let ptTail: POINT2 = new POINT2();
            //end declarations

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(points[j]);
            }

            lineutility.InitializePOINT2Array(ptsArrow);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);
            lineutility.InitializePOINT2Array(deltapoints3);
            lineutility.InitializePOINT2Array(pts);

            points[counter] = new POINT2(savepoints[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 5;
            counter++;

            ptCenter.x = (savepoints[0].x + savepoints[1].x) / 2;
            ptCenter.y = (savepoints[0].y + savepoints[1].y) / 2;

            ptsArrow[0] = new POINT2(savepoints[2]);
            ptsArrow[1].x = ptCenter.x + (savepoints[2].x - savepoints[0].x) * 4 / 5;
            ptsArrow[1].y = ptCenter.y + (savepoints[2].y - savepoints[0].y) * 4 / 5;
            ptsArrow[2].x = savepoints[1].x + (savepoints[2].x - savepoints[0].x) * 3 / 5;
            ptsArrow[2].y = savepoints[1].y + (savepoints[2].y - savepoints[0].y) * 3 / 5;

            points[counter] = new POINT2(savepoints[1]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(ptsArrow[2]);
            points[counter].style = 5;
            counter++;

            pts[1] = new POINT2(ptsArrow[1]);

            //draw middle line
            points[counter] = new POINT2(ptCenter);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            //draw tail
            dist = lineutility.CalcDistanceDouble(savepoints[2], savepoints[0]);
            d = dist;
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (d > 5 * DISMSupport.maxLength * DPIScaleFactor) {
                d = 5 * DISMSupport.maxLength * DPIScaleFactor;
            }
            if (d < 5 * DISMSupport.minLength * DPIScaleFactor) {
                d = 5 * DISMSupport.minLength * DPIScaleFactor;
            }
            ptTail = new POINT2(ptCenter);
            pts[0].x = ptTail.x - (savepoints[2].x - savepoints[0].x) / 5;
            pts[0].y = ptTail.y - (savepoints[2].y - savepoints[0].y) / 5;
            pts[0] = lineutility.ExtendLineDouble(pts[0], ptTail, -d / 5);
            points[counter] = new POINT2(ptTail);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[0]);
            points[counter].style = 5;
            counter++;

            pts[0] = new POINT2(savepoints[0]);
            pts[1] = new POINT2(ptsArrow[0]);

            points[counter] = new POINT2(pts[0]);
            points[counter].style = 0;
            counter++;
            points[counter] = new POINT2(pts[1]);
            points[counter].style = 5;
            counter++;

            // the following code is very similar to CalcEndpieceDeltas
            iDiagEOL_length = ((Math.sqrt // height of graphic
                (
                    (savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                    (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y)) +
                Math.sqrt // length of graphic
                    (
                        (savepoints[2].x - savepoints[1].x) * (savepoints[2].x - savepoints[1].x) +
                        (savepoints[2].y - savepoints[1].y) * (savepoints[2].y - savepoints[1].y))) / 15);
            // dAngle1 = angle used to calculate the end-piece deltas

            if (iDiagEOL_length > DISMSupport.maxLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.maxLength * DPIScaleFactor;
            }
            if (iDiagEOL_length < DISMSupport.minLength * DPIScaleFactor) {
                iDiagEOL_length = DISMSupport.minLength * DPIScaleFactor;
            }

            dAngle1 = Math.atan2(savepoints[0].y - savepoints[2].y, savepoints[0].x - savepoints[2].x);
            iDeltaX1 = (iDiagEOL_length * Math.cos(dAngle1 - DISMSupport.CONST_PI / 6));
            iDeltaY1 = (iDiagEOL_length * Math.sin(dAngle1 - DISMSupport.CONST_PI / 6));
            iDeltaX2 = (iDiagEOL_length * Math.cos(dAngle1 + DISMSupport.CONST_PI / 6));
            iDeltaY2 = (iDiagEOL_length * Math.sin(dAngle1 + DISMSupport.CONST_PI / 6));

            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[0],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints1);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[1],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints2);
            DISMSupport.DrawEndpieceDeltasDouble(ptsArrow[2],
                iDeltaX1, iDeltaY1, iDeltaX2, iDeltaY2, deltapoints3);
            points[counter] = new POINT2(deltapoints1[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 10;
            counter++;

            points[counter] = new POINT2(deltapoints2[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 10;
            counter++;

            points[counter] = new POINT2(deltapoints3[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints3[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints3[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints3[3]);
            points[counter].style = 10;
            counter++;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMMinefieldDisruptDouble",
                    new RendererException("Failed inside GetDISMMinefieldDisruptDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for LINTGT
     *
     * @param points - OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     * @param vblCounter the number of points required to display the symbol
     */
    static GetDISMLinearTargetDouble(points: POINT2[], linetype: int, vblCounter: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let dMBR: double = lineutility.MBRDistance(points, vblCounter - 4);
            //end declarations

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dMBR / 20 > DISMSupport.maxLength * DPIScaleFactor) {
                dMBR = 20 * DISMSupport.maxLength * DPIScaleFactor;
            }
            if (dMBR / 20 < DISMSupport.minLength * DPIScaleFactor) {
                dMBR = 20 * DISMSupport.minLength * DPIScaleFactor;
            }
            if (dMBR < 150 * DPIScaleFactor) {
                dMBR = 150 * DPIScaleFactor;
            }
            if (dMBR > 250 * DPIScaleFactor) {

                dMBR = 250 * DPIScaleFactor;
            }


            for (j = 0; j < vblCounter - 4; j++) {
                points[counter].style = 0;
                counter++;
            }
            //for(j=vblCounter-4;j<vblCounter;j++)
            //  points[j]=new POINT2();

            points[counter - 1].style = 5;

            points[counter] = lineutility.ExtendTrueLinePerpDouble(points[0], points[1], points[0], dMBR / 20, 0);
            counter++;
            points[counter] = lineutility.ExtendTrueLinePerpDouble(points[0], points[1], points[0], -dMBR / 20, 5);
            counter++;
            points[counter] = lineutility.ExtendTrueLinePerpDouble(points[vblCounter - 5], points[vblCounter - 6], points[vblCounter - 5], dMBR / 20, 0);
            counter++;
            points[counter] = lineutility.ExtendTrueLinePerpDouble(points[vblCounter - 5], points[vblCounter - 6], points[vblCounter - 5], -dMBR / 20, 5);
            counter++;
            if (linetype === TacticalLines.FPF) {
                points[0].style = 6;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMLinearTargetDouble",
                    new RendererException("Failed inside GetDISMLinearTargetDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
    /**
     * Calculates the points for BLOCK, MNFLDBLK
     *
     * @param points - OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMBlockDouble2(points: POINT2[],
        linetype: int): void {
        try {
            let ptRelative: POINT2 = new POINT2(points[2]);

            let midpt: POINT2 = lineutility.MidPointDouble(points[0], points[1], 0);
            let j: int = 0;
            points[0].style = 0;
            points[1].style = 5;
            points[2] = new POINT2(midpt);
            points[3] = new POINT2(ptRelative);
            if (linetype === TacticalLines.BLOCK) {
                points[2].style = 14;
            }
            if (linetype === TacticalLines.FPF) {
                points[2].style = 6;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMBlockDouble2",
                    new RendererException("Failed inside GetDISMBlockDouble2", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Calculates the points for PAA_RECTANGULAR.
     *
     * @param points - OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    protected static GetDISMPAADouble(points: POINT2[], linetype: int): void {
        try {
            let pt0: POINT2 = new POINT2(points[0]);
            let pt1: POINT2 = new POINT2(points[1]);
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            let midpt: POINT2 = new POINT2();
            let d: double = lineutility.CalcDistanceDouble(pt0, pt1);

            midpt = lineutility.MidPointDouble(pt0, pt1, 0);
            pt2 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, midpt, d / 2, 0);
            pt3 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, midpt, -d / 2, 0);
            d = lineutility.CalcDistanceDouble(pt0, pt2);
            points[0] = new POINT2(pt0);
            points[0].style = 14;
            points[1] = new POINT2(pt2);
            points[1].style = 14;
            points[2] = new POINT2(pt1);
            points[2].style = 14;
            points[3] = new POINT2(pt3);
            points[3].style = 14;
            points[4] = new POINT2(pt0);
            points[4].style = 5;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMPAADouble",
                    new RendererException("Failed inside GetDISMPAADouble", exc));
            } else {
                throw exc;
            }
        }
    }

    private static ReverseDelayArc(points: POINT2[]): boolean {
        let pt1: POINT2 = points[0];
        let pt2: POINT2 = points[1];
        let pt3: POINT2 = points[2];

        let lineAngle: double = DISMSupport.getAngleBetweenPoints(pt1.x, pt1.y, pt2.x, pt2.y);
        let curveAngle: double = DISMSupport.getAngleBetweenPoints(pt2.x, pt2.y, pt3.x, pt3.y);

        let upperBound: double = curveAngle + 180;
        return !DISMSupport.isInRange(curveAngle, upperBound, lineAngle);
    }

    private static isInRange(min: double, max: double, targetAngle: double): boolean {
        targetAngle = DISMSupport.normalizeAngle(targetAngle);
        min = DISMSupport.normalizeAngle(min);
        max = DISMSupport.normalizeAngle(max);

        if (min < max) {
            return min <= targetAngle && targetAngle <= max;
        }
        return min <= targetAngle || targetAngle <= max;

    }

    private static getAngleBetweenPoints(x1: double, y1: double, x2: double, y2: double): double {
        return Math.atan2(y2 - y1, x2 - x1) * 180.0 / Math.PI;
    }

    /**
     * Returns an angle from 0 to 360
     *
     * @param angle the angle to normalize
     * @return an angle in range from 0 to 360
     */
    public static normalizeAngle(angle: double): double {
        return (3600000 + angle) % 360;
    }

    private static DrawEndpieceDeltasDouble(point: POINT2,
        iDelta1: double,
        iDelta2: double,
        iDelta3: double,
        iDelta4: double,
        deltapoints: POINT2[]): void {
        try {
            deltapoints[0] = new POINT2(point);
            deltapoints[0].style = 0;
            deltapoints[1].x = point.x + iDelta1;
            deltapoints[1].y = point.y + iDelta2;
            deltapoints[1].style = 5;
            deltapoints[2] = new POINT2(point);
            deltapoints[2].style = 0;
            deltapoints[3].x = point.x + iDelta3;
            deltapoints[3].y = point.y + iDelta4;
            deltapoints[3].style = 5;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "DrawEndpieceDeltasDouble",
                    new RendererException("Failed inside DrawEndpieceDeltasDouble", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Calculates the points for EASY
     *
     * @param points - OUT - the client points, also used for the returned points.
     * @param linetype the line type.
     */
    static GetDISMEasyDouble(points: POINT2[],
        linetype: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            let rectpts: POINT2[] = new Array<POINT2>(4);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            let deltapoints1: POINT2[] = new Array<POINT2>(4);
            let deltapoints2: POINT2[] = new Array<POINT2>(4);
            let iDeltaX: ref<number[]> = new ref();
            let iDeltaY: ref<number[]> = new ref();
            let bPointsRight: int = 0;
            //end declarations

            for (j = 0; j < 3; j++) {
                savepoints[j] = points[j];
            }
            lineutility.InitializePOINT2Array(pointsCorner);
            lineutility.InitializePOINT2Array(rectpts);
            lineutility.InitializePOINT2Array(deltapoints1);
            lineutility.InitializePOINT2Array(deltapoints2);

            DISMSupport.DrawOpenRectangleDouble(savepoints, pointsCorner, rectpts);
            for (j = 0; j < 4; j++) {
                points[counter] = new POINT2(rectpts[j]);
                points[counter].style = 0;
                counter++;
            }
            points[counter - 1].style = 5;

            bPointsRight = DISMSupport.DetermineDirectionDouble(savepoints);

            DISMSupport.CalcEndpieceDeltasDouble(savepoints, iDeltaX, iDeltaY, DISMSupport.CONST_PI / 4);

            if ((savepoints[0].y - savepoints[1].y) < 0) {// Point0 is higher than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                }
            } else {// Point0 is lower than Point1
                if (bPointsRight !== 0) {// figure opens to the right
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaY.value[0], -iDeltaX.value[0], iDeltaX.value[0], iDeltaY.value[0], deltapoints2);
                } else {// figure opens to the left
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[0],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints1);
                    DISMSupport.DrawEndpieceDeltasDouble(savepoints[1],
                        iDeltaX.value[0], iDeltaY.value[0], iDeltaY.value[0], -iDeltaX.value[0], deltapoints2);
                }
            }

            points[counter] = new POINT2(deltapoints1[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints1[3]);
            points[counter].style = 10;
            counter++;

            points[counter] = new POINT2(deltapoints2[1]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[0]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 9;
            counter++;
            points[counter] = new POINT2(deltapoints2[3]);
            points[counter].style = 10;
            counter++;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "GetDISMEasyDouble",
                    new RendererException("Failed inside GetDISMEasyDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    /**
     * Calculates the points for AMBUSH
     *
     * @param pLinePoints - OUT - the client points, also used for the returned points.
     */
    static AmbushPointsDouble(pLinePoints: POINT2[]): int {
        let counter: int = 0;
        try {
            let pts: POINT2[] = new Array<POINT2>(3);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            // calculate midpoint
            let ptMid: POINT2 = new POINT2();
            let dRadius: double = 0;
            let d: double = 0;
            let dAngle1: double = 0;
            let dAngle1c: double = 0;
            let dAngle2c: double = 0;
            let dAngle12c: double = 0;
            let dAngle0: double = 0;
            let arcpoints: POINT2[] = new Array<POINT2>(17);
            let dAngleTic: double = 0;
            let dDeltaX1: double = 0;
            let dDeltaY1: double = 0;
            let dDeltaX2: double = 0;
            let dDeltaY2: double = 0;
            let ptCenter: POINT2 = new POINT2();
            let j: int = 0;
            let i: int = 0;
            let iArrowLength: double = 0;

            for (j = 0; j < 3; j++) {
                savepoints[j] = new POINT2(pLinePoints[j]);
            }

            //initialize the pOINT2 arrays
            lineutility.InitializePOINT2Array(arcpoints);
            lineutility.InitializePOINT2Array(pts);

            ptMid.x = (savepoints[1].x + savepoints[2].x) / 2;
            ptMid.y = (savepoints[1].y + savepoints[2].y) / 2;

            // calculate arc center
            dRadius = Math.sqrt((ptMid.x - savepoints[2].x) * (ptMid.x - savepoints[2].x) +
                (ptMid.y - savepoints[2].y) * (ptMid.y - savepoints[2].y));

            // add section M. Deutch 8-25-05
            //consider the other possiblity for a center
            let dRadius2: double = Math.sqrt((ptMid.x - savepoints[1].x) * (ptMid.x - savepoints[1].x) +
                (ptMid.y - savepoints[1].y) * (ptMid.y - savepoints[1].y));

            dAngle1 = Math.atan2(savepoints[1].y - savepoints[2].y, savepoints[1].x - savepoints[2].x);
            ptCenter.x = ptMid.x + Math.cos(dAngle1 - DISMSupport.CONST_PI / 2) * dRadius;
            ptCenter.y = ptMid.y + Math.sin(dAngle1 - DISMSupport.CONST_PI / 2) * dRadius;

            //added section M. Deutch 8-25-05
            //consider the other possibility for a center if the points were reversed
            let dAngle2: double = Math.atan2(savepoints[2].y - savepoints[1].y, savepoints[2].x - savepoints[1].x);
            let ptCenter2: POINT2 = new POINT2();
            ptCenter2.x = ptMid.x + Math.cos(dAngle2 - DISMSupport.CONST_PI / 2) * dRadius;
            ptCenter2.y = ptMid.y + Math.sin(dAngle2 - DISMSupport.CONST_PI / 2) * dRadius;
            let dist: double = lineutility.CalcDistanceDouble(savepoints[0], ptCenter);
            let dist2: double = lineutility.CalcDistanceDouble(savepoints[0], ptCenter2);
            //if the distance to the new center is closer
            //then reverse the arc endpoints
            if (dist2 > dist) {
                //POINT2 ptTemp=new POINT2();
                let ptTemp: POINT2 = new POINT2(savepoints[1]);
                savepoints[1] = new POINT2(savepoints[2]);
                savepoints[2] = new POINT2(ptTemp);
                ptCenter = new POINT2(ptCenter2);
                dAngle1 = dAngle2;
            }
            //end section

            dRadius = Math.sqrt((savepoints[1].x - ptCenter.x) * (savepoints[1].x - ptCenter.x) +
                (savepoints[1].y - ptCenter.y) * (savepoints[1].y - ptCenter.y));

            // draw arc
            DISMSupport.ArcApproximationDouble((ptCenter.x - dRadius), (ptCenter.y - dRadius),
                (ptCenter.x + dRadius), (ptCenter.y + dRadius),
                savepoints[2].x, savepoints[2].y, savepoints[1].x, savepoints[1].y, arcpoints);

            for (j = 0; j < 17; j++) {
                pLinePoints[counter] = new POINT2(arcpoints[j]);
                pLinePoints[counter].style = 0;
                counter++;
            }
            pLinePoints[counter - 1].style = 5;

            // draw line out from arc to point 1
            pts[0] = new POINT2(savepoints[0]);
            dAngle1c = Math.atan2(ptCenter.y - savepoints[1].y, ptCenter.x - savepoints[1].x);
            dAngle2c = Math.atan2(ptCenter.y - savepoints[2].y, ptCenter.x - savepoints[2].x);
            dAngle12c = (dAngle1c + dAngle2c) / 2;
            if ((dAngle1c > 0) && (dAngle2c < 0)) {
                pts[1].x = ptCenter.x + Math.cos(dAngle12c) * dRadius;
                pts[1].y = ptCenter.y + Math.sin(dAngle12c) * dRadius;
            }
            else {
                pts[1].x = ptCenter.x - Math.cos(dAngle12c) * dRadius;
                pts[1].y = ptCenter.y - Math.sin(dAngle12c) * dRadius;
            }
            pLinePoints[counter] = new POINT2(pts[0]);
            pLinePoints[counter].style = 0; counter++;
            pLinePoints[counter] = new POINT2(pts[1]);
            pLinePoints[counter].style = 5; counter++;


            // draw arrowhead on end of line
            dAngle0 = Math.atan2(pts[1].y - savepoints[0].y, pts[1].x - savepoints[0].x);
            iArrowLength = (
                (
                    Math.sqrt // height of graphic
                        (
                            (savepoints[1].x - savepoints[2].x) * (savepoints[1].x - savepoints[2].x) +
                            (savepoints[1].y - savepoints[2].y) * (savepoints[1].y - savepoints[2].y)
                        ) +
                    Math.sqrt // length of graphic
                        (
                            (savepoints[0].x - ptMid.x) * (savepoints[0].x - ptMid.x) +
                            (savepoints[0].y - ptMid.y) * (savepoints[0].y - ptMid.y)
                        )
                ) / 20);

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (iArrowLength > DISMSupport.maxLength * DPIScaleFactor) {

                iArrowLength = DISMSupport.maxLength as int * DPIScaleFactor;
            }

            if (iArrowLength < DISMSupport.minLength * DPIScaleFactor) {

                iArrowLength = DISMSupport.minLength as int * DPIScaleFactor;
            }


            pts[0].x = savepoints[0].x + Math.cos(dAngle0 + DISMSupport.CONST_PI / 6) * iArrowLength;
            pts[0].y = savepoints[0].y + Math.sin(dAngle0 + DISMSupport.CONST_PI / 6) * iArrowLength;
            pts[1] = savepoints[0];
            pts[2].x = savepoints[0].x + Math.cos(dAngle0 - DISMSupport.CONST_PI / 6) * iArrowLength;
            pts[2].y = savepoints[0].y + Math.sin(dAngle0 - DISMSupport.CONST_PI / 6) * iArrowLength;
            for (j = 0; j < 3; j++) {
                pLinePoints[counter] = new POINT2(pts[j]);
                pLinePoints[counter].style = 0;
                counter++;
            }
            pLinePoints[counter - 1].style = 5;

            // draw lines out from arc toward back of graphic
            d = dRadius / 3;
            if (d > DISMSupport.maxLength * DPIScaleFactor) {

                d = DISMSupport.maxLength * DPIScaleFactor;
            }

            if (d < DISMSupport.minLength * DPIScaleFactor) {

                d = DISMSupport.minLength * DPIScaleFactor;
            }


            dAngleTic = DISMSupport.CONST_PI / 18; // angle in radians between tic-marks
            dDeltaX2 = Math.cos(dAngle1 + DISMSupport.CONST_PI / 2) * d;
            dDeltaY2 = Math.sin(dAngle1 + DISMSupport.CONST_PI / 2) * d;
            for (i = 0; i < 8; i++) {
                dAngle1c += dAngleTic;
                dDeltaX1 = Math.cos(dAngle1c) * dRadius;
                dDeltaY1 = Math.sin(dAngle1c) * dRadius;
                pts[0].x = ptCenter.x - dDeltaX1;
                pts[0].y = ptCenter.y - dDeltaY1;
                pLinePoints[counter] = new POINT2(pts[0]);
                pLinePoints[counter].style = 0;
                counter++;
                pts[1].x = pts[0].x - dDeltaX2;
                pts[1].y = pts[0].y - dDeltaY2;
                pLinePoints[counter] = new POINT2(pts[1]);
                pLinePoints[counter].style = 5;
                counter++;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(DISMSupport._className, "AmbushPointsDouble",
                    new RendererException("Failed inside AmbushPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }
}
