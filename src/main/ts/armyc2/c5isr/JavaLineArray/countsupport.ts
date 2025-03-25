/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



import { type double, type int, type long } from "../graphics2d/BasicTypes";

import { Rectangle2D } from "../graphics2d/Rectangle2D"

import { arraysupport } from "../JavaLineArray/arraysupport"
import { flot } from "../JavaLineArray/flot"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"

import { TGLight } from "../JavaTacticalRenderer/TGLight"

import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"

import { Channels } from "./Channels";


/**
 * A class to calculate the number of pixels based points required for a line
 *
 */
export class countsupport {
    private static readonly maxLength: double = 100;	//max arrow size
    private static readonly minLength: double = 2.5;		//min arrow size was 5
    private static readonly _className: string = "countsupport";

    //    protected static void setMinLength(double mLength)
    //    {
    //        minLength=mLength;
    //    }
    /**
     * The main function to return the number of points needed for a symbol
     * @param vblCounter the number of client points
     * @param pLinePoints the client point array
     * @return the number of points required to draw the symbol
     */
    static GetCountersDouble(tg: TGLight,
        vblCounter: int,
        pLinePoints: POINT2[],
        clipBounds: Rectangle2D | null): int {
        let count: int = 0;
        try {
            let vbiDrawThis: int = tg.get_LineType();
            //declaration section
            let j: int = 0;
            let vblSaveCounter: int = vblCounter;
            let pSquarePoints: POINT2[] = new Array<POINT2>(4);
            let pUpperLinePoints: POINT2[];
            let
                pLowerLinePoints: POINT2[]
            let segments: number[];
            let pNewLinePoints: POINT2[];
            let dRadius: double = 0;
            let pointsCorner: POINT2[] = new Array<POINT2>(2);
            //double saveMaxPixels = 2000;//CELineArrayGlobals.MaxPixels2;

            pUpperLinePoints = new Array<POINT2>(vblCounter);
            pLowerLinePoints = new Array<POINT2>(vblCounter);

            for (j = 0; j < vblCounter; j++) {
                pUpperLinePoints[j] = new POINT2(pLinePoints[j]);
                pLowerLinePoints[j] = new POINT2(pLinePoints[j]);
            }
            lineutility.InitializePOINT2Array(pointsCorner);
            lineutility.InitializePOINT2Array(pSquarePoints);
            //end delcarations
            switch (vbiDrawThis) {
                case TacticalLines.OVERHEAD_WIRE: {
                    count = vblCounter * 15;    //15 points per segment
                    break;
                }

                case TacticalLines.REEF: {
                    vblCounter = countsupport.GetReefCount(pLinePoints, arraysupport.getScaledSize(40, tg.get_LineThickness()), vblSaveCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.RESTRICTED_AREA: {
                    vblCounter = countsupport.GetRestrictedAreaCount(pLinePoints, arraysupport.getScaledSize(15, tg.get_LineThickness()), vblSaveCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.TRAINING_AREA: {
                    vblCounter += 30;
                    count = vblCounter;
                    break;
                }

                case TacticalLines.PIPE: {
                    count = countsupport.GetPipeCount(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter);
                    break;
                }

                case TacticalLines.ANCHORAGE_AREA:
                case TacticalLines.ANCHORAGE_LINE: {
                    count = flot.GetAnchorageCountDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblCounter);
                    break;
                }

                case TacticalLines.LRO: {
                    let xCount: int = countsupport.GetXPointsCount(pLinePoints, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblCounter);
                    let lvoCount: int = countsupport.GetLVOCount(pLinePoints, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblCounter);
                    count = xCount + lvoCount;
                    break;
                }

                case TacticalLines.LVO: {
                    count = countsupport.GetLVOCount(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblCounter);
                    break;
                }

                case TacticalLines.ICING: {
                    vblCounter = countsupport.GetIcingCount(pLinePoints, arraysupport.getScaledSize(15, tg.get_LineThickness()), vblCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.FLOT: {
                    vblSaveCounter = vblCounter;
                    vblCounter = flot.GetFlotCountDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.MVFR:
                case TacticalLines.UNDERCAST: {
                    vblSaveCounter = vblCounter;
                    vblCounter = flot.GetFlotCountDouble(pLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.ITD: {
                    vblCounter = countsupport.GetITDQty(pLinePoints, arraysupport.getScaledSize(15, tg.get_LineThickness()), vblCounter) + vblCounter;
                    count = vblCounter;
                    break;
                }

                case TacticalLines.CONVERGENCE: {
                    vblCounter = countsupport.GetConvergenceQty(pLinePoints, arraysupport.getScaledSize(10, tg.get_LineThickness()), vblCounter) + vblCounter;
                    count = vblCounter;
                    break;
                }

                case TacticalLines.RIDGE: {
                    vblCounter = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.TROUGH:
                case TacticalLines.UPPER_TROUGH:
                case TacticalLines.INSTABILITY:
                case TacticalLines.SHEAR: {
                    vblCounter = countsupport.GetSquallQty(pLinePoints, 6, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter as int);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.CABLE: {
                    vblCounter = countsupport.GetSquallQty(pLinePoints, 6, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblSaveCounter as int);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.SQUALL: {
                    vblCounter = countsupport.GetSquallQty(pLinePoints, 5, arraysupport.getScaledSize(30, tg.get_LineThickness()), vblSaveCounter as int) + 2 * vblSaveCounter;
                    count = vblCounter;
                    break;
                }

                case TacticalLines.USF:
                case TacticalLines.SFG:
                case TacticalLines.SFY:
                case TacticalLines.SF: {
                    vblCounter = flot.GetSFCountDouble(pLinePoints, vblCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.OFY: {
                    vblSaveCounter = vblCounter;
                    vblCounter = flot.GetOFYCountDouble(pLinePoints, arraysupport.getScaledSize(80, tg.get_LineThickness()), vblCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.UCF:
                case TacticalLines.CF:
                case TacticalLines.CFG:
                case TacticalLines.CFY: {
                    count = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
                    count += vblSaveCounter;
                    break;
                }

                case TacticalLines.FOLLA:
                case TacticalLines.FOLSP: {
                    count = 16;
                    break;
                }

                case TacticalLines.ROADBLK:
                case TacticalLines.FERRY: {
                    count = 8;
                    break;
                }

                case TacticalLines.NAVIGATION:
                case TacticalLines.IL:
                case TacticalLines.PLANNED:
                case TacticalLines.ESR1:
                case TacticalLines.ESR2:
                case TacticalLines.FORDSITE:
                case TacticalLines.FOXHOLE: {
                    count = 4;
                    break;
                }

                case TacticalLines.TRIP: {
                    count = 35;
                    break;
                }

                case TacticalLines.AMBUSH: {	//extra 3 for open arrow, extra 26 for the tail arc,
                    //and an extra 22 for the tail line segments
                    count = 53;//vblCounter+51;
                    break;
                }

                case TacticalLines.CLUSTER: {
                    count = 28;
                    break;
                }

                case TacticalLines.CONTAIN: {
                    count = 40;
                    break;
                }

                case TacticalLines.BYIMP: {
                    count = 18;
                    break;
                }

                case TacticalLines.SPTBYFIRE: {
                    count = 16;
                    break;
                }

                case TacticalLines.BLOCK:
                case TacticalLines.MNFLDBLK: {
                    count = 4;
                    break;
                }

                case TacticalLines.PAA_RECTANGULAR: {
                    count = 5;
                    break;
                }

                case TacticalLines.RECTANGULAR_TARGET: {
                    count = 9;
                    break;
                }

                case TacticalLines.PENETRATE: {
                    count = 7;
                    break;
                }

                case TacticalLines.ASLTXING:	//double for the channel type plus 4 for the hash marks
                case TacticalLines.GAP:
                case TacticalLines.BYPASS:
                case TacticalLines.EASY:
                case TacticalLines.BREACH:
                case TacticalLines.CANALIZE: {
                    count = 12;
                    break;
                }

                case TacticalLines.MNFLDDIS: {
                    count = 22;
                    break;
                }

                case TacticalLines.WITHDRAW:
                case TacticalLines.WDRAWUP:
                case TacticalLines.DELAY:		//extra four points for hash marks on last segment
                case TacticalLines.RETIRE:
                case TacticalLines.FPOL:
                case TacticalLines.RPOL: {
                    count = 23;
                    break;
                }

                case TacticalLines.SEIZE: {
                    count = 37;
                    break;
                }

                case TacticalLines.RIP: {
                    count = 29;
                    break;
                }

                case TacticalLines.DIRATKSPT: {
                    count = vblCounter + 3;
                    break;
                }

                case TacticalLines.ABATIS: {
                    count = vblCounter + 3;
                    break;
                }

                case TacticalLines.FPF:	//extra two points for blocks at each end
                case TacticalLines.LINTGT:	//extra two points for blocks at each end
                case TacticalLines.LINTGTS: {
                    count = vblCounter + 4;
                    break;
                }

                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    //pvblCounters[0]=2*lElements;
                    //pvblCounters[1]=lElements;
                    count = 2 * vblCounter;
                    break;
                }

                case TacticalLines.SARA: {
                    count = 16;	//same for DISM
                    break;
                }

                case TacticalLines.COVER:		//vblSaveCounter = vblCounter;
                case TacticalLines.SCREEN:
                case TacticalLines.GUARD:
                case TacticalLines.PDF:
                case TacticalLines.ATKBYFIRE: {
                    count = 14;	//same for DISM
                    break;
                }

                case TacticalLines.RAFT:
                case TacticalLines.MFLANE: {	//extra eight points for hash marks at either end
                    count = 8;
                    break;
                }

                case TacticalLines.DIRATKGND: {
                    count = vblCounter + 10;
                    break;
                }

                case TacticalLines.DIRATKAIR: {
                    count = vblCounter + 9;
                    break;
                }

                case TacticalLines.DISRUPT:
                case TacticalLines.CLEAR: {
                    count = 20;
                    break;
                }

                case TacticalLines.MSDZ: {
                    count = 300;
                    break;
                }

                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY: {
                    count = 10;
                    break;
                }

                case TacticalLines.ISOLATE:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH: {
                    count = 50;
                    break;
                }

                case TacticalLines.OCCUPY: {
                    count = 32;
                    break;
                }

                case TacticalLines.SECURE: {
                    count = 29;
                    break;
                }

                case TacticalLines.RETAIN: {
                    count = 75;
                    break;
                }

                case TacticalLines.TURN: {
                    count = 29;
                    break;
                }

                case TacticalLines.AIRFIELD: {
                    count = vblCounter + 5;
                    break;
                }

                case TacticalLines.FENCED: {
                    count = vblCounter;
                    break;
                }

                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE_ALT: {
                    count = vblCounter * 9;
                    break;
                }

                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.ASR_TWOWAY: {
                    count = vblCounter * 11;
                    break;
                }

                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ROUTE_ONEWAY: {
                    count = vblCounter * 6;
                    break;
                }

                case TacticalLines.WF:
                case TacticalLines.UWF: {
                    vblCounter = flot.GetFlotCount2Double(tg, pLinePoints, vblCounter);
                    vblCounter += vblSaveCounter;
                    count = vblCounter;
                    break;
                }

                case TacticalLines.WFG:
                case TacticalLines.WFY: {
                    vblCounter = flot.GetFlotCount2Double(tg, pLinePoints, vblCounter);
                    count = vblCounter;
                    break;
                }

                case TacticalLines.FORDIF: {
                    dRadius = lineutility.CalcDistanceToLineDouble(pLinePoints[0], pLinePoints[1], pLinePoints[2]);
                    let spikeLength: double = arraysupport.getScaledSize(10, tg.get_LineThickness());
                    count = Math.trunc((dRadius / (spikeLength / 2)) * 3) + 6;
                    if (clipBounds != null) {
                        let width: double = clipBounds.getWidth();
                        let height: double = clipBounds.getHeight();
                        dRadius = Math.sqrt(width * width + height * height);
                        count = Math.trunc(dRadius / (spikeLength / 2)) + 6;
                    }


                    break;
                }

                case TacticalLines.ATDITCH:	//call function to determine the array size
                case TacticalLines.ATDITCHC:	//call function to determine the array size
                case TacticalLines.ATDITCHM: {
                    count = countsupport.GetDitchCountDouble(pLinePoints, vblSaveCounter, vbiDrawThis);
                    break;
                }

                case TacticalLines.CATK:
                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.AIRAOA:
                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT: {
                    //points for these need not be bounded
                    //they have an extra 8 points for the arrowhead
                    count = 2 * vblCounter + 8;
                    break;
                }

                case TacticalLines.CATKBYFIRE: {
                    count = 2 * vblCounter + 17;
                    break;
                }

                case TacticalLines.AAAAA: {
                    count = 2 * vblCounter + 19;
                    break;
                }

                case TacticalLines.LLTR:  //added 5-4-07
                case TacticalLines.SAAFR:
                case TacticalLines.AC:
                case TacticalLines.SC:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC: {
                    vblCounter = 6 * (vblSaveCounter - 1);	//6 per segment
                    count = vblCounter + 26 * vblSaveCounter * 2;	//26 for each circle and potentially two circles at each endpoint
                    break;
                }

                case TacticalLines.ATWALL:
                case TacticalLines.LINE:
                case TacticalLines.OBSAREA:
                case TacticalLines.OBSFAREA:
                case TacticalLines.STRONG:
                case TacticalLines.ZONE:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.FORTL: {
                    count = countsupport.GetFORTLCountDouble(tg, pLinePoints, vblSaveCounter);
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
                case TacticalLines.DFENCE: {
                    count = Channels.GetTripleCountDouble(pLinePoints, vblCounter, vbiDrawThis);
                    break;
                }

                case TacticalLines.LC: {
                    pUpperLinePoints = Channels.GetChannelArray2Double(1, pUpperLinePoints, 1, vblCounter, vbiDrawThis, Math.trunc(arraysupport.getScaledSize(20, tg.get_LineThickness())));
                    pLowerLinePoints = Channels.GetChannelArray2Double(1, pLowerLinePoints, 0, vblCounter, vbiDrawThis, Math.trunc(arraysupport.getScaledSize(20, tg.get_LineThickness())));
                    let lUpperFlotCount: int = flot.GetFlotCountDouble(pUpperLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblCounter);
                    let lLowerFlotCount: int = flot.GetFlotCountDouble(pLowerLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), vblCounter);
                    count = lUpperFlotCount + lLowerFlotCount;
                    break;
                }

                case TacticalLines.OCCLUDED:
                case TacticalLines.UOF: {
                    vblSaveCounter = vblCounter;
                    vblCounter = flot.GetOccludedCountDouble(pLinePoints, vblCounter);
                    vblCounter += vblSaveCounter;
                    count = vblCounter;
                    break;
                }

                case TacticalLines.FIX:
                case TacticalLines.MNFLDFIX: {
                    if (pLinePoints.length > 1) {

                        count = countsupport.GetDISMFixCountDouble(pLinePoints[0], pLinePoints[1], clipBounds);
                    }

                    else {
                        count = 0;
                    }

                    break;
                }

                case TacticalLines.BYDIF: {
                    if (clipBounds != null) {
                        countsupport.GetByDifSegment(pLinePoints, pointsCorner);
                        let ul: POINT2 = new POINT2(clipBounds.getMinX(), clipBounds.getMinY());    //-100,1000
                        let lr: POINT2 = new POINT2(clipBounds.getMaxX(), clipBounds.getMaxY());  //-100,1000
                        let ptsCorner: POINT2[] = lineutility.BoundOneSegment(pointsCorner[0], pointsCorner[1], ul, lr);

                        if (ptsCorner != null) {

                            count = countsupport.GetDISMFixCountDouble(ptsCorner[0], ptsCorner[1], clipBounds);
                        }

                        else {

                            count = 20;
                        }

                    }
                    else {

                        count = countsupport.GetDISMFixCountDouble(pLinePoints[0], pLinePoints[1], clipBounds);
                    }


                    break;
                }

                default: {
                    count = vblCounter;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetCountersDouble",
                    new RendererException("Failed inside GetCountersDouble " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return Math.trunc(count);
    }
    private static GetReefCount(pLinePoints: POINT2[],
        length: double,
        vblCounter: int): int {
        let count: int = 0;
        try {
            let d: double = 0;
            for (let j: int = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                count += 5 * Math.trunc(d / length);
            }
            count += 2 * vblCounter as int;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetReefCount",
                    new RendererException("Failed inside GetReefCount", exc));
            } else {
                throw exc;
            }
        }
        return count;
    }
    private static GetRestrictedAreaCount(pLinePoints: POINT2[],
        length: double,
        vblCounter: int): int {
        let count: int = 0;
        try {
            let d: double = 0;
            for (let j: int = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                count += 4 * Math.trunc(d / length);
            }
            count += 2 * vblCounter as int;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetRestrictedAreaCount",
                    new RendererException("Failed inside GetRestrictedAreaCount", exc));
            } else {
                throw exc;
            }
        }
        return count;
    }

    private static GetPipeCount(pLinePoints: POINT2[],
        length: double,
        vblCounter: int): int {
        let count: int = 0;
        try {
            let d: double = 0;
            for (let j: int = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                count += 3 * Math.trunc(d / length);
            }
            count += 2 * vblCounter as int;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetPipeCount",
                    new RendererException("Failed inside GetPipeCount", exc));
            } else {
                throw exc;
            }
        }
        return count;
    }

    static GetXPointsCount(pOriginalLinePoints: POINT2[], segmentLength: double, vblCounter: int): int {
        let xCounter: int = 0;
        try {
            let j: int = 0;
            let d: double = 0;
            //POINT2 pt0,pt1,pt2,pt3=new POINT2(),pt4=new POINT2(),pt5=new POINT2(),pt6=new POINT2();
            let numThisSegment: int = 0;
            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                numThisSegment = Math.trunc((d - segmentLength / 2) / segmentLength);
                xCounter += 4 * numThisSegment;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetXPointsCount",
                    new RendererException("Failed inside GetXPointsCount", exc));
            } else {
                throw exc;
            }
        }
        return xCounter;
    }

    static GetLVOCount(pOriginalLinePoints: POINT2[], segmentLength: double, vblCounter: int): int {
        let lEllipseCounter: int = 0;
        try {
            let d: double = 0;
            let lHowManyThisSegment: int = 0;
            let j: int = 0;
            //end declarations
            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pOriginalLinePoints[j], pOriginalLinePoints[j + 1]);
                //lHowManyThisSegment = (int) ((d - 20) / 20);
                lHowManyThisSegment = Math.trunc((d - segmentLength) / segmentLength) + 1;
                lEllipseCounter += lHowManyThisSegment * 37;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetLVOCount",
                    new RendererException("Failed inside GetLVOCount", exc));
            } else {
                throw exc;
            }
        }
        return lEllipseCounter;
    }

    private static GetIcingCount(points: POINT2[], length: double, vblCounter: int): int {
        let total: int = 2 * vblCounter;
        try {
            let d: double = 0;
            for (let j: int = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(points[j], points[j + 1]);
                d = (d / length) * 4;
                total += d;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetIcingCount",
                    new RendererException("Failed inside GetIcingCount", exc));
            } else {
                throw exc;
            }
        }
        return total;
    }

    protected static GetITDQty(pLinePoints: POINT2[], length: double, vblCounter: int): int {
        let total: int = 0;
        try {
            let j: int = 0;
            let d: double = 0;
            let n: int = 0;
            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                n = 2 * Math.trunc(d / length);
                if (n < 2) {

                    n = 2;
                }

                total += n;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetITDQty",
                    new RendererException("Failed inside GetITDQty", exc));
            } else {
                throw exc;
            }
        }
        return total;
    }

    protected static GetConvergenceQty(pLinePoints: POINT2[], length: double, vblCounter: int): int {
        let total: int = vblCounter;
        try {
            let j: int = 0;
            let d: double = 0;
            for (j = 0; j < vblCounter - 1; j++) {
                d = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                total += 4 * Math.trunc(d / length);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetConvergenceQty",
                    new RendererException("Failed inside GetConvergenceQty", exc));
            } else {
                throw exc;
            }
        }
        return total;
    }

    /**
     * Calculates the points for ATDITCH, ATDITCHC, ATDITCHM
     * @param pLinePoints the client point array
     * @param vblCounter the number of client points
     * @param vbiDrawThis the line type
     * @return
     */
    private static GetDitchCountDouble(pLinePoints: POINT2[],
        vblCounter: int,
        vbiDrawThis: int): int {
        let vblXCounter: int = 0;
        try {
            //declarations
            let j: int = 0;
            let nHowManyThisSegment: int = 0;
            let dHowFar: double = 0;
            //dPrinter = (double) nPrinter;

            vblXCounter = vblCounter;

            for (j = 0; j < vblCounter - 1; j++) {
                dHowFar = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                nHowManyThisSegment = Math.trunc((dHowFar - 1) / 12);
                if (dHowFar > 24) {
                    switch (vbiDrawThis) {
                        //case TacticalLines.FORT:
                        //    break;
                        case TacticalLines.ATDITCHM: {
                            vblXCounter += 5 * nHowManyThisSegment + 1;//was 4 * nHowManyThisSegment
                            break;
                        }

                        default: {
                            vblXCounter += 4 * nHowManyThisSegment;//was 3 * nHowManyThisSegment
                            break;
                        }

                    }	//end switch
                } //end if
                else {
                    vblXCounter += 2;
                }
            }	//end for
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetDitchcountDouble",
                    new RendererException("Failed inside GetDitchCountDouble " + vbiDrawThis.toString(), exc));
            } else {
                throw exc;
            }
        }
        return vblXCounter;
    }
    static GetSquallQty(pLinePoints: POINT2[],
        quantity: int,
        length: double,
        numPoints: int): int {
        let counter: int = 0;
        try {
            let j: int = 0;
            let dist: double = 0;
            let numCurves: int = 0;
            //end declarations

            for (j = 0; j < numPoints - 1; j++) {
                dist = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);
                numCurves = Math.trunc(dist / length as double);
                counter += numCurves * quantity;
                if (numCurves === 0) {
                    counter += 2;
                }
            }

            if (counter < numPoints) {
                counter = numPoints;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetSquallQty",
                    new RendererException("Failed inside GetSquallQty", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

    static GetSquallSegQty(StartPt: POINT2,
        EndPt: POINT2,
        quantity: int,
        length: double): int {
        let qty: int = 0;
        try {
            let dist: double = lineutility.CalcDistanceDouble(StartPt, EndPt);
            let numCurves: int = Math.trunc(dist / length as double);
            qty = numCurves * quantity;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetSquallSegQty",
                    new RendererException("Failed inside GetSquallSegQty", exc));
            } else {
                throw exc;
            }
        }
        return qty;
    }

    /**
     * returns number of points required for ATWALL, FORT and other symbols
     * @param pLinePoints the client points
     * @param vblCounter the number of client points
     * @return
     */
    static GetFORTLCountDouble(tg: TGLight, pLinePoints: POINT2[], vblCounter: int): int {
        let lCounter: int = 0;
        try {
            //declarations
            let j: int = 0;
            let dCounter: double = 0;
            let dIncrement: double = 0;
            //end declarations

            switch (tg.get_LineType()) {
                case TacticalLines.UCF:
                case TacticalLines.CF:
                case TacticalLines.CFG:
                case TacticalLines.CFY: {
                    dIncrement = arraysupport.getScaledSize(60, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.RIDGE: {
                    dIncrement = arraysupport.getScaledSize(20, tg.get_LineThickness());
                    break;
                }

                default: {
                    dIncrement = arraysupport.getScaledSize(20, tg.get_LineThickness());
                    break;
                }

            }

            for (j = 0; j < vblCounter - 1; j++) {
                dCounter = lineutility.CalcDistanceDouble(pLinePoints[j], pLinePoints[j + 1]);

                switch (tg.get_LineType()) {
                    case TacticalLines.CFG: {
                        dCounter = (dCounter / dIncrement) * 13;
                        break;
                    }

                    case TacticalLines.CFY: {
                        dCounter = (dCounter / dIncrement) * 17;
                        break;
                    }

                    default: {
                        dCounter = (dCounter / dIncrement) * 10;
                        break;
                    }

                }

                if (dCounter < 4) {
                    dCounter = 4;
                }
                lCounter += Math.trunc(dCounter);
            }
            lCounter += 10 + vblCounter;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetFORTLCountDouble",
                    new RendererException("Failed inside GetFORTLCountDouble", exc));
            } else {
                throw exc;
            }
        }
        return lCounter;
    }

    private static GetByDifSegment(points: POINT2[], pointsCorner: POINT2[]): void {
        try {
            // draw open-ended rectangle
            let point_mid: POINT2 = new POINT2();
            //int j=0;
            //	POINT1 pts[4];
            if (pointsCorner == null) {
                pointsCorner = new Array<POINT2>(2);
                lineutility.InitializePOINT2Array(pointsCorner);
            }
            point_mid.x = (points[0].x + points[1].x) / 2;
            point_mid.y = (points[0].y + points[1].y) / 2;
            pointsCorner[0].x = points[0].x - point_mid.x + points[2].x;
            pointsCorner[0].y = points[0].y - point_mid.y + points[2].y;
            pointsCorner[1].x = points[1].x - point_mid.x + points[2].x;
            pointsCorner[1].y = points[1].y - point_mid.y + points[2].y;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetByDifSegment",
                    new RendererException("Failed inside GetByDifSegment", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * clipBounds is used because of the glyphs on one segment
     * @param FirstLinePoint
     * @param LastLinePoint
     * @param clipBounds
     * @return
     */
    protected static GetDISMFixCountDouble(FirstLinePoint: POINT2,
        LastLinePoint: POINT2,
        clipBounds: Rectangle2D): int {
        let counter: int = 0;
        try {
            let savepoints: POINT2[] = new Array<POINT2>(2);
            //double dAngle1 = 0;
            let dLength: double = 0;
            let dJaggyHalfAmp: double = 0;
            let dJaggyHalfPeriod: double = 0;
            let iNumJaggies: int = 0;

            savepoints[0] = new POINT2(FirstLinePoint);
            savepoints[1] = new POINT2(LastLinePoint);

            //Boolean drawJaggies=true;
            if (clipBounds != null) {
                let ul: POINT2 = new POINT2(clipBounds.getMinX(), clipBounds.getMinY());
                let lr: POINT2 = new POINT2(clipBounds.getMaxX(), clipBounds.getMaxY());
                savepoints = lineutility.BoundOneSegment(FirstLinePoint, LastLinePoint, ul, lr);
            }

            if (savepoints == null) {

                return 0;
            }


            dLength = Math.sqrt((savepoints[1].x - savepoints[0].x) * (savepoints[1].x - savepoints[0].x) +
                (savepoints[1].y - savepoints[0].y) * (savepoints[1].y - savepoints[0].y));
            dJaggyHalfAmp = dLength / 15; // half the amplitude of the "jaggy function"

            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;
            if (dJaggyHalfAmp > countsupport.maxLength * DPIScaleFactor) {
                dJaggyHalfAmp = countsupport.maxLength * DPIScaleFactor;
            }
            if (dJaggyHalfAmp < countsupport.minLength * DPIScaleFactor) {
                dJaggyHalfAmp = countsupport.minLength * DPIScaleFactor;
            }

            dJaggyHalfPeriod = dJaggyHalfAmp / 1.5; // half the period of the "jaggy function"
            iNumJaggies = Math.trunc(dLength / dJaggyHalfPeriod) - 3;
            if (iNumJaggies < 0) {
                iNumJaggies = 0;
            }

            savepoints = null;
            counter = 20 + iNumJaggies * 3;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(countsupport._className, "GetDISMFixCount",
                    new RendererException("Failed inside GetDISMFixCount", exc));
            } else {
                throw exc;
            }
        }
        return counter;
    }

}
