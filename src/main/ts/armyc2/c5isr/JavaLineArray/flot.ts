import { type int, type double} from "../graphics2d/BasicTypes";

import { arraysupport } from "../JavaLineArray/arraysupport"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"

/**
 * A class for calculating flot ellipses. Some functions use the same array for the client points
 * and the return points. The caller allocates a size large enough to hold the return points.
 *
 *
 */
export class flot {
    private static readonly _className: string = "flot";
    static GetAnchorageFlotSegment(vbPoints: number[],
        x1: int,
        y1: int,
        x2: int,
        y2: int,
        segment: int,
        floatDiameter: double,
        points: number[],
        bFlip: ref<number[]>,
        lDirection: ref<number[]>,
        lLastDirection: ref<number[]>): int {
        let lSegCounter: int = 0;
        try {
            let j: int = 0;
            let dDistance: double = 0;
            let nNumSegs: int = 0;
            let m: int = 0;
            let lLocx: int = 0;
            let lLocy: int = 0;
            let dAngle: double = 0;
            let arcPoints: number[] = new Array<number>(30);
            let dRemainder: double = 0;
            let dNum: double = 0;
            let dDen: double = 0;

            if (segment === 0 && vbPoints[0] >= vbPoints[2]) {
                bFlip.value[0] = 1;//TRUE;
            }
            if (segment === 0 && vbPoints[0] < vbPoints[2]) {
                bFlip.value[0] = 0;//FALSE;
            }

            dNum = vbPoints[2 * segment + 3] - vbPoints[2 * segment + 1];
            dDen = vbPoints[2 * segment + 2] - vbPoints[2 * segment];

            //for some reason this did not blow up before I put the if/else
            //instead it would assign pi/2 to dAngle when dDen=0
            if (dDen === 0) {
                dAngle = Math.PI / 2;
            } else {
                dAngle = Math.abs(Math.atan(dNum / dDen));
            }

            //convert to degrees
            dAngle = (180 / Math.PI) * dAngle;

            if (vbPoints[2 * segment + 0] <= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] >= vbPoints[2 * segment + 3]) {
                dAngle = 90 - dAngle;
            } else {
                if (vbPoints[2 * segment + 0] <= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] <= vbPoints[2 * segment + 3]) {
                    dAngle = dAngle + 90;
                } else {
                    if (vbPoints[2 * segment + 0] >= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] <= vbPoints[2 * segment + 3]) {
                        dAngle = 270 - dAngle;
                    } else {
                        if (vbPoints[2 * segment + 0] >= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] >= vbPoints[2 * segment + 3]) {
                            dAngle = 270 + dAngle;
                        }
                    }

                }

            }


            dDistance = lineutility.CalcDistance2(x1, y1, x2, y2);

            nNumSegs = Math.trunc(dDistance / floatDiameter);
            if (nNumSegs % 2 === 0) {
                nNumSegs -= 1;
            }

            dRemainder = nNumSegs * floatDiameter - dDistance;
            dDistance = dDistance + dRemainder;

            //calculate the default dAngle here
            //also establish the lDirection
            if (vbPoints[2 * segment] >= vbPoints[2 * segment + 2]) {
                dAngle = dAngle + 90;
                lDirection.value[0] = 1;
            } else {
                dAngle = dAngle - 90;
                lDirection.value[0] = 0;
            }

            if (segment > 0 && lDirection.value[0] !== lLastDirection.value[0]) {
                //'toggle bflip if the lDirection changes
                if (bFlip.value[0] === 1) {
                    bFlip.value[0] = 0;
                } else {
                    bFlip.value[0] = 1;
                }
            }

            //'flip the segment if necessary
            if (bFlip.value[0] === 1) {
                dAngle = dAngle + 180;
            }

            //for( m = 0; m< nNumSegs;m++)
            for (m = 0; m < nNumSegs; m += 2) //get evry other flot only for anchorage
            {
                lLocx = Math.trunc(x1 + (m + 0.5) * (x2 - x1) * floatDiameter / dDistance);
                lLocy = Math.trunc(y1 + (m + 0.5) * (y2 - y1) * floatDiameter / dDistance);

                flot.CalcAnglePoints(lLocx, lLocy, dAngle, arcPoints, dDistance / (nNumSegs as double * 2));

                for (j = 0; j < 30; j++) {
                    points[lSegCounter] = arcPoints[j];
                    lSegCounter++;
                }
            }

            //save last lDirection
            lLastDirection.value[0] = lDirection.value[0];
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetAnchorageFlotSegment",
                    new RendererException("Failed inside GetAnchorageFlotSegment", exc));
            } else {
                throw exc;
            }
        }
        return lSegCounter;
    }

    static GetAnchorageCountDouble(vbPoints: POINT2[], floatDiameter: double, numPts: int): int {
        let lTotalpts: int = 0;
        try {
            //declarations
            let j: int = 0;
            let lNumSegs: int = 0;
            let dDistance: double = 0;
            let vbPoints2: POINT2[];
            //end declarations

            vbPoints2 = new Array<POINT2>(numPts);
            for (j = 0; j < numPts; j++) {
                vbPoints2[j] = new POINT2(vbPoints[j]);
            }
            for (j = 0; j < numPts - 1; j++) {
                dDistance = lineutility.CalcDistanceDouble(vbPoints2[j], vbPoints2[j + 1]);
                lNumSegs = Math.trunc(dDistance / floatDiameter);
                if (lNumSegs > 0) {
                    lTotalpts += lNumSegs * 12; //10 points per flot + 2 end points for line
                } else {
                    lTotalpts += 1;
                }
            }
            lTotalpts += 1;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetAnchorageCountDouble",
                    new RendererException("Failed inside GetAnchorageCountDouble", exc));
            } else {
                throw exc;
            }
        }
        return (lTotalpts);
    }
    static GetFlotCount2Double(tg: TGLight, vbPoints: POINT2[], numPts: int): int {
        let lTotalpts: int = 0;
        try {
            let j: int = 0;
            let lNumSegs: int = 0;
            let dDistance: double = 0;
            let dIncrement: double = 0;
            let nFactor: int = 10;

            switch (tg.get_LineType()) {
                case TacticalLines.WF:
                case TacticalLines.UWF: {
                    dIncrement = arraysupport.getScaledSize(40, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.WFG: {
                    dIncrement = arraysupport.getScaledSize(60, tg.get_LineThickness());
                    nFactor = 17;
                    break;
                }

                case TacticalLines.WFY: {
                    dIncrement = arraysupport.getScaledSize(60, tg.get_LineThickness());
                    nFactor = 20;
                    break;
                }

                default: {
                    dIncrement = arraysupport.getScaledSize(20, tg.get_LineThickness());
                    break;
                }

            }

            for (j = 0; j < numPts - 1; j++) {
                dDistance = lineutility.CalcDistanceDouble(vbPoints[j], vbPoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / dIncrement);   //flot diameter is 20
                lTotalpts = lTotalpts + lNumSegs * nFactor; //10 points per flot
                switch (tg.get_LineType()) {
                    case TacticalLines.WFG:
                    case TacticalLines.WFY: {
                        if (lNumSegs === 0) {
                            lTotalpts += 2;	//add 2 points for the line segment
                        }
                        break;
                    }

                    default: {
                        break;
                    }

                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetFlotCount2Double",
                    new RendererException("Failed inside GetFlotCount2Double", exc));
            } else {
                throw exc;
            }
        }
        return lTotalpts;
    }

    static GetFlot2Double(tg: TGLight, vbPoints2: POINT2[], numPts: int): int {
        let lFlotCounter: int = 0;
        try {
            let lineType: int = tg.get_LineType();
            let j: int = 0;
            let k: int = 0;
            let l: int = 0;
            let x1: int = 0;
            let y1: int = 0;
            let x2: int = 0;
            let y2: int = 0;
            let z2: int = 0;
            let numSegPts: int = -1;
            let z: int = 0;
            let lFlotCount: int = 0;
            let lNumSegs: int = 0;
            let dDistance: double = 0;
            let vbPoints: number[];
            let points: number[];
            let dIncrement: double = 0;
            let style10Points: POINT2[];
            let style10Counter: int = 0;
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let crossPt1: POINT2 = new POINT2();
            let crossPt2: POINT2 = new POINT2();
            let bFlip: ref<number[]> = new ref();
            let lDirection: ref<number[]> = new ref();
            let lLastDirection: ref<number[]> = new ref();

            bFlip.value = new Array<number>(1);
            lDirection.value = new Array<number>(1);
            lLastDirection.value = new Array<number>(1);
            bFlip.value[0] = -1;
            lDirection.value[0] = -1;
            lLastDirection.value[0] = -1;
            lFlotCount = flot.GetFlotCount2Double(tg, vbPoints2, numPts);
            if (lFlotCount <= 0) {
                return 0;
            }

            style10Points = new Array<POINT2>(lFlotCount);
            lineutility.InitializePOINT2Array(style10Points);
            vbPoints = new Array<number>(2 * numPts);
            switch (lineType) {
                case TacticalLines.WF:
                case TacticalLines.UWF: {
                    dIncrement = arraysupport.getScaledSize(40, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.WFG:
                case TacticalLines.WFY: {
                    dIncrement = arraysupport.getScaledSize(60, tg.get_LineThickness());
                    break;
                }

                default: {
                    dIncrement = arraysupport.getScaledSize(20, tg.get_LineThickness());
                    break;
                }

            }
            for (j = 0; j < numPts; j++) {
                vbPoints[k] = vbPoints2[j].x as int;
                k++;
                vbPoints[k] = vbPoints2[j].y as int;
                k++;
            }
            k = 0;
            //assume caller has dimensioned flotppoints
            j = 0;
            //every lSegment has 2 points
            for (l = 0; l < numPts - 1; l++) {
                dDistance = lineutility.CalcDistance2(vbPoints[2 * l], vbPoints[2 * l + 1], vbPoints[2 * l + 2], vbPoints[2 * l + 3]);
                lNumSegs = Math.trunc(dDistance / dIncrement);
                if (lNumSegs > 0) {
                    points = new Array<number>(lNumSegs * 30);
                    numSegPts = flot.GetFlotSegment2(tg, vbPoints, l, points, bFlip, lDirection, lLastDirection);
                    for (j = 0; j < numSegPts; j++) {
                        x1 = points[k];
                        y1 = points[k + 1];
                        z = points[k + 2];
                        pt0.x = x1;
                        pt0.y = y1;
                        pt0.style = z;
                        if (j < numSegPts - 1) {	//used by WFZ, WFY only
                            x2 = points[k + 3];
                            y2 = points[k + 4];
                            z2 = points[k + 5];
                            pt1.x = x2;
                            pt1.y = y2;
                            pt1.style = z2;
                        }
                        k += 3;
                        if (lFlotCounter < lFlotCount) {
                            vbPoints2[lFlotCounter].x = x1;
                            vbPoints2[lFlotCounter].y = y1;
                            switch (lineType) {
                                case TacticalLines.WF:
                                case TacticalLines.WFG:
                                case TacticalLines.WFY: {
                                    if ((lFlotCounter + 1) % 10 === 0) {
                                        vbPoints2[lFlotCounter].style = 10;
                                        //style10Points are used by WFG and WFY for the mid-segment features
                                        if (j < numSegPts - 1) {
                                            style10Points[style10Counter] = new POINT2(vbPoints2[lFlotCounter]);
                                            style10Points[style10Counter].style = 0;
                                            style10Counter++;
                                            if (j < numSegPts - 2) {
                                                if (lineType === TacticalLines.WFG) {
                                                    pt2 = new POINT2(style10Points[style10Counter - 1]);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(10, tg.get_LineThickness()), 5);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(20, tg.get_LineThickness()), 20);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(30, tg.get_LineThickness()), 0);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(70, tg.get_LineThickness()), 5);
                                                }
                                                if (lineType === TacticalLines.WFY) {
                                                    pt2 = new POINT2(style10Points[style10Counter - 1]);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(10, tg.get_LineThickness()), 5);	//pt before 1st break
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(15, tg.get_LineThickness()), 0);	//1st pt after 1st break;
                                                    crossPt1 = lineutility.ExtendDirectedLine(style10Points[style10Counter - 1], pt1, style10Points[style10Counter - 1], 3, arraysupport.getScaledSize(5, tg.get_LineThickness()), 0);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(25, tg.get_LineThickness()), 5);	//2nd point after 1st break;
                                                    crossPt2 = lineutility.ExtendDirectedLine(style10Points[style10Counter - 1], pt1, style10Points[style10Counter - 1], 2, arraysupport.getScaledSize(5, tg.get_LineThickness()), 5);
                                                    style10Points[style10Counter++] = new POINT2(crossPt1);
                                                    style10Points[style10Counter++] = new POINT2(crossPt2);
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(30, tg.get_LineThickness()), 0);	//1st pt after 2nd break
                                                    style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(60, tg.get_LineThickness()), 5);	//2nd pt after 2nd break
                                                }
                                            }
                                        } else {
                                            pt2.x = vbPoints[2 * l];
                                            pt2.y = vbPoints[2 * l + 1];
                                            pt2.style = 0;
                                            style10Points[style10Counter++] = new POINT2(pt2);
                                            style10Points[style10Counter++] = lineutility.ExtendAlongLineDouble(pt2, pt1, arraysupport.getScaledSize(40, tg.get_LineThickness()), 5);

                                            pt2.x = vbPoints[2 * l + 2];
                                            pt2.y = vbPoints[2 * l + 3];
                                            pt2.style = 5;
                                            style10Points[style10Counter] = new POINT2(vbPoints2[lFlotCounter]);
                                            style10Points[style10Counter++].style = 0;
                                            style10Points[style10Counter++] = new POINT2(pt2);
                                        }
                                    } else {
                                        vbPoints2[lFlotCounter].style = 9;
                                    }
                                    break;
                                }

                                default: {
                                    vbPoints2[lFlotCounter].style = 0;
                                    break;
                                }

                            }
                            lFlotCounter++;
                        }
                    }
                    switch (lineType) {
                        case TacticalLines.WF:
                        case TacticalLines.WFG:
                        case TacticalLines.WFY: {
                            vbPoints2[lFlotCounter - 1].style = 10;
                            break;
                        }

                        default: {
                            vbPoints2[lFlotCounter - 1].style = 5;
                            break;
                        }

                    }
                    k = 0;
                }//end if numsegs>0
                else {
                    style10Points[style10Counter].x = vbPoints[2 * l];
                    style10Points[style10Counter].y = vbPoints[2 * l + 1];
                    style10Points[style10Counter++].style = 0;
                    style10Points[style10Counter].x = vbPoints[2 * l + 2];
                    style10Points[style10Counter].y = vbPoints[2 * l + 3];
                    style10Points[style10Counter++].style = 5;
                }
            }


            //some do not need additional processing
            switch (lineType) {
                case TacticalLines.WFG:
                case TacticalLines.WFY: {
                    break;
                }

                default: {
                    return lFlotCounter;
                }

            }
            for (j = 0; j < style10Counter; j++) {
                vbPoints2[lFlotCounter++] = new POINT2(style10Points[j]);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetFlot2Double",
                    new RendererException("Failed inside GetFlot2Double", exc));
            } else {
                throw exc;
            }
        }
        return lFlotCounter;
    }

    private static GetFlotSegment2(tg: TGLight,
        vbPoints: number[],
        segment: int,
        points: number[],
        bFlip: ref<number[]>,
        lDirection: ref<number[]>,
        lLastDirection: ref<number[]>): int {
        let nNumSegs: int = 0;
        try {
            let lineType: int = tg.get_LineType();
            let j: int = 0;
            let dDistance: double = 0;
            let m: int = 0;
            let lLocx: int = 0;
            let lLocy: int = 0;
            let lSegCounter: int = 0;
            let dAngle: double = 0;
            let arcpoints: number[] = new Array<number>(30);
            let dRemainder: double = 0;
            let dNum: double = 0;
            let dDen: double = 0;
            let dIncrement: double = 0;
            //end declarations

            switch (lineType) {
                case TacticalLines.WF:
                case TacticalLines.UWF: {
                    dIncrement = arraysupport.getScaledSize(40, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.WFG:
                case TacticalLines.WFY: {
                    dIncrement = arraysupport.getScaledSize(60, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.OCCLUDED:
                case TacticalLines.UOF: {
                    dIncrement = arraysupport.getScaledSize(50, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.SF:
                case TacticalLines.USF:
                case TacticalLines.SFG:
                case TacticalLines.SFY: {
                    dIncrement = arraysupport.getScaledSize(80, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.OFY: {
                    dIncrement = arraysupport.getScaledSize(80, tg.get_LineThickness());
                    break;
                }

                default: {
                    dIncrement = arraysupport.getScaledSize(20, tg.get_LineThickness());
                    break;
                }

            }

            lSegCounter = 0;
            if (segment === 0 && vbPoints[0] >= vbPoints[2]) {
                if (lineType !== TacticalLines.SF &&
                    lineType !== TacticalLines.USF &&
                    lineType !== TacticalLines.SFG &&
                    lineType !== TacticalLines.SFY) {
                    bFlip.value[0] = 1;//TRUE;
                }
                else {
                    bFlip.value[0] = 0;
                }
            }
            if (segment === 0 && vbPoints[0] < vbPoints[2]) {
                if (lineType !== TacticalLines.SF &&
                    lineType !== TacticalLines.USF &&
                    lineType !== TacticalLines.SFG &&
                    lineType !== TacticalLines.SFY) {
                    bFlip.value[0] = 0;//FALSE;
                } else {
                    bFlip.value[0] = 1;
                }
            }

            dNum = vbPoints[2 * segment + 3] - vbPoints[2 * segment + 1];
            dDen = vbPoints[2 * segment + 2] - vbPoints[2 * segment];

            if (dDen === 0) {
                dAngle = Math.PI / 2;
            } else {
                dAngle = Math.abs(Math.atan(dNum / dDen));
            }

            dAngle = (180 / Math.PI) * dAngle;

            if (vbPoints[2 * segment + 0] <= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] >= vbPoints[2 * segment + 3]) {
                dAngle = 90 - dAngle;
            } else {
                if (vbPoints[2 * segment + 0] <= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] <= vbPoints[2 * segment + 3]) {
                    dAngle = dAngle + 90;
                } else {
                    if (vbPoints[2 * segment + 0] >= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] <= vbPoints[2 * segment + 3]) {
                        dAngle = 270 - dAngle;
                    } else {
                        if (vbPoints[2 * segment + 0] >= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] >= vbPoints[2 * segment + 3]) {
                            dAngle = 270 + dAngle;
                        }
                    }

                }

            }



            dDistance = lineutility.CalcDistance2(vbPoints[2 * segment], vbPoints[2 * segment + 1], vbPoints[2 * segment + 2], vbPoints[2 * segment + 3]);

            nNumSegs = Math.trunc(dDistance / dIncrement);
            dRemainder = nNumSegs * dIncrement - dDistance;
            dDistance = dDistance + dRemainder;

            //calculate the default dAngle here
            //also establish the lDirection
            if (vbPoints[2 * segment] >= vbPoints[2 * segment + 2]) {
                dAngle = dAngle + 90;
                lDirection.value[0] = 1;
            } else {
                dAngle = dAngle - 90;
                lDirection.value[0] = 0;
            }


            if (segment > 0 && lDirection.value[0] !== lLastDirection.value[0]) {
                //toggle bflip if the lDirection changes
                if (bFlip.value[0] === 1) {
                    bFlip.value[0] = 0;
                } else {
                    bFlip.value[0] = 1;
                }
            }

            //flip the segment if necessary
            if (bFlip.value[0] === 1) {
                dAngle = dAngle + 180;
            }

            for (m = 0; m < nNumSegs; m++) {
                lLocx = Math.trunc(vbPoints[2 * segment] + (m + 0.5) * (vbPoints[2 * segment + 2] - vbPoints[2 * segment]) * dIncrement / dDistance);
                lLocy = Math.trunc(vbPoints[2 * segment + 1] + (m + 0.5) * (vbPoints[2 * segment + 3] - vbPoints[2 * segment + 1]) * dIncrement / dDistance);

                flot.CalcAnglePoints(lLocx, lLocy, dAngle, arcpoints, arraysupport.getScaledSize(10, tg.get_LineThickness()));

                for (j = 0; j < 30; j++) {
                    points[lSegCounter] = arcpoints[j];
                    lSegCounter = lSegCounter + 1;
                }
            }

            //save last lDirection
            lLastDirection.value[0] = lDirection.value[0];
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetFlotSegment2",
                    new RendererException("Failed inside GetFlotSegment2", exc));
            } else {
                throw exc;
            }
        }
        return nNumSegs * 10;
    }
    static GetOFYCountDouble(pLinePoints: POINT2[], interval: double, numPts: int): int {
        let lTotalpts: int = 0;
        try {
            let j: int = 0;
            let lNumSegs: int = 0;
            let lNumFlots: int = 0;
            let lNumSpikes: int = 0;
            let dDistance: double = 0;
            let nFactor: int = 7;

            //for each segment
            for (j = 0; j < numPts - 1; j++) {
                dDistance = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / interval);   //flot + spike = 60 pixels
                lNumFlots = lNumSegs;
                lNumSpikes = lNumSegs;
                if (lNumFlots < 1) {
                    lNumFlots = 1;
                }
                if (lNumSpikes < 1) {
                    lNumSpikes = 1;
                }
                lTotalpts += lNumFlots * 18; //10 points per flot + 8 per line segment,
                lTotalpts += lNumSpikes * nFactor; //3 points per spike
            }
            if (lTotalpts < (nFactor + 15) * numPts) {
                lTotalpts = 25 * numPts;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetOFYCountDoulbe",
                    new RendererException("Failed inside GetOFYCountDouble", exc));
            } else {
                throw exc;
            }
        }
        return lTotalpts;
    }

    static GetOccludedPointsDouble(tg: TGLight,
        pLinePoints: POINT2[],
        numPts: int): int {
        let nTotalCounter: int = 0;
        try {
            let lineType: int = tg.get_LineType();
            let j: int = 0;
            let k: int = 0;
            let lNumSegs: int = 0;
            let l: int = 0;
            let lNumFlots: int = 0;
            let lNumSpikes: int = 0;
            let dDistance: double = 0;
            let m: ref<number[]> = new ref();
            let lTotalPoints: int = 0;
            let points: number[];
            let pSpikePoints: POINT2[];
            let pt0: POINT2 = new POINT2();
            let tempPoint: POINT2 = new POINT2();
            let pFlotPoints: POINT2[];
            let dSpikeSize: double = arraysupport.getScaledSize(20, tg.get_LineThickness());
            let
                dIncrement: double = arraysupport.getScaledSize(50, tg.get_LineThickness());
            let vbPoints: number[];
            let nFlotCounter: int = 0;
            let nSpikeCounter: int = 0;
            let flots: number[];
            let sumOfFlots: int = 0;
            let segmentLength: double = 0;
            let spikeLength: double = 0;
            let bolTooLong: int = 0;
            let d1: double = 0;
            let d2: double = 0;
            let bolVertical: int = 0;
            let bFlip: ref<number[]> = new ref();
            let lDirection: ref<number[]> = new ref();
            let lLastDirection: ref<number[]> = new ref();

            m.value = new Array<number>(1);
            bFlip.value = new Array<number>(1);
            lDirection.value = new Array<number>(1);
            lLastDirection.value = new Array<number>(1);
            bFlip.value[0] = -1;
            lDirection.value[0] = -1;
            lLastDirection.value[0] = -1;
            lTotalPoints = flot.GetOccludedCountDouble(pLinePoints, numPts);

            vbPoints = new Array<number>(numPts * 2);

            pSpikePoints = new Array<POINT2>(3 * lTotalPoints / 13);
            pFlotPoints = new Array<POINT2>(10 * lTotalPoints / 13);
            let n: int = pSpikePoints.length;
            //for (j = 0; j < pSpikePoints.length; j++)
            for (j = 0; j < n; j++) {
                pSpikePoints[j] = new POINT2(pLinePoints[0]);
                pSpikePoints[j].style = 5;
            }
            n = pFlotPoints.length;
            //for (j = 0; j < pFlotPoints.length; j++)
            for (j = 0; j < n; j++) {
                pFlotPoints[j] = new POINT2(pLinePoints[0]);
                pFlotPoints[j].style = 5;
            }
            flots = new Array<number>(numPts + 1);
            //the vbPoints long array gets used by GetFlotSegment
            //and is based on the original points
            for (j = 0; j < numPts; j++) {
                vbPoints[k] = pLinePoints[j].x as int;
                k++;
                vbPoints[k] = pLinePoints[j].y as int;
                k++;
            }
            k = 0;
            //initialize flots
            flots[0] = 0;
            for (j = 0; j < numPts; j++) {
                flots[j + 1] = 0;
            }

            for (j = 0; j < numPts - 1; j++) {
                bolVertical = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                m.value[0] = -m.value[0];	//reverse the direction
                dDistance = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / dIncrement);   //flot(20) + spike(20) = 60 pixels
                lNumFlots = lNumSegs;
                lNumSpikes = lNumSegs;
                flots[j + 1] = lNumSegs;

                //get the flot segments for this line segment
                //flot segments are 30 pixels wide with the flots in the middle, 20 pixels wide
                k = 0;
                if (lNumFlots > 0) {
                    points = new Array<number>(lNumFlots * 30);
                    flot.GetFlotSegment2(tg, vbPoints, j, points, bFlip, lDirection, lLastDirection);
                    for (l = 0; l < lNumFlots * 10; l++) {
                        pFlotPoints[nFlotCounter].x = points[k];
                        pFlotPoints[nFlotCounter].y = points[k + 1];
                        pFlotPoints[nFlotCounter].style = 9;
                        //straighten out the flots
                        if ((nFlotCounter) % 10 === 0) {
                            d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pFlotPoints[nFlotCounter]);
                            d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pFlotPoints[nFlotCounter]);
                            if (d2 > d1) {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j + 1], pLinePoints[j], -d1);
                            }
                            else {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j], pLinePoints[j + 1], -d2);
                            }
                            pFlotPoints[nFlotCounter].style = 9;
                            if (lineType === TacticalLines.UOF) {
                                pFlotPoints[nFlotCounter].style = 0;
                            }
                        }

                        if ((nFlotCounter + 1) % 10 === 0) {
                            if (lineType === TacticalLines.OCCLUDED ||
                                lineType === TacticalLines.UOF) {
                                d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pFlotPoints[nFlotCounter - 9]);
                                d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pFlotPoints[nFlotCounter - 9]);
                                if (d2 > d1) {
                                    pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j + 1], pLinePoints[j], -d1 - dSpikeSize);
                                } else {
                                    pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j], pLinePoints[j + 1], -d2 + dSpikeSize);
                                }
                                if (lineType === TacticalLines.OCCLUDED) {
                                    pFlotPoints[nFlotCounter].style = 10;
                                }
                                if (lineType === TacticalLines.UOF) {
                                    pFlotPoints[nFlotCounter].style = 5;
                                }
                            }
                            if (lineType === TacticalLines.SF) {
                                pFlotPoints[nFlotCounter].style = 23;	//red fill
                            }
                        }
                        k += 3;
                        nFlotCounter++;
                    }
                    points = null;
                }

                //for each spike in the line segment
                //spikes segments are 30 pixels wide with the spikes in the middle, 20 pixels wide
                segmentLength = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                for (k = 0; k < lNumSpikes - 1; k++) //get the spike
                {
                    //the first spike base point
                    //has to be based on the preceding flot
                    //if the distance goes past the end of the line segment then set the point to the
                    //end of the line segment
                    bolTooLong = 0;
                    sumOfFlots = 0;
                    for (l = 0; l <= j; l++) {
                        sumOfFlots += flots[l];
                    }

                    //for the greatest accuracy
                    d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pFlotPoints[sumOfFlots * 10 + 10 * k]);
                    d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pFlotPoints[sumOfFlots * 10 + 10 * k]);
                    switch (lineType) {
                        case TacticalLines.OCCLUDED:
                        case TacticalLines.UOF: {
                            if (d2 > d1) {
                                tempPoint = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -d1 - dIncrement / 2, 0);
                            } else {
                                tempPoint = lineutility.ExtendLine2Double(pLinePoints[j], pLinePoints[j + 1], -d2 + dIncrement / 2, 0);
                            }
                            break;
                        }

                        case TacticalLines.SF: {
                            if (d2 > d1) {
                                tempPoint = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -d1 - dIncrement / 8, 0);
                            } else {
                                tempPoint = lineutility.ExtendLine2Double(pLinePoints[j], pLinePoints[j + 1], -d2 + dIncrement / 8, 0);
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    spikeLength = lineutility.CalcDistanceDouble(pLinePoints[j], tempPoint);
                    if (spikeLength + dSpikeSize < segmentLength) {
                        pSpikePoints[nSpikeCounter] = new POINT2(tempPoint);
                    } else {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        bolTooLong = 1;
                    }

                    pSpikePoints[nSpikeCounter].style = 9;
                    nSpikeCounter++;

                    //extend half the spike size from the last point
                    //do this for the accuracy of the spike point base
                    d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pSpikePoints[nSpikeCounter - 1]);
                    d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pSpikePoints[nSpikeCounter - 1]);
                    if (d1 > d2) {
                        pt0 = lineutility.ExtendLineDouble(pLinePoints[j], pSpikePoints[nSpikeCounter - 1], dSpikeSize / 2);
                    } else {
                        pt0 = lineutility.ExtendLineDouble(pLinePoints[j + 1], pSpikePoints[nSpikeCounter - 1], -dSpikeSize / 2);
                    }
                    //the spike end (perpendicular) point
                    if (bolTooLong === 0) {
                        if (bolVertical !== 0) //segment is not vertical
                        {
                            if (pLinePoints[j].x < pLinePoints[j + 1].x) {
                                pSpikePoints[nSpikeCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 2, dSpikeSize);	//extennd above the line
                            } else {
                                pSpikePoints[nSpikeCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 3, dSpikeSize);	//extend below the line
                            }
                            pSpikePoints[nSpikeCounter].style = 0;
                            nSpikeCounter++;
                        } else //vertical segment
                        {
                            if (pLinePoints[j].y > pLinePoints[j + 1].y) {
                                pSpikePoints[nSpikeCounter].x = pt0.x - dSpikeSize;
                            } else {
                                pSpikePoints[nSpikeCounter].x = pt0.x + dSpikeSize;
                            }

                            pSpikePoints[nSpikeCounter].y = pt0.y;
                            nSpikeCounter++;
                        }
                    } else //too long
                    {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        nSpikeCounter++;
                    }
                    pSpikePoints[nSpikeCounter - 1].style = 9;

                    //the second spike base point. this is the third spike point
                    if (bolTooLong === 0) {
                        d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pSpikePoints[nSpikeCounter - 2]);
                        d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pSpikePoints[nSpikeCounter - 2]);
                        if (d1 > d2) {
                            pSpikePoints[nSpikeCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nSpikeCounter - 2], dSpikeSize, 0);
                        } else {
                            pSpikePoints[nSpikeCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pSpikePoints[nSpikeCounter - 2], -dSpikeSize, 0);
                        }
                        if (lineType === TacticalLines.OCCLUDED) {
                            pSpikePoints[nSpikeCounter].style = 10;
                        }
                        if (lineType === TacticalLines.UOF) {
                            pSpikePoints[nSpikeCounter].style = 5;
                        }
                        if (lineType === TacticalLines.SF) {
                            pSpikePoints[nSpikeCounter].style = 24;
                        }
                    } else {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        pSpikePoints[nSpikeCounter].style = 5;
                    }
                    nSpikeCounter++;
                }//for k= 0 to numSpikes-1
                if (nSpikeCounter === 0) {
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                    //added 6-1-05 M. Deutch
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                } else {
                    pSpikePoints[nSpikeCounter] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    pSpikePoints[nSpikeCounter + 1] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter + 1].style = 5;
                    pSpikePoints[nSpikeCounter + 2] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter + 2].style = 5;
                    nSpikeCounter += 3;
                }
            }

            for (j = 0; j < pLinePoints.length; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[0]);
                pLinePoints[j].style = 5;
            }
            //load the spike points into the array
            nFlotCounter = 0;
            nSpikeCounter = 0;
            for (j = 0; j < lTotalPoints / 13; j++) {
                //get the flots
                for (k = 0; k < 10; k++) {
                    pLinePoints[nTotalCounter] = new POINT2(pFlotPoints[j * 10 + k]);
                    nTotalCounter++;
                    nFlotCounter++;
                }
                //get the spikes
                for (k = 0; k < 3; k++) {
                    pLinePoints[nTotalCounter] = new POINT2(pSpikePoints[j * 3 + k]);
                    nTotalCounter++;
                    nSpikeCounter++;
                }
            }
            n = pLinePoints.length;
            for (j = nTotalCounter; j < n; j++) {
                pLinePoints[j] = new POINT2(pLinePoints[nTotalCounter - 1]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetOccludedPointsDouble",
                    new RendererException("Failed inside GetOccludedPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return nTotalCounter;
    }

    static GetOccludedCountDouble(pLinePoints: POINT2[], numPts: int): int {
        let lTotalpts: int = 0;
        try {
            let j: int = 0;
            let lNumSegs: int = 0;
            let lNumFlots: int = 0;
            let lNumSpikes: int = 0;
            let dDistance: double = 0;

            //for each segment
            for (j = 0; j < numPts - 1; j++) {
                dDistance = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / 50);   //flot + spike = 60 pixels
                lNumFlots = lNumSegs;
                lNumSpikes = lNumSegs;
                if (lNumFlots < 1) {
                    lNumFlots = 1;
                }
                if (lNumSpikes < 1) {
                    lNumSpikes = 1;
                }
                lTotalpts += lNumFlots * 10; //10 points per flot,
                lTotalpts += lNumSpikes * 3; //3 points per spike
            }
            if (lTotalpts < 13 * numPts) {
                lTotalpts = 13 * numPts;
            }

            if (lTotalpts < numPts) {
                lTotalpts = numPts;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetOccludedCountDouble",
                    new RendererException("Failed inside GetOccludedCountDouble", exc));
            } else {
                throw exc;
            }
        }
        return lTotalpts;
    }

    private static CalcNewPoint(locx: int,
        locY: int,
        angle: double,
        point: number[],
        dist: double): int {
        try {
            let m: double = 0;
            let deltaX: double = 0;
            let deltaY: double = 0;
            let dx: double = 0;
            let dy: double = 0;
            let nQuadrant: int = -1;

            if (angle < 0) {
                angle = angle + 360;
            }

            if (angle > 360) {
                angle = angle - 360;
            }

            if (0 <= angle && angle <= 90) {
                nQuadrant = 0;
                angle = 90 - angle;
                angle = Math.abs(angle) * (Math.PI / 180);
            }

            if (90 < angle && angle <= 180) {
                nQuadrant = 1;
                angle = angle - 90;
                angle = Math.abs(angle) * (Math.PI / 180);
            }

            if (180 < angle && angle <= 270) {
                nQuadrant = 2;
                angle = 270 - angle;
                angle = Math.abs(angle) * (Math.PI / 180);
            }

            if (270 < angle && angle <= 360) {
                nQuadrant = 3;
                angle = angle - 270;
                angle = Math.abs(angle) * (Math.PI / 180);
            }

            m = Math.abs(Math.tan(angle));
            deltaX = Math.abs(dist / Math.sqrt(1 + m * m));
            deltaY = Math.abs(m * deltaX);

            switch (nQuadrant) {
                case 0: {
                    dx = locx + deltaX;
                    dy = locY - deltaY;
                    break;
                }

                case 1: {
                    dx = locx + deltaX;
                    dy = locY + deltaY;
                    break;
                }

                case 2: {
                    dx = locx - deltaX;
                    dy = locY + deltaY;
                    break;
                }

                case 3: {
                    dx = locx - deltaX;
                    dy = locY - deltaY;
                    break;
                }

                default: {
                    break;
                }

            }

            point[0] = dx as int;
            point[1] = dy as int;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "CalcNewPoint",
                    new RendererException("Failed inside CalcNewPoint", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }
    /**
     * Calculates points for a flot segment. Assumes the caller allocated the points array
     * @param vbPoints the client points
     * @param segment the segment index
     * @param points the returned points
     * @return the number of points
     */
    private static GetFlotSegment(vbPoints: number[],
        segment: int,
        points: number[] | null,
        flotDiameter: double,
        bFlip: ref<number[]>,
        lDirection: ref<number[]>,
        lLastDirection: ref<number[]>): int {
        let nNumSegs: int = 0;
        try {
            let j: int = 0;
            let dDistance: double = 0;
            let m: int = 0;
            let lLocx: int = 0;
            let lLocy: int = 0;
            let lSegCounter: int = 0;
            let dAngle: double = 0;
            let arcPoints: number[] = new Array<number>(30);
            let dRemainder: double = 0;
            let dNum: double = 0;
            let dDen: double = 0;
            //end declarations
            lSegCounter = 0;
            if (segment === 0 && vbPoints[0] >= vbPoints[2]) {
                bFlip.value[0] = 1;//TRUE;
            }
            if (segment === 0 && vbPoints[0] < vbPoints[2]) {
                bFlip.value[0] = 0;//FALSE;
            }

            dNum = vbPoints[2 * segment + 3] - vbPoints[2 * segment + 1];
            dDen = vbPoints[2 * segment + 2] - vbPoints[2 * segment];

            //for some reason this did not blow up before I put the if/else
            //instead it would assign pi/2 to dAngle when dDen=0
            if (dDen === 0) {
                dAngle = Math.PI / 2;

            } else {
                dAngle = Math.abs(Math.atan(dNum / dDen));

                //convert to degrees

            }
            dAngle = (180 / Math.PI) * dAngle;

            if (vbPoints[2 * segment + 0] <= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] >= vbPoints[2 * segment + 3]) {
                dAngle = 90 - dAngle;
            } else {
                if (vbPoints[2 * segment + 0] <= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] <= vbPoints[2 * segment + 3]) {
                    dAngle = dAngle + 90;
                } else {
                    if (vbPoints[2 * segment + 0] >= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] <= vbPoints[2 * segment + 3]) {
                        dAngle = 270 - dAngle;
                    } else {
                        if (vbPoints[2 * segment + 0] >= vbPoints[2 * segment + 2] && vbPoints[2 * segment + 1] >= vbPoints[2 * segment + 3]) {
                            dAngle = 270 + dAngle;
                        }
                    }

                }

            }


            dDistance = lineutility.CalcDistance2(vbPoints[2 * segment], vbPoints[2 * segment + 1], vbPoints[2 * segment + 2], vbPoints[2 * segment + 3]);

            nNumSegs = Math.trunc(dDistance / flotDiameter);

            dRemainder = nNumSegs * flotDiameter - dDistance;
            dDistance = dDistance + dRemainder;

            //calculate the default dAngle here
            //also establish the lDirection
            if (vbPoints[2 * segment] >= vbPoints[2 * segment + 2]) {
                dAngle = dAngle + 90;
                lDirection.value[0] = 1;
            } else {
                dAngle = dAngle - 90;
                lDirection.value[0] = 0;
            }

            if (segment > 0 && lDirection.value[0] !== lLastDirection.value[0]) {
                //'toggle bflip if the lDirection changes
                if (bFlip.value[0] === 1) {
                    bFlip.value[0] = 0;

                } else {
                    bFlip.value[0] = 1;

                }
            }

            //'flip the segment if necessary
            if (bFlip.value[0] === 1) {
                dAngle = dAngle + 180;


            }
            for (m = 0; m < nNumSegs; m++) {
                lLocx = Math.trunc(vbPoints[2 * segment] + (m + 0.5) * (vbPoints[2 * segment + 2] - vbPoints[2 * segment]) * flotDiameter / dDistance);
                lLocy = Math.trunc(vbPoints[2 * segment + 1] + (m + 0.5) * (vbPoints[2 * segment + 3] - vbPoints[2 * segment + 1]) * flotDiameter / dDistance);

                flot.CalcAnglePoints(lLocx, lLocy, dAngle, arcPoints, dDistance / (nNumSegs * 2));

                //9-12-12
                //points were set to null by the caller if the segment distance was too short
                //in which case GetflotSegment still must be called to set bFlip, lDirection, lLastDirection
                if (points != null) {
                    for (j = 0; j < 30; j++) {
                        points[lSegCounter] = arcPoints[j];
                        lSegCounter = lSegCounter + 1;
                    }
                }
            }

            //save last lDirection
            lLastDirection.value[0] = lDirection.value[0];
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetFlotSegment",
                    new RendererException("Failed inside GetFlotSegment", exc));
            } else {
                throw exc;
            }
        }
        return nNumSegs * 10;
    }
    /**
     * Calculates the points for FLOT, LC
     * @param vbPoints2 OUT the clinet points also used for the return points
     * @param numPts
     * @return
     */
    static GetFlotDouble(vbPoints2: POINT2[], flotDiameter: double, numPts: int): int {
        let lFlotCounter: int = 0;
        try {
            let bFlip: ref<number[]> = new ref(); bFlip.value = new Array<number>(1); bFlip.value[0] = -1;   //-1
            let lDirection: ref<number[]> = new ref(); lDirection.value = new Array<number>(1); lDirection.value[0] = -1;//-1;
            let lLastDirection: ref<number[]> = new ref(); lLastDirection.value = new Array<number>(1); lLastDirection.value[0] = -1;//-1;
            let j: int = 0;
            let k: int = 0;
            let l: int = 0;
            let m: int = 0;
            let x1: int = 0;
            let y1: int = 0;
            let numSegPts: int = -1;
            let z: int = 0;
            let lFlotCount: int = 0;
            let lNumSegs: int = 0;
            let dDistance: double = 0;
            let vbPoints: number[];
            let points: number[] | null;

            lFlotCount = flot.GetFlotCountDouble(vbPoints2, flotDiameter, numPts);

            vbPoints = new Array<number>(2 * numPts);
            //lineutility.BoundPoints(ref vbPoints2,numPts,ref segments);
            //BoundPoints returns a segments array of booleans
            //which determines whether each segment should be drawn

            for (j = 0; j < numPts; j++) {
                vbPoints[k] = vbPoints2[j].x as int;
                k++;
                vbPoints[k] = vbPoints2[j].y as int;
                k++;
            }
            k = 0;
            //assume caller has dimensioned flotpoints

            //every lSegment has 2 points
            for (l = 0; l < numPts - 1; l++) {
                dDistance = lineutility.CalcDistance2(vbPoints[m], vbPoints[m + 1], vbPoints[m + 2], vbPoints[m + 3]);
                m += 2;
                lNumSegs = Math.trunc(dDistance / flotDiameter);
                if (lNumSegs > 0) {
                    points = new Array<number>(lNumSegs * 30);
                    numSegPts = flot.GetFlotSegment(vbPoints, l, points, flotDiameter, bFlip, lDirection, lLastDirection);
                    for (j = 0; j < numSegPts; j++) {
                        x1 = points[k];
                        y1 = points[k + 1];
                        z = points[k + 2];
                        k = k + 3;
                        if (lFlotCounter < lFlotCount) {
                            vbPoints2[lFlotCounter].x = x1;
                            vbPoints2[lFlotCounter].y = y1;
                            lFlotCounter++;
                        }
                    }
                    k = 0;
                    points = null;
                }
                else {
                    ///added section 9-12-12
                    //these points are not used but bFlip, lDirection, lLastDirection
                    //must be maintained between segments
                    points = null;
                    numSegPts = flot.GetFlotSegment(vbPoints, l, points, flotDiameter, bFlip, lDirection, lLastDirection);
                    //end section
                    if (lFlotCounter < lFlotCount) {
                        vbPoints2[lFlotCounter].x = vbPoints[2 * l];
                        vbPoints2[lFlotCounter].y = vbPoints[2 * l + 1];
                        lFlotCounter++;
                    }
                }
            }
            let n: int = vbPoints2.length;
            for (j = lFlotCounter - 1; j < n; j++) {
                vbPoints2[j].style = 5;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetFlotDouble",
                    new RendererException("Failed inside GetFlotDouble", exc));
            } else {
                throw exc;
            }
        }
        return lFlotCounter;
    }

    private static CalcAnglePoints(locx: int,
        locY: int,
        angle: double,
        points: number[],
        dist: double): int {
        try {
            let j: int = 0;
            let k: int = 0;
            let lTemp: number[] = new Array<number>(2);

            for (j = 0; j < 10; j++) {
                flot.CalcNewPoint(locx, locY, angle - 90 + 20 * j, lTemp, dist);
                points[k] = lTemp[0];
                points[k + 1] = lTemp[1];

                k += 3;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "CalcAnglePoints",
                    new RendererException("Failed inside CalcAnglePoints", exc));
            } else {
                throw exc;
            }
        }
        return 1;
    }
    /**
     * Calculates the number of points required for a flot
     * @param vbPoints the clinet points
     * @param numPts the number of client points
     * @return the number of points required
     */
    static GetFlotCountDouble(vbPoints: POINT2[], flotDiameter: double, numPts: int): int {
        let lTotalpts: int = 0;
        try {
            let j: int = 0;
            let lNumSegs: int = 0;
            let dDistance: double = 0;
            let vbPoints2: POINT2[];

            vbPoints2 = new Array<POINT2>(numPts);
            for (j = 0; j < numPts; j++) {
                vbPoints2[j] = vbPoints[j];
            }
            for (j = 0; j < numPts - 1; j++) {
                dDistance = lineutility.CalcDistanceDouble(vbPoints2[j], vbPoints2[j + 1]);
                lNumSegs = Math.trunc(dDistance / flotDiameter);
                if (lNumSegs > 0) {
                    lTotalpts += lNumSegs * 10; //10 points per flot
                } else {
                    lTotalpts += 1;
                }
            }
            lTotalpts += 1;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetFlotCountDouble",
                    new RendererException("Failed inside GetFlotCountDouble", exc));
            } else {
                throw exc;
            }
        }
        return (lTotalpts);
    }

    static GetOFYPointsDouble(tg: TGLight,
        pLinePoints: POINT2[],
        numPts: int): int {
        let nTotalCounter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let lNumSegs: int = 0;
            let l: int = 0;
            let lNumFlots: int = 0;
            let lNumSpikes: int = 0;
            let dDistance: double = 0;
            let m: ref<number[]> = new ref();
            let lTotalPoints: int = 0;
            let points: number[];
            let pSpikePoints: POINT2[];
            let pt0: POINT2 = new POINT2();
            let tempPoint: POINT2 = new POINT2();
            let pFlotPoints: POINT2[];
            let pSegmentPoints: POINT2[];
            let dSpikeSize: double = arraysupport.getScaledSize(20, tg.get_LineThickness());
            let dIncrement: double = arraysupport.getScaledSize(80, tg.get_LineThickness());	//was 70
            let vbPoints: number[];
            let nFlotCounter: int = 0;
            let nSpikeCounter: int = 0;
            let nSegmentCounter: int = 0;
            let flots: number[];
            let segmentLength: double = 0;
            let spikeLength: double = 0;
            let bolTooLong: int = 0;
            let d1: double = 0;
            let d2: double = 0;
            let bolVertical: int = 0;
            let pFlotStart: POINT2[];
            let pFlotEnd: POINT2[];
            let pSpikeStart: POINT2[];
            let pSpikeEnd: POINT2[];
            let nSpikeEndCounter: int = 0;
            let nFlotEndCounter: int = 0;
            let bFlip: ref<number[]> = new ref();
            let lDirection: ref<number[]> = new ref();
            let lLastDirection: ref<number[]> = new ref();

            m.value = new Array<number>(1);
            bFlip.value = new Array<number>(1);
            lDirection.value = new Array<number>(1);
            lLastDirection.value = new Array<number>(1);
            lTotalPoints = flot.GetOFYCountDouble(pLinePoints, dIncrement, numPts);

            vbPoints = new Array<number>(numPts * 2);

            pSpikePoints = new Array<POINT2>(lTotalPoints);
            pFlotPoints = new Array<POINT2>(lTotalPoints);
            pSegmentPoints = new Array<POINT2>(lTotalPoints);
            let n: int = pSpikePoints.length;
            //for (j = 0; j < pSpikePoints.length; j++) 
            for (j = 0; j < n; j++) {
                pSpikePoints[j] = new POINT2(pLinePoints[0]);
                pSpikePoints[j].style = 5;
            }
            n = pFlotPoints.length;
            //for (j = 0; j < pFlotPoints.length; j++) 
            for (j = 0; j < n; j++) {
                pFlotPoints[j] = new POINT2(pLinePoints[0]);
                pFlotPoints[j].style = 5;
            }
            lineutility.InitializePOINT2Array(pSegmentPoints);

            flots = new Array<number>(numPts + 1);
            //the vbPoints long array gets used by GetFlotSegment
            //and is based on the original points
            for (j = 0; j < numPts; j++) {
                vbPoints[k] = pLinePoints[j].x as int;
                k++;
                vbPoints[k] = pLinePoints[j].y as int;
                k++;
            }
            k = 0;
            //initialize flots
            flots[0] = 0;
            for (j = 0; j < numPts; j++) {
                flots[j + 1] = 0;
            }

            for (j = 0; j < numPts - 1; j++) {
                //initialize spike end counter and flot end counter for each segment
                nSpikeEndCounter = 0;
                nFlotEndCounter = 0;
                bolVertical = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                m.value[0] = -m.value[0];	//reverse the direction
                dDistance = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / dIncrement);   //flot(20) + spike(20) = 60 pixels
                lNumFlots = lNumSegs;
                lNumSpikes = lNumSegs;
                flots[j + 1] = lNumSegs;

                //get the flot segments for this line segment
                //flot segments are 30 pixels wide with the flots in the middle, 20 pixels wide
                k = 0;
                if (lNumFlots > 0) {
                    points = new Array<number>(lNumFlots * 30);
                    pFlotStart = new Array<POINT2>(lNumFlots);
                    pFlotEnd = new Array<POINT2>(lNumFlots);
                    flot.GetFlotSegment2(tg, vbPoints, j, points, bFlip, lDirection, lLastDirection);
                    for (l = 0; l < lNumFlots * 10; l++) {
                        pFlotPoints[nFlotCounter].x = points[k];
                        pFlotPoints[nFlotCounter].y = points[k + 1];
                        pFlotPoints[nFlotCounter].style = 9;
                        //straighten out the flots
                        if ((nFlotCounter) % 10 === 0) {
                            pFlotStart[Math.trunc(l / 10)] = new POINT2(pFlotPoints[nFlotCounter]);
                            d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pFlotPoints[nFlotCounter]);
                            d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pFlotPoints[nFlotCounter]);
                            if (d2 > d1) {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j + 1], pLinePoints[j], -d1);
                            } else {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j], pLinePoints[j + 1], -d2);
                            }
                            pFlotPoints[nFlotCounter].style = 9;
                        }
                        if ((nFlotCounter + 1) % 10 === 0) {
                            pFlotEnd[Math.trunc(l / 10)] = new POINT2(pFlotPoints[nFlotCounter]);
                            nFlotEndCounter++;
                            d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pFlotPoints[nFlotCounter - 9]);
                            d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pFlotPoints[nFlotCounter - 9]);
                            if (d2 > d1) {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j + 1], pLinePoints[j], -d1 - dSpikeSize);
                            } else {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j], pLinePoints[j + 1], -d2 + dSpikeSize);
                            }

                            pFlotPoints[nFlotCounter].style = 10;
                        }
                        k += 3;
                        nFlotCounter++;
                    }
                    points = null;
                }// end if num flots>0
                else //segment too short
                {
                    pSegmentPoints[nSegmentCounter] = new POINT2(pLinePoints[j]);
                    pSegmentPoints[nSegmentCounter++].style = 0;
                    pSegmentPoints[nSegmentCounter] = new POINT2(pLinePoints[j + 1]);
                    pSegmentPoints[nSegmentCounter++].style = 5;
                }

                //for each spike in the line segment
                //spikes segments are 30 pixels wide with the spikes in the middle, 20 pixels wide
                segmentLength = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                pSpikeStart = new Array<POINT2>(lNumSpikes);
                pSpikeEnd = new Array<POINT2>(lNumSpikes);
                for (k = 0; k < lNumSpikes - 1; k++) //get the spike
                {
                    //the first spike base point
                    //has to be based on the preceding flot
                    //if the distance goes past the end of the line segment then set the point to the
                    //end of the line segment
                    bolTooLong = 0;

                    //for the greatest accuracy
                    d1 = lineutility.CalcDistanceDouble(pFlotEnd[k], pFlotEnd[k + 1]);
                    d1 = d1 / 2 - dSpikeSize;
                    tempPoint = lineutility.ExtendAlongLineDouble(pFlotEnd[k], pLinePoints[j + 1], d1, 0);
                    spikeLength = lineutility.CalcDistanceDouble(pLinePoints[j], tempPoint);
                    if (spikeLength + dSpikeSize < segmentLength) {
                        pSpikePoints[nSpikeCounter] = new POINT2(tempPoint);
                        pSpikeStart[k] = new POINT2(tempPoint);
                    } else {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        bolTooLong = 1;
                    }

                    pSpikePoints[nSpikeCounter].style = 9;
                    nSpikeCounter++;

                    pt0 = lineutility.ExtendAlongLineDouble(pSpikePoints[nSpikeCounter - 1], pLinePoints[j + 1], dSpikeSize / 2);

                    //the spike end (perpendicular) point
                    if (bolTooLong === 0) {
                        if (bolVertical !== 0) //segment is not vertical
                        {
                            if (pLinePoints[j].x < pLinePoints[j + 1].x) {
                                pSpikePoints[nSpikeCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 2, dSpikeSize);	//extennd above the line
                            } else {
                                pSpikePoints[nSpikeCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 3, dSpikeSize);	//extend below the line
                            }
                            pSpikePoints[nSpikeCounter].style = 0;
                            nSpikeCounter++;
                        } else //vertical segment
                        {
                            if (pLinePoints[j].y > pLinePoints[j + 1].y) {
                                pSpikePoints[nSpikeCounter].x = pt0.x - dSpikeSize;
                            } else {
                                pSpikePoints[nSpikeCounter].x = pt0.x + dSpikeSize;
                            }

                            pSpikePoints[nSpikeCounter].y = pt0.y;
                            nSpikeCounter++;
                        }
                    } else //too long
                    {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        nSpikeCounter++;
                    }
                    pSpikePoints[nSpikeCounter - 1].style = 9;

                    //the second spike base point. this is the third spike point
                    if (bolTooLong === 0) {
                        d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pSpikePoints[nSpikeCounter - 2]);
                        d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pSpikePoints[nSpikeCounter - 2]);
                        if (d1 > d2) {
                            pSpikePoints[nSpikeCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nSpikeCounter - 2], dSpikeSize, 0);
                        } else {
                            pSpikePoints[nSpikeCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pSpikePoints[nSpikeCounter - 2], -dSpikeSize, 0);
                        }

                        pSpikeEnd[k] = new POINT2(pSpikePoints[nSpikeCounter]);
                        nSpikeEndCounter++;
                        pSpikePoints[nSpikeCounter].style = 10;
                    } else {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        pSpikePoints[nSpikeCounter].style = 5;
                    }
                    nSpikeCounter++;
                }//end for k= 0 to numSpikes-1
                //if there are no spikes
                if (nSpikeEndCounter === 0 && nFlotEndCounter === 1) {
                    pSegmentPoints[nSegmentCounter] = new POINT2(pLinePoints[j]);
                    pSegmentPoints[nSegmentCounter++].style = 0;
                    pSegmentPoints[nSegmentCounter] = new POINT2(pFlotStart[0]);
                    pSegmentPoints[nSegmentCounter++].style = 5;

                    pSegmentPoints[nSegmentCounter] = new POINT2(pLinePoints[j + 1]);
                    pSegmentPoints[nSegmentCounter++].style = 0;
                    pSegmentPoints[nSegmentCounter] = new POINT2(pFlotEnd[0]);
                    pSegmentPoints[nSegmentCounter++].style = 5;
                }
                //put a loop here for the segment points
                for (l = 0; l < nSpikeEndCounter; l++) {
                    if (l === 0) {
                        pSegmentPoints[nSegmentCounter] = new POINT2(pLinePoints[j]);
                        pSegmentPoints[nSegmentCounter++].style = 0;
                        pSegmentPoints[nSegmentCounter] = new POINT2(pFlotStart[0]);
                        pSegmentPoints[nSegmentCounter++].style = 5;
                    }
                    if (l === nSpikeEndCounter - 1) //the last spike
                    {
                        pSegmentPoints[nSegmentCounter] = new POINT2(pLinePoints[j + 1]);
                        pSegmentPoints[nSegmentCounter++].style = 0;
                        pSegmentPoints[nSegmentCounter] = new POINT2(pFlotEnd[l + 1]);
                        pSegmentPoints[nSegmentCounter++].style = 5;
                    }
                    //put the cross point segments between the flots and spikes
                    //segment before the spike is just a line
                    pSegmentPoints[nSegmentCounter] = new POINT2(pSpikeEnd[l]);
                    pSegmentPoints[nSegmentCounter++].style = 0;
                    pSegmentPoints[nSegmentCounter] = new POINT2(pFlotStart[l + 1]);
                    pSegmentPoints[nSegmentCounter++].style = 5;

                    //the cross points
                    d1 = lineutility.CalcDistanceDouble(pSpikeStart[l], pFlotEnd[l]);
                    pSegmentPoints[nSegmentCounter++] = lineutility.ExtendAlongLineDouble(pSpikeStart[l], pLinePoints[j], d1 / 3, 0);
                    pSegmentPoints[nSegmentCounter++] = lineutility.ExtendAlongLineDouble(pSpikeStart[l], pLinePoints[j], 2 * d1 / 3, 5);
                    tempPoint = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pSegmentPoints[nSegmentCounter - 2], 2, arraysupport.getScaledSize(5, tg.get_LineThickness()), 0);
                    pSegmentPoints[nSegmentCounter++] = new POINT2(tempPoint);
                    tempPoint = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pSegmentPoints[nSegmentCounter - 2], 3, arraysupport.getScaledSize(5, tg.get_LineThickness()), 5);
                    pSegmentPoints[nSegmentCounter++] = new POINT2(tempPoint);
                }
                if (nSpikeCounter === 0) {
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                } else {
                    pSpikePoints[nSpikeCounter] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    pSpikePoints[nSpikeCounter + 1] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter + 1].style = 5;
                    pSpikePoints[nSpikeCounter + 2] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter + 2].style = 5;
                    nSpikeCounter += 3;
                }
            }

            //load the spike points into the array
            nTotalCounter = 0;
            for (j = 0; j < nFlotCounter; j++) {
                pLinePoints[nTotalCounter++] = new POINT2(pFlotPoints[j]);
            }
            for (j = 0; j < nSpikeCounter; j++) {
                pLinePoints[nTotalCounter++] = new POINT2(pSpikePoints[j]);
            }
            for (j = 0; j < nSegmentCounter; j++) {
                pLinePoints[nTotalCounter++] = new POINT2(pSegmentPoints[j]);
            }
            n = pLinePoints.length;
            //for (j = nTotalCounter; j < pLinePoints.length; j++) 
            for (j = nTotalCounter; j < n; j++) {
                pLinePoints[j] = new POINT2(pLinePoints[nTotalCounter - 1]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetOFYPointsDouble",
                    new RendererException("Failed inside GetOFYPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return nTotalCounter;
    }
    static GetSFPointsDouble(tg: TGLight,
        pLinePoints: POINT2[],
        numPts: int): int {
        let nTotalCounter: int = 0;
        try {
            let lineType: int = tg.get_LineType();
            let lTotalPoints: int = 0;
            let j: int = 0;
            let k: int = 0;
            let lNumSegs: int = 0;
            let l: int = 0;
            let lNumFlots: int = 0;
            let lNumSpikes: int = 0;
            let dDistance: double = 0;
            let m: ref<number[]> = new ref();
            let points: number[];
            let pSpikePoints: POINT2[];
            let pt0: POINT2 = new POINT2();
            let tempPoint: POINT2 = new POINT2();
            let pFlotPoints: POINT2[];
            let dSpikeSize: double = arraysupport.getScaledSize(20, tg.get_LineThickness());
            let
                dIncrement: double = arraysupport.getScaledSize(80, tg.get_LineThickness());
            let vbPoints: number[];
            let nFlotCounter: int = 0;
            let nSpikeCounter: int = 0;
            let nSegCounter: int = 0;
            let flots: number[];
            //int sumOfFlots = 0;
            let segmentLength: double = 0;
            let spikeLength: double = 0;
            let bolTooLong: int = 0;
            let d1: double = 0;
            let d2: double = 0;
            let bolVertical: int = 0;
            let pFlotStart: POINT2[];
            let pFlotEnd: POINT2[];
            let pSpikeStart: POINT2[];
            let pSpikeEnd: POINT2[];
            let pSegPoints: POINT2[];
            let bFlip: ref<number[]> = new ref();
            let lDirection: ref<number[]> = new ref();
            let lLastDirection: ref<number[]> = new ref();

            lTotalPoints = flot.GetSFCountDouble(pLinePoints, numPts);
            m.value = new Array<number>(1);
            lDirection.value = new Array<number>(1);
            lDirection.value[0] = -1;
            lLastDirection.value = new Array<number>(1);
            lLastDirection.value[0] = -1;
            bFlip.value = new Array<number>(1);
            bFlip.value[0] = -1;

            vbPoints = new Array<number>(numPts * 2);
            pSpikePoints = new Array<POINT2>(lTotalPoints);
            pFlotPoints = new Array<POINT2>(lTotalPoints);
            let n: int = pSpikePoints.length;
            //for (j = 0; j < pSpikePoints.length; j++) 
            for (j = 0; j < n; j++) {
                pSpikePoints[j] = new POINT2(pLinePoints[0]);
                pSpikePoints[j].style = 5;
            }
            n = pFlotPoints.length;
            //for (j = 0; j < pFlotPoints.length; j++) 
            for (j = 0; j < n; j++) {
                pFlotPoints[j] = new POINT2(pLinePoints[0]);
                pFlotPoints[j].style = 5;
            }
            pSegPoints = new Array<POINT2>(4 * (numPts - 1));
            lineutility.InitializePOINT2Array(pSegPoints);

            flots = new Array<number>(numPts + 1);
            //the vbPoints long array gets used by GetFlotSegment
            //and is based on the original points
            //for(j=0;j<numPts;j++)
            for (j = 0; j < numPts; j++) {
                vbPoints[k] = pLinePoints[j].x as int;
                k++;
                vbPoints[k] = pLinePoints[j].y as int;
                k++;
            }
            k = 0;
            //initialize flots
            flots[0] = 0;
            for (j = 0; j < numPts; j++) {
                flots[j + 1] = 0;
            }

            for (j = 0; j < numPts - 1; j++) {
                bolVertical = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                m.value[0] = -m.value[0];	//reverse the direction
                dDistance = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / dIncrement);
                lNumFlots = lNumSegs;
                lNumSpikes = lNumSegs;
                flots[j + 1] = lNumSegs;

                //get the flot segments for this line segment
                //flot segments are 30 pixels wide with the flots in the middle, 20 pixels wide
                k = 0;
                if (lNumFlots > 0) {
                    points = new Array<number>(lNumFlots * 30);
                    pFlotStart = new Array<POINT2>(lNumFlots);
                    lineutility.InitializePOINT2Array(pFlotStart);
                    pFlotEnd = new Array<POINT2>(lNumFlots);
                    lineutility.InitializePOINT2Array(pFlotEnd);
                    flot.GetFlotSegment2(tg, vbPoints, j, points, bFlip, lDirection, lLastDirection);
                    for (l = 0; l < lNumFlots * 10; l++) {
                        pFlotPoints[nFlotCounter].x = points[k];
                        pFlotPoints[nFlotCounter].y = points[k + 1];

                        if (lineType === TacticalLines.USF || lineType === TacticalLines.SF) {
                            pFlotPoints[nFlotCounter].style = 19;
                        } else {
                            pFlotPoints[nFlotCounter].style = 9;
                        }

                        //straighten out the flots
                        if ((nFlotCounter) % 10 === 0) {
                            pFlotStart[Math.trunc(l / 10)] = pFlotPoints[nFlotCounter];
                            d1 = lineutility.CalcDistanceDouble(pLinePoints[j], pFlotPoints[nFlotCounter]);
                            d2 = lineutility.CalcDistanceDouble(pLinePoints[j + 1], pFlotPoints[nFlotCounter]);
                            if (d2 > d1) {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j + 1], pLinePoints[j], -d1);
                            } else {
                                pFlotPoints[nFlotCounter] = lineutility.ExtendLineDouble(pLinePoints[j], pLinePoints[j + 1], -d2);
                            }

                            if (lineType === TacticalLines.USF || lineType === TacticalLines.SF) {
                                pFlotPoints[nFlotCounter].style = 19;
                            } else {
                                pFlotPoints[nFlotCounter].style = 9;
                            }
                        }

                        if ((nFlotCounter + 1) % 10 === 0) {
                            if (lineType === TacticalLines.USF || lineType === TacticalLines.SF) {
                                pFlotPoints[nFlotCounter].style = 5;	//end of flot
                            } else {
                                pFlotPoints[nFlotCounter].style = 23;	//red fill
                            }
                            pFlotEnd[Math.trunc(l / 10)] = new POINT2(pFlotPoints[nFlotCounter]);
                        }
                        if (l === 0) {
                            pSegPoints[nSegCounter] = new POINT2(pLinePoints[j]);
                            pSegPoints[nSegCounter++].style = 19;
                            pSegPoints[nSegCounter] = new POINT2(pFlotStart[l]);
                            pSegPoints[nSegCounter++].style = 5;
                        }
                        if (l === lNumFlots * 10 - 1) {
                            pSegPoints[nSegCounter] = new POINT2(pLinePoints[j + 1]);
                            pSegPoints[nSegCounter++].style = 19;
                            pSegPoints[nSegCounter] = new POINT2(pFlotStart[Math.trunc(l / 10)]);
                            pSegPoints[nSegCounter++].style = 5;
                        }
                        k += 3;
                        nFlotCounter++;
                    }
                    points = null;
                }//end if num flots>0
                else //segment too short
                {
                    pSegPoints[nSegCounter] = new POINT2(pLinePoints[j]);
                    pSegPoints[nSegCounter++].style = 0;
                    pSegPoints[nSegCounter] = new POINT2(pLinePoints[j + 1]);
                    pSegPoints[nSegCounter++].style = 5;
                }

                //for each spike in the line segment
                //spikes segments are 30 pixels wide with the spikes in the middle, 20 pixels wide
                segmentLength = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                pSpikeStart = new Array<POINT2>(lNumSpikes);
                lineutility.InitializePOINT2Array(pSpikeStart);
                pSpikeEnd = new Array<POINT2>(lNumSpikes);
                lineutility.InitializePOINT2Array(pSpikeEnd);
                for (k = 0; k < lNumSpikes - 1; k++) //get the spike
                {
                    //the first spike base point
                    //has to be based on the preceding flot
                    //if the distance goes past the end of the line segment then set the point to the
                    //end of the line segment
                    bolTooLong = 0;

                    d1 = lineutility.CalcDistanceDouble(pFlotStart[k], pFlotStart[k + 1]);
                    d1 = d1 / 2 - dSpikeSize;
                    tempPoint = lineutility.ExtendAlongLineDouble(pFlotStart[k], pLinePoints[j + 1], d1, 0);

                    spikeLength = lineutility.CalcDistanceDouble(pLinePoints[j], tempPoint);
                    if (spikeLength + dSpikeSize < segmentLength) {
                        pSpikePoints[nSpikeCounter] = new POINT2(tempPoint);
                        pSpikeStart[k] = new POINT2(tempPoint);
                    } else {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        bolTooLong = 1;
                    }

                    if (lineType === TacticalLines.USF || lineType === TacticalLines.SF) {
                        pSpikePoints[nSpikeCounter].style = 25;
                    } else {
                        pSpikePoints[nSpikeCounter].style = 9;
                    }

                    nSpikeCounter++;

                    pt0 = lineutility.ExtendAlongLineDouble(pSpikePoints[nSpikeCounter - 1], pLinePoints[j + 1], dSpikeSize / 2);
                    //the spike end (perpendicular) point
                    if (bolTooLong === 0) {
                        if (bolVertical !== 0) //segment is not vertical
                        {
                            if (pLinePoints[j].x < pLinePoints[j + 1].x) {
                                pSpikePoints[nSpikeCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 2, dSpikeSize);	//extennd above the line
                            } else {
                                pSpikePoints[nSpikeCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 3, dSpikeSize);	//extend below the line
                            }
                            pSpikePoints[nSpikeCounter].style = 0;
                            //pSpikeEnd[k]=pSpikePoints[nSpikeCounter];
                            nSpikeCounter++;
                        } else //vertical segment
                        {
                            if (pLinePoints[j].y > pLinePoints[j + 1].y) {
                                pSpikePoints[nSpikeCounter].x = pt0.x - dSpikeSize;
                            } else {
                                pSpikePoints[nSpikeCounter].x = pt0.x + dSpikeSize;
                            }

                            pSpikePoints[nSpikeCounter].y = pt0.y;
                            nSpikeCounter++;
                        }
                    } else //too long
                    {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        nSpikeCounter++;
                    }

                    if (lineType === TacticalLines.USF || lineType === TacticalLines.SF) {
                        pSpikePoints[nSpikeCounter - 1].style = 25;
                    } else {
                        pSpikePoints[nSpikeCounter - 1].style = 9;
                    }

                    //the second spike base point. this is the third spike point
                    if (bolTooLong === 0) {
                        pSpikePoints[nSpikeCounter] = lineutility.ExtendAlongLineDouble(pSpikePoints[nSpikeCounter - 2], pLinePoints[j + 1], dSpikeSize);

                        if (lineType === TacticalLines.USF || lineType === TacticalLines.SF) {
                            pSpikePoints[nSpikeCounter].style = 5;
                        } else {
                            pSpikePoints[nSpikeCounter].style = 24;
                        }

                        pSpikeEnd[k] = new POINT2(pSpikePoints[nSpikeCounter]);
                    } else {
                        pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                        pSpikePoints[nSpikeCounter].style = 5;
                    }
                    nSpikeCounter++;
                    //the segment feature points, for SF they are just lines
                    if (lineType === TacticalLines.SF ||
                        lineType === TacticalLines.USF) {
                        d1 = lineutility.CalcDistanceDouble(pFlotStart[k], pSpikeStart[k]);
                        pSpikePoints[nSpikeCounter] = new POINT2(pFlotStart[k]);
                        pSpikePoints[nSpikeCounter++].style = 19;
                        pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pFlotStart[k], pLinePoints[j + 1], d1 / 2, 5);

                        pSpikePoints[nSpikeCounter] = new POINT2(pFlotEnd[k]);
                        pSpikePoints[nSpikeCounter++].style = 19;
                        pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pFlotEnd[k], pLinePoints[j], d1 / 2, 5);

                        if (k === lNumSpikes - 2) {
                            pSpikePoints[nSpikeCounter] = new POINT2(pFlotStart[k + 1]);
                            pSpikePoints[nSpikeCounter++].style = 19;
                            pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pFlotStart[k + 1], pLinePoints[j + 1], d1 / 2, 5);

                            pSpikePoints[nSpikeCounter] = new POINT2(pFlotEnd[k + 1]);
                            pSpikePoints[nSpikeCounter++].style = 19;
                            pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pFlotEnd[k + 1], pLinePoints[j], d1 / 2, 5);

                        }

                        pSpikePoints[nSpikeCounter] = new POINT2(pSpikeStart[k]);
                        pSpikePoints[nSpikeCounter++].style = 25;
                        pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pSpikeStart[k], pLinePoints[j], d1 / 2, 5);

                        pSpikePoints[nSpikeCounter] = new POINT2(pSpikeEnd[k]);
                        pSpikePoints[nSpikeCounter++].style = 25;
                        pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pSpikeEnd[k], pLinePoints[j + 1], d1 / 2, 5);

                        if (lineType === TacticalLines.USF) {
                            pSpikePoints[nSpikeCounter] = new POINT2(pFlotEnd[k]);
                            pSpikePoints[nSpikeCounter++].style = 19;
                            pSpikePoints[nSpikeCounter] = new POINT2(pFlotStart[k]);
                            pSpikePoints[nSpikeCounter++].style = 5;

                            if (k === lNumSpikes - 2) {
                                pSpikePoints[nSpikeCounter] = new POINT2(pFlotEnd[k + 1]);
                                pSpikePoints[nSpikeCounter++].style = 19;
                                pSpikePoints[nSpikeCounter] = new POINT2(pFlotStart[k + 1]);
                                pSpikePoints[nSpikeCounter++].style = 5;
                            }

                            pSpikePoints[nSpikeCounter] = new POINT2(pSpikeEnd[k]);
                            pSpikePoints[nSpikeCounter++].style = 25;
                            pSpikePoints[nSpikeCounter] = new POINT2(pSpikeStart[k]);
                            pSpikePoints[nSpikeCounter++].style = 5;
                        }
                    }
                    if (lineType === TacticalLines.SFG) {
                        pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pSpikeStart[k], pLinePoints[j], dSpikeSize / 2, 22);
                        pSpikePoints[nSpikeCounter++] = lineutility.ExtendAlongLineDouble(pSpikeEnd[k], pLinePoints[j + 1], dSpikeSize / 2, 20);
                    }
                    if (lineType === TacticalLines.SFY) {

                        d1 = lineutility.CalcDistanceDouble(pFlotStart[k], pSpikeStart[k]);
                        pSpikePoints[nSpikeCounter] = lineutility.ExtendAlongLineDouble(pSpikeStart[k], pLinePoints[j], d1 / 4);	//was dSpikeSize/4
                        pSpikePoints[nSpikeCounter].style = 25;	//blue
                        pSpikePoints[nSpikeCounter + 1] = lineutility.ExtendAlongLineDouble(pSpikeStart[k], pLinePoints[j], d1 / 2);	//was dSpikeSize/2
                        pSpikePoints[nSpikeCounter + 1].style = 5;	//end of blue part
                        pSpikePoints[nSpikeCounter + 2] = lineutility.ExtendAlongLineDouble(pSpikeStart[k], pLinePoints[j], d1 / 2);	//was dSpikeSize/2
                        pSpikePoints[nSpikeCounter + 2].style = 19;	//red
                        pSpikePoints[nSpikeCounter + 3] = lineutility.ExtendAlongLineDouble(pSpikeStart[k], pLinePoints[j], 3 * d1 / 4);		//was 1.5*dSpikeSize/2
                        pSpikePoints[nSpikeCounter + 3].style = 5;	//end of red part
                        //the cross points
                        pSpikePoints[nSpikeCounter + 4] = lineutility.ExtendDirectedLine(pSpikePoints[nSpikeCounter], pLinePoints[j], pSpikePoints[nSpikeCounter], 2, arraysupport.getScaledSize(5, tg.get_LineThickness()), 25);
                        pSpikePoints[nSpikeCounter + 5] = lineutility.ExtendDirectedLine(pSpikePoints[nSpikeCounter + 3], pLinePoints[j], pSpikePoints[nSpikeCounter + 3], 3, arraysupport.getScaledSize(5, tg.get_LineThickness()), 5);
                        nSpikeCounter += 6;

                        d1 = lineutility.CalcDistanceDouble(pFlotEnd[k + 1], pSpikeEnd[k]);
                        pSpikePoints[nSpikeCounter] = lineutility.ExtendAlongLineDouble(pSpikeEnd[k], pLinePoints[j + 1], d1 / 4);
                        pSpikePoints[nSpikeCounter].style = 25;
                        pSpikePoints[nSpikeCounter + 1] = lineutility.ExtendAlongLineDouble(pSpikeEnd[k], pLinePoints[j + 1], d1 / 2);
                        pSpikePoints[nSpikeCounter + 1].style = 5;
                        pSpikePoints[nSpikeCounter + 2] = lineutility.ExtendAlongLineDouble(pSpikeEnd[k], pLinePoints[j + 1], d1 / 2);
                        pSpikePoints[nSpikeCounter + 2].style = 19;
                        pSpikePoints[nSpikeCounter + 3] = lineutility.ExtendAlongLineDouble(pSpikeEnd[k], pLinePoints[j + 1], 3 * d1 / 4);
                        pSpikePoints[nSpikeCounter + 3].style = 5;
                        //the cross points
                        pSpikePoints[nSpikeCounter + 4] = lineutility.ExtendDirectedLine(pSpikePoints[nSpikeCounter], pLinePoints[j + 1], pSpikePoints[nSpikeCounter], 3, arraysupport.getScaledSize(5, tg.get_LineThickness()), 19);
                        pSpikePoints[nSpikeCounter + 5] = lineutility.ExtendDirectedLine(pSpikePoints[nSpikeCounter + 3], pLinePoints[j + 1], pSpikePoints[nSpikeCounter + 3], 2, arraysupport.getScaledSize(5, tg.get_LineThickness()), 5);
                        nSpikeCounter += 6;

                    }
                }//for k= 0 to numSpikes-1
                if (nSpikeCounter === 0) {
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                    //added 6-1-05 M. Deutch
                    pSpikePoints[nSpikeCounter] = new POINT2(pLinePoints[j + 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    nSpikeCounter++;
                } else {
                    pSpikePoints[nSpikeCounter] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter].style = 5;
                    pSpikePoints[nSpikeCounter + 1] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter + 1].style = 5;
                    pSpikePoints[nSpikeCounter + 2] = new POINT2(pSpikePoints[nSpikeCounter - 1]);
                    pSpikePoints[nSpikeCounter + 2].style = 5;
                    nSpikeCounter += 3;
                }
            }
            n = pLinePoints.length;
            //for (j = 0; j < pLinePoints.length; j++) 
            for (j = 0; j < n; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[0]);
                pLinePoints[j].style = 5;
            }
            //load the spike points into the array
            nTotalCounter = 0;
            for (j = 0; j < nFlotCounter; j++) {
                pLinePoints[nTotalCounter++] = new POINT2(pFlotPoints[j]);
            }
            for (j = 0; j < nSpikeCounter; j++) {
                pLinePoints[nTotalCounter++] = new POINT2(pSpikePoints[j]);
            }
            for (j = 0; j < nSegCounter; j++) {
                pLinePoints[nTotalCounter++] = new POINT2(pSegPoints[j]);
            }
            n = pLinePoints.length;
            //for (j = nTotalCounter; j < pLinePoints.length; j++) 
            for (j = nTotalCounter; j < n; j++) {
                pLinePoints[j] = new POINT2(pLinePoints[nTotalCounter - 1]);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetSFPointsDouble",
                    new RendererException("Failed inside GetSFPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return nTotalCounter;
    }

    static GetSFCountDouble(pLinePoints: POINT2[], numPts: int): int {
        let lTotalpts: int = 0;
        try {
            let j: int = 0;
            let lNumSegs: int = 0;
            let lNumFlots: int = 0;
            let lNumSpikes: int = 0;
            let dDistance: double = 0;
            //end declarations

            //for each segment
            for (j = 0; j < numPts - 1; j++) {
                dDistance = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                lNumSegs = Math.trunc(dDistance / 80);
                lNumFlots = lNumSegs;
                lNumSpikes = lNumSegs;
                if (lNumFlots < 1) {
                    lNumFlots = 1;
                }
                if (lNumSpikes < 1) {
                    lNumSpikes = 1;
                }
                lTotalpts += lNumFlots * 10; //10 points per flot,
                lTotalpts += lNumSpikes * 3; //3 points per spike
                lTotalpts += lNumSegs * 16;	// points for line features
                lTotalpts += numPts * 4;
            }
            if (lTotalpts < 25 * numPts) {
                lTotalpts = 25 * numPts;
            }

            if (lTotalpts < numPts) {
                lTotalpts = numPts;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(flot._className, "GetSFCountDouble",
                    new RendererException("Failed inside GetSFCountDouble", exc));
            } else {
                throw exc;
            }
        }
        return lTotalpts;
    }
}
