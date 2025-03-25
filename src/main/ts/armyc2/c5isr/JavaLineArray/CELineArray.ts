import { type int } from "../graphics2d/BasicTypes";
import { arraysupport } from "../JavaLineArray/arraysupport"
import { Channels } from "../JavaLineArray/Channels"
import { countsupport } from "../JavaLineArray/countsupport"
import { flot } from "../JavaLineArray/flot"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"

/**
 * A class for the interface between the points calculation CELineArray and
 * the tactical renderer.
 *
 *
 */
export class CELineArray {
    private static readonly _className: string = "CELineArray";
    /**
    * public function to return the line count required for all of the symbols
    *
    * @param plArrayOfLongs the client points as an array of POINT2 in pixels.
    * @param lElements the number of client points.
    * @param ChannelWidth the chanel width in pixels
    *
    * @return the number of points which will be required for the symbol.
    */
    public static CGetLineCountDouble(tg: TGLight,
        plArrayOfLongs: number[],
        lElements: int, //number of points
        ChannelWidth: int): int {
        let lResult: int = 0;
        try {
            //declarations
            let lPtrcntr: int = 0;
            let lLowerFlotCount: int = 0;
            let lUpperFlotCount: int = 0;
            let pLinePoints: POINT2[] = new Array<POINT2>(lElements);
            let pLowerLinePoints: POINT2[] = new Array<POINT2>(lElements);
            let
                pUpperLinePoints: POINT2[] = new Array<POINT2>(lElements);
            let
                pUpperLowerLinePoints: POINT2[] = new Array<POINT2>(2 * lElements + 2);
            let i: number = 0;
            //end declarations

            if (lElements <= 0) {
                return -1;
            }

            lineutility.InitializePOINT2Array(pLinePoints);
            lineutility.InitializePOINT2Array(pUpperLinePoints);
            lineutility.InitializePOINT2Array(pLowerLinePoints);
            for (i = 0; i < lElements; i++) {
                pLinePoints[i].x = plArrayOfLongs[lPtrcntr];
                lPtrcntr++;
                pLinePoints[i].y = plArrayOfLongs[lPtrcntr];
                lPtrcntr++;
            }
            for (i = 0; i < lElements; i++) {
                pLowerLinePoints[i] = new POINT2(pLinePoints[i]);
                pUpperLinePoints[i] = new POINT2(pLinePoints[i]);
            }

            switch (tg.get_LineType()) {
                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    lResult = 2 * lElements;
                    break;
                }

                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.AIRAOA:
                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT: {
                    //points for these need not be bounded
                    //they have an extra 8 points for the arrowhead
                    lResult = 2 * lElements + 8;
                    break;
                }

                case TacticalLines.CATK: {
                    lResult = 2 * lElements + 8;
                    break;
                }

                case TacticalLines.CATKBYFIRE: {
                    lResult = 2 * lElements + 17;
                    break;
                }

                case TacticalLines.AAAAA: {
                    lResult = 2 * lElements + 19;
                    break;
                }

                case TacticalLines.LC: {
                    pUpperLinePoints = Channels.GetChannelArray2Double(1, pUpperLinePoints, 1, lElements, tg.get_LineType(), ChannelWidth);
                    pLowerLinePoints = Channels.GetChannelArray2Double(1, pLowerLinePoints, 0, lElements, tg.get_LineType(), ChannelWidth);
                    lUpperFlotCount = flot.GetFlotCountDouble(pUpperLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), lElements);
                    lLowerFlotCount = flot.GetFlotCountDouble(pLowerLinePoints, arraysupport.getScaledSize(20, tg.get_LineThickness()), lElements);
                    lResult = lUpperFlotCount + lLowerFlotCount;
                    break;
                }

                default: {
                    //call GetCountersDouble for the remaining line types.
                    lResult = countsupport.GetCountersDouble(tg, lElements, pLinePoints, null);
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(CELineArray._className, "CGetLineCountDouble",
                    new RendererException("Failed inside CGetLineCount " + tg.get_LineType().toString(), exc));
            } else {
                throw exc;
            }
        }
        return (lResult);
    }
    /**
     * Return true is the line type is a channel type
     * @param lineType line type
     * @return
     */
    public static CIsChannel(lineType: int): int {
        let lResult: int = 0;
        try {
            switch (lineType) {
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.LC:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.MAIN:
                case TacticalLines.MAIN_STRAIGHT:
                case TacticalLines.SPT:
                case TacticalLines.SPT_STRAIGHT:
                case TacticalLines.UNSP:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE:
                case TacticalLines.CHANNEL:
                case TacticalLines.CHANNEL_FLARED:
                case TacticalLines.CHANNEL_DASHED: {
                    lResult = 1;
                    break;
                }

                default: {
                    lResult = 0;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(CELineArray._className, "CIsChannel",
                    new RendererException("Failed inside CIsChannel " + lineType.toString(), exc));
            } else {
                throw exc;
            }
        }
        return lResult;
    }
    private static _client: string = "";
    public static setClient(value: string): void {
        CELineArray._client = value;
        Channels.setClient(value);
    }
    public static getClient(): string {
        return CELineArray._client;
    }
    //    public static void setMinLength(double value)
    //    {
    //        DISMSupport.setMinLength(value);
    //        arraysupport.setMinLength(value);
    //        countsupport.setMinLength(value);
    //        return;
    //    }
}
