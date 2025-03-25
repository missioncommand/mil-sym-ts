/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


//import java.awt.Color;

import { type double, type int, type long } from "../graphics2d/BasicTypes";



import { arraysupport } from "../JavaLineArray/arraysupport"
import { CChannelPoints2 } from "../JavaLineArray/CChannelPoints2"
import { flot } from "../JavaLineArray/flot"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"

import { TGLight } from "../JavaTacticalRenderer/TGLight"

import { Color } from "../renderer/utilities/Color"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"

import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"


/**
 * CELineArray Channels class calculates the channel points
 *
 */
export class Channels {
    private static readonly maxLength: double = 100;//max arrow size
    private static readonly minLength: double = 5;	//max arrow size
    private static readonly _className: string = "Channels";
    private static _client: string = "";
    public static setClient(value: string): void {
        Channels._client = value;
    }
    //    private static String _affiliation="";
    //    public static void setAffiliation(String value)
    //    {
    //        _affiliation=value;
    //    }
    private static _shiftLines: boolean = true;
    //    public static void setShiftLines(boolean value)
    //    {
    //        _shiftLines=value;
    //    }
    public static getShiftLines(): boolean {
        return Channels._shiftLines;
    }
    private static ConnectArrayTrueDouble(nWidth: int,
        nCounter: int,
        pLinePoints: POINT2[],
        pResultChannelPoints: CChannelPoints2[]): CChannelPoints2[] {
        try {
            //declarations
            let nPointCounter: int = 0;
            let nDiff1X: double = 0;
            let
                nDiff2X: double = 0;
            let
                nDiff1Y: double = 0;
            let
                nDiff2Y: double = 0;
            let nLast: int = 0;
            let lOrient: int = 0;
            let LinePoint1: POINT2 = new POINT2(pLinePoints[0]);
            let
                LinePoint2: POINT2 = new POINT2(pLinePoints[0]);
            let
                LinePoint3: POINT2 = new POINT2(pLinePoints[0]);

            //POINT2 EndPoint1=new POINT2(pLinePoints[0]);
            //POINT2 EndPoint2=new POINT2(pLinePoints[0]);
            let ResultChannelPoint: CChannelPoints2 = new CChannelPoints2();
            //end declarations

            //must establish nLast before we get the first channel end point
            //put first GetEndPoint into the pResultChannelPoints array
            LinePoint1 = new POINT2(pLinePoints[0]);
            LinePoint2 = new POINT2(pLinePoints[1]);
            nDiff1X = LinePoint2.x - LinePoint1.x;
            nDiff1Y = LinePoint2.y - LinePoint1.y;
            if (nDiff1X === 0) {
                if (nDiff1Y > 0) {

                    nLast = 6;
                }

                if (nDiff1Y < 0) {

                    nLast = 4;
                }

            }
            if (nDiff1Y === 0) {
                if (nDiff1X > 0) {

                    nLast = 0;
                }

                if (nDiff1X < 0) {

                    nLast = 2;
                }

            }
            if (nDiff1X < 0 && nDiff1Y > 0) {

                nLast = 3;
            }

            if (nDiff1X > 0 && nDiff1Y > 0) {

                nLast = 0;
            }

            if (nDiff1X < 0 && nDiff1Y < 0) {

                nLast = 3;
            }

            if (nDiff1X > 0 && nDiff1Y < 0) {

                nLast = 0;
            }


            ResultChannelPoint = Channels.GetTrueEndPointDouble(nWidth, pLinePoints[0], pLinePoints[1], nLast);
            pResultChannelPoints[0] = new CChannelPoints2(ResultChannelPoint);
            //initialize nLast depending on the first 1 or 2 segments

            //stuff the array
            //nLast needs to indicate if the last segment2 had line1 above or below it
            for (nPointCounter = 1; nPointCounter < nCounter; nPointCounter++) {
                LinePoint1 = new POINT2(pLinePoints[nPointCounter - 1]);
                LinePoint2 = new POINT2(pLinePoints[nPointCounter]);
                LinePoint3 = new POINT2(pLinePoints[nPointCounter + 1]);
                nDiff1X = LinePoint2.x - LinePoint1.x;
                nDiff2X = LinePoint3.x - LinePoint2.x;
                nDiff1Y = LinePoint2.y - LinePoint1.y;
                nDiff2Y = LinePoint3.y - LinePoint2.y;

                //determine nLast to use in the next iteration
                //nLast=0: last segment2 was left to right and line1 above it
                //nLast=1: last segment2 was left to right and line1 below it
                //nLast=2: last segment2 was right to left and line1 above it
                //nLast=3: last segment2 was right to left and line1 below it
                //nLast=4: last segment2 was vertical upward and line1 above (to the left of it)
                //nLast=5: last segment2 was vertical upward and line1 below (to the right of it)
                //nLast=6: last segment2 was vertical downward and line1 above (to the left of it)
                //nLast=7: last segment2 was vertical downward and line1 below (to the right of it)
                if (nDiff1X > 0 && nDiff2X > 0)	//pt1------pt2------pt3
                {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            lOrient = 0;	//above & above
                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            lOrient = 3;	//below & below
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //								pt1-----pt2    or		   pt3
                //										|					|
                //										|					|
                //										|					|
                //										pt3		   pt1-----pt2
                if (nDiff1X > 0 && nDiff2X === 0) {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            if (nDiff2Y > 0) {

                                lOrient = 1;
                            }
                            //above & below
                            if (nDiff2Y < 0) {

                                lOrient = 0;
                            }
                            //above & above
                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            if (nDiff2Y > 0) {

                                lOrient = 2;
                            }

                            if (nDiff2Y < 0) {

                                lOrient = 3;
                            }

                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //								pt2-----pt1    or   pt3
                //								|					|
                //								|					|
                //								|					|
                //								pt3					pt2-----pt1
                if (nDiff1X < 0 && nDiff2X === 0) {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            if (nDiff2Y > 0) {

                                lOrient = 3;
                            }

                            if (nDiff2Y < 0) {

                                lOrient = 2;
                            }

                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            if (nDiff2Y > 0) {

                                lOrient = 0;
                            }

                            if (nDiff2Y < 0) {

                                lOrient = 1;
                            }

                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //								pt2-----pt3    or   pt1
                //								|					|
                //								|					|
                //								|					|
                //								pt1					pt2-----pt3
                if (nDiff1X === 0 && nDiff2X > 0) {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            if (nDiff1Y > 0) {

                                lOrient = 2;
                            }

                            if (nDiff1Y < 0) {

                                lOrient = 0;
                            }

                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            if (nDiff1Y > 0) {

                                lOrient = 1;
                            }

                            if (nDiff1Y < 0) {

                                lOrient = 3;
                            }

                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //						pt3-----pt2    or			pt1
                //								|					|
                //								|					|
                //								|					|
                //								pt1			pt3-----pt2
                if (nDiff1X === 0 && nDiff2X < 0) {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            if (nDiff1Y > 0) {

                                lOrient = 3;
                            }

                            if (nDiff1Y < 0) {

                                lOrient = 1;
                            }

                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            if (nDiff1Y > 0) {

                                lOrient = 0;
                            }

                            if (nDiff1Y < 0) {

                                lOrient = 2;
                            }

                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }


                if (nDiff1X < 0 && nDiff2X < 0)	//pt3-----pt2------pt1
                {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            lOrient = 3;	//below & below
                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            lOrient = 0;	//above & above
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //	pt1\
                //		 \
                //		   \pt2
                //		   /
                //	     /
                //  pt3/
                if (nDiff1X > 0 && nDiff2X < 0) {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            lOrient = 1;	//above & below
                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            lOrient = 2;	//below & above
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //			 pt1
                //		   /
                //		 /
                //	pt2/
                //		\
                //	      \
                //		    \pt3
                if (nDiff1X < 0 && nDiff2X > 0) {
                    switch (nLast) {
                        case 0:
                        case 3:
                        case 4:
                        case 7: {
                            lOrient = 2;	//below & above
                            break;
                        }

                        case 1:
                        case 2:
                        case 5:
                        case 6: {
                            lOrient = 1;	//above & below
                            break;
                        }

                        default: {
                            break;
                        }

                    }	//end switch(nLast)
                }	//end if


                //			 pt1    or   pt3
                //		      |			  |
                //			  |	          |
                //			 pt2		 pt2
                //		      |			  |
                //	          |			  |
                //		     pt3		 pt1
                if (nDiff1X === 0 && nDiff2X === 0) {
                    switch (nLast) {
                        case 4: {
                            if (nDiff2Y < 0) {

                                lOrient = 0;
                            }

                            break;
                        }

                        case 6: {
                            if (nDiff2Y > 0) {

                                lOrient = 0;
                            }

                            break;
                        }

                        case 5: {
                            if (nDiff2Y < 0) {

                                lOrient = 3;
                            }

                            break;
                        }

                        case 7: {
                            if (nDiff2Y > 0) {

                                lOrient = 3;
                            }

                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                //get the channel points based on the desired orientation
                pResultChannelPoints[nPointCounter] = Channels.ConnectTrueDouble2(nWidth, LinePoint1,
                    LinePoint2, LinePoint3, lOrient);

                //2nd segment vertical
                if (nDiff2X === 0) {
                    switch (lOrient) {
                        case 0: {
                            if (nDiff2Y > 0) {
                                nLast = 6;
                            }
                            if (nDiff2Y < 0) {
                                nLast = 4;
                            }
                            break;
                        }

                        case 1: {
                            if (nDiff2Y > 0) {
                                nLast = 7;
                            }
                            if (nDiff2Y < 0) {
                                nLast = 5;
                            }
                            break;
                        }

                        case 2: {
                            if (nDiff2Y > 0) {
                                nLast = 6;
                            }
                            if (nDiff2Y < 0) {
                                nLast = 4;
                            }
                            break;
                        }

                        case 3: {
                            if (nDiff2Y > 0) {
                                nLast = 7;
                            }
                            if (nDiff2Y < 0) {
                                nLast = 5;
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }
                //pt2--------pt3
                if (nDiff2X > 0) {
                    switch (lOrient) {
                        case 0: {	//above & above
                            nLast = 0;
                            break;
                        }

                        case 1: {	//above & below
                            nLast = 1;
                            break;
                        }

                        case 2: {	//below & above
                            nLast = 0;
                            break;
                        }

                        case 3: {	//below & below
                            nLast = 1;
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    //break;
                }
                //pt3--------pt2
                if (nDiff2X < 0) {
                    switch (lOrient) {
                        case 0: {	//above & above
                            nLast = 2;
                            break;
                        }

                        case 1: {	//above & below
                            nLast = 3;
                            break;
                        }

                        case 2: {	//below & above
                            nLast = 2;
                            break;
                        }

                        case 3: {	//below & below
                            nLast = 3;
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }
            }	//end for

            ResultChannelPoint = Channels.GetTrueEndPointDouble(nWidth, pLinePoints[nCounter],
                pLinePoints[nCounter - 1], nLast);

            pResultChannelPoints[nCounter] = new CChannelPoints2(ResultChannelPoint);
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                ErrorLogger.LogException(Channels._className, "ConnectArrayTrueDouble",
                    new RendererException("Failed inside ConnectArrayTrueDouble", exc));
            } else {
                throw exc;
            }
        }
        return pResultChannelPoints;
    }
    private static GetChannel2Double(nChannelWidth: int,
        vblCounter: int,
        pLinePoints: POINT2[],
        pResultChannelPoints: CChannelPoints2[]): CChannelPoints2[] {
        try {
            pResultChannelPoints = Channels.ConnectArrayTrueDouble(Math.trunc(nChannelWidth / 2), Math.trunc(vblCounter) - 1,
                pLinePoints, pResultChannelPoints);

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetChannel2Double",
                    new RendererException("Failed inside GetChannel2Double", exc));
            } else {
                throw exc;
            }
        }
        return pResultChannelPoints;
    }

    private static GetLowerChannelLineDouble(pChannelPoints: CChannelPoints2[],
        vblCounter: int,
        pResultLinePoints: POINT2[]): POINT2[] {
        try {
            let j: int = 0;

            for (j = 0; j < vblCounter; j++) {
                pResultLinePoints[j] = new POINT2(pChannelPoints[j].m_Line1);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetLowerChannelLineDouble",
                    new RendererException("GetLowerChannelLineDouble", exc));
            } else {
                throw exc;
            }
        }
        return pResultLinePoints;
    }
    private static GetUpperChannelLineDouble(pChannelPoints: CChannelPoints2[],
        vblCounter: int,
        pResultLinePoints: POINT2[]): POINT2[] {
        try {
            let j: int = 0;
            for (j = 0; j < vblCounter; j++) {
                pResultLinePoints[j] = new POINT2(pChannelPoints[j].m_Line2);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetUpperChannelLineDouble",
                    new RendererException("Failed inside GetUpperChannelLineDouble", exc));
            } else {
                throw exc;
            }
        }
        return pResultLinePoints;
    }
    private static FenceType(linetype: int): int {
        let bolResult: int = 0;
        try {
            switch (linetype) {
                case TacticalLines.TRIPLE:
                case TacticalLines.DOUBLEC:
                case TacticalLines.SINGLEC:
                case TacticalLines.HWFENCE:
                case TacticalLines.LWFENCE:
                case TacticalLines.UNSP:
                case TacticalLines.DOUBLEA:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE: {
                    bolResult = 1;
                    break;
                }

                default: {
                    bolResult = 0;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "FenceType",
                    new RendererException("Failed inside FenceType " + linetype.toString(), exc));
            } else {
                throw exc;
            }
        }
        return bolResult;
    }
    /**
    * Calculates the point count for the concertina wire and fence channels.
    *
    * @param pLinePoints client points
    * @param vblCounter the client point count
    * @param linetype the line type
    *
    * @return the number of points required to render the symbol
    */
    static GetTripleCountDouble(pLinePoints: POINT2[],
        vblCounter: int,
        linetype: int): int {
        let lTotal: int = 0;
        try {
            //declarations
            let j: int = 0;
            let lHowManyThisSegment: int = 0;
            let d: double = 0;
            //end declarations

            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                if (d <= 10) {
                    lHowManyThisSegment = 0;
                } else {
                    lHowManyThisSegment = Math.trunc((d - 10) / 10);
                }

                lTotal += lHowManyThisSegment;
            }

            switch (linetype) {
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE: {
                    lTotal = 6 * vblCounter + 37 * lTotal;  //was 2*vblCounter+37*lTotal
                    break;
                }

                case TacticalLines.HWFENCE:
                case TacticalLines.LWFENCE:
                case TacticalLines.UNSP:
                case TacticalLines.DOUBLEA:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE: {
                    lTotal = 4 * vblCounter + 4 * lTotal;
                    break;
                }

                default: {
                    lTotal = 2 * vblCounter;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetTripleCountDouble",
                    new RendererException("Failed inside GetTripleCountDouble " + linetype.toString(), exc));
            } else {
                throw exc;
            }
        }
        return lTotal;
    }

    protected static CoordIL2Double(nPrinter: int,
        pLinePoints: POINT2[],
        nUpperLower: int,
        vblCounter: int,
        linetype: int,
        vblChannelWidth: int): POINT2[] {
        let pLinePoints2: POINT2[] = new Array<POINT2>(vblCounter);
        try {
            //declarations
            let j: int = 0;
            let channelWidth: int = 20;
            let pNewLinePoints: POINT2[] = new Array<POINT2>(vblCounter);
            let pChannelPoints: CChannelPoints2[] = new Array<CChannelPoints2>(vblCounter);
            //end declarations

            lineutility.InitializePOINT2Array(pLinePoints2);
            for (j = 0; j < vblCounter; j++) {
                pNewLinePoints[j] = new POINT2(pLinePoints[j]);
            }

            channelWidth = vblChannelWidth;

            if (linetype !== TacticalLines.LC &&
                linetype !== TacticalLines.LC_HOSTILE) {
                channelWidth /= 2;
            }

            pChannelPoints = Channels.GetChannel2Double(channelWidth * nPrinter,
                vblCounter,
                pNewLinePoints,
                pChannelPoints);

            if (nUpperLower === 1) {
                pNewLinePoints = Channels.GetUpperChannelLineDouble(pChannelPoints,
                    vblCounter,
                    pNewLinePoints);

                for (j = 0; j < vblCounter; j++) {
                    pLinePoints2[j] = new POINT2(pNewLinePoints[j]);
                }
            }

            if (nUpperLower === 0) {
                pNewLinePoints = Channels.GetLowerChannelLineDouble(pChannelPoints,
                    vblCounter,
                    pNewLinePoints);

                for (j = 0; j < vblCounter; j++) {
                    pLinePoints2[j] = new POINT2(pNewLinePoints[j]);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "CoordIL2Double",
                    new RendererException("Failed inside CoordIL2Double", exc));
            } else {
                throw exc;
            }
        }
        return pLinePoints2;
    }

    /**
     * gets the axis of advance arrowhead
     * @param dPrinter
     * @param pLowerLinePoints
     * @param lLowerCounter
     * @param pUpperLinePoints
     * @param lUpperCounter
     * @param ArrowLinePoint
     * @param pLinePoints
     * @param vbiDrawThis
     * @param dOffsetFactor
     */
    private static GetAXADDouble(dPrinter: double,
        pLowerLinePoints: POINT2[],
        lLowerCounter: int,
        pUpperLinePoints: POINT2[],
        lUpperCounter: int,
        ArrowLinePoint: POINT2,
        pLinePoints: POINT2[],
        vbiDrawThis: int,
        dOffsetFactor: double): void {
        try {
            let j: int = 0;
            let
                lCounter: int = lLowerCounter + lUpperCounter + 8;
            let x: double = 0;
            let y: double = 0;
            let OuterTipLinePoint: POINT2 = new POINT2(pUpperLinePoints[0]);
            let
                InnerTipLinePoint: POINT2 = new POINT2(pUpperLinePoints[0]);
            let
                EndLinePoint: POINT2 = new POINT2(pUpperLinePoints[0]);
            let
                TempLinePoint: POINT2 = new POINT2(pUpperLinePoints[0]);
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            //double dOffsetFactor = 10;
            //end declarations

            //10-19-12
            //we must do this for catkbyfire because the rotary arrow tip now has to match the
            //anchor point, i.e. the rotary feature can no longer stick out past the anchor point
            //45 pixels shift here matches the 45 pixels shift for catkbyfire found in 
            //lineutility.adjustCATKBYFIREControlPoint as called by clsChannelUtility.DrawChannel
            let origArrowPt: POINT2 = new POINT2(ArrowLinePoint);
            let ptUpper0: POINT2 = new POINT2(pUpperLinePoints[lUpperCounter - 1]);
            let ptLower0: POINT2 = new POINT2(pLowerLinePoints[lLowerCounter - 1]);
            let dist: double = lineutility.CalcDistanceDouble(pLowerLinePoints[lLowerCounter - 1], pLowerLinePoints[lLowerCounter - 2]);
            if (vbiDrawThis === TacticalLines.CATKBYFIRE) {
                if (dist > 45) {
                    let midPt: POINT2 = lineutility.MidPointDouble(pLowerLinePoints[lLowerCounter - 2], pUpperLinePoints[lUpperCounter - 2], 0);
                    ArrowLinePoint = lineutility.ExtendAlongLineDouble(ArrowLinePoint, midPt, 45);
                    pLowerLinePoints[lLowerCounter - 1] = lineutility.ExtendAlongLineDouble(pLowerLinePoints[lLowerCounter - 1], pLowerLinePoints[lLowerCounter - 2], 45);//will be 45 if Oculus adjusts control point
                    pUpperLinePoints[lUpperCounter - 1] = lineutility.ExtendAlongLineDouble(pUpperLinePoints[lUpperCounter - 1], pUpperLinePoints[lUpperCounter - 2], 45);//will be 45 if Oculus adjusts control point
                }
            }
            //end section

            for (j = 0; j < lLowerCounter; j++) {
                pLinePoints[j] = new POINT2(pLowerLinePoints[j]);
            }

            pLinePoints[lLowerCounter - 1].style = 5;

            for (j = 0; j < lUpperCounter; j++) {
                pLinePoints[lLowerCounter + j] = new POINT2(pUpperLinePoints[j]);
            }

            for (j = lCounter - 8; j < lCounter; j++) //initializations
            {
                pLinePoints[j] = new POINT2(pUpperLinePoints[0]);
            }

            EndLinePoint.x = Math.trunc((pLowerLinePoints[lLowerCounter - 1].x +
                pUpperLinePoints[lUpperCounter - 1].x) as double / 2);

            EndLinePoint.y = Math.trunc((pLowerLinePoints[lLowerCounter - 1].y +
                pUpperLinePoints[lUpperCounter - 1].y) as double / 2);


            x = (pLowerLinePoints[lLowerCounter - 1].x - pUpperLinePoints[lUpperCounter - 1].x) as double;
            y = (pLowerLinePoints[lLowerCounter - 1].y - pUpperLinePoints[lUpperCounter - 1].y) as double;
            x = x * x;
            y = y * y;
            //nBase = (int) Math.sqrt(x + y);

            //nBase *= (int) dPrinter;

            OuterTipLinePoint = new POINT2(ArrowLinePoint);
            InnerTipLinePoint = lineutility.GetOffsetPointDouble(EndLinePoint, OuterTipLinePoint, - Math.trunc(dOffsetFactor * dPrinter));
            pLinePoints[lCounter - 9].style = 5;
            pLinePoints[lCounter - 8] = new POINT2(OuterTipLinePoint);

            pt0.x = pUpperLinePoints[lUpperCounter - 1].x;
            pt0.y = pUpperLinePoints[lUpperCounter - 1].y;
            pt1.x = pLowerLinePoints[lLowerCounter - 1].x;
            pt1.y = pLowerLinePoints[lLowerCounter - 1].y;
            TempLinePoint = lineutility.GetOffsetPointDouble(pt0, pt1, Math.trunc(dOffsetFactor * dPrinter));

            pLinePoints[lCounter - 7] = new POINT2(TempLinePoint);
            pLinePoints[lCounter - 6] = new POINT2(pLowerLinePoints[lLowerCounter - 1]);
            pLinePoints[lCounter - 5] = new POINT2(InnerTipLinePoint);
            pLinePoints[lCounter - 4] = new POINT2(pUpperLinePoints[lUpperCounter - 1]);

            pt0.x = pLowerLinePoints[lLowerCounter - 1].x;
            pt0.y = pLowerLinePoints[lLowerCounter - 1].y;
            pt1.x = pUpperLinePoints[lUpperCounter - 1].x;
            pt1.y = pUpperLinePoints[lUpperCounter - 1].y;
            TempLinePoint = lineutility.GetOffsetPointDouble(pt0, pt1, Math.trunc(dOffsetFactor * dPrinter));

            pLinePoints[lCounter - 3] = new POINT2(TempLinePoint);
            pLinePoints[lCounter - 2] = new POINT2(OuterTipLinePoint);
            pLinePoints[lCounter - 1] = new POINT2(OuterTipLinePoint);
            pLinePoints[lCounter - 1].style = 5;

            switch (vbiDrawThis) {
                case TacticalLines.SPT_STRAIGHT:
                case TacticalLines.SPT:
                case TacticalLines.AAAAA:
                case TacticalLines.AIRAOA:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE: {
                    pLinePoints[lCounter - 6].style = 5;
                    pLinePoints[lCounter - 5].style = 5;
                    break;
                }

                default: {
                    break;
                }

            }

            //10-19-12
            //reset the original points after the hack for catkbyfire
            if (vbiDrawThis === TacticalLines.CATKBYFIRE && dist > 45) {
                pUpperLinePoints[lUpperCounter - 1].x = ptUpper0.x;
                pUpperLinePoints[lUpperCounter - 1].y = ptUpper0.y;
                pLowerLinePoints[lLowerCounter - 1].x = ptLower0.x;
                pLowerLinePoints[lLowerCounter - 1].y = ptLower0.y;
                ArrowLinePoint.x = origArrowPt.x;
                ArrowLinePoint.y = origArrowPt.y;
            }
            //end section
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetAXADDouble",
                    new RendererException("Failed inside GetAXADDouble " + vbiDrawThis.toString(), exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Calculates a channel line and is called once each time for lower and upper channel lines.
     *
     * @param nPrinter always 1
     * @param pLinePoints client points
     * @param nUpperLower 0 for lower channel line, 1 for upper channel line
     * @param vblCounter the client point count
     * @param vbiDrawThis the line type
     * @param vblChannelWidth the channel width
     *
     * @return the channel line array as POINT2
     */
    static GetChannelArray2Double(nPrinter: int,
        pLinePoints: POINT2[],
        nUpperLower: int,
        vblCounter: int,
        vbiDrawThis: int,
        vblChannelWidth: int): POINT2[] {
        try {
            //get the upper or lower channel array for the specified channel type
            switch (vbiDrawThis) {
                case TacticalLines.LC:
                case TacticalLines.LC_HOSTILE:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT:
                case TacticalLines.TRIPLE:
                case TacticalLines.DOUBLEC:
                case TacticalLines.SINGLEC:
                case TacticalLines.HWFENCE:
                case TacticalLines.LWFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.UNSP:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    pLinePoints = Channels.CoordIL2Double(nPrinter, pLinePoints, nUpperLower, vblCounter, vbiDrawThis, vblChannelWidth);
                    break;
                }

                default: {
                    //do nothing if it's not a channel type
                    break;
                }

            }	//end switch

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetChannelArray2Double",
                    new RendererException("Failed inside GetChannelArray2Double " + vbiDrawThis.toString(), exc));
            } else {
                throw exc;
            }
        }
        return pLinePoints;
    }

    private static GetTrueEndPointDouble(nWidth: int,
        EndLinePoint: POINT2,
        NextLinePoint: POINT2,
        lLast: int): CChannelPoints2 {
        let cAnswers: CChannelPoints2 = new CChannelPoints2();
        try {
            //declarations
            let LinePoint1: POINT2 = new POINT2();
            let LinePoint2: POINT2 = new POINT2();
            let m: double = 0;
            let
                b: double = 0;
            let
                bPerpendicular: double = 0;
            let
                Upperb: double = 0;
            let
                Lowerb: double = 0;
            let
                dWidth: double = nWidth as double;
            let bolVertical: int = 0;
            let pdResult: ref<number[]> = new ref();// double[6];
            //end declarations

            bolVertical = lineutility.CalcTrueLinesDouble(nWidth, EndLinePoint, NextLinePoint, pdResult);
            m = pdResult.value[0];
            b = pdResult.value[1];
            Upperb = pdResult.value[3];
            Lowerb = pdResult.value[5];

            if (bolVertical === 0)	//lines are vertical
            {
                switch (lLast) {
                    case 4:
                    case 6: {
                        cAnswers.m_Line1.x = EndLinePoint.x - dWidth;
                        cAnswers.m_Line1.y = EndLinePoint.y;
                        cAnswers.m_Line2.x = EndLinePoint.x + dWidth;
                        cAnswers.m_Line2.y = EndLinePoint.y;
                        break;
                    }

                    case 5:
                    case 7: {
                        cAnswers.m_Line1.x = EndLinePoint.x + dWidth;
                        cAnswers.m_Line1.y = EndLinePoint.y;
                        cAnswers.m_Line2.x = EndLinePoint.x - dWidth;
                        cAnswers.m_Line2.y = EndLinePoint.y;
                        break;
                    }

                    default: {	//cases 0-3 should not occur if line is vertical
                        break;
                    }

                }
            }

            if (m === 0) {
                switch (lLast) {
                    case 0:	//line1 is above segment2
                    case 2: {
                        cAnswers.m_Line1.x = EndLinePoint.x;
                        cAnswers.m_Line1.y = EndLinePoint.y - dWidth;
                        cAnswers.m_Line2.x = EndLinePoint.x;
                        cAnswers.m_Line2.y = EndLinePoint.y + dWidth;
                        break;
                    }

                    case 1:	//line1 is above segment2
                    case 3: {
                        cAnswers.m_Line1.x = EndLinePoint.x;
                        cAnswers.m_Line1.y = EndLinePoint.y + dWidth;
                        cAnswers.m_Line2.x = EndLinePoint.x;
                        cAnswers.m_Line2.y = EndLinePoint.y - dWidth;
                        break;
                    }

                    default: {	//cases 4-7 should not be passed since line not vertical
                        break;
                    }

                }
            }

            //remaining cases, line is neither vertical nor horizontal
            if (bolVertical !== 0 && m !== 0)	//lines are neither vertical nor horizontal
            {
                bPerpendicular = EndLinePoint.y + EndLinePoint.x / m;
                LinePoint1 = lineutility.CalcTrueIntersectDouble2(m, Upperb, -1 / m, bPerpendicular, 1, 1, 0, 0);
                LinePoint2 = lineutility.CalcTrueIntersectDouble2(m, Lowerb, -1 / m, bPerpendicular, 1, 1, 0, 0);

                switch (lLast) {
                    case 0:	//line1 is above segment2
                    case 2: {
                        if (LinePoint1.y < LinePoint2.y) {
                            cAnswers.m_Line1 = LinePoint1;
                            cAnswers.m_Line2 = LinePoint2;
                        }
                        else {
                            cAnswers.m_Line1 = LinePoint2;
                            cAnswers.m_Line2 = LinePoint1;
                        }
                        break;
                    }

                    case 1:	//line1 is below segment2
                    case 3: {
                        if (LinePoint1.y > LinePoint2.y) {
                            cAnswers.m_Line1 = LinePoint1;
                            cAnswers.m_Line2 = LinePoint2;
                        }
                        else {
                            cAnswers.m_Line1 = LinePoint2;
                            cAnswers.m_Line2 = LinePoint1;
                        }
                        break;
                    }

                    default: {	//cases1-4 should not occur since line is not vertical
                        break;
                    }

                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetTrueEndPointDouble",
                    new RendererException("Failed inside GetTrueEndPointDouble", exc));
            } else {
                throw exc;
            }
        }
        return cAnswers;
    }
    private static ConnectTrueDouble2(nWidth: int,
        LinePoint1: POINT2,
        LinePoint2: POINT2,
        LinePoint3: POINT2,
        lOrient: int): CChannelPoints2 {
        let pAnswerLinePoints: CChannelPoints2 = new CChannelPoints2();
        try {
            //declarations
            let m1: double = 0;
            let
                b1: double = 0;
            let
                m2: double = 0;
            let
                b2: double = 0;
            let
                Lowerb1: double = 0;
            let
                Upperb1: double = 0;
            let
                Lowerb2: double = 0;
            let
                Upperb2: double = 0;
            let
                dWidth: double = nWidth as double;

            let pdResult: ref<number[]> = new ref();//double[6];
            //pdResult.value=new double[6];
            //POINT2 AnswerLinePoint=new POINT2();
            let bolVerticalSlope1: int = 0;
            let bolVerticalSlope2: int = 0;
            let x: ref<number[]> = new ref();
            let y: ref<number[]> = new ref();
            //end declarations

            //Call CalcLines function for first two points (LinePoint1, LinePoint2)
            //and put parameters into the proper variables
            bolVerticalSlope1 = lineutility.CalcTrueLinesDouble(nWidth, LinePoint1, LinePoint2, pdResult);
            if (bolVerticalSlope1 !== 0)	//line is not vertical
            {
                m1 = pdResult.value[0];
                b1 = pdResult.value[1];
                Upperb1 = pdResult.value[5];
                Lowerb1 = pdResult.value[3];
            }

            //Call CalcLines function for next two points (LinePoint2, LinePoint3)
            bolVerticalSlope2 = lineutility.CalcTrueLinesDouble(nWidth, LinePoint2, LinePoint3, pdResult);
            if (bolVerticalSlope2 !== 0)	//line is not vertical
            {
                m2 = pdResult.value[0];
                b2 = pdResult.value[1];
                Upperb2 = pdResult.value[5];
                Lowerb2 = pdResult.value[3];
            }

            //must alter dWidth from the standard if bolVerticalSlope is 0.
            switch (lOrient) {
                case 0: {
                    //line1 is above segment1 and above segment2
                    //use 0 for the orientation for Line 1
                    lineutility.CalcTrueIntersectDouble(m1, Upperb1, m2, Upperb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 0, x, y);
                    pAnswerLinePoints.m_Line1.x = x.value[0];
                    pAnswerLinePoints.m_Line1.y = y.value[0];
                    //line 2 point:	line2 is below segment1 and below segment2
                    //use 3 for the orientation for Line 2
                    lineutility.CalcTrueIntersectDouble(m1, Lowerb1, m2, Lowerb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 3, x, y);
                    pAnswerLinePoints.m_Line2.x = x.value[0];
                    pAnswerLinePoints.m_Line2.y = y.value[0];
                    break;
                }

                case 1: {
                    //line1 is above segment1 and below segment2
                    //use 1 for the orientation for Line 1
                    lineutility.CalcTrueIntersectDouble(m1, Upperb1, m2, Lowerb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 1, x, y);
                    pAnswerLinePoints.m_Line1.x = x.value[0];
                    pAnswerLinePoints.m_Line1.y = y.value[0];
                    //line2 is below segment1 and above segment2
                    //use 2 for the orientation for Line 2
                    lineutility.CalcTrueIntersectDouble(m1, Lowerb1, m2, Upperb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 2, x, y);
                    pAnswerLinePoints.m_Line2.x = x.value[0];
                    pAnswerLinePoints.m_Line2.y = y.value[0];
                    break;
                }

                case 2: {
                    //line1 is below segment1 and above segment2
                    //use 2 for the orientation for Line 1
                    lineutility.CalcTrueIntersectDouble(m1, Lowerb1, m2, Upperb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 2, x, y);
                    pAnswerLinePoints.m_Line1.x = x.value[0];
                    pAnswerLinePoints.m_Line1.y = y.value[0];
                    //line2 is above segment1 and below segment2
                    //use 1 for the orientation for Line 1
                    lineutility.CalcTrueIntersectDouble(m1, Upperb1, m2, Lowerb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 1, x, y);
                    pAnswerLinePoints.m_Line2.x = x.value[0];
                    pAnswerLinePoints.m_Line2.y = y.value[0];
                    break;
                }

                case 3: {
                    //line1 is below segment1 and below segment2
                    //use 3 for the orientation for Line 1
                    lineutility.CalcTrueIntersectDouble(m1, Lowerb1, m2, Lowerb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 3, x, y);
                    pAnswerLinePoints.m_Line1.x = x.value[0];
                    pAnswerLinePoints.m_Line1.y = y.value[0];
                    //line2 is above segment1 and above segment2
                    //use 0 for the orientation for Line 2
                    lineutility.CalcTrueIntersectDouble(m1, Upperb1, m2, Upperb2, LinePoint2, bolVerticalSlope1, bolVerticalSlope2, dWidth, 0, x, y);
                    pAnswerLinePoints.m_Line2.x = x.value[0];
                    pAnswerLinePoints.m_Line2.y = y.value[0];
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "ConnectTrueDouble2",
                    new RendererException("Failed inside ConnectTrueDouble2", exc));
            } else {
                throw exc;
            }
        }
        return pAnswerLinePoints;
    }
    /*
     * Shift CounterAttack By Fire to not extend past the first point
     * @param vbiDrawThis
     * @param lpsaUpperVBPoints
     * @param vblLowerCounter
     * @param lpsaLowerVBPoints
     * @param vblUpperCounter 
     */
    //    private static void shiftCATKBYFIREPoints(int vbiDrawThis,
    //            double[] lpsaUpperVBPoints,
    //            int vblLowerCounter,
    //            double[] lpsaLowerVBPoints,
    //            int vblUpperCounter)
    //    {
    //        try
    //        {
    //            if(vbiDrawThis != TacticalLines.CATKBYFIRE)
    //                return;
    //
    //            POINT2 nextToLastPoint=new POINT2(lpsaUpperVBPoints[vblUpperCounter-4],lpsaUpperVBPoints[vblUpperCounter-3]);
    //            POINT2 lastPoint=new POINT2(lpsaUpperVBPoints[vblUpperCounter-2],lpsaUpperVBPoints[vblUpperCounter-1]);
    //            double dist=lineutility.CalcDistanceDouble(lastPoint, nextToLastPoint);
    //            
    //            if(dist<45)
    //            {
    //                nextToLastPoint=lineutility.ExtendAlongLineDouble(lastPoint,nextToLastPoint,45+2*dist);
    //                lastPoint=lineutility.ExtendLineDouble(nextToLastPoint,lastPoint, -45);
    //                lpsaUpperVBPoints[vblUpperCounter-4]=nextToLastPoint.x;
    //                lpsaUpperVBPoints[vblUpperCounter-3]=nextToLastPoint.y;
    //                lpsaLowerVBPoints[vblLowerCounter-4]=nextToLastPoint.x;
    //                lpsaLowerVBPoints[vblLowerCounter-3]=nextToLastPoint.y;                                    
    //            }
    //            //lastPoint=lineutility.ExtendAlongLineDouble(lastPoint, nextToLastPoint, 45);
    //            else
    //                lastPoint=lineutility.ExtendLineDouble(nextToLastPoint,lastPoint, -45);
    //            
    //            lpsaUpperVBPoints[vblUpperCounter-2]=lastPoint.x;
    //            lpsaUpperVBPoints[vblUpperCounter-1]=lastPoint.y;
    //            lpsaLowerVBPoints[vblLowerCounter-2]=lastPoint.x;
    //            lpsaLowerVBPoints[vblLowerCounter-1]=lastPoint.y;                                    
    //        }
    //        catch(Exception exc)
    //        {
    //            ErrorLogger.LogException(_className ,"ShiftCATKBYFIREPoints",
    //                    new RendererException("Failed inside ShiftCATKBYFIREPoints", exc));
    //        }
    //    }
    /*
     * tester function to shift counterattack by fire point back to account for
     * aligning the rotary arrow tip with the anchor point. the feature used to extend past 
     * the anchor so the control point was shove forward. Intended to be called by the tester.
     * note: this function is not used by the CPOF client, it is for tester use only
     * @param linetype line type
     * @param pLinePoints
     * @param shift amount to shift back the existing control point
     */
    //    public static void shiftCATKBYFIREControlPoint(
    //            int linetype,
    //            ArrayList<POINT2>pLinePoints,
    //            double shift)
    //    {
    //        try
    //        {
    //            if(linetype != TacticalLines.CATKBYFIRE)
    //                return;
    //            int controlPtIndex=pLinePoints.length-1;
    //            POINT2 pt0=pLinePoints[0];
    //            POINT2 pt1=pLinePoints[1];
    //            double dist=lineutility.CalcDistanceDouble(pLinePoints[0], pLinePoints[1]);
    //            if(dist<=45)
    //                return;
    //            POINT2 controlPt=pLinePoints[controlPtIndex];
    //            //pt3 is the point on parallel line which contains the control point and corresponds to,
    //            //i.e. is perpendicular to, pt0.
    //            POINT2 pt3=lineutility.PointRelativeToLine(pt0, pt1, pt0, controlPt);
    //            //pt4 will be the shifted control point
    //            POINT2 pt4=lineutility.ExtendLineDouble(pt3, controlPt, shift);
    //            //set the control point as the new shifted control point
    //            pLinePoints.set(controlPtIndex, pt4);
    //        }
    //        catch(Exception exc)
    //        {
    //            ErrorLogger.LogException(_className ,"shiftCATKBYFIREControlPoint",
    //                    new RendererException("Failed inside shiftCATKBYFIREControlPoint", exc));
    //        }
    //    }
    /**
     * Calculates the channel points
     * @param lpsaUpperVBPoints the client points as 2-tuples
     * @param lpsaLowerVBPoints the client points as 2 tuples
     * @param resultVBPoints the result points as 3-tuples x,y,linestyle
     * @param vblUpperCounter the number of client 2-tuples
     * @param vblLowerCounter the number of client 2-tuples
     * @param vblChannelWidth the channel width in pixels
     * @param useptr the distance in pixels from the arrow tip to the back of the arrowhead
     * @param shapes the ShapeInfo array, each object contains the GeneralPath
     * @return
     */
    public static GetChannel1Double(tg: TGLight,
        lpsaUpperVBPoints: number[],
        lpsaLowerVBPoints: number[],
        resultVBPoints: number[],
        vblUpperCounter: int,
        vblLowerCounter: int,
        vblChannelWidth: int,
        useptr: int,
        shapes: Array<Shape2>): int {
        let lResult: int = -1;
        try {
            let vbiDrawThis: int = tg.get_LineType();
            let k: int = 0;
            let vblCounter: int = 0;
            let nPrinter: int = 1;
            let
                nArrowSize: int = 40 * nPrinter;
            let
                max: int = 0;
            let dist: double = 0;
            let remainder: double = 0;
            let vblUpperCounter2: int = vblUpperCounter;
            let vblLowerCounter2: int = vblLowerCounter;
            let nReverseUpper: int = 0;
            let lUpperFlotCount: int = 0;
            let lLowerFlotCount: int = 0;
            let nLowerCounter: int = 0;
            let lUpperCounter: int = 0;
            let lResultCounter: int = 0;
            let XCounter: int = 0;
            let j: int = 0;
            let lHowManyThisSegment: int = 0;
            let l: int = 0;
            let t: int = 0;
            let pi: double = Math.PI;
            let dAngle: double = 0;
            let d: double = 0;
            let a: double = 13;//13;
            let b: double = 6;  //6;
            let dFactor: double = 0;
            let lEllipseCounter: int = 0;
            //double arrowOffsetFactor = 10;
            let arrowOffsetFactor: double = vblChannelWidth / 4;  //diagnostic was 10
            let pLowerLinePoints: POINT2[] = new Array<POINT2>(vblLowerCounter);
            let
                pUpperLinePoints: POINT2[] = new Array<POINT2>(vblUpperCounter);
            let
                pArrowLinePoints: POINT2[] = new Array<POINT2>(1);
            let
                pLinePoints: POINT2[];
            let
                pUpperFlotPoints: POINT2[];
            let pLowerFlotPoints: POINT2[];
            let pOriginalLinePoints: POINT2[];
            let pOriginalLinePoints2: POINT2[];
            lineutility.InitializePOINT2Array(pLowerLinePoints);
            lineutility.InitializePOINT2Array(pUpperLinePoints);
            lineutility.InitializePOINT2Array(pArrowLinePoints);

            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            let pt4: POINT2 = new POINT2();
            let midPt1: POINT2 = new POINT2();
            let midPt2: POINT2 = new POINT2();
            let pt0: POINT2 = new POINT2();
            let arrowPts: POINT2[] = new Array<POINT2>(3);
            //POINT2 startLinePoint = new POINT2();
            let XPoints: POINT2[] = new Array<POINT2>(4);
            let pEllipsePoints2: POINT2[] = new Array<POINT2>(37);
            lineutility.InitializePOINT2Array(XPoints);
            lineutility.InitializePOINT2Array(pEllipsePoints2);

            //POINT2 endLinePoint = new POINT2();
            let temp1LinePoint: POINT2 = new POINT2();
            let ptCenter: POINT2 = new POINT2(pLowerLinePoints[0]);
            let
                temp2LinePoint: POINT2 = new POINT2();
            let lastPoint: POINT2 = new POINT2();
            let nextToLastPoint: POINT2 = new POINT2();	//used by CATKBYFIRE
            //end declarations

            //initializations
            if (vblChannelWidth < 5) {
                vblChannelWidth = 5;
            }

            if (vblLowerCounter < 2 || vblUpperCounter < 2) {
                return -1;
            }

            //shiftCATKBYFIREPoints(vbiDrawThis,lpsaUpperVBPoints,lpsaUpperVBPoints.length,lpsaLowerVBPoints,lpsaLowerVBPoints.length);
            //load client points
            for (k = 0; k < vblLowerCounter; k++) {
                pLowerLinePoints[k].x = lpsaLowerVBPoints[nLowerCounter];
                nLowerCounter++;
                pLowerLinePoints[k].y = lpsaLowerVBPoints[nLowerCounter];
                nLowerCounter++;
                if (k === vblLowerCounter - 2) {
                    nextToLastPoint.x = pLowerLinePoints[k].x;
                    nextToLastPoint.y = pLowerLinePoints[k].y;
                }
                if (k === vblLowerCounter - 1) {
                    lastPoint.x = pLowerLinePoints[k].x;
                    lastPoint.y = pLowerLinePoints[k].y;
                }
                pLowerLinePoints[k].style = 0;
            }
            nLowerCounter = 0;

            let lastSegmentLength: double = lineutility.CalcDistanceDouble(lastPoint, nextToLastPoint);

            for (k = 0; k < vblUpperCounter; k++) {
                pUpperLinePoints[k].x = lpsaUpperVBPoints[lUpperCounter];
                lUpperCounter++;
                pUpperLinePoints[k].y = lpsaUpperVBPoints[lUpperCounter];
                lUpperCounter++;
                pUpperLinePoints[k].style = 0;
            }
            lUpperCounter = 0;
            pArrowLinePoints[0] = new POINT2(pUpperLinePoints[vblUpperCounter - 1]);
            //end load client points

            pt0 = new POINT2(pLowerLinePoints[0]);
            //diagnostic 1-7-13            
            let shiftLines: boolean = Channels._shiftLines;
            switch (vbiDrawThis) {
                case TacticalLines.LC:
                case TacticalLines.LC_HOSTILE:
                case TacticalLines.UNSP:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE: {
                    break;
                }

                default: {
                    shiftLines = false;
                    break;
                }

            }
            //end section

            switch (vbiDrawThis) {
                case TacticalLines.CATK:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT:
                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.CATKBYFIRE: {	//80
                    dist = useptr as double;

                    nArrowSize = Math.trunc(Math.sqrt(dist * dist + vblChannelWidth / 2 * vblChannelWidth / 2));
                    //nArrowSize = (int) Math.sqrt(dist * dist + vblChannelWidth * vblChannelWidth);
                    //lineutility.WriteFile(Integer.toString(nArrowSize));

                    pUpperLinePoints[vblUpperCounter - 1] = lineutility.ExtendAlongLineDouble(pUpperLinePoints[vblUpperCounter - 1], pUpperLinePoints[vblUpperCounter - 2], dist);
                    pLowerLinePoints[vblLowerCounter - 1] = lineutility.ExtendAlongLineDouble(pLowerLinePoints[vblLowerCounter - 1], pLowerLinePoints[vblLowerCounter - 2], dist);
                    break;
                }

                default: {
                    break;
                }

            }
            //end section

            temp1LinePoint = new POINT2(pLowerLinePoints[0]);
            temp2LinePoint = new POINT2(pUpperLinePoints[0]);

            //get the channel array
            switch (vbiDrawThis) {
                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.TRIPLE:
                case TacticalLines.DOUBLEC:
                case TacticalLines.SINGLEC:
                case TacticalLines.HWFENCE:
                case TacticalLines.LWFENCE:
                case TacticalLines.UNSP:
                case TacticalLines.DOUBLEA:
                case TacticalLines.DFENCE:
                case TacticalLines.SFENCE:
                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    vblCounter = Channels.GetTripleCountDouble(pUpperLinePoints, vblUpperCounter, vbiDrawThis);
                    //save the original line points for later
                    pOriginalLinePoints = new Array<POINT2>(vblUpperCounter);
                    for (k = 0; k < vblUpperCounter; k++) {
                        pOriginalLinePoints[k] = new POINT2(pUpperLinePoints[k]);
                    }
                    pOriginalLinePoints2 = new Array<POINT2>(vblUpperCounter);
                    for (k = 0; k < vblUpperCounter; k++) {
                        pOriginalLinePoints2[k] = new POINT2(pUpperLinePoints[k]);
                    }
                    //bound the points
                    switch (vbiDrawThis) {
                        case TacticalLines.TRIPLE:
                        case TacticalLines.DOUBLEC:
                        case TacticalLines.SINGLEC:
                        case TacticalLines.HWFENCE:
                        case TacticalLines.LWFENCE:
                        case TacticalLines.UNSP:
                        case TacticalLines.DOUBLEA:
                        case TacticalLines.DFENCE:
                        case TacticalLines.SFENCE: {
                            pLowerLinePoints = new Array<POINT2>(vblLowerCounter);
                            for (k = 0; k < vblLowerCounter2; k++) {
                                pLowerLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                            }

                            pUpperLinePoints = new Array<POINT2>(vblUpperCounter);
                            for (k = 0; k < vblUpperCounter2; k++) {
                                pUpperLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                            }
                            pOriginalLinePoints = new Array<POINT2>(vblUpperCounter);
                            for (k = 0; k < vblUpperCounter2; k++) {
                                pOriginalLinePoints[k] = new POINT2(pOriginalLinePoints2[k]);
                            }
                            break;
                        }

                        default: {
                            //do not bound the points
                            break;
                        }

                    }
                    lineutility.moveSingleCPixels(vbiDrawThis, pUpperLinePoints);
                    lineutility.moveSingleCPixels(vbiDrawThis, pLowerLinePoints);
                    lineutility.MoveChannelPixels(pUpperLinePoints);
                    lineutility.MoveChannelPixels(pLowerLinePoints);

                    //diagnostic 1-7-13
                    //if(_shiftLines && vbiDrawThis != TacticalLines.DOUBLEC)
                    if (shiftLines) {

                        vblChannelWidth *= 2;
                    }

                    //end section

                    pUpperLinePoints = Channels.GetChannelArray2Double(nPrinter, pUpperLinePoints, 1, vblUpperCounter, vbiDrawThis, vblChannelWidth);
                    pLowerLinePoints = Channels.GetChannelArray2Double(nPrinter, pLowerLinePoints, 0, vblLowerCounter, vbiDrawThis, vblChannelWidth);

                    //diagnostic 1-7-13
                    if (shiftLines) {
                        //if(vbiDrawThis != TacticalLines.SINGLEC && vbiDrawThis != TacticalLines.DOUBLEC)
                        //  pUpperLinePoints=pOriginalLinePoints;
                        if (vbiDrawThis === TacticalLines.SINGLEC) {

                            pLowerLinePoints = pOriginalLinePoints;
                        }

                        else {
                            if (vbiDrawThis === TacticalLines.DOUBLEC) {
                                for (j = 0; j < pUpperLinePoints.length; j++) {
                                    pUpperLinePoints[j] = lineutility.MidPointDouble(pLowerLinePoints[j], pOriginalLinePoints[j], 0);
                                }
                                //pOriginalLinePoints=pLowerLinePoints.clone();
                            }
                            else {
                                if (vbiDrawThis === TacticalLines.TRIPLE) {

                                    pUpperLinePoints = pOriginalLinePoints;
                                }

                                else {

                                    pUpperLinePoints = pOriginalLinePoints;
                                }

                            }

                        }

                    }
                    break;
                }

                case TacticalLines.LC:
                case TacticalLines.LC_HOSTILE: {
                    if (shiftLines) {
                        pOriginalLinePoints = new Array<POINT2>(vblUpperCounter);
                        for (k = 0; k < vblUpperCounter; k++) {
                            pOriginalLinePoints[k] = new POINT2(pUpperLinePoints[k]);
                        }
                        vblChannelWidth *= 2;
                    }

                    pUpperLinePoints = Channels.GetChannelArray2Double(nPrinter, pUpperLinePoints, 1, vblUpperCounter, vbiDrawThis, vblChannelWidth);
                    pLowerLinePoints = Channels.GetChannelArray2Double(nPrinter, pLowerLinePoints, 0, vblLowerCounter, vbiDrawThis, vblChannelWidth);

                    if (shiftLines) {
                        //if(_affiliation != null && _affiliation.equalsIgnoreCase("H"))
                        if (vbiDrawThis === TacticalLines.LC_HOSTILE) {

                            pLowerLinePoints = pOriginalLinePoints;
                        }

                        else {

                            pUpperLinePoints = pOriginalLinePoints;
                        }

                    }

                    if ((pUpperLinePoints[0].x > pUpperLinePoints[1].x) && (pUpperLinePoints[0].y !== pUpperLinePoints[1].y)) {
                        nReverseUpper = 1;
                        lineutility.ReversePointsDouble2(pLowerLinePoints, vblLowerCounter);
                    } else {
                        if ((pUpperLinePoints[0].x > pUpperLinePoints[1].x) && (pUpperLinePoints[0].y === pUpperLinePoints[1].y)) {
                            nReverseUpper = 0;
                            lineutility.ReversePointsDouble2(pUpperLinePoints, vblUpperCounter);
                        } else {
                            if (pUpperLinePoints[0].x < pUpperLinePoints[1].x) {
                                nReverseUpper = 1;
                                lineutility.ReversePointsDouble2(pLowerLinePoints, vblLowerCounter);
                            } else {
                                if ((pUpperLinePoints[0].y > pUpperLinePoints[1].y) && (pUpperLinePoints[0].x === pUpperLinePoints[1].x)) {
                                    nReverseUpper = 1;
                                    lineutility.ReversePointsDouble2(pLowerLinePoints, vblLowerCounter);
                                } else {
                                    if ((pUpperLinePoints[0].y < pUpperLinePoints[1].y) && (pUpperLinePoints[0].x === pUpperLinePoints[1].x)) {
                                        nReverseUpper = 0;
                                        lineutility.ReversePointsDouble2(pUpperLinePoints, vblUpperCounter);
                                    }
                                }

                            }

                        }

                    }

                    break;
                }

                case TacticalLines.AAAAA:
                case TacticalLines.AIRAOA: {
                    pOriginalLinePoints = new Array<POINT2>(vblUpperCounter);
                    for (k = 0; k < vblUpperCounter; k++) {
                        pOriginalLinePoints[k] = new POINT2(pUpperLinePoints[k]);
                    }
                    pUpperLinePoints = Channels.GetChannelArray2Double(nPrinter, pUpperLinePoints, 1, vblUpperCounter, vbiDrawThis, vblChannelWidth);
                    pLowerLinePoints = Channels.GetChannelArray2Double(nPrinter, pLowerLinePoints, 0, vblLowerCounter, vbiDrawThis, vblChannelWidth);


                    //end section
                    //only allow the lines to cross if there is enough room
                    //if (lastSegmentLength > vblChannelWidth / 2)
                    //{
                    temp1LinePoint = new POINT2(pLowerLinePoints[vblLowerCounter - 1]);
                    temp2LinePoint = new POINT2(pUpperLinePoints[vblUpperCounter - 1]);
                    pLowerLinePoints[vblLowerCounter - 1] = new POINT2(temp2LinePoint);
                    pUpperLinePoints[vblUpperCounter - 1] = new POINT2(temp1LinePoint);
                    //}
                    break;
                }

                default: {
                    break;
                }

            }	//end get channel array
            //load channel array into pLinePoints
            switch (vbiDrawThis) {
                case TacticalLines.LC:
                case TacticalLines.LC_HOSTILE: {
                    lUpperFlotCount = flot.GetFlotCountDouble(pUpperLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblUpperCounter);
                    lLowerFlotCount = flot.GetFlotCountDouble(pLowerLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblLowerCounter);
                    if (lUpperFlotCount <= 0 || lLowerFlotCount <= 0) {
                        return 0;
                    }
                    //vblCounter = lUpperFlotCount + lLowerFlotCount;

                    max = vblUpperCounter;
                    if (max < lUpperFlotCount) {
                        max = lUpperFlotCount;
                    }
                    pUpperFlotPoints = new Array<POINT2>(max);
                    lineutility.InitializePOINT2Array(pUpperFlotPoints);
                    max = vblLowerCounter;
                    if (max < lLowerFlotCount) {
                        max = lLowerFlotCount;
                    }
                    pLowerFlotPoints = new Array<POINT2>(max);
                    lineutility.InitializePOINT2Array(pLowerFlotPoints);
                    for (k = 0; k < vblUpperCounter; k++) {
                        pUpperFlotPoints[k] = new POINT2(pUpperLinePoints[k]);
                    }
                    for (k = 0; k < vblLowerCounter; k++) {
                        pLowerFlotPoints[k] = new POINT2(pLowerLinePoints[k]);
                    }

                    lUpperFlotCount = flot.GetFlotDouble(pUpperFlotPoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblUpperCounter);	//6/24/04
                    lLowerFlotCount = flot.GetFlotDouble(pLowerFlotPoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblLowerCounter);	//6/24/04
                    pLinePoints = new Array<POINT2>(lUpperFlotCount + lLowerFlotCount);
                    lineutility.InitializePOINT2Array(pLinePoints);

                    vblCounter = lLowerFlotCount + lUpperFlotCount;

                    if (nReverseUpper === 1) {
                        for (k = 0; k < lUpperFlotCount; k++) {
                            pLinePoints[k] = new POINT2(pUpperFlotPoints[k]);
                            pLinePoints[k].style = 25;  //was 26
                        }
                        //added one line M. Deutch 4-22-02
                        if (lUpperFlotCount > 0) {
                            pLinePoints[lUpperFlotCount - 1].style = 5;
                        }
                        for (k = 0; k < lLowerFlotCount; k++) {
                            pLinePoints[k + lUpperFlotCount] = new POINT2(pLowerFlotPoints[k]);
                            pLinePoints[k + lUpperFlotCount].style = 26;    //was 0
                        }
                        if (lUpperFlotCount + lLowerFlotCount > 0) {
                            pLinePoints[lUpperFlotCount + lLowerFlotCount - 1].style = 5;
                        }
                    }
                    if (nReverseUpper === 0) {
                        for (k = 0; k < lUpperFlotCount; k++) {
                            pLinePoints[k] = new POINT2(pUpperFlotPoints[k]);
                            pLinePoints[k].style = 26;  //was 0
                        }
                        if (lUpperFlotCount > 0) {

                            pLinePoints[lUpperFlotCount - 1].style = 5;
                        }


                        for (k = 0; k < lLowerFlotCount; k++) {
                            pLinePoints[k + lUpperFlotCount] = new POINT2(pLowerFlotPoints[k]);
                            pLinePoints[k + lUpperFlotCount].style = 25;    //was 26
                        }
                        if (lUpperFlotCount + lLowerFlotCount > 0) {

                            pLinePoints[lUpperFlotCount + lLowerFlotCount - 1].style = 5;
                        }

                    }
                    break;
                }

                case TacticalLines.TRIPLE:
                case TacticalLines.DOUBLEC:
                case TacticalLines.SINGLEC:
                case TacticalLines.HWFENCE:
                case TacticalLines.LWFENCE:
                case TacticalLines.UNSP:
                case TacticalLines.DOUBLEA:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    //load the channel points
                    pLinePoints = new Array<POINT2>(vblCounter);
                    lineutility.InitializePOINT2Array(pLinePoints);
                    //initialize points
                    for (j = 0; j < pLinePoints.length; j++) {
                        pLinePoints[j].x = lpsaUpperVBPoints[0];
                        pLinePoints[j].y = lpsaUpperVBPoints[1];
                    }
                    switch (vbiDrawThis) {
                        case TacticalLines.TRIPLE:
                        case TacticalLines.HWFENCE:
                        case TacticalLines.CHANNEL:
                        case TacticalLines.CHANNEL_FLARED:
                        case TacticalLines.CHANNEL_DASHED:
                        case TacticalLines.SINGLEC: {   //added 7-10-07
                            for (k = 0; k < vblLowerCounter; k++) {
                                pLinePoints[k] = new POINT2(pLowerLinePoints[k]);   //don't shift here
                            }
                            break;
                        }

                        case TacticalLines.DOUBLEC: {
                            if (pOriginalLinePoints[0].x < pOriginalLinePoints[1].x) {
                                for (k = 0; k < vblLowerCounter; k++) {
                                    pLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                                }
                            }
                            else {
                                for (k = 0; k < vblLowerCounter; k++) {
                                    pLinePoints[k] = new POINT2(pUpperLinePoints[k]);
                                }
                            }
                            break;
                        }


                        case TacticalLines.LWFENCE: {
                            for (k = 0; k < vblLowerCounter; k++) {
                                pLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                                pLinePoints[k].style = 5;
                            }
                            break;
                        }

                        case TacticalLines.UNSP: {
                            for (k = 0; k < vblLowerCounter; k++) {
                                pLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                                pLinePoints[k].style = 5;
                            }
                            break;
                        }

                        case TacticalLines.DOUBLEA: {
                            for (k = 0; k < vblLowerCounter; k++) {
                                pLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                            }
                            break;
                        }

                        default: {
                            for (k = 0; k < vblLowerCounter; k++) {
                                pLinePoints[k] = new POINT2(pOriginalLinePoints[k]);
                            }
                            break;
                        }

                    }
                    pLinePoints[vblLowerCounter - 1].style = 5;

                    switch (vbiDrawThis) {
                        case TacticalLines.TRIPLE:
                        case TacticalLines.HWFENCE:
                        case TacticalLines.CHANNEL:
                        case TacticalLines.CHANNEL_FLARED:
                        case TacticalLines.CHANNEL_DASHED: {
                            for (k = 0; k < vblUpperCounter; k++) {
                                pLinePoints[vblLowerCounter + k] = new POINT2(pUpperLinePoints[k]);
                            }
                            break;
                        }

                        case TacticalLines.DOUBLEC: {
                            if (pOriginalLinePoints[0].x < pOriginalLinePoints[1].x) {
                                for (k = 0; k < vblUpperCounter; k++) {
                                    pLinePoints[vblLowerCounter + k] = new POINT2(pUpperLinePoints[k]);
                                }
                            }
                            else {
                                for (k = 0; k < vblUpperCounter; k++) {
                                    pLinePoints[vblLowerCounter + k] = new POINT2(pOriginalLinePoints[k]);
                                }
                            }
                            break;
                        }

                        case TacticalLines.SINGLEC: {
                            for (k = 0; k < vblUpperCounter; k++) {
                                //pLinePoints[vblLowerCounter + k] = pOriginalLinePoints[k];    //revised 7-10-07
                                pLinePoints[vblLowerCounter + k] = new POINT2(pLowerLinePoints[k]);
                            }
                            break;
                        }

                        case TacticalLines.LWFENCE: {
                            //remove block to make channel line aoways below the X
                            for (k = 0; k < vblUpperCounter; k++) {
                                pLinePoints[vblLowerCounter + k] = new POINT2(pUpperLinePoints[k]);
                            }
                            break;
                        }

                        case TacticalLines.UNSP: {
                            for (k = 0; k < vblUpperCounter; k++) {
                                pLinePoints[vblLowerCounter + k] = new POINT2(pOriginalLinePoints[k]);
                                pLinePoints[vblLowerCounter + k].style = 5;
                            }
                            break;
                        }

                        case TacticalLines.DOUBLEA: {
                            for (k = 0; k < vblUpperCounter; k++) {
                                pLinePoints[vblLowerCounter + k] = new POINT2(pOriginalLinePoints[k]);
                            }
                            break;
                        }

                        default: {
                            for (k = 0; k < vblUpperCounter; k++) {
                                pLinePoints[vblLowerCounter + k] = new POINT2(pOriginalLinePoints[k]);
                            }
                            break;
                        }

                    }

                    pLinePoints[vblLowerCounter + vblUpperCounter - 1].style = 5;

                    lEllipseCounter = vblLowerCounter + vblUpperCounter;
                    //following section only for lines with repeating features, e.g. DOUBLEA
                    //if(segments!=null &&
                    if (vbiDrawThis !== TacticalLines.CHANNEL &&
                        vbiDrawThis !== TacticalLines.CHANNEL_DASHED &&
                        vbiDrawThis !== TacticalLines.CHANNEL_FLARED &&
                        vbiDrawThis !== TacticalLines.SPT_STRAIGHT &&
                        vbiDrawThis !== TacticalLines.MAIN_STRAIGHT) {
                        let xSize: int = 0;
                        if (shiftLines) {

                            xSize = vblChannelWidth / 8;
                        }

                        else {

                            xSize = vblChannelWidth / 4;
                        }

                        for (j = 0; j < vblUpperCounter - 1; j++) {
                            let dIncrement: double = xSize + arraysupport.getScaledSize(2, tg.get_LineThickness() / 2);
                            d = lineutility.CalcDistanceDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                            lHowManyThisSegment = Math.trunc(d / dIncrement);
                            remainder = d - dIncrement * lHowManyThisSegment;
                            dAngle = lineutility.CalcSegmentAngleDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                            dAngle = dAngle + pi / 2;
                            for (k = 0; k < lHowManyThisSegment; k++) {

                                if (vbiDrawThis === TacticalLines.SFENCE) {
                                    if (k % 4 === 0) {

                                        continue;
                                    }

                                }
                                else {
                                    if (k % 2 === 0) {

                                        continue;
                                    }

                                }

                                let f: double = k;
                                f *= (1 + remainder / d);

                                //diagnostic 1-7-13                                
                                //note: for shiftLines upper line points were set to original line points ealier
                                //ptCenter.x = pOriginalLinePoints[j].x + (int) ((double) (f) * ((double) pOriginalLinePoints[j + 1].x - (double) pOriginalLinePoints[j].x) / (double) lHowManyThisSegment);
                                //ptCenter.y = pOriginalLinePoints[j].y + (int) ((double) (f) * ((double) pOriginalLinePoints[j + 1].y - (double) pOriginalLinePoints[j].y) / (double) lHowManyThisSegment);                                
                                if (shiftLines === true && vbiDrawThis === TacticalLines.DOUBLEC) {
                                    ptCenter.x = pUpperLinePoints[j].x + Math.trunc((f) as double * (pUpperLinePoints[j + 1].x as double - pUpperLinePoints[j].x as double) / lHowManyThisSegment as double);
                                    ptCenter.y = pUpperLinePoints[j].y + Math.trunc((f) as double * (pUpperLinePoints[j + 1].y as double - pUpperLinePoints[j].y as double) / lHowManyThisSegment as double);
                                }
                                else {
                                    if (shiftLines === false) {
                                        ptCenter.x = pOriginalLinePoints[j].x + Math.trunc((f) as double * (pOriginalLinePoints[j + 1].x as double - pOriginalLinePoints[j].x as double) / lHowManyThisSegment as double);
                                        ptCenter.y = pOriginalLinePoints[j].y + Math.trunc((f) as double * (pOriginalLinePoints[j + 1].y as double - pOriginalLinePoints[j].y as double) / lHowManyThisSegment as double);
                                    }
                                    else {
                                        ptCenter.x = pUpperLinePoints[j].x + Math.trunc((f) as double * (pUpperLinePoints[j + 1].x as double - pUpperLinePoints[j].x as double) / lHowManyThisSegment as double);
                                        ptCenter.y = pUpperLinePoints[j].y + Math.trunc((f) as double * (pUpperLinePoints[j + 1].y as double - pUpperLinePoints[j].y as double) / lHowManyThisSegment as double);
                                        let ptCenter2: POINT2 = new POINT2();
                                        ptCenter2.x = pLowerLinePoints[j].x + Math.trunc((f) as double * (pLowerLinePoints[j + 1].x as double - pLowerLinePoints[j].x as double) / lHowManyThisSegment as double);
                                        ptCenter2.y = pLowerLinePoints[j].y + Math.trunc((f) as double * (pLowerLinePoints[j + 1].y as double - pLowerLinePoints[j].y as double) / lHowManyThisSegment as double);
                                        ptCenter = lineutility.MidPointDouble(ptCenter, ptCenter2, 0);
                                    }
                                }

                                //end section

                                switch (vbiDrawThis) {
                                    case TacticalLines.SINGLEC:
                                    case TacticalLines.DOUBLEC:
                                    case TacticalLines.TRIPLE: {
                                        for (l = 1; l < 37; l++) {
                                            dFactor = (10 * l as double) * pi / 180;
                                            pEllipsePoints2[l - 1].x = ptCenter.x + xSize * Math.cos(dFactor);
                                            pEllipsePoints2[l - 1].y = ptCenter.y + xSize / 2 * Math.sin(dFactor);
                                            pEllipsePoints2[l - 1].style = 0;
                                        }
                                        lineutility.RotateGeometryDouble(pEllipsePoints2, 36, dAngle * 180 / pi);
                                        pEllipsePoints2[36] = new POINT2(pEllipsePoints2[35]);
                                        pEllipsePoints2[36].style = 5;
                                        for (l = 0; l < 37; l++) {
                                            pLinePoints[lEllipseCounter] = new POINT2(pEllipsePoints2[l]);
                                            lEllipseCounter++;
                                        }
                                        break;
                                    }

                                    case TacticalLines.HWFENCE:
                                    case TacticalLines.LWFENCE:
                                    case TacticalLines.DOUBLEA:
                                    case TacticalLines.UNSP:
                                    case TacticalLines.SFENCE:
                                    case TacticalLines.DFENCE: {
                                        XPoints[0].x = ptCenter.x - xSize;//was 4
                                        XPoints[0].y = ptCenter.y - xSize;
                                        XPoints[0].style = 0;
                                        XPoints[1].x = ptCenter.x + xSize;
                                        XPoints[1].y = ptCenter.y + xSize;
                                        XPoints[1].style = 5;
                                        XPoints[2].x = ptCenter.x - xSize;
                                        XPoints[2].y = ptCenter.y + xSize;
                                        XPoints[2].style = 0;
                                        XPoints[3].x = ptCenter.x + xSize;
                                        XPoints[3].y = ptCenter.y - xSize;
                                        XPoints[3].style = 5;
                                        XCounter++;
                                        lineutility.RotateGeometryDouble(XPoints, 4, Math.trunc(dAngle * 180 / pi));
                                        for (l = 0; l < 4; l++) {
                                            pLinePoints[lEllipseCounter] = new POINT2(XPoints[l]);
                                            switch (vbiDrawThis) {
                                                case TacticalLines.SFENCE: {
                                                    if (XCounter === 2 || XCounter === 3 || XCounter === 4 || XCounter === 5) {
                                                        pLinePoints[lEllipseCounter].style = 5;
                                                    }
                                                    break;
                                                }

                                                case TacticalLines.DFENCE: {
                                                    if (XCounter === 3 || XCounter === 4 || XCounter === 5) {  //was 2,3 OR 4
                                                        pLinePoints[lEllipseCounter].style = 5;
                                                    }
                                                    break;
                                                }

                                                default: {
                                                    break;
                                                }

                                            }
                                            lEllipseCounter++;
                                        }
                                        if (XCounter === 5) {
                                            XCounter = 0;
                                        }
                                        break;
                                    }

                                    default: {
                                        break;
                                    }

                                }
                            }//end how many this segment loop
                            if (lHowManyThisSegment === 0) {
                                if (pLinePoints.length > lEllipseCounter) {
                                    pLinePoints[lEllipseCounter] = new POINT2(pOriginalLinePoints[j]);
                                    lEllipseCounter++;
                                    pLinePoints[lEllipseCounter] = new POINT2(pOriginalLinePoints[j + 1]);
                                    pLinePoints[lEllipseCounter].style = 5;
                                    lEllipseCounter++;
                                }
                            }
                        }
                        pLinePoints = lineutility.ResizeArray(pLinePoints, lEllipseCounter);
                        vblCounter = pLinePoints.length;  //added 11-2-09 M. Deutch
                    }

                    //if none of the segments were long enough to have features
                    //then make the style solid
                    if (Channels.FenceType(vbiDrawThis) === 1) {
                        if (lEllipseCounter <= vblLowerCounter + vblUpperCounter) {
                            for (k = 0; k < vblLowerCounter + vblUpperCounter; k++) {
                                if (pLinePoints[k].style !== 5) {
                                    //added 2-8-13
                                    pLinePoints[k].style = 0;
                                }

                            }
                        }
                        else {
                            for (k = lEllipseCounter - 1; k < pLinePoints.length; k++) {
                                pLinePoints[k].style = 5;
                            }
                        }
                    }
                    break;
                }

                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT: {
                    if (vbiDrawThis !== TacticalLines.CATKBYFIRE) {
                        vblCounter = vblLowerCounter + vblUpperCounter + 8;
                    } else {
                        vblCounter = vblLowerCounter + vblUpperCounter + 17;
                    }
                    //diagnostic
                    if (vbiDrawThis === TacticalLines.AAAAA) {
                        vblCounter = vblLowerCounter + vblUpperCounter + 19;
                    }

                    pLinePoints = new Array<POINT2>(vblCounter);
                    lineutility.InitializePOINT2Array(pLinePoints);
                    //initialize points
                    for (j = 0; j < pLinePoints.length; j++) {
                        pLinePoints[j].x = lpsaUpperVBPoints[0];
                        pLinePoints[j].y = lpsaUpperVBPoints[1];
                    }

                    if (vbiDrawThis !== TacticalLines.CATK &&
                        vbiDrawThis !== TacticalLines.CATKBYFIRE) {
                        for (k = 0; k < vblCounter; k++) {
                            pLinePoints[k].style = 0;
                        }
                    }
                    Channels.GetAXADDouble(nPrinter, pLowerLinePoints,
                        vblLowerCounter, pUpperLinePoints,
                        vblUpperCounter, pArrowLinePoints[0],
                        pLinePoints, vbiDrawThis, arrowOffsetFactor);

                    if (vbiDrawThis === TacticalLines.CATK ||
                        vbiDrawThis === TacticalLines.CATKBYFIRE) {
                        for (k = 0; k < vblCounter; k++) {
                            if (pLinePoints[k].style !== 5) {
                                pLinePoints[k].style = 1;
                            }
                        }
                    }

                    //get the rotary symbol for AAAAA
                    if (vbiDrawThis === TacticalLines.AAAAA) {
                        let rotaryTooShort: boolean = false;
                        let mUpper: ref<number[]> = new ref();
                        let mLower: ref<number[]> = new ref();
                        let bolVerticalUpper: int = 0;
                        let bolVerticalLower: int = 0;
                        let bUpper: double = 0;
                        let bLower: double = 0;

                        pt0 = new POINT2(pLowerLinePoints[vblLowerCounter - 2]);
                        pt1 = new POINT2(pLowerLinePoints[vblLowerCounter - 1]);
                        let dist1: double = lineutility.CalcDistanceDouble(pt0, pt1);

                        bolVerticalLower = lineutility.CalcTrueSlopeDouble(pt0, pt1, mLower);
                        bLower = pt0.y - mLower.value[0] * pt0.x;

                        pt0 = new POINT2(pUpperLinePoints[vblUpperCounter - 2]);
                        pt1 = new POINT2(pUpperLinePoints[vblUpperCounter - 1]);
                        bolVerticalUpper = lineutility.CalcTrueSlopeDouble(pt0, pt1, mUpper);
                        bUpper = pt0.y - mUpper.value[0] * pt0.x;
                        let dist2: double = lineutility.CalcDistanceDouble(pt0, pt1);

                        //if (dist1 > vblChannelWidth && dist2 > vblChannelWidth)
                        //{
                        midPt1 = lineutility.CalcTrueIntersectDouble2(mLower.value[0], bLower, mUpper.value[0], bUpper, bolVerticalLower, bolVerticalUpper, pt0.x, pt0.y);

                        //both sides of the channel need to be long enough
                        //or the rotary sides will not work, but we still
                        //include the arrow by using a simpler midpoint
                        if (dist1 <= vblChannelWidth || dist2 <= vblChannelWidth) {
                            rotaryTooShort = true;
                            midPt1 = lineutility.MidPointDouble(pt0, pt1, 0);
                        }

                        a = lineutility.CalcDistanceDouble(pt0, pt1);
                        b = 30;
                        if (a < 90) {
                            b = a / 3;
                        }

                        pt3 = new POINT2(pOriginalLinePoints[vblUpperCounter - 2]);
                        pt4 = new POINT2(pOriginalLinePoints[vblUpperCounter - 1]);
                        d = vblChannelWidth / 4;
                        let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
                        if (d > Channels.maxLength * DPIScaleFactor) {
                            d = Channels.maxLength * DPIScaleFactor;
                        }
                        if (d < Channels.minLength * DPIScaleFactor) {
                            d = Channels.minLength * DPIScaleFactor;
                        }

                        //for non-vertical lines extend above or below the line
                        if (pt3.x !== pt4.x) {
                            //extend below the line
                            pt0 = lineutility.ExtendDirectedLine(pt3, pt4, midPt1, 3, 2 * d);
                            pLinePoints[vblLowerCounter + vblUpperCounter + 8] = pt0;
                            pLinePoints[vblLowerCounter + vblUpperCounter + 8].style = 0;
                            //extend above the line
                            pt1 = lineutility.ExtendDirectedLine(pt3, pt4, midPt1, 2, 2 * d);
                            pLinePoints[vblLowerCounter + vblUpperCounter + 9] = pt1;
                            pLinePoints[vblLowerCounter + vblUpperCounter + 9].style = 5;
                        }
                        else //for vertical lines arrow points to the left
                        {
                            //extend right of the line
                            pt0 = lineutility.ExtendDirectedLine(pt3, pt4, midPt1, 1, 2 * d);
                            pLinePoints[vblLowerCounter + vblUpperCounter + 8] = pt0;
                            pLinePoints[vblLowerCounter + vblUpperCounter + 8].style = 0;
                            //extend left of the line
                            pt1 = lineutility.ExtendDirectedLine(pt3, pt4, midPt1, 0, 2 * d);
                            pLinePoints[vblLowerCounter + vblUpperCounter + 9] = pt1;
                            pLinePoints[vblLowerCounter + vblUpperCounter + 9].style = 5;
                            midPt1 = lineutility.MidPointDouble(pt0, pt1, 0);
                        }
                        //get the rotary symbol arrow
                        lineutility.GetArrowHead4Double(pt0, pt1, d as int, d as int, arrowPts, 0);

                        for (k = 0; k < 3; k++) {
                            pLinePoints[vblLowerCounter + vblUpperCounter + 10 + k] = arrowPts[k];
                        }

                        pLinePoints[vblLowerCounter + vblUpperCounter + 12].style = 5;

                        //get the base points
                        pt3 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, pt0, d / 2, 0);
                        pt4 = lineutility.ExtendTrueLinePerpDouble(pt0, pt1, pt0, -d / 2, 0);

                        pLinePoints[vblLowerCounter + vblUpperCounter + 13] = pt3;
                        pLinePoints[vblLowerCounter + vblUpperCounter + 14] = pt4;

                        //the side lines
                        //first point
                        pLinePoints[vblLowerCounter + vblUpperCounter + 14].style = 5;
                        pt0 = new POINT2(pLowerLinePoints[vblLowerCounter - 2]);
                        pt1 = new POINT2(pLowerLinePoints[vblLowerCounter - 1]);
                        pt3 = lineutility.ExtendLine2Double(pt0, midPt1, b, 0);	//line distance from midpt, a was 30
                        pLinePoints[vblLowerCounter + vblUpperCounter + 15] = new POINT2(pt3);

                        //second point
                        pt0 = new POINT2(pUpperLinePoints[vblLowerCounter - 2]);
                        pt1 = new POINT2(pUpperLinePoints[vblLowerCounter - 1]);
                        pt3 = lineutility.ExtendLine2Double(pt0, midPt1, b, 5);	//line distance from midpt, a was 30
                        pLinePoints[vblLowerCounter + vblUpperCounter + 16] = new POINT2(pt3);

                        //third point
                        pt0 = new POINT2(pLowerLinePoints[vblLowerCounter - 2]);
                        pt1 = new POINT2(pLowerLinePoints[vblLowerCounter - 1]);
                        pt3 = lineutility.ExtendLine2Double(pt1, midPt1, b, 0);	//line distance from midpt, a was 30
                        pLinePoints[vblLowerCounter + vblUpperCounter + 17] = new POINT2(pt3);

                        //fourth point
                        pt0 = new POINT2(pUpperLinePoints[vblLowerCounter - 2]);
                        pt1 = new POINT2(pUpperLinePoints[vblLowerCounter - 1]);
                        pt3 = lineutility.ExtendLine2Double(pt1, midPt1, b, 5);	//line distance from midpt, a was 30
                        pLinePoints[vblLowerCounter + vblUpperCounter + 18] = new POINT2(pt3);
                        //}
                        //else
                        //{   //if last segment too short then don't draw the rotary features
                        //if last segment too short then no side points
                        if (rotaryTooShort) {
                            for (l = vblLowerCounter + vblUpperCounter + 14; l < vblLowerCounter + vblLowerCounter + 19; l++) {
                                pLinePoints[l].style = 5;
                            }
                        }
                        //}
                    }//end if (vbiDrawThis == (long) TacticalLines.AAAAA)

                    let dFeature: double = 0;
                    let dist2: double = 0;
                    if (vbiDrawThis === TacticalLines.CATKBYFIRE) {	    //dist is the distance to the back of the arrowhead                        
                        //10-19-12
                        //this line is part of the new requirement that the rotary feature must align 
                        //with the anchor point, it can  no longer stick out beond the anchor point
                        //so the points have to be shifted by 45 pixels.

                        //dist-=45;
                        //end section
                        dist2 = lineutility.CalcDistanceDouble(nextToLastPoint, lastPoint);
                        if (dist2 > 45) {

                            dist -= 45;
                        }

                        if (dist2 > 20) {                                                                                       //was 20+dist
                            pt1 = lineutility.ExtendLineDouble(pUpperLinePoints[vblUpperCounter - 2], pUpperLinePoints[vblUpperCounter - 1], 5 + dist);//distance from tip to back of rotary
                            pt2 = lineutility.ExtendLineDouble(pLowerLinePoints[vblLowerCounter - 2], pLowerLinePoints[vblLowerCounter - 1], 5 + dist);//distance from tip to back of rotary
                        }
                        else {
                            pt1 = lineutility.ExtendLineDouble(pUpperLinePoints[vblUpperCounter - 2], pUpperLinePoints[vblUpperCounter - 1], -50);//was -40
                            pt2 = lineutility.ExtendLineDouble(pLowerLinePoints[vblLowerCounter - 2], pLowerLinePoints[vblLowerCounter - 1], -50);//was -40
                        }
                        //was dist
                        pt3 = lineutility.ExtendLine2Double(pt2, pt1, 10 + Math.abs(dist / 2), 18); //vert height of rotary from horiz segment was dist/2.5
                        pt4 = lineutility.ExtendLine2Double(pt1, pt2, 10 + Math.abs(dist / 2), 5); //vert height of rotary from horiz segment was dist/2.5
                        midPt1 = lineutility.MidPointDouble(pt1, pt2, 17);
                        pLinePoints[vblCounter - 9] = new POINT2(pt3);
                        pLinePoints[vblCounter - 6] = new POINT2(pt4);

                        if (dist2 > 20) {                                                                                               //was 30+dist
                            pt1 = lineutility.ExtendLineDouble(pUpperLinePoints[vblUpperCounter - 2], pUpperLinePoints[vblUpperCounter - 1], 15 + dist);//distance from tip to back of rotary
                            pt2 = lineutility.ExtendLineDouble(pLowerLinePoints[vblLowerCounter - 2], pLowerLinePoints[vblLowerCounter - 1], 15 + dist);//distance from tip to back of rotary
                        } else {
                            pt1 = lineutility.ExtendLineDouble(pUpperLinePoints[vblUpperCounter - 2], pUpperLinePoints[vblUpperCounter - 1], -50);//was -50
                            pt2 = lineutility.ExtendLineDouble(pLowerLinePoints[vblLowerCounter - 2], pLowerLinePoints[vblLowerCounter - 1], -50);//was -50
                        }

                        pt3 = lineutility.ExtendLine2Double(pt2, pt1, Math.abs(dist / 2), 18);//vert height of rotary from horiz segment was dist/2.5
                        pt4 = lineutility.ExtendLine2Double(pt1, pt2, Math.abs(dist / 2), 18);//vert height of rotary from horiz segment was dist/2.5

                        midPt2 = lineutility.MidPointDouble(pt1, pt2, 18);
                        pLinePoints[vblCounter - 8] = new POINT2(pt3);
                        pLinePoints[vblCounter - 7] = new POINT2(pt4);
                        pLinePoints[vblCounter - 5] = new POINT2(midPt2);
                        if (midPt1.x === midPt2.x && midPt1.y === midPt2.y) //last segment too short
                        {
                            //diagnostic 2-27-13
                            if (Channels._client.startsWith("cpof")) {

                                dFeature = 30;
                            }

                            else {

                                dFeature = 15;
                            }



                            midPt1 = lineutility.ExtendLine2Double(nextToLastPoint, pArrowLinePoints[0], 10, 17);
                            //pt1 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt1, midPt1, 30, 18);
                            //pt2 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt1, midPt1, -30, 5);                            
                            pt1 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt1, midPt1, dFeature, 18);
                            pt2 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt1, midPt1, -dFeature, 5);
                            //end section
                            pLinePoints[vblCounter - 9] = new POINT2(pt1);
                            pLinePoints[vblCounter - 6] = new POINT2(pt2);

                            if (Channels._client.startsWith("cpof")) {

                                midPt2 = lineutility.ExtendLine2Double(nextToLastPoint, pArrowLinePoints[0], 20, 17);
                            }

                            else {
                                if (dist2 > 30) {

                                    midPt2 = lineutility.ExtendLine2Double(nextToLastPoint, pArrowLinePoints[0], 20, 17);
                                }

                                else {

                                    midPt2 = lineutility.ExtendLine2Double(nextToLastPoint, pArrowLinePoints[0], dFeature, 17);
                                }

                            }
                            //end section

                            //diagnostic 2-27-13                            
                            //pt1 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt2, midPt2, 20, 18);
                            //pt2 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt2, midPt2, -20, 18);
                            dFeature -= 10;
                            pt1 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt2, midPt2, dFeature, 18);
                            pt2 = lineutility.ExtendTrueLinePerpDouble(lastPoint, midPt2, midPt2, -dFeature, 18);
                            pLinePoints[vblCounter - 8] = new POINT2(pt1);
                            pLinePoints[vblCounter - 7] = new POINT2(pt2);
                            pLinePoints[vblCounter - 5] = new POINT2(midPt2);
                        }
                        if (Channels._client.startsWith("cpof")) {

                            dFeature = 30;
                        }

                        else {
                            if (dist2 > 30) {

                                dFeature = 30;
                            }

                            else {
                                if (dist2 > 20) {

                                    dFeature = 10;
                                }

                                else {

                                    dFeature = 10;
                                }

                            }

                        }

                        pt1 = lineutility.ExtendLine2Double(midPt1, midPt2, dFeature, dFeature as int); //30, then 5
                        pLinePoints[vblCounter - 4] = new POINT2(pt1);
                        lineutility.GetArrowHead4Double(midPt2, pt1, Math.trunc(dFeature / 2), Math.trunc(dFeature / 2), arrowPts, 18);//15,15
                        //end section
                        for (k = 0; k < 3; k++) {
                            pLinePoints[vblCounter - k - 1] = new POINT2(arrowPts[k]);
                            pLinePoints[vblCounter - k - 1].style = 18;
                        }
                    }
                    break;
                }

                default: {
                    break;
                }

            }	//end load channel array ino pLinePoints
            if (vbiDrawThis === TacticalLines.CHANNEL_DASHED) {
                for (k = 0; k < vblCounter; k++) {
                    if (pLinePoints[k].style !== 5) {
                        pLinePoints[k].style = 18;
                    }
                }
            }

            //if shapes is null it is not a CPOF client
            if (shapes == null) {
                //load result points because client is using points, not shapes
                for (j = 0; j < pLinePoints.length; j++) {
                    resultVBPoints[3 * j] = pLinePoints[j].x;
                    resultVBPoints[3 * j + 1] = pLinePoints[j].y;
                    resultVBPoints[3 * j + 2] = pLinePoints[j].style as double;
                }
                return pLinePoints.length;
            }

            //the shapes
            let shape: Shape2 | null = null;
            //Shape2 outline=null;
            let beginLine: boolean = true;
            let beginPath: boolean = true;

            for (k = 0; k < vblCounter; k++) {
                //use shapes instead of pixels

                if (shape == null) {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                }

                switch (vbiDrawThis) {
                    case TacticalLines.CATK:
                    case TacticalLines.CATKBYFIRE: {
                        shape.set_Style(1);
                        break;
                    }


                    default:

                }

                switch (vbiDrawThis) {
                    case TacticalLines.LC:
                    case TacticalLines.LC_HOSTILE: {
                        if (beginPath === false) {
                            if (k > 0) {   //if the linestyle is changes on the next point then this point is end of the current path
                                //because it's changing between friendly and enemy ellipses
                                if (pLinePoints[k].style === 5) {
                                    //add the last point to the current path
                                    shape.lineTo(pLinePoints[k]);
                                    //add the shape
                                    if (shape != null && shape.getShape() != null) {
                                        shapes.push(shape);
                                    }

                                    beginPath = true;
                                }
                                else    //continue the current path
                                {
                                    shape.lineTo(pLinePoints[k]);
                                }
                            }
                            else    //k=0
                            {
                                shape.moveTo(pLinePoints[k]);
                            }
                        }
                        else    //start a new path
                        {
                            shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                            shape.moveTo(pLinePoints[k]);
                            shape.set_Style(pLinePoints[k].style);
                            //assume friendly
                            if (pLinePoints[k].style === 25) {

                                shape.setLineColor(Color.RED);
                            }


                            beginPath = false;
                        }
                        //if(k==vblCounter-1) //LC should have 2 shapes
                        //  if(shape !=null && shape.get_Shape() != null)
                        //    shapes.push(shape);
                        break;
                    }

                    case TacticalLines.CATK:    //same as default except these have doubled 5's
                    case TacticalLines.CATKBYFIRE:
                    case TacticalLines.AAAAA:
                    case TacticalLines.SPT:
                    case TacticalLines.SPT_STRAIGHT:
                    case TacticalLines.AIRAOA: {
                        if (beginLine) {
                            if (k > 0) //doubled points with linestyle=5
                            {
                                if (pLinePoints[k].style === 5 && pLinePoints[k - 1].style === 5 && k !== vblCounter - 1) {

                                    continue;
                                }

                            }

                            shape.moveTo(pLinePoints[k]);
                            beginLine = false;
                        }
                        else {
                            shape.lineTo(pLinePoints[k]);
                            if (pLinePoints[k].style === 5) {
                                beginLine = true;
                                //unless there are doubled points with style=5
                            }
                        }
                        if (k === vblCounter - 1) //non-LC should only have one shape
                        {
                            if (shape != null && shape.getShape() != null) {
                                shapes.push(shape);
                            }
                        }
                        break;
                    }

                    case TacticalLines.UNSP:
                    case TacticalLines.SFENCE:
                    case TacticalLines.DFENCE:
                    case TacticalLines.LWFENCE:
                    case TacticalLines.HWFENCE: {
                        if (k === 0) {
                            shape.moveTo(pLinePoints[k]);
                            if (pLinePoints[k].style === 5) {
                                continue;
                            }
                        }
                        if (k > 0 && k < vblCounter - 1) {
                            if (pLinePoints[k - 1].style === 5) {

                                shape.moveTo(pLinePoints[k]);
                            }

                            else {
                                if (pLinePoints[k - 1].style === 0) {

                                    shape.lineTo(pLinePoints[k]);
                                }

                            }


                            if (pLinePoints[k].style === 5) {

                                shape.moveTo(pLinePoints[k]);
                            }


                            if (k === vblCounter - 2 && pLinePoints[k].style === 0) {
                                shape.moveTo(pLinePoints[k]);
                                shape.lineTo(pLinePoints[k + 1]);
                            }
                        }

                        if (k === vblCounter - 1) //non-LC should only have one shape
                        {
                            if (shape != null && shape.getShape() != null) {

                                shapes.push(shape);
                            }

                        }
                        break;
                    }

                    default: {
                        if (beginLine) {
                            if (k === 0) {

                                shape.set_Style(pLinePoints[k].style);
                            }


                            shape.moveTo(pLinePoints[k]);
                            beginLine = false;
                        }
                        else {
                            shape.lineTo(pLinePoints[k]);
                            if (pLinePoints[k].style === 5) {
                                beginLine = true;
                                //unless there are doubled points with style=5
                            }
                        }
                        if (k === vblCounter - 1) //non-LC should only have one shape
                        {
                            if (shape != null && shape.getShape() != null) {

                                shapes.push(shape);
                            }

                        }
                        break;
                    }

                }//end switch
            }   //end for
            //a requirement was added to enable fill for the axis of advance line types
            let fillShapes: Array<Shape2> = Channels.getAXADFillShapes(vbiDrawThis, pLinePoints);
            if (fillShapes != null && fillShapes.length > 0) {
                shapes.unshift(...fillShapes); // shapes.addAll(0,fillShapes);
            }


            lResult = lResultCounter;
            //FillPoints(pLinePoints,pLinePoints.length);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "GetChannel1Double",
                    new RendererException("Failed inside GetChannel1Double " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return lResult;
    }
    /**
     * They decided that axis of advance must enable fill
     * @param lineType
     * @param pLinePoints
     * @return
     */
    private static getAXADFillShapes(lineType: int, pLinePoints: POINT2[]): Array<Shape2> {
        let shapes: Array<Shape2>;
        try {
            let newPts: Array<POINT2> = new Array();
            let j: int = 0;
            let shape: Shape2;
            let n: int = pLinePoints.length;
            let t: int = 0;
            switch (lineType) {
                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    for (j = 0; j < n / 2; j++) {
                        newPts.push(pLinePoints[j]);
                    }
                    for (j = n - 1; j >= n / 2; j--) {
                        newPts.push(pLinePoints[j]);
                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    shape.moveTo(newPts[0]);
                    let t: int = newPts.length;
                    //for(j=1;j<newPts.length;j++)
                    for (j = 1; j < t; j++) {
                        shape.lineTo(newPts[j]);
                    }
                    break;
                }

                case TacticalLines.AIRAOA:
                case TacticalLines.SPT:
                case TacticalLines.CATK:
                case TacticalLines.SPT_STRAIGHT: {
                    //add the upper (lower) channel points
                    //for(j=0;j<(pLinePoints.length-8)/2;j++)
                    for (j = 0; j < (n - 8) / 2; j++) {
                        newPts.push(pLinePoints[j]);
                    }
                    //add the arrow outline
                    newPts.push(pLinePoints[n - 6]);;;
                    newPts.push(pLinePoints[n - 7]);;
                    newPts.push(pLinePoints[n - 8]);;
                    newPts.push(pLinePoints[n - 3]);
                    newPts.push(pLinePoints[n - 4]);
                    //add the upper (lower) channel points
                    for (j = n - 9; j >= (n - 8) / 2; j--) {
                        newPts.push(pLinePoints[j]);
                    }
                    //newPts.push(pLinePoints[0]);
                    shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    //shape.moveTo(newPts[0].x,newPts[0].y);
                    shape.moveTo(newPts[0]);
                    t = newPts.length;
                    //for(j=1;j<newPts.length;j++)
                    for (j = 1; j < t; j++) {
                        shape.lineTo(newPts[j]);
                    }
                    break;
                }

                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.MAIN: {
                    //for(j=0;j<(pLinePoints.length-8)/2;j++)
                    for (j = 0; j < (n - 8) / 2; j++) {
                        newPts.push(pLinePoints[j]);
                    }
                    //add the arrow outline
                    newPts.push(pLinePoints[n - 6]);
                    newPts.push(pLinePoints[n - 5]);
                    for (j = n - 9; j >= (n - 8) / 2; j--) {
                        newPts.push(pLinePoints[j]);
                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    shape.moveTo(newPts[0]);
                    t = newPts.length;
                    //for(j=1;j<newPts.length;j++)
                    for (j = 1; j < t; j++) {
                        shape.lineTo(newPts[j]);
                    }
                    break;
                }

                case TacticalLines.AAAAA: {
                    //for(j=0;j<(pLinePoints.length-19)/2;j++)
                    for (j = 0; j < (n - 19) / 2; j++) {
                        newPts.push(pLinePoints[j]);
                    }
                    //add the arrow outline
                    newPts.push(pLinePoints[n - 17]);
                    newPts.push(pLinePoints[n - 18]);;
                    newPts.push(pLinePoints[n - 19]);
                    newPts.push(pLinePoints[n - 14]);;
                    newPts.push(pLinePoints[n - 15]);

                    for (j = n - 20; j >= (n - 19) / 2; j--) {
                        newPts.push(pLinePoints[j]);
                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    shape.moveTo(newPts[0]);
                    t = newPts.length;
                    //for(j=1;j<newPts.length;j++)
                    for (j = 1; j < t; j++) {
                        shape.lineTo(newPts[j]);
                    }
                    break;
                }

                case TacticalLines.CATKBYFIRE: {
                    //for(j=0;j<(pLinePoints.length-17)/2;j++)
                    for (j = 0; j < (n - 17) / 2; j++) {
                        newPts.push(pLinePoints[j]);
                    }
                    //add the arrow outline
                    newPts.push(pLinePoints[n - 15]);
                    newPts.push(pLinePoints[n - 16]);
                    newPts.push(pLinePoints[n - 17]);
                    newPts.push(pLinePoints[n - 12]);
                    newPts.push(pLinePoints[n - 13]);
                    for (j = n - 18; j >= (n - 17) / 2; j--) {
                        newPts.push(pLinePoints[j]);
                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    shape.moveTo(newPts[0]);
                    t = newPts.length;
                    //for(j=1;j<newPts.length;j++)
                    for (j = 1; j < t; j++) {
                        shape.lineTo(newPts[j]);
                    }
                    break;
                }

                default: {
                    break;
                }

            }
            if (shape != null) {
                shapes = new Array();
                shape.setLineColor(null);
                shapes.push(shape);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Channels._className, "getAXADfillShapes",
                    new RendererException("Failed inside getAXADFillShapes", exc));
            } else {
                throw exc;
            }
        }
        return shapes;
    }
    /*
     * sets shape2 properties to those of shape1
     * @param shape1
     * @param shape2
     */
    //    private static void SetShapeProperties(Shape2 shape1, Shape2 shape2)
    //    {
    //        try
    //        {
    //            shape2.setLineColor(shape1.getLineColor());
    //            shape2.setStroke(shape1.getStroke());
    //            shape2.setFillColor(shape1.getFillColor());
    //        }
    //        catch (Exception exc) {
    //            ErrorLogger.LogException(_className ,"GetChannel1Double",
    //                    new RendererException("Failed inside SetShapeProperties", exc));
    //        }
    //    }
}
