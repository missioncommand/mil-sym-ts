import {type double, type int } from "../graphics2d/BasicTypes";

import { BasicStroke } from "../graphics2d/BasicStroke"
import { Graphics2D } from "../graphics2d/Graphics2D"
import { Line2D } from "../graphics2d/Line2D"
import { Point2D } from "../graphics2d/Point2D"
import { Polygon } from "../graphics2d/Polygon"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { TexturePaint } from "../graphics2d/TexturePaint"
import { arraysupport } from "../JavaLineArray/arraysupport"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { mdlGeodesic } from "../JavaTacticalRenderer/mdlGeodesic"
import { P1 } from "../JavaTacticalRenderer/P1"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { Color } from "../renderer/utilities/Color"
import { DrawRules } from "../renderer/utilities/DrawRules"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { MSInfo } from "../renderer/utilities/MSInfo"
import { MSLookup } from "../renderer/utilities/MSLookup"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererUtilities } from "../renderer/utilities/RendererUtilities"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { clsRenderer } from "../RenderMultipoints/clsRenderer"
import { clsUtility as renderMPUtility } from "../RenderMultipoints/clsUtility";
import { clsMETOC } from "./clsMETOC";


/**
 * A general utility class for the tactical renderer
 *
 */
export class clsUtility {
    private static readonly _className: string = "clsUtility";
    protected static POINT2ToPoint2D(pt2: POINT2): Point2D | null {
        if (pt2 == null) {
            return null;
        }

        let x: double = pt2.x;
        let y: double = pt2.y;
        let pt: Point2D = new Point2D(x, y);
        return pt;
    }
    /**
     * returns true if the line segments are all outside the bounds
     * @param tg the tactical graphic
     * @param clipBounds the pixels based clip bounds
     * @return 
     */
    public static linesOutsideClipBounds(tg: TGLight,
        clipBounds: Rectangle2D): boolean {
        try {
            let isAutoshape: boolean = clsUtility.isAutoshape(tg);
            if (isAutoshape) {
                return false;
            }


            let xmin: double = clipBounds.getMinX();
            let xmax: double = clipBounds.getMaxX();
            let ymin: double = clipBounds.getMinY();
            let ymax: double = clipBounds.getMaxY();
            let j: int = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let boundsEdge: Line2D;
            let ptsLine: Line2D;
            let n: int = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                pt0 = tg.Pixels[j];
                pt1 = tg.Pixels[j + 1];

                //if either point is inside the bounds return false
                if (clipBounds.contains(pt0.x, pt0.y)) {

                    return false;
                }

                if (clipBounds.contains(pt1.x, pt1.y)) {

                    return false;
                }


                ptsLine = new Line2D(pt0.x, pt0.y, pt1.x, pt1.y);

                //if the pt0-pt1 line intersects any clip bounds edge then return false
                boundsEdge = new Line2D(xmin, ymin, xmax, ymin);
                if (ptsLine.intersectsLine(boundsEdge)) {

                    return false;
                }


                boundsEdge = new Line2D(xmax, ymin, xmax, ymax);
                if (ptsLine.intersectsLine(boundsEdge)) {

                    return false;
                }


                boundsEdge = new Line2D(xmax, ymax, xmin, ymax);
                if (ptsLine.intersectsLine(boundsEdge)) {

                    return false;
                }


                boundsEdge = new Line2D(xmin, ymax, xmin, ymin);
                if (ptsLine.intersectsLine(boundsEdge)) {

                    return false;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "linesOutsideClipBounds",
                    new RendererException("Failed inside linesOutsideClipBounds", exc));
            } else {
                throw exc;
            }
        }
        return true;
    }
    /**
     * Returns the minimum client points needed for the symbol
     * @param lineType line type
     * @return minimum number of clients required to render the line
     * @deprecated use MSInfo.getMinPointCount()
     */
    public static GetMinPoints(lineType: int): int {
        let result: int = -1;
        switch (lineType) {
            case TacticalLines.RECTANGULAR:
            case TacticalLines.CUED_ACQUISITION:
            case TacticalLines.CIRCULAR:
            case TacticalLines.BDZ:
            case TacticalLines.FSA_CIRCULAR:
            case TacticalLines.NOTACK:
            case TacticalLines.FFA_CIRCULAR:
            case TacticalLines.NFA_CIRCULAR:
            case TacticalLines.RFA_CIRCULAR:
            case TacticalLines.ACA_CIRCULAR:
            case TacticalLines.PAA_CIRCULAR:
            case TacticalLines.ATI_CIRCULAR:
            case TacticalLines.CFFZ_CIRCULAR:
            case TacticalLines.SENSOR_CIRCULAR:
            case TacticalLines.CENSOR_CIRCULAR:
            case TacticalLines.DA_CIRCULAR:
            case TacticalLines.CFZ_CIRCULAR:
            case TacticalLines.ZOR_CIRCULAR:
            case TacticalLines.TBA_CIRCULAR:
            case TacticalLines.TVAR_CIRCULAR:
            case TacticalLines.KILLBOXBLUE_CIRCULAR:
            case TacticalLines.KILLBOXPURPLE_CIRCULAR:
            case TacticalLines.LAUNCH_AREA:
            case TacticalLines.DEFENDED_AREA_CIRCULAR:
            case TacticalLines.SHIP_AOI_CIRCULAR:
            case TacticalLines.RANGE_FAN:
            case TacticalLines.RANGE_FAN_SECTOR:
            case TacticalLines.RADAR_SEARCH: {
                result = 1;
                break;
            }

            case TacticalLines.PAA_RECTANGULAR:
            case TacticalLines.FSA_RECTANGULAR:
            case TacticalLines.SHIP_AOI_RECTANGULAR:
            case TacticalLines.DEFENDED_AREA_RECTANGULAR:
            case TacticalLines.FFA_RECTANGULAR:
            case TacticalLines.RFA_RECTANGULAR:
            case TacticalLines.NFA_RECTANGULAR:
            case TacticalLines.ACA_RECTANGULAR:
            case TacticalLines.ATI_RECTANGULAR:
            case TacticalLines.CFFZ_RECTANGULAR:
            case TacticalLines.SENSOR_RECTANGULAR:
            case TacticalLines.CENSOR_RECTANGULAR:
            case TacticalLines.DA_RECTANGULAR:
            case TacticalLines.CFZ_RECTANGULAR:
            case TacticalLines.ZOR_RECTANGULAR:
            case TacticalLines.TBA_RECTANGULAR:
            case TacticalLines.TVAR_RECTANGULAR:
            case TacticalLines.KILLBOXBLUE_RECTANGULAR:
            case TacticalLines.KILLBOXPURPLE_RECTANGULAR: {
                result = 2; //was 3
                break;
            }

            case TacticalLines.SPTBYFIRE:
            case TacticalLines.RIP:
            case TacticalLines.GAP:
            case TacticalLines.ASLTXING:
            case TacticalLines.MSDZ: {
                result = 4;
                break;
            }

            case TacticalLines.BYPASS:
            case TacticalLines.BLOCK:
            case TacticalLines.BREACH:
            case TacticalLines.CANALIZE:
            case TacticalLines.CLEAR:
            case TacticalLines.CONTAIN:
            case TacticalLines.DELAY:
            case TacticalLines.DISRUPT:
            case TacticalLines.PENETRATE:
            case TacticalLines.RETIRE:
            case TacticalLines.FPOL:
            case TacticalLines.RPOL:
            case TacticalLines.SCREEN:
            case TacticalLines.COVER:
            case TacticalLines.GUARD:
            case TacticalLines.SEIZE:
            case TacticalLines.WITHDRAW:
            case TacticalLines.WDRAWUP:
            //non task autoshapes
            case TacticalLines.SARA:
            case TacticalLines.PDF:
            case TacticalLines.IL:
            case TacticalLines.ATKBYFIRE:
            case TacticalLines.AMBUSH:
            case TacticalLines.RELEASE:
            case TacticalLines.HOL:
            case TacticalLines.BHL:
            case TacticalLines.MNFLDBLK:
            case TacticalLines.MNFLDDIS:
            case TacticalLines.TURN:
            case TacticalLines.PLANNED:
            case TacticalLines.ESR1:
            case TacticalLines.ESR2:
            case TacticalLines.ROADBLK:
            case TacticalLines.TRIP:
            case TacticalLines.EASY:
            case TacticalLines.BYDIF:
            case TacticalLines.BYIMP:
            case TacticalLines.FORDSITE:
            case TacticalLines.FORDIF:
            //METOCs
            case TacticalLines.IFR:
            case TacticalLines.MVFR:
            case TacticalLines.TURBULENCE:
            case TacticalLines.ICING:
            case TacticalLines.NON_CONVECTIVE:
            case TacticalLines.CONVECTIVE:
            case TacticalLines.FROZEN:
            case TacticalLines.THUNDERSTORMS:
            case TacticalLines.FOG:
            case TacticalLines.SAND:
            case TacticalLines.FREEFORM:
            case TacticalLines.DEPTH_AREA:
            case TacticalLines.ISLAND:
            case TacticalLines.BEACH:
            case TacticalLines.WATER:
            case TacticalLines.FISH_TRAPS:
            case TacticalLines.SWEPT_AREA:
            case TacticalLines.OIL_RIG_FIELD:
            case TacticalLines.FOUL_GROUND:
            case TacticalLines.KELP:
            case TacticalLines.BEACH_SLOPE_MODERATE:
            case TacticalLines.BEACH_SLOPE_STEEP:
            case TacticalLines.ANCHORAGE_AREA:
            case TacticalLines.TRAINING_AREA:
            case TacticalLines.FORESHORE_AREA:
            case TacticalLines.DRYDOCK:
            case TacticalLines.LOADING_FACILITY_AREA:
            case TacticalLines.PERCHES:
            case TacticalLines.UNDERWATER_HAZARD:
            case TacticalLines.DISCOLORED_WATER:
            case TacticalLines.BEACH_SLOPE_FLAT:
            case TacticalLines.BEACH_SLOPE_GENTLE:
            case TacticalLines.MARITIME_AREA:
            case TacticalLines.OPERATOR_DEFINED:
            case TacticalLines.SUBMERGED_CRIB:
            case TacticalLines.VDR_LEVEL_12:
            case TacticalLines.VDR_LEVEL_23:
            case TacticalLines.VDR_LEVEL_34:
            case TacticalLines.VDR_LEVEL_45:
            case TacticalLines.VDR_LEVEL_56:
            case TacticalLines.VDR_LEVEL_67:
            case TacticalLines.VDR_LEVEL_78:
            case TacticalLines.VDR_LEVEL_89:
            case TacticalLines.VDR_LEVEL_910:
            case TacticalLines.SOLID_ROCK:
            case TacticalLines.CLAY:
            case TacticalLines.VERY_COARSE_SAND:
            case TacticalLines.COARSE_SAND:
            case TacticalLines.MEDIUM_SAND:
            case TacticalLines.FINE_SAND:
            case TacticalLines.VERY_FINE_SAND:
            case TacticalLines.VERY_FINE_SILT:
            case TacticalLines.FINE_SILT:
            case TacticalLines.MEDIUM_SILT:
            case TacticalLines.COARSE_SILT:
            case TacticalLines.BOULDERS:
            case TacticalLines.OYSTER_SHELLS:
            case TacticalLines.PEBBLES:
            case TacticalLines.SAND_AND_SHELLS:
            case TacticalLines.BOTTOM_SEDIMENTS_LAND:
            case TacticalLines.BOTTOM_SEDIMENTS_NO_DATA:
            case TacticalLines.BOTTOM_ROUGHNESS_SMOOTH:
            case TacticalLines.BOTTOM_ROUGHNESS_MODERATE:
            case TacticalLines.BOTTOM_ROUGHNESS_ROUGH:
            case TacticalLines.CLUTTER_LOW:
            case TacticalLines.CLUTTER_MEDIUM:
            case TacticalLines.CLUTTER_HIGH:
            case TacticalLines.IMPACT_BURIAL_0:
            case TacticalLines.IMPACT_BURIAL_10:
            case TacticalLines.IMPACT_BURIAL_20:
            case TacticalLines.IMPACT_BURIAL_75:
            case TacticalLines.IMPACT_BURIAL_100:
            case TacticalLines.BOTTOM_CATEGORY_A:
            case TacticalLines.BOTTOM_CATEGORY_B:
            case TacticalLines.BOTTOM_CATEGORY_C:
            case TacticalLines.BOTTOM_TYPE_A1:
            case TacticalLines.BOTTOM_TYPE_A2:
            case TacticalLines.BOTTOM_TYPE_A3:
            case TacticalLines.BOTTOM_TYPE_B1:
            case TacticalLines.BOTTOM_TYPE_B2:
            case TacticalLines.BOTTOM_TYPE_B3:
            case TacticalLines.BOTTOM_TYPE_C1:
            case TacticalLines.BOTTOM_TYPE_C2:
            case TacticalLines.BOTTOM_TYPE_C3: {
                result = 3;
                break;
            }

            case TacticalLines.MRR:
            case TacticalLines.SL:
            case TacticalLines.TC:
            case TacticalLines.SC:
            case TacticalLines.LLTR:
            case TacticalLines.DIRATKAIR:
            case TacticalLines.ABATIS:
            case TacticalLines.CLUSTER:
            case TacticalLines.MNFLDFIX:
            case TacticalLines.FERRY:
            case TacticalLines.MFLANE:
            case TacticalLines.RAFT:
            case TacticalLines.FOXHOLE:
            case TacticalLines.LINTGT:
            case TacticalLines.LINTGTS:
            case TacticalLines.FPF:
            case TacticalLines.CONVOY:
            case TacticalLines.HCONVOY: {
                result = 2;
                break;
            }

            default: {
                result = 2;
                break;
            }

        }
        if (clsUtility.isClosedPolygon(lineType)) {
            result = 3;
        }
        //add code for change 1 areas
        return result;
    }
    /**
     * @param linetype line type
     * @return true if the line is a closed area
     */
    public static isClosedPolygon(linetype: int): boolean {
        let result: boolean = false;
        switch (linetype) {
            case TacticalLines.AT:
            case TacticalLines.DEPICT:
            case TacticalLines.DZ:
            case TacticalLines.MINED:
            case TacticalLines.FENCED:
            case TacticalLines.UXO:
            case TacticalLines.ROZ:
            case TacticalLines.AARROZ:
            case TacticalLines.UAROZ:
            case TacticalLines.WEZ:
            case TacticalLines.FEZ:
            case TacticalLines.JEZ:
            case TacticalLines.FAADZ:
            case TacticalLines.HIDACZ:
            case TacticalLines.MEZ:
            case TacticalLines.LOMEZ:
            case TacticalLines.HIMEZ:
            case TacticalLines.WFZ:
            case TacticalLines.PNO:
            case TacticalLines.BATTLE:
            case TacticalLines.EA:
            case TacticalLines.EZ:
            case TacticalLines.LZ:
            case TacticalLines.PZ:
            case TacticalLines.GENERAL:
            case TacticalLines.JTAA:
            case TacticalLines.SAA:
            case TacticalLines.SGAA:
            case TacticalLines.ASSAULT:
            case TacticalLines.ATKPOS:
            case TacticalLines.OBJ:
            case TacticalLines.AO:
            case TacticalLines.AIRHEAD:
            case TacticalLines.NAI:
            case TacticalLines.TAI:
            case TacticalLines.BASE_CAMP_REVD:
            case TacticalLines.BASE_CAMP:
            case TacticalLines.GUERILLA_BASE_REVD:
            case TacticalLines.GUERILLA_BASE:
            case TacticalLines.GENERIC_AREA:
            case TacticalLines.OBSFAREA:
            case TacticalLines.OBSAREA:
            case TacticalLines.ZONE:
            case TacticalLines.STRONG:
            case TacticalLines.DRCL:
            case TacticalLines.FSA:
            case TacticalLines.ACA:
            case TacticalLines.ASSY:
            case TacticalLines.BSA:
            case TacticalLines.NFA:
            case TacticalLines.RFA:
            case TacticalLines.FARP:
            case TacticalLines.AIRFIELD:
            case TacticalLines.LAA:
            case TacticalLines.BOMB:
            case TacticalLines.FFA:
            case TacticalLines.SMOKE:
            case TacticalLines.PAA:
            case TacticalLines.ENCIRCLE:
            case TacticalLines.DHA_REVD:
            case TacticalLines.DHA:
            case TacticalLines.EPW:
            case TacticalLines.RHA:
            case TacticalLines.DSA:
            case TacticalLines.CSA:
            case TacticalLines.RSA:
            case TacticalLines.FORT_REVD:
            case TacticalLines.FORT:
            case TacticalLines.PEN:
            case TacticalLines.BIO:
            case TacticalLines.NUC:
            case TacticalLines.RAD:
            case TacticalLines.CHEM:
            case TacticalLines.SERIES:
            case TacticalLines.ATI:
            case TacticalLines.TBA:
            case TacticalLines.TVAR:
            case TacticalLines.CFFZ:
            case TacticalLines.CENSOR:
            case TacticalLines.SENSOR:
            case TacticalLines.ZOR:
            case TacticalLines.DA:
            case TacticalLines.CFZ:
            case TacticalLines.KILLBOXBLUE:
            case TacticalLines.KILLBOXPURPLE:
            //METOCs
            case TacticalLines.IFR:
            case TacticalLines.MVFR:
            case TacticalLines.TURBULENCE:
            case TacticalLines.ICING:
            case TacticalLines.NON_CONVECTIVE:
            case TacticalLines.CONVECTIVE:
            case TacticalLines.FROZEN:
            case TacticalLines.THUNDERSTORMS:
            case TacticalLines.FOG:
            case TacticalLines.SAND:
            case TacticalLines.FREEFORM:
            case TacticalLines.DEPTH_AREA:
            case TacticalLines.ISLAND:
            case TacticalLines.BEACH:
            case TacticalLines.WATER:
            case TacticalLines.FISH_TRAPS:
            case TacticalLines.SWEPT_AREA:
            case TacticalLines.OIL_RIG_FIELD:
            case TacticalLines.FOUL_GROUND:
            case TacticalLines.KELP:
            case TacticalLines.BEACH_SLOPE_MODERATE:
            case TacticalLines.BEACH_SLOPE_STEEP:
            case TacticalLines.ANCHORAGE_AREA:
            case TacticalLines.TRAINING_AREA:
            case TacticalLines.FORESHORE_AREA:
            case TacticalLines.DRYDOCK:
            case TacticalLines.LOADING_FACILITY_AREA:
            case TacticalLines.PERCHES:
            case TacticalLines.UNDERWATER_HAZARD:
            case TacticalLines.DISCOLORED_WATER:
            case TacticalLines.BEACH_SLOPE_FLAT:
            case TacticalLines.BEACH_SLOPE_GENTLE:
            case TacticalLines.MARITIME_AREA:
            case TacticalLines.OPERATOR_DEFINED:
            case TacticalLines.SUBMERGED_CRIB:
            case TacticalLines.VDR_LEVEL_12:
            case TacticalLines.VDR_LEVEL_23:
            case TacticalLines.VDR_LEVEL_34:
            case TacticalLines.VDR_LEVEL_45:
            case TacticalLines.VDR_LEVEL_56:
            case TacticalLines.VDR_LEVEL_67:
            case TacticalLines.VDR_LEVEL_78:
            case TacticalLines.VDR_LEVEL_89:
            case TacticalLines.VDR_LEVEL_910:
            case TacticalLines.SOLID_ROCK:
            case TacticalLines.CLAY:
            case TacticalLines.VERY_COARSE_SAND:
            case TacticalLines.COARSE_SAND:
            case TacticalLines.MEDIUM_SAND:
            case TacticalLines.FINE_SAND:
            case TacticalLines.VERY_FINE_SAND:
            case TacticalLines.VERY_FINE_SILT:
            case TacticalLines.FINE_SILT:
            case TacticalLines.MEDIUM_SILT:
            case TacticalLines.COARSE_SILT:
            case TacticalLines.BOULDERS:
            case TacticalLines.OYSTER_SHELLS:
            case TacticalLines.PEBBLES:
            case TacticalLines.SAND_AND_SHELLS:
            case TacticalLines.BOTTOM_SEDIMENTS_LAND:
            case TacticalLines.BOTTOM_SEDIMENTS_NO_DATA:
            case TacticalLines.BOTTOM_ROUGHNESS_SMOOTH:
            case TacticalLines.BOTTOM_ROUGHNESS_MODERATE:
            case TacticalLines.BOTTOM_ROUGHNESS_ROUGH:
            case TacticalLines.CLUTTER_LOW:
            case TacticalLines.CLUTTER_MEDIUM:
            case TacticalLines.CLUTTER_HIGH:
            case TacticalLines.IMPACT_BURIAL_0:
            case TacticalLines.IMPACT_BURIAL_10:
            case TacticalLines.IMPACT_BURIAL_20:
            case TacticalLines.IMPACT_BURIAL_75:
            case TacticalLines.IMPACT_BURIAL_100:
            case TacticalLines.BOTTOM_CATEGORY_A:
            case TacticalLines.BOTTOM_CATEGORY_B:
            case TacticalLines.BOTTOM_CATEGORY_C:
            case TacticalLines.BOTTOM_TYPE_A1:
            case TacticalLines.BOTTOM_TYPE_A2:
            case TacticalLines.BOTTOM_TYPE_A3:
            case TacticalLines.BOTTOM_TYPE_B1:
            case TacticalLines.BOTTOM_TYPE_B2:
            case TacticalLines.BOTTOM_TYPE_B3:
            case TacticalLines.BOTTOM_TYPE_C1:
            case TacticalLines.BOTTOM_TYPE_C2:
            case TacticalLines.BOTTOM_TYPE_C3:
            case TacticalLines.TGMF: {
                result = true;
                break;
            }

            default: {
                break;
            }

        }
        return result;
    }

    /**
     * Closes the polygon for areas
     * @param Pixels the client points
     */
    public static ClosePolygon(Pixels: Array<POINT2>): void {
        try {
            let pt0: POINT2 = Pixels[0];
            let pt1: POINT2 = Pixels[Pixels.length - 1];
            if (pt0.x !== pt1.x || pt0.y !== pt1.y) {
                Pixels.push(new POINT2(pt0.x, pt0.y));
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "ClosePolygon",
                    new RendererException("Failed inside ClosePolygon", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * for change 1 symbol the W/w1 modifiers run too close to the symbol outline
     * so it shifts the line along the line away from the edge
     * @param p1
     * @param p2
     * @param shift
     */
    public static shiftModifiersLeft(p1: POINT2, p2: POINT2, shift: double): void {
        try {
            let pt1: POINT2 = new POINT2(p1);
            let pt2: POINT2 = new POINT2(p2);
            let dist: double = lineutility.CalcDistanceDouble(pt1, pt2);
            if (pt1.x < pt2.x || (pt1.x === pt2.x && pt1.y < pt2.y)) {
                pt1 = lineutility.ExtendAlongLineDouble(pt2, pt1, dist + shift);
                pt2 = lineutility.ExtendAlongLineDouble(pt1, pt2, dist - shift);
            }
            else {
                pt1 = lineutility.ExtendAlongLineDouble(pt2, pt1, dist - shift);
                pt2 = lineutility.ExtendAlongLineDouble(pt1, pt2, dist + shift);
            }
            p1.x = pt1.x;
            p1.y = pt1.y;
            p2.x = pt2.x;
            p2.y = pt2.y;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "shiftModifiersLeft",
                    new RendererException("Failed inside shiftModifiersLeft", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Overrides shape properties for symbols based on Mil-Std-2525
     * @param tg
     * @param shape
     */
    protected static ResolveModifierShape(tg: TGLight, shape: Shape2): void {
        try {
            //shape style was set by CELineArray and takes precedence
            //whenever it is set
            let shapeStyle: int = shape.get_Style();
            let lineStyle: int = tg.get_LineStyle();
            let lineType: int = tg.get_LineType();
            let hasFill: boolean = clsUtility.LinesWithFill(lineType);
            let bolMETOC: int = clsMETOC.IsWeather(tg.get_SymbolId());
            if (bolMETOC > 0) {

                return;
            }

            let fillStyle: int = 0;
            //for some of these the style must be dashed
            switch (tg.get_LineType()) {
                case TacticalLines.NFA:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.BIO:
                case TacticalLines.NUC:
                case TacticalLines.CHEM:
                case TacticalLines.RAD:
                case TacticalLines.WFZ: {
                    //case TacticalLines.OBSAREA:
                    fillStyle = 3;
                    if (tg.get_UseHatchFill()) {

                        fillStyle = 0;
                    }

                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.set_Style(tg.get_LineStyle());
                        shape.setLineColor(tg.get_LineColor());
                        shape.setFillStyle(fillStyle /*GraphicProperties.FILL_TYPE_RIGHT_SLANTS*/);//was 3
                        shape.setFillColor(tg.get_FillColor());
                    }
                    break;
                }

                case TacticalLines.OBSAREA: {
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.set_Style(tg.get_LineStyle());
                        shape.setLineColor(tg.get_LineColor());
                        shape.setFillStyle(0 /*GraphicProperties.FILL_TYPE_RIGHT_SLANTS*/);
                        shape.setFillColor(tg.get_FillColor());
                    }
                    break;
                }

                case TacticalLines.LAA: {
                    fillStyle = 2;
                    if (tg.get_UseHatchFill()) {

                        fillStyle = 0;
                    }

                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.set_Style(tg.get_LineStyle());
                        shape.setLineColor(tg.get_LineColor());
                        shape.setFillStyle(fillStyle /*GraphicProperties.FILL_TYPE_LEFT_SLANTS*/);//was 2
                        shape.setFillColor(tg.get_FillColor());
                    }
                    break;
                }

                case TacticalLines.DIRATKAIR:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.SARA:
                case TacticalLines.FOLSP:
                case TacticalLines.FERRY:
                case TacticalLines.MNFLDFIX:
                case TacticalLines.TURN:
                case TacticalLines.MNFLDDIS:
                case TacticalLines.EASY:
                case TacticalLines.BYDIF:
                case TacticalLines.BYIMP: {
                    tg.set_lineCap(BasicStroke.CAP_BUTT);
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_FILL) {
                        shape.setFillStyle(1 /*GraphicProperties.FILL_TYPE_SOLID*/);
                        shape.setFillColor(tg.get_LineColor());
                    }
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.set_Style(tg.get_LineStyle());
                        shape.setLineColor(tg.get_LineColor());
                    }
                    break;
                }

                case TacticalLines.CLUSTER:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.PLD:
                case TacticalLines.PLANNED:
                case TacticalLines.CFL:
                case TacticalLines.FORDSITE:
                case TacticalLines.ACOUSTIC_AMB: {
                    //any shape for these symbols is dashed
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.set_Style(1 /*GraphicProperties.LINE_TYPE_DASHED*/);
                        shape.setLineColor(tg.get_LineColor());
                    }
                    break;
                }

                case TacticalLines.PNO: { //always dashed
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.set_Style(1 /*GraphicProperties.LINE_TYPE_DASHED*/);
                        shape.setLineColor(tg.get_LineColor());
                        shape.setFillColor(tg.get_FillColor());
                        shape.setFillStyle(tg.get_FillStyle());
                    }
                    break;
                }

                case TacticalLines.FOLLA:
                case TacticalLines.ESR1:
                case TacticalLines.FORDIF: {
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        shape.setLineColor(tg.get_LineColor());
                        if (shapeStyle !== lineStyle) {
                            if (shapeStyle !== 1 /*GraphicProperties.LINE_TYPE_DASHED*/) {
                                shape.set_Style(lineStyle);
                            }
                        }
                    }
                    break;
                }

                default: {
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_FILL) {
                        shape.setFillStyle(tg.get_FillStyle());
                        shape.setFillColor(tg.get_FillColor());
                    }
                    if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                        if (lineType !== TacticalLines.LC) {
                            shape.setLineColor(tg.get_LineColor());
                        } else {
                            clsUtility.SetLCColor(tg, shape);
                        }
                        shape.set_Style(lineStyle);
                        if (hasFill || clsUtility.isClosedPolygon(lineType) || clsUtility.IsChange1Area(lineType)) {
                            switch (lineType) {
                                case TacticalLines.RANGE_FAN:
                                case TacticalLines.RANGE_FAN_SECTOR:
                                case TacticalLines.RADAR_SEARCH: {
                                    shape.setFillColor(null);
                                    break;
                                }

                                default: {
                                    shape.setFillStyle(tg.get_FillStyle());
                                    shape.setFillColor(tg.get_FillColor());
                                    break;
                                }

                            }
                        }
                    }
                    break;
                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "ResolveModifierShape",
                    new RendererException("Failed inside ResolveModifierShape", exc));
            } else {
                throw exc;
            }
        }
    }
    public static GetOpaqueColor(color: Color): Color {
        let r: int = color.getRed();
        let g: int = color.getGreen();
        let b: int = color.getBlue();
        return new Color(r, g, b);
    }
    /**
     * These lines allow fill
     * @param linetype
     * @return
     */
    public static LinesWithFill(linetype: int): boolean {
        let result: boolean = false;
        try {
            switch (linetype) {
                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET:
                case TacticalLines.CFL:
                case TacticalLines.DIRATKAIR:
                case TacticalLines.BOUNDARY:
                case TacticalLines.ISOLATE:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH:
                case TacticalLines.OCCUPY:
                case TacticalLines.RETAIN:
                case TacticalLines.SECURE:
                case TacticalLines.FLOT:
                case TacticalLines.LC:
                case TacticalLines.PL:
                case TacticalLines.FEBA:
                case TacticalLines.LL:
                case TacticalLines.EWL:
                //                case TacticalLines.AC:
                //                case TacticalLines.SAAFR:
                case TacticalLines.DIRATKGND:
                case TacticalLines.DIRATKSPT:
                case TacticalLines.FCL:
                case TacticalLines.HOLD:
                case TacticalLines.BRDGHD:
                case TacticalLines.HOLD_GE:
                case TacticalLines.BRDGHD_GE:
                case TacticalLines.LOA:
                case TacticalLines.LOD:
                case TacticalLines.LDLC:
                case TacticalLines.RELEASE:
                case TacticalLines.HOL:
                case TacticalLines.BHL:
                case TacticalLines.LINE:
                case TacticalLines.ABATIS:
                case TacticalLines.ATDITCH:
                case TacticalLines.ATWALL:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.UNSP:
                case TacticalLines.PLD:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE:
                case TacticalLines.FORTL:
                case TacticalLines.LINTGT:
                case TacticalLines.LINTGTS:
                case TacticalLines.FSCL:
                case TacticalLines.BCL_REVD:
                case TacticalLines.BCL:
                case TacticalLines.ICL:
                case TacticalLines.IFF_OFF:
                case TacticalLines.IFF_ON:
                case TacticalLines.GENERIC_LINE:
                case TacticalLines.NFL:
                case TacticalLines.MFP:
                case TacticalLines.RFL:
                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY:
                case TacticalLines.MSR:
                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.ROUTE_ALT: {
                    result = true;
                    break;
                }

                default: {
                    result = false;
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "LinesWithFill",
                    new RendererException("Failed inside LinesWithFill", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }
    /**
     * @deprecated
     * if the line color and fill color are the same or very close then we want to
     * tweak the fill color a bit to make the line appear distinct from the fill.
     * @param tg
     */
    public static tweakFillColor(tg: TGLight): void {
        try {
            if (clsUtility.isSameColor(tg.get_LineColor(), tg.get_FillColor()) === false) {

                return;
            }


            let fillColor: Color = tg.get_FillColor();
            let r: int = fillColor.getRed();
            let g: int = fillColor.getGreen();
            let b: int = fillColor.getBlue();
            let alpha: int = fillColor.getAlpha();

            r *= 0.9;
            g *= 0.9;
            b *= 0.9;
            alpha *= 0.8;

            fillColor = new Color(r, g, b, alpha);
            tg.set_FillColor(fillColor);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "tweakFillColor",
                    new RendererException("Failed inside tweakFillColor", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * @deprecated
     * Test to see if two colors are similar
     * @param c1
     * @param c2
     * @return true is same (or similar) color
     */
    public static isSameColor(c1: Color, c2: Color): boolean {
        try {
            if (c1 == null || c2 == null) {

                return true;
            }


            let r1: int = c1.getRed();
            let r2: int = c2.getRed();
            let g1: int = c1.getGreen();
            let g2: int = c2.getGreen();
            let
                b1: int = c1.getBlue();
            let b2: int = c2.getBlue();

            if (Math.abs(r1 - r2) < 5) {

                if (Math.abs(g1 - g2) < 5) {

                    if (Math.abs(b1 - b2) < 5) {

                        return true;
                    }

                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "isSameColor",
                    new RendererException("Failed inside isSameColor", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }
    /**
     * Customer requested routine for setting the stroke dash pattern
     * Scales dash length with line width and DPI
     * @param width
     * @param style
     * @param cap
     * @param join
     * @return
     */
    public static getLineStroke(width: int, style: int, cap: int, join: int): BasicStroke {
        // Some segments are of length 0.1 because the Java2D renderer adds line caps of
        // width/2 size to both ends of the segment when "round" is one of BasicStroke.CAP_ROUND
        // or BasicStroke.CAP_SQUARE. This value is small enough not to affect the
        // stipple bit pattern calculation for the 3d map and still look good on the
        // 2d map.

        // NOTE: The dash arrays below do not supportBasisStroke.CAP_BUTT line capping,
        // although it would be relatively simple to change them such that they would.
        let stroke: BasicStroke;
        try {
            let dashLength: double = 2 * width;
            let dotLength: double = 1;
            let dotSpace: double = 2 * width;
            switch (style) {
                case 0: {//GraphicProperties.LINE_TYPE_SOLID:
                    stroke = new BasicStroke(width, cap, join);
                    break;
                }

                case 1: {//GraphicProperties.LINE_TYPE_DASHED:
                    let dash: number[] = [dashLength, dashLength];
                    stroke = new BasicStroke(width, cap, join, 4, dash, 0);
                    break;
                }

                case 2: {//GraphicProperties.LINE_TYPE_DOTTED:
                    let dot: number[] = [dotLength, dotSpace];
                    stroke = new BasicStroke(width, cap, join, 4, dot, 0);
                    break;
                }

                case 3: {//GraphicProperties.LINE_TYPE_DASHDOT:
                    let dashdot: number[] = [2 * dashLength, dotSpace, dotLength, dotSpace];
                    stroke = new BasicStroke(width, cap, join, 4, dashdot, 0);
                    break;
                }

                case 4: {//GraphicProperties.LINE_TYPE_DASHDOTDOT:
                    let dashdotdot: number[] = [dashLength, dotSpace, dotLength, dotSpace, dotLength, dotSpace];
                    stroke = new BasicStroke(width, cap, join, 4, dashdotdot, 0);
                    break;
                }

                default: {
                    stroke = new BasicStroke(width, cap, join);
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "getLineStroke",
                    new RendererException("Failed inside getLineStroke", exc));
            } else {
                throw exc;
            }
        }
        return stroke;
    }
    /**
     * Sets shape properties based on other properties which were set by JavaLineArray
     * @param tg tactical graphic
     * @param shapes the ShapeInfo array
     */
    public static SetShapeProperties(tg: TGLight, shapes: Array<Shape2>): void {
        try {
            if (shapes == null) {
                return;
            }

            let j: int = 0;
            let shape: Shape2;
            let stroke: BasicStroke;
            let dash: number[];
            let lineThickness: int = tg.get_LineThickness();
            let shapeType: int = -1;
            let lineType: int = tg.get_LineType();
            let hasFill: boolean = clsUtility.LinesWithFill(lineType);
            let isChange1Area: boolean = clsUtility.IsChange1Area(lineType);
            let isClosedPolygon: boolean = clsUtility.isClosedPolygon(lineType);
            //int n=shapes.length;
            //remove air corridors fill shapes if fill is null
            if (tg.get_FillColor() == null) {
                switch (tg.get_LineType()) {
                    case TacticalLines.AC:
                    case TacticalLines.SAAFR:
                    case TacticalLines.MRR:
                    case TacticalLines.SL:
                    case TacticalLines.TC:
                    case TacticalLines.SC:
                    case TacticalLines.LLTR: {
                        shape = shapes[shapes.length - 1];
                        shapes.length = 0; // shapes.clear()
                        shapes.push(shape);
                        break;
                    }

                    case TacticalLines.CATK:
                    case TacticalLines.AIRAOA:
                    case TacticalLines.AAAAA:
                    case TacticalLines.SPT:
                    case TacticalLines.MAIN:
                    case TacticalLines.CATKBYFIRE: {	//80
                        let tempShapes: Array<Shape2> = new Array();
                        for (j = 0; j < shapes.length; j++) {
                            shape = shapes[j];
                            if (shape.getShapeType() !== Shape2.SHAPE_TYPE_FILL) {

                                tempShapes.push(shape);
                            }

                        }
                        shapes = tempShapes;
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            for (j = 0; j < shapes.length; j++) {
                shape = shapes[j];
                if (shape == null || shape.getShape() == null) {
                    continue;
                }

                if (shape.getShapeType() === Shape2.SHAPE_TYPE_FILL) {
                    switch (tg.get_LineType()) {
                        case TacticalLines.DEPTH_AREA: {
                            break;
                        }

                        default: {
                            shape.setFillColor(tg.get_FillColor());
                            break;
                        }

                    }
                }

                //if(lineType != TacticalLines.LEADING_LINE)
                clsUtility.ResolveModifierShape(tg, shape);
                if (lineType === TacticalLines.AIRFIELD) {

                    if (j === 1) {

                        shape.setFillColor(null);
                    }

                }


                shapeType = shape.getShapeType();

                let rect: Rectangle2D;
                let grid: Graphics2D;
                let tp: TexturePaint = tg.get_TexturePaint();

                if (lineThickness === 0) {

                    lineThickness = 1;
                }

                //set the shape with the default properties
                //the switch statement below will override specific properties as needed
                stroke = clsUtility.getLineStroke(lineThickness, shape.get_Style(), tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                if (shape.getShapeType() === Shape2.SHAPE_TYPE_FILL) {
                    stroke = new BasicStroke(lineThickness, BasicStroke.CAP_ROUND, BasicStroke.JOIN_MITER);
                    //shape.setStroke(new BasicStroke(0));
                }
                shape.setStroke(stroke);
            } // end loop over shapes
            if (tg.get_LineType() === TacticalLines.DIRATKAIR) {
                // Make arrowhead and bowtie shapes solid even if tg.get_LineStyle() isn't
                for (let i: int = 2; i < shapes.length; i++) {
                    let arrowHeadShape: Shape2 = shapes[i];
                    arrowHeadShape.set_Style(0);
                    stroke = clsUtility.getLineStroke(lineThickness, 0, tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                    arrowHeadShape.setStroke(stroke);
                }
            } else {
                if (tg.get_LineType() === TacticalLines.DIRATKGND || tg.get_LineType() === TacticalLines.DIRATKSPT) {
                    // Make arrowhead shape solid even if tg.get_LineStyle() isn't
                    let arrowHeadShape: Shape2 = shapes[1];
                    arrowHeadShape.set_Style(0);
                    stroke = clsUtility.getLineStroke(lineThickness, 0, tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                    arrowHeadShape.setStroke(stroke);
                } else {
                    if (tg.get_LineType() === TacticalLines.PDF) {
                        let rectShape: Shape2 = shapes[1];
                        rectShape.set_Style(0);
                        stroke = clsUtility.getLineStroke(lineThickness, 0, tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                        rectShape.setStroke(stroke);
                        rectShape.setFillColor(rectShape.getLineColor());
                    }
                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "SetShapeProperties",
                    new RendererException("Failed inside SetShapeProperties", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Returns a boolean indicating whether the line type is a change 1 area
     * @param lineType the line type
     * @return true if change 1 area
     */
    public static IsChange1Area(lineType: int): boolean {
        try {
            switch (lineType) {
                case TacticalLines.LAUNCH_AREA:
                case TacticalLines.DEFENDED_AREA_CIRCULAR:
                case TacticalLines.SHIP_AOI_CIRCULAR:
                case TacticalLines.RECTANGULAR:
                case TacticalLines.CUED_ACQUISITION:
                case TacticalLines.CIRCULAR:
                case TacticalLines.BDZ:
                case TacticalLines.FSA_CIRCULAR:
                case TacticalLines.NOTACK:
                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.RFA_CIRCULAR:
                case TacticalLines.ACA_CIRCULAR:
                case TacticalLines.PAA_CIRCULAR:
                case TacticalLines.ATI_CIRCULAR:
                case TacticalLines.CFFZ_CIRCULAR:
                case TacticalLines.SENSOR_CIRCULAR:
                case TacticalLines.CENSOR_CIRCULAR:
                case TacticalLines.DA_CIRCULAR:
                case TacticalLines.CFZ_CIRCULAR:
                case TacticalLines.ZOR_CIRCULAR:
                case TacticalLines.TBA_CIRCULAR:
                case TacticalLines.TVAR_CIRCULAR:
                case TacticalLines.KILLBOXBLUE_CIRCULAR:
                case TacticalLines.KILLBOXPURPLE_CIRCULAR:
                case TacticalLines.RANGE_FAN:
                case TacticalLines.RANGE_FAN_FILL:
                case TacticalLines.RANGE_FAN_SECTOR:
                case TacticalLines.RADAR_SEARCH:
                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.ACA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR: {
                    return true;
                }

                default: {
                    return false;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.IsChange1Area");
                ErrorLogger.LogException(clsUtility._className, "IsChange1Area",
                    new RendererException("Failed inside IsChange1Area", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }

    /**
     * Calculates point where two lines intersect.
     * First line defined by pt1, m1.
     * Second line defined by pt2, m2.
     * result will be written to ptIntersect.
     * @param pt1 first line point
     * @param m1 slope of first line
     * @param pt2 second line point
     * @param m2 slope of second line
     * @param ptIntersect OUT - intersection point
     */
    protected static CalcIntersectPt(pt1: POINT2,
        m1: double,
        pt2: POINT2,
        m2: double,
        ptIntersect: POINT2): void {
        try {
            if (m1 === m2) {
                return;
            }

            let x1: double = pt1.x;
            let y1: double = pt1.y;
            let x2: double = pt2.x;
            let y2: double = pt2.y;
            //formula for the intersection of two lines
            let dx2: double = ((y1 - y2 + m1 * x2 - m1 * x1) / (m2 - m1)) as double;
            let x3: double = x2 + dx2;
            let y3: double = (y2 + m2 * dx2) as double;

            ptIntersect.x = x3;
            ptIntersect.y = y3;
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.CalcIntersectPt");
                ErrorLogger.LogException(clsUtility._className, "CalcIntersectPt",
                    new RendererException("Failed inside CalcIntersectPt", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Calculates the channel width in pixels for channel types
     * @param pixels the client points as 2-tuples x,y in pixels
     * @param distanceToChannelPOINT2 OUT - the calculated distance in pixels from the tip of the
     * arrowhead to the back of the arrowhead.
     * @return the channel width in pixels
     */
    public static ChannelWidth(pixels: number[],
        distanceToChannelPOINT2: ref<number[]>): int {
        let width: int = 0;
        try {
            let numPOINT2s: int = pixels.length / 2;
            if (numPOINT2s < 3) {
                return 0;
            }

            let channelWidthPOINT2: POINT2 = new POINT2(0, 0);
            let lastSegmentPt1: POINT2 = new POINT2(0, 0);
            let lastSegmentPt2: POINT2 = new POINT2(0, 0);

            lastSegmentPt1.x = pixels[2 * numPOINT2s - 6] as double;
            lastSegmentPt1.y = pixels[2 * numPOINT2s - 5] as double;
            lastSegmentPt2.x = pixels[2 * numPOINT2s - 4] as double;
            lastSegmentPt2.y = pixels[2 * numPOINT2s - 3] as double;
            channelWidthPOINT2.x = pixels[2 * numPOINT2s - 2] as double;
            channelWidthPOINT2.y = pixels[2 * numPOINT2s - 1] as double;

            let m: ref<number[]> = new ref();
            let m1: double = 0;
            //m1.value=new double[1];
            let distance: double = 0;
            let ptIntersect: POINT2 = new POINT2(0, 0);
            //boolean bolVertical = TrueSlope(lastSegmentPt1, lastSegmentPt2, ref m);
            let bolVertical: boolean = lineutility.CalcTrueSlopeDouble2(lastSegmentPt1, lastSegmentPt2, m);
            if (bolVertical === true && m.value[0] !== 0) {
                m1 = -1 / m.value[0];
                clsUtility.CalcIntersectPt(channelWidthPOINT2, m1, lastSegmentPt2, m.value[0], ptIntersect);
                distance = lineutility.CalcDistanceDouble(channelWidthPOINT2, ptIntersect);
            }
            if (bolVertical === true && m.value[0] === 0) //horizontal segment
            {
                distance = Math.abs(channelWidthPOINT2.y - lastSegmentPt1.y);
            }
            if (bolVertical === false) //vertical segment
            {
                distance = Math.abs(channelWidthPOINT2.x - lastSegmentPt1.x);
                distanceToChannelPOINT2.value = new Array<number>(1);
                distanceToChannelPOINT2.value[0] = distance;
                return distance as int * 4;
            }

            width = distance as int * 8;
            if (width < 2) {
                width = 2;
            }

            let hypotenuse: double = lineutility.CalcDistanceDouble(lastSegmentPt2, channelWidthPOINT2);
            distanceToChannelPOINT2.value = new Array<number>(1);
            distanceToChannelPOINT2.value[0] = Math.sqrt(hypotenuse * hypotenuse - distance * distance);

        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.ChannelWidth");
                ErrorLogger.LogException(clsUtility._className, "ChannelWidth",
                    new RendererException("Failed inside ChannelWidth", exc));
            } else {
                throw exc;
            }
        }
        return width;
    }

    private static InYOrder(pt0: POINT2,
        pt1: POINT2,
        pt2: POINT2): boolean {
        try {
            if (pt0.y <= pt1.y && pt1.y <= pt2.y) {
                return true;
            }

            if (pt2.y <= pt1.y && pt1.y <= pt0.y) {
                return true;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.InYOrder");
                ErrorLogger.LogException(clsUtility._className, "InYOrder",
                    new RendererException("Failed inside InYOrder", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }
    /// <summary>
    /// tests if POINT2s have successively increasing or decreasing x values.
    /// </summary>
    /// <param name="pt0"></param>
    /// <param name="pt1"></param>
    /// <param name="pt2"></param>
    /// <returns>true if POINT2s are in X order</returns>

    private static InXOrder(pt0: POINT2,
        pt1: POINT2,
        pt2: POINT2): boolean {
        try {
            if (pt0.x <= pt1.x && pt1.x <= pt2.x) {
                return true;
            }

            if (pt2.x <= pt1.x && pt1.x <= pt0.x) {
                return true;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.InXOrder");
                ErrorLogger.LogException(clsUtility._className, "InXOrder",
                    new RendererException("Failed inside InXOrder", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }

    /**
     * For each sector calculates left azimuth, right azimuth, min radius, max radius
     * and stuff H2 with the string delimited result. The function is public, called by JavaRendererServer
     * @param tg tactical graphic
     */
    public static GetSectorRadiiFromPoints(tg: TGLight): void {
        try {
            if (tg.get_LineType() === TacticalLines.RANGE_FAN_FILL) {

                return;
            }

            let ptCenter: POINT2 = tg.LatLongs[0];
            let ptLeftMin: POINT2 = new POINT2();
            let ptRightMax: POINT2 = new POINT2();
            let k: int = 0;
            let strLeft: string = "";
            let strRight: string = "";
            let strMin: string = "";
            let strMax: string = "";
            let temp: string = "";
            let nLeft: double = 0;
            let nRight: double = 0;
            let nMin: double = 0;
            let nMax: double = 0;
            //if tg.PointCollection has more than one point
            //we use the points to calculate left,right,min,max
            //and then stuff tg.H2 with the comma delimited string
            let dist: double = 0;
            let a12: ref<number[]> = new ref();
            let a21: ref<number[]> = new ref();
            let numSectors: int = 0;
            if (tg.LatLongs.length > 2) {
                numSectors = (tg.LatLongs.length - 2) / 2;
                for (k = 0; k < numSectors; k++) {
                    //get the sector points
                    ptLeftMin = tg.LatLongs[2 * k + 2];
                    ptRightMax = tg.LatLongs[2 * k + 3];

                    dist = mdlGeodesic.geodesic_distance(ptCenter, ptLeftMin, a12, a21);
                    nLeft = a12.value[0];
                    strLeft = nLeft.toString();

                    nMin = dist;
                    strMin = nMin.toString();

                    dist = mdlGeodesic.geodesic_distance(ptCenter, ptRightMax, a12, a21);
                    nRight = a12.value[0];
                    strRight = nRight.toString();

                    nMax = dist;
                    strMax = nMax.toString();

                    if (k === 0) {
                        temp = strLeft + "," + strRight + "," + strMin + "," + strMax;
                    } else {
                        temp += "," + strLeft + "," + strRight + "," + strMin + "," + strMax;
                    }
                }
                if (temp !== "") {
                    tg.set_LRMM(temp);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.GetSectorRadiiFromPoints");
                ErrorLogger.LogException(clsUtility._className, "GetSectorRadiiFromPoints",
                    new RendererException("Failed inside GetSectorRadiiFromPoints", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Reverses the pixels except for the last point. This is used for
     * the axis of advance type routes. The pixels are 2-tuples x,y
     *
     * @param pixels OUT - Array of client points
     */
    public static ReorderPixels(pixels: number[]): void {
        try {
            let tempPixels: number[];
            //reverse the pixels
            let j: int = 0;
            let x: double = 0;
            let y: double = 0;
            let counter: int = 0;
            let numPoints: int = 0;
            counter = 0;
            numPoints = pixels.length / 2;
            tempPixels = new Array<number>(pixels.length);
            for (j = 0; j < numPoints - 1; j++) {
                x = pixels[pixels.length - 2 * j - 4];
                y = pixels[pixels.length - 2 * j - 3];
                tempPixels[counter] = x;
                tempPixels[counter + 1] = y;
                counter += 2;
            }
            //put the last pixel point into the last temppixels point
            let intPixelSize: int = pixels.length;
            tempPixels[counter] = pixels[intPixelSize - 2];
            tempPixels[counter + 1] = pixels[intPixelSize - 1];
            //stuff the pixels
            let n: int = pixels.length;
            //for (j = 0; j < pixels.length; j++) 
            for (j = 0; j < n; j++) {
                pixels[j] = tempPixels[j];
            }
            //tempPixels = null;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "ReorderPixels",
                    new RendererException("Failed inside ReorderPixels", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * do not allow vertical segments for these, move the point x value by 1 pixel
     * @param tg tactical graphic
     */
    public static FilterVerticalSegments(tg: TGLight): void {
        try {
            switch (tg.get_LineType()) {
                case TacticalLines.MAIN:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.SPT:
                case TacticalLines.LC:
                case TacticalLines.UNSP:
                case TacticalLines.DFENCE:
                case TacticalLines.SFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE:
                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.ROUTE_ALT:
                case TacticalLines.ATWALL: {
                    break;
                }

                default: {
                    return;
                }

            }
            let ptCurrent: POINT2;
            let ptLast: POINT2;
            let n: int = tg.Pixels.length;
            //for(int j=1;j<tg.Pixels.length;j++)
            for (let j: int = 1; j < n; j++) {
                ptLast = new POINT2(tg.Pixels[j - 1]);
                ptCurrent = new POINT2(tg.Pixels[j]);
                //if(Math.round(ptCurrent.x)==Math.round(ptLast.x))
                if (Math.abs(ptCurrent.x - ptLast.x) < 1) {
                    if (ptCurrent.x >= ptLast.x) {

                        ptCurrent.x += 1;
                    }

                    else {

                        ptCurrent.x -= 1;
                    }

                    tg.Pixels[j] = ptCurrent;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsUtility", "FilterVerticalSegments",
                    new RendererException("Failed inside FilterVerticalSegments", exc));

            } else {
                throw exc;
            }
        }
    }
    /**
     * Client utility to calculate the channel points for channel types.
     * This code was ported from CJMTK.
     * @param arrLocation the client points
     * @return the channel point
     */
    public static ComputeLastPoint(arrLocation: Array<POINT2>): POINT2 {
        let locD: POINT2 = new POINT2(0, 0);
        try {
            let locA: POINT2 = arrLocation[1];
            //Get the first point (b) in pixels.
            //var locB:Point=new Point(arrLocation[0].x,arrLocation[0].y);
            let locB: POINT2 = arrLocation[0];

            //Compute the distance in pixels from (a) to (b).
            let dblDx: double = locB.x - locA.x;
            let dblDy: double = locB.y - locA.y;

            //Compute the dblAngle in radians from (a) to (b).
            let dblTheta: double = Math.atan2(-dblDy, dblDx);

            //Compute a reasonable intermediate point along the line from (a) to (b).
            let locC: POINT2 = new POINT2(0, 0);
            locC.x = Math.trunc(locA.x + 0.85 * dblDx);
            locC.y = Math.trunc(locA.y + 0.85 * dblDy);
            //Put the last point on the left side of the line from (a) to (b).
            let dblAngle: double = dblTheta + Math.PI / 2.0;
            if (dblAngle > Math.PI) {
                dblAngle = dblAngle - 2.0 * Math.PI;
            }
            if (dblAngle < -Math.PI) {
                dblAngle = dblAngle + 2.0 * Math.PI;
            }

            //Set the magnitude of the dblWidth in pixels.  Make sure it is at least 15 pixels.
            let dblWidth: double = 30;//was 15

            //Compute the last point in pixels.
            locD.x = (locC.x + dblWidth * Math.cos(dblAngle));
            locD.y = (locC.y - dblWidth * Math.sin(dblAngle));
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsUtility.ComputeLatPoint");
                ErrorLogger.LogException(clsUtility._className, "ComputeLastPoint",
                    new RendererException("Failed inside ComputeLastPoint", exc));
            } else {
                throw exc;
            }
        }
        return locD;
    }

    /**
     * Called by clsChannelUtility. The segments are used for managing double-backed segments
     * for channel types. If the new point is double-backed then the segment at that index will be false.
     *
     * @param pixels the client points as 2-tuples x,y in pixels
     * @param segments OUT - the segments
     * @param factor a steepness factor for calculating whether the segment is double-backed
     */
    public static GetSegments(pixels: number[],
        segments: boolean[],
        factor: double): void {
        try {
            let j: int = 0;
            let m1: ref<number[]> = new ref();
            let m2: ref<number[]> = new ref();
            let numPoints: int = 0;
            let bolVertical1: boolean = false;
            let bolVertical2: boolean = false;

            let pt0F: POINT2 = new POINT2(0, 0);
            let pt1F: POINT2 = new POINT2(0, 0);
            let pt2F: POINT2 = new POINT2(0, 0);

            segments[0] = true;

            numPoints = pixels.length / 2;
            for (j = 0; j < numPoints - 2; j++) {
                pt0F.x = pixels[2 * j] as double;
                pt0F.y = pixels[2 * j + 1] as double;

                pt1F.x = pixels[2 * j + 2] as double;
                pt1F.y = pixels[2 * j + 3] as double;

                pt2F.x = pixels[2 * j + 4] as double;
                pt2F.y = pixels[2 * j + 5] as double;

                bolVertical1 = lineutility.CalcTrueSlopeDoubleForRoutes(pt0F, pt1F, m1);
                bolVertical2 = lineutility.CalcTrueSlopeDoubleForRoutes(pt1F, pt2F, m2);

                segments[j + 1] = true;
                if (bolVertical1 === true && bolVertical2 === true) {
                    if (Math.abs(Math.atan(m1.value[0]) - Math.atan(m2.value[0])) < 1 / factor && clsUtility.InXOrder(pt0F, pt1F, pt2F) === false) //was 0.1
                    {
                        segments[j + 1] = false;
                    }
                }

                if ((bolVertical1 === false || Math.abs(m1.value[0]) > factor) && (bolVertical2 === false || Math.abs(m2.value[0]) > factor) && clsUtility.InYOrder(pt0F, pt1F, pt2F) === false) //was 10
                {
                    segments[j + 1] = false;
                }
            }	//end for
            //int n=segments.length;
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log(e.message);
                //clsUtility.WriteFile("Error in clsUtility.GetSegments");
                ErrorLogger.LogException(clsUtility._className, "GetSegments",
                    new RendererException("Failed inside GetSegments", exc));
            } else {
                throw exc;
            }
        }
    }

    public static GetLCPartitions(pixels: number[],
        LCChannelWith: double,
        partitions: Array<P1>,
        singleLinePartitions: Array<P1>): void {
        try {
            let numPoints: int = pixels.length / 2;
            let pt0F: POINT2 = new POINT2(0, 0);
            let pt1F: POINT2 = new POINT2(0, 0);
            let pt2F: POINT2 = new POINT2(0, 0);

            let nextP: P1 = new P1();
            nextP.start = 0;

            //used for debugging
            let angles: number[] = new Array<number>(numPoints - 1);

            for (let i: int = 0; i < numPoints - 2; i++) {
                pt0F.x = pixels[2 * i] as double;
                pt0F.y = pixels[2 * i + 1] as double;

                pt1F.x = pixels[2 * i + 2] as double;
                pt1F.y = pixels[2 * i + 3] as double;

                pt2F.x = pixels[2 * i + 4] as double;
                pt2F.y = pixels[2 * i + 5] as double;

                let angle1: double = Math.atan2(pt1F.y - pt0F.y, pt1F.x - pt0F.x);
                let angle2: double = Math.atan2(pt1F.y - pt2F.y, pt1F.x - pt2F.x);
                let angle: double = angle1 - angle2;// * 180/Math.PI;
                let degrees: double = angle * 180 / Math.PI;
                if (angle < 0) {
                    degrees = 360 + degrees;
                }

                if (degrees > 270) {
                    let angleTooSmall: boolean = false;

                    if (lineutility.CalcDistanceDouble(pt0F, pt1F) < lineutility.CalcDistanceDouble(pt1F, pt2F)) {
                        let newPt: POINT2 = lineutility.ExtendAlongLineDouble2(pt1F, pt2F, lineutility.CalcDistanceDouble(pt1F, pt0F));
                        if (lineutility.CalcDistanceDouble(pt0F, newPt) < LCChannelWith) {

                            angleTooSmall = true;
                        }

                    } else {
                        let newPt: POINT2 = lineutility.ExtendAlongLineDouble2(pt1F, pt0F, lineutility.CalcDistanceDouble(pt1F, pt2F));
                        if (lineutility.CalcDistanceDouble(pt2F, newPt) < LCChannelWith) {

                            angleTooSmall = true;
                        }

                    }
                    if (angleTooSmall) {
                        // Angle is too small to fit channel, make it a single line partition
                        nextP.end_Renamed = i - 1;
                        partitions.push(nextP);
                        nextP = new P1();
                        nextP.start = i;
                        nextP.end_Renamed = i + 2;
                        singleLinePartitions.push(nextP);
                        i++;
                        nextP = new P1();
                        nextP.start = i + 1;
                    }
                } else {
                    if (degrees < 90) {
                        // new Partition
                        nextP.end_Renamed = i;
                        partitions.push(nextP);
                        nextP = new P1();
                        nextP.start = i + 1;
                    }
                }

                angles[i] = degrees;
            } //end for
            nextP.end_Renamed = numPoints - 2;
            partitions.push(nextP);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "GetLCPartitions",
                    new RendererException("Failed inside GetLCPartitions", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Sets the color for the current shape depending on the affiliation
     * @param tg
     * @param shape
     */
    protected static SetLCColor(tg: TGLight, shape: Shape2): void {
        try {
            if (tg.isHostile()) {
                if (shape.getLineColor() === Color.RED) {
                    shape.setLineColor(tg.get_LineColor());
                } else {
                    shape.setLineColor(Color.RED);
                }
            } else {
                if (shape.getLineColor() !== Color.RED) {
                    shape.setLineColor(tg.get_LineColor());
                } else {
                    shape.setLineColor(Color.RED);
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                //WriteFile("Error in clsUtility.SetLCColor");
                ErrorLogger.LogException(clsUtility._className, "SetLCColor",
                    new RendererException("Failed inside SetLCColor", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * USAS requires a left-right orientation for ENY, which negates the upper-lower
     * orientation we used for Mil-Std-2525 ENY compliance. Therefore we must reverse
     * the client points for two of the quadrants
     * @param tg tactical graphic
     */
    public static ReverseUSASLCPointsByQuadrant(tg: TGLight): void {
        try {
            if (tg.Pixels.length < 2) {

                return;
            }

            let quadrant: int = lineutility.GetQuadrantDouble(tg.Pixels[0], tg.Pixels[1]);
            switch (tg.get_LineType()) {
                case TacticalLines.LC: {
                    if (tg.isHostile()) {
                        switch (quadrant) {
                            case 2:
                            case 3: {
                                break;
                            }

                            case 1://reverse the points for these two quadrants
                            case 4: {
                                let n: int = tg.Pixels.length;
                                let pts2: Array<POINT2> = [...tg.Pixels];
                                //for(int j=0;j<tg.Pixels.length;j++)
                                for (let j: int = 0; j < n; j++) {

                                    tg.Pixels[j] = pts2[n - j - 1];
                                }

                                break;
                            }


                            default:

                        }//end switch quadrant
                    }//end if
                    else {
                        switch (quadrant) {
                            case 1:
                            case 4: {
                                break;
                            }

                            case 2://reverse the points for these two quadrants
                            case 3: {
                                let n: int = tg.Pixels.length;
                                let pts2: Array<POINT2> = [...tg.Pixels];
                                //for(int j=0;j<tg.Pixels.length;j++)
                                for (let j: int = 0; j < n; j++) {

                                    tg.Pixels[j] = pts2[n - j - 1];
                                }

                                break;
                            }


                            default:

                        }//end switch quadrant
                    }
                    break;
                }
                //end else
                default: {
                    break;
                }

            }//end switch linetype
        } catch (exc) {
            if (exc instanceof Error) {
                //WriteFile("Error in clsUtility.SetLCColor");
                ErrorLogger.LogException(clsUtility._className, "ReverseUSASLCPointsByQuadrant",
                    new RendererException("Failed inside ReverseUSASLCPointsByQuadrant", exc));
            } else {
                throw exc;
            }
        }
    }//end ReverseUSASLCPointsByQuadrant
    /**
     * use str if tg is null
     * @param symbolId Mil=Standard-2525 symbol id
     * @return line type
     */
    public static GetLinetypeFromString(symbolId: string): int {
        try {
            if (symbolId.length < 16) {
                return -1;
            }
            let symbolSet: int = SymbolID.getSymbolSet(symbolId);
            let entityCode: int = SymbolID.getEntityCode(symbolId);
            let version: int = SymbolID.getVersion(symbolId);
            if (symbolSet === 25) {
                return clsRenderer.getCMLineType(version, entityCode);
            } else {
                if (symbolSet === 45 || symbolSet === 46) {
                    return clsMETOC.getWeatherLinetype(version, entityCode);
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "GetLinetypeFromString",
                    new RendererException("Failed inside GetLinetypeFromString", exc));
            } else {
                throw exc;
            }
        }
        return -1;
    }

    /**
     * An auto-shape is a symbol with a fixed number of anchor points
     *
     * @param tg tactical graphic
     * @return true if auto-shape
     */
    public static isAutoshape(tg: TGLight): boolean {
        try {
            let msInfo: MSInfo = MSLookup.getInstance().getMSLInfo(tg.get_SymbolId());
            if (msInfo == null || clsUtility.IsChange1Area(tg.get_LineType())) {
                return false;
            }
            switch (tg.get_LineType()) {
                case TacticalLines.DIRATKAIR:
                case TacticalLines.DIRATKGND:
                case TacticalLines.DIRATKSPT: {
                    // Direction of attack symbols only have two points but can handle more
                    return false;
                }

                default: {
                    break;
                }

            }
            switch (msInfo.getDrawRule()) {
                case DrawRules.LINE26: // Two ways to draw but fixed points
                case DrawRules.LINE27: // Two ways to draw but fixed points
                case DrawRules.AREA26: // Need same number of points in first half and second half to make two shapes
                case DrawRules.CORRIDOR1: { // Each point represents an Air Control Point or Communications Checkpoint
                    return true;
                }

                default: {
                    return msInfo.getMaxPointCount() === msInfo.getMinPointCount();
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "isAutoshape",
                    new RendererException("Failed inside isAutoshape", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }
    /**
     * Client will send the segment colors within a modifier.
     * Format is 0:FFBBBB,4:FFAAAA,...
     * For the time being will assume the modifier being used is the H modifier
     * @param tg
     * @return 
     */
    public static getMSRSegmentColors(tg: TGLight): Map<number, Color> | null {
        let hMap: Map<number, Color>;
        try {
            let linetype: int = tg.get_LineType();
            switch (linetype) {
                case TacticalLines.MSR:
                case TacticalLines.ASR:
                case TacticalLines.ROUTE:
                case TacticalLines.BOUNDARY: {
                    if (tg.get_H() == null || tg.get_H().length === 0) {

                        return null;
                    }

                    hMap = new Map<number, Color>();
                    break;
                }

                default: {
                    return null;
                }

            }
            let colorStrs: string[] = tg.get_H().split(",");
            let j: int = 0;
            let numSegs: int = colorStrs.length;
            let segPlusColor: string = "";
            let seg: string[];
            let color: Color;
            let index: int = -1;
            for (j = 0; j < numSegs; j++) {
                segPlusColor = colorStrs[j];
                if (!segPlusColor.includes(":")) {

                    continue;
                }

                seg = segPlusColor.split(":");
                color = RendererUtilities.getColorFromHexString(seg[1]);
                index = parseInt(seg[0]);
                hMap.set(index, color);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "getMSRSegmentColors",
                    new RendererException("Failed inside getMSRSegmentColors", exc));
            } else {
                throw exc;
            }
        }
        return hMap;
    }
    public static getMSRSegmentColorStrings(tg: TGLight): Map<number, string> | null {
        let hMap: Map<number, string>;
        try {
            let linetype: int = tg.get_LineType();
            switch (linetype) {
                case TacticalLines.MSR:
                case TacticalLines.ASR:
                case TacticalLines.ROUTE:
                case TacticalLines.BOUNDARY: {
                    if (tg.get_H() == null || tg.get_H().length === 0) {

                        return null;
                    }

                    hMap = new Map();
                    break;
                }

                default: {
                    return null;
                }

            }
            let colorStrs: string[] = tg.get_H().split(",");
            let j: int = 0;
            let numSegs: int = colorStrs.length;
            let segPlusColor: string = "";
            let seg: string[];
            //Color color = null;
            let index: int = -1;
            for (j = 0; j < numSegs; j++) {
                segPlusColor = colorStrs[j];
                if (!segPlusColor.includes(":")) {

                    continue;
                }

                seg = segPlusColor.split(":");
                //color = armyc2.c5isr.renderer.utilities.SymbolUtilitiesD.getColorFromHexString(seg[1]);
                index = parseInt(seg[0]);
                //hMap.set(new Integer(index), color);
                hMap.set(index, seg[1]);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "getMSRSegmentColorStrings",
                    new RendererException("Failed inside getMSRSegmentColorStrings", exc));
            } else {
                throw exc;
            }
        }
        return hMap;
    }
    /**
     * tg.H must be revised for clipped MSR, ASR and Boundary
     * This function is called after the pixels were clipped
     * @param originalPixels the tactical graphic pixels before clipping
     * @param tg 
     */
    public static reviseHModifier(originalPixels: Array<POINT2>,
        tg: TGLight): void {
        try {
            //only revise tg.H if it is not null or empty
            //and the linetype is bounday, MSR, or ASR
            if (tg.get_H() == null || tg.get_H().length === 0) {

                return;
            }

            let linetype: int = tg.get_LineType();
            switch (linetype) {
                case TacticalLines.ASR:
                case TacticalLines.MSR:
                case TacticalLines.ROUTE:
                case TacticalLines.BOUNDARY: {
                    break;
                }

                default: {
                    return;
                }

            }
            let j: int = 0;
            let k: int = 0;
            //Line2D line=new Line2D();

            //get the first common point between the original points and tg.Pixels
            //if it is n then n segments will have been dropped at the front end of
            //the clipped array (from the original pixels) so then we would want to
            //set the start index to n for the loop through the original points
            let n: int = -1;
            let foundPt: boolean = false;
            let t: int = originalPixels.length;
            let u: int = tg.Pixels.length;
            //for(j=0;j<originalPixels.length;j++)
            for (j = 0; j < t; j++) {
                //for(k=0;k<tg.Pixels.length;k++)
                for (k = 0; k < u; k++) {
                    if (originalPixels[j].x === tg.Pixels[k].x && originalPixels[j].y === tg.Pixels[k].y) {
                        n = j;
                        foundPt = true;
                        break;
                    }
                }
                if (foundPt) {

                    break;
                }

            }
            let hmap: Map<number, Color> = clsUtility.getMSRSegmentColors(tg);
            //use a 2nd hashmap to store the revised segment numbers, and exisitng Colors
            let hmap2: Map<number, Color> = new Map<number, Color>();
            let segPt0: POINT2;
            let segPt1: POINT2; //the original segments
            let pt0: POINT2;
            let pt1: POINT2;   //the clipped segments
            let color: Color;
            if (n < 1) {

                n = 1;
            }

            for (let key of hmap.keys()) //keys can begin at 0
            {
                if (key < n - 1) {

                    continue;
                }

                if (key + 1 > originalPixels.length - 1) {

                    break;
                }

                color = hmap.get(key);
                segPt0 = originalPixels[key];
                segPt1 = originalPixels[key + 1];
                u = tg.Pixels.length;
                //for(j=0;j<tg.Pixels.length-1;j++)
                for (j = 0; j < u - 1; j++) {
                    pt0 = tg.Pixels[j];//clipped pixels
                    pt1 = tg.Pixels[j + 1];
                    if (segPt0.x === pt0.x && segPt0.y === pt0.y) {
                        hmap2.set(j, color);
                        break;
                    }
                    else {
                        if (segPt1.x === pt1.x && segPt1.y === pt1.y) {
                            hmap2.set(j, color);
                            break;
                        }
                        else {
                            if (pt0.x === segPt1.x && pt0.y === segPt1.y) {

                                continue;
                            }

                            if (pt1.x === segPt0.x && pt1.y === segPt0.y) {

                                continue;
                            }

                            else {
                                //if the original segment straddles or clips the clipping area
                                //then the original segment will contain the clipped segment
                                let dist0: double = lineutility.CalcDistanceToLineDouble(segPt0, segPt1, pt0);
                                let dist1: double = lineutility.CalcDistanceToLineDouble(segPt0, segPt1, pt1);
                                let lineOrigPts: Line2D = new Line2D(segPt0.x, segPt0.y, segPt1.x, segPt1.y);
                                let rectOrigPts: Rectangle2D = lineOrigPts.getBounds2D();
                                let lineClipPts: Line2D = new Line2D(pt0.x, pt0.y, pt1.x, pt1.y);
                                let rectClipPts: Rectangle2D = lineClipPts.getBounds2D();
                                //test if the lines coincide and the clipped segment is within the original segment
                                if (dist0 < 1 && dist1 < 1 && rectOrigPts.contains(rectClipPts)) {
                                    hmap2.set(j, color);
                                }
                            }
                        }
                    }

                }
            }
            if (hmap2.size === 0) {
                tg.set_H("");
                return;
            }

            let h: string = "";
            let temp: string = "";
            for (let key of hmap2.keys()) {
                color = hmap2.get(key);
                temp = RendererUtilities.colorToHexString(color, false);
                h += key.toString() + ":" + temp + ",";
            }
            h = h.substring(0, h.length - 1);
            tg.set_H(h);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "reviseHModifer",
                    new RendererException("Failed inside reviseHModifier", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Adds extra points to LC if there are angles too small to fit the channel
     * @param tg
     * @param converter
     */
    public static SegmentLCPoints(tg: TGLight, converter: IPointConversion): void {
        try {
            if (tg.get_LineType() !== TacticalLines.LC && tg.get_LineType() !== TacticalLines.LC_HOSTILE) {

                return;
            }


            let points: Array<POINT2> = tg.get_Pixels();

            let LCChannelWith: double = arraysupport.getScaledSize(40, tg.get_LineThickness());

            for (let i: int = 0; i < points.length - 2; i++) {
                let ptA: POINT2 = new POINT2(points[i].x, points[i].y);
                let ptB: POINT2 = new POINT2(points[i + 1].x, points[i + 1].y);
                let ptC: POINT2 = new POINT2(points[i + 2].x, points[i + 2].y);

                let angle1: double = Math.atan2(ptB.y - ptA.y, ptB.x - ptA.x);
                let angle2: double = Math.atan2(ptB.y - ptC.y, ptB.x - ptC.x);
                let angle: double = angle1 - angle2;
                let degrees: double = angle * 180 / Math.PI;

                if (angle < 0) {
                    degrees = 360 + degrees;
                }

                if (degrees > 270) {
                    // For acute angles where red is the outer line
                    // Determine shorter segment (BA or BC)
                    // On longer segment calculate potential new point (newPt) that is length of smaller segment from B
                    // If distance between smaller segment end point (A or C) and newPt is smaller than the channel width add newPt to points
                    // In GetLCPartitions() the black line won't be included between the smaller line and newPt since there isn't enough space to fit the channel
                    if (lineutility.CalcDistanceDouble(ptB, ptA) < lineutility.CalcDistanceDouble(ptB, ptC)) {
                        // BA is smaller segment
                        let newPt: POINT2 = lineutility.ExtendAlongLineDouble2(ptB, ptC, lineutility.CalcDistanceDouble(ptB, ptA));
                        if (lineutility.CalcDistanceDouble(ptA, newPt) < LCChannelWith) {
                            points.splice(i + 2, 0, new POINT2(newPt.x, newPt.y));
                            i++;
                        }
                    } else {
                        // BC is smaller segment
                        let newPt: POINT2 = lineutility.ExtendAlongLineDouble2(ptB, ptA, lineutility.CalcDistanceDouble(ptB, ptC));
                        if (lineutility.CalcDistanceDouble(ptC, newPt) < LCChannelWith) {
                            points.splice(i + 1, 0, new POINT2(newPt.x, newPt.y));
                            i++;
                        }
                    }
                }
            }
            tg.Pixels = points;
            tg.LatLongs = renderMPUtility.PixelsToLatLong(points, converter);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "segmentLCPoints",
                    new RendererException("Failed inside segmentLCPoints", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Interpolate pixels for lines with points too close together.
     * Drops successive points until the next point is at least 10 pixels from the preceding point
     * @param tg 
     */
    public static InterpolatePixels(tg: TGLight): void {
        try {
            if (tg.get_UseLineInterpolation() === false) {

                return;
            }


            let linetype: int = tg.get_LineType();
            let glyphSize: double = 10;
            switch (linetype) {
                case TacticalLines.ATDITCH:
                case TacticalLines.ATDITCHC: {
                    glyphSize = 25;
                    break;
                }

                case TacticalLines.ATDITCHM: {
                    glyphSize = 50;
                    break;
                }

                case TacticalLines.FLOT:
                case TacticalLines.LC:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.FORTL:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ZONE:
                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE:
                case TacticalLines.STRONG: {
                    glyphSize = arraysupport.getScaledSize(30, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.UNSP:
                case TacticalLines.LINE:
                case TacticalLines.ATWALL:
                case TacticalLines.SFENCE: {
                    glyphSize = arraysupport.getScaledSize(40, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.DFENCE: {
                    glyphSize = arraysupport.getScaledSize(50, tg.get_LineThickness());
                    break;
                }

                default: {
                    return;
                }

            }
            let hmapPixels: Map<number, POINT2> = new Map<number, POINT2>();
            let hmapGeo: Map<number, POINT2> = new Map<number, POINT2>();
            let j: int = 0;
            let currentIndex: int = 0;
            let dist: double = 0;
            let dist2: double = 0;
            let direction1: double = 0;
            let direction2: double = 0;
            let delta: double = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let n: int = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                if (j === 0) {
                    hmapPixels.set(j, tg.Pixels[j]);
                    hmapGeo.set(j, tg.LatLongs[j]);
                    currentIndex = 0;
                }
                else {
                    if (j === tg.Pixels.length - 1) {
                        hmapPixels.set(j, tg.Pixels[j]);
                        hmapGeo.set(j, tg.LatLongs[j]);
                    }
                    else {
                        dist = lineutility.CalcDistanceDouble(tg.Pixels[currentIndex], tg.Pixels[j]);
                        dist2 = lineutility.CalcDistanceDouble(tg.Pixels[j], tg.Pixels[j + 1]);

                        //change of direction test 2-28-13
                        pt0 = tg.Pixels[currentIndex];
                        pt1 = tg.Pixels[j];
                        pt2 = tg.Pixels[j + 1];
                        direction1 = (180 / Math.PI) * Math.atan((pt0.y - pt1.y) / (pt0.x - pt1.x));
                        direction2 = (180 / Math.PI) * Math.atan((pt1.y - pt2.y) / (pt1.x - pt2.x));
                        delta = Math.abs(direction1 - direction2);
                        if (dist > glyphSize || dist2 > glyphSize || delta > 20) {
                            hmapPixels.set(j, tg.Pixels[j]);
                            hmapGeo.set(j, tg.LatLongs[j]);
                            currentIndex = j;
                        }
                    }
                }

            }
            let pixels: Array<POINT2> = new Array();
            let geo: Array<POINT2> = new Array();
            n = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                if (hmapPixels.has(j)) {

                    pixels.push(hmapPixels.get(j) as POINT2);
                }

                if (hmapGeo.has(j)) {

                    geo.push(hmapGeo.get(j) as POINT2);
                }

            }
            switch (linetype) {
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ZONE:
                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
                case TacticalLines.STRONG: {
                    if (pixels.length === 2) {
                        n = tg.Pixels.length;
                        //for(j=0;j<tg.Pixels.length;j++)
                        for (j = 0; j < n; j++) {
                            if (hmapPixels.has(j) === false && hmapGeo.has(j) === false) {
                                pixels.splice(j, 0, tg.Pixels[j]);
                                geo.splice(j, 0, tg.LatLongs[j]);
                                break;
                            }
                        }
                    }
                    break;
                }

                default: {
                    break;
                }

            }
            tg.Pixels = pixels;
            tg.LatLongs = geo;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "InterpolatePixels",
                    new RendererException("Failed inside InterpolatePixels", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * construct a line segment outside the polygon corresponding to some index
     * @param tg
     * @param index
     * @param dist
     * @return 
     */
    protected static getExtendedLine(tg: TGLight,
        index: int,
        dist: double): Line2D {
        let line: Line2D;
        try {
            let polygon: Polygon = new Polygon();
            let j: int = 0;
            let n: int = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                polygon.addPoint(tg.Pixels[j].x as int, tg.Pixels[j].y as int);
            }
            let pt0: POINT2;
            let pt1: POINT2;
            if (tg.Pixels.length > 3) {
                pt0 = tg.Pixels[index];
                pt1 = tg.Pixels[index + 1];
            }
            else {
                pt0 = tg.Pixels[1];
                pt1 = tg.Pixels[2];
            }

            let ptExtend: POINT2;
            let extend: int = -1;
            let midPt: POINT2 = lineutility.MidPointDouble(pt0, pt1, 0);
            let slope: double = Math.abs(pt1.y - pt0.y) / (pt1.x - pt0.x);
            if (slope <= 1) {
                ptExtend = lineutility.ExtendDirectedLine(pt0, pt1, midPt, lineutility.extend_above, 2);
                if (polygon.contains(ptExtend.x, ptExtend.y)) {

                    extend = lineutility.extend_below;
                }

                else {

                    extend = lineutility.extend_above;
                }

            }
            else {
                ptExtend = lineutility.ExtendDirectedLine(pt0, pt1, midPt, lineutility.extend_left, 2);
                if (polygon.contains(ptExtend.x, ptExtend.y)) {

                    extend = lineutility.extend_right;
                }

                else {

                    extend = lineutility.extend_left;
                }


            }
            let pt3: POINT2;
            let pt4: POINT2;
            pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, extend, dist);
            pt4 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, extend, dist);
            line = new Line2D(pt3.x, pt3.y, pt4.x, pt4.y);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "getExtendedLine",
                    new RendererException("Failed inside getExtendedLine", exc));
            } else {
                throw exc;
            }
        }
        return line;
    }

}//end clsUtility
