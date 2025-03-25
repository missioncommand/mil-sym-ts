/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



import { type double, type int } from "../graphics2d/BasicTypes";


import { Polygon } from "../graphics2d/Polygon"
import { Area } from "../graphics2d/Area"
import { BasicStroke } from "../graphics2d/BasicStroke"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"
import { CELineArray } from "../JavaLineArray/CELineArray"
import { countsupport } from "../JavaLineArray/countsupport"
import { DISMSupport } from "../JavaLineArray/DISMSupport"
import { flot } from "../JavaLineArray/flot"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { Color } from "../renderer/utilities/Color"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"


/**
 * Class to process the pixel arrays
 *
 */
export class arraysupport {

    private static readonly maxLength: double = 100;
    private static readonly minLength: double = 2.5;    //was 5
    private static dACP: double = 0;
    private static readonly _className: string = "arraysupport";

    //    protected static void setMinLength(double value)
    //    {
    //        minLength=value;
    //    }
    private static FillPoints(pLinePoints: POINT2[],
        counter: int,
        points: Array<POINT2>): void {
        points.length = 0; // points.clear()
        for (let j: int = 0; j < counter; j++) {
            points.push(pLinePoints[j]);
        }
    }

    /**
     * This is the interface function to CELineArray from clsRenderer2 for
     * non-channel types
     *
     * @param pts the client points
     * @param shapes the symbol ShapeInfo objects
     * @param clipBounds the rectangular clipping bounds
     */
    public static GetLineArray2(tg: TGLight,
        pts: Array<POINT2>,
        shapes: Array<Shape2>,
        clipBounds: Rectangle2D | null,
        converter: IPointConversion | null): Array<POINT2> | null {

        let points: Array<POINT2> | null = null;
        try {
            let pt: POINT2;
            let vblSaveCounter: int = pts.length;
            let pLinePoints: POINT2[] = new Array<POINT2>(vblSaveCounter);
            let j: int = 0;

            for (j = 0; j < vblSaveCounter; j++) {
                pt = pts[j] as POINT2;
                pLinePoints[j] = new POINT2(pt.x, pt.y, pt.style);
            }
            //get the number of points the array will require
            let vblCounter: int = countsupport.GetCountersDouble(tg, vblSaveCounter, pLinePoints, clipBounds);

            //resize pLinePoints and fill the first vblSaveCounter elements with the original points
            if (vblCounter > 0) {
                pLinePoints = new Array<POINT2>(vblCounter);
            } else {
                return null;
            }

            lineutility.InitializePOINT2Array(pLinePoints);

            //safeguards added 2-17-11 after CPOF client was allowed to add points to autoshapes
            if (vblSaveCounter > pts.length) {
                vblSaveCounter = pts.length;
            }
            if (vblSaveCounter > pLinePoints.length) {
                vblSaveCounter = pLinePoints.length;
            }

            for (j = 0; j < vblSaveCounter; j++) {
                pt = pts[j] as POINT2;
                pLinePoints[j] = new POINT2(pt.x, pt.y, pt.style);
            }
            //we have to adjust the autoshapes because they are instantiating with fewer points
            points = arraysupport.GetLineArray2Double(tg, pLinePoints, vblCounter, vblSaveCounter, shapes, clipBounds, converter);

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetLineArray2",
                    new RendererException("GetLineArray2 " + tg.get_LineType().toString(), exc));

            } else {
                throw exc;
            }
        }
        return points;
        //the caller can get points
    }

    /**
     * A function to calculate the points for FORTL
     *
     * @param pLinePoints OUT - the points arry also used for the return points
     * @param vblSaveCounter the number of client points
     * @return
     */
    private static GetFORTLPointsDouble(tg: TGLight, pLinePoints: POINT2[], vblSaveCounter: int): int {
        let nCounter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let bolVertical: int = 0;
            let lCount: int = 0;
            let dIncrement: double = arraysupport.getScaledSize(20, tg.get_LineThickness());
            let m: ref<number[]> = new ref();
            let pSpikePoints: POINT2[];
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();

            lCount = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
            let numGlyphs: int = 0;
            let dGlyphSize: double = dIncrement / 2;

            pSpikePoints = new Array<POINT2>(lCount);
            lineutility.InitializePOINT2Array(pSpikePoints);

            for (j = 0; j < vblSaveCounter - 1; j++) {
                bolVertical = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                let dLengthSegment: double = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                if (dLengthSegment / dIncrement < 1) {
                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j]);
                    nCounter++;
                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                    nCounter++;
                    continue;
                }
                numGlyphs = Math.trunc(dLengthSegment / dIncrement);
                let dSegIncrement: double = (dLengthSegment / numGlyphs);

                //for (k = 0; k < dLengthSegment / 20 - 1; k++)
                for (k = 0; k < numGlyphs; k++) {
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dSegIncrement, 0);
                    nCounter++;
                    //pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dSegIncrement - 10, 0);
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dSegIncrement - dSegIncrement / 2, 0);
                    nCounter++;
                    pt0 = new POINT2(pSpikePoints[nCounter - 1]);
                    //pt1 = lineutility.ExtendLineDouble(pLinePoints[j], pSpikePoints[nCounter - 1], 10);
                    pt1 = lineutility.ExtendLineDouble(pLinePoints[j], pSpikePoints[nCounter - 1], dSegIncrement / 2);
                    //the spikes
                    if (pLinePoints[j].x > pLinePoints[j + 1].x) {
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 3, dGlyphSize);
                        nCounter++;
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt1, 3, dGlyphSize);
                        nCounter++;
                    }
                    if (pLinePoints[j].x < pLinePoints[j + 1].x) {
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 2, dGlyphSize);
                        nCounter++;
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt1, 2, dGlyphSize);
                        nCounter++;
                    }
                    if (pLinePoints[j].x === pLinePoints[j + 1].x) {
                        if (pLinePoints[j].y < pLinePoints[j + 1].y) {
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 1, dGlyphSize);
                            nCounter++;
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt1, 1, dGlyphSize);
                            nCounter++;
                        }
                        if (pLinePoints[j].y > pLinePoints[j + 1].y) {
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 0, dGlyphSize);
                            nCounter++;
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt1, 0, dGlyphSize);
                            nCounter++;
                        }
                    }
                    //pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 3], 10, 0);
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 3], dSegIncrement / 2, 0);
                    nCounter++;
                }//end for k
                pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                nCounter++;
            }//end for j
            for (j = 0; j < nCounter; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[j]);
            }

            return nCounter;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetFORTLPointsDouble",
                    new RendererException("GetFORTLPointsDouble " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return nCounter;
    }

    private static GetATWallPointsDouble2(tg: TGLight, pLinePoints: POINT2[], vblSaveCounter: int): int {
        let nCounter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let lCount: int = 0;
            let dLengthSegment: double = 0;
            let dIncrement: double = 0;
            let pSpikePoints: POINT2[];
            let pt0: POINT2;
            let dSpikeSize: double = 0;
            let limit: int = 0;
            let numSpikes: int = 0;;

            lCount = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
            pSpikePoints = new Array<POINT2>(lCount);
            lineutility.InitializePOINT2Array(pSpikePoints);
            pSpikePoints[nCounter++] = new POINT2(pLinePoints[0]);
            for (j = 0; j < vblSaveCounter - 1; j++) {
                dLengthSegment = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                dSpikeSize = arraysupport.getScaledSize(10, tg.get_LineThickness());
                dIncrement = 2 * dSpikeSize;
                //  diagnostic
                numSpikes = Math.round((dLengthSegment - dSpikeSize) / dIncrement) as int;
                dIncrement = dLengthSegment / numSpikes;

                //limit = (int) (dLengthSegment / dIncrement) - 1;
                limit = numSpikes - 1;
                //                if (limit < 1) {
                //                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j]);
                //                    nCounter++;
                //                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                //                    nCounter++;
                //                    continue;
                //                }
                //  end diagnostic                
                for (k = -1; k < limit; k++)//was k=0 to limit
                {
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - (dSpikeSize * 3), 0);
                    nCounter++;

                    pt0 = lineutility.ExtendLineDouble(pLinePoints[j], pSpikePoints[nCounter - 1], dSpikeSize / 2);

                    //the spikes
                    if (pLinePoints[j].x > pLinePoints[j + 1].x) //extend above the line
                    {
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pSpikePoints[nCounter - 1], pt0, 2, dSpikeSize);
                    }
                    if (pLinePoints[j].x < pLinePoints[j + 1].x) //extend below the line
                    {
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pSpikePoints[nCounter - 1], pt0, 3, dSpikeSize);
                    }
                    if (pLinePoints[j].x === pLinePoints[j + 1].x) {
                        pSpikePoints[nCounter] = new POINT2(pt0);
                        if (pLinePoints[j].y < pLinePoints[j + 1].y) //extend left of line
                        {
                            pSpikePoints[nCounter].x = pt0.x - dSpikeSize;
                        } else //extend right of line
                        {
                            pSpikePoints[nCounter].x = pt0.x + dSpikeSize;
                        }
                    }
                    nCounter++;

                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 2], dSpikeSize, 0);
                    nCounter++;
                }
                //use the original line point for the segment end point
                pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                pSpikePoints[nCounter].style = 0;
                nCounter++;
            }

            for (j = 0; j < nCounter; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[j]);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetATWallPointsDouble",
                    new RendererException("GetATWallPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return nCounter;
    }

    public static GetInsideOutsideDouble2(pt0: POINT2,
        pt1: POINT2,
        pLinePoints: POINT2[],
        vblCounter: int,
        index: int,
        lineType: int): int {
        let nDirection: int = 0;
        try {
            let m: ref<number[]> = new ref();
            let m0: ref<number[]> = new ref();

            let b0: double = 0;
            let b2: double = 0;

            let b: double = 0;
            let X0: double = 0;	//segment midpoint X value
            let Y0: double = 0;	//segment midpoint Y value
            let X: double = 0;	//X value of horiz line from left intercept with current segment
            let Y: double = 0;	//Y value of vertical line from top intercept with current segment
            let nInOutCounter: int = 0;
            let j: int = 0;
            let bolVertical: int = 0;
            let bolVertical2: int = 0;
            let nOrientation: int = 0; //will use 0 for horiz line from left, 1 for vertical line from top
            let extendLeft: int = 0;
            let extendRight: int = 1;
            let extendAbove: int = 2;
            let extendBelow: int = 3;

            let pt2: POINT2 = new POINT2();
            //end declarations. will use this to determine the direction

            //slope of the segment
            bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m0);
            if (m0.value == null) {
                return 0;
            }
            //get the midpoint of the segment
            X0 = (pt0.x + pt1.x) / 2;
            Y0 = (pt0.y + pt1.y) / 2;

            //slope is not too small or is vertical, use left to right
            if (Math.abs(m0.value[0]) >= 1 || bolVertical === 0) {
                nOrientation = 0;	//left to right orientation
                for (j = 0; j < vblCounter - 1; j++) {
                    if (index !== j) {
                        //if ((pLinePoints[j].y <= Y0 && pLinePoints[j + 1].y >= Y0) ||
                        //      (pLinePoints[j].y >= Y0 && pLinePoints[j + 1].y <= Y0)) 
                        if ((pLinePoints[j].y < Y0 && pLinePoints[j + 1].y > Y0)
                            || (pLinePoints[j].y > Y0 && pLinePoints[j + 1].y < Y0)
                            || (pLinePoints[j].y < Y0 && pLinePoints[j + 1].y === Y0)
                            || (pLinePoints[j].y === Y0 && pLinePoints[j + 1].y < Y0)) {
                            bolVertical2 = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                            if (bolVertical2 === 1 && m.value[0] === 0) //current segment is horizontal, this should not happen
                            {	//counter unaffected
                                nInOutCounter++;
                                nInOutCounter--;
                            }
                            //current segment is vertical, it's x value must be to the left
                            //of the current segment X0 for the horiz line from the left to cross
                            if (bolVertical2 === 0) {
                                if (pLinePoints[j].x < X0) {
                                    nInOutCounter++;
                                }
                            }

                            //current segment is not horizontal and not vertical
                            if (m.value[0] !== 0 && bolVertical2 === 1) {
                                //get the X value of the intersection between the horiz line
                                //from the left and the current segment
                                //b=Y0;
                                b = pLinePoints[j].y - m.value[0] * pLinePoints[j].x;
                                X = (Y0 - b) / m.value[0];
                                if (X < X0) //the horizontal line crosses the segment
                                {
                                    nInOutCounter++;
                                }
                            }

                        }	//end if
                    }

                }	//end for
            } //end if
            else //use top to bottom to get orientation
            {
                nOrientation = 1;	//top down orientation
                for (j = 0; j < vblCounter - 1; j++) {
                    if (index !== j) {
                        //if ((pLinePoints[j].x <= X0 && pLinePoints[j + 1].x >= X0) ||
                        //  (pLinePoints[j].x >= X0 && pLinePoints[j + 1].x <= X0)) 
                        if ((pLinePoints[j].x < X0 && pLinePoints[j + 1].x > X0)
                            || (pLinePoints[j].x > X0 && pLinePoints[j + 1].x < X0)
                            || (pLinePoints[j].x < X0 && pLinePoints[j + 1].x === X0)
                            || (pLinePoints[j].x === X0 && pLinePoints[j + 1].x < X0)) {
                            bolVertical2 = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                            if (bolVertical2 === 0) //current segment is vertical, this should not happen
                            {	//counter unaffected
                                nInOutCounter++;
                                nInOutCounter--;
                            }
                            //current segment is horizontal, it's y value must be above
                            //the current segment Y0 for the horiz line from the left to cross
                            if (bolVertical2 === 1 && m.value[0] === 0) {
                                if (pLinePoints[j].y < Y0) {
                                    nInOutCounter++;
                                }
                            }

                            //current segment is not horizontal and not vertical
                            if (m.value[0] !== 0 && bolVertical2 === 1) {
                                //get the Y value of the intersection between the vertical line
                                //from the top and the current segment
                                b = pLinePoints[j].y - m.value[0] * pLinePoints[j].x;
                                Y = m.value[0] * X0 + b;
                                if (Y < Y0) //the vertical line crosses the segment
                                {
                                    nInOutCounter++;
                                }
                            }
                        }	//end if
                    }
                }	//end for
            }

            switch (nInOutCounter % 2) {
                case 0: {
                    if (nOrientation === 0) {
                        nDirection = extendLeft;
                    } else {
                        nDirection = extendAbove;
                    }
                    break;
                }

                case 1: {
                    if (nOrientation === 0) {
                        nDirection = extendRight;
                    } else {
                        nDirection = extendBelow;
                    }
                    break;
                }

                default: {
                    break;
                }

            }
            //reverse direction for ICING
            switch (lineType) {
                case TacticalLines.ICING: {
                    if (nDirection === extendLeft) {
                        nDirection = extendRight;
                    } else {
                        if (nDirection === extendRight) {
                            nDirection = extendLeft;
                        } else {
                            if (nDirection === extendAbove) {
                                nDirection = extendBelow;
                            } else {
                                if (nDirection === extendBelow) {
                                    nDirection = extendAbove;
                                }
                            }

                        }

                    }

                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetInsideOutsideDouble2",
                    new RendererException("GetInsideOutsideDouble2", exc));
            } else {
                throw exc;
            }
        }
        return nDirection;
    }

    /**
     * BELT and others
     *
     * @param pLinePoints
     * @param vblSaveCounter
     * @return
     */
    protected static GetZONEPointsDouble2(tg: TGLight, pLinePoints: POINT2[], vblSaveCounter: int): int {
        let nCounter: int = 0;
        try {
            let lineType: int = tg.get_LineType();
            let j: int = 0;
            let k: int = 0;
            let n: int = 0;
            let lCount: int = 0;
            let dLengthSegment: double = 0;
            let pt0: POINT2 = new POINT2(pLinePoints[0]);
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let pSpikePoints: POINT2[];
            let nDirection: int = 0;
            let dIncrement: double = arraysupport.getScaledSize(20, tg.get_LineThickness());

            lCount = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
            pSpikePoints = new Array<POINT2>(lCount);
            lineutility.InitializePOINT2Array(pSpikePoints);
            let remainder: double = 0;
            for (j = 0; j < vblSaveCounter - 1; j++) {
                pt1 = new POINT2(pLinePoints[j]);
                pt2 = new POINT2(pLinePoints[j + 1]);
                //get the direction for the spikes
                nDirection = arraysupport.GetInsideOutsideDouble2(pt1, pt2, pLinePoints, vblSaveCounter, j as int, lineType);
                dLengthSegment = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                //reverse the direction for those lines with inward spikes
                if (dLengthSegment < dIncrement) {
                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j]);
                    nCounter++;
                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                    nCounter++;
                    continue;
                }
                switch (lineType) {
                    case TacticalLines.OBSAREA:
                    case TacticalLines.OBSFAREA: {
                        switch (nDirection) {
                            case 0: {	//extend left
                                nDirection = 1;	//extend right
                                break;
                            }

                            case 1: {	//extend right
                                nDirection = 0;	//extend left
                                break;
                            }

                            case 2: {	//extend above
                                nDirection = 3;	//extend below
                                break;
                            }

                            case 3: {	//extgend below
                                nDirection = 2;	//extend above
                                break;
                            }

                            default: {
                                break;
                            }

                        }
                        break;
                    }

                    default: {
                        break;
                    }

                }
                n = Math.trunc(dLengthSegment / dIncrement);
                remainder = dLengthSegment - n * dIncrement;
                for (k = 0; k < n; k++) {
                    if (k > 0) {
                        pSpikePoints[nCounter++] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - remainder / 2, 0);//was +0
                        pSpikePoints[nCounter++] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - dIncrement / 2 - remainder / 2, 0);//was -10
                    } else {
                        pSpikePoints[nCounter++] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement, 0);//was +0
                        pSpikePoints[nCounter++] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - dIncrement / 2, 0);//was -10
                    }

                    switch (lineType) {
                        case TacticalLines.OBSAREA:
                        case TacticalLines.OBSFAREA:
                        case TacticalLines.ZONE:
                        case TacticalLines.ENCIRCLE: {
                            pt0 = lineutility.ExtendLineDouble(pLinePoints[j], pSpikePoints[nCounter - 1], dIncrement / 4);
                            break;
                        }

                        case TacticalLines.STRONG:
                        case TacticalLines.FORT_REVD:
                        case TacticalLines.FORT: {
                            pt0 = new POINT2(pSpikePoints[nCounter - 1]);
                            break;
                        }

                        default: {
                            break;
                        }

                    }

                    pSpikePoints[nCounter++] = lineutility.ExtendDirectedLine(pt1, pt2, pt0, nDirection, dIncrement / 2);
                    //nCounter++;
                    switch (lineType) {
                        case TacticalLines.OBSAREA:
                        case TacticalLines.OBSFAREA:
                        case TacticalLines.ZONE:
                        case TacticalLines.ENCIRCLE: {
                            pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 2], dIncrement / 2, 0);
                            break;
                        }

                        case TacticalLines.STRONG: {
                            pSpikePoints[nCounter] = new POINT2(pSpikePoints[nCounter - 2]);
                            break;
                        }

                        case TacticalLines.FORT_REVD:
                        case TacticalLines.FORT: {
                            pt3 = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 2], dIncrement / 2, 0);
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pt1, pt2, pt3, nDirection, dIncrement / 2);
                            nCounter++;
                            pSpikePoints[nCounter] = new POINT2(pt3);
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    //}
                    nCounter++;
                    //diagnostic
                    if (lineType === TacticalLines.ENCIRCLE) {
                        pSpikePoints[nCounter++] = new POINT2(pSpikePoints[nCounter - 4]);
                    }
                }//end for k
                pSpikePoints[nCounter++] = new POINT2(pLinePoints[j + 1]);
                //nCounter++;
            }//end for j
            for (j = 0; j < nCounter; j++) {
                if (lineType === TacticalLines.OBSAREA) {
                    pSpikePoints[j].style = 11;
                }
            }
            if (lineType === TacticalLines.OBSAREA) {
                pSpikePoints[nCounter - 1].style = 12;
            } else {
                if (nCounter > 0) {
                    pSpikePoints[nCounter - 1].style = 5;
                }
            }

            for (j = 0; j < nCounter; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[j]);
                if (j === nCounter - 1) {
                    if (lineType !== TacticalLines.OBSAREA) {
                        pLinePoints[j].style = 5;
                    }
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetZONEPointsDouble2",
                    new RendererException("GetZONEPointsDouble2", exc));
            } else {
                throw exc;
            }
        }
        return nCounter;
    }

    private static IsTurnArcReversed(pPoints: POINT2[]): boolean {
        try {
            if (pPoints.length < 3) {
                return false;
            }

            let ptsSeize: POINT2[] = new Array<POINT2>(2);
            ptsSeize[0] = new POINT2(pPoints[0]);
            ptsSeize[1] = new POINT2(pPoints[1]);
            lineutility.CalcClockwiseCenterDouble(ptsSeize);
            let d: double = lineutility.CalcDistanceDouble(ptsSeize[0], pPoints[2]);

            ptsSeize[0] = new POINT2(pPoints[1]);
            ptsSeize[1] = new POINT2(pPoints[0]);
            lineutility.CalcClockwiseCenterDouble(ptsSeize);
            let dArcReversed: double = lineutility.CalcDistanceDouble(ptsSeize[0], pPoints[2]);

            if (dArcReversed > d) {
                return true;
            } else {
                return false;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "IsTurnArcReversed",
                    new RendererException("IsTurnArcReversed", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }

    private static GetIsolatePointsDouble(pLinePoints: POINT2[],
        lineType: int,
        converter: IPointConversion | null): void {
        try {
            let pt0: POINT2 = new POINT2(pLinePoints[0]);
            let pt1: POINT2 = new POINT2(pLinePoints[1]);
            let pt2: POINT2 = new POINT2(pLinePoints[0]);
            if (pt0.x === pt1.x && pt0.y === pt1.y) {
                pt1.x += 1;
            }

            let C: POINT2 = new POINT2();
            let E: POINT2 = new POINT2();
            let j: int = 0;
            let k: int = 0;
            let l: int = 0;
            let ptsArc: POINT2[] = new Array<POINT2>(26);
            let midPts: POINT2[] = new Array<POINT2>(7);
            let trianglePts: POINT2[] = new Array<POINT2>(21);
            let pArrowPoints: POINT2[] = new Array<POINT2>(3);
            let dRadius: double = lineutility.CalcDistanceDouble(pt0, pt1);
            let dLength: double = Math.abs(dRadius - 20);
            if (dRadius < 40) {
                dLength = dRadius / 1.5;
            }

            let d: double = lineutility.MBRDistance(pLinePoints, 2);
            let ptsSeize: POINT2[] = new Array<POINT2>(2);
            let savepoints: POINT2[] = new Array<POINT2>(3);
            for (j = 0; j < 2; j++) {
                savepoints[j] = new POINT2(pLinePoints[j]);
            }

            if (pLinePoints.length >= 3) {
                savepoints[2] = new POINT2(pLinePoints[2]);
            }

            lineutility.InitializePOINT2Array(ptsArc);
            lineutility.InitializePOINT2Array(midPts);
            lineutility.InitializePOINT2Array(trianglePts);
            lineutility.InitializePOINT2Array(pArrowPoints);
            lineutility.InitializePOINT2Array(ptsSeize);

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (d / 7 > arraysupport.maxLength * DPIScaleFactor) {
                d = 7 * arraysupport.maxLength * DPIScaleFactor;
            }
            if (d / 7 < arraysupport.minLength * DPIScaleFactor) {  //was minLength
                d = 7 * arraysupport.minLength * DPIScaleFactor;    //was minLength
            }
            //change due to outsized arrow in 6.0, 11-3-10
            if (d > 140 * DPIScaleFactor) {
                d = 140 * DPIScaleFactor;
            }
            //calculation points for the SEIZE arrowhead
            //for SEIZE calculations
            let ptsArc2: POINT2[] = new Array<POINT2>(26);
            lineutility.InitializePOINT2Array(ptsArc2);

            E.x = 2 * pt1.x - pt0.x;
            E.y = 2 * pt1.y - pt0.y;
            ptsArc[0] = new POINT2(pLinePoints[1]);
            ptsArc[1] = new POINT2(E);
            if (converter != null) {
                ptsArc[0] = new POINT2(pLinePoints[0]);
                ptsArc[1] = new POINT2(pLinePoints[1]);
            }

            lineutility.ArcArrayDouble(ptsArc, 0, dRadius, lineType, converter);
            for (j = 0; j < 26; j++) {
                ptsArc[j].style = 0;
                pLinePoints[j] = new POINT2(ptsArc[j]);
                pLinePoints[j].style = 0;
            }
            if (lineType !== TacticalLines.OCCUPY) {
                lineutility.GetArrowHead4Double(ptsArc[24], ptsArc[25], Math.trunc(d / 7), Math.trunc(d  / 7), pArrowPoints, 0);
            } else {
                lineutility.GetArrowHead4Double(ptsArc[24], ptsArc[25], Math.trunc(d / 7), Math.trunc((1.75 * d) / 7), pArrowPoints, 0);
            }

            pLinePoints[25].style = 5;

            switch (lineType) {
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH:
                case TacticalLines.ISOLATE: {
                    if (dRadius > 100) {
                        dLength = 0.8 * dRadius;
                    }
                    for (j = 1; j <= 23; j++) {
                        if (j % 3 === 0) {
                            midPts[k].x = pt0.x - ((dLength / dRadius) * (pt0.x - ptsArc[j].x));
                            midPts[k].y = pt0.y - ((dLength / dRadius) * (pt0.y - ptsArc[j].y));
                            midPts[k].style = 0;
                            trianglePts[l] = new POINT2(ptsArc[j - 1]);
                            l++;
                            trianglePts[l] = new POINT2(midPts[k]);
                            l++;
                            trianglePts[l] = new POINT2(ptsArc[j + 1]);
                            trianglePts[l].style = 5;
                            l++;
                            k++;
                        }
                    }
                    for (j = 26; j < 47; j++) {
                        pLinePoints[j] = new POINT2(trianglePts[j - 26]);
                    }
                    pLinePoints[46].style = 5;
                    for (j = 47; j < 50; j++) {
                        pLinePoints[j] = new POINT2(pArrowPoints[j - 47]);
                        pLinePoints[j].style = 0;
                    }
                    break;
                }

                case TacticalLines.OCCUPY: {
                    for (j = 26; j < 29; j++) {
                        pLinePoints[j] = new POINT2(pArrowPoints[j - 26]);
                    }

                    pLinePoints[29] = lineutility.ExtendAlongLineDouble(pArrowPoints[0], pArrowPoints[1], lineutility.CalcDistanceDouble(pArrowPoints[0], pArrowPoints[1]) * 2);
                    pLinePoints[30] = new POINT2(pArrowPoints[1]);
                    pLinePoints[31] = lineutility.ExtendAlongLineDouble(pArrowPoints[2], pArrowPoints[1], lineutility.CalcDistanceDouble(pArrowPoints[2], pArrowPoints[1]) * 2);
                    break;
                }

                case TacticalLines.SECURE: {
                    for (j = 26; j < 29; j++) {
                        pLinePoints[j] = new POINT2(pArrowPoints[j - 26]);
                        pLinePoints[j].style = 0;
                    }
                    pLinePoints[28].style = 5;
                    break;
                }


                case TacticalLines.TURN: {
                    let changeArc: boolean = arraysupport.IsTurnArcReversed(savepoints);
                    if (changeArc) //swap the points
                    {
                        pt0.x = pt1.x;
                        pt0.y = pt1.y;
                        pt1.x = pt2.x;
                        pt1.y = pt2.y;
                    }

                    ptsSeize[0] = new POINT2(pt0);
                    ptsSeize[1] = new POINT2(pt1);

                    dRadius = lineutility.CalcClockwiseCenterDouble(ptsSeize);

                    C = new POINT2(ptsSeize[0]);
                    E = new POINT2(ptsSeize[1]);
                    ptsArc[0] = new POINT2(pt0);
                    ptsArc[1] = new POINT2(E);
                    lineutility.ArcArrayDouble(ptsArc, 0, dRadius, lineType, null);
                    for (j = 0; j < 26; j++) {
                        ptsArc[j].style = 0;
                        pLinePoints[j] = new POINT2(ptsArc[j]);
                        pLinePoints[j].style = 0;
                    }

                    if (changeArc) {
                        lineutility.GetArrowHead4Double(ptsArc[1], pt0, Math.trunc(d / 7), Math.trunc(d / 7), pArrowPoints, 5);
                    } else {
                        lineutility.GetArrowHead4Double(ptsArc[24], pt1, Math.trunc(d / 7), Math.trunc(d / 7), pArrowPoints, 5);
                    }

                    pLinePoints[25].style = 5;

                    for (j = 26; j < 29; j++) {
                        pLinePoints[j] = new POINT2(pArrowPoints[j - 26]);
                        pLinePoints[j].style = 9;
                    }
                    pLinePoints[28].style = 10;

                    break;
                }

                case TacticalLines.RETAIN: {
                    for (j = 26; j < 29; j++) {
                        pLinePoints[j] = new POINT2(pArrowPoints[j - 26]);
                        pLinePoints[j].style = 0;
                    }
                    pLinePoints[28].style = 5;
                    //get the extended points for retain
                    k = 29;
                    for (j = 1; j < 24; j++) {
                        pLinePoints[k] = new POINT2(ptsArc[j]);
                        pLinePoints[k].style = 0;
                        k++;
                        pLinePoints[k] = lineutility.ExtendLineDouble(pt0, ptsArc[j], d / 7);
                        pLinePoints[k].style = 5;
                        k++;
                    }

                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetIsolatePointsDouble",
                    new RendererException("GetIsolatePointsDouble " + lineType.toString(), exc));
            } else {
                throw exc;
            }
        }
    }

    private static AirfieldCenterFeature(pLinePoints: POINT2[], vblCounter: int): void {
        try {
            let d: double = lineutility.MBRDistance(pLinePoints, vblCounter - 5);
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (d > 350 * DPIScaleFactor) {
                d = 350 * DPIScaleFactor;
            } else {
                if (d < 100 * DPIScaleFactor) {
                    d = 100 * DPIScaleFactor;
                }
            }


            for (let k: int = 0; k < vblCounter; k++) {
                pLinePoints[k].style = 0;
            }

            pLinePoints[vblCounter - 5] = new POINT2(pLinePoints[0]);
            pLinePoints[vblCounter - 5].style = 5;
            pLinePoints[vblCounter - 4] = lineutility.CalcCenterPointDouble(pLinePoints, vblCounter - 6);
            pLinePoints[vblCounter - 4].x -= d / 10;    //was 20
            pLinePoints[vblCounter - 4].style = 0;
            pLinePoints[vblCounter - 3] = new POINT2(pLinePoints[vblCounter - 4]);
            pLinePoints[vblCounter - 3].x = pLinePoints[vblCounter - 4].x + d / 5;//was 10
            pLinePoints[vblCounter - 3].style = 5;
            pLinePoints[vblCounter - 2] = new POINT2(pLinePoints[vblCounter - 4]);
            pLinePoints[vblCounter - 2].y += d / 20;//was 40
            pLinePoints[vblCounter - 2].style = 0;
            pLinePoints[vblCounter - 1] = new POINT2(pLinePoints[vblCounter - 3]);
            pLinePoints[vblCounter - 1].y -= d / 20;//was 40
            pLinePoints[vblCounter - 1].style = 0;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "AirfieldCenterFeature",
                    new RendererException("AirfieldCenterFeature", exc));
            } else {
                throw exc;
            }
        }
    }

    private static GetATWallPointsDouble(tg: TGLight, pLinePoints: POINT2[], vblSaveCounter: int): int {
        let nCounter: int = 0;
        try {
            let lineType: int = tg.get_LineType();
            let j: int = 0;
            let k: int = 0;
            let lCount: int = 0;
            let dLengthSegment: double = 0;
            let dIncrement: double = 0;
            let pSpikePoints: POINT2[];
            let pt0: POINT2;
            let dRemainder: double = 0;
            let dSpikeSize: double = 0;
            let limit: int = 0;
            let crossPt1: POINT2;
            let crossPt2: POINT2;

            lCount = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
            pSpikePoints = new Array<POINT2>(lCount);
            switch (lineType) {
                case TacticalLines.CFG:
                case TacticalLines.CFY: {
                    pSpikePoints[nCounter] = pLinePoints[0];
                    pSpikePoints[nCounter].style = 0;
                    nCounter++;
                    break;
                }

                default: {
                    break;
                }

            }
            for (j = 0; j < vblSaveCounter - 1; j++) {
                dLengthSegment = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                switch (lineType) {
                    case TacticalLines.UCF:
                    case TacticalLines.CF:
                    case TacticalLines.CFG:
                    case TacticalLines.CFY: {
                        dIncrement = arraysupport.getScaledSize(60, tg.get_LineThickness());
                        dSpikeSize = arraysupport.getScaledSize(20, tg.get_LineThickness());
                        dRemainder = dLengthSegment / dIncrement - (Math.trunc(dLengthSegment / dIncrement));
                        if (dRemainder < 0.75) {
                            limit = Math.trunc(dLengthSegment / dIncrement);
                        } else {
                            limit = Math.trunc(dLengthSegment / dIncrement) + 1;
                        }
                        break;
                    }

                    default: {
                        dIncrement = arraysupport.getScaledSize(20, tg.get_LineThickness());
                        dSpikeSize = arraysupport.getScaledSize(10, tg.get_LineThickness());
                        limit = Math.trunc(dLengthSegment / dIncrement) - 1;
                        break;
                    }

                }
                if (limit < 1) {
                    pSpikePoints[nCounter] = pLinePoints[j];
                    nCounter++;
                    pSpikePoints[nCounter] = pLinePoints[j + 1];
                    nCounter++;
                    continue;
                }

                for (k = 0; k < limit; k++) {
                    switch (lineType) {
                        case TacticalLines.CFG: {	//linebreak for dot
                            if (k > 0) {
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement + arraysupport.getScaledSize(45, tg.get_LineThickness()), 0);
                                nCounter++;
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement + arraysupport.getScaledSize(4, tg.get_LineThickness()), 5);	//+2
                                nCounter++;
                                //dot
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - arraysupport.getScaledSize(1, tg.get_LineThickness()), 20);
                                nCounter++;
                                //remainder of line
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - arraysupport.getScaledSize(10, tg.get_LineThickness()), 0);	//-4
                            } else {
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - arraysupport.getScaledSize(45, tg.get_LineThickness()), 0);
                            }
                            break;
                        }

                        case TacticalLines.CFY: {	//linebreak for crossed line
                            if (k > 0) {
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement + arraysupport.getScaledSize(45, tg.get_LineThickness()), 0);
                                nCounter++;
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement + arraysupport.getScaledSize(10, tg.get_LineThickness()), 5);	//+2
                                nCounter++;
                                //dot
                                //replace the dot with crossed line segment
                                pSpikePoints[nCounter] = lineutility.ExtendAlongLineDouble(pSpikePoints[nCounter - 1], pLinePoints[j + 1], arraysupport.getScaledSize(5, tg.get_LineThickness()), 0);
                                nCounter++;
                                pSpikePoints[nCounter] = lineutility.ExtendAlongLineDouble(pSpikePoints[nCounter - 1], pLinePoints[j + 1], arraysupport.getScaledSize(10, tg.get_LineThickness()), 5);
                                nCounter++;
                                crossPt1 = lineutility.ExtendDirectedLine(pSpikePoints[nCounter - 2], pSpikePoints[nCounter - 1], pSpikePoints[nCounter - 1], 3, arraysupport.getScaledSize(5, tg.get_LineThickness()), 0);
                                crossPt2 = lineutility.ExtendDirectedLine(pSpikePoints[nCounter - 1], pSpikePoints[nCounter - 2], pSpikePoints[nCounter - 2], 2, arraysupport.getScaledSize(5, tg.get_LineThickness()), 5);
                                pSpikePoints[nCounter] = crossPt1;
                                nCounter++;
                                pSpikePoints[nCounter] = crossPt2;
                                nCounter++;
                                //remainder of line
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - arraysupport.getScaledSize(10, tg.get_LineThickness()), 0);	//-4
                            } else {
                                pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - arraysupport.getScaledSize(45, tg.get_LineThickness()), 0);
                            }
                            break;
                        }

                        default: {
                            pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - arraysupport.getScaledSize(30, tg.get_LineThickness()), 0);
                            break;
                        }

                    }
                    if (lineType === TacticalLines.CF) {
                        pSpikePoints[nCounter].style = 0;
                    }
                    nCounter++;
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement - dSpikeSize, 0);

                    if (lineType === TacticalLines.CF
                        || lineType === TacticalLines.CFG
                        || lineType === TacticalLines.CFY) {
                        pSpikePoints[nCounter].style = 9;
                    }

                    nCounter++;
                    pt0 = lineutility.ExtendLineDouble(pLinePoints[j], pSpikePoints[nCounter - 1], dSpikeSize / 2);

                    //the spikes
                    if (pLinePoints[j].x > pLinePoints[j + 1].x) //extend above the line
                    {
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pSpikePoints[nCounter - 1], pt0, 2, dSpikeSize);
                    }
                    if (pLinePoints[j].x < pLinePoints[j + 1].x) //extend below the line
                    {
                        pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pSpikePoints[nCounter - 1], pt0, 3, dSpikeSize);
                    }
                    if (pLinePoints[j].x === pLinePoints[j + 1].x) {
                        pSpikePoints[nCounter] = pt0;
                        if (pLinePoints[j].y < pLinePoints[j + 1].y) //extend left of line
                        {
                            pSpikePoints[nCounter].x = pt0.x - dSpikeSize;
                        } else //extend right of line
                        {
                            pSpikePoints[nCounter].x = pt0.x + dSpikeSize;
                        }
                    }
                    nCounter++;

                    if (lineType === TacticalLines.CF
                        || lineType === TacticalLines.CFG
                        || lineType === TacticalLines.CFY) {
                        pSpikePoints[nCounter - 1].style = 9;
                    }

                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 2], dSpikeSize, 0);
                    //need an extra point for these
                    switch (lineType) {
                        case TacticalLines.CF: {
                            pSpikePoints[nCounter].style = 10;
                            break;
                        }

                        case TacticalLines.CFG:
                        case TacticalLines.CFY: {
                            pSpikePoints[nCounter].style = 10;
                            nCounter++;
                            pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j], pSpikePoints[nCounter - 3], dSpikeSize, 0);
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    nCounter++;
                }

                //use the original line point for the segment end point
                pSpikePoints[nCounter] = pLinePoints[j + 1];
                pSpikePoints[nCounter].style = 0;
                nCounter++;
            }

            for (j = 0; j < nCounter; j++) {
                pLinePoints[j] = pSpikePoints[j];
            }
            pLinePoints[nCounter - 1].style = 5;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetATWallPointsDouble",
                    new RendererException("GetATWallPointsDouble " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return nCounter;
    }

    private static GetRidgePointsDouble(tg: TGLight, pLinePoints: POINT2[], vblSaveCounter: int): int {
        let nCounter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let lCount: int = 0;
            let dLengthSegment: double = 0;
            let dIncrement: double = arraysupport.getScaledSize(20, tg.get_LineThickness());
            let m: ref<number[]> = new ref();
            let pSpikePoints: POINT2[];
            let pt0: POINT2;
            let dSpikeSize: double = arraysupport.getScaledSize(20, tg.get_LineThickness());
            let limit: int = 0;
            let d: double = 0;
            let bolVertical: int = 0;

            m.value = new Array<number>(1);
            lCount = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);

            pSpikePoints = new Array<POINT2>(lCount);
            lineutility.InitializePOINT2Array(pSpikePoints);
            //for(j=0;j<numPts2-1;j++)
            for (j = 0; j < vblSaveCounter - 1; j++) {
                bolVertical = lineutility.CalcTrueSlopeDouble(pLinePoints[j], pLinePoints[j + 1], m);
                dLengthSegment = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                limit = Math.trunc(dLengthSegment / dIncrement);
                if (limit < 1) {
                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j]);
                    nCounter++;
                    pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                    nCounter++;
                    continue;
                }
                for (k = 0; k < limit; k++) {
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -k * dIncrement, 0);
                    nCounter++;
                    d = lineutility.CalcDistanceDouble(pLinePoints[j], pSpikePoints[nCounter - 1]);
                    pt0 = lineutility.ExtendLineDouble(pLinePoints[j + 1], pLinePoints[j], -d - dSpikeSize / 2);

                    //the spikes
                    if (bolVertical !== 0) //segment is not vertical
                    {
                        if (pLinePoints[j].x < pLinePoints[j + 1].x) //extend above the line
                        {
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 2, dSpikeSize);
                        } else //extend below the line
                        {
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 3, dSpikeSize);
                        }
                    } else //segment is vertical
                    {
                        if (pLinePoints[j + 1].y < pLinePoints[j].y) //extend left of the line
                        {
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 0, dSpikeSize);
                        } else //extend right of the line
                        {
                            pSpikePoints[nCounter] = lineutility.ExtendDirectedLine(pLinePoints[j], pLinePoints[j + 1], pt0, 1, dSpikeSize);
                        }
                    }
                    nCounter++;
                    pSpikePoints[nCounter] = lineutility.ExtendLine2Double(pLinePoints[j + 1], pLinePoints[j], -d - dSpikeSize, 0);
                    nCounter++;
                }
                pSpikePoints[nCounter] = new POINT2(pLinePoints[j + 1]);
                nCounter++;
            }

            for (j = 0; j < nCounter; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[j]);
            }
            for (j = nCounter; j < lCount; j++) {
                pLinePoints[j] = new POINT2(pSpikePoints[nCounter - 1]);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetRidgePointsDouble",
                    new RendererException("GetRidgePointsDouble " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return nCounter;
    }

    protected static GetSquallDouble(pLinePoints: POINT2[],
        amplitude: double,
        quantity: int,
        length: double,
        numPoints: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let StartSegPt: POINT2;
            let EndSegPt: POINT2;
            let savePoint1: POINT2 = new POINT2(pLinePoints[0]);
            let savePoint2: POINT2 = new POINT2(pLinePoints[numPoints - 1]);
            let sign: ref<number[]> = new ref();
            let segQty: int = 0;
            let totalQty: int = countsupport.GetSquallQty(pLinePoints, quantity, length, numPoints);
            let pSquallPts: POINT2[] = new Array<POINT2>(totalQty);
            let pSquallSegPts: POINT2[];

            lineutility.InitializePOINT2Array(pSquallPts);
            sign.value = new Array<number>(1);
            sign.value[0] = -1;
            if (totalQty === 0) {
                return 0;
            }

            for (j = 0; j < numPoints - 1; j++) {
                StartSegPt = new POINT2(pLinePoints[j]);
                EndSegPt = new POINT2(pLinePoints[j + 1]);
                segQty = countsupport.GetSquallSegQty(StartSegPt, EndSegPt, quantity, length);
                if (segQty > 0) {
                    pSquallSegPts = new Array<POINT2>(segQty);
                    lineutility.InitializePOINT2Array(pSquallSegPts);
                } else {
                    pSquallPts[counter].x = StartSegPt.x;
                    pSquallPts[counter++].y = StartSegPt.y;
                    pSquallPts[counter].x = EndSegPt.x;
                    pSquallPts[counter++].y = EndSegPt.y;
                    continue;
                }
                sign.value[0] = -1;
                lineutility.GetSquallSegment(StartSegPt, EndSegPt, pSquallSegPts, sign, amplitude, quantity, length);
                for (k = 0; k < segQty; k++) {
                    pSquallPts[counter].x = pSquallSegPts[k].x;
                    pSquallPts[counter].y = pSquallSegPts[k].y;
                    if (k === 0) {
                        pSquallPts[counter] = new POINT2(pLinePoints[j]);
                    }
                    if (k === segQty - 1) {
                        pSquallPts[counter] = new POINT2(pLinePoints[j + 1]);
                    }
                    pSquallPts[counter].style = 0;
                    counter++;
                }
            }
            //load the squall points into the linepoints array
            for (j = 0; j < counter; j++) {
                if (j < totalQty) {
                    pLinePoints[j].x = pSquallPts[j].x;
                    pLinePoints[j].y = pSquallPts[j].y;
                    if (j === 0) {
                        pLinePoints[j] = new POINT2(savePoint1);
                    }
                    if (j === counter - 1) {
                        pLinePoints[j] = new POINT2(savePoint2);
                    }
                    pLinePoints[j].style = pSquallPts[j].style;
                }
            }
            if (counter === 0) {
                for (j = 0; j < pLinePoints.length; j++) {
                    if (j === 0) {
                        pLinePoints[j] = new POINT2(savePoint1);
                    } else {
                        pLinePoints[j] = new POINT2(savePoint2);
                    }
                }
                counter = pLinePoints.length;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetSquallDouble",
                    new RendererException("GetSquallDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    protected static GetSevereSquall(pLinePoints: POINT2[],
        length: double,
        numPoints: int): int {
        let l: int = 0;
        try {
            let quantity: int = 5;
            let j: int = 0;
            let k: int = 0;
            let totalQty: int = countsupport.GetSquallQty(pLinePoints, quantity, length, numPoints) + 2 * numPoints;
            let squallPts: POINT2[] = new Array<POINT2>(totalQty);
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let
                pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();
            let pt5: POINT2 = new POINT2();
            let pt6: POINT2 = new POINT2();
            let
                pt7: POINT2 = new POINT2();
            let pt8: POINT2 = new POINT2();
            let segQty: int = 0;
            let dist: double = 0;

            lineutility.InitializePOINT2Array(squallPts);
            //each segment looks like this: --- V
            for (j = 0; j < numPoints - 1; j++) {
                dist = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                segQty = Math.trunc(dist / length);
                for (k = 0; k < segQty; k++) {
                    pt0 = lineutility.ExtendAlongLineDouble2(pLinePoints[j], pLinePoints[j + 1], k * length);
                    pt1 = lineutility.ExtendAlongLineDouble(pLinePoints[j], pLinePoints[j + 1], k * length + length / 6 * 4);
                    pt1.style = 5;
                    squallPts[l++] = new POINT2(pt0);
                    squallPts[l++] = new POINT2(pt1);
                    pt5 = lineutility.ExtendAlongLineDouble(pLinePoints[j], pLinePoints[j + 1], k * length + length / 6 * 5);
                    pt6 = lineutility.ExtendAlongLineDouble(pLinePoints[j], pLinePoints[j + 1], k * length + length);
                    pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 2, length / 6, 0);   //extend above line
                    pt3 = lineutility.ExtendDirectedLine(pt0, pt5, pt5, 3, length / 6, 0);   //extend below line
                    pt4 = lineutility.ExtendDirectedLine(pt0, pt6, pt6, 2, length / 6, 5);   //extend above line
                    pt4.style = 5;
                    squallPts[l++] = new POINT2(pt2);
                    squallPts[l++] = new POINT2(pt3);
                    squallPts[l++] = new POINT2(pt4);
                }
                //segment remainder
                squallPts[l++] = new POINT2(pLinePoints[j + 1]);
                pt0 = lineutility.ExtendAlongLineDouble(pLinePoints[j + 1], pLinePoints[j], dist - segQty * length);
                pt0.style = 5;
                squallPts[l++] = new POINT2(pt0);
            }
            if (l > pLinePoints.length) {
                l = pLinePoints.length;
            }

            for (j = 0; j < l; j++) {
                if (j < totalQty) {
                    pLinePoints[j] = new POINT2(squallPts[j]);
                } else {
                    break;
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetSevereSquall",
                    new RendererException("GetSevereSquall", exc));
            } else {
                throw exc;
            }
        }
        return l;
    }

    private static GetConvergencePointsDouble(pLinePoints: POINT2[], length: double, vblCounter: int): int {
        let counter: int = vblCounter;
        try {
            let j: int = 0;
            let k: int = 0;
            let d: double = 0;
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let tempPts: POINT2[] = new Array<POINT2>(vblCounter);
            let tempPt: POINT2 = new POINT2();
            let numJags: int = 0;
            //save the original points
            for (j = 0; j < vblCounter; j++) {
                tempPts[j] = new POINT2(pLinePoints[j]);
            }

            //result points begin with the original points,
            //set the last one's linestyle to 5;
            pLinePoints[vblCounter - 1].style = 5;
            for (j = 0; j < vblCounter - 1; j++) {

                pt0 = new POINT2(tempPts[j]);
                pt1 = new POINT2(tempPts[j + 1]);
                d = lineutility.CalcDistanceDouble(pt0, pt1);
                numJags = Math.trunc(d / length);
                //we don't want too small a remainder
                if (d - numJags * length < 5) {
                    numJags -= 1;
                }

                //each section has two spikes: one points above the line
                //the other spike points below the line
                for (k = 0; k < numJags; k++) {
                    //the first spike
                    tempPt = lineutility.ExtendAlongLineDouble(pt0, pt1, k * length + length / 2, 0);
                    pLinePoints[counter++] = new POINT2(tempPt);
                    tempPt = lineutility.ExtendAlongLineDouble(tempPt, pt1, length / 2);
                    tempPt = lineutility.ExtendDirectedLine(pt0, tempPt, tempPt, 2, length / 2, 5);
                    pLinePoints[counter++] = new POINT2(tempPt);
                    //the 2nd spike
                    tempPt = lineutility.ExtendAlongLineDouble(pt0, pt1, (k + 1) * length, 0);
                    pLinePoints[counter++] = new POINT2(tempPt);
                    tempPt = lineutility.ExtendAlongLineDouble(tempPt, pt1, length / 2);
                    tempPt = lineutility.ExtendDirectedLine(pt0, tempPt, tempPt, 3, length / 2, 5);
                    pLinePoints[counter++] = new POINT2(tempPt);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetConvergencePointsDouble",
                    new RendererException("GetConvergencePointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    // Dashes are 2/3*length and spaces are 1/3*length.
    private static GetITDPointsDouble(pLinePoints: POINT2[], length: double, vblCounter: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let d: double = 0;
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let tempPts: POINT2[] = new Array<POINT2>(vblCounter);
            let tempPt: POINT2 = new POINT2();
            let numJags: int = 0;
            let lineStyle: int = 19;
            //save the original points
            for (j = 0; j < vblCounter; j++) {
                tempPts[j] = new POINT2(pLinePoints[j]);
            }

            //result points begin with the original points,
            //set the last one's linestyle to 5;
            //pLinePoints[vblCounter-1].style=5;
            for (j = 0; j < vblCounter - 1; j++) {
                pt0 = new POINT2(tempPts[j]);
                pt1 = new POINT2(tempPts[j + 1]);
                d = lineutility.CalcDistanceDouble(pt0, pt1);
                numJags = Math.trunc(d / length);
                //we don't want too small a remainder
                if (d - numJags * length / 3 * 2 < length / 3) {
                    numJags -= 1;
                }
                if (numJags === 0) {
                    pt0.style = 19;
                    pLinePoints[counter++] = new POINT2(pt0);
                    pt1.style = 5;
                    pLinePoints[counter++] = new POINT2(pt1);
                }

                for (k = 0; k < numJags; k++) {
                    tempPt = lineutility.ExtendAlongLineDouble(pt0, pt1, k * length + length / 3, lineStyle);
                    pLinePoints[counter++] = new POINT2(tempPt);

                    if (k < numJags - 1) {
                        tempPt = lineutility.ExtendAlongLineDouble(tempPt, pt1, length * 2 / 3, 5);
                    } else {
                        tempPt = new POINT2(tempPts[j + 1]);
                        tempPt.style = 5;
                    }
                    pLinePoints[counter++] = new POINT2(tempPt);
                    if (lineStyle === 19) {
                        lineStyle = 25;
                    } else {
                        lineStyle = 19;
                    }
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetITDPointsDouble",
                    new RendererException("GetITDPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    private static GetXPoints(pOriginalLinePoints: POINT2[], XPoints: POINT2[], segmentLength: double, vblCounter: int): int {
        let xCounter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let d: double = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();
            let pt5: POINT2 = new POINT2();
            let pt6: POINT2 = new POINT2();
            let numThisSegment: int = 0;
            let distInterval: double = 0;
            let xSize: double = segmentLength / 6;
            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                numThisSegment = Math.trunc((d - segmentLength) / segmentLength);

                //added 4-19-12
                distInterval = d / numThisSegment;
                for (k = 0; k < numThisSegment; k++) {
                    //pt0=lineutility.ExtendAlongLineDouble(pOriginalLinePoints[j],pOriginalLinePoints[j+1], 10+20*k);
                    pt0 = lineutility.ExtendAlongLineDouble2(pOriginalLinePoints[j], pOriginalLinePoints[j + 1], distInterval / 2 + distInterval * k);
                    pt1 = lineutility.ExtendAlongLineDouble2(pt0, pOriginalLinePoints[j + 1], xSize);
                    pt2 = lineutility.ExtendAlongLineDouble2(pt0, pOriginalLinePoints[j + 1], -xSize);

                    pt3 = lineutility.ExtendDirectedLine(pOriginalLinePoints[j], pt1, pt1, 2, xSize);
                    pt4 = lineutility.ExtendDirectedLine(pOriginalLinePoints[j], pt1, pt1, 3, xSize);
                    pt4.style = 5;
                    pt5 = lineutility.ExtendDirectedLine(pOriginalLinePoints[j], pt2, pt2, 2, xSize);
                    pt6 = lineutility.ExtendDirectedLine(pOriginalLinePoints[j], pt2, pt2, 3, xSize);
                    pt6.style = 5;
                    XPoints[xCounter++] = new POINT2(pt3);
                    XPoints[xCounter++] = new POINT2(pt6);
                    XPoints[xCounter++] = new POINT2(pt5);
                    XPoints[xCounter++] = new POINT2(pt4);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetXPointsDouble",
                    new RendererException("GetXPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return xCounter;
    }

    /**
     * returns a 37 point ellipse
     *
     * @param ptCenter
     * @param ptWidth
     * @param ptHeight
     * @return
     */
    private static getEllipsePoints(ptCenter: POINT2, ptWidth: POINT2, ptHeight: POINT2): POINT2[] | null {
        let pEllipsePoints: POINT2[] | null = null;
        try {
            pEllipsePoints = new Array<POINT2>(37);
            let l: int = 0;
            let dFactor: double = 0;
            let a: double = lineutility.CalcDistanceDouble(ptCenter, ptWidth);
            let b: double = lineutility.CalcDistanceDouble(ptCenter, ptHeight);
            lineutility.InitializePOINT2Array(pEllipsePoints);
            for (l = 1; l < 37; l++) {
                dFactor = (10.0 * l) * Math.PI / 180.0;
                pEllipsePoints[l - 1].x = ptCenter.x + Math.trunc(a * Math.cos(dFactor));
                pEllipsePoints[l - 1].y = ptCenter.y + Math.trunc(b * Math.sin(dFactor));
                pEllipsePoints[l - 1].style = 0;
            }
            pEllipsePoints[36] = new POINT2(pEllipsePoints[0]);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetEllipsePoints",
                    new RendererException("GetEllipsePoints", exc));
            } else {
                throw exc;
            }
        }
        return pEllipsePoints;
    }

    /**
     * Calculate an ellipse and rotate about it's center by azimuth in degrees
     *
     * @param ptCenter
     * @param ptWidth
     * @param ptHeight
     * @param azimuth
     * @return
     */
    private static getRotatedEllipsePoints(ptCenter: POINT2, ptWidth: POINT2, ptHeight: POINT2, azimuth: double, lineType: int): POINT2[] | null {
        let pResultPoints: POINT2[] | null = null;
        try {
            let pEllipsePoints: POINT2[] = new Array<POINT2>(36);
            let l: int = 0;
            let j: int = 0;
            let dFactor: double = 0;
            let a: double = lineutility.CalcDistanceDouble(ptCenter, ptWidth);
            let b: double = lineutility.CalcDistanceDouble(ptCenter, ptHeight);
            lineutility.InitializePOINT2Array(pEllipsePoints);
            for (l = 1; l < 37; l++) {
                dFactor = (10.0 * l) * Math.PI / 180.0;
                //pEllipsePoints[l - 1].x = ptCenter.x + (int) (a * Math.cos(dFactor));
                //pEllipsePoints[l - 1].y = ptCenter.y + (int) (b * Math.sin(dFactor));
                pEllipsePoints[l - 1].x = ptCenter.x + a * Math.cos(dFactor);
                pEllipsePoints[l - 1].y = ptCenter.y + b * Math.sin(dFactor);
                pEllipsePoints[l - 1].style = 0;
            }
            lineutility.RotateGeometryDouble(pEllipsePoints, 36, azimuth - 90);
            pResultPoints = new Array<POINT2>(37);
            for (j = 0; j < 36; j++) {
                pResultPoints[j] = pEllipsePoints[j];
            }
            pResultPoints[36] = pEllipsePoints[0];
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetRotatedEllipsePoints",
                    new RendererException("GetRotatedEllipsePoints", exc));
            } else {
                throw exc;
            }
        }
        return pResultPoints;
    }

    private static GetLVOPoints(pOriginalLinePoints: POINT2[], pLinePoints: POINT2[], ovalWidth: double, segmentLength: double, vblCounter: int): int {
        let lEllipseCounter: int = 0;
        try {
            let dAngle: double = 0;
            let d: double = 0;
            let ovalLength: double = ovalWidth * 2;
            let dFactor: double = 0;
            let lHowManyThisSegment: int = 0;
            let j: int = 0;
            let k: int = 0;
            let l: int = 0;
            let t: int = 0;
            let ptCenter: POINT2 = new POINT2();
            let pEllipsePoints2: POINT2[] = new Array<POINT2>(37);

            let distInterval: double = 0;
            //end declarations
            for (j = 0; j < vblCounter - 1; j++) {
                lineutility.InitializePOINT2Array(pEllipsePoints2);
                d = lineutility.CalcDistanceDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                lHowManyThisSegment = Math.trunc((d - segmentLength) / segmentLength);

                distInterval = d / lHowManyThisSegment;

                dAngle = lineutility.CalcSegmentAngleDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                dAngle = dAngle + Math.PI / 2;
                for (k = 0; k < lHowManyThisSegment; k++) {
                    ptCenter = lineutility.ExtendAlongLineDouble2(pOriginalLinePoints[j], pOriginalLinePoints[j + 1], k * distInterval);
                    for (l = 1; l < 37; l++) {
                        //dFactor = (10.0 * l) * Math.PI / 180.0;
                        dFactor = (20.0 * l) * Math.PI / 180.0;
                        pEllipsePoints2[l - 1].x = ptCenter.x + Math.trunc(ovalWidth * Math.cos(dFactor));
                        pEllipsePoints2[l - 1].y = ptCenter.y + Math.trunc(ovalLength * Math.sin(dFactor));
                        pEllipsePoints2[l - 1].style = 0;
                    }
                    lineutility.RotateGeometryDouble(pEllipsePoints2, 36, Math.trunc(dAngle * 180 / Math.PI));
                    pEllipsePoints2[36] = new POINT2(pEllipsePoints2[35]);
                    pEllipsePoints2[36].style = 5;
                    for (l = 0; l < 37; l++) {
                        pLinePoints[lEllipseCounter] = new POINT2(pEllipsePoints2[l]);
                        lEllipseCounter++;
                    }
                }//end k loop
                //extra ellipse on the final segment at the end of the line
                if (j === vblCounter - 2) {
                    ptCenter = pOriginalLinePoints[j + 1];

                    for (l = 1; l < 37; l++) {
                        dFactor = (20.0 * l) * Math.PI / 180.0;
                        pEllipsePoints2[l - 1].x = ptCenter.x + Math.trunc(ovalWidth * Math.cos(dFactor));
                        pEllipsePoints2[l - 1].y = ptCenter.y + Math.trunc(ovalLength * Math.sin(dFactor));
                        pEllipsePoints2[l - 1].style = 0;
                    }
                    lineutility.RotateGeometryDouble(pEllipsePoints2, 36, Math.trunc(dAngle * 180 / Math.PI));
                    pEllipsePoints2[36] = new POINT2(pEllipsePoints2[35]);
                    pEllipsePoints2[36].style = 5;
                    for (l = 0; l < 37; l++) {
                        pLinePoints[lEllipseCounter] = new POINT2(pEllipsePoints2[l]);
                        lEllipseCounter++;
                    }
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetLVOPointsDouble",
                    new RendererException("GetLVOPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return lEllipseCounter;
    }

    private static GetIcingPointsDouble(pLinePoints: POINT2[], length: double, vblCounter: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let origPoints: POINT2[] = new Array<POINT2>(vblCounter);
            let nDirection: int = -1;
            let k: int = 0;
            let numSegments: int = 0;
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let midPt: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            //save the original points
            for (j = 0; j < vblCounter; j++) {
                origPoints[j] = new POINT2(pLinePoints[j]);
            }
            let distInterval: double = 0;
            for (j = 0; j < vblCounter - 1; j++) {
                //how many segments for this line segment?
                numSegments = Math.trunc(lineutility.CalcDistanceDouble(origPoints[j], origPoints[j + 1]));
                numSegments /= length;
                //4-19-12
                distInterval = lineutility.CalcDistanceDouble(origPoints[j], origPoints[j + 1]) / numSegments;
                //get the direction and the quadrant
                nDirection = arraysupport.GetInsideOutsideDouble2(origPoints[j], origPoints[j + 1], origPoints, vblCounter, j, TacticalLines.ICING);
                for (k = 0; k < numSegments; k++) {
                    //get the parallel segment
                    if (k === 0) {
                        pt0 = new POINT2(origPoints[j]);
                    } else {
                        pt0 = lineutility.ExtendAlongLineDouble(origPoints[j], origPoints[j + 1], k * distInterval, 0);
                    }

                    pt1 = lineutility.ExtendAlongLineDouble(origPoints[j], origPoints[j + 1], k * distInterval + length * 2 / 3, 5);
                    midPt = lineutility.ExtendAlongLineDouble(origPoints[j], origPoints[j + 1], k * distInterval + length / 3, 0);
                    //get the perpendicular segment
                    pt2 = lineutility.ExtendDirectedLine(origPoints[j], origPoints[j + 1], midPt, nDirection, length / 3, 5);
                    pLinePoints[counter] = new POINT2(pt0);
                    pLinePoints[counter + 1] = new POINT2(pt1);
                    pLinePoints[counter + 2] = new POINT2(midPt);
                    pLinePoints[counter + 3] = new POINT2(pt2);
                    counter += 4;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetIcingPointsDouble",
                    new RendererException("GetIcingPointsDouble", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    protected static GetAnchorageDouble(vbPoints2: POINT2[], floatDiameter: double, numPts: int): int {
        let lFlotCounter: int = 0;
        try {
            let j: int = 0;
            let k: int = 0;
            let l: int = 0;
            let x1: int = 0;
            let y1: int = 0;
            let numSegPts: int = -1;
            let lFlotCount: int = 0;
            let lNumSegs: int = 0;
            let dDistance: double = 0;
            let vbPoints: number[];
            let points: number[];
            let points2: number[];
            let pt: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();

            lFlotCount = flot.GetAnchorageCountDouble(vbPoints2, floatDiameter, numPts);
            vbPoints = new Array<number>(2 * numPts);

            for (j = 0; j < numPts; j++) {
                vbPoints[k] = vbPoints2[j].x as int;
                k++;
                vbPoints[k] = vbPoints2[j].y as int;
                k++;
            }
            k = 0;

            let bFlip: ref<number[]> = new ref();
            bFlip.value = new Array<number>(1);
            let lDirection: ref<number[]> = new ref();
            lDirection.value = new Array<number>(1);
            let lLastDirection: ref<number[]> = new ref();
            lLastDirection.value = new Array<number>(1);
            for (l = 0; l < numPts - 1; l++) {
                pt1.x = vbPoints[2 * l];
                pt1.y = vbPoints[2 * l + 1];
                pt2.x = vbPoints[2 * l + 2];
                pt2.y = vbPoints[2 * l + 3];
                //for all segments after the first segment we shorten
                //the line by floatDiameter so the flots will not abut
                if (l > 0) {
                    pt1 = lineutility.ExtendAlongLineDouble(pt1, pt2, floatDiameter);
                }

                dDistance = lineutility.CalcDistanceDouble(pt1, pt2);

                lNumSegs = Math.trunc(dDistance / floatDiameter);

                if (lNumSegs > 0) {
                    points2 = new Array<number>(lNumSegs * 32);
                    numSegPts = flot.GetAnchorageFlotSegment(vbPoints, pt1.x as int, pt1.y as int, pt2.x as int, pt2.y as int, l, floatDiameter, points2, bFlip, lDirection, lLastDirection);
                    points = new Array<number>(numSegPts);

                    for (j = 0; j < numSegPts; j++) {
                        points[j] = points2[j];
                    }

                    for (j = 0; j < numSegPts / 3; j++) //only using half the flots
                    {
                        x1 = points[k];
                        y1 = points[k + 1];
                        k += 3;
                        if (j % 10 === 0) {
                            pt.x = x1;
                            pt.y = y1;
                            pt.style = 5;
                        } else {
                            if ((j + 1) % 10 === 0) {
                                if (lFlotCounter < lFlotCount) {
                                    vbPoints2[lFlotCounter].x = x1;
                                    vbPoints2[lFlotCounter++].y = y1;
                                    vbPoints2[lFlotCounter++] = new POINT2(pt);
                                    continue;
                                } else {
                                    break;
                                }
                            }
                        }

                        if (lFlotCounter < lFlotCount) {
                            vbPoints2[lFlotCounter].x = x1;
                            vbPoints2[lFlotCounter].y = y1;
                            lFlotCounter++;
                        } else {
                            break;
                        }
                    }
                    k = 0;
                } else {
                    if (lFlotCounter < lFlotCount) {
                        vbPoints2[lFlotCounter].x = vbPoints[2 * l];
                        vbPoints2[lFlotCounter].y = vbPoints[2 * l + 1];
                        lFlotCounter++;
                    }
                }
            }
            for (j = lFlotCounter - 1; j < lFlotCount; j++) {
                vbPoints2[j].style = 5;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetAnchorageDouble",
                    new RendererException("GetAnchorageDouble", exc));
            } else {
                throw exc;
            }
        }
        return lFlotCounter;
    }

    private static GetPipePoints(pLinePoints: POINT2[],
        length: double,
        vblCounter: int): int {
        let counter: int = 0;
        try {
            let pOriginalPoints: POINT2[] = new Array<POINT2>(vblCounter);
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let xPoints: POINT2[] = new Array<POINT2>(pLinePoints.length);
            let xCounter: int = 0;
            let j: int = 0;
            let k: int = 0;
            for (j = 0; j < vblCounter; j++) {
                pOriginalPoints[j] = new POINT2(pLinePoints[j]);
            }
            let numSegs: int = 0;
            let d: double = 0;

            lineutility.InitializePOINT2Array(xPoints);
            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pOriginalPoints[j], pOriginalPoints[j + 1]);
                numSegs = Math.trunc(d / length);
                for (k = 0; k < numSegs; k++) {
                    pt0 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * k);
                    pt0.style = 0;
                    pt1 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * k + length / 2);
                    pt1.style = 5;
                    pt2 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * k + length / 2);
                    pt2.style = 20;	//for filled circle
                    pLinePoints[counter++] = new POINT2(pt0);
                    pLinePoints[counter++] = new POINT2(pt1);
                    xPoints[xCounter++] = new POINT2(pt2);
                }
                if (numSegs === 0) {
                    pLinePoints[counter] = new POINT2(pOriginalPoints[j]);
                    pLinePoints[counter++].style = 0;
                    pLinePoints[counter] = new POINT2(pOriginalPoints[j + 1]);
                    pLinePoints[counter++].style = 5;
                } else {
                    pLinePoints[counter] = new POINT2(pLinePoints[counter - 1]);
                    pLinePoints[counter++].style = 0;
                    pLinePoints[counter] = new POINT2(pOriginalPoints[j + 1]);
                    pLinePoints[counter++].style = 5;
                }
            }
            //load the circle points
            for (k = 0; k < xCounter; k++) {
                pLinePoints[counter++] = new POINT2(xPoints[k]);
            }
            //add one more circle
            pLinePoints[counter++] = new POINT2(pLinePoints[counter]);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetPipePoints",
                    new RendererException("GetPipePoints", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    private static GetReefPoints(pLinePoints: POINT2[],
        length: double,
        vblCounter: int): int {
        let counter: int = 0;
        try {
            let pOriginalPoints: POINT2[] = new Array<POINT2>(vblCounter);
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();
            //POINT2 pt5=new POINT2();
            for (let j: int = 0; j < vblCounter; j++) {
                pOriginalPoints[j] = new POINT2(pLinePoints[j]);
            }

            let numSegs: int = 0;
            let direction: int = 0;
            let d: double = 0;
            for (let j: int = 0; j < vblCounter - 1; j++) {
                if (pOriginalPoints[j].x < pOriginalPoints[j + 1].x) {
                    direction = 2;
                } else {
                    direction = 3;
                }

                d = lineutility.CalcDistanceDouble(pOriginalPoints[j], pOriginalPoints[j + 1]);
                numSegs = Math.trunc(d / length);
                for (let k: int = 0; k < numSegs; k++) {
                    pt0 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * k);

                    pt1 = lineutility.ExtendAlongLineDouble2(pt0, pOriginalPoints[j + 1], length * .35);
                    pt1 = lineutility.ExtendDirectedLine(pOriginalPoints[j], pOriginalPoints[j + 1], pt1, direction, length);//was 2

                    pt2 = lineutility.ExtendAlongLineDouble2(pt0, pOriginalPoints[j + 1], length * .4);
                    pt2 = lineutility.ExtendDirectedLine(pOriginalPoints[j], pOriginalPoints[j + 1], pt2, direction, length * .6);//was 2

                    pt3 = lineutility.ExtendAlongLineDouble2(pt0, pOriginalPoints[j + 1], length * .75);
                    pt3 = lineutility.ExtendDirectedLine(pOriginalPoints[j], pOriginalPoints[j + 1], pt3, direction, length * 1.35);//was 2

                    pt4 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * (k + 1));
                    pLinePoints[counter++] = new POINT2(pt0);
                    pLinePoints[counter++] = new POINT2(pt1);
                    pLinePoints[counter++] = new POINT2(pt2);
                    pLinePoints[counter++] = new POINT2(pt3);
                    pLinePoints[counter++] = new POINT2(pt4);
                }
                if (numSegs === 0) {
                    pLinePoints[counter++] = new POINT2(pOriginalPoints[j]);
                    pLinePoints[counter++] = new POINT2(pOriginalPoints[j + 1]);
                }
            }
            pLinePoints[counter++] = new POINT2(pOriginalPoints[vblCounter - 1]);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetReefPoints",
                    new RendererException("GetReefPoints", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    private static GetRestrictedAreaPoints(pLinePoints: POINT2[],
        length: double,
        vblCounter: int): int {
        let counter: int = 0;
        try {
            let pOriginalPoints: POINT2[] = new Array<POINT2>(vblCounter);
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            for (let j: int = 0; j < vblCounter; j++) {
                pOriginalPoints[j] = new POINT2(pLinePoints[j]);
            }
            let direction: int = 0;
            let numSegs: int = 0;
            let d: double = 0;
            for (let j: int = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pOriginalPoints[j], pOriginalPoints[j + 1]);
                numSegs = Math.trunc(d / length);
                if (pOriginalPoints[j].x < pOriginalPoints[j + 1].x) {
                    direction = 3;
                } else {
                    direction = 2;
                }
                for (let k: int = 0; k < numSegs; k++) {
                    pt0 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * k);
                    pt0.style = 0;
                    pt1 = lineutility.ExtendAlongLineDouble2(pOriginalPoints[j], pOriginalPoints[j + 1], length * k + length * 2 / 3);
                    pt1.style = 5;
                    pt2 = lineutility.MidPointDouble(pt0, pt1, 0);
                    //pt3 = lineutility.ExtendDirectedLine(pOriginalPoints[j], pOriginalPoints[j + 1], pt2, 3, 10);
                    pt3 = lineutility.ExtendDirectedLine(pOriginalPoints[j], pOriginalPoints[j + 1], pt2, direction, length * 2 / 3);
                    pt3.style = 5;
                    pLinePoints[counter++] = new POINT2(pt2);
                    pLinePoints[counter++] = new POINT2(pt3);
                    pLinePoints[counter++] = new POINT2(pt0);
                    pLinePoints[counter++] = new POINT2(pt1);
                }
                if (numSegs === 0) {
                    pLinePoints[counter++] = new POINT2(pOriginalPoints[j]);
                    pLinePoints[counter++] = new POINT2(pOriginalPoints[j + 1]);
                }
            }
            pLinePoints[counter - 1].style = 0;
            pLinePoints[counter++] = new POINT2(pOriginalPoints[vblCounter - 1]);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetRestrictedAreaPoints",
                    new RendererException("GetRestrictedAreaPoints", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    //there should be two linetypes depending on scale
    private static getOverheadWire(tg: TGLight, pLinePoints: POINT2[], vblCounter: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let pt: POINT2;
            let pt2: POINT2;
            let pts: Array<POINT2> = new Array();
            for (j = 0; j < vblCounter; j++) {
                pt = new POINT2(pLinePoints[j]);
                //tower
                pt2 = new POINT2(pt);
                pt2.y -= arraysupport.getScaledSize(5, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x -= arraysupport.getScaledSize(5, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.y -= arraysupport.getScaledSize(20, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x += arraysupport.getScaledSize(5, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.y -= arraysupport.getScaledSize(5, tg.get_LineThickness());
                pt2.style = 5;
                pts.push(pt2);
                //low cross piece
                pt2 = new POINT2(pt);
                pt2.x -= arraysupport.getScaledSize(2, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(10, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x += arraysupport.getScaledSize(2, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(10, tg.get_LineThickness());
                pt2.style = 5;
                pts.push(pt2);
                //high cross piece
                pt2 = new POINT2(pt);
                pt2.x -= arraysupport.getScaledSize(7, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(17, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x -= arraysupport.getScaledSize(5, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(20, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x += arraysupport.getScaledSize(5, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(20, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x += arraysupport.getScaledSize(7, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(17, tg.get_LineThickness());
                pt2.style = 5;
                pts.push(pt2);
                //angle piece
                pt2 = new POINT2(pt);
                pt2.y -= arraysupport.getScaledSize(20, tg.get_LineThickness());
                pts.push(pt2);
                pt2 = new POINT2(pt);
                pt2.x += arraysupport.getScaledSize(8, tg.get_LineThickness());
                pt2.y -= arraysupport.getScaledSize(12, tg.get_LineThickness());
                pt2.style = 5;
                pts.push(pt2);
            }
            //connect the towers
            for (j = 0; j < vblCounter - 1; j++) {
                pt = new POINT2(pLinePoints[j]);
                pt2 = new POINT2(pLinePoints[j + 1]);
                if (pt.x < pt2.x) {
                    pt.x += arraysupport.getScaledSize(5, tg.get_LineThickness());
                    pt.y -= arraysupport.getScaledSize(10, tg.get_LineThickness());
                    pt2.x -= arraysupport.getScaledSize(5, tg.get_LineThickness());
                    pt2.y -= arraysupport.getScaledSize(10, tg.get_LineThickness());
                    pt2.style = 5;
                } else {
                    pt.x -= arraysupport.getScaledSize(5, tg.get_LineThickness());
                    pt.y -= arraysupport.getScaledSize(10, tg.get_LineThickness());
                    pt2.x += arraysupport.getScaledSize(5, tg.get_LineThickness());
                    pt2.y -= arraysupport.getScaledSize(10, tg.get_LineThickness());
                    pt2.style = 5;
                }
                pts.push(pt);
                pts.push(pt2);
            }
            for (j = 0; j < pts.length; j++) {
                pLinePoints[j] = pts[j];
                counter++;
            }
            for (j = counter; j < pLinePoints.length; j++) {
                pLinePoints[j] = new POINT2(pLinePoints[counter - 1]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetOverheadWire",
                    new RendererException("GetOverheadWire", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    //private static int linetype=-1; //use for BLOCK, CONTIAN
    /**
     * Calculates the points for the non-channel symbols. The points will be
     * stored in the original POINT2 array in pixels, pLinePoints. The client
     * points occupy the first vblSaveCounter positions in pLinePoints and will
     * be overwritten by the symbol points.
     *
     * @param pLinePoints - OUT - an array of POINT2
     * @param vblCounter the number of points allocated
     * @param vblSaveCounter the number of client points
     *
     * @return the symbol point count
     */
    private static GetLineArray2Double(tg: TGLight,
        pLinePoints: POINT2[],
        vblCounter: int,
        vblSaveCounter: int,
        shapes: Array<Shape2>,
        clipBounds: Rectangle2D | null,
        converter: IPointConversion | null): Array<POINT2> | null {
        let points: Array<POINT2> = new Array();
        try {
            let lineType: int = tg.get_LineType();
            let client: string = CELineArray.getClient();
            if (pLinePoints == null || pLinePoints.length < 2) {
                return null;
            }
            let segments: number[];
            let dMRR: double = 0;
            let n: int = 0;
            let bolVertical: int = 0;
            let dExtendLength: double = 0;
            let dWidth: double = 0;
            let nQuadrant: int = 0;
            let lLinestyle: int = 0;
            let pointCounter: int = 0;
            let offsetX: ref<number[]> = new ref();
            let offsetY: ref<number[]> = new ref();
            let b: double = 0;
            let b1: double = 0;
            let dRadius: double = 0;
            let d1: double = 0;
            let d: double = 0;
            let m: ref<number[]> = new ref();
            let direction: int = 0;
            let nCounter: int = 0;
            let j: int = 0;
            let k: int = 0;
            let middleSegment: int = -1;
            let dMBR: double = lineutility.MBRDistance(pLinePoints, vblSaveCounter);
            let pt0: POINT2 = new POINT2(pLinePoints[0]);
            let  //calculation points for autoshapes
                pt1: POINT2 = new POINT2(pLinePoints[1]);
            let
                pt2: POINT2 = new POINT2(pLinePoints[1]);
            let
                pt3: POINT2 = new POINT2(pLinePoints[0]);
            let
                pt4: POINT2 = new POINT2(pLinePoints[0]);
            let
                pt5: POINT2 = new POINT2(pLinePoints[0]);
            let
                pt6: POINT2 = new POINT2(pLinePoints[0]);
            let
                pt7: POINT2 = new POINT2(pLinePoints[0]);
            let
                pt8: POINT2 = new POINT2(pLinePoints[0]);
            let
                ptYIntercept: POINT2 = new POINT2(pLinePoints[0]);
            let
                ptYIntercept1: POINT2 = new POINT2(pLinePoints[0]);
            let
                ptCenter: POINT2 = new POINT2(pLinePoints[0]);
            let pArrowPoints: POINT2[] = new Array<POINT2>(3);
            let
                arcPts: POINT2[] = new Array<POINT2>(26);
            let
                circlePoints: POINT2[] = new Array<POINT2>(100);
            let pts: POINT2[];
            let pts2: POINT2[];
            let midpt: POINT2 = new POINT2(pLinePoints[0]);
            let midpt1: POINT2 = new POINT2(pLinePoints[0]);

            let pOriginalLinePoints: POINT2[];
            let pUpperLinePoints: POINT2[];
            let pLowerLinePoints: POINT2[];
            let pUpperLowerLinePoints: POINT2[];

            let calcPoint0: POINT2 = new POINT2();
            let
                calcPoint1: POINT2 = new POINT2();
            let
                calcPoint2: POINT2 = new POINT2();
            let
                calcPoint3: POINT2 = new POINT2();
            let
                calcPoint4: POINT2 = new POINT2();
            let ptTemp: POINT2 = new POINT2(pLinePoints[0]);
            let acCounter: int = 0;
            let acPoints: POINT2[] = new Array<POINT2>(6);
            let lFlotCount: int = 0;
            //end declarations

            //Bearing line and others only have 2 points
            if (vblCounter > 2) {
                pt2 = new POINT2(pLinePoints[2]);
            }
            pt0.style = 0;
            pt1.style = 0;
            pt2.style = 0;

            //set jaggylength in clsDISMSupport before the points get bounded
            let xPoints: Array<POINT2>;
            pOriginalLinePoints = new Array<POINT2>(vblSaveCounter);
            for (j = 0; j < vblSaveCounter; j++) {
                pOriginalLinePoints[j] = new POINT2(pLinePoints[j]);
            }

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;

            //resize the array and get the line array
            //for the specified non-channel line type
            switch (lineType) {
                case TacticalLines.OVERHEAD_WIRE: {
                    acCounter = arraysupport.getOverheadWire(tg, pLinePoints, vblSaveCounter);
                    break;
                }

                case TacticalLines.BOUNDARY: {
                    acCounter = pLinePoints.length;
                    break;
                }

                case TacticalLines.REEF: {
                    vblCounter = arraysupport.GetReefPoints(pLinePoints, arraysupport.getScaledSize(40, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.RESTRICTED_AREA: {
                    vblCounter = arraysupport.GetRestrictedAreaPoints(pLinePoints, arraysupport.getScaledSize(15, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.TRAINING_AREA: {
                    dMBR = lineutility.MBRDistance(pLinePoints, vblSaveCounter);
                    d = 20 * DPIScaleFactor;
                    if (dMBR < 60 * DPIScaleFactor) {
                        d = dMBR / 4;
                    }
                    if (d < 5 * DPIScaleFactor) {
                        d = 5 * DPIScaleFactor;
                    }
                    for (j = 0; j < vblSaveCounter; j++) {
                        pLinePoints[j].style = 1;
                    }
                    pLinePoints[vblSaveCounter - 1].style = 5;
                    pt0 = lineutility.CalcCenterPointDouble(pLinePoints, vblSaveCounter - 1);
                    //lineutility.CalcCircleDouble(pt0, 20, 26, arcPts, 0);
                    lineutility.CalcCircleDouble(pt0, d, 26, arcPts, 0);

                    for (j = vblSaveCounter; j < vblSaveCounter + 26; j++) {
                        pLinePoints[j] = new POINT2(arcPts[j - vblSaveCounter]);
                    }
                    pLinePoints[j - 1].style = 5;

                    // inside the circle
                    if (dMBR < 50 * DPIScaleFactor) {
                        //d was used as the circle radius
                        d *= 0.6;
                    } else {
                        d = 12 * DPIScaleFactor;
                    }

                    pt1 = new POINT2(pt0);
                    pt1.y -= d;
                    pt1.style = 0;
                    pt2 = new POINT2(pt1);
                    pt2.y += d;
                    pt2.style = 5;
                    pt3 = new POINT2(pt2);
                    pt3.y += d / 4 + tg.get_LineThickness();
                    pt3.style = 0;
                    pt4 = new POINT2(pt3);
                    pt4.y += d / 4;
                    pLinePoints[j++] = new POINT2(pt1);
                    pLinePoints[j++] = new POINT2(pt2);
                    pLinePoints[j++] = new POINT2(pt3);
                    pt4.style = 5;
                    pLinePoints[j++] = new POINT2(pt4);
                    vblCounter = j;
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.PIPE: {
                    vblCounter = arraysupport.GetPipePoints(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.ANCHORAGE_AREA: {
                    //get the direction and quadrant of the first segment
                    n = arraysupport.GetInsideOutsideDouble2(pLinePoints[0], pLinePoints[1], pLinePoints, vblSaveCounter, 0, lineType);
                    nQuadrant = lineutility.GetQuadrantDouble(pLinePoints[0], pLinePoints[1]);
                    //if the direction and quadrant are not compatible with GetFlotDouble then
                    //reverse the points
                    switch (nQuadrant) {
                        case 4: {
                            switch (n) {
                                case 1:	//extend left
                                case 2: {	//extend below
                                    break;
                                }

                                case 0:	//extend right
                                case 3: {	//extend above
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        case 1: {
                            switch (n) {
                                case 1:	//extend left
                                case 3: {	//extend above
                                    break;
                                }

                                case 0:	//extend right
                                case 2: {	//extend below
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        case 2: {
                            switch (n) {
                                case 1:	//extend left
                                case 2: {	//extend below
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                case 0:	//extend right
                                case 3: {	//extend above
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        case 3: {
                            switch (n) {
                                case 1:	//extend left
                                case 3: {	//extend above
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                case 0:	//extend right
                                case 2: {	//extend above
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    lFlotCount = arraysupport.GetAnchorageDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = lFlotCount;
                    break;
                }

                case TacticalLines.ANCHORAGE_LINE: {
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    acCounter = arraysupport.GetAnchorageDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    break;
                }

                case TacticalLines.LRO: {
                    let xCount: int = countsupport.GetXPointsCount(pOriginalLinePoints, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter);
                    let xPoints2: POINT2[] = new Array<POINT2>(xCount);
                    let lvoCount: int = countsupport.GetLVOCount(pOriginalLinePoints, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter);
                    let lvoPoints: POINT2[] = new Array<POINT2>(lvoCount);
                    xCount = arraysupport.GetXPoints(pOriginalLinePoints, xPoints2, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter);
                    lvoCount = arraysupport.GetLVOPoints(pOriginalLinePoints, lvoPoints, arraysupport.getScaledSize(4, tg.get_LineThickness()), arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter);
                    for (k = 0; k < xCount; k++) {
                        pLinePoints[k] = new POINT2(xPoints2[k]);
                    }
                    if (xCount > 0) {
                        pLinePoints[xCount - 1].style = 5;
                    }
                    for (k = 0; k < lvoCount; k++) {
                        pLinePoints[xCount + k] = new POINT2(lvoPoints[k]);
                    }
                    acCounter = xCount + lvoCount;
                    break;
                }

                case TacticalLines.UNDERCAST: {
                    if (pLinePoints[0].x < pLinePoints[1].x) {
                        lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    }

                    lFlotCount = flot.GetFlotDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = lFlotCount;
                    break;
                }

                case TacticalLines.LVO: {
                    acCounter = arraysupport.GetLVOPoints(pOriginalLinePoints, pLinePoints, arraysupport.getScaledSize(4, tg.get_LineThickness()), arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    break;
                }

                case TacticalLines.ICING: {
                    vblCounter = arraysupport.GetIcingPointsDouble(pLinePoints, arraysupport.getScaledSize(15, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.MVFR: {
                    //get the direction and quadrant of the first segment
                    n = arraysupport.GetInsideOutsideDouble2(pLinePoints[0], pLinePoints[1], pLinePoints, vblSaveCounter, 0, lineType);
                    nQuadrant = lineutility.GetQuadrantDouble(pLinePoints[0], pLinePoints[1]);
                    //if the direction and quadrant are not compatible with GetFlotDouble then
                    //reverse the points
                    switch (nQuadrant) {
                        case 4: {
                            switch (n) {
                                case 0:	//extend left
                                case 3: {	//extend below
                                    break;
                                }

                                case 1:	//extend right
                                case 2: {	//extend above
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        case 1: {
                            switch (n) {
                                case 0:	//extend left
                                case 2: {	//extend above
                                    break;
                                }

                                case 1:	//extend right
                                case 3: {	//extend below
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        case 2: {
                            switch (n) {
                                case 0:	//extend left
                                case 3: {	//extend below
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                case 1:	//extend right
                                case 2: {	//extend above
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        case 3: {
                            switch (n) {
                                case 0:	//extend left
                                case 2: {	//extend above
                                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                                    break;
                                }

                                case 1:	//extend right
                                case 3: {	//extend above
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    lFlotCount = flot.GetFlotDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = lFlotCount;
                    break;
                }

                case TacticalLines.ITD: {
                    acCounter = arraysupport.GetITDPointsDouble(pLinePoints, arraysupport.getScaledSize(15, tg.get_LineThickness()), vblSaveCounter);
                    break;
                }

                case TacticalLines.CONVERGENCE: {
                    acCounter = arraysupport.GetConvergencePointsDouble(pLinePoints, arraysupport.getScaledSize(10, tg.get_LineThickness()), vblSaveCounter);
                    break;
                }

                case TacticalLines.RIDGE: {
                    vblCounter = arraysupport.GetRidgePointsDouble(tg, pLinePoints, vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.TROUGH:
                case TacticalLines.UPPER_TROUGH:
                case TacticalLines.INSTABILITY:
                case TacticalLines.SHEAR: {
                    vblCounter = arraysupport.GetSquallDouble(pLinePoints, arraysupport.getScaledSize(10, tg.get_LineThickness()), 6, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.CABLE: {
                    vblCounter = arraysupport.GetSquallDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), 6, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.SQUALL: {
                    vblCounter = arraysupport.GetSevereSquall(pLinePoints, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.SF:
                case TacticalLines.USF:
                case TacticalLines.SFG:
                case TacticalLines.SFY: {
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    vblCounter = flot.GetSFPointsDouble(tg, pLinePoints, vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.OFY: {
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    vblCounter = flot.GetOFYPointsDouble(tg, pLinePoints, vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.OCCLUDED:
                case TacticalLines.UOF: {
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    vblCounter = flot.GetOccludedPointsDouble(tg, pLinePoints, vblSaveCounter);
                    for (j = 0; j < vblSaveCounter; j++) {
                        pLinePoints[vblCounter + j] = pOriginalLinePoints[j];
                    }
                    vblCounter += vblSaveCounter;
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.WF:
                case TacticalLines.UWF: {
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    lFlotCount = flot.GetFlot2Double(tg, pLinePoints, vblSaveCounter);
                    for (j = 0; j < vblSaveCounter; j++) {
                        pLinePoints[vblCounter - vblSaveCounter + j] = pOriginalLinePoints[j];
                    }
                    acCounter = lFlotCount + vblSaveCounter;
                    break;
                }

                case TacticalLines.WFG:
                case TacticalLines.WFY: {
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);
                    lFlotCount = flot.GetFlot2Double(tg, pLinePoints, vblSaveCounter);
                    acCounter = lFlotCount;
                    break;
                }

                case TacticalLines.CFG:
                case TacticalLines.CFY: {
                    vblCounter = arraysupport.GetATWallPointsDouble(tg, pLinePoints, vblSaveCounter);
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.CF:
                case TacticalLines.UCF: {
                    vblCounter = arraysupport.GetATWallPointsDouble(tg, pLinePoints, vblSaveCounter);
                    pLinePoints[vblCounter - 1].style = 5;
                    for (j = 0; j < vblSaveCounter; j++) {
                        pLinePoints[vblCounter + j] = pOriginalLinePoints[j];
                    }
                    vblCounter += vblSaveCounter;
                    pLinePoints[vblCounter - 1].style = 5;
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.IL:
                case TacticalLines.PLANNED:
                case TacticalLines.ESR1:
                case TacticalLines.ESR2: {
                    lineutility.LineRelativeToLine(pLinePoints[0], pLinePoints[1], pLinePoints[2], pt0, pt1);
                    d = lineutility.CalcDistanceDouble(pLinePoints[0], pt0);
                    pt4 = lineutility.ExtendLineDouble(pt0, pLinePoints[0], d);
                    lineutility.LineRelativeToLine(pLinePoints[0], pLinePoints[1], pt4, pt2, pt3);
                    pLinePoints[0] = new POINT2(pt0);
                    pLinePoints[1] = new POINT2(pt1);
                    pLinePoints[2] = new POINT2(pt3);
                    pLinePoints[3] = new POINT2(pt2);
                    switch (lineType) {
                        case TacticalLines.IL:
                        case TacticalLines.ESR2: {
                            pLinePoints[0].style = 0;
                            pLinePoints[1].style = 5;
                            pLinePoints[2].style = 0;
                            break;
                        }

                        case TacticalLines.PLANNED: {
                            pLinePoints[0].style = 1;
                            pLinePoints[1].style = 5;
                            pLinePoints[2].style = 1;
                            break;
                        }

                        case TacticalLines.ESR1: {
                            pLinePoints[1].style = 5;
                            if (pt0.x <= pt1.x) {
                                if (pLinePoints[1].y <= pLinePoints[2].y) {
                                    pLinePoints[0].style = 0;
                                    pLinePoints[2].style = 1;
                                } else {
                                    pLinePoints[0].style = 1;
                                    pLinePoints[2].style = 0;
                                }
                            } else {
                                if (pLinePoints[1].y >= pLinePoints[2].y) {
                                    pLinePoints[0].style = 0;
                                    pLinePoints[2].style = 1;
                                } else {
                                    pLinePoints[0].style = 1;
                                    pLinePoints[2].style = 0;
                                }
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    acCounter = 4;
                    break;
                }

                case TacticalLines.FORDSITE: {
                    lineutility.LineRelativeToLine(pLinePoints[0], pLinePoints[1], pLinePoints[2], pt0, pt1);
                    pLinePoints[0].style = 1;
                    pLinePoints[1].style = 5;
                    pLinePoints[2] = new POINT2(pt0);
                    pLinePoints[2].style = 1;
                    pLinePoints[3] = new POINT2(pt1);
                    pLinePoints[3].style = 5;
                    acCounter = 4;
                    break;
                }

                case TacticalLines.ROADBLK: {
                    pts = new Array<POINT2>(4);
                    for (j = 0; j < 4; j++) {
                        pts[j] = new POINT2(pLinePoints[j]);
                    }
                    dRadius = lineutility.CalcDistanceDouble(pLinePoints[0], pLinePoints[1]);
                    d = lineutility.CalcDistanceToLineDouble(pLinePoints[0], pLinePoints[1], pLinePoints[2]);

                    //first two lines
                    pLinePoints[0] = lineutility.ExtendTrueLinePerpDouble(pts[0], pts[1], pts[1], d, 0);
                    pLinePoints[1] = lineutility.ExtendTrueLinePerpDouble(pts[0], pts[1], pts[0], d, 5);
                    pLinePoints[2] = lineutility.ExtendTrueLinePerpDouble(pts[0], pts[1], pts[1], -d, 0);
                    pLinePoints[3] = lineutility.ExtendTrueLinePerpDouble(pts[0], pts[1], pts[0], -d, 5);

                    midpt = lineutility.MidPointDouble(pts[0], pts[1], 0);
                    //move the midpoint
                    midpt = lineutility.ExtendLineDouble(pts[0], midpt, d);

                    //the next line
                    pLinePoints[4] = lineutility.ExtendAngledLine(pts[0], pts[1], midpt, 105, dRadius / 2);
                    pLinePoints[5] = lineutility.ExtendAngledLine(pts[0], pts[1], midpt, -75, dRadius / 2);
                    pLinePoints[5].style = 5;

                    //recompute the original midpt because it was moved
                    midpt = lineutility.MidPointDouble(pts[0], pts[1], 0);
                    //move the midpoint
                    midpt = lineutility.ExtendLineDouble(pts[1], midpt, d);

                    //the last line
                    pLinePoints[6] = lineutility.ExtendAngledLine(pts[0], pts[1], midpt, 105, dRadius / 2);
                    pLinePoints[7] = lineutility.ExtendAngledLine(pts[0], pts[1], midpt, -75, dRadius / 2);
                    pLinePoints[7].style = 5;

                    acCounter = 8;
                    break;
                }

                case TacticalLines.AIRFIELD: {
                    arraysupport.AirfieldCenterFeature(pLinePoints, vblCounter);
                    acCounter = vblCounter;
                    //FillPoints(pLinePoints,acCounter,points);
                    break;
                }

                case TacticalLines.PNO:
                case TacticalLines.PLD:
                case TacticalLines.CFL: {
                    for (j = 0; j < vblCounter; j++) {
                        pLinePoints[j].style = 1;
                    }

                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.FENCED: {
                    arraysupport.FillPoints(pLinePoints, vblCounter, points);
                    xPoints = lineutility.LineOfXPoints(tg, pOriginalLinePoints);
                    for (j = 0; j < xPoints.length; j++) {
                        points.push(xPoints[j] as POINT2);
                    }

                    acCounter = points.length;
                    break;
                }

                case TacticalLines.FOXHOLE: {
                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);

                    if (bolVertical === 0) //line is vertical
                    {
                        if (pt0.y > pt1.y) {
                            direction = 0;
                        } else {
                            direction = 1;
                        }
                    }
                    if (bolVertical !== 0 && m.value[0] <= 1) {
                        if (pt0.x < pt1.x) {
                            direction = 3;
                        } else {
                            direction = 2;
                        }
                    }
                    if (bolVertical !== 0 && m.value[0] > 1) {
                        if (pt0.x < pt1.x && pt0.y > pt1.y) {
                            direction = 1;
                        }
                        if (pt0.x < pt1.x && pt0.y < pt1.y) {
                            direction = 0;
                        }

                        if (pt0.x > pt1.x && pt0.y > pt1.y) {
                            direction = 1;
                        }
                        if (pt0.x > pt1.x && pt0.y < pt1.y) {
                            direction = 0;
                        }
                    }

                    if (dMBR / 20 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 20 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR < 250 * DPIScaleFactor) {
                        dMBR = 250 * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }

                    pLinePoints[0] = lineutility.ExtendDirectedLine(pt0, pt1, pt0, direction, dMBR / 20);
                    pLinePoints[1] = new POINT2(pt0);
                    pLinePoints[2] = new POINT2(pt1);
                    pLinePoints[3] = lineutility.ExtendDirectedLine(pt0, pt1, pt1, direction, dMBR / 20);
                    acCounter = 4;
                    break;
                }

                case TacticalLines.ISOLATE:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH: {
                    arraysupport.GetIsolatePointsDouble(pLinePoints, lineType, converter);
                    acCounter = 50;
                    break;
                }

                case TacticalLines.OCCUPY: {
                    arraysupport.GetIsolatePointsDouble(pLinePoints, lineType, converter);
                    acCounter = 32;
                    break;
                }

                case TacticalLines.RETAIN: {
                    arraysupport.GetIsolatePointsDouble(pLinePoints, lineType, converter);
                    acCounter = 75;
                    break;
                }

                case TacticalLines.SECURE: {
                    arraysupport.GetIsolatePointsDouble(pLinePoints, lineType, converter);
                    acCounter = 29;
                    break;
                }

                case TacticalLines.TURN: {
                    // Switch first and last point. Order changed in 2525C
                    let swapPt: POINT2 = pLinePoints[0];
                    pLinePoints[0] = pLinePoints[1];
                    pLinePoints[1] = swapPt;
                    arraysupport.GetIsolatePointsDouble(pLinePoints, lineType, null);
                    acCounter = 29;
                    break;
                }

                case TacticalLines.ENCIRCLE:
                case TacticalLines.ZONE:
                case TacticalLines.OBSAREA:
                case TacticalLines.OBSFAREA:
                case TacticalLines.STRONG:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT: {
                    acCounter = arraysupport.GetZONEPointsDouble2(tg, pLinePoints, vblSaveCounter);
                    break;
                }

                case TacticalLines.ATWALL:
                case TacticalLines.LINE: {  //7-9-07
                    acCounter = arraysupport.GetATWallPointsDouble2(tg, pLinePoints, vblSaveCounter);
                    break;
                }

                case TacticalLines.SC:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC:
                case TacticalLines.LLTR:	//added 5-4-07
                case TacticalLines.SAAFR:	//these have multiple segments
                case TacticalLines.AC: {
                    let bolSegmentAC: boolean = false;
                    //uncomment the next line if the air corridor is segmented
                    bolSegmentAC = true;
                    dMRR = arraysupport.dACP;
                    lineutility.InitializePOINT2Array(acPoints);
                    lineutility.InitializePOINT2Array(arcPts);
                    acCounter = 0;
                    if (!bolSegmentAC) {
                        for (j = 0; j < vblSaveCounter; j++) {
                            if (pOriginalLinePoints[j].style <= 0) {
                                pOriginalLinePoints[j].style = 1; //was 14
                            }
                        }
                    }
                    //get the SAAFR segments
                    for (j = 0; j < vblSaveCounter - 1; j++) {
                        //diagnostic: use style member for dMBR
                        dMBR = pOriginalLinePoints[j].style;
                        acPoints[0] = new POINT2(pOriginalLinePoints[j]);
                        acPoints[1] = new POINT2(pOriginalLinePoints[j + 1]);
                        lineutility.GetSAAFRSegment(acPoints, lineType, dMBR);//was dMRR
                        for (k = 0; k < 6; k++) {
                            pLinePoints[acCounter] = new POINT2(acPoints[k]);
                            acCounter++;
                        }
                    }
                    //get the circles
                    let currentCircleSize: int = 0;
                    if (!bolSegmentAC) {
                        for (j = 0; j < vblSaveCounter - 1; j++) {
                            currentCircleSize = pOriginalLinePoints[j].style;
                            //nextCircleSize=pOriginalLinePoints[j+1].style;                        

                            //draw the circle at the segment front end
                            arcPts[0] = new POINT2(pOriginalLinePoints[j]);
                            //diagnostic: use style member for dMBR
                            dMBR = currentCircleSize;
                            lineutility.CalcCircleDouble(arcPts[0], dMBR, 26, arcPts, 0);//was dMRR
                            arcPts[25].style = 5;
                            for (k = 0; k < 26; k++) {
                                pLinePoints[acCounter] = new POINT2(arcPts[k]);
                                acCounter++;
                            }

                            //draw the circle at the segment back end
                            arcPts[0] = new POINT2(pOriginalLinePoints[j + 1]);
                            dMBR = currentCircleSize;
                            lineutility.CalcCircleDouble(arcPts[0], dMBR, 26, arcPts, 0);//was dMRR
                            arcPts[25].style = 5;
                            for (k = 0; k < 26; k++) {
                                pLinePoints[acCounter] = new POINT2(arcPts[k]);
                                acCounter++;
                            }
                        }
                    }
                    else    //segmented air corridors 
                    {
                        let lastCircleSize: int = 0;
                        let lastCirclePoint: POINT2 = pOriginalLinePoints[0];
                        for (j = 0; j < vblSaveCounter; j++) {
                            currentCircleSize = pOriginalLinePoints[j].style;
                            if (j === 0) {
                                lastCircleSize = currentCircleSize;
                                lastCirclePoint = pOriginalLinePoints[j];
                                continue;
                            }
                            if (currentCircleSize < 0) {
                                continue;
                            }
                            //the current circle point
                            arcPts[0] = new POINT2(pOriginalLinePoints[j]);
                            dMBR = lastCircleSize;
                            lineutility.CalcCircleDouble(arcPts[0], dMBR, 26, arcPts, 0);
                            arcPts[25].style = 5;
                            for (k = 0; k < 26; k++) {
                                pLinePoints[acCounter] = new POINT2(arcPts[k]);
                                acCounter++;
                            }
                            //the previous circle point
                            arcPts[0] = new POINT2(lastCirclePoint);
                            lineutility.CalcCircleDouble(arcPts[0], dMBR, 26, arcPts, 0);
                            arcPts[25].style = 5;
                            for (k = 0; k < 26; k++) {
                                pLinePoints[acCounter] = new POINT2(arcPts[k]);
                                acCounter++;
                            }
                            //set the last values
                            lastCircleSize = currentCircleSize;
                            lastCirclePoint = pOriginalLinePoints[j];
                        }
                    }
                    break;
                }

                case TacticalLines.MINED:
                case TacticalLines.UXO:
                case TacticalLines.ACOUSTIC:
                case TacticalLines.ACOUSTIC_AMB:
                case TacticalLines.BEARING:
                case TacticalLines.BEARING_J:
                case TacticalLines.BEARING_RDF:
                case TacticalLines.ELECTRO:
                case TacticalLines.BEARING_EW:
                case TacticalLines.TORPEDO:
                case TacticalLines.OPTICAL: {
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.MSDZ: {
                    lineutility.InitializePOINT2Array(circlePoints);
                    pt3 = new POINT2(pLinePoints[3]);
                    //dRadius = lineutility.CalcDistanceDouble(pt0, pt1);
                    if (converter == null) {
                        dRadius = lineutility.CalcDistanceDouble(pt0, pt1);
                        lineutility.CalcCircleDouble(pt0, dRadius, 100,
                            circlePoints, 0);
                    }
                    else {
                        //use the converter
                        lineutility.CalcCircleDouble2(pt0, pt1, 100,
                            circlePoints, converter);
                    }

                    for (j = 0; j < 100; j++) {
                        pLinePoints[j] = new POINT2(circlePoints[j]);
                    }
                    pLinePoints[99].style = 5;
                    //dRadius = lineutility.CalcDistanceDouble(pt0, pt2);
                    if (converter == null) {
                        dRadius = lineutility.CalcDistanceDouble(pt0, pt2);
                        lineutility.CalcCircleDouble(pt0, dRadius, 100,
                            circlePoints, 0);
                    }
                    else {

                        lineutility.CalcCircleDouble2(pt0, pt2, 100,
                            circlePoints, converter);
                    }

                    for (j = 0; j < 100; j++) {
                        pLinePoints[100 + j] = new POINT2(circlePoints[j]);
                    }
                    pLinePoints[199].style = 5;
                    //dRadius = lineutility.CalcDistanceDouble(pt0, pt3);
                    acCounter = vblCounter;
                    //FillPoints(pLinePoints,acCounter,points);
                    break;
                }

                case TacticalLines.CONVOY: {
                    if (dMBR < 150 * DPIScaleFactor) {
                        dMBR = 150 * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }
                    dWidth = dMBR / 25;

                    pt0 = new POINT2(pLinePoints[0]);
                    pt1 = new POINT2(pLinePoints[1]);

                    bolVertical = lineutility.CalcTrueSlopeDouble(pt1, pt0, m);
                    pt0 = lineutility.ExtendLine2Double(pt1, pt0, -dWidth * 3, 0);
                    if (m.value[0] < 1) {
                        pLinePoints[0] = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 2, dWidth);
                        pLinePoints[1] = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 2, dWidth);
                        pLinePoints[2] = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 3, dWidth);
                        pLinePoints[3] = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 3, dWidth);
                    } else {
                        pLinePoints[0] = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 0, dWidth);
                        pLinePoints[1] = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 0, dWidth);
                        pLinePoints[2] = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 1, dWidth);
                        pLinePoints[3] = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 1, dWidth);
                    }
                    pt2 = lineutility.ExtendLineDouble(pt1, pt0, dWidth * 3);
                    lineutility.GetArrowHead4Double(pt0, pt2, Math.trunc(dWidth * 3), Math.trunc(dWidth * 3), pArrowPoints, 0);

                    d = lineutility.CalcDistanceDouble(pLinePoints[0], pArrowPoints[0]);
                    d1 = lineutility.CalcDistanceDouble(pLinePoints[3], pArrowPoints[0]);
                    pLinePoints[3].style = 5;
                    if (d < d1) {
                        pLinePoints[4] = new POINT2(pLinePoints[0]);
                        pLinePoints[4].style = 0;
                        pLinePoints[5] = new POINT2(pArrowPoints[0]);
                        pLinePoints[5].style = 0;
                        pLinePoints[6] = new POINT2(pArrowPoints[1]);
                        pLinePoints[6].style = 0;
                        pLinePoints[7] = new POINT2(pArrowPoints[2]);
                        pLinePoints[7].style = 0;
                        pLinePoints[8] = new POINT2(pLinePoints[3]);
                    } else {
                        pLinePoints[4] = pLinePoints[3];
                        pLinePoints[4].style = 0;
                        pLinePoints[5] = pArrowPoints[0];
                        pLinePoints[5].style = 0;
                        pLinePoints[6] = pArrowPoints[1];
                        pLinePoints[6].style = 0;
                        pLinePoints[7] = pArrowPoints[2];
                        pLinePoints[7].style = 0;
                        pLinePoints[8] = pLinePoints[0];
                    }

                    acCounter = 9;
                    //FillPoints(pLinePoints,acCounter,points);
                    break;
                }

                case TacticalLines.HCONVOY: {
                    if (dMBR < 150 * DPIScaleFactor) {
                        dMBR = 150 * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }
                    dWidth = dMBR / 25;

                    pt0 = new POINT2(pLinePoints[0]);
                    pt1 = new POINT2(pLinePoints[1]);

                    pt2 = lineutility.ExtendAlongLineDouble(pt0, pt1, dWidth * 2); // Arrow point
                    lineutility.GetArrowHead4Double(pt0, pt2, Math.trunc(dWidth * 2), Math.trunc(dWidth * 2), pArrowPoints, 0);

                    bolVertical = lineutility.CalcTrueSlopeDouble(pt1, pt2, m);
                    if (m.value[0] < 1) {
                        pLinePoints[0] = lineutility.ExtendDirectedLine(pt2, pt1, pt2, lineutility.extend_above, dWidth);
                        pLinePoints[1] = lineutility.ExtendDirectedLine(pt2, pt1, pt1, lineutility.extend_above, dWidth);
                        pLinePoints[2] = lineutility.ExtendDirectedLine(pt2, pt1, pt1, lineutility.extend_below, dWidth);
                        pLinePoints[3] = lineutility.ExtendDirectedLine(pt2, pt1, pt2, lineutility.extend_below, dWidth);
                    } else {
                        pLinePoints[0] = lineutility.ExtendDirectedLine(pt2, pt1, pt2, lineutility.extend_left, dWidth);
                        pLinePoints[1] = lineutility.ExtendDirectedLine(pt2, pt1, pt1, lineutility.extend_left, dWidth);
                        pLinePoints[2] = lineutility.ExtendDirectedLine(pt2, pt1, pt1, lineutility.extend_right, dWidth);
                        pLinePoints[3] = lineutility.ExtendDirectedLine(pt2, pt1, pt2, lineutility.extend_right, dWidth);
                    }

                    pLinePoints[4] = new POINT2(pLinePoints[0]);
                    pLinePoints[5] = new POINT2(pt2);
                    pLinePoints[5].style = 0;

                    pLinePoints[6] = new POINT2(pArrowPoints[1]);
                    pLinePoints[7] = new POINT2(pArrowPoints[0]);
                    pLinePoints[8] = new POINT2(pArrowPoints[2]);
                    pLinePoints[8].style = 0;
                    pLinePoints[9] = new POINT2(pArrowPoints[1]);

                    acCounter = 10;
                    //FillPoints(pLinePoints,acCounter,points);
                    break;
                }

                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.ROUTE_ALT: {
                    nCounter = vblSaveCounter as int;
                    pLinePoints[vblSaveCounter - 1].style = 5;
                    for (j = 0; j < vblSaveCounter - 1; j++) {
                        d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                        if (d < 20) //too short
                        {
                            continue;
                        }
                        pt0 = new POINT2(pLinePoints[j]);
                        pt1 = new POINT2(pLinePoints[j + 1]);
                        pt2 = lineutility.ExtendLine2Double(pLinePoints[j], pLinePoints[j + 1], -3 * d / 4, 0);
                        pt3 = lineutility.ExtendLine2Double(pLinePoints[j], pLinePoints[j + 1], -1 * d / 4, 5);
                        let distFromLine: double = 10 * DPIScaleFactor;
                        direction = arraysupport.SupplyRouteArrowSide(pLinePoints[j], pLinePoints[j + 1]);
                        pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt2, direction, distFromLine);
                        pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt3, direction, distFromLine);
                        pLinePoints[nCounter] = new POINT2(pt2);
                        nCounter++;
                        pLinePoints[nCounter] = new POINT2(pt3);
                        nCounter++;

                        d = distFromLine;
                        if (dMBR / 20 < arraysupport.minLength * DPIScaleFactor) {
                            d = 5 * DPIScaleFactor;
                        }

                        lineutility.GetArrowHead4Double(pt2, pt3, d as int, d as int,
                            pArrowPoints, 0);

                        for (k = 0; k < 3; k++) {
                            pLinePoints[nCounter] = new POINT2(pArrowPoints[k]);
                            nCounter++;
                        }

                        if (lineType === TacticalLines.MSR_ALT || lineType === TacticalLines.ASR_ALT || lineType === TacticalLines.ROUTE_ALT) {
                            lineutility.GetArrowHead4Double(pt3, pt2, d as int, d as int,
                                pArrowPoints, 0);

                            for (k = 0; k < 3; k++) {
                                pLinePoints[nCounter] = new POINT2(pArrowPoints[k]);
                                nCounter++;
                            }
                        }
                        if (lineType === TacticalLines.MSR_TWOWAY || lineType === TacticalLines.ASR_TWOWAY) {
                            distFromLine = 15 * DPIScaleFactor;
                            pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt2, direction, distFromLine);
                            pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt3, direction, distFromLine);

                            pLinePoints[nCounter] = new POINT2(pt2);
                            nCounter++;
                            pLinePoints[nCounter] = new POINT2(pt3);
                            nCounter++;
                            lineutility.GetArrowHead4Double(pt3, pt2, d as int, d as int,
                                pArrowPoints, 0);

                            for (k = 0; k < 3; k++) {
                                pLinePoints[nCounter] = new POINT2(pArrowPoints[k]);
                                nCounter++;
                            }
                        }
                    }
                    acCounter = nCounter;
                    break;
                }

                case TacticalLines.FORDIF: {
                    lineutility.LineRelativeToLine(pLinePoints[0], pLinePoints[1], pLinePoints[2], pt4, pt5);   //as pt2,pt3
                    pLinePoints[2] = new POINT2(pt5);//was pt3
                    pLinePoints[3] = new POINT2(pt4);//was pt2

                    for (j = 0; j < vblCounter; j++) {
                        pLinePoints[j].style = 1;
                    }

                    pt0 = lineutility.MidPointDouble(pLinePoints[0], pLinePoints[1], 0);
                    pt1 = lineutility.MidPointDouble(pLinePoints[2], pLinePoints[3], 0);
                    let savepoints: POINT2[] | null;
                    let drawJaggies: boolean = true;
                    if (clipBounds != null) {
                        let ul: POINT2 = new POINT2(clipBounds.getMinX(), clipBounds.getMinY());
                        let lr: POINT2 = new POINT2(clipBounds.getMaxX(), clipBounds.getMaxY());
                        savepoints = lineutility.BoundOneSegment(pt0, pt1, ul, lr);
                        if (savepoints != null && savepoints.length > 1) {
                            pt0 = savepoints[0];
                            pt1 = savepoints[1];
                        } else {
                            savepoints = new Array<POINT2>(2);
                            savepoints[0] = new POINT2(pt0);
                            savepoints[1] = new POINT2(pt1);
                            drawJaggies = false;
                        }
                    }

                    midpt = lineutility.MidPointDouble(pt0, pt1, 0);
                    let dist0: double = lineutility.CalcDistanceDouble(midpt, pt0);
                    let dist1: double = lineutility.CalcDistanceDouble(midpt, pt1);

                    if (dist0 > dist1) {
                        lineutility.LineRelativeToLine(pLinePoints[2], pLinePoints[3], pt0, pt4, pt5);
                        pLinePoints[0] = new POINT2(pt5.x, pt5.y, 1);
                        pLinePoints[1] = new POINT2(pt4.x, pt4.y, 1);
                    } else {
                        lineutility.LineRelativeToLine(pLinePoints[0], pLinePoints[1], pt1, pt4, pt5);
                        pLinePoints[2] = new POINT2(pt5.x, pt5.y, 1);
                        pLinePoints[3] = new POINT2(pt4.x, pt4.y, 1);
                    }

                    //end section
                    //calculate start, end points for upper and lower lines
                    //across the middle
                    let spikeLength: double = arraysupport.getScaledSize(10, tg.get_LineThickness());
                    pt2 = lineutility.ExtendLine2Double(pLinePoints[0], pt0, -spikeLength, 0);
                    pt3 = lineutility.ExtendLine2Double(pLinePoints[3], pt1, -spikeLength, 0);
                    pt4 = lineutility.ExtendLine2Double(pLinePoints[0], pt0, spikeLength, 0);
                    pt5 = lineutility.ExtendLine2Double(pLinePoints[3], pt1, spikeLength, 0);

                    dWidth = lineutility.CalcDistanceDouble(pt0, pt1);

                    pointCounter = 4;
                    n = 1;
                    pLinePoints[pointCounter] = new POINT2(pt0);
                    pLinePoints[pointCounter].style = 0;
                    pointCounter++;
                    if (drawJaggies) {
                        while (dExtendLength < dWidth - spikeLength) {
                            dExtendLength = n as double * spikeLength / 2;
                            pLinePoints[pointCounter] = lineutility.ExtendLine2Double(pt2, pt3, dExtendLength - dWidth, 0);
                            pointCounter++;
                            n++;
                            //dExtendLength = (double) n * 10;
                            dExtendLength = n as double * spikeLength / 2;
                            pLinePoints[pointCounter] = lineutility.ExtendLine2Double(pt4, pt5, dExtendLength - dWidth, 0);
                            pointCounter++;
                            if (pointCounter >= pLinePoints.length - 1) {
                                break;
                            }
                            n++;
                        }
                    }
                    pLinePoints[pointCounter] = new POINT2(pt1);
                    pLinePoints[pointCounter].style = 5;
                    pointCounter++;
                    acCounter = pointCounter;
                    break;
                }

                case TacticalLines.ATDITCH: {
                    acCounter = lineutility.GetDitchSpikeDouble(tg, pLinePoints, vblSaveCounter, 0);
                    break;
                }

                case TacticalLines.ATDITCHC as int: {	//extra Points were calculated by a function
                    pLinePoints[0].style = 9;
                    acCounter = lineutility.GetDitchSpikeDouble(tg, pLinePoints, vblSaveCounter, 0);
                    //pLinePoints[vblCounter-1].style=10;
                    break;
                }

                case TacticalLines.ATDITCHM: {
                    lineutility.ReversePointsDouble2(
                        pLinePoints,
                        vblSaveCounter);
                    pLinePoints[0].style = 9;
                    acCounter = lineutility.GetDitchSpikeDouble(tg, pLinePoints, vblSaveCounter, 0);
                    break;
                }

                case TacticalLines.DIRATKGND: {
                    //was 20
                    if (dMBR / 30 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 30 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 30 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 30 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR < 150 * DPIScaleFactor) {
                        dMBR = 150 * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }

                    d = lineutility.CalcDistanceDouble(pLinePoints[0], pLinePoints[1]);
                    if (d < dMBR / 40) {
                        pLinePoints[1] = lineutility.ExtendLineDouble(pLinePoints[0], pLinePoints[1], dMBR / 40 + 1);
                    }

                    pLinePoints[0] = lineutility.ExtendAlongLineDouble(pLinePoints[0], pLinePoints[1], dMBR / 40);

                    //reverse the points
                    lineutility.ReversePointsDouble2(
                        pLinePoints,
                        vblSaveCounter);

                    pt0 = new POINT2(pLinePoints[vblCounter - 12]);
                    pt1 = new POINT2(pLinePoints[vblCounter - 11]);
                    pt2 = lineutility.ExtendLineDouble(pt0, pt1, dMBR / 40);
                    lineutility.GetArrowHead4Double(pt0, pt1, Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                        pArrowPoints, 0);

                    for (j = 0; j < 3; j++) {
                        pLinePoints[vblCounter - 10 + j] = new POINT2(pArrowPoints[j]);
                    }
                    lineutility.GetArrowHead4Double(pt0, pt2, Math.trunc(dMBR / 13.33), Math.trunc(dMBR / 13.33),
                        pArrowPoints, 0);

                    for (j = 0; j < 3; j++) {
                        pLinePoints[vblCounter - 7 + j] = new POINT2(pArrowPoints[j]);
                    }

                    pLinePoints[vblCounter - 4] = new POINT2(pLinePoints[vblCounter - 10]);
                    pLinePoints[vblCounter - 4].style = 0;
                    pLinePoints[vblCounter - 3] = new POINT2(pLinePoints[vblCounter - 7]);
                    pLinePoints[vblCounter - 3].style = 5;

                    pLinePoints[vblCounter - 2] = new POINT2(pLinePoints[vblCounter - 8]);
                    pLinePoints[vblCounter - 2].style = 0;
                    pLinePoints[vblCounter - 1] = new POINT2(pLinePoints[vblCounter - 5]);
                    pLinePoints[vblCounter - 1].style = 5;
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.MFLANE:
                case TacticalLines.RAFT: {
                    pt2 = lineutility.ExtendLineDouble(pLinePoints[vblCounter - 8], pLinePoints[vblCounter - 7], dMBR / 2);
                    pt3 = new POINT2(pLinePoints[vblCounter - 7]);
                    pt1 = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], dMBR / 2);

                    if (dMBR / 10 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 10 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 10 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 10 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR > 250 * DPIScaleFactor) {
                        dMBR = 250 * DPIScaleFactor;
                    }

                    lineutility.GetArrowHead4Double(pt2, pt3, Math.trunc(dMBR / 10), Math.trunc(dMBR / 5),
                        pArrowPoints, 0);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 6 + k] = new POINT2(pArrowPoints[k]);
                    }

                    lineutility.GetArrowHead4Double(pt1, pt0, Math.trunc(dMBR / 10), Math.trunc(dMBR / 5),
                        pArrowPoints, 0);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 3 + k] = new POINT2(pArrowPoints[k]);
                    }
                    pLinePoints[vblSaveCounter - 1].style = 5;
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.DIRATKAIR: {
                    lineutility.ReversePointsDouble2(
                        pLinePoints,
                        vblSaveCounter);

                    for (k = vblSaveCounter - 1; k > 0; k--) {
                        d += lineutility.CalcDistanceDouble(pLinePoints[k], pLinePoints[k - 1]);
                        if (d > 60) {
                            break;
                        }
                    }
                    if (d > 60) {
                        middleSegment = k;
                        pt2 = pLinePoints[middleSegment];
                        if (middleSegment >= 1) {
                            pt3 = pLinePoints[middleSegment - 1];
                        }
                    } else {
                        if (vblSaveCounter <= 3) {
                            middleSegment = 1;
                        } else {
                            middleSegment = 2;
                        }

                        pt2 = pLinePoints[middleSegment];
                        if (middleSegment >= 1) {
                            pt3 = pLinePoints[middleSegment - 1];
                        }
                    }

                    pt0 = new POINT2(pLinePoints[0]);

                    if (dMBR / 20 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 20 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR < 150 * DPIScaleFactor) {
                        dMBR = 150 * DPIScaleFactor;
                    }

                    if (dMBR > 250 * DPIScaleFactor) {
                        dMBR = 250 * DPIScaleFactor;
                    }

                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 11], pLinePoints[vblCounter - 10], Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                        pArrowPoints, 0);

                    for (j = 0; j < 3; j++) {
                        pLinePoints[vblCounter - 9 + j] = new POINT2(pArrowPoints[j]);
                    }

                    pLinePoints[vblCounter - 6].x = (pLinePoints[vblCounter - 11].x + pLinePoints[vblCounter - 10].x) / 2;
                    pLinePoints[vblCounter - 6].y = (pLinePoints[vblCounter - 11].y + pLinePoints[vblCounter - 10].y) / 2;
                    pt0 = new POINT2(pLinePoints[vblCounter - 6]);
                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 11], pt0, Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                        pArrowPoints, 9);

                    if (middleSegment >= 1) {
                        pt0 = lineutility.MidPointDouble(pt2, pt3, 0);
                        lineutility.GetArrowHead4Double(pt3, pt0, Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                            pArrowPoints, 9);
                    }

                    for (j = 0; j < 3; j++) {
                        pLinePoints[vblCounter - 6 + j] = new POINT2(pArrowPoints[j]);
                    }

                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 10], pt0, Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                        pArrowPoints, 9);
                    if (middleSegment >= 1) {
                        pt0 = lineutility.MidPointDouble(pt2, pt3, 0);
                        lineutility.GetArrowHead4Double(pt2, pt0, Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                            pArrowPoints, 9);
                    }
                    for (j = 0; j < 3; j++) {
                        pLinePoints[vblCounter - 3 + j] = new POINT2(pArrowPoints[j]);
                    }

                    //this section was added to remove fill from the bow tie feature
                    let airPts: Array<POINT2> = new Array();
                    pLinePoints[middleSegment - 1].style = 5;
                    //pLinePoints[middleSegment].style=14;
                    if (vblSaveCounter === 2) {
                        pLinePoints[1].style = 5;
                    }

                    for (j = 0; j < vblCounter; j++) {
                        airPts.push(new POINT2(pLinePoints[j]));
                    }

                    midpt = lineutility.MidPointDouble(pLinePoints[middleSegment - 1], pLinePoints[middleSegment], 0);
                    pt0 = lineutility.ExtendAlongLineDouble(midpt, pLinePoints[middleSegment], dMBR / 20, 0);
                    airPts.push(pt0);
                    pt1 = new POINT2(pLinePoints[middleSegment]);
                    pt1.style = 5;
                    airPts.push(pt1);

                    pt0 = lineutility.ExtendAlongLineDouble(midpt, pLinePoints[middleSegment - 1], dMBR / 20, 0);
                    airPts.push(pt0);
                    pt1 = new POINT2(pLinePoints[middleSegment - 1]);
                    pt1.style = 5;
                    airPts.push(pt1);

                    //re-dimension pLinePoints so that it can hold the
                    //the additional points required by the shortened middle segment
                    //which has the bow tie feature
                    vblCounter = airPts.length;
                    pLinePoints = new Array<POINT2>(airPts.length);
                    for (j = 0; j < airPts.length; j++) {
                        pLinePoints[j] = new POINT2(airPts[j]);
                    }
                    //end section

                    acCounter = vblCounter;
                    //FillPoints(pLinePoints,vblCounter,points);
                    break;
                }

                case TacticalLines.PDF: {
                    pt0 = new POINT2(pLinePoints[1]);
                    pt1 = new POINT2(pLinePoints[0]);
                    pLinePoints[0] = new POINT2(pt0);
                    pLinePoints[1] = new POINT2(pt1);
                    pts2 = new Array<POINT2>(3);
                    pts2[0] = new POINT2(pt0);
                    pts2[1] = new POINT2(pt1);
                    pts2[2] = new POINT2(pt2);
                    lineutility.GetPixelsMin(pts2, 3,
                        offsetX,
                        offsetY);
                    if (offsetX.value[0] < 0) {
                        offsetX.value[0] = offsetX.value[0] - 100;
                    } else {
                        offsetX.value[0] = 0;
                    }

                    pLinePoints[2].style = 5;

                    if (dMBR / 20 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 20 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }

                    let rectWidth: double = arraysupport.getScaledSize(2, tg.get_LineThickness() / 2.0);

                    pt2 = lineutility.ExtendLineDouble(pt0, pt1, -dMBR / 10);
                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
                    if (bolVertical !== 0 && m.value[0] !== 0) {
                        b = pt2.y + (1 / m.value[0]) * pt2.x;
                        b1 = (-1 / m.value[0]) * offsetX.value[0] + b;
                        ptYIntercept.x = offsetX.value[0];
                        ptYIntercept.y = b1;
                        pLinePoints[3] = lineutility.ExtendLineDouble(ptYIntercept, pt2, -rectWidth);
                        pLinePoints[3].style = 0;
                        pLinePoints[4] = lineutility.ExtendLineDouble(ptYIntercept, pt2, rectWidth);
                        pLinePoints[4].style = 0;
                    }
                    if (bolVertical !== 0 && m.value[0] === 0) {
                        pLinePoints[3] = new POINT2(pt2);
                        pLinePoints[3].y = pt2.y - rectWidth;
                        pLinePoints[3].style = 0;
                        pLinePoints[4] = new POINT2(pt2);
                        pLinePoints[4].y = pt2.y + rectWidth;
                        pLinePoints[4].style = 0;
                    }
                    if (bolVertical === 0) {
                        pLinePoints[3] = new POINT2(pt2);
                        pLinePoints[3].x = pt2.x - rectWidth;
                        pLinePoints[3].style = 0;
                        pLinePoints[4] = new POINT2(pt2);
                        pLinePoints[4].x = pt2.x + rectWidth;
                        pLinePoints[4].style = 0;
                    }

                    pt2 = lineutility.ExtendLineDouble(pt1, pt0, -dMBR / 10);
                    if (bolVertical !== 0 && m.value[0] !== 0) {
                        b = pt2.y + (1 / m.value[0]) * pt2.x;
                        //get the Y intercept at x=offsetX
                        b1 = (-1 / m.value[0]) * offsetX.value[0] + b;
                        ptYIntercept.x = offsetX.value[0];
                        ptYIntercept.y = b1;
                        pLinePoints[5] = lineutility.ExtendLineDouble(ptYIntercept, pt2, rectWidth);
                        pLinePoints[5].style = 0;
                        pLinePoints[6] = lineutility.ExtendLineDouble(ptYIntercept, pt2, -rectWidth);
                    }
                    if (bolVertical !== 0 && m.value[0] === 0) {
                        pLinePoints[5] = new POINT2(pt2);
                        pLinePoints[5].y = pt2.y + rectWidth;
                        pLinePoints[5].style = 0;
                        pLinePoints[6] = new POINT2(pt2);
                        pLinePoints[6].y = pt2.y - rectWidth;
                    }
                    if (bolVertical === 0) {
                        pLinePoints[5] = new POINT2(pt2);
                        pLinePoints[5].x = pt2.x + rectWidth;
                        pLinePoints[5].style = 0;
                        pLinePoints[6] = new POINT2(pt2);
                        pLinePoints[6].x = pt2.x - rectWidth;
                    }

                    pLinePoints[6].style = 0;
                    pLinePoints[7] = new POINT2(pLinePoints[3]);
                    pLinePoints[7].style = 5;
                    lineutility.GetArrowHead4Double(pLinePoints[1], pLinePoints[0], Math.trunc(dMBR / 20), Math.trunc(dMBR / 20), pArrowPoints, 0);
                    for (j = 0; j < 3; j++) {
                        pLinePoints[8 + j] = new POINT2(pArrowPoints[j]);
                    }
                    lineutility.GetArrowHead4Double(pLinePoints[1], pLinePoints[2], Math.trunc(dMBR / 20), Math.trunc(dMBR / 20), pArrowPoints, 0);
                    for (j = 0; j < 3; j++) {
                        pLinePoints[11 + j] = new POINT2(pArrowPoints[j]);
                        pLinePoints[11 + j].style = 0;
                    }
                    acCounter = 14;
                    break;
                }

                case TacticalLines.DIRATKSPT: {
                    //reverse the points
                    lineutility.ReversePointsDouble2(
                        pLinePoints,
                        vblSaveCounter);
                    if (dMBR / 20 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 20 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 20 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR < 150 * DPIScaleFactor) {
                        dMBR = 150 * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }

                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 5], pLinePoints[vblCounter - 4], Math.trunc(dMBR / 20), Math.trunc(dMBR / 20), pArrowPoints, 0);
                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - k - 1] = new POINT2(pArrowPoints[k]);
                    }
                    acCounter = vblCounter;
                    break;
                }

                case TacticalLines.ABATIS: {
                    //must use an x offset for ptYintercept because of extending from it
                    pts2 = new Array<POINT2>(2);
                    pts2[0] = new POINT2(pt0);
                    pts2[1] = new POINT2(pt1);
                    lineutility.GetPixelsMin(pts2, 2,
                        offsetX,
                        offsetY);
                    if (offsetX.value[0] <= 0) {
                        offsetX.value[0] = offsetX.value[0] - 100;
                    } else {
                        offsetX.value[0] = 0;
                    }
                    if (dMBR > 300 * DPIScaleFactor) {
                        dMBR = 300 * DPIScaleFactor;
                    }

                    pLinePoints[0] = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], -dMBR / 10);
                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
                    midpt.x = (pt0.x + pLinePoints[0].x) / 2;
                    midpt.y = (pt0.y + pLinePoints[0].y) / 2;
                    pLinePoints[vblCounter - 3] = new POINT2(pt0);
                    pLinePoints[vblCounter - 4].style = 5;
                    pLinePoints[vblCounter - 3].style = 0;
                    if (bolVertical !== 0 && m.value[0] !== 0) {
                        b = midpt.y + (1 / m.value[0]) * midpt.x;	//the line equation
                        //get Y intercept at x=offsetX
                        b1 = (-1 / m.value[0]) * offsetX.value[0] + b;
                        ptYIntercept.x = offsetX.value[0];
                        ptYIntercept.y = b1;
                        pLinePoints[vblCounter - 2] = lineutility.ExtendLineDouble(ptYIntercept, midpt, dMBR / 20);
                        if (pLinePoints[vblCounter - 2].y >= midpt.y) {
                            pLinePoints[vblCounter - 2] = lineutility.ExtendLineDouble(ptYIntercept, midpt, -dMBR / 20);
                        }
                    }
                    if (bolVertical !== 0 && m.value[0] === 0) //horizontal line
                    {
                        pLinePoints[vblCounter - 2] = new POINT2(midpt);
                        pLinePoints[vblCounter - 2].y = midpt.y - dMBR / 20;
                    }
                    if (bolVertical === 0) {
                        pLinePoints[vblCounter - 2] = new POINT2(midpt);
                        pLinePoints[vblCounter - 2].x = midpt.x - dMBR / 20;
                    }
                    pLinePoints[vblCounter - 2].style = 0;
                    pLinePoints[vblCounter - 1] = new POINT2(pLinePoints[0]);

                    //FillPoints(pLinePoints,vblCounter,points);
                    acCounter = vblCounter;
                    //FillPoints(pLinePoints,acCounter,points);
                    break;
                }

                case TacticalLines.CLUSTER: {
                    //must use an x offset for ptYintercept because of extending from it
                    pts2 = new Array<POINT2>(2);

                    //for some reason occulus puts the points on top of one another
                    if (Math.abs(pt0.y - pt1.y) < 1) {
                        pt1.y = pt0.y + 1;
                    }

                    pts2[0] = new POINT2(pt0);
                    pts2[1] = new POINT2(pt1);

                    pts = new Array<POINT2>(26);
                    dRadius = lineutility.CalcDistanceDouble(pt0, pt1) / 2;
                    midpt.x = (pt1.x + pt0.x) / 2;
                    midpt.y = (pt1.y + pt0.y) / 2;
                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
                    if (bolVertical !== 0 && m.value[0] !== 0) //not vertical or horizontal
                    {
                        b = midpt.y + (1 / m.value[0]) * midpt.x;	//normal y intercept at x=0
                        ptYIntercept.x = 0;
                        ptYIntercept.y = b;
                        pt2 = lineutility.ExtendLineDouble(ptYIntercept, midpt, dRadius);
                        if (pLinePoints[0].x <= pLinePoints[1].x) {
                            if (pt2.y >= midpt.y) {
                                pt2 = lineutility.ExtendLineDouble(ptYIntercept, midpt, -dRadius);
                            }
                        } else {
                            if (pt2.y <= midpt.y) {
                                pt2 = lineutility.ExtendLineDouble(ptYIntercept, midpt, -dRadius);
                            }
                        }

                    }
                    if (bolVertical !== 0 && m.value[0] === 0) //horizontal line
                    {
                        pt2 = midpt;
                        if (pLinePoints[0].x <= pLinePoints[1].x) {
                            pt2.y = midpt.y - dRadius;
                        } else {
                            pt2.y = midpt.y + dRadius;
                        }
                    }
                    if (bolVertical === 0) //vertical line
                    {
                        pt2 = midpt;
                        if (pLinePoints[0].y <= pLinePoints[1].y) {
                            pt2.x = midpt.x + dRadius;
                        } else {
                            pt2.x = midpt.x - dRadius;
                        }
                    }

                    pt1 = lineutility.ExtendLineDouble(midpt, pt2, 100);

                    pts[0] = new POINT2(pt2);
                    pts[1] = new POINT2(pt1);

                    lineutility.ArcArrayDouble(
                        pts,
                        0, dRadius,
                        lineType,
                        null);
                    pLinePoints[0].style = 1;
                    pLinePoints[1].style = 5;
                    for (j = 0; j < 26; j++) {
                        pLinePoints[2 + j] = new POINT2(pts[j]);
                        pLinePoints[2 + j].style = 1;
                    }
                    acCounter = 28;
                    break;
                }

                case TacticalLines.TRIP: {
                    dRadius = lineutility.CalcDistanceToLineDouble(pt0, pt1, pt2);
                    bolVertical = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
                    if (bolVertical !== 0 && m.value[0] !== 0) {
                        b = pt1.y + 1 / m.value[0] * pt1.x;
                        b1 = pt2.y - m.value[0] * pt2.x;
                        calcPoint0 = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b, m.value[0], b1, 1, 1, pt0.x, pt0.y);
                        calcPoint1 = lineutility.ExtendLineDouble(pt0, pt1, dRadius / 2);
                        calcPoint2 = lineutility.ExtendLineDouble(pt0, pt1, dRadius);

                        b = calcPoint1.y + 1 / m.value[0] * calcPoint1.x;
                        calcPoint3 = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b, m.value[0], b1, 1, 1, pt0.x, pt0.y);
                        b = calcPoint2.y + 1 / m.value[0] * calcPoint2.x;
                        calcPoint4 = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b, m.value[0], b1, 1, 1, pt0.x, pt0.y);
                        midpt = lineutility.MidPointDouble(calcPoint1, calcPoint3, 0);
                        midpt1 = lineutility.MidPointDouble(calcPoint2, calcPoint4, 0);

                        b = pt1.y + 1 / m.value[0] * pt1.x;
                        calcPoint0 = lineutility.CalcTrueIntersectDouble2(-1 / m.value[0], b, m.value[0], b1, 1, 1, pt0.x, pt0.y);
                        calcPoint3 = lineutility.ExtendLineDouble(pt0, pt1, dRadius);
                        d = lineutility.CalcDistanceDouble(calcPoint0, calcPoint3);
                        calcPoint1 = lineutility.ExtendLineDouble(calcPoint0, calcPoint3, -(d - dRadius));
                    }
                    if (bolVertical !== 0 && m.value[0] === 0) {
                        calcPoint0.x = pt1.x;
                        calcPoint0.y = pt2.y;
                        calcPoint1 = lineutility.ExtendLineDouble(pt0, pt1, dRadius / 2);
                        //calcPoint2 = lineutility.ExtendLineDouble(pt0, pt1, dRadius);
                        calcPoint2 = pt2;

                        calcPoint3.x = calcPoint0.x + dRadius / 2;
                        calcPoint3.y = calcPoint0.y;
                        calcPoint4.x = pt1.x + dRadius;
                        calcPoint4.y = pt2.y;
                        midpt = lineutility.MidPointDouble(calcPoint1, calcPoint3, 0);
                        midpt1 = lineutility.MidPointDouble(calcPoint2, calcPoint4, 0);

                        calcPoint3 = lineutility.ExtendLineDouble(pt0, pt1, dRadius);

                        d = lineutility.CalcDistanceDouble(calcPoint0, calcPoint3);
                        calcPoint1 = lineutility.ExtendLineDouble(calcPoint0, calcPoint3, -(d - dRadius));
                    }
                    if (bolVertical === 0) {

                        calcPoint0.x = pt2.x;
                        calcPoint0.y = pt1.y;
                        calcPoint1 = lineutility.ExtendLineDouble(pt0, pt1, dRadius / 2);
                        //calcPoint2 = lineutility.ExtendLineDouble(pt0, pt1, dRadius);
                        calcPoint2 = pt2;

                        calcPoint3.y = calcPoint0.y + dRadius / 2;
                        calcPoint3.x = calcPoint0.x;
                        calcPoint4.y = pt1.y + dRadius;
                        calcPoint4.x = pt2.x;
                        midpt = lineutility.MidPointDouble(calcPoint1, calcPoint3, 0);
                        midpt1 = lineutility.MidPointDouble(calcPoint2, calcPoint4, 0);

                        calcPoint3 = lineutility.ExtendLineDouble(pt0, pt1, dRadius);

                        d = lineutility.CalcDistanceDouble(calcPoint0, calcPoint3);
                        calcPoint1 = lineutility.ExtendLineDouble(calcPoint0, calcPoint3, -(d - dRadius));
                    }

                    arcPts[0] = new POINT2(calcPoint1);
                    arcPts[1] = new POINT2(calcPoint3);
                    lineutility.ArcArrayDouble(
                        arcPts,
                        0, dRadius,
                        lineType,
                        null);

                    pLinePoints[0].style = 5;
                    pLinePoints[1].style = 5;
                    for (k = 0; k < 26; k++) {
                        pLinePoints[k] = new POINT2(arcPts[k]);
                    }
                    for (k = 25; k < vblCounter; k++) {
                        pLinePoints[k].style = 5;
                    }
                    pLinePoints[26] = new POINT2(pt1);
                    dRadius = lineutility.CalcDistanceDouble(pt1, pt0);

                    midpt = lineutility.ExtendLine2Double(pt1, pt0, -dRadius / 2 - 7, 0);

                    pLinePoints[27] = new POINT2(midpt);
                    pLinePoints[27].style = 0;
                    midpt = lineutility.ExtendLine2Double(pt1, pt0, -dRadius / 2 + 7, 0);
                    pLinePoints[28] = new POINT2(midpt);
                    pLinePoints[29] = new POINT2(pt0);
                    pLinePoints[29].style = 5;
                    lineutility.GetArrowHead4Double(pt1, pt0, 15, 15, pArrowPoints, 0);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[30 + k] = new POINT2(pArrowPoints[k]);
                    }
                    for (k = 0; k < 3; k++) {
                        pLinePoints[30 + k].style = 5;
                    }

                    midpt = lineutility.MidPointDouble(pt0, pt1, 0);
                    d = lineutility.CalcDistanceDouble(pt1, calcPoint0);

                    pLinePoints[33] = pt2;
                    pt3 = lineutility.PointRelativeToLine(pt0, pt1, pt0, pt2);
                    d = lineutility.CalcDistanceDouble(pt3, pt2);
                    pt4 = lineutility.ExtendAlongLineDouble(pt0, pt1, d);
                    d = lineutility.CalcDistanceDouble(pt2, pt4);
                    pLinePoints[34] = lineutility.ExtendLineDouble(pt2, pt4, d);

                    acCounter = 35;
                    break;
                }

                case TacticalLines.FOLLA: {
                    //reverse the points
                    lineutility.ReversePointsDouble2(pLinePoints, vblSaveCounter);

                    if (dMBR / 10 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 10 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 10 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 10 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR > 150 * DPIScaleFactor) {
                        dMBR = 150 * DPIScaleFactor;
                    }

                    pLinePoints[0] = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], -2 * dMBR / 10);

                    for (k = 0; k < vblCounter - 14; k++) {
                        pLinePoints[k].style = 18;
                    }
                    pLinePoints[vblCounter - 15].style = 5;

                    pt0 = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], 5 * dMBR / 10);

                    lineutility.GetArrowHead4Double(pt0, pLinePoints[0], Math.trunc(dMBR / 10), Math.trunc(dMBR / 10), pArrowPoints, 0);
                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 14 + k] = new POINT2(pArrowPoints[k]);
                    }

                    pt3 = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], dMBR / 10);

                    lineutility.GetArrowHead4Double(pt0, pt3, Math.trunc(dMBR / 10), Math.trunc(dMBR / 10), pArrowPoints, 0);
                    pLinePoints[vblCounter - 12].style = 0;
                    pLinePoints[vblCounter - 11] = new POINT2(pArrowPoints[2]);
                    pLinePoints[vblCounter - 11].style = 0;
                    pLinePoints[vblCounter - 10] = new POINT2(pArrowPoints[0]);
                    pLinePoints[vblCounter - 10].style = 0;
                    pLinePoints[vblCounter - 9] = new POINT2(pLinePoints[vblCounter - 14]);
                    pLinePoints[vblCounter - 9].style = 5;

                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 16], pLinePoints[vblCounter - 15], Math.trunc(dMBR / 10), Math.trunc(dMBR / 10), pArrowPoints, 0);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 8 + k] = new POINT2(pArrowPoints[k]);
                    }
                    pLinePoints[vblCounter - 6].style = 0;

                    //diagnostic to make first point tip of arrowhead    6-14-12
                    //pt3 = lineutility.ExtendLineDouble(pLinePoints[vblCounter - 16], pLinePoints[vblCounter - 15], 0.75 * dMBR / 10);
                    pt3 = lineutility.ExtendLineDouble(pLinePoints[vblCounter - 16], pLinePoints[vblCounter - 15], -0.75 * dMBR / 10);
                    pLinePoints[1] = pt3;
                    pLinePoints[1].style = 5;
                    //lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 16], pt3, (int) (1.25 * dMBR / 10), (int) (1.25 * dMBR / 10), pArrowPoints, 0);
                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 16], pt3, Math.trunc(dMBR / 10), Math.trunc(dMBR / 10), pArrowPoints, 0);
                    //end section

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 5 + k] = new POINT2(pArrowPoints[2 - k]);
                    }
                    pLinePoints[vblCounter - 5].style = 0;

                    pLinePoints[vblCounter - 2] = new POINT2(pLinePoints[vblCounter - 8]);
                    pLinePoints[vblCounter - 2].style = 5;
                    pLinePoints[vblCounter - 1] = new POINT2(pLinePoints[vblCounter - 7]);
                    acCounter = 16;
                    break;
                }

                case TacticalLines.FOLSP: {
                    lineutility.ReversePointsDouble2(
                        pLinePoints,
                        vblSaveCounter);

                    if (dMBR / 15 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 15 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 15 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 15 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR < 100 * DPIScaleFactor) {
                        dMBR = 100 * DPIScaleFactor;
                    }
                    if (dMBR > 500 * DPIScaleFactor) {
                        dMBR = 500 * DPIScaleFactor;
                    }

                    //make tail larger 6-10-11 m. Deutch
                    pLinePoints[0] = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], -dMBR / 8.75);

                    pLinePoints[vblCounter - 15].style = 5;
                    pt0 = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], dMBR / 4);

                    lineutility.GetArrowHead4Double(pt0, pLinePoints[0], Math.trunc(dMBR / 20), Math.trunc(dMBR / 20),
                        pArrowPoints, 0);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 14 + k] = new POINT2(pArrowPoints[k]);
                    }

                    pLinePoints[vblCounter - 12].style = 0;

                    //make tail larger 6-10-11 m. Deutch
                    pt3 = lineutility.ExtendLineDouble(pLinePoints[1], pLinePoints[0], dMBR / 15);

                    lineutility.GetArrowHead4Double(pt0, pt3, Math.trunc(dMBR / 20), Math.trunc(dMBR / 20), pArrowPoints, 0);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 11 + k] = new POINT2(pArrowPoints[2 - k]);
                        pLinePoints[vblCounter - 11 + k].style = 0;
                    }
                    pLinePoints[vblCounter - 8] = new POINT2(pLinePoints[vblCounter - 14]);
                    pLinePoints[vblCounter - 8].style = 5;

                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 16], pLinePoints[vblCounter - 15], Math.trunc(dMBR / 20), Math.trunc(dMBR / 20), pArrowPoints, 9);

                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 7 + k] = new POINT2(pArrowPoints[k]);
                    }
                    for (k = 4; k > 0; k--) {
                        pLinePoints[vblCounter - k].style = 5;
                    }
                    acCounter = 12;
                    break;
                }

                case TacticalLines.FERRY: {
                    lLinestyle = 9;
                    if (dMBR / 10 > arraysupport.maxLength * DPIScaleFactor) {
                        dMBR = 10 * arraysupport.maxLength * DPIScaleFactor;
                    }
                    if (dMBR / 10 < arraysupport.minLength * DPIScaleFactor) {
                        dMBR = 10 * arraysupport.minLength * DPIScaleFactor;
                    }
                    if (dMBR > 250 * DPIScaleFactor) {
                        dMBR = 250 * DPIScaleFactor;
                    }

                    lineutility.GetArrowHead4Double(pLinePoints[vblCounter - 8], pLinePoints[vblCounter - 7], Math.trunc(dMBR / 10), Math.trunc(dMBR / 10), pArrowPoints, lLinestyle);
                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 6 + k] = new POINT2(pArrowPoints[k]);
                    }
                    lineutility.GetArrowHead4Double(pLinePoints[1], pLinePoints[0], Math.trunc(dMBR / 10), Math.trunc(dMBR / 10), pArrowPoints, lLinestyle);
                    for (k = 0; k < 3; k++) {
                        pLinePoints[vblCounter - 3 + k] = new POINT2(pArrowPoints[k]);
                    }

                    acCounter = 8;
                    break;
                }

                case TacticalLines.NAVIGATION: {
                    let extensionLength: double = arraysupport.getScaledSize(10, tg.get_LineThickness());
                    pt3 = lineutility.ExtendLine2Double(pt1, pt0, -extensionLength, 0);
                    pt4 = lineutility.ExtendLine2Double(pt0, pt1, -extensionLength, 0);

                    pt5 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, pt3, extensionLength, 0);
                    pt6 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, pt3, -extensionLength, 0);
                    pt7 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, pt4, extensionLength, 0);
                    pt8 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, pt4, -extensionLength, 0);
                    if (pt5.y < pt6.y) {
                        pLinePoints[0] = new POINT2(pt5);
                    } else {
                        pLinePoints[0] = new POINT2(pt6);
                    }
                    if (pt7.y > pt8.y) {
                        pLinePoints[3] = new POINT2(pt7);
                    } else {
                        pLinePoints[3] = new POINT2(pt8);
                    }
                    pLinePoints[1] = new POINT2(pt0);
                    pLinePoints[2] = new POINT2(pt1);
                    acCounter = 4;
                    break;
                }

                case TacticalLines.FORTL: {
                    acCounter = arraysupport.GetFORTLPointsDouble(tg, pLinePoints, vblSaveCounter);
                    break;
                }

                case TacticalLines.CANALIZE: {
                    acCounter = DISMSupport.GetDISMCanalizeDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.BREACH: {
                    acCounter = DISMSupport.GetDISMBreachDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.SCREEN:
                case TacticalLines.GUARD:
                case TacticalLines.COVER: {
                    if (vblSaveCounter === 4) {
                        acCounter = DISMSupport.GetDISMCoverDoubleRevC(pLinePoints, lineType, vblSaveCounter);
                    } else {
                        acCounter = DISMSupport.GetDISMCoverDouble(pLinePoints, lineType);
                    }
                    break;
                }

                case TacticalLines.SARA: {
                    acCounter = DISMSupport.GetDISMCoverDouble(pLinePoints, lineType);
                    //reorder pLinePoints
                    let saraPts: POINT2[] = new Array<POINT2>(16);
                    for (j = 0; j < 4; j++) {
                        saraPts[j] = pLinePoints[j];  //0-3
                    }
                    for (j = 4; j < 8; j++) {
                        saraPts[j] = pLinePoints[j + 4];    //8-11
                    }
                    for (j = 8; j < 12; j++) {
                        saraPts[j] = pLinePoints[j - 4];    //4-7
                    }
                    for (j = 12; j < 16; j++) {
                        saraPts[j] = pLinePoints[j];  //12-15
                    }
                    pLinePoints = saraPts;
                    //acCounter=14;
                    break;
                }

                case TacticalLines.DISRUPT: {
                    acCounter = DISMSupport.GetDISMDisruptDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.CONTAIN: {
                    acCounter = DISMSupport.GetDISMContainDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.PENETRATE: {
                    DISMSupport.GetDISMPenetrateDouble(pLinePoints, lineType);
                    acCounter = 7;
                    break;
                }

                case TacticalLines.MNFLDBLK:
                case TacticalLines.BLOCK: {
                    DISMSupport.GetDISMBlockDouble2(
                        pLinePoints,
                        lineType);
                    acCounter = 4;
                    break;
                }

                case TacticalLines.LINTGT:
                case TacticalLines.LINTGTS:
                case TacticalLines.FPF: {
                    acCounter = DISMSupport.GetDISMLinearTargetDouble(pLinePoints, lineType, vblCounter);
                    break;
                }

                case TacticalLines.GAP:
                case TacticalLines.ASLTXING: {
                    DISMSupport.GetDISMGapDouble(
                        pLinePoints,
                        lineType);
                    acCounter = 12;
                    break;
                }

                case TacticalLines.MNFLDDIS: {
                    acCounter = DISMSupport.GetDISMMinefieldDisruptDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.SPTBYFIRE: {
                    acCounter = DISMSupport.GetDISMSupportByFireDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.ATKBYFIRE: {
                    acCounter = DISMSupport.GetDISMATKBYFIREDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.BYIMP: {
                    acCounter = DISMSupport.GetDISMByImpDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.CLEAR: {
                    acCounter = DISMSupport.GetDISMClearDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.BYDIF: {
                    acCounter = DISMSupport.GetDISMByDifDouble(pLinePoints, lineType, clipBounds);
                    break;
                }

                case TacticalLines.SEIZE: {
                    let radius: double = 0;
                    if (vblSaveCounter === 4) {
                        radius = lineutility.CalcDistanceDouble(pLinePoints[0], pLinePoints[1]);
                        pLinePoints[1] = new POINT2(pLinePoints[3]);
                        pLinePoints[2] = new POINT2(pLinePoints[2]);
                    }
                    acCounter = DISMSupport.GetDISMSeizeDouble(pLinePoints, lineType, radius);
                    break;
                }

                case TacticalLines.FIX:
                case TacticalLines.MNFLDFIX: {
                    acCounter = DISMSupport.GetDISMFixDouble(pLinePoints, lineType, clipBounds);
                    break;
                }

                case TacticalLines.RIP: {
                    acCounter = DISMSupport.GetDISMRIPDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.DELAY:
                case TacticalLines.WITHDRAW:
                case TacticalLines.WDRAWUP:
                case TacticalLines.RETIRE:
                case TacticalLines.FPOL:
                case TacticalLines.RPOL: {
                    acCounter = DISMSupport.GetDelayGraphicEtcDouble(pLinePoints);
                    break;
                }

                case TacticalLines.EASY: {
                    acCounter = DISMSupport.GetDISMEasyDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.BYPASS: {
                    acCounter = DISMSupport.GetDISMBypassDouble(pLinePoints, lineType);
                    break;
                }

                case TacticalLines.AMBUSH: {
                    acCounter = DISMSupport.AmbushPointsDouble(pLinePoints);
                    break;
                }

                case TacticalLines.FLOT: {
                    acCounter = flot.GetFlotDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    break;
                }

                default: {
                    acCounter = vblSaveCounter;
                    break;
                }

            }
            switch (lineType) {
                case TacticalLines.BOUNDARY: {
                    arraysupport.FillPoints(pLinePoints, acCounter, points);
                    return points;
                }

                case TacticalLines.CONTAIN:
                case TacticalLines.BLOCK:
                case TacticalLines.COVER:
                case TacticalLines.SCREEN:  //note: screen, cover, guard are getting their modifiers before the call to getlinearray
                case TacticalLines.GUARD:
                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET:
                case TacticalLines.FOLSP:
                case TacticalLines.FOLLA:
                //add these for rev c   3-12-12
                case TacticalLines.BREACH:
                case TacticalLines.BYPASS:
                case TacticalLines.CANALIZE:
                case TacticalLines.CLEAR:
                case TacticalLines.DISRUPT:
                case TacticalLines.FIX:
                case TacticalLines.ISOLATE:
                case TacticalLines.OCCUPY:
                case TacticalLines.PENETRATE:
                case TacticalLines.RETAIN:
                case TacticalLines.SECURE:
                case TacticalLines.SEIZE:
                //add these
                case TacticalLines.AIRFIELD:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH:
                case TacticalLines.MSDZ:
                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY:
                case TacticalLines.MFLANE:
                case TacticalLines.DIRATKAIR:
                case TacticalLines.ABATIS: {
                    arraysupport.FillPoints(pLinePoints, acCounter, points);
                    break;
                }

                default: {
                    //if shapes is null then it is a non-CPOF client, dependent upon pixels
                    //instead of shapes
                    if (shapes == null) {
                        arraysupport.FillPoints(pLinePoints, acCounter, points);
                        return points;
                    }
                    break;
                }

            }

            //the shapes require pLinePoints
            //if the shapes are null then it is a non-CPOF client,
            if (shapes == null) {
                return points;
            }

            let shape: Shape2;
            let gp: Shape;
            let redShape: Shape2;
            let blueShape: Shape2;
            let paleBlueShape: Shape2;
            let whiteShape: Shape2;
            let redFillShape: Shape2;
            let blueFillShape: Shape2;
            let blackShape: Shape2;
            let blueStroke: BasicStroke;
            let paleBlueStroke: BasicStroke;
            let blueArea: Area;
            let paleBlueArea: Area;
            let whiteArea: Area;
            let beginLine: boolean = true;
            let poly: Polygon;
            let secondPoly: POINT2[];

            //a loop for the outline shapes
            switch (lineType) {
                case TacticalLines.PDF: {
                    // Lines
                    arraysupport.addPolyline(pLinePoints, 3, shapes);

                    // Rectangle
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(pLinePoints[3]);
                    for (k = 4; k < 8; k++) {
                        shape.lineTo(pLinePoints[k]);
                    }
                    shapes.push(shape);

                    // Arrows
                    secondPoly = new Array<POINT2>(6);
                    for (let i: int = 0; i < 6; i++) {
                        secondPoly[i] = pLinePoints[i + 8];
                    }
                    arraysupport.addPolyline(secondPoly, 6, shapes);
                    break;
                }

                case TacticalLines.DIRATKGND: {
                    //create two shapes. the first shape is for the line
                    //the second shape is for the arrow
                    //renderer will know to use a skinny stroke for the arrow shape

                    //the line shape
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(pLinePoints[0]);
                    for (j = 0; j < acCounter - 10; j++) {
                        shape.lineTo(pLinePoints[j]);
                    }

                    shapes.push(shape);

                    //the arrow shape
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(pLinePoints[acCounter - 10]);

                    for (j = 9; j > 0; j--) {
                        if (pLinePoints[acCounter - j - 1].style === 5) {
                            shape.moveTo(pLinePoints[acCounter - j]);
                        } else {
                            shape.lineTo(pLinePoints[acCounter - j]);
                        }
                    }

                    shapes.push(shape);
                    break;
                }

                case TacticalLines.DEPTH_AREA: {
                    whiteShape = new Shape2(Shape2.SHAPE_TYPE_FILL);//use for symbol
                    whiteShape.setFillColor(Color.WHITE);
                    let whiteStroke: BasicStroke  = new BasicStroke(arraysupport.getScaledSize(28, tg.get_LineThickness()));

                    blueShape = new Shape2(Shape2.SHAPE_TYPE_FILL);//use for symbol
                    blueShape.setFillColor(new Color(30, 144, 255));

                    paleBlueStroke = new BasicStroke(whiteStroke.getLineWidth() / 2);
                    paleBlueShape = new Shape2(Shape2.SHAPE_TYPE_FILL);//use for symbol
                    paleBlueShape.setFillColor(new Color(153, 204, 255));

                    poly = new Polygon();

                    for (k = 0; k < vblSaveCounter; k++) {
                        poly.addPoint(pLinePoints[k].x as int, pLinePoints[k].y as int);
                        if (k === 0) {
                            whiteShape.moveTo(pLinePoints[k]);
                        } else {
                            whiteShape.lineTo(pLinePoints[k]);
                        }
                    }

                    blueArea = new Area(poly);
                    blueShape.setShape(blueArea);

                    whiteArea = new Area(whiteStroke.createStrokedShape(poly));
                    whiteShape.setShape(lineutility.createStrokedShape(whiteArea));

                    paleBlueArea = new Area(paleBlueStroke.createStrokedShape(poly));
                    paleBlueShape.setShape(lineutility.createStrokedShape(paleBlueArea));

                    shapes.push(blueShape);
                    shapes.push(paleBlueShape);
                    shapes.push(whiteShape);
                    break;
                }

                case TacticalLines.TRAINING_AREA: {
                    redShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);//use for outline
                    redShape.set_Style(1);
                    blueShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);//use for symbol
                    blueShape.set_Style(0);

                    redShape.moveTo(pLinePoints[0]);
                    for (k = 1; k < vblSaveCounter; k++) {
                        redShape.lineTo(pLinePoints[k]);
                    }

                    beginLine = true;
                    for (k = vblSaveCounter; k < acCounter; k++) {
                        if (pLinePoints[k].style === 0) {
                            if (beginLine) {
                                blueShape.moveTo(pLinePoints[k]);
                                beginLine = false;
                            } else {
                                blueShape.lineTo(pLinePoints[k]);
                            }
                        }
                        if (pLinePoints[k].style === 5) {
                            blueShape.lineTo(pLinePoints[k]);
                            beginLine = true;
                        }
                    }
                    shapes.push(redShape);
                    shapes.push(blueShape);
                    break;
                }

                case TacticalLines.ITD: {
                    redShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    redShape.setLineColor(Color.RED);
                    blueShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    blueShape.setLineColor(Color.GREEN);
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 19 && pLinePoints[k + 1].style === 5) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                        } else {
                            if (pLinePoints[k].style === 25 && pLinePoints[k + 1].style === 5) {
                                blueShape.moveTo(pLinePoints[k]);
                                blueShape.lineTo(pLinePoints[k + 1]);
                            }
                        }

                    }
                    shapes.push(redShape);
                    shapes.push(blueShape);
                    tg.set_lineCap(BasicStroke.CAP_BUTT);
                    break;
                }

                case TacticalLines.SFY: {
                    redShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    redShape.setLineColor(Color.RED);
                    blueShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    blueShape.setLineColor(Color.BLUE);
                    //flots and spikes (triangles)
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 23) //red flots
                        {
                            redFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);    //1-3-12
                            redFillShape.setFillColor(Color.RED);
                            redFillShape.moveTo(pLinePoints[k - 9]);
                            for (let l: int = k - 8; l <= k; l++) {
                                redFillShape.lineTo(pLinePoints[l]);
                            }
                            shapes.push(redFillShape);   //1-3-12
                        }
                        if (pLinePoints[k].style === 24)//blue spikes
                        {
                            blueFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);   //1-3-12
                            blueFillShape.setFillColor(Color.BLUE);
                            blueFillShape.moveTo(pLinePoints[k - 2]);
                            blueFillShape.lineTo(pLinePoints[k - 1]);
                            blueFillShape.lineTo(pLinePoints[k]);
                            shapes.push(blueFillShape);  //1-3-12
                        }
                    }
                    //the corners
                    for (k = 0; k < vblSaveCounter; k++) {
                        if (k === 0) {
                            d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                            redShape.moveTo(pOriginalLinePoints[0]);
                            d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[0], pOriginalLinePoints[1]);
                            if (d1 < d) {
                                d = d1;
                            }

                            pt0 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[0], pOriginalLinePoints[1], d);
                            redShape.lineTo(pt0);
                        } else {
                            if (k > 0 && k < vblSaveCounter - 1) {
                                d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                                d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[k], pOriginalLinePoints[k - 1]);
                                if (d1 < d) {
                                    d = d1;
                                }

                                pt0 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[k], pOriginalLinePoints[k - 1], d);
                                pt1 = pOriginalLinePoints[k];

                                d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                                d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[k], pOriginalLinePoints[k + 1]);
                                if (d1 < d) {
                                    d = d1;
                                }

                                pt2 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[k], pOriginalLinePoints[k + 1], d);
                                redShape.moveTo(pt0);
                                redShape.lineTo(pt1);
                                redShape.lineTo(pt2);
                            } else //last point
                            {
                                d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                                d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[vblSaveCounter - 1], pOriginalLinePoints[vblSaveCounter - 2]);
                                if (d1 < d) {
                                    d = d1;
                                }

                                redShape.moveTo(pOriginalLinePoints[vblSaveCounter - 1]);
                                pt0 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[vblSaveCounter - 1], pOriginalLinePoints[vblSaveCounter - 2], d);
                                redShape.lineTo(pt0);
                            }
                        }

                    }
                    //red and blue short segments (between the flots)
                    for (k = 0; k < vblCounter - 1; k++) {
                        if (pLinePoints[k].style === 19 && pLinePoints[k + 1].style === 5) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                        } else {
                            if (pLinePoints[k].style === 25 && pLinePoints[k + 1].style === 5) {
                                blueShape.moveTo(pLinePoints[k]);
                                blueShape.lineTo(pLinePoints[k + 1]);
                            }
                        }

                    }
                    shapes.push(redShape);
                    shapes.push(blueShape);
                    break;
                }

                case TacticalLines.SFG: {
                    redShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    redShape.setLineColor(Color.RED);
                    blueShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    blueShape.setLineColor(Color.BLUE);
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 23) //red flots
                        {
                            redFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);    //1-3-12
                            redFillShape.setFillColor(Color.RED);
                            redFillShape.moveTo(pLinePoints[k - 9]);
                            for (let l: int = k - 8; l <= k; l++) {
                                redFillShape.lineTo(pLinePoints[l]);
                            }
                            shapes.push(redFillShape);   //1-3-12
                        }
                        if (pLinePoints[k].style === 24)//blue spikes red outline
                        {
                            blueFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);   //1-3-12
                            blueFillShape.setFillColor(Color.BLUE);
                            blueFillShape.moveTo(pLinePoints[k - 2]);
                            blueFillShape.lineTo(pLinePoints[k - 1]);
                            blueFillShape.lineTo(pLinePoints[k]);
                            shapes.push(blueFillShape);   //1-3-12
                        }
                    }
                    //the corners
                    for (k = 0; k < vblSaveCounter; k++) {
                        if (k === 0) {
                            d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                            redShape.moveTo(pOriginalLinePoints[0]);
                            d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[0], pOriginalLinePoints[1]);
                            if (d1 < d) {
                                d = d1;
                            }

                            pt0 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[0], pOriginalLinePoints[1], d);
                            redShape.lineTo(pt0);
                        } else {
                            if (k > 0 && k < vblSaveCounter - 1) {
                                d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                                d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[k], pOriginalLinePoints[k - 1]);
                                if (d1 < d) {
                                    d = d1;
                                }

                                pt0 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[k], pOriginalLinePoints[k - 1], d);
                                pt1 = pOriginalLinePoints[k];

                                d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                                d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[k], pOriginalLinePoints[k + 1]);
                                if (d1 < d) {
                                    d = d1;
                                }

                                pt2 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[k], pOriginalLinePoints[k + 1], d);
                                redShape.moveTo(pt0);
                                redShape.lineTo(pt1);
                                redShape.lineTo(pt2);
                            } else //last point
                            {
                                d = arraysupport.getScaledSize(50, tg.get_LineThickness());
                                d1 = lineutility.CalcDistanceDouble(pOriginalLinePoints[vblSaveCounter - 1], pOriginalLinePoints[vblSaveCounter - 2]);
                                if (d1 < d) {
                                    d = d1;
                                }

                                redShape.moveTo(pOriginalLinePoints[vblSaveCounter - 1]);
                                pt0 = lineutility.ExtendAlongLineDouble(pOriginalLinePoints[vblSaveCounter - 1], pOriginalLinePoints[vblSaveCounter - 2], d);
                                redShape.lineTo(pt0);
                            }
                        }

                    }
                    shapes.push(redShape);
                    //the dots
                    for (k = 0; k < acCounter; k++) {
                        if (pLinePoints[k].style === 22) {
                            let CirclePoints: POINT2[] = new Array<POINT2>(8);
                            redShape = lineutility.CalcCircleShape(pLinePoints[k], arraysupport.getScaledSize(3, tg.get_LineThickness()), 8, CirclePoints, 9);
                            redShape.setFillColor(Color.RED);
                            if (redShape != null && redShape.getShape() != null) {
                                shapes.push(redShape);
                            }
                        }
                        if (pLinePoints[k].style === 20) {
                            let CirclePoints: POINT2[] = new Array<POINT2>(8);
                            blueShape = lineutility.CalcCircleShape(pLinePoints[k], arraysupport.getScaledSize(3, tg.get_LineThickness()), 8, CirclePoints, 9);
                            blueShape.setFillColor(Color.BLUE);
                            if (blueShape != null && blueShape.getShape() != null) {
                                shapes.push(blueShape);
                            }
                        }
                    }
                    break;
                }

                case TacticalLines.USF: {
                    redShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    redShape.setLineColor(Color.RED);
                    blueShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    blueShape.setLineColor(Color.BLUE);
                    beginLine = true;
                    //int color=0;//red
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 19 && pLinePoints[k + 1].style === 5) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                            //color=0;
                        }
                        if (pLinePoints[k].style === 19 && pLinePoints[k + 1].style === 19) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                            //color=0;
                        }
                        if (pLinePoints[k].style === 25 && pLinePoints[k + 1].style === 5) {
                            blueShape.moveTo(pLinePoints[k]);
                            blueShape.lineTo(pLinePoints[k + 1]);
                            //color=1;
                        }
                        if (pLinePoints[k].style === 25 && pLinePoints[k + 1].style === 25) {
                            blueShape.moveTo(pLinePoints[k]);
                            blueShape.lineTo(pLinePoints[k + 1]);
                            //color=1;
                        }
                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 5) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                        }

                    }
                    shapes.push(redShape);
                    shapes.push(blueShape);
                    break;
                }

                case TacticalLines.SF: {
                    redShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    redShape.setLineColor(Color.RED);
                    blueShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    blueShape.setLineColor(Color.BLUE);
                    redFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    redFillShape.setLineColor(Color.RED);
                    redFillShape.setFillColor(Color.RED);
                    blueFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    blueFillShape.setLineColor(Color.BLUE);
                    blueFillShape.setFillColor(Color.BLUE);
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 19 && pLinePoints[k + 1].style === 5) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                        }
                        if (pLinePoints[k].style === 19 && pLinePoints[k + 1].style === 19) {
                            if (redFillShape.getPoints().length === 0) {
                                redFillShape.moveTo(pLinePoints[k + 9]);
                                for (let l: int = k + 9; l >= k; l--) {
                                    redFillShape.lineTo(pLinePoints[l]);
                                }
                            } else {
                                redFillShape.moveTo(pLinePoints[k]);
                                for (let l: int = k; l < k + 10; l++) {
                                    redFillShape.lineTo(pLinePoints[l]);
                                }
                            }

                            k += 9;
                            shapes.push(redFillShape);
                            redFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                            redFillShape.setLineColor(Color.RED);
                            redFillShape.setFillColor(Color.RED);
                        }
                        if (pLinePoints[k].style === 25 && pLinePoints[k + 1].style === 5) {
                            blueShape.moveTo(pLinePoints[k]);
                            blueShape.lineTo(pLinePoints[k + 1]);
                        }
                        if (pLinePoints[k].style === 25 && pLinePoints[k + 1].style === 25) {
                            if (blueFillShape.getPoints().length === 0) {
                                blueFillShape.moveTo(pLinePoints[k + 2]);
                                blueFillShape.lineTo(pLinePoints[k + 1]);
                                blueFillShape.lineTo(pLinePoints[k]);
                            } else {
                                blueFillShape.moveTo(pLinePoints[k]);
                                blueFillShape.lineTo(pLinePoints[k + 1]);
                                blueFillShape.lineTo(pLinePoints[k + 2]);
                            }
                            shapes.push(blueFillShape);
                            blueFillShape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                            blueFillShape.setLineColor(Color.BLUE);
                            blueFillShape.setFillColor(Color.BLUE);
                        }
                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 5) {
                            redShape.moveTo(pLinePoints[k]);
                            redShape.lineTo(pLinePoints[k + 1]);
                        }
                    }
                    shapes.push(redShape);
                    shapes.push(blueShape);
                    break;
                }

                case TacticalLines.WFG: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 5) {
                            shape.moveTo(pLinePoints[k]);
                            shape.lineTo(pLinePoints[k + 1]);
                        }
                    }
                    shapes.push(shape);

                    //the dots
                    for (k = 0; k < acCounter; k++) {
                        if (pLinePoints[k].style === 20) {
                            let CirclePoints: POINT2[] = new Array<POINT2>(8);
                            shape = lineutility.CalcCircleShape(pLinePoints[k], arraysupport.getScaledSize(3, tg.get_LineThickness()), 8, CirclePoints, 9);
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }
                        }
                    }
                    break;
                }

                case TacticalLines.FOLLA: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(1); //dashed line
                    shape.moveTo(pLinePoints[0]);
                    shape.lineTo(pLinePoints[1]);
                    shapes.push(shape);

                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(0); //dashed line
                    for (j = 2; j < vblCounter; j++) {
                        if (pLinePoints[j - 1].style !== 5) {
                            shape.lineTo(pLinePoints[j]);
                        } else {
                            shape.moveTo(pLinePoints[j]);
                        }
                    }
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.CFG: {
                    for (k = 0; k < acCounter; k++) {
                        if (pLinePoints[k].style === 20) {
                            let CirclePoints: POINT2[] = new Array<POINT2>(8);
                            shape = lineutility.CalcCircleShape(pLinePoints[k], arraysupport.getScaledSize(3, tg.get_LineThickness()), 8, CirclePoints, 9);
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }
                            continue;
                        }
                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 0) {
                            shape.moveTo(pLinePoints[k]);
                            shape.lineTo(pLinePoints[k + 1]);
                        }
                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 9) {
                            shape.moveTo(pLinePoints[k]);
                            shape.lineTo(pLinePoints[k + 1]);
                        }

                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 5) {
                            d = lineutility.CalcDistanceDouble(pLinePoints[k], pLinePoints[k + 1]);
                            pt0 = lineutility.ExtendAlongLineDouble(pLinePoints[k], pLinePoints[k + 1], d - arraysupport.getScaledSize(5, tg.get_LineThickness()));
                            shape.moveTo(pLinePoints[k]);
                            shape.lineTo(pt0);
                        }

                        if (pLinePoints[k].style === 0 && k === acCounter - 2) {
                            shape.moveTo(pLinePoints[k]);
                            shape.lineTo(pLinePoints[k + 1]);
                        }
                    }
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.PIPE: {
                    for (k = 0; k < acCounter; k++) {
                        if (pLinePoints[k].style === 20) {
                            let CirclePoints: POINT2[] = new Array<POINT2>(8);
                            shape = lineutility.CalcCircleShape(pLinePoints[k], arraysupport.getScaledSize(5, tg.get_LineThickness()), 8, CirclePoints, 9);
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }
                        }
                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    for (k = 0; k < acCounter - 1; k++) {
                        if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 5) {
                            shape.moveTo(pLinePoints[k]);
                            shape.lineTo(pLinePoints[k + 1]);
                        }
                    }
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.ATDITCHM: {
                    for (k = 0; k < acCounter; k++) {
                        if (pLinePoints[k].style === 20) {
                            let CirclePoints: POINT2[] = new Array<POINT2>(8);
                            shape = lineutility.CalcCircleShape(pLinePoints[k], arraysupport.getScaledSize(4, tg.get_LineThickness()), 8, CirclePoints, 9);//was 3
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }
                            continue;
                        }
                        if (k < acCounter - 2) {
                            if (pLinePoints[k].style !== 0 && pLinePoints[k + 1].style === 0) {
                                shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                                shape.set_Style(pLinePoints[k].style);
                                shape.moveTo(pLinePoints[k]);
                                shape.lineTo(pLinePoints[k]);
                            } else {
                                if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 0) {
                                    shape.moveTo(pLinePoints[k]);
                                    shape.lineTo(pLinePoints[k + 1]);
                                } else {
                                    if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 10) {
                                        shape.moveTo(pLinePoints[k]);
                                        shape.lineTo(pLinePoints[k + 1]);
                                        shapes.push(shape);
                                    }
                                }

                            }

                        }
                        if (k < acCounter - 2) {
                            if (pLinePoints[k].style === 5 && pLinePoints[k + 1].style === 0) {
                                shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                                shape.set_Style(pLinePoints[k].style);
                                shape.moveTo(pLinePoints[k]);
                                //shape.lineTo(pLinePoints[k]);
                            } else {
                                if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 0) {
                                    shape.lineTo(pLinePoints[k + 1]);
                                } else {
                                    if (pLinePoints[k].style === 0 && pLinePoints[k + 1].style === 5) {
                                        shape.lineTo(pLinePoints[k + 1]);
                                        shapes.push(shape);
                                    }
                                }

                            }

                        }
                    }//end for
                    break;
                }

                case TacticalLines.ESR1: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(pLinePoints[0].style);
                    shape.moveTo(pLinePoints[0]);
                    shape.lineTo(pLinePoints[1]);
                    //if(shape !=null && shape.get_Shape() != null)
                    shapes.push(shape);
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(pLinePoints[2].style);
                    shape.moveTo(pLinePoints[2]);
                    shape.lineTo(pLinePoints[3]);
                    //if(shape !=null && shape.get_Shape() != null)
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.FORDIF: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(pLinePoints[0].style);
                    shape.moveTo(pLinePoints[0]);
                    shape.lineTo(pLinePoints[1]);
                    shape.moveTo(pLinePoints[2]);
                    shape.lineTo(pLinePoints[3]);
                    shapes.push(shape);
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(pLinePoints[4].style);
                    shape.moveTo(pLinePoints[4]);
                    for (k = 5; k < acCounter; k++) {
                        if (pLinePoints[k - 1].style !== 5) {
                            shape.lineTo(pLinePoints[k]);
                        }
                    }

                    if (shape != null && shape.getShape() != null) {
                        shapes.push(shape);
                    }
                    break;
                }

                case TacticalLines.FENCED: {
                    //first shape is the original points
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.set_Style(points[0].style);
                    shape.moveTo(points[0]);
                    for (k = 1; k < vblCounter; k++) {
                        shape.lineTo(points[k]);
                    }
                    if (shape != null && shape.getShape() != null) {
                        shapes.push(shape);
                    }

                    //second shape are the xpoints
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    beginLine = true;
                    for (k = vblCounter; k < points.length; k++) {
                        if (beginLine) {
                            if (k === 0) {
                                shape.set_Style(points[k].style);
                            }

                            if (k > 0) //doubled points with linestyle=5
                            {
                                if (points[k].style === 5 && points[k - 1].style === 5) {
                                    shape.lineTo(points[k]);
                                }
                            }

                            shape.moveTo(points[k]);
                            beginLine = false;
                        } else {
                            shape.lineTo(points[k]);
                            if (points[k].style === 5 || points[k].style === 10) {
                                beginLine = true;
                                //unless there are doubled points with style=5
                            }
                        }
                        if (k === points.length - 1) //non-LC should only have one shape
                        {
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }
                        }
                    }
                    break;
                }

                case TacticalLines.AIRFIELD: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(pLinePoints[0]);
                    for (k = 1; k < acCounter - 5; k++) {
                        shape.lineTo(pLinePoints[k]);
                    }

                    shapes.push(shape);

                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.moveTo(pLinePoints[acCounter - 4]);
                    shape.lineTo(pLinePoints[acCounter - 3]);
                    shape.moveTo(pLinePoints[acCounter - 2]);
                    shape.lineTo(pLinePoints[acCounter - 1]);
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.STRIKWARN: {
                    let midPointIndex = Math.trunc(acCounter / 2);
                    arraysupport.addPolyline(pLinePoints, midPointIndex, shapes);
                    secondPoly = new Array<POINT2>(midPointIndex);
                    for (let i: int = 0; i < midPointIndex; i++) {
                        secondPoly[i] = pLinePoints[i + midPointIndex];
                    }
                    arraysupport.addPolyline(secondPoly, midPointIndex, shapes);
                    break;
                }

                case TacticalLines.DIRATKAIR: {
                    secondPoly = new Array<POINT2>(9);
                    for (let i: int = 0; i < 4; i++) {
                        secondPoly[i] = pLinePoints[pLinePoints.length - 4 + i];
                    }
                    arraysupport.addPolyline(secondPoly, 4, shapes); // Main line
                    arraysupport.addPolyline(pLinePoints, acCounter - 13, shapes); // Main line extension
                    for (let i: int = 0; i < 9; i++) {
                        secondPoly[i] = pLinePoints[pLinePoints.length - 13 + i];
                    }
                    arraysupport.addPolyline(secondPoly, 9, shapes); // Arrow and bowtie
                    break;
                }

                case TacticalLines.DIRATKSPT: {
                    arraysupport.addPolyline(pLinePoints, acCounter - 3, shapes); // Main line
                    secondPoly = new Array<POINT2>(3);
                    for (let i: int = 0; i < 3; i++) {
                        secondPoly[i] = pLinePoints[pLinePoints.length - 3 + i];
                    }
                    arraysupport.addPolyline(secondPoly, 3, shapes); // Arrow
                    break;
                }

                default: {
                    arraysupport.addPolyline(pLinePoints, acCounter, shapes);
                    break;
                }

            }//end switch
            //a loop for arrowheads with fill
            //these require a separate shape for fill
            switch (lineType) {
                case TacticalLines.AC:
                case TacticalLines.SAAFR:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC:
                case TacticalLines.SC:
                case TacticalLines.LLTR: {
                    for (j = 0; j < vblSaveCounter - 1; j++) {
                        dMBR = pOriginalLinePoints[j].style;
                        acPoints[0] = new POINT2(pOriginalLinePoints[j]);
                        acPoints[1] = new POINT2(pOriginalLinePoints[j + 1]);
                        lineutility.GetSAAFRFillSegment(acPoints, dMBR);//was dMRR
                        shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                        shape.moveTo(acPoints[0]);
                        shape.lineTo(acPoints[1]);
                        shape.lineTo(acPoints[2]);
                        shape.lineTo(acPoints[3]);
                        shapes.splice(0, 0, shape);
                    }
                    break;
                }

                case TacticalLines.DIRATKAIR: {
                    //added this section to not fill the bow tie and instead
                    //add a shape to close what had been the bow tie fill areas with
                    //a line segment for each one
                    let outLineCounter: int = 0;
                    let ptOutline: POINT2[] = new Array<POINT2>(4);
                    for (k = 0; k < acCounter; k++) {
                        if (pLinePoints[k].style === 10) {
                            shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                            shape.moveTo(pLinePoints[k - 2]);
                            shape.lineTo(pLinePoints[k]);
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }

                            //collect these four points
                            ptOutline[outLineCounter++] = pLinePoints[k - 2];
                            ptOutline[outLineCounter++] = pLinePoints[k];
                        }
                    }//end for
                    break;
                }

                case TacticalLines.OFY:
                case TacticalLines.OCCLUDED:
                case TacticalLines.WF:
                case TacticalLines.WFG:
                case TacticalLines.WFY:
                case TacticalLines.CF:
                case TacticalLines.CFY:
                case TacticalLines.CFG:
                case TacticalLines.SARA:
                case TacticalLines.FERRY:
                case TacticalLines.EASY:
                case TacticalLines.BYDIF:
                case TacticalLines.BYIMP:
                case TacticalLines.FOLSP:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.MNFLDFIX:
                case TacticalLines.TURN:
                case TacticalLines.MNFLDDIS: {
                    //POINT2 initialFillPt=null;
                    for (k = 0; k < acCounter; k++) {
                        if (k === 0) {
                            if (pLinePoints[k].style === 9) {
                                shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                                shape.set_Style(pLinePoints[k].style);
                                shape.moveTo(pLinePoints[k]);
                            }
                        } else //k>0
                        {
                            if (pLinePoints[k].style === 9 && pLinePoints[k - 1].style !== 9) {
                                shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                                shape.set_Style(pLinePoints[k].style);
                                shape.moveTo(pLinePoints[k]);
                            }
                            if (pLinePoints[k].style === 9 && pLinePoints[k - 1].style === 9) //9,9,...,9,10
                            {
                                shape.lineTo(pLinePoints[k]);
                            }
                        }
                        if (pLinePoints[k].style === 10) {
                            shape.lineTo(pLinePoints[k]);
                            if (shape != null && shape.getShape() != null) {
                                shapes.splice(0, 0, shape);
                            }
                        }
                    }//end for
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(arraysupport._className, "GetLineArray2Double",
                    new RendererException("GetLineArray2Dboule " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return points;
    }

    private static addPolyline(pLinePoints: POINT2[], acCounter: int, shapes: Array<Shape2>): void {
        let shape: Shape2 | null = null;
        let beginLine: boolean = true;
        for (let k: int = 0; k < acCounter; k++) {
            //use shapes instead of pixels
            if (shape == null) {
                shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
            }

            if (beginLine) {

                if (k === 0) {
                    shape.set_Style(pLinePoints[k].style);
                }

                if (k > 0) //doubled points with linestyle=5
                {
                    if (pLinePoints[k].style === 5 && pLinePoints[k - 1].style === 5 && k < acCounter - 1) {
                        continue;
                    } else {
                        if (pLinePoints[k].style === 5 && pLinePoints[k - 1].style === 10) //CF
                        {
                            continue;
                        }
                    }

                }

                if (k === 0 && pLinePoints.length > 1) {
                    if (pLinePoints[k].style === 5 && pLinePoints[k + 1].style === 5) {
                        continue;
                    }
                }

                shape.moveTo(pLinePoints[k]);
                beginLine = false;
            } else {
                shape.lineTo(pLinePoints[k]);
                if (pLinePoints[k].style === 5 || pLinePoints[k].style === 10) {
                    beginLine = true;
                    //unless there are doubled points with style=5
                }
            }
            if (k === acCounter - 1) //non-LC should only have one shape
            {
                if (shape != null && shape.getShape() != null) {
                    shapes.push(shape);
                }
            }
        }//end for
    }

    /**
     * Returns which side of the line segment the arrow(s) go on for supply routes
     */
    public static SupplyRouteArrowSide(pt0: POINT2, pt1: POINT2): int {
        let m: ref<number[]> = new ref();
        let bolVertical: int = lineutility.CalcTrueSlopeDouble(pt0, pt1, m);
        if (pt0.x < pt1.x) {
            if (m.value[0] < 1) {
                return 2;
            }
            if (m.value[0] >= 1) {
                return 1;
            }
        } else {
            if (pt0.x > pt1.x) {
                if (m.value[0] < 1) {
                    return 3;
                }
                if (m.value[0] >= 1) {
                    return 0;
                }
            } else {
                if (bolVertical === 0) {
                    if (pt0.y > pt1.y) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            }

        }

        return 0;
    }

    public static getScaledSize(originalSize: double, lineWidth: double): double {
        if (lineWidth <= 3) { // Default line width
            return originalSize;
        } else {
            if (lineWidth > 100) {
                lineWidth = 100; // Max scale size
            }
        }

        return originalSize * (1 + (lineWidth - 3) / 2);
    }
}
