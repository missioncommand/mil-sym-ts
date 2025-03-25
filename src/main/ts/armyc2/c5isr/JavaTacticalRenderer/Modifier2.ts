import { type int, type double } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { BasicStroke } from "../graphics2d/BasicStroke"
import { Font } from "../graphics2d/Font"
import { FontMetrics } from "../graphics2d/FontMetrics"
import { FontRenderContext } from "../graphics2d/FontRenderContext"
import { Graphics2D } from "../graphics2d/Graphics2D"
import { Line2D } from "../graphics2d/Line2D"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point } from "../graphics2d/Point"
import { Point2D } from "../graphics2d/Point2D"
import { Polygon } from "../graphics2d/Polygon"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"
import { TextLayout } from "../graphics2d/TextLayout"
import { arraysupport } from "../JavaLineArray/arraysupport"
import { Channels } from "../JavaLineArray/Channels"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { mdlGeodesic } from "../JavaTacticalRenderer/mdlGeodesic"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { Color } from "../renderer/utilities/Color"
import { EntityCode } from "../renderer/utilities/EntityCode"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { MilStdAttributes } from "../renderer/utilities/MilStdAttributes"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { RendererUtilities } from "../renderer/utilities/RendererUtilities"
import { ShapeInfo } from "../renderer/utilities/ShapeInfo"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { clsUtility } from "./clsUtility";
import { IPathIterator } from "../graphics2d/IPathIterator";
import { SinglePointSVGRenderer } from "../renderer/SinglePointSVGRenderer";
import { SVGSymbolInfo } from "../renderer/utilities/SVGSymbolInfo";


/**
 * This class handles everything having to do with text for a
 * tactical graphic. Note: labels are handled the same as text modifiers.
 *
 *
 */
export class Modifier2 {
    private textPath: POINT2[];
    private textID: string;
    private featureID: string;
    private text: string;

    private image: SVGSymbolInfo;
    private iteration: int = 0;
    private justify: int = 0;
    private type: int = 0;
    private lineFactor: double = 0;
    private static readonly _className: string = "Modifier2";
    private isIntegral: boolean = false;
    private fitsMBR: boolean = true;

    protected constructor() {
        this.textPath = new Array<POINT2>(2);
    }

    private static readonly toEnd: int = 1; // Put next to pt0 on opposite side of line
    private static readonly aboveMiddle: int = 2;    //use both points
    private static readonly area: int = 3;   //use one point
    private static readonly screen: int = 4;   //use one point, screen, cover, guard points
    private static readonly aboveEnd: int = 5; // Put next to pt0 on line
    private static readonly aboveMiddlePerpendicular: int = 6; //use both points
    private static readonly aboveStartInside: int = 7; //place at the start inside the shape
    private static readonly aboveEndInside: int = 8;  //place at the end inside the shape
    private static readonly areaImage: int = 9;   //use one point
    private static fillAlphaCanObscureText: double = 50;

    private static DoublesBack(pt0: POINT2, pt1: POINT2, pt2: POINT2): boolean {
        let result: boolean = true;
        try {
            let theta1: double = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
            let theta0: double = Math.atan2(pt0.y - pt1.y, pt0.x - pt1.x);
            let beta: double = Math.abs(theta0 - theta1);
            if (beta > 0.1) {
                result = false;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "DoublesBack",
                    new RendererException("Failed inside DoublesBack", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }

    /**
     * Returns a generic label for the symbol per Mil-Std-2525
     *
     * @param tg
     * @return
     */
    private static GetCenterLabel(tg: TGLight): string {
        let label: string = "";
        try {
            switch (tg.get_LineType()) {
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.SHIP_AOI_CIRCULAR: {
                    label = "AOI";
                    break;
                }

                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_CIRCULAR: {
                    label = "DA";
                    break;
                }

                case TacticalLines.NOTACK: {
                    label = "N";
                    break;
                }

                case TacticalLines.LAUNCH_AREA: {
                    label = "LA";
                    break;
                }

                case TacticalLines.SL: {
                    label = "SL";
                    break;
                }

                case TacticalLines.TC: {
                    label = "TC";
                    break;
                }

                case TacticalLines.AARROZ: {
                    label = "AARROZ";
                    break;
                }

                case TacticalLines.UAROZ: {
                    label = "UAROZ";
                    break;
                }

                case TacticalLines.WEZ: {
                    label = "WEZ";
                    break;
                }

                case TacticalLines.FEZ: {
                    label = "FEZ";
                    break;
                }

                case TacticalLines.JEZ: {
                    label = "JEZ";
                    break;
                }

                case TacticalLines.IFF_OFF: {
                    label = "IFF OFF";
                    break;
                }

                case TacticalLines.IFF_ON: {
                    label = "IFF ON";
                    break;
                }

                case TacticalLines.BCL_REVD:
                case TacticalLines.BCL: {
                    label = "BCL";
                    break;
                }

                case TacticalLines.ICL: {
                    label = "ICL";
                    break;
                }

                case TacticalLines.FEBA: {
                    label = "FEBA";
                    break;
                }

                case TacticalLines.BDZ: {
                    label = "BDZ";
                    break;
                }

                case TacticalLines.JTAA: {
                    label = "JTAA";
                    break;
                }

                case TacticalLines.SAA: {
                    label = "SAA";
                    break;
                }

                case TacticalLines.SGAA: {
                    label = "SGAA";
                    break;
                }

                case TacticalLines.ASSAULT: {
                    label = "ASLT";
                    break;
                }

                case TacticalLines.SAAFR: {
                    label = "SAAFR";
                    break;
                }

                case TacticalLines.AC: {
                    label = "AC";
                    break;
                }

                case TacticalLines.SECURE:
                case TacticalLines.SEIZE: {
                    label = "S";
                    break;
                }

                case TacticalLines.RETAIN: {
                    label = "R";
                    break;
                }

                case TacticalLines.PENETRATE: {
                    label = "P";
                    break;
                }

                case TacticalLines.OCCUPY: {
                    label = "O";
                    break;
                }

                case TacticalLines.ISOLATE: {
                    label = "I";
                    break;
                }

                case TacticalLines.FIX: {
                    label = "F";
                    break;
                }

                case TacticalLines.DISRUPT: {
                    label = "D";
                    break;
                }

                case TacticalLines.CANALIZE:
                case TacticalLines.CLEAR: {
                    label = "C";
                    break;
                }

                case TacticalLines.BREACH:
                case TacticalLines.BYPASS: {
                    label = "B";
                    break;
                }

                case TacticalLines.CORDONKNOCK: {
                    label = "C/K";
                    break;
                }

                case TacticalLines.CORDONSEARCH: {
                    label = "C/S";
                    break;
                }

                case TacticalLines.UXO: {
                    label = "UXO";
                    break;
                }

                case TacticalLines.RETIRE: {
                    label = "R";
                    break;
                }

                case TacticalLines.FPOL: {
                    label = "P(F)";
                    break;
                }

                case TacticalLines.RPOL: {
                    label = "P(R)";
                    break;
                }

                case TacticalLines.BRDGHD:
                case TacticalLines.BRDGHD_GE: {
                    if (SymbolID.getVersion(tg.get_SymbolId()) >= SymbolID.Version_2525E) {

                        label = "BL";
                    }

                    else {

                        label = "B";
                    }

                    break;
                }

                case TacticalLines.HOLD:
                case TacticalLines.HOLD_GE: {
                    //label="HOLDING LINE";
                    label = "HL";
                    break;
                }

                case TacticalLines.PL: {
                    label = "PL";
                    break;
                }

                case TacticalLines.LL: {
                    label = "LL";
                    break;
                }

                case TacticalLines.EWL: {
                    label = "EWL";
                    break;
                }

                case TacticalLines.SCREEN: {
                    label = "S";
                    break;
                }

                case TacticalLines.COVER: {
                    label = "C";
                    break;
                }

                case TacticalLines.GUARD: {
                    label = "G";
                    break;
                }

                case TacticalLines.RIP: {
                    label = "RIP";
                    break;
                }

                case TacticalLines.WITHDRAW: {
                    label = "W";
                    break;
                }

                case TacticalLines.WDRAWUP: {
                    label = "WP";
                    break;
                }

                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE: {
                    label = "CATK";
                    break;
                }

                case TacticalLines.FLOT: {
                    label = "FLOT";
                    break;
                }

                case TacticalLines.LC: {
                    label = "LC";
                    break;
                }

                case TacticalLines.ASSY: {
                    label = "AA";
                    break;
                }

                case TacticalLines.EA: {
                    label = "EA";
                    break;
                }

                case TacticalLines.DZ: {
                    label = "DZ";
                    break;
                }

                case TacticalLines.EZ: {
                    label = "EZ";
                    break;
                }

                case TacticalLines.LZ: {
                    label = "LZ";
                    break;
                }

                case TacticalLines.LAA: {
                    label = "LAA";
                    break;
                }

                case TacticalLines.PZ: {
                    label = "PZ";
                    break;
                }

                case TacticalLines.MRR: {
                    label = "MRR";
                    break;
                }

                case TacticalLines.SC: {
                    label = "SC";
                    break;
                }

                case TacticalLines.LLTR: {
                    label = "LLTR";
                    break;
                }

                case TacticalLines.ROZ: {
                    label = "ROZ";
                    break;
                }

                case TacticalLines.FAADZ: {
                    label = "SHORADEZ";
                    break;
                }

                case TacticalLines.HIDACZ: {
                    label = "HIDACZ";
                    break;
                }

                case TacticalLines.MEZ: {
                    label = "MEZ";
                    break;
                }

                case TacticalLines.LOMEZ: {
                    label = "LOMEZ";
                    break;
                }

                case TacticalLines.HIMEZ: {
                    label = "HIMEZ";
                    break;
                }

                case TacticalLines.WFZ: {
                    label = "WFZ";
                    break;
                }

                case TacticalLines.MINED:
                case TacticalLines.FENCED: {
                    label = "M";
                    break;
                }

                case TacticalLines.PNO: {
                    label = "(P)";
                    break;
                }

                case TacticalLines.OBJ: {
                    label = "OBJ";
                    break;
                }

                case TacticalLines.NAI: {
                    label = "NAI";
                    break;
                }

                case TacticalLines.TAI: {
                    label = "TAI";
                    break;
                }

                case TacticalLines.BASE_CAMP_REVD:
                case TacticalLines.BASE_CAMP: {
                    label = "BC";
                    break;
                }

                case TacticalLines.GUERILLA_BASE_REVD:
                case TacticalLines.GUERILLA_BASE: {
                    label = "GB";
                    break;
                }

                case TacticalLines.LINTGTS: {
                    label = "SMOKE";
                    break;
                }

                case TacticalLines.FPF: {
                    label = "FPF";
                    break;
                }

                case TacticalLines.ATKPOS: {
                    label = "ATK";
                    break;
                }

                case TacticalLines.FCL: {
                    label = "FCL";
                    break;
                }

                case TacticalLines.LOA: {
                    label = "LOA";
                    break;
                }

                case TacticalLines.LOD: {
                    label = "LD";
                    break;
                }

                case TacticalLines.PLD: {
                    label = "PLD";
                    break;
                }

                case TacticalLines.DELAY: {
                    label = "D";
                    break;
                }

                case TacticalLines.RELEASE: {
                    label = "RL";
                    break;
                }

                case TacticalLines.HOL: {
                    label = "HOL";
                    break;
                }

                case TacticalLines.BHL: {
                    label = "BHL";
                    break;
                }

                case TacticalLines.SMOKE: {
                    label = "SMOKE";
                    break;
                }

                case TacticalLines.NFL: {
                    label = "NFL";
                    break;
                }

                case TacticalLines.MFP: {
                    label = "MFP";
                    break;
                }

                case TacticalLines.FSCL: {
                    label = "FSCL";
                    break;
                }

                case TacticalLines.CFL: {
                    label = "CFL";
                    break;
                }

                case TacticalLines.RFL: {
                    label = "RFL";
                    break;
                }

                case TacticalLines.AO: {
                    label = "AO";
                    break;
                }

                case TacticalLines.BOMB: {
                    label = "BOMB";
                    break;
                }

                case TacticalLines.TGMF: {
                    label = "TGMF";
                    break;
                }

                case TacticalLines.FSA: {
                    label = "FSA";
                    break;
                }

                case TacticalLines.FSA_CIRCULAR:
                case TacticalLines.FSA_RECTANGULAR: {
                    label = "FSA";
                    break;
                }

                case TacticalLines.ACA:
                case TacticalLines.ACA_CIRCULAR:
                case TacticalLines.ACA_RECTANGULAR: {
                    label = "ACA";
                    break;
                }

                case TacticalLines.FFA:
                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.FFA_RECTANGULAR: {
                    label = "FFA";
                    break;
                }

                case TacticalLines.NFA:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.NFA_RECTANGULAR: {
                    label = "NFA";
                    break;
                }

                case TacticalLines.RFA:
                case TacticalLines.RFA_CIRCULAR:
                case TacticalLines.RFA_RECTANGULAR: {
                    label = "RFA";
                    break;
                }

                case TacticalLines.ATI:
                case TacticalLines.ATI_CIRCULAR:
                case TacticalLines.ATI_RECTANGULAR: {
                    label = "ATI ZONE";
                    break;
                }

                case TacticalLines.PAA:
                case TacticalLines.PAA_CIRCULAR:
                case TacticalLines.PAA_RECTANGULAR: {
                    label = "PAA";
                    break;
                }

                case TacticalLines.CFFZ:
                case TacticalLines.CFFZ_CIRCULAR:
                case TacticalLines.CFFZ_RECTANGULAR: {
                    label = "CFF ZONE";
                    break;
                }

                case TacticalLines.CFZ:
                case TacticalLines.CFZ_CIRCULAR:
                case TacticalLines.CFZ_RECTANGULAR: {
                    label = "CF ZONE";
                    break;
                }

                case TacticalLines.SENSOR:
                case TacticalLines.SENSOR_CIRCULAR:
                case TacticalLines.SENSOR_RECTANGULAR: {
                    label = "SENSOR ZONE";
                    break;
                }

                case TacticalLines.CENSOR:
                case TacticalLines.CENSOR_CIRCULAR:
                case TacticalLines.CENSOR_RECTANGULAR: {
                    label = "CENSOR ZONE";
                    break;
                }

                case TacticalLines.DA:
                case TacticalLines.DA_CIRCULAR:
                case TacticalLines.DA_RECTANGULAR: {
                    label = "DA";
                    break;
                }

                case TacticalLines.ZOR:
                case TacticalLines.ZOR_CIRCULAR:
                case TacticalLines.ZOR_RECTANGULAR: {
                    label = "ZOR";
                    break;
                }

                case TacticalLines.TBA:
                case TacticalLines.TBA_CIRCULAR:
                case TacticalLines.TBA_RECTANGULAR: {
                    label = "TBA";
                    break;
                }

                case TacticalLines.TVAR:
                case TacticalLines.TVAR_CIRCULAR:
                case TacticalLines.TVAR_RECTANGULAR: {
                    label = "TVAR";
                    break;
                }

                case TacticalLines.KILLBOXBLUE:
                case TacticalLines.KILLBOXBLUE_CIRCULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR: {
                    label = "BKB";
                    break;
                }

                case TacticalLines.KILLBOXPURPLE:
                case TacticalLines.KILLBOXPURPLE_CIRCULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR: {
                    label = "PKB";
                    break;
                }

                case TacticalLines.MSR:
                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.MSR_ALT: {
                    label = "MSR";
                    break;
                }

                case TacticalLines.ASR:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.ASR_ALT: {
                    label = "ASR";
                    break;
                }

                case TacticalLines.ROUTE:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.ROUTE_ALT: {
                    label = "ROUTE";
                    break;
                }

                case TacticalLines.LDLC: {
                    label = "LD/LC";
                    break;
                }

                case TacticalLines.AIRHEAD: {
                    label = "AIRHEAD LINE";
                    break;
                }

                case TacticalLines.BLOCK:
                case TacticalLines.BEARING: {
                    label = "B";
                    break;
                }

                case TacticalLines.BEARING_J: {
                    label = "J";
                    break;
                }

                case TacticalLines.BEARING_RDF: {
                    label = "RDF";
                    break;
                }

                case TacticalLines.ELECTRO: {
                    label = "E";
                    break;
                }

                case TacticalLines.BEARING_EW: {
                    label = "EW";
                    break;
                }

                case TacticalLines.ACOUSTIC:
                case TacticalLines.ACOUSTIC_AMB: {
                    label = "A";
                    break;
                }

                case TacticalLines.TORPEDO: {
                    label = "T";
                    break;
                }

                case TacticalLines.OPTICAL: {
                    label = "O";
                    break;
                }

                case TacticalLines.DHA: {
                    label = "DHA";
                    break;
                }

                case TacticalLines.FARP: {
                    label = "FARP";
                    break;
                }

                case TacticalLines.BSA: {
                    label = "BSA";
                    break;
                }

                case TacticalLines.DSA: {
                    label = "DSA";
                    break;
                }

                case TacticalLines.CSA: {
                    label = "CSA";
                    break;
                }

                case TacticalLines.RSA: {
                    label = "RSA";
                    break;
                }

                case TacticalLines.CONTAIN: {
                    label = "C";
                    break;
                }

                case TacticalLines.OBSFAREA: {
                    label = "FREE";
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in Modifier2.GetCenterLabel");
                ErrorLogger.LogException(Modifier2._className, "GetCenterLabel",
                    new RendererException("Failed inside GetCenterLabel", exc));
            } else {
                throw exc;
            }
        }
        return label;
    }
    //non CPOF clients using best fit need these accessors

    public get_TextPath(): POINT2[] {
        return this.textPath;
    }

    protected set_TextPath(value: POINT2[]): void {
        this.textPath = value;
    }

    protected set_IsIntegral(value: boolean): void {
        this.isIntegral = value;
    }

    protected get_IsIntegral(): boolean {
        return this.isIntegral;
    }

    private static AddOffsetModifier(tg: TGLight,
        text: string,
        type: int,
        lineFactor: double,
        startIndex: int,
        endIndex: int,
        spaces: double,
        rightOrLeft: string): void {
        if (rightOrLeft == null || tg.Pixels == null || tg.Pixels.length < 2 || endIndex >= tg.Pixels.length) {
            return;
        }

        let pt0: POINT2 = tg.Pixels[startIndex];
        let pt1: POINT2 = tg.Pixels[endIndex];
        if (rightOrLeft === "left") {
            pt0.x -= spaces;
            pt1.x -= spaces;
        } else {
            pt0.x += spaces;
            pt1.x += spaces;
        }
        Modifier2.AddModifier2(tg, text, type, lineFactor, pt0, pt1, false);
    }

    /**
     *
     * @param tg
     * @param text
     * @param type
     * @param lineFactor
     * @param ptStart
     * @param ptEnd
     */
    private static AddModifier(tg: TGLight,
        text: string,
        type: int,
        lineFactor: double,
        ptStart: POINT2,
        ptEnd: POINT2): void {
        if (tg.Pixels == null || tg.Pixels.length < 2) {
            return;
        }
        Modifier2.AddModifier2(tg, text, type, lineFactor, ptStart, ptEnd, false);
    }

    private static AddModifier2(tg: TGLight,
        text: string,
        type: int,
        lineFactor: double,
        pt0: POINT2,
        pt1: POINT2,
        isIntegral: boolean = false,
        modifierType?: string): void {
        try {
            if (text == null || text === "") {
                return;
            }

            let modifier: Modifier2 = new Modifier2();
            modifier.set_IsIntegral(isIntegral);
            modifier.text = text;
            modifier.type = type;
            modifier.lineFactor = lineFactor;
            modifier.textPath[0] = pt0;
            modifier.textPath[1] = pt1;
            modifier.textID = modifierType;
            tg.modifiers.push(modifier);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddModifier",
                    new RendererException("Failed inside AddModifier", exc));
            } else {
                throw exc;
            }
        }

    }

    private static AddIntegralModifier(tg: TGLight,
        text: string,
        type: int,
        lineFactor: double,
        startIndex: int,
        endIndex: int,
        isIntegral: boolean = true,
        modifierType: string | null = null): void {
        if (tg.Pixels == null || tg.Pixels.length === 0 || endIndex >= tg.Pixels.length) {
            return;
        }
        Modifier2.AddIntegralAreaModifier(tg, text, type, lineFactor, tg.Pixels[Math.trunc(startIndex)], tg.Pixels[Math.trunc(endIndex)], isIntegral, modifierType);
    }

    /**
     * sets modifier.textId to the modifier type, e.g. label, T, T1, etc.
     *
     * @param tg
     * @param text
     * @param type
     * @param lineFactor
     * @param pt0
     * @param pt1
     * @param modifierType
     */
    private static AddAreaModifier(tg: TGLight,
        text: string,
        type: int,
        lineFactor: double,
        pt0: POINT2,
        pt1: POINT2,
        modifierType?: string): void {
        if (modifierType) {
            Modifier2.AddIntegralAreaModifier(tg, text, type, lineFactor, pt0, pt1, true, modifierType);
        } else {
            Modifier2.AddIntegralAreaModifier(tg, text, type, lineFactor, pt0, pt1, true);
        }
    }


    private static AddIntegralAreaModifier(tg: TGLight,
        text: string,
        type: int,
        lineFactor: double,
        pt0: POINT2,
        pt1: POINT2,
        isIntegral: boolean,
        modifierType?: string): void {
        if (pt0 === undefined || pt1 === undefined) {
            return;
        }
        Modifier2.AddModifier2(tg, text, type, lineFactor, pt0, pt1, isIntegral, modifierType);
    }

    private static AddImageModifier(tg: TGLight,
        type: int,
        lineFactor: double,
        pt0: POINT2,
        pt1: POINT2,
        isIntegral: boolean): void {
        try {
            if (pt0 == null || pt1 == null) {
                return;
            }

            let symbolID: string = tg.get_SymbolId();
            let symbol: SVGSymbolInfo;
            let mods: Map<string, string> = new Map();
            let sa: Map<string, string> = new Map();
            sa.set(MilStdAttributes.PixelSize, tg.getIconSize().toString());
            let contaminationCode: int = EntityCode.getSymbolForContaminationArea(SymbolID.getEntityCode(symbolID));
            let modifier1Code: int = SymbolID.getModifier1(symbolID);
            let lineType: int = clsUtility.GetLinetypeFromString(symbolID);
            if (contaminationCode > 0) {
                sa.set(MilStdAttributes.OutlineSymbol, "true");
                sa.set(MilStdAttributes.FillColor, RendererUtilities.colorToHexString(tg.get_FillColor(), true));
                sa.set(MilStdAttributes.LineColor, RendererUtilities.colorToHexString(tg.get_LineColor(), true));
                let contaminationSP: string = SymbolID.setEntityCode(symbolID, contaminationCode);
                contaminationSP = SymbolID.setHQTFD(contaminationSP, 0); // Remove fdi if necessary
                symbol = SinglePointSVGRenderer.getInstance().RenderSP(contaminationSP, mods, sa);
            } else {
                if (lineType === TacticalLines.DEPICT || lineType === TacticalLines.MINED || lineType === TacticalLines.FENCED || lineType === TacticalLines.MINE_LINE) {
                    if (modifier1Code < 13 || modifier1Code > 50) {
                        // Invalid mine type
                        modifier1Code = 13;//unspecified mine (default value if not specified as per MilStd 2525)
                        symbolID = SymbolID.setModifier1(symbolID, modifier1Code);
                    }
                    if (tg.get_KeepUnitRation()) {
                        sa.set(MilStdAttributes.PixelSize, ((tg.getIconSize() * 1.5) as int).toString());
                    }
                    sa.set(MilStdAttributes.OutlineSymbol, "true");
                    symbol = SinglePointSVGRenderer.getInstance().RenderModifier(symbolID, sa);
                } else if (lineType === TacticalLines.LAA && modifier1Code > 0) {
                    sa.set(MilStdAttributes.OutlineSymbol, "true");
                    sa.set(MilStdAttributes.FillColor, RendererUtilities.colorToHexString(tg.get_FillColor(), true));
                    sa.set(MilStdAttributes.LineColor, RendererUtilities.colorToHexString(tg.get_LineColor(), true));
                    if (tg.get_KeepUnitRation()) {
                        sa.set(MilStdAttributes.PixelSize, ((tg.getIconSize() * 1.5) as int).toString());
                    }
                    symbol = SinglePointSVGRenderer.getInstance().RenderModifier(symbolID, sa);
                } else if (lineType === TacticalLines.ANCHORAGE_LINE || lineType === TacticalLines.ANCHORAGE_AREA) {
                    sa.set(MilStdAttributes.OutlineSymbol, "false");
                    let anchorPoint: string = SymbolID.setEntityCode(symbolID, EntityCode.EntityCode_AnchoragePoint);
                    symbol = SinglePointSVGRenderer.getInstance().RenderSP(anchorPoint, mods, sa);
                }
            }

            if (symbol == null) {
                return;
            }

            let modifier: Modifier2 = new Modifier2();
            modifier.set_IsIntegral(isIntegral);
            modifier.image = symbol;
            modifier.type = type;
            modifier.lineFactor = lineFactor;
            modifier.textPath[0] = pt0;
            modifier.textPath[1] = pt1;
            tg.modifiers.push(modifier);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddAreaModifier",
                    new RendererException("Failed inside AddAreaModifier", exc));
            } else {
                throw exc;
            }
        }
    }


    /**
     * Returns symbol MBR. Assumes points have been initialized with value of
     * 0th point
     *
     * @param tg the tactical graphic object
     * @param ptUl OUT - MBR upper left
     * @param ptUr OUT - MBR upper right
     * @param ptLr OUT - MBR lower right
     * @param ptLl OUT - MBR lower left
     */
    public static GetMBR(tg: TGLight,
        ptUl: POINT2,
        ptUr: POINT2,
        ptLr: POINT2,
        ptLl: POINT2): void {
        try {
            let j: int = 0;
            let x: double = 0;
            let y: double = 0;
            ptUl.x = tg.Pixels[0].x;
            ptUl.y = tg.Pixels[0].y;
            ptUr.x = tg.Pixels[0].x;
            ptUr.y = tg.Pixels[0].y;
            ptLl.x = tg.Pixels[0].x;
            ptLl.y = tg.Pixels[0].y;
            ptLr.x = tg.Pixels[0].x;
            ptLr.y = tg.Pixels[0].y;
            let n: int = tg.Pixels.length;
            //for (j = 1; j < tg.Pixels.length; j++)
            for (j = 1; j < n; j++) {
                x = tg.Pixels[j].x;
                y = tg.Pixels[j].y;
                if (x < ptLl.x) {
                    ptLl.x = x;
                    ptUl.x = x;
                }
                if (x > ptLr.x) {
                    ptLr.x = x;
                    ptUr.x = x;
                }
                if (y > ptLl.y) {
                    ptLl.y = y;
                    ptLr.y = y;
                }
                if (y < ptUl.y) {
                    ptUl.y = y;
                    ptUr.y = y;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "GetMBR",
                    new RendererException("Failed inside GetMBR", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Tests segment of a Boundary
     *
     * @param tg
     * @param g2d
     * @param middleSegment
     * @return
     */
    private static GetBoundarySegmentTooShort(tg: TGLight,
        g2d: Graphics2D,
        middleSegment: int): boolean {
        let lineTooShort: boolean = false;
        try {
            //int middleSegment = tg.Pixels.length / 2 - 1;
            g2d.setFont(tg.get_Font());
            let metrics: FontMetrics = g2d.getFontMetrics();
            let echelonSymbol: string;
            let stringWidthEchelonSymbol: int = 0;

            let pt0: POINT2 = tg.Pixels[middleSegment];
            let pt1: POINT2 = tg.Pixels[middleSegment + 1];
            let dist: double = lineutility.CalcDistanceDouble(pt0, pt1);

            echelonSymbol = tg.get_EchelonSymbol();

            if (echelonSymbol != null) {
                stringWidthEchelonSymbol = metrics.stringWidth(echelonSymbol);
            }

            let tWidth: int = 0;
            let t1Width: int = 0;
            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                tWidth = metrics.stringWidth(tg.get_Name());
            }
            if (tg.get_T1() != null && tg.get_T1().length > 0) {
                t1Width = metrics.stringWidth(tg.get_T1());
            }

            let totalWidth: int = stringWidthEchelonSymbol;
            if (totalWidth < tWidth) {
                totalWidth = tWidth;
            }
            if (totalWidth < t1Width) {
                totalWidth = t1Width;
            }

            switch (tg.get_LineType()) {
                case TacticalLines.BOUNDARY: {
                    if (dist < 1.25 * (totalWidth)) {
                        lineTooShort = true;
                    }
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "GetBoundaryLineTooShort",
                    new RendererException("Failed inside GetBoundaryLineTooShort", exc));
            } else {
                throw exc;
            }
        }
        return lineTooShort;
    }

    /**
     * Handles the line breaks for Boundary and Engineer Work Line
     *
     * @param tg
     * @param g2d
     */
    private static AddBoundaryModifiers(tg: TGLight,
        g2d: Graphics2D,
        clipBounds: Rectangle2D | Array<Point2D> | null): void {
        try {
            let j: int = 0;
            let csFactor: double = 1;
            let foundSegment: boolean = false;
            let pt0: POINT2;
            let pt1: POINT2;
            let ptLast: POINT2;
            let TLineFactor: double = 0;
            let T1LineFactor: double = 0;
            let lineTooShort: boolean = false;
            let countryCode: string = "";
            if (tg.get_AS() !== "") {
                countryCode = " (" + tg.get_AS() + ")";
            }
            if (tg.get_Client() === "cpof3d") {
                csFactor = 0.85;
            }

            let middleSegment: int = Modifier2.getVisibleMiddleSegment(tg, clipBounds);
            //for (j = 0; j < tg.Pixels.length - 1; j++) {
            for (j = middleSegment; j === middleSegment; j++) {
                /* if (tg.get_Client().equalsIgnoreCase("ge")) {
                    if (j != middleSegment) {
                        continue;
                    }
                }*/

                pt0 = tg.Pixels[j];
                pt1 = tg.Pixels[j + 1];
                if (pt0.x < pt1.x) {
                    TLineFactor = -1.3;
                    T1LineFactor = 1;
                } else {
                    if (pt0.x === pt1.x) {
                        if (pt1.y < pt0.y) {
                            TLineFactor = -1;
                            T1LineFactor = 1;
                        } else {
                            TLineFactor = 1;
                            T1LineFactor = -1;
                        }
                    } else {
                        TLineFactor = 1;
                        T1LineFactor = -1.3;
                    }
                }

                //is the segment too short?
                lineTooShort = Modifier2.GetBoundarySegmentTooShort(tg, g2d, j);

                if (lineTooShort === false) {
                    foundSegment = true;
                    Modifier2.AddIntegralModifier(tg, tg.get_Name() + countryCode, Modifier2.aboveMiddle, TLineFactor * csFactor, j, j + 1, true);
                    //the echelon symbol
                    if (tg.get_EchelonSymbol() != null && tg.get_EchelonSymbol() !== "") {
                        Modifier2.AddIntegralModifier(tg, tg.get_EchelonSymbol(), Modifier2.aboveMiddle, -0.20 * csFactor, j, j + 1, true);
                    }
                    //the T1 modifier
                    Modifier2.AddIntegralModifier(tg, tg.get_T1(), Modifier2.aboveMiddle, T1LineFactor * csFactor, j, j + 1, true);
                }
            }//end for loop
            if (foundSegment === false) {
                pt0 = new POINT2();
                pt1 = new POINT2();
                // Get boundary middle segment
                let echelonSymbol: string = tg.get_EchelonSymbol();
                let metrics: FontMetrics = g2d.getFontMetrics();
                let modDist: double = 0;

                if (echelonSymbol != null) {
                    modDist = 1.5 * metrics.stringWidth(echelonSymbol);
                }

                let segDist: double = lineutility.CalcDistanceDouble(tg.Pixels[middleSegment], tg.Pixels[middleSegment + 1]);

                g2d.setFont(tg.get_Font());
                let midpt: POINT2 = lineutility.MidPointDouble(tg.Pixels[middleSegment], tg.Pixels[middleSegment + 1], 0);
                let ptTemp: POINT2;
                if (segDist < modDist) {
                    ptTemp = lineutility.ExtendAlongLineDouble(midpt, tg.Pixels[middleSegment], modDist / 2);
                    pt0.x = ptTemp.x;
                    pt0.y = ptTemp.y;
                    ptTemp = lineutility.ExtendAlongLineDouble(midpt, tg.Pixels[middleSegment + 1], modDist / 2);
                } else {
                    ptTemp = tg.Pixels[middleSegment];
                    pt0.x = ptTemp.x;
                    pt0.y = ptTemp.y;
                    ptTemp = tg.Pixels[middleSegment + 1];
                }
                pt1.x = ptTemp.x;
                pt1.y = ptTemp.y;

                Modifier2.AddIntegralModifier(tg, tg.get_Name() + countryCode, Modifier2.aboveMiddle, TLineFactor * csFactor, middleSegment, middleSegment + 1, true);
                //the echelon symbol
                if (echelonSymbol != null && echelonSymbol !== "") {
                    Modifier2.AddIntegralModifier(tg, echelonSymbol, Modifier2.aboveMiddle, -0.2020 * csFactor, middleSegment, middleSegment + 1, true);
                }
                //the T1 modifier
                Modifier2.AddIntegralModifier(tg, tg.get_T1(), Modifier2.aboveMiddle, T1LineFactor * csFactor, middleSegment, middleSegment + 1, true);
            }//end if foundSegment==false
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddBoundaryModifiers",
                    new RendererException("Failed inside AddBoundaryModifiers", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * added for USAS
     *
     * @param tg
     * @param metrics
     * @deprecated
     */
    private static AddNameAboveDTG(tg: TGLight, metrics: FontMetrics): void {
        try {
            let csFactor: double = 1;
            if (tg.get_Client() === "cpof3d") {
                csFactor = 0.667;
            }
            let label: string = Modifier2.GetCenterLabel(tg);
            let pt0: POINT2 = new POINT2(tg.Pixels[0]);
            let pt1: POINT2 = new POINT2(tg.Pixels[1]);
            let lastIndex: int = tg.Pixels.length - 1;
            let nextToLastIndex: int = tg.Pixels.length - 2;
            let ptLast: POINT2 = new POINT2(tg.Pixels[lastIndex]);
            let ptNextToLast: POINT2 = new POINT2(tg.Pixels[nextToLastIndex]);
            Modifier2.shiftModifierPath(tg, pt0, pt1, ptLast, ptNextToLast);
            let stringWidth: double = metrics.stringWidth(label + " " + tg.get_Name());
            Modifier2.AddIntegralAreaModifier(tg, label + " " + tg.get_Name(), Modifier2.toEnd, 0, pt0, pt1, false);
            pt1 = lineutility.ExtendAlongLineDouble(tg.Pixels[0], tg.Pixels[1], -1.5 * stringWidth);
            Modifier2.AddModifier2(tg, tg.get_DTG(), Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
            Modifier2.AddIntegralAreaModifier(tg, label + " " + tg.get_Name(), Modifier2.toEnd, 0, ptLast, ptNextToLast, false);
            pt0 = tg.Pixels[lastIndex];
            pt1 = lineutility.ExtendAlongLineDouble(tg.Pixels[lastIndex], tg.Pixels[nextToLastIndex], -1.5 * stringWidth);
            Modifier2.AddModifier2(tg, tg.get_DTG(), Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddNameAboveDTG",
                    new RendererException("Failed inside AddNameAboveDTG", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * shifts the path for modifiers that use toEnd to prevent vertical paths
     *
     * @param tg
     * @param pt0
     * @param pt1
     * @param ptLast
     * @param ptNextToLast
     */
    private static shiftModifierPath(tg: TGLight,
        pt0: POINT2,
        pt1: POINT2,
        ptLast: POINT2,
        ptNextToLast: POINT2): void {
        try {
            let p0: POINT2;
            let p1: POINT2;
            let last: double = -1.0;
            switch (tg.get_LineType()) {
                case TacticalLines.BOUNDARY: {
                    for (let j: int = 0; j < tg.Pixels.length - 1; j++) {
                        p0 = tg.Pixels[j];
                        p1 = tg.Pixels[j + 1];
                        //if(p0.x==p1.x)
                        if (Math.abs(p0.x - p1.x) < 1) {
                            p1.x += last;
                            last = -last;
                        }
                    }
                    break;
                }

                case TacticalLines.PDF:
                case TacticalLines.PL:
                case TacticalLines.FEBA:
                case TacticalLines.LOA:
                case TacticalLines.LOD:
                case TacticalLines.RELEASE:
                case TacticalLines.HOL:
                case TacticalLines.BHL:
                case TacticalLines.LDLC:
                case TacticalLines.LL:
                case TacticalLines.EWL:
                case TacticalLines.FCL:
                case TacticalLines.PLD:
                case TacticalLines.NFL:
                case TacticalLines.FLOT:
                case TacticalLines.LC:
                case TacticalLines.HOLD:
                case TacticalLines.BRDGHD:
                case TacticalLines.HOLD_GE:
                case TacticalLines.BRDGHD_GE: {
                    //if (pt0 != null && pt1 != null && pt0.x == pt1.x)
                    if (pt0 != null && pt1 != null && Math.abs(pt0.x - pt1.x) < 1) {
                        pt1.x += 1;
                    }
                    //if (ptLast != null && ptNextToLast != null && ptNextToLast.x == ptLast.x)
                    if (ptLast != null && ptNextToLast != null && Math.abs(ptNextToLast.x - ptLast.x) < 1) {
                        ptNextToLast.x += 1;
                    }
                    break;
                }

                default: {
                    return;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "shiftModifierPath",
                    new RendererException("Failed inside shiftModifierPath", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Adds label on line
     *
     * Replaces areasWithENY()
     *
     * @param label
     * @param tg
     * @param g2d
     * @param twoLabelOnly - true if only add two instances of label to line (used with N modifier)
     *                     Ignored if RendererSettings.TwoLabelOnly is true
     */
    private static addModifierOnLine(label: string, tg: TGLight, g2d: Graphics2D, twoLabelOnly: boolean = false): void {
        if (label == null || label.length === 0) {
            return;
        }
        try {
            if (!RendererSettings.getInstance().getTwoLabelOnly() && !twoLabelOnly) {
                let metrics: FontMetrics = g2d.getFontMetrics();
                let stringWidth: int = metrics.stringWidth(label);
                let foundLongSegment: boolean = false;

                for (let j: int = 0; j < tg.Pixels.length - 1; j++) {
                    let pt0: POINT2 = tg.Pixels[j];
                    let pt1: POINT2 = tg.Pixels[j + 1];
                    let dist: double = lineutility.CalcDistanceDouble(pt0, pt1);
                    if (dist > 1.5 * stringWidth) {
                        foundLongSegment = true;
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, 0, pt0, pt1, false);
                    }
                }
                if (!foundLongSegment) {
                    // did not find a long enough segment
                    let middleSegment: int = tg.Pixels.length / 2 - 1;
                    let middleSegment2: int = tg.Pixels.length - 2;
                    if (tg.Pixels.length > 3) {
                        middleSegment = tg.Pixels.length / 4;
                        middleSegment2 = 3 * tg.Pixels.length / 4;
                    }
                    if (middleSegment !== 0) {
                        Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, middleSegment, middleSegment + 1, false);
                    }
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, middleSegment2, middleSegment2 + 1, false);
                }
            } else {
                if (tg.Pixels.length > 0) {
                    // 2 labels one to the left and the other to the right of graphic.
                    let leftPt: POINT2 = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);
                    let rightPt: POINT2 = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);

                    for (let j: int = 1; j < tg.Pixels.length - 1; j++) {
                        let midPt: POINT2 = lineutility.MidPointDouble(tg.Pixels[j], tg.Pixels[j + 1], 0);
                        if (midPt.x <= leftPt.x) {
                            leftPt = midPt;
                        }
                        if (midPt.x >= rightPt.x) {
                            rightPt = midPt;
                        }
                    }

                    if (leftPt !== rightPt) {

                        Modifier2.AddAreaModifier(tg, label, Modifier2.aboveMiddle, 0, leftPt, leftPt);
                    }

                    Modifier2.AddAreaModifier(tg, label, Modifier2.aboveMiddle, 0, rightPt, rightPt);
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "addModifierOnLine",
                    new RendererException("Failed inside addModifierOnLine", exc));
            } else {
                throw exc;
            }
        }
    }


    /**
     * Adds N modifier on line
     */
    private static addNModifier(tg: TGLight, g2d: Graphics2D): void {
        if (tg.isHostile()) {
            Modifier2.addModifierOnLine(tg.get_N(), tg, g2d, true);
        }
    }

    private static addModifierBottomSegment(tg: TGLight, text: string): void {
        let index: int = 0;
        let y: double = tg.Pixels[index].y + tg.Pixels[index + 1].y;
        for (let i: int = 1; i < tg.Pixels.length - 1; i++) {
            if (tg.Pixels[i].y + tg.Pixels[i + 1].y > y) {
                index = i;
                y = tg.Pixels[index].y + tg.Pixels[index + 1].y;
            }
        }
        Modifier2.AddIntegralModifier(tg, text, Modifier2.aboveMiddle, 0, index, index + 1, false);
    }

    private static addModifierTopSegment(tg: TGLight, text: string): void {
        let index: int = 0;
        let y: double = tg.Pixels[index].y + tg.Pixels[index + 1].y;
        for (let i: int = 1; i < tg.Pixels.length - 1; i++) {
            if (tg.Pixels[i].y + tg.Pixels[i + 1].y < y) {
                index = i;
                y = tg.Pixels[index].y + tg.Pixels[index + 1].y;
            }
        }
        Modifier2.AddIntegralModifier(tg, text, Modifier2.aboveMiddle, 0, index, index + 1, false);
    }

    private static addDTG(tg: TGLight, type: int, lineFactor1: double, lineFactor2: double, pt0: POINT2, pt1: POINT2, metrics: FontMetrics): void {
        if (pt0 == null || pt1 == null) {

            return;
        }


        let maxDTGWidth: double = 0;
        if (pt0.x === pt1.x && pt0.y === pt1.y) {
            let ptUl: POINT2 = new POINT2();
            let ptUr: POINT2 = new POINT2();
            let ptLr: POINT2 = new POINT2();
            let ptLl: POINT2 = new POINT2();
            Modifier2.GetMBR(tg, ptUl, ptUr, ptLr, ptLl);
            maxDTGWidth = lineutility.CalcDistanceDouble(ptUl, ptUr);
        } else {
            maxDTGWidth = lineutility.CalcDistanceDouble(pt0, pt1);
        }

        let dash: string = "";
        if (tg.get_DTG() != null && tg.get_DTG1() != null && tg.get_DTG().length > 0 && tg.get_DTG1().length > 0) {
            dash = " - ";
        }

        let combinedDTG: string = tg.get_DTG() + dash + tg.get_DTG1();

        let stringWidth: double = metrics.stringWidth(combinedDTG);

        if (stringWidth < maxDTGWidth) {
            // Add on one line
            Modifier2.AddModifier(tg, combinedDTG, type, lineFactor1, pt0, pt1);
        } else {
            // add on two lines
            // Use min and max on lineFactors. Always want W1 on top. This fixes when lineFactor < 0 W1 should use lineFactor1
            Modifier2.AddModifier(tg, tg.get_DTG() + dash, type, Math.min(lineFactor1, lineFactor2), pt0, pt1);
            Modifier2.AddModifier(tg, tg.get_DTG1(), type, Math.max(lineFactor1, lineFactor2), pt0, pt1);
        }
    }

    private static getVisibleMiddleSegment(tg: TGLight, clipBounds: Rectangle2D | Array<Point2D> | null): int {
        let middleSegment: int = -1;
        try {
            let clipBoundsPoly: Polygon;
            let clipRect: Rectangle2D;
            let useClipRect: boolean; // true if clipBounds is Rectangle2D otherwise use clipBoundsPoly
            let pt0: POINT2;
            let pt1: POINT2;
            let dist: double = 0;
            let lastPt: POINT2;
            let lineType: int = tg.get_LineType();
            //we want the middle segment to be visible
            middleSegment = Math.trunc((tg.Pixels.length + 1) / 2 - 1);

            let foundVisibleSegment: boolean = false;
            if (clipBounds == null) {
                return middleSegment;
            }

            if (clipBounds instanceof Array) {
                useClipRect = false;
                clipBoundsPoly = new Polygon();
                let clipArray: Array<Point2D> = clipBounds as Array<Point2D>;
                for (let j: int = 0; j < clipArray.length; j++) {
                    let x: int = (clipArray[j]).getX() as int;
                    let y: int = (clipArray[j]).getY() as int;
                    clipBoundsPoly.addPoint(x, y);
                }
            } else if (clipBounds instanceof Rectangle2D) {
                useClipRect = true;
                clipRect = clipBounds as Rectangle2D;
            } else {
                return middleSegment;
            }

            //walk through the segments to find the first visible segment from the middle
            for (let j: int = middleSegment; j < tg.Pixels.length - 1; j++) {
                pt0 = tg.Pixels[j];
                pt1 = tg.Pixels[j + 1];
                dist = lineutility.CalcDistanceDouble(pt0, pt1);
                if (dist < 5) {
                    continue;
                }
                //diagnostic
                if (j > 0 && lineType === TacticalLines.BOUNDARY) {
                    if (lastPt == null) {
                        lastPt = tg.Pixels[j - 1];
                    }
                    if (Modifier2.DoublesBack(lastPt, pt0, pt1)) {
                        continue;
                    }

                    lastPt = null;
                }
                //if either of the points is within the bound then most of the segment is visible
                if (!useClipRect) {
                    if (clipBoundsPoly.contains(pt0.x, pt0.y) || clipBoundsPoly.contains(pt1.x, pt1.y)) {
                        middleSegment = j;
                        foundVisibleSegment = true;
                        break;
                    }
                } else {
                    if (clipRect.contains(pt0.x, pt0.y) || clipRect.contains(pt1.x, pt1.y)) {
                        middleSegment = j;
                        foundVisibleSegment = true;
                        break;
                    }
                }
            }

            if (!foundVisibleSegment) {
                for (let j: int = middleSegment; j > 0; j--) {
                    pt0 = tg.Pixels[j];
                    pt1 = tg.Pixels[j - 1];
                    dist = lineutility.CalcDistanceDouble(pt0, pt1);
                    if (dist < 5) {
                        continue;
                    }
                    //diagnostic
                    if (lineType === TacticalLines.BOUNDARY) {
                        if (lastPt == null) {
                            lastPt = tg.Pixels[j - 1];
                        }

                        if (Modifier2.DoublesBack(lastPt, pt0, pt1)) {
                            continue;
                        }

                        lastPt = null;
                    }
                    //if either of the points is within the bound then most of the segment is visible
                    if (!useClipRect) {
                        if (clipBoundsPoly.contains(pt0.x, pt0.y) || clipBoundsPoly.contains(pt1.x, pt1.y)) {
                            middleSegment = j - 1;
                            foundVisibleSegment = true;
                            break;
                        }
                    } else {
                        if (clipRect.contains(pt0.x, pt0.y) || clipRect.contains(pt1.x, pt1.y)) {
                            middleSegment = j - 1;
                            foundVisibleSegment = true;
                            break;
                        }
                    }
                }
            }

            if (!foundVisibleSegment) {
                middleSegment = Math.trunc(tg.Pixels.length / 2 - 1);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "getMiddleSegment",
                    new RendererException("Failed inside getMiddleSegment", exc));
            } else {
                throw exc;
            }
        }
        return middleSegment;
    }

    /**
     * called repeatedly by RemoveModifiers to remove modifiers which fall
     * outside the symbol MBR
     *
     * @param tg
     * @param modifierType
     */
    private static removeModifier(tg: TGLight,
        modifierType: string): void {
        try {
            let j: int = 0;
            let modifier: Modifier2;
            let n: int = tg.Pixels.length;
            //for (j = 0; j < tg.modifiers.length; j++)
            for (j = 0; j < n; j++) {
                modifier = tg.modifiers[j];

                if (modifier.textID == null) {
                    continue;
                }

                if (modifier.textID.toUpperCase() === modifierType.toUpperCase()) {
                    tg.modifiers.splice(j, 1); // remove modifier
                    break;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "removeModifier",
                    new RendererException("Failed inside removeModifier", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * removes text modifiers for CPOF tactical areas which do not fit inside
     * the symbol MBR
     *
     * @param tg
     * @param g2d
     * @param isTextFlipped true if text is flipped from the last segment
     * orientation
     * @param iteration the instance count for this modifier
     */
    public static RemoveModifiers(tg: TGLight,
        g2d: Graphics2D,
        isTextFlipped: boolean,
        iteration: int): void {
        try {
            //CPOF clients only
            if (tg.get_Client().toLowerCase() !== ("cpof2d") && tg.get_Client().toLowerCase() !== ("cpof3d")) {
                return;
            }

            let j: int = 0;
            let mbrPoly: Polygon;
            //if it's a change 1 rectangular area then use the pixels instead of the mbr
            //because those use aboveMiddle to build angular text
            switch (tg.get_LineType()) {
                case TacticalLines.RECTANGULAR:
                case TacticalLines.CUED_ACQUISITION:
                case TacticalLines.ACA_RECTANGULAR: //aboveMiddle modifiers: slanted text
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR:
                case TacticalLines.ACA_CIRCULAR:
                case TacticalLines.CIRCULAR:
                case TacticalLines.BDZ:
                case TacticalLines.FSA_CIRCULAR:
                case TacticalLines.NOTACK:
                case TacticalLines.ATI_CIRCULAR:
                case TacticalLines.CFFZ_CIRCULAR:
                case TacticalLines.SENSOR_CIRCULAR:
                case TacticalLines.CENSOR_CIRCULAR:
                case TacticalLines.DA_CIRCULAR:
                case TacticalLines.CFZ_CIRCULAR:
                case TacticalLines.ZOR_CIRCULAR:
                case TacticalLines.TBA_CIRCULAR:
                case TacticalLines.TVAR_CIRCULAR:
                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.RFA_CIRCULAR:
                case TacticalLines.KILLBOXBLUE_CIRCULAR:
                case TacticalLines.KILLBOXPURPLE_CIRCULAR: {
                    if (tg.modifiers == null || tg.modifiers.length === 0 || iteration !== 1) {
                        return;
                    }

                    mbrPoly = new Polygon();
                    let n: int = tg.Pixels.length;
                    //for (j = 0; j < tg.Pixels.length; j++)
                    for (j = 0; j < n; j++) {
                        mbrPoly.addPoint(tg.Pixels[j].x as int, tg.Pixels[j].y as int);
                    }

                    break;
                }

                default: {    //area modifiers: horizontal text
                    if (clsUtility.isClosedPolygon(tg.get_LineType()) === false || iteration !== 0) {
                        return;
                    }
                    if (tg.modifiers == null || tg.modifiers.length === 0) {
                        return;
                    }

                    mbrPoly = new Polygon();
                    let t: int = tg.Pixels.length;
                    //for (j = 0; j < tg.Pixels.length; j++)
                    for (j = 0; j < t; j++) {
                        mbrPoly.addPoint(tg.Pixels[j].x as int, tg.Pixels[j].y as int);
                    }
                }

            }

            let font: Font;
            font = tg.get_Font();    //might have to change this
            if (font == null) {
                font = g2d.getFont();
            }
            g2d.setFont(font);
            let metrics: FontMetrics = g2d.getFontMetrics();

            let stringWidth: double = 0;
            let stringHeight: double = 0;
            let wfits: boolean = true;
            let w1fits: boolean = true;
            let ww1fits: boolean = true;
            let hfits: boolean = true;
            let h1fits: boolean = true;
            let h2fits: boolean = true;
            let modifier: Modifier2;
            let modifierType: string = "";
            let s: string = "";
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let pt4: POINT2;
            let lineFactor: double = 0;
            let x: double = 0;
            let y: double = 0;
            let x1: double = 0;
            let y1: double = 0;
            let x2: double = 0;
            let y2: double = 0;            //logic as follows:
            //we have to loop through to determine if each modifiers fits and set its fitsMBR member
            //then run a 2nd loop to remove groups of modifiers based on whether any of the others do not fit
            //e.g. if W does not fit then remove W and W1 modifiers
            let n: int = tg.modifiers.length;
            //for (j = 0; j < tg.modifiers.length; j++)
            for (j = 0; j < n; j++) {
                modifier = tg.modifiers[j];
                if (modifier.textID == null || modifier.textID.length === 0) {
                    continue;
                }

                modifierType = modifier.textID;
                lineFactor = modifier.lineFactor;

                if (isTextFlipped) {
                    lineFactor = -lineFactor;
                }

                s = modifier.text;
                if (s == null || s === "") {
                    continue;
                }
                stringWidth = metrics.stringWidth(s) as double + 1;
                stringHeight = font.getSize() as double;

                if (modifier.type === Modifier2.area) {
                    pt0 = modifier.textPath[0];
                    x1 = pt0.x;
                    y1 = pt0.y;
                    x = x1 as int - Math.trunc(stringWidth / 2);
                    y = y1 as int + Math.trunc(stringHeight / 2) + Math.trunc(1.25 * lineFactor * stringHeight);
                    //pt1 = modifier.textPath[1];
                    x2 = x1 as int + Math.trunc(stringWidth / 2);
                    y2 = y1 as int + Math.trunc(stringHeight / 2) + Math.trunc(1.25 * lineFactor * stringHeight);
                    if (mbrPoly.contains(x, y) && mbrPoly.contains(x2, y2)) {
                        modifier.fitsMBR = true;
                    } else {
                        modifier.fitsMBR = false;
                    }
                } else {
                    if (modifier.type === Modifier2.aboveMiddle) {
                        pt0 = modifier.textPath[0];
                        pt1 = modifier.textPath[1];
                        //double dist=lineutility.CalcDistanceDouble(pt0, pt1);
                        let ptCenter: POINT2 = lineutility.MidPointDouble(pt0, pt1, 0);
                        pt0 = lineutility.ExtendAlongLineDouble(ptCenter, pt0, stringWidth / 2);
                        pt1 = lineutility.ExtendAlongLineDouble(ptCenter, pt1, stringWidth / 2);

                        if (lineFactor >= 0) {
                            pt2 = lineutility.ExtendDirectedLine(ptCenter, pt0, pt0, 3, Math.abs((lineFactor) * stringHeight));
                        } else {
                            pt2 = lineutility.ExtendDirectedLine(ptCenter, pt0, pt0, 2, Math.abs((lineFactor) * stringHeight));
                        }

                        if (lineFactor >= 0) {
                            pt3 = lineutility.ExtendDirectedLine(ptCenter, pt1, pt1, 3, Math.abs((lineFactor) * stringHeight));
                        } else {
                            pt3 = lineutility.ExtendDirectedLine(ptCenter, pt1, pt1, 2, Math.abs((lineFactor) * stringHeight));
                        }

                        x1 = pt2.x;
                        y1 = pt2.y;
                        x2 = pt3.x;
                        y2 = pt3.y;
                        if (mbrPoly.contains(x1, y1) && mbrPoly.contains(x2, y2)) {
                            modifier.fitsMBR = true;
                        } else {
                            modifier.fitsMBR = false;
                        }
                    } else {
                        modifier.fitsMBR = true;
                    }
                }

            }
            n = tg.modifiers.length;
            //for (j = 0; j < tg.modifiers.length; j++)
            for (j = 0; j < n; j++) {
                modifier = tg.modifiers[j];
                if (modifier.textID == null || modifier.textID.length === 0) {
                    continue;
                }

                if (modifier.fitsMBR === false) {
                    if (modifier.textID.toUpperCase() === "W") {
                        wfits = false;
                    } else {
                        if (modifier.textID.toUpperCase() === "W1") {
                            w1fits = false;
                        } else {
                            if (modifier.textID.toUpperCase() === "W+W1") {
                                ww1fits = false;
                            } else {
                                if (modifier.textID.toUpperCase() === "H") {
                                    hfits = false;
                                } else {
                                    if (modifier.textID.toUpperCase() === "H1") {
                                        h1fits = false;
                                    } else {
                                        if (modifier.textID.toUpperCase() === "H2") {
                                            h2fits = false;
                                        }
                                    }

                                }

                            }

                        }

                    }

                }
            }
            if (wfits === false || w1fits === false) {
                Modifier2.removeModifier(tg, "W");
                Modifier2.removeModifier(tg, "W1");
            }
            if (ww1fits === false) {
                Modifier2.removeModifier(tg, "W+W1");
            }
            if (hfits === false || h1fits === false || h2fits === false) {
                Modifier2.removeModifier(tg, "H");
                Modifier2.removeModifier(tg, "H1");
                Modifier2.removeModifier(tg, "H2");
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "RemoveModifeirs",
                    new RendererException("Failed inside RemoveModifiers", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Calculates a segment in the pixels middle by length to hold a string.
     *
     * @param tg
     * @param stringWidth
     * @param segPt0
     * @param segPt1
     */
    private static getPixelsMiddleSegment(tg: TGLight,
        stringWidth: double,
        segPt0: POINT2,
        segPt1: POINT2): void {
        try {
            switch (tg.get_LineType()) {
                case TacticalLines.CFL: {
                    break;
                }

                default: {
                    return;
                }

            }
            let totalLength: int = 0;
            let j: int = 0;
            let dist: double = 0;
            let mid: double = 0;
            let remainder: double = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let midPt: POINT2;
            //first get the total length of all the segments
            let n: int = tg.Pixels.length;
            //for (j = 0; j < tg.Pixels.length - 1; j++)
            for (j = 0; j < n - 1; j++) {
                dist = lineutility.CalcDistanceDouble(tg.Pixels[j], tg.Pixels[j + 1]);
                totalLength += dist;
            }
            mid = totalLength / 2;
            totalLength = 0;
            //walk thru the segments to find the middle
            //for (j = 0; j < tg.Pixels.length - 1; j++)
            for (j = 0; j < n - 1; j++) {
                dist = lineutility.CalcDistanceDouble(tg.Pixels[j], tg.Pixels[j + 1]);
                totalLength += dist;
                if (totalLength >= mid)//current segment contains the middle
                {
                    remainder = totalLength - mid;
                    pt0 = tg.Pixels[j];
                    pt1 = tg.Pixels[j + 1];
                    //calculate the pixels mid point
                    midPt = lineutility.ExtendAlongLineDouble2(pt1, pt0, remainder);
                    pt2 = lineutility.ExtendAlongLineDouble2(midPt, pt0, stringWidth / 2);
                    pt3 = lineutility.ExtendAlongLineDouble2(midPt, pt1, stringWidth / 2);
                    segPt0.x = pt2.x;
                    segPt0.y = pt2.y;
                    segPt1.x = pt3.x;
                    segPt1.y = pt3.y;
                    break;
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "getPixelsMidpoint",
                    new RendererException("Failed inside getPixelsMidpoint", exc));
            } else {
                throw exc;
            }
        }
    }

    private static getChange1Height(tg: TGLight): double {
        let height: double = 0;
        try {
            switch (tg.get_LineType()) {
                //case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.ACA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
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
                    break;
                }

                default: {
                    return 0;
                }

            }
            let x1: double = tg.Pixels[0].x;
            let y1: double = tg.Pixels[0].y;
            let x2: double = tg.Pixels[1].x;
            let y2: double = tg.Pixels[1].y;
            let deltax: double = x2 - x1;
            let deltay: double = y2 - y1;
            height = Math.sqrt(deltax * deltax + deltay * deltay);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "getChange1Height",
                    new RendererException("Failed inside getChange1Height", exc));
            } else {
                throw exc;
            }
        }
        return height;
    }

    /**
     * scale the line factor for closed areas
     *
     * @param tg
     */
    private static scaleModifiers(tg: TGLight): void {
        try {
            if (RendererSettings.getInstance().getAutoCollapseModifiers() === false) {
                return;
            }
            if (tg.get_Client().toLowerCase() !== "ge") {
                return;
            }
            //exit if there are no modifiers or it's not a closed area
            if (tg.modifiers == null || tg.modifiers.length === 0) {
                return;
            }
            let linetype: int = tg.get_LineType();
            let isClosedPolygon: boolean = clsUtility.isClosedPolygon(linetype);
            let isChange1Area: boolean = clsUtility.IsChange1Area(linetype);
            if (!isClosedPolygon && !isChange1Area) {
                return;
            }
            switch (linetype) {
                case TacticalLines.PAA_CIRCULAR:
                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET:
                case TacticalLines.RANGE_FAN:
                case TacticalLines.RANGE_FAN_SECTOR:
                case TacticalLines.RADAR_SEARCH: {
                    return;
                }

                default: {
                    break;
                }

            }
            let ptUl: POINT2 = new POINT2();
            let ptUr: POINT2 = new POINT2();
            let ptLr: POINT2 = new POINT2();
            let ptLl: POINT2 = new POINT2();
            Modifier2.GetMBR(tg, ptUl, ptUr, ptLr, ptLl);
            let sz: int = tg.get_Font().getSize();
            //heightMBR is half the MBR height
            //double heightMBR=Math.abs(ptLr.y-ptUr.y)/2;
            let heightMBR: double = 0;
            let change1Height: double = Modifier2.getChange1Height(tg);
            if (change1Height <= 0) {
                heightMBR = Math.abs(ptLr.y - ptUr.y) / 2;
            } else {
                heightMBR = change1Height;
            }

            let heightModifiers: double = 0;
            let modifiers: Array<Modifier2> = tg.modifiers;
            let modifier: Modifier2;
            let minLF: double = Number.MAX_VALUE;
            let j: int = 0;
            let isValid: boolean = false;
            for (j = 0; j < modifiers.length; j++) {
                modifier = modifiers[j];
                //if(modifier.type == area)
                //type3Area=true;
                if (modifier.type === Modifier2.toEnd) {
                    continue;
                }
                if (modifier.type === Modifier2.aboveMiddle && isChange1Area === false) {
                    continue;
                }
                if (modifier.lineFactor < minLF) {
                    minLF = modifier.lineFactor;
                }
                isValid = true;
            }
            //if there are no 'area' modifiers then exit early
            if (!isValid) {
                return;
            }

            heightModifiers = Math.abs(minLF) * sz;
            let expandModifiers: boolean = false;
            let shrinkModifiers: boolean = false;
            if (heightModifiers > heightMBR) {
                shrinkModifiers = true;
            } else {
                if (heightModifiers < 0.5 * heightMBR) {
                    expandModifiers = true;
                }
            }


            let addEllipsis: boolean = false;
            //modifierE is ellipses modifier
            let modifierE: Modifier2 = new Modifier2();
            if (expandModifiers) {
                let factor: double = heightMBR / heightModifiers;
                factor = 1 + (factor - 1) / 4;
                if (factor > 2) {
                    factor = 2;
                }
                for (j = 0; j < modifiers.length; j++) {
                    modifier = modifiers[j];
                    if (modifier.type === Modifier2.aboveMiddle) {
                        if (isChange1Area === false) {

                            continue;
                        }

                    }
                    else {
                        if (modifier.type !== Modifier2.area) {

                            continue;
                        }

                    }


                    modifier.lineFactor *= factor;
                }
            } else {
                if (shrinkModifiers) {
                    let deltaLF: double = (heightModifiers - heightMBR) / sz;
                    let newLF: double = 0;
                    //use maxLF for the ellipsis modifier
                    let maxLF: double = 0;
                    for (j = 0; j < modifiers.length; j++) {
                        modifier = modifiers[j];
                        if (modifier.type === Modifier2.aboveMiddle) {
                            if (isChange1Area === false) {

                                continue;
                            }

                        }
                        else {
                            if (modifier.type !== Modifier2.area) {

                                continue;
                            }

                        }

                        newLF = modifier.lineFactor + deltaLF;
                        if (Math.abs(newLF * sz) >= heightMBR) {
                            //flag the modifier to remove
                            if (modifier.lineFactor > minLF) {
                                modifierE.type = modifier.type;
                                modifier.type = 7;
                                if (modifier.text.length > 0) {
                                    addEllipsis = true;
                                }
                            }
                            modifier.lineFactor = newLF;
                            //modifierE.type=area;
                            //modifierE.type=modifier.type;
                            modifierE.textPath = modifier.textPath;
                            continue;
                        }
                        modifier.lineFactor = newLF;
                    }
                    let modifiers2: Array<Modifier2> = new Array();
                    for (j = 0; j < modifiers.length; j++) {
                        modifier = modifiers[j];
                        if (modifier.type !== 7) {
                            if (modifier.lineFactor > maxLF) {
                                maxLF = modifier.lineFactor;
                            }
                            modifiers2.push(modifier);
                        }
                    }
                    if (addEllipsis) {
                        let echelonSymbol: string = '\u{25CF}\u{25CF}\u{25CF}';
                        modifierE.text = echelonSymbol;
                        modifierE.lineFactor = maxLF + 1;
                        modifiers2.push(modifierE);
                    }
                    tg.modifiers = modifiers2;
                }
            }
            //end shrink modifiers
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "scaleModifiers",
                    new RendererException("Failed inside scaleModifiers", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Calculate modifiers identical to addModifiers except use geodesic
     * calculations for the center point.
     *
     * @param tg
     * @param g2d
     * @param clipBounds
     * @param converter
     */
    public static AddModifiersGeo(tg: TGLight,
        g2d: Graphics2D,
        clipBounds: Rectangle2D | Array<Point2D> | null,
        converter: IPointConversion): void {
        try {
            //exit early for those not affected
            if (tg.Pixels == null || tg.Pixels.length === 0) {
                return;
            }
            let origPoints: Array<POINT2>;
            let font: Font = tg.get_Font();
            if (font == null) {
                font = g2d.getFont();
            }
            g2d.setFont(font);

            let shiftLines: boolean = Channels.getShiftLines();
            let usas: boolean = false;
            let foundSegment: boolean = false;
            let csFactor: double = 1;
            let dist: double = 0;
            let dist2: double = 0;//this will be used for text spacing the 3d map (CommandCight)
            let midPt: POINT2;
            let northestPtIndex: int = 0;
            let southestPtIndex: int = 0;
            let northestPt: POINT2;
            let southestPt: POINT2;

            let clipRect: Rectangle2D;
            let clipArray: Array<Point2D>;
            if (clipBounds != null && clipBounds instanceof Array) {
                clipArray = clipBounds as Array<Point2D>;
            }
            if (clipBounds != null && clipBounds instanceof Rectangle2D) {
                clipRect = clipBounds as Rectangle2D;
            }

            let metrics: FontMetrics = g2d.getFontMetrics();
            let stringWidth: int = 0;
            let stringWidth2: int = 0;
            let WDash: string = ""; // Dash between W and W1 if they're not empty
            let TSpace: string = "";
            let TDash: string = ""; // Space or dash between label and T modifier if T isn't empty
            if (tg.get_DTG() != null && tg.get_DTG1() != null && tg.get_DTG().length > 0 && tg.get_DTG1().length > 0) {
                WDash = " - ";
            }
            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                TSpace = " ";
                TDash = " - ";
            }

            if (tg.get_Client() === "cpof3d") {
                csFactor = 0.9;
            }

            switch (tg.get_LineType()) {
                case TacticalLines.SERIES:
                case TacticalLines.STRIKWARN:
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
                case TacticalLines.ROUTE_ALT:
                case TacticalLines.DHA_REVD:
                case TacticalLines.DHA:
                case TacticalLines.EPW:
                case TacticalLines.UXO:
                case TacticalLines.FARP:
                case TacticalLines.BSA:
                case TacticalLines.DSA:
                case TacticalLines.CSA:
                case TacticalLines.RSA:
                case TacticalLines.THUNDERSTORMS:
                case TacticalLines.ICING:
                case TacticalLines.FREEFORM:
                case TacticalLines.RHA:
                case TacticalLines.LINTGT:
                case TacticalLines.LINTGTS:
                case TacticalLines.FPF:
                case TacticalLines.GAP:
                case TacticalLines.DEPICT:
                case TacticalLines.AIRHEAD:
                case TacticalLines.FSA:
                case TacticalLines.DIRATKAIR:
                case TacticalLines.OBJ:
                case TacticalLines.AO:
                case TacticalLines.ACA:
                case TacticalLines.FFA:
                case TacticalLines.PAA:
                case TacticalLines.NFA:
                case TacticalLines.RFA:
                case TacticalLines.ATI:
                case TacticalLines.CFFZ:
                case TacticalLines.CFZ:
                case TacticalLines.TBA:
                case TacticalLines.TVAR:
                case TacticalLines.KILLBOXBLUE:
                case TacticalLines.KILLBOXPURPLE:
                case TacticalLines.ZOR:
                case TacticalLines.DA:
                case TacticalLines.SENSOR:
                case TacticalLines.CENSOR:
                case TacticalLines.SMOKE:
                case TacticalLines.BATTLE:
                case TacticalLines.PNO:
                case TacticalLines.PDF:
                case TacticalLines.NAI:
                case TacticalLines.TAI:
                case TacticalLines.BASE_CAMP_REVD:
                case TacticalLines.BASE_CAMP:
                case TacticalLines.GUERILLA_BASE_REVD:
                case TacticalLines.GUERILLA_BASE:
                case TacticalLines.GENERIC_AREA:
                case TacticalLines.ATKPOS:
                case TacticalLines.ASSAULT:
                case TacticalLines.WFZ:
                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
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
                case TacticalLines.SAAFR:
                case TacticalLines.AC:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC:
                case TacticalLines.SC:
                case TacticalLines.LLTR:
                case TacticalLines.AIRFIELD:
                case TacticalLines.GENERAL:
                case TacticalLines.JTAA:
                case TacticalLines.SAA:
                case TacticalLines.SGAA:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ASSY:
                case TacticalLines.EA:
                case TacticalLines.DZ:
                case TacticalLines.EZ:
                case TacticalLines.LZ:
                case TacticalLines.PZ:
                case TacticalLines.LAA:
                case TacticalLines.BOUNDARY:
                case TacticalLines.MINED:
                case TacticalLines.FENCED:
                case TacticalLines.PL:
                case TacticalLines.FEBA:
                case TacticalLines.FCL:
                case TacticalLines.HOLD:
                case TacticalLines.BRDGHD:
                case TacticalLines.HOLD_GE:
                case TacticalLines.BRDGHD_GE:
                case TacticalLines.LOA:
                case TacticalLines.LOD:
                case TacticalLines.LL:
                case TacticalLines.EWL:
                case TacticalLines.RELEASE:
                case TacticalLines.HOL:
                case TacticalLines.BHL:
                case TacticalLines.LDLC:
                case TacticalLines.PLD:
                case TacticalLines.NFL:
                case TacticalLines.MFP:
                case TacticalLines.FSCL:
                case TacticalLines.BCL_REVD:
                case TacticalLines.BCL:
                case TacticalLines.ICL:
                case TacticalLines.IFF_OFF:
                case TacticalLines.IFF_ON:
                case TacticalLines.GENERIC_LINE:
                case TacticalLines.CFL:
                case TacticalLines.RFL:
                case TacticalLines.FLOT:
                case TacticalLines.LC:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.IL:
                case TacticalLines.DRCL:
                case TacticalLines.RETIRE:
                case TacticalLines.FPOL:
                case TacticalLines.RPOL:
                case TacticalLines.WITHDRAW:
                case TacticalLines.WDRAWUP:
                case TacticalLines.BEARING:
                case TacticalLines.BEARING_J:
                case TacticalLines.BEARING_RDF:
                case TacticalLines.ELECTRO:
                case TacticalLines.BEARING_EW:
                case TacticalLines.ACOUSTIC:
                case TacticalLines.ACOUSTIC_AMB:
                case TacticalLines.TORPEDO:
                case TacticalLines.OPTICAL:
                case TacticalLines.RIP:
                case TacticalLines.BOMB:
                case TacticalLines.ZONE:
                case TacticalLines.AT:
                case TacticalLines.STRONG:
                case TacticalLines.MSDZ:
                case TacticalLines.SCREEN:
                case TacticalLines.COVER:
                case TacticalLines.GUARD:
                case TacticalLines.DELAY:
                case TacticalLines.TGMF:
                case TacticalLines.BIO:
                case TacticalLines.CHEM:
                case TacticalLines.NUC:
                case TacticalLines.RAD:
                case TacticalLines.MINE_LINE:
                case TacticalLines.ANCHORAGE_LINE:
                case TacticalLines.ANCHORAGE_AREA:
                case TacticalLines.SPT:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.MAIN:
                case TacticalLines.DIRATKSPT:
                case TacticalLines.DIRATKGND:
                case TacticalLines.LAUNCH_AREA:
                case TacticalLines.DEFENDED_AREA_CIRCULAR:
                case TacticalLines.RECTANGULAR:
                case TacticalLines.CIRCULAR:
                case TacticalLines.RECTANGULAR_TARGET:
                case TacticalLines.LINE:
                case TacticalLines.ASLTXING: {
                    origPoints = lineutility.getDeepCopy(tg.Pixels);
                    break;
                }

                default: {    //exit early for those not applicable
                    return;
                }

            }

            let linetype: int = tg.get_LineType();
            let j: int = 0;
            let k: int = 0;
            let x: double = 0;
            let y: double = 0;

            let lastIndex: int = tg.Pixels.length - 1;
            let nextToLastIndex: int = tg.Pixels.length - 2;
            let pt0: POINT2 = new POINT2(tg.Pixels[0]);
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let ptLast: POINT2 = new POINT2(tg.Pixels[lastIndex]);
            let ptNextToLast: POINT2;
            let DPIScaleFactor: double = RendererSettings.getInstance().getDeviceDPI() / 96.0;

            if (lastIndex > 0) {
                ptNextToLast = new POINT2(tg.Pixels[nextToLastIndex]);
            }

            if (tg.Pixels.length > 1) {
                pt1 = new POINT2(tg.Pixels[1]);
            }

            //prevent vertical paths for modifiers that use toEnd
            Modifier2.shiftModifierPath(tg, pt0, pt1, ptLast, ptNextToLast);

            let label: string = Modifier2.GetCenterLabel(tg);
            let v: string = tg.get_V();
            let ap: string = tg.get_AP();
            let pts: POINT2[] = tg.Pixels;
            //need this for areas and some lines
            let ptCenter: POINT2;
            if (converter != null) //cpof uses latlonconverter so cpof passes null for this
            {
                ptCenter = mdlGeodesic.geodesic_center(tg.LatLongs);
                if (ptCenter != null) {
                    let pt22: Point2D = converter.GeoToPixels(new Point2D(ptCenter.x, ptCenter.y));
                    ptCenter.x = pt22.getX();
                    ptCenter.y = pt22.getY();
                } else {
                    ptCenter = lineutility.CalcCenterPointDouble2(pts, pts.length);
                }
            } else {
                ptCenter = lineutility.CalcCenterPointDouble2(pts, pts.length);
            }

            let middleSegment: int = Math.trunc((tg.Pixels.length + 1) / 2 - 1);
            let middleSegment2: int = 0;

            if (clipRect != null) {
                middleSegment = Modifier2.getVisibleMiddleSegment(tg, clipRect);
            } else {
                if (clipArray != null) {
                    middleSegment = Modifier2.getVisibleMiddleSegment(tg, clipArray);
                }
            }

            if (tg.Pixels.length > 2) {
                pt2 = tg.Pixels[2];
            }
            if (tg.Pixels.length > 3) {
                pt3 = tg.Pixels[3];
            }
            let TLineFactor: double = 0;
            let T1LineFactor: double = 0;
            let lr: POINT2 = new POINT2(tg.Pixels[0]);
            let ll: POINT2 = new POINT2(tg.Pixels[0]);
            let ul: POINT2 = new POINT2(tg.Pixels[0]);
            let ur: POINT2 = new POINT2(tg.Pixels[0]);
            let index: int = 0;
            let nextIndex: int = 0;
            let size: int = tg.Pixels.length;
            let line: Line2D;

            let dAngle0: double = 0;
            let dAngle1: double = 0;
            let stringHeight: int = 0;

            switch (linetype) {
                case TacticalLines.PL: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.toEnd, T1LineFactor, pt0, pt1, false);
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.toEnd, T1LineFactor, ptLast, ptNextToLast, false);
                    break;
                }

                case TacticalLines.FEBA: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.toEnd, 0, pt0, pt1, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.toEnd, 0, ptLast, ptNextToLast, false);
                    break;
                }

                // T before label
                case TacticalLines.FSCL: {
                    pt0 = tg.Pixels[0];
                    pt1 = tg.Pixels[1];
                    pt2 = tg.Pixels[tg.Pixels.length - 1];
                    pt3 = tg.Pixels[tg.Pixels.length - 2];
                    dist = lineutility.CalcDistanceDouble(pt0, pt1);
                    dist2 = lineutility.CalcDistanceDouble(pt2, pt3);
                    stringWidth = (metrics.stringWidth(tg.get_Name() + " " + label) as double) as int;
                    stringWidth2 = (metrics.stringWidth(tg.get_DTG()) as double) as int;
                    if (stringWidth2 > stringWidth) {
                        stringWidth = stringWidth2;
                    }

                    if (tg.Pixels.length === 2) //one segment
                    {
                        pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                        Modifier2.AddModifier2(tg, tg.get_Name() + " " + label, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        if (dist > 3.5 * stringWidth)//was 28stringwidth+5
                        {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, tg.get_Name() + " " + label, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    } else //more than one semgent
                    {
                        let dist3: double = lineutility.CalcDistanceDouble(pt0, pt2);
                        if (dist > stringWidth + 5 || dist >= dist2 || dist3 > stringWidth + 5) {
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, tg.get_Name() + " " + label, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                        if (dist2 > stringWidth + 5 || dist2 > dist || dist3 > stringWidth + 5) {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, tg.get_Name() + " " + label, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    }
                    break;
                }

                // T after label
                case TacticalLines.ICL:
                case TacticalLines.NFL:
                case TacticalLines.BCL_REVD:
                case TacticalLines.RFL: {
                    pt0 = tg.Pixels[0];
                    pt1 = tg.Pixels[1];
                    pt2 = tg.Pixels[tg.Pixels.length - 1];
                    pt3 = tg.Pixels[tg.Pixels.length - 2];
                    dist = lineutility.CalcDistanceDouble(pt0, pt1);
                    dist2 = lineutility.CalcDistanceDouble(pt2, pt3);
                    stringWidth = (metrics.stringWidth(tg.get_Name() + " " + label) as double) as int;
                    stringWidth2 = (metrics.stringWidth(tg.get_DTG()) as double) as int;
                    if (stringWidth2 > stringWidth) {
                        stringWidth = stringWidth2;
                    }

                    if (tg.Pixels.length === 2) //one segment
                    {
                        pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                        Modifier2.AddModifier2(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        if (dist > 3.5 * stringWidth)//was 28stringwidth+5
                        {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    } else //more than one semgent
                    {
                        let dist3: double = lineutility.CalcDistanceDouble(pt0, pt2);
                        if (dist > stringWidth + 5 || dist >= dist2 || dist3 > stringWidth + 5) {
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                        if (dist2 > stringWidth + 5 || dist2 > dist || dist3 > stringWidth + 5) {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    }
                    break;
                }

                case TacticalLines.BCL: {
                    pt0 = tg.Pixels[0];
                    pt1 = tg.Pixels[1];
                    pt2 = tg.Pixels[tg.Pixels.length - 1];
                    pt3 = tg.Pixels[tg.Pixels.length - 2];
                    dist = lineutility.CalcDistanceDouble(pt0, pt1);
                    dist2 = lineutility.CalcDistanceDouble(pt2, pt3);
                    let TMod: string = ""; // Don't add parenthesis if T modifier is empty
                    if (tg.get_Name() != null && tg.get_Name().length > 0) {

                        TMod = " (" + tg.get_Name() + ")";
                    }

                    stringWidth = (metrics.stringWidth(label + TMod) as double) as int;
                    stringWidth2 = (metrics.stringWidth(tg.get_DTG()) as double) as int;
                    if (stringWidth2 > stringWidth) {
                        stringWidth = stringWidth2;
                    }

                    if (tg.Pixels.length === 2) //one segment
                    {
                        pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                        Modifier2.AddModifier2(tg, label + TMod, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        if (dist > 3.5 * stringWidth)//was 28stringwidth+5
                        {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, label + TMod, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    } else //more than one semgent
                    {
                        let dist3: double = lineutility.CalcDistanceDouble(pt0, pt2);
                        if (dist > stringWidth + 5 || dist >= dist2 || dist3 > stringWidth + 5) {
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, label + TMod, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                        if (dist2 > stringWidth + 5 || dist2 > dist || dist3 > stringWidth + 5) {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, label + TMod, Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    }
                    break;
                }

                case TacticalLines.DIRATKSPT:
                case TacticalLines.DIRATKAIR:
                case TacticalLines.DIRATKGND: {
                    midPt = lineutility.MidPointDouble(pt0, pt1, 0);
                    //midPt=lineutility.MidPointDouble(pt0, midPt, 0);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, pt0, midPt, false);
                    Modifier2.addDTG(tg, Modifier2.aboveMiddle, csFactor, 2 * csFactor, pt0, pt1, metrics);
                    break;
                }

                case TacticalLines.SPT:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.MAIN: {
                    if (tg.Pixels.length === 3) //one segment
                    {
                        midPt = lineutility.MidPointDouble(pt0, pt1, 0);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0, midPt, midPt, false);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.aboveMiddle, csFactor, midPt, midPt, false);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 2 * csFactor, midPt, midPt, false);

                    } else {
                        if (tg.Pixels.length === 4) //2 segments
                        {
                            midPt = lineutility.MidPointDouble(pt1, pt2, 0);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0, midPt, midPt, false);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.aboveMiddle, csFactor, midPt, midPt, false);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 2 * csFactor, midPt, midPt, false);
                        } else // 3 or more segments
                        {
                            midPt = lineutility.MidPointDouble(pt1, pt2, 0);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, -csFactor / 2, midPt, midPt, false);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.aboveMiddle, csFactor / 2, midPt, midPt, false);
                            midPt = lineutility.MidPointDouble(pt2, pt3, 0);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, -csFactor / 2, midPt, midPt, false);
                        }
                    }

                    break;
                }

                case TacticalLines.LL:
                case TacticalLines.LOD:
                case TacticalLines.LDLC:
                case TacticalLines.PLD:
                case TacticalLines.RELEASE:
                case TacticalLines.HOL:
                case TacticalLines.BHL:
                case TacticalLines.FCL:
                case TacticalLines.HOLD:
                case TacticalLines.BRDGHD:
                case TacticalLines.HOLD_GE:
                case TacticalLines.BRDGHD_GE:
                case TacticalLines.LOA:
                case TacticalLines.IFF_OFF:
                case TacticalLines.IFF_ON: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveEnd, -csFactor, pt0, pt1, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveEnd, -csFactor, ptLast, ptNextToLast, false);
                    break;
                }

                case TacticalLines.EWL: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveEnd, -csFactor, pt0, pt1, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveEnd, -csFactor, ptLast, ptNextToLast, false);
                    tg.set_EchelonSymbol("");
                    if (clipRect != null) {
                        Modifier2.AddBoundaryModifiers(tg, g2d, clipRect);
                    } else {
                        Modifier2.AddBoundaryModifiers(tg, g2d, clipArray);
                    }
                    break;
                }

                case TacticalLines.AIRFIELD: {
                    ur = new POINT2();
                    ul = new POINT2();
                    ll = new POINT2();
                    lr = new POINT2();
                    Modifier2.GetMBR(tg, ul, ur, lr, ll);
                    stringWidth = metrics.stringWidth(tg.get_H());
                    pt0.x = ur.x + stringWidth / 2 + 1;
                    //pt0.x=ptUr.x+1;
                    //pt0.y=(ptUr.y+ptLr.y)/2-metrics.getFont().getSize()
                    pt0.y = (ur.y + lr.y) / 2 - font.getSize();
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_H(), Modifier2.area, csFactor, pt0, pt0, false);
                    break;
                }

                case TacticalLines.LAUNCH_AREA:
                case TacticalLines.DEFENDED_AREA_CIRCULAR: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TDash + tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.JTAA:
                case TacticalLines.SAA:
                case TacticalLines.SGAA: {
                    Modifier2.addNModifier(tg, g2d);
                    Modifier2.AddIntegralAreaModifier(tg, label + TDash + tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, csFactor, 2 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.FORT:
                case TacticalLines.ZONE: {
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.BDZ: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, pt0, pt0, false);
                    break;
                }

                case TacticalLines.ASSAULT:
                case TacticalLines.ATKPOS:
                case TacticalLines.OBJ:
                case TacticalLines.NAI:
                case TacticalLines.TAI:
                case TacticalLines.BASE_CAMP_REVD:
                case TacticalLines.GUERILLA_BASE_REVD:
                case TacticalLines.ASSY:
                case TacticalLines.EA:
                case TacticalLines.DZ:
                case TacticalLines.EZ:
                case TacticalLines.LZ:
                case TacticalLines.PZ:
                case TacticalLines.AO: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.BASE_CAMP:
                case TacticalLines.GUERILLA_BASE: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.area, -1 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddModifier(tg, tg.get_H(), Modifier2.area, 0, ptCenter, ptCenter);
                    Modifier2.addDTG(tg, Modifier2.area, 1 * csFactor, 2 * csFactor, ptCenter, ptCenter, metrics);
                    Modifier2.addNModifier(tg, g2d);
                    Modifier2.addModifierBottomSegment(tg, tg.get_EchelonSymbol());
                    break;
                }

                case TacticalLines.GENERIC_AREA: {
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_H() + " " + tg.get_Name(), Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, 0.5 * csFactor, 1.5 * csFactor, ptCenter, ptCenter, metrics);
                    Modifier2.addNModifier(tg, g2d);
                    break;
                }

                case TacticalLines.AIRHEAD: {
                    Modifier2.GetMBR(tg, ul, ur, lr, ll);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, csFactor, ll, lr, false);
                    break;
                }

                case TacticalLines.AC:
                case TacticalLines.LLTR:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC:
                case TacticalLines.SAAFR:
                case TacticalLines.SC: {
                    Modifier2.AddIntegralModifier(tg, "Name: " + tg.get_Name(), Modifier2.aboveMiddle, -7 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, "Width: " + tg.get_AM(), Modifier2.aboveMiddle, -6 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, "Min Alt: " + tg.get_X(), Modifier2.aboveMiddle, -5 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, "Max Alt: " + tg.get_X1(), Modifier2.aboveMiddle, -4 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, "DTG Start: " + tg.get_DTG(), Modifier2.aboveMiddle, -3 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, "DTG End: " + tg.get_DTG1(), Modifier2.aboveMiddle, -2 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, 0, middleSegment, middleSegment + 1, false);
                    break;
                }

                case TacticalLines.BEARING_J:
                case TacticalLines.BEARING_RDF:
                case TacticalLines.BEARING:
                case TacticalLines.ELECTRO:
                case TacticalLines.BEARING_EW:
                case TacticalLines.ACOUSTIC:
                case TacticalLines.ACOUSTIC_AMB:
                case TacticalLines.TORPEDO:
                case TacticalLines.OPTICAL: {
                    midPt = lineutility.MidPointDouble(pt0, pt1, 0);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, 0, midPt, midPt, true);
                    pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 3, font.getSize() / 2.0);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_H(), Modifier2.aboveMiddle, 1, pt3, pt3, true);
                    break;
                }

                case TacticalLines.ACA: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.area, -3 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_T1(), Modifier2.area, -2 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "MIN ALT: " + tg.get_X(), Modifier2.area, -1 * csFactor, ptCenter, ptCenter, false, "H");
                    Modifier2.AddIntegralAreaModifier(tg, "MAX ALT: " + tg.get_X1(), Modifier2.area, 0, ptCenter, ptCenter, false, "H1");
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Location(), Modifier2.area, 1 * csFactor, ptCenter, ptCenter, false, "H2");
                    Modifier2.addDTG(tg, Modifier2.area, 2 * csFactor, 3 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.MFP: {
                    pt0 = tg.Pixels[middleSegment];
                    pt1 = tg.Pixels[middleSegment + 1];
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, middleSegment, middleSegment + 1, true);
                    Modifier2.AddIntegralModifier(tg, tg.get_DTG() + WDash, Modifier2.aboveEnd, 1 * csFactor, 0, 1, false);
                    Modifier2.AddIntegralModifier(tg, tg.get_DTG1(), Modifier2.aboveEnd, 2 * csFactor, 0, 1, false);
                    break;
                }

                case TacticalLines.LINTGT: {
                    Modifier2.AddIntegralModifier(tg, ap, Modifier2.aboveMiddle, -0.7 * csFactor, middleSegment, middleSegment + 1, false);
                    break;
                }

                case TacticalLines.LINTGTS: {
                    Modifier2.AddIntegralModifier(tg, ap, Modifier2.aboveMiddle, -0.7 * csFactor, middleSegment, middleSegment + 1, false);
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0.7 * csFactor, middleSegment, middleSegment + 1, false);
                    break;
                }

                case TacticalLines.FPF: {
                    Modifier2.AddIntegralModifier(tg, ap, Modifier2.aboveMiddle, -0.7 * csFactor, 0, 1, false);
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, .7 * csFactor, 0, 1, false);
                    Modifier2.AddIntegralModifier(tg, tg.get_T1(), Modifier2.aboveMiddle, 1.7 * csFactor, 0, 1, false);
                    Modifier2.AddIntegralModifier(tg, v, Modifier2.aboveMiddle, 2.7 * csFactor, 0, 1, false);
                    break;
                }

                case TacticalLines.AT: {
                    Modifier2.AddIntegralAreaModifier(tg, ap, Modifier2.area, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.RECTANGULAR:
                case TacticalLines.CIRCULAR: {
                    Modifier2.AddIntegralAreaModifier(tg, ap, Modifier2.area, 0, pt0, pt0, false);
                    break;
                }

                case TacticalLines.RECTANGULAR_TARGET: {
                    stringWidth = metrics.stringWidth(tg.get_Name());
                    let offsetCenterPoint: POINT2 = new POINT2(ptCenter.x + (stringWidth as double) / 2.0, ptCenter.y);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -1 * csFactor, offsetCenterPoint, offsetCenterPoint, false);
                    break;
                }

                case TacticalLines.SMOKE: {
                    Modifier2.AddIntegralAreaModifier(tg, ap, Modifier2.area, -csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, 1 * csFactor, 2 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.LINE: {
                    Modifier2.AddIntegralModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, csFactor, middleSegment, middleSegment + 1, false);
                    break;
                }

                case TacticalLines.MINED: {
                    if (tg.isHostile()) {
                        pt1 = lineutility.MidPointDouble(pt0, pt1, 0);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.aboveMiddle, 0, pt0, pt1, true);
                        if (middleSegment !== 0) {
                            pt0 = tg.Pixels[middleSegment];
                            pt1 = tg.Pixels[middleSegment + 1];
                            pt1 = lineutility.MidPointDouble(pt0, pt1, 0);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.aboveMiddle, 0, pt0, pt1, true);
                        }
                    }
                    Modifier2.GetMBR(tg, ul, ur, lr, ll);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_H(), Modifier2.aboveMiddle, -1.5 * csFactor, ul, ur, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG(), Modifier2.aboveMiddle, 1.5 * csFactor, ll, lr, false);
                    Modifier2.addModifierOnLine("M", tg, g2d);
                    Modifier2.AddImageModifier(tg, Modifier2.areaImage, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.FENCED: {
                    if (tg.isHostile()) {
                        pt1 = lineutility.MidPointDouble(pt0, pt1, 0);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.aboveMiddle, 0, pt0, pt1, true);
                        if (middleSegment !== 0) {
                            pt0 = tg.Pixels[middleSegment];
                            pt1 = tg.Pixels[middleSegment + 1];
                            pt1 = lineutility.MidPointDouble(pt0, pt1, 0);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.aboveMiddle, 0, pt0, pt1, true);
                        }
                    }
                    Modifier2.addModifierOnLine("M", tg, g2d);
                    Modifier2.AddImageModifier(tg, Modifier2.areaImage, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.ASLTXING: {
                    if (tg.Pixels[1].y > tg.Pixels[0].y) {
                        pt0 = tg.Pixels[1];
                        pt1 = tg.Pixels[3];
                        pt2 = tg.Pixels[0];
                        pt3 = tg.Pixels[2];
                    } else {
                        pt0 = tg.Pixels[0];
                        pt1 = tg.Pixels[2];
                        pt2 = tg.Pixels[1];
                        pt3 = tg.Pixels[3];
                    }
                    pt2 = lineutility.ExtendAlongLineDouble2(pt0, pt2, -20);
                    pt3 = lineutility.ExtendAlongLineDouble2(pt1, pt3, -20);
                    Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0, csFactor, pt2, pt3, metrics);
                    break;
                }

                case TacticalLines.SERIES:
                case TacticalLines.DRCL: {
                    Modifier2.addModifierTopSegment(tg, tg.get_Name());
                    break;
                }

                case TacticalLines.STRIKWARN: {
                    Modifier2.AddIntegralModifier(tg, "1", Modifier2.aboveMiddle, 0, index, index + 1, true);
                    Modifier2.AddIntegralModifier(tg, "2", Modifier2.aboveMiddle, 0, Math.trunc(size / 2), Math.trunc(size / 2) + 1, true);
                    break;
                }

                case TacticalLines.SCREEN:
                case TacticalLines.COVER:
                case TacticalLines.GUARD: {
                    if (tg.Pixels.length === 4) {
                        pt1 = new POINT2(tg.Pixels[1]);
                        pt2 = new POINT2(tg.Pixels[2]);
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, pt1, pt1, true);
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, pt2, pt2, true);
                    } else {
                        stringHeight = Math.trunc(0.5 * font.getSize() as double);
                        dAngle0 = Math.atan2(tg.Pixels[0].y - tg.Pixels[1].y, tg.Pixels[0].x - tg.Pixels[1].x);
                        dAngle1 = Math.atan2(tg.Pixels[0].y - tg.Pixels[2].y, tg.Pixels[0].x - tg.Pixels[2].x);
                        pt0 = new POINT2(tg.Pixels[0]);
                        pt0.x -= 30 * Math.cos(dAngle0);
                        pt0.y -= 30 * Math.sin(dAngle0) + stringHeight;
                        pt1 = new POINT2(tg.Pixels[0]);
                        pt1.x -= 30 * Math.cos(dAngle1);
                        pt1.y -= 30 * Math.sin(dAngle1) + stringHeight;
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, pt0, pt0, true);
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, pt1, pt1, true);
                    }
                    break;
                }

                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE_ALT: {
                    stringWidth = (1.5 * metrics.stringWidth(label + TSpace + tg.get_Name()) as double) as int;
                    let arrowOffset: double = 10 * DPIScaleFactor;
                    if (linetype === TacticalLines.MSR_TWOWAY || linetype === TacticalLines.ASR_TWOWAY) {

                        arrowOffset = 25 * DPIScaleFactor;
                    }

                    let isAlt: boolean = linetype === TacticalLines.MSR_ALT || linetype === TacticalLines.ASR_ALT || linetype === TacticalLines.ROUTE_ALT;
                    if (isAlt) {
                        stringWidth2 = (1.5 * metrics.stringWidth("ALT") as double) as int;
                        if (stringWidth2 > stringWidth) {
                            stringWidth = stringWidth2;
                        }
                    }

                    foundSegment = false;
                    //acevedo - 11/30/2017 - adding option to render only 2 labels.
                    if (RendererSettings.getInstance().getTwoLabelOnly() === false) {
                        for (j = 0; j < tg.Pixels.length - 1; j++) {
                            pt0 = tg.Pixels[j];
                            pt1 = tg.Pixels[j + 1];
                            dist = lineutility.CalcDistanceDouble(pt0, pt1);
                            let arrowSide: int = arraysupport.SupplyRouteArrowSide(pt0, pt1);
                            if (dist < stringWidth) {
                                continue;
                            } else {
                                if (arrowSide === 1 || arrowSide === 2) {
                                    // Shift points to account for arrow shift with DPI
                                    pt0 = lineutility.ExtendDirectedLine(pt1, pt0, pt0, arrowSide, arrowOffset);
                                    pt1 = lineutility.ExtendDirectedLine(pt1, pt0, pt1, arrowSide, arrowOffset);
                                    Modifier2.AddModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -1.7 * csFactor, pt0, pt1);
                                    if (isAlt) {

                                        Modifier2.AddModifier(tg, "ALT", Modifier2.aboveMiddle, 0, pt0, pt1);
                                    }

                                } else {
                                    Modifier2.AddModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1);
                                    if (isAlt) {
                                        pt0 = lineutility.ExtendDirectedLine(pt1, pt0, pt0, arrowSide, arrowOffset);
                                        pt1 = lineutility.ExtendDirectedLine(pt1, pt0, pt1, arrowSide, arrowOffset);
                                        Modifier2.AddModifier(tg, "ALT", Modifier2.aboveMiddle, 0, pt0, pt1);
                                    }
                                }
                                foundSegment = true;
                            }
                        }
                        if (foundSegment === false) {
                            pt0 = tg.Pixels[middleSegment];
                            pt1 = tg.Pixels[middleSegment + 1];
                            let arrowSide: int = arraysupport.SupplyRouteArrowSide(pt0, pt1);
                            if (arrowSide === 1 || arrowSide === 2) {
                                // Shift points to account for arrow shift with DPI
                                pt0 = lineutility.ExtendDirectedLine(pt1, pt0, pt0, arrowSide, arrowOffset);
                                pt1 = lineutility.ExtendDirectedLine(pt1, pt0, pt1, arrowSide, arrowOffset);
                                Modifier2.AddModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -1.7 * csFactor, pt0, pt1);
                                if (isAlt) {

                                    Modifier2.AddModifier(tg, "ALT", Modifier2.aboveMiddle, 0, pt0, pt1);
                                }

                            } else {
                                Modifier2.AddModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1);
                                if (isAlt) {
                                    pt0 = lineutility.ExtendDirectedLine(pt1, pt0, pt0, arrowSide, arrowOffset);
                                    pt1 = lineutility.ExtendDirectedLine(pt1, pt0, pt1, arrowSide, arrowOffset);
                                    Modifier2.AddModifier(tg, "ALT", Modifier2.aboveMiddle, 0, pt0, pt1);
                                }
                            }
                        }
                    }
                    else {
                        // 2 labels one to the north and the other to the south of graphic.
                        northestPtIndex = 0;
                        northestPt = tg.Pixels[northestPtIndex];
                        southestPtIndex = 0;
                        southestPt = tg.Pixels[southestPtIndex];

                        for (j = 0; j < tg.Pixels.length - 1; j++) {
                            pt0 = tg.Pixels[j];
                            if (pt0.y >= northestPt.y) {
                                northestPt = pt0;
                                northestPtIndex = j;
                            }
                            if (pt0.y <= southestPt.y) {
                                southestPt = pt0;
                                southestPtIndex = j;
                            }
                        }

                        Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -1.7 * csFactor, northestPtIndex, northestPtIndex + 1, false);
                        if (isAlt) {

                            Modifier2.AddIntegralModifier(tg, "ALT", Modifier2.aboveMiddle, -0.7 * csFactor, northestPtIndex, northestPtIndex + 1, false);
                        }


                        if (northestPtIndex !== southestPtIndex) {
                            Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -1.7 * csFactor, southestPtIndex, southestPtIndex + 1, false);
                            if (isAlt) {

                                Modifier2.AddIntegralModifier(tg, "ALT", Modifier2.aboveMiddle, -0.7 * csFactor, southestPtIndex, southestPtIndex + 1, false);
                            }

                        }
                    }//else
                    break;
                }

                case TacticalLines.DHA_REVD: {
                    Modifier2.AddIntegralAreaModifier(tg, "DETAINEE", Modifier2.area, -1.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "HOLDING", Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "AREA", Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 1.5 * csFactor, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.EPW: {
                    Modifier2.AddIntegralAreaModifier(tg, "EPW", Modifier2.area, -1.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "HOLDING", Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "AREA", Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 1.5 * csFactor, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.UXO: {
                    Modifier2.addModifierOnLine("UXO", tg, g2d);
                    break;
                }

                case TacticalLines.GENERAL: {
                    Modifier2.addNModifier(tg, g2d);
                    break;
                }

                case TacticalLines.DHA:
                case TacticalLines.FARP: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.BSA:
                case TacticalLines.DSA:
                case TacticalLines.CSA:
                case TacticalLines.RSA: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.RHA: {
                    Modifier2.AddIntegralAreaModifier(tg, "REFUGEE", Modifier2.area, -1.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "HOLDING", Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, "AREA", Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 1.5 * csFactor, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.MSR:
                case TacticalLines.ASR:
                case TacticalLines.ROUTE: {
                    //AddIntegralModifier(tg, label + tg.get_Name(), aboveMiddle, -1*csFactor, middleSegment, middleSegment + 1,false);
                    foundSegment = false;
                    //acevedo - 11/30/2017 - adding option to render only 2 labels.
                    if (RendererSettings.getInstance().getTwoLabelOnly() === false) {
                        for (j = 0; j < tg.Pixels.length - 1; j++) {
                            pt0 = tg.Pixels[j];
                            pt1 = tg.Pixels[j + 1];
                            stringWidth = (1.5 * metrics.stringWidth(label + TSpace + tg.get_Name()) as double) as int;
                            dist = lineutility.CalcDistanceDouble(pt0, pt1);
                            if (dist < stringWidth) {
                                continue;
                            } else {
                                Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -1 * csFactor, j, j + 1, false);
                                foundSegment = true;
                            }
                        }
                        if (foundSegment === false) {
                            Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -1 * csFactor, middleSegment, middleSegment + 1, false);
                        }
                    }
                    else {
                        // 2 labels one to the north and the other to the south of graphic.
                        for (j = 0; j < tg.Pixels.length; j++) {
                            pt0 = tg.Pixels[j];

                            if (northestPt == null) {
                                northestPt = pt0;
                                northestPtIndex = j;
                            }
                            if (southestPt == null) {
                                southestPt = pt0;
                                southestPtIndex = j;
                            }
                            if (pt0.y >= northestPt.y) {
                                northestPt = pt0;
                                northestPtIndex = j;
                            }

                            if (pt0.y <= southestPt.y) {
                                southestPt = pt0;
                                southestPtIndex = j;
                            }
                        }//for
                        middleSegment = northestPtIndex;
                        middleSegment2 = southestPtIndex;

                        if (middleSegment === tg.Pixels.length - 1) {
                            middleSegment -= 1;
                        }
                        if (middleSegment2 === tg.Pixels.length - 1) {
                            middleSegment2 -= 1;
                        }
                        if (middleSegment === middleSegment2) {
                            middleSegment2 -= 1;
                        }

                        // if (middleSegment != middleSegment2) {
                        Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, 0, middleSegment, middleSegment + 1, false);
                        //}
                        Modifier2.AddIntegralModifier(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, 0, middleSegment2, middleSegment2 + 1, false);

                    }//else
                    break;
                }

                case TacticalLines.GAP: {
                    if (tg.Pixels[1].y > tg.Pixels[0].y) {
                        pt0 = tg.Pixels[1];
                        pt1 = tg.Pixels[3];
                        pt2 = tg.Pixels[0];
                        pt3 = tg.Pixels[2];
                    } else {
                        pt0 = tg.Pixels[0];
                        pt1 = tg.Pixels[2];
                        pt2 = tg.Pixels[1];
                        pt3 = tg.Pixels[3];
                    }
                    pt2 = lineutility.ExtendAlongLineDouble2(pt0, pt2, -20);
                    pt3 = lineutility.ExtendAlongLineDouble2(pt1, pt3, -20);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, pt0, pt1, false);
                    Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0, csFactor, pt2, pt3, metrics);
                    break;
                }

                case TacticalLines.BIO:
                case TacticalLines.CHEM:
                case TacticalLines.NUC:
                case TacticalLines.RAD: {
                    Modifier2.AddImageModifier(tg, Modifier2.areaImage, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.ANCHORAGE_LINE: {
                    Modifier2.AddImageModifier(tg, Modifier2.aboveMiddle, -0.15 * csFactor, tg.Pixels[middleSegment], tg.Pixels[middleSegment + 1], false);
                    break;
                }

                case TacticalLines.ANCHORAGE_AREA: {
                    // Add anchor on segment with lowest midpoint
                    y = pt0.y + pt1.y;
                    index = 0;
                    for (j = 1; j < size - 1; j++) {
                        if (y < tg.Pixels[j].y + tg.Pixels[j + 1].y) {
                            index = j;
                            y = tg.Pixels[index].y + tg.Pixels[index + 1].y;
                        }
                    }
                    Modifier2.AddImageModifier(tg, Modifier2.aboveMiddle, -0.25 * csFactor, tg.Pixels[index], tg.Pixels[index + 1], false);
                    break;
                }

                case TacticalLines.MINE_LINE: {
                    Modifier2.AddImageModifier(tg, Modifier2.aboveMiddle, -0.2 * csFactor, tg.Pixels[middleSegment], tg.Pixels[middleSegment + 1], false);
                    if (tg.isHostile()) {
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.toEnd, 0.0, pt0, pt1, false);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.toEnd, 0.0, ptLast, ptNextToLast, false);
                    }
                    break;
                }

                case TacticalLines.DEPICT: {
                    Modifier2.GetMBR(tg, ul, ur, lr, ll);
                    Modifier2.addNModifier(tg, g2d);
                    Modifier2.AddImageModifier(tg, Modifier2.areaImage, 0, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.FFA:
                case TacticalLines.RFA:
                case TacticalLines.NFA: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -1 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, 1 * csFactor, 2 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.PAA: {
                    Modifier2.addModifierOnLine("PAA", tg, g2d);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, 0.5 * csFactor, 1.5 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.FSA: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, 0.5 * csFactor, 1.5 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.ATI:
                case TacticalLines.CFFZ:
                case TacticalLines.CFZ:
                case TacticalLines.TBA:
                case TacticalLines.TVAR:
                case TacticalLines.ZOR:
                case TacticalLines.DA:
                case TacticalLines.SENSOR:
                case TacticalLines.CENSOR:
                case TacticalLines.KILLBOXBLUE:
                case TacticalLines.KILLBOXPURPLE: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.GetMBR(tg, ul, ur, lr, ll);
                    let ptLeft: POINT2 = ul;
                    let ptRight: POINT2 = ur;
                    if (tg.get_Client().toLowerCase() == "ge") {
                        ptLeft.x -= font.getSize() / 2;
                        ptRight.x -= font.getSize() / 2;
                    }
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG() + WDash, Modifier2.toEnd, 0.5 * csFactor, ptLeft, ptRight, false, "W");
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.toEnd, 1.5 * csFactor, ptLeft, ptRight, false, "W1");
                    break;
                }

                case TacticalLines.BATTLE:
                case TacticalLines.STRONG: {
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    Modifier2.addModifierBottomSegment(tg, tg.get_EchelonSymbol());
                    break;
                }

                case TacticalLines.PNO: {
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                    Modifier2.addModifierBottomSegment(tg, tg.get_EchelonSymbol());
                    Modifier2.addNModifier(tg, g2d);
                    break;
                }

                case TacticalLines.WFZ: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -1.5 * csFactor, ptCenter, ptCenter, true);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, true);
                    Modifier2.AddIntegralAreaModifier(tg, "TIME FROM: " + tg.get_DTG(), Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, true, "W");
                    Modifier2.AddIntegralAreaModifier(tg, "TIME TO: " + tg.get_DTG1(), Modifier2.area, 1.5 * csFactor, ptCenter, ptCenter, true, "W1");
                    break;
                }

                case TacticalLines.OBSFAREA: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -1.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG() + WDash, Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false, "W");
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.area, 1.5 * csFactor, ptCenter, ptCenter, false, "W1");
                    break;
                }

                case TacticalLines.OBSAREA: {
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -1 * csFactor, ptCenter, ptCenter, true);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG() + WDash, Modifier2.area, 0, ptCenter, ptCenter, true, "W");
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.area, 1 * csFactor, ptCenter, ptCenter, true, "W1");
                    break;
                }

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
                case TacticalLines.HIMEZ: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -2.5, ptCenter, ptCenter, false, "");
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -1.5, ptCenter, ptCenter, false, "T");
                    Modifier2.AddIntegralAreaModifier(tg, "MIN ALT: " + tg.get_X(), Modifier2.area, -0.5, ptCenter, ptCenter, false, "H");
                    Modifier2.AddIntegralAreaModifier(tg, "MAX ALT: " + tg.get_X1(), Modifier2.area, 0.5, ptCenter, ptCenter, false, "H1");
                    Modifier2.AddIntegralAreaModifier(tg, "TIME FROM: " + tg.get_DTG(), Modifier2.area, 1.5, ptCenter, ptCenter, false, "W");
                    Modifier2.AddIntegralAreaModifier(tg, "TIME TO: " + tg.get_DTG1(), Modifier2.area, 2.5, ptCenter, ptCenter, false, "W1");
                    break;
                }

                case TacticalLines.ENCIRCLE: {
                    if (tg.isHostile()) {
                        Modifier2.AddIntegralModifier(tg, tg.get_N(), Modifier2.aboveMiddle, 0, 0, 1, true);
                        Modifier2.AddIntegralModifier(tg, tg.get_N(), Modifier2.aboveMiddle, 0, middleSegment, middleSegment + 1, true);
                    }
                    break;
                }

                case TacticalLines.LAA: {
                    Modifier2.AddImageModifier(tg, Modifier2.areaImage, 0, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -1 * csFactor, ptCenter, ptCenter, false);
                    break;
                }

                case TacticalLines.BOUNDARY: {
                    if (clipRect != null) {
                        Modifier2.AddBoundaryModifiers(tg, g2d, clipRect);
                    } else {
                        Modifier2.AddBoundaryModifiers(tg, g2d, clipArray);
                    }
                    break;
                }

                case TacticalLines.CFL: {
                    stringWidth = (metrics.stringWidth(label + TSpace + tg.get_Name()) as double) as int;
                    stringWidth2 = (metrics.stringWidth(tg.get_DTG() + WDash + tg.get_DTG1()) as double) as int;
                    if (stringWidth2 > stringWidth) {
                        stringWidth = stringWidth2;
                    }
                    pt0 = new POINT2(tg.Pixels[middleSegment]);
                    pt1 = new POINT2(tg.Pixels[middleSegment + 1]);
                    Modifier2.getPixelsMiddleSegment(tg, stringWidth, pt0, pt1);
                    Modifier2.AddModifier2(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                    Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0.7 * csFactor, 1.7 * csFactor, pt0, pt1, metrics);
                    break;
                }

                case TacticalLines.FLOT: {
                    if (tg.get_H() === "1") {
                        label = "LC";
                    } else {
                        if (tg.get_H() === "2") {
                            label = "";
                        }
                    }

                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.toEnd, 0, pt0, pt1, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.toEnd, 0, ptLast, ptNextToLast, false);

                    if (tg.isHostile()) {
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.toEnd, -1 * csFactor, pt0, pt1, false);
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.toEnd, -1 * csFactor, ptLast, ptNextToLast, false);
                    }
                    break;
                }

                case TacticalLines.LC: {
                    let shiftFactor: double = 1;
                    if (shiftLines) {
                        shiftFactor = 0.5;
                    }
                    if (tg.isHostile()) {
                        if (pt0.x < pt1.x) {
                            TLineFactor = -shiftFactor;//was -1
                        } else {
                            TLineFactor = shiftFactor;//was 1
                        }
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.toEnd, TLineFactor, pt0, pt1, false);
                        if (ptNextToLast.x < ptLast.x) {
                            TLineFactor = -shiftFactor;//was -1
                        } else {
                            TLineFactor = shiftFactor;//was 1
                        }
                        Modifier2.AddIntegralAreaModifier(tg, tg.get_N(), Modifier2.toEnd, TLineFactor, ptLast, ptNextToLast, false);
                    }
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.toEnd, 0, pt0, pt1, false);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.toEnd, 0, ptLast, ptNextToLast, false);
                    break;
                }

                case TacticalLines.CATK: {
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, 1, 0, false);
                    break;
                }

                case TacticalLines.CATKBYFIRE: {
                    stringWidth = (1.5 * metrics.stringWidth(label) as double) as int;
                    pt2 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                    Modifier2.AddModifier2(tg, label, Modifier2.aboveMiddle, 0, pt1, pt2, false);
                    break;
                }

                case TacticalLines.IL: {
                    Modifier2.AddIntegralModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, 1, 0, false);
                    break;
                }

                case TacticalLines.RETIRE:
                case TacticalLines.FPOL:
                case TacticalLines.RPOL:
                case TacticalLines.WITHDRAW:
                case TacticalLines.WDRAWUP: {
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, 0, 1, true);
                    break;
                }

                case TacticalLines.RIP:
                case TacticalLines.BOMB:
                case TacticalLines.TGMF: {
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, ptCenter, ptCenter, true);
                    break;
                }

                case TacticalLines.MSDZ: {
                    Modifier2.AddIntegralAreaModifier(tg, "1", Modifier2.area, 0, pt1, pt1, true);
                    Modifier2.AddIntegralAreaModifier(tg, "2", Modifier2.area, 0, pt2, pt2, true);
                    Modifier2.AddIntegralAreaModifier(tg, "3", Modifier2.area, 0, pt3, pt3, true);
                    break;
                }

                case TacticalLines.DELAY: {
                    Modifier2.AddIntegralModifier(tg, tg.get_DTG(), Modifier2.aboveMiddle, -1 * csFactor, 0, 1, false);
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, 0, 1, true);
                    break;
                }

                case TacticalLines.GENERIC_LINE: {
                    pt0 = tg.Pixels[0];
                    pt1 = tg.Pixels[1];
                    pt2 = tg.Pixels[tg.Pixels.length - 1];
                    pt3 = tg.Pixels[tg.Pixels.length - 2];
                    dist = lineutility.CalcDistanceDouble(pt0, pt1);
                    dist2 = lineutility.CalcDistanceDouble(pt2, pt3);
                    stringWidth = (metrics.stringWidth(tg.get_H() + " " + tg.get_Name()) as double) as int;
                    stringWidth2 = (metrics.stringWidth(tg.get_DTG()) as double) as int;
                    if (stringWidth2 > stringWidth) {
                        stringWidth = stringWidth2;
                    }

                    if (tg.Pixels.length === 2) //one segment
                    {
                        pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                        Modifier2.AddModifier2(tg, tg.get_H() + " " + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                        Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        if (dist > 3.5 * stringWidth)//was 28stringwidth+5
                        {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, tg.get_H() + " " + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    } else //more than one semgent
                    {
                        let dist3: double = lineutility.CalcDistanceDouble(pt0, pt2);
                        if (dist > stringWidth + 5 || dist >= dist2 || dist3 > stringWidth + 5) {
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, tg.get_H() + " " + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                        if (dist2 > stringWidth + 5 || dist2 > dist || dist3 > stringWidth + 5) {
                            pt0 = tg.Pixels[tg.Pixels.length - 1];
                            pt1 = tg.Pixels[tg.Pixels.length - 2];
                            pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);
                            Modifier2.AddModifier2(tg, tg.get_H() + " " + tg.get_Name(), Modifier2.aboveMiddle, -0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG() + WDash, Modifier2.aboveMiddle, 0.7 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 1.7 * csFactor, pt0, pt1, false);
                        }
                    }
                    break;
                }

                default: {
                    break;
                }

            }
            Modifier2.scaleModifiers(tg);
            tg.Pixels = origPoints;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddModifiersGeo",
                    new RendererException("Failed inside AddModifiersGeo", exc));
            } else {
                throw exc;
            }
        }

    }

    /**
     * RFA, NFA, FFA need these for line spacing
     *
     * @param tg
     * @return
     */
    private static getRFALines(tg: TGLight): int {
        let lines: int = 1;
        try {
            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                lines++;
            }
            if (tg.get_DTG() != null && tg.get_DTG().length > 0) {
                lines++;
            } else {
                if (tg.get_DTG1() != null && tg.get_DTG1().length > 0) {
                    lines++;
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddModifiers",
                    new RendererException("Failed inside AddModifiers", exc));
            } else {
                throw exc;
            }
        }
        return lines;
    }

    /**
     * Added sector range fan modifiers based using the calculated orientation
     * indicator points
     *
     * @param tg
     * @param converter
     * @return
     */
    private static addSectorModifiers(tg: TGLight, converter: IPointConversion): void {
        try {
            if (tg.get_LineType() === TacticalLines.RANGE_FAN_SECTOR) {
                let AM: Array<number> = new Array();
                let AN: Array<number> = new Array();
                //get the number of sectors
                let X: string = tg.get_X();
                let altitudes: string[];
                let am: string[] = tg.get_AM().split(",");
                let an: string[] = tg.get_AN().split(",");
                let numSectors: int = an.length / 2;
                //there must be at least one sector
                if (numSectors < 1) {
                    return;
                }
                if (X.length > 0) {
                    altitudes = X.split(",");
                }

                for (let s of am) {
                    AM.push(parseFloat(s));
                }
                for (let s of an) {
                    AN.push(parseFloat(s));
                }

                if (numSectors + 1 > AM.length) {
                    if (parseFloat(am[0]) !== 0) {
                        AM.splice(0, 0, 0);
                    }
                }

                let n: int = tg.Pixels.length;
                //pt0 and pt1 are points for the location indicator
                let pt0: POINT2 = tg.Pixels[n - 5];
                let pt1: POINT2 = tg.Pixels[n - 4];
                let pt02d: Point2D = new Point2D(pt0.x, pt0.y);
                let pt12d: Point2D = new Point2D(pt1.x, pt1.y);
                pt02d = converter.PixelsToGeo(pt02d);
                pt12d = converter.PixelsToGeo(pt12d);
                pt0.x = pt02d.getX();
                pt0.y = pt02d.getY();
                pt1.x = pt12d.getX();
                pt1.y = pt12d.getY();
                //azimuth of the orientation indicator
                let az12: double = mdlGeodesic.GetAzimuth(pt0, pt1);

                let pt2: POINT2;
                let locModifier: Array<POINT2> = new Array();
                //diagnostic
                let ptLeft: POINT2;
                let ptRight: POINT2;
                let locAZModifier: Array<POINT2> = new Array();
                //end section
                let pt22d: Point2D;
                let radius: double = 0;
                for (let k: int = 0; k < numSectors; k++) {
                    if (AM.length < k + 2) {
                        break;
                    }
                    radius = (AM[k] + AM[k + 1]) / 2;
                    pt2 = mdlGeodesic.geodesic_coordinate(pt0, radius, az12);
                    //need locModifier in geo pixels
                    pt22d = new Point2D(pt2.x, pt2.y);
                    pt22d = converter.GeoToPixels(pt22d);
                    pt2.x = pt22d.getX();
                    pt2.y = pt22d.getY();
                    locModifier.push(pt2);
                    //diagnostic
                    if (tg.get_HideOptionalLabels()) {

                        continue;
                    }

                    ptLeft = mdlGeodesic.geodesic_coordinate(pt0, radius, AN[2 * k]);
                    //need ptLeft in geo pixels
                    pt22d = new Point2D(ptLeft.x, ptLeft.y);
                    pt22d = converter.GeoToPixels(pt22d);
                    ptLeft.x = pt22d.getX();
                    ptLeft.y = pt22d.getY();
                    ptRight = mdlGeodesic.geodesic_coordinate(pt0, radius, AN[2 * k + 1]);
                    //need ptRight in geo pixels
                    pt22d = new Point2D(ptRight.x, ptRight.y);
                    pt22d = converter.GeoToPixels(pt22d);
                    ptRight.x = pt22d.getX();
                    ptRight.y = pt22d.getY();
                    locAZModifier.push(ptLeft);
                    locAZModifier.push(ptRight);
                    //end section
                }
                if (altitudes != null) {
                    for (let k: int = 0; k < altitudes.length; k++) {
                        if (k >= locModifier.length) {
                            break;
                        }
                        pt0 = locModifier[k];
                        Modifier2.AddAreaModifier(tg, "ALT " + altitudes[k], Modifier2.area, 0, pt0, pt0);
                    }
                }

                if (!tg.get_HideOptionalLabels()) {
                    for (let k: int = 0; k < numSectors; k++) {
                        pt0 = locModifier[k];
                        Modifier2.AddAreaModifier(tg, "RG " + AM[k + 1], Modifier2.area, -1, pt0, pt0);
                        ptLeft = locAZModifier[2 * k];
                        ptRight = locAZModifier[2 * k + 1];
                        Modifier2.AddAreaModifier(tg, an[2 * k], Modifier2.area, 0, ptLeft, ptLeft);
                        Modifier2.AddAreaModifier(tg, an[2 * k + 1], Modifier2.area, 0, ptRight, ptRight);
                    }
                }
            } else {
                if (tg.get_LineType() === TacticalLines.RADAR_SEARCH) {
                    // Copies functionality from RANGE_FAN_SECTOR with one sector and different modifiers
                    let strLeftRightMinMax: string = tg.get_LRMM();
                    let sector: string[] = strLeftRightMinMax.split(",");
                    let left: double = parseFloat(sector[0]);
                    let right: double = parseFloat(sector[1]);

                    while (left > 360) {
                        left -= 360;
                    }
                    while (right > 360) {
                        right -= 360;
                    }
                    while (left < 0) {
                        left += 360;
                    }
                    while (right < 0) {
                        right += 360;
                    }

                    let orientation: double = 0;
                    if (left > right) {
                        orientation = (left - 360 + right) / 2;
                    } else {
                        orientation = (left + right) / 2;
                    }

                    let dist: double = parseFloat(sector[3]);
                    let radius: double = dist * 1.1;

                    let pt0: POINT2 = tg.LatLongs[0];
                    let ptPixels: Point2D = converter.GeoToPixels(new Point2D(pt0.x, pt0.y));
                    let pt0F: POINT2 = new POINT2();
                    pt0F.x = ptPixels.getX();
                    pt0F.y = ptPixels.getY();
                    pt0F.style = pt0.style;

                    let pt1: POINT2 = mdlGeodesic.geodesic_coordinate(pt0, radius, orientation);
                    ptPixels = converter.GeoToPixels(new Point2D(pt1.x, pt1.y));
                    let pt1F: POINT2 = new POINT2();
                    pt1F.x = ptPixels.getX();
                    pt1F.y = ptPixels.getY();
                    pt1F.style = pt1.style;

                    dist = lineutility.CalcDistanceDouble(pt0F, pt1F);
                    let base: double = 10;
                    if (dist < 100) {
                        base = dist / 10;
                    }
                    if (base < 5) {
                        base = 5;
                    }
                    let basex2: double = 2 * base;
                    let ptTipF: POINT2 = lineutility.ExtendAlongLineDouble(pt0F, pt1F, dist + basex2);  //was 20

                    pt0 = pt0F;
                    pt1 = ptTipF;

                    let AM: Array<number> = new Array();
                    let am: string[] = tg.get_AM().split(",");

                    for (let s of am) {
                        AM.push(parseFloat(s));
                    }

                    if (AM.length < 2) {
                        if (parseFloat(am[0]) !== 0) {
                            AM.splice(0, 0, 0);
                        } else {
                            return;
                        }
                    }

                    let pt02d: Point2D = new Point2D(pt0.x, pt0.y);
                    let pt12d: Point2D = new Point2D(pt1.x, pt1.y);
                    pt02d = converter.PixelsToGeo(pt02d);
                    pt12d = converter.PixelsToGeo(pt12d);
                    pt0.x = pt02d.getX();
                    pt0.y = pt02d.getY();
                    pt1.x = pt12d.getX();
                    pt1.y = pt12d.getY();
                    let az12: double = mdlGeodesic.GetAzimuth(pt0, pt1);

                    let pt22d: Point2D;

                    radius = (AM[0] + AM[1]) / 2;
                    let pt2: POINT2 = mdlGeodesic.geodesic_coordinate(pt0, radius, az12);
                    pt22d = new Point2D(pt2.x, pt2.y);
                    pt22d = converter.GeoToPixels(pt22d);
                    pt2.x = pt22d.getX();
                    pt2.y = pt22d.getY();
                    Modifier2.AddAreaModifier(tg, tg.get_Name(), Modifier2.area, -1, pt2, pt2);
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "addSectorModifiers",
                    new RendererException("Failed inside addSectorModifiers", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Called by the renderer after tg.Pixels has been filled with the
     * calculated points. The modifier path depends on points calculated by
     * CELineArray.
     *
     * @param tg
     */
    public static AddModifiers2(tg: TGLight, converter: IPointConversion): void {
        try {
            if (tg.Pixels == null || tg.Pixels.length === 0) {
                return;
            }
            switch (tg.get_LineType()) {
                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY:
                case TacticalLines.BREACH:
                case TacticalLines.BYPASS:
                case TacticalLines.CANALIZE:
                case TacticalLines.PENETRATE:
                case TacticalLines.CLEAR:
                case TacticalLines.DISRUPT:
                case TacticalLines.FIX:
                case TacticalLines.ISOLATE:
                case TacticalLines.OCCUPY:
                case TacticalLines.RETAIN:
                case TacticalLines.SECURE:
                case TacticalLines.CONTAIN:
                case TacticalLines.SEIZE:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH:
                case TacticalLines.FOLLA:
                case TacticalLines.FOLSP:
                case TacticalLines.ACA_RECTANGULAR:
                case TacticalLines.ACA_CIRCULAR:
                case TacticalLines.RECTANGULAR:
                case TacticalLines.CUED_ACQUISITION:
                case TacticalLines.CIRCULAR:
                case TacticalLines.BDZ:
                case TacticalLines.FSA_CIRCULAR:
                case TacticalLines.NOTACK:
                case TacticalLines.ATI_CIRCULAR:
                case TacticalLines.CFFZ_CIRCULAR:
                case TacticalLines.SENSOR_CIRCULAR:
                case TacticalLines.CENSOR_CIRCULAR:
                case TacticalLines.DA_CIRCULAR:
                case TacticalLines.CFZ_CIRCULAR:
                case TacticalLines.ZOR_CIRCULAR:
                case TacticalLines.TBA_CIRCULAR:
                case TacticalLines.TVAR_CIRCULAR:
                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.RFA_CIRCULAR:
                case TacticalLines.KILLBOXBLUE_CIRCULAR:
                case TacticalLines.KILLBOXPURPLE_CIRCULAR:
                case TacticalLines.BLOCK:
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR:
                case TacticalLines.PAA:
                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET:
                case TacticalLines.PAA_CIRCULAR:
                case TacticalLines.RANGE_FAN:
                case TacticalLines.RANGE_FAN_SECTOR:
                case TacticalLines.RADAR_SEARCH:
                case TacticalLines.SHIP_AOI_CIRCULAR:
                case TacticalLines.MFLANE: {
                    break;
                }

                default: {
                    return;
                }

            }
            //end section
            let origPoints: Array<POINT2> = lineutility.getDeepCopy(tg.Pixels);
            let n: int = tg.Pixels.length;
            if (tg.modifiers == null) {
                tg.modifiers = new Array();
            }
            let font: Font = tg.get_Font();
            let ptCenter: POINT2;
            let csFactor: double = 1;//this will be used for text spacing the 3d map (CommandCight)
            //String affiliation=tg.get_Affiliation();
            let linetype: int = tg.get_LineType();
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let j: int = 0;
            let k: int = 0;
            let dist: double = 0;
            let label: string = Modifier2.GetCenterLabel(tg);
            let X: string[];
            let lastIndex: int = tg.Pixels.length - 1;
            let nextToLastIndex: int = 0;
            if (tg.Pixels.length > 1) {
                nextToLastIndex = tg.Pixels.length - 2;
            }
            let ptLast: POINT2 = new POINT2(tg.Pixels[lastIndex]);
            let ptNextToLast: POINT2;
            if (tg.Pixels.length > 1) {
                ptNextToLast = new POINT2(tg.Pixels[nextToLastIndex]);
            }
            let WDash: string = ""; // Dash between W and W1 if they're not empty
            let TSpace: string = "";
            let TDash: string = ""; // Space or dash between label and T modifier if T isn't empty
            if (tg.get_DTG() != null && tg.get_DTG1() != null && tg.get_DTG().length > 0 && tg.get_DTG1().length > 0) {
                WDash = " - ";
            }
            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                TSpace = " ";
                TDash = " - ";
            }

            let ptLeft: POINT2;
            let ptRight: POINT2;
            let metrics: FontMetrics = new FontMetrics(tg.get_Font())
            let stringWidth: int = 0;
            let rfaLines: int = 0;
            pt0 = new POINT2(tg.Pixels[0]);
            if (tg.Pixels.length > 1) {
                pt1 = new POINT2(tg.Pixels[1]);
            }

            let pts: POINT2[];
            // if the client is the 3d map (CS) then we want to shrink the spacing bnetween
            // the lines of text
            if (tg.get_Client() === "cpof3d") {
                csFactor = 0.9;
            }

            Modifier2.shiftModifierPath(tg, pt0, pt1, ptLast, ptNextToLast);
            switch (linetype) {
                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY: {
                    pt2 = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[3], 0);
                    pt3 = lineutility.MidPointDouble(tg.Pixels[1], tg.Pixels[2], 0);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_V(), Modifier2.aboveEndInside, 0, pt2, pt3, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_H(), Modifier2.aboveStartInside, 0, pt2, pt3, false);
                    Modifier2.addDTG(tg, Modifier2.aboveMiddle, 1.2 * csFactor, 2.2 * csFactor, pt2, pt3, metrics);
                    break;
                }

                case TacticalLines.BREACH:
                case TacticalLines.BYPASS:
                case TacticalLines.CANALIZE: {
                    pt0 = tg.Pixels[1];
                    pt1 = tg.Pixels[2];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddlePerpendicular, -0.125 * csFactor, pt0, pt1, true);
                    break;
                }

                case TacticalLines.PENETRATE:
                case TacticalLines.CLEAR: {
                    pt0 = tg.Pixels[2];
                    pt1 = tg.Pixels[3];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, -0.125 * csFactor, pt0, pt1, true);
                    break;
                }

                case TacticalLines.DISRUPT: {
                    pt0 = tg.Pixels[4];
                    pt1 = tg.Pixels[5];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, -0.125 * csFactor, pt0, pt1, true);
                    break;
                }

                case TacticalLines.FIX: {
                    pt0 = tg.Pixels[0];
                    pt1 = tg.Pixels[1];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, -0.125 * csFactor, pt0, pt1, true);
                    break;
                }

                case TacticalLines.ISOLATE:
                case TacticalLines.OCCUPY:
                case TacticalLines.RETAIN:
                case TacticalLines.SECURE: {
                    pt0 = tg.Pixels[13];
                    pt1 = tg.Pixels[14];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, -0.125 * csFactor, pt0, pt1, true);
                    break;
                }

                case TacticalLines.CONTAIN: {
                    pt0 = tg.Pixels[13];
                    pt1 = tg.Pixels[14];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, -0.125 * csFactor, pt0, pt1, true);

                    // Contain always has "ENY" even if friendly (not N modifier)
                    for (j = 0; j < n; j++) {
                        if (tg.Pixels[j].style === 14) {
                            pt0 = tg.Pixels[j];
                            pt1 = tg.Pixels[j + 1];
                            Modifier2.AddIntegralAreaModifier(tg, "ENY", Modifier2.aboveMiddle, 0, pt0, pt1, true);
                            break;
                        }
                    }
                    break;
                }

                case TacticalLines.SEIZE: {
                    pt0 = tg.Pixels[26];
                    pt1 = tg.Pixels[27];
                    //pt1=lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, -0.125 * csFactor, pt0, pt1, true);
                    break;
                }

                case TacticalLines.DEFENDED_AREA_RECTANGULAR: {
                    ptLeft = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);
                    ptRight = lineutility.MidPointDouble(tg.Pixels[2], tg.Pixels[3], 0);
                    Modifier2.AddIntegralAreaModifier(tg, label + TDash + tg.get_Name(), Modifier2.aboveMiddle, 0, ptLeft, ptRight, false);
                    break;
                }

                case TacticalLines.SHIP_AOI_RECTANGULAR: {
                    if (tg.Pixels[0].x > tg.Pixels[3].x) {
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, csFactor, tg.Pixels[0], tg.Pixels[3], false);
                    } else {
                        Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, csFactor, tg.Pixels[1], tg.Pixels[2], false);
                    }
                    break;
                }

                case TacticalLines.NOTACK: {
                    ptCenter = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[Math.trunc(tg.Pixels.length / 2)], 0);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -1, ptCenter, ptCenter, false);
                    Modifier2.addDTG(tg, Modifier2.area, csFactor, 2 * csFactor, ptCenter, ptCenter, metrics);
                    break;
                }

                case TacticalLines.SHIP_AOI_CIRCULAR: {
                    // Moved from AddModifiersGeo()
                    // AddModifiersGeo() called before getGeoEllipse(). Unable to use getMBR with single anchor point

                    // Get variables from AddModifiersGeo
                    let lr: POINT2 = new POINT2(tg.Pixels[0]);
                    let ll: POINT2 = new POINT2(tg.Pixels[0]);
                    let ul: POINT2 = new POINT2(tg.Pixels[0]);
                    let ur: POINT2 = new POINT2(tg.Pixels[0]);
                    Modifier2.GetMBR(tg, ul, ur, lr, ll);

                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, csFactor, ll, lr, false);
                    break;
                }

                case TacticalLines.MFLANE: {
                    //pt0=tg.Pixels[7];
                    //pt1=tg.Pixels[5];
                    pt0 = tg.Pixels[4];
                    pt1 = tg.Pixels[2];
                    if (tg.Pixels[0].y < tg.Pixels[1].y) {
                        Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0.5 * csFactor, 1.5 * csFactor, pt0, pt1, metrics);
                    } else {
                        Modifier2.addDTG(tg, Modifier2.aboveMiddle, -0.5 * csFactor, -1.5 * csFactor, pt0, pt1, metrics);
                    }
                    break;
                }

                case TacticalLines.CORDONKNOCK:
                case TacticalLines.CORDONSEARCH: {
                    pt0 = tg.Pixels[13];
                    pt1 = tg.Pixels[0];
                    stringWidth = metrics.stringWidth(label);
                    if (pt0.x < pt1.x) {
                        stringWidth = -stringWidth;
                    }
                    pt1 = lineutility.ExtendAlongLineDouble2(pt0, pt1, 0.75 * stringWidth);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.aboveMiddle, 0, pt0, pt1, true);
                    break;
                }

                case TacticalLines.FOLLA: {
                    pt0 = tg.Pixels[0];
                    pt1 = lineutility.MidPointDouble(tg.Pixels[5], tg.Pixels[6], 0);
                    pt1 = lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, pt0, pt1, true);
                    break;
                }

                case TacticalLines.FOLSP: {
                    pt0 = tg.Pixels[3];
                    pt1 = tg.Pixels[6];
                    pt1 = lineutility.ExtendAlongLineDouble(pt1, pt0, -10);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, pt0, pt1, true);
                    break;
                }

                case TacticalLines.ACA_RECTANGULAR: {
                    ptLeft = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);
                    ptRight = lineutility.MidPointDouble(tg.Pixels[2], tg.Pixels[3], 0);
                    Modifier2.AddModifier2(tg, label + TSpace + tg.get_Name(), Modifier2.aboveMiddle, -3 * csFactor, ptLeft, ptRight, false);
                    Modifier2.AddModifier2(tg, tg.get_T1(), Modifier2.aboveMiddle, -2 * csFactor, ptLeft, ptRight, false, "T1");
                    Modifier2.AddModifier2(tg, "MIN ALT: " + tg.get_X(), Modifier2.aboveMiddle, -1 * csFactor, ptLeft, ptRight, false, "H");
                    Modifier2.AddModifier2(tg, "MAX ALT: " + tg.get_X1(), Modifier2.aboveMiddle, 0, ptLeft, ptRight, false, "H1");
                    Modifier2.AddModifier2(tg, "Grids: " + tg.get_H(), Modifier2.aboveMiddle, 1 * csFactor, ptLeft, ptRight, false, "H2");
                    Modifier2.AddModifier2(tg, "EFF: " + tg.get_DTG() + WDash, Modifier2.aboveMiddle, 2 * csFactor, ptLeft, ptRight, false, "W");
                    Modifier2.AddModifier2(tg, tg.get_DTG1(), Modifier2.aboveMiddle, 3 * csFactor, ptLeft, ptRight, false, "W1");
                    break;
                }

                case TacticalLines.ACA_CIRCULAR: {
                    ptCenter = lineutility.CalcCenterPointDouble2(tg.Pixels, tg.Pixels.length);
                    Modifier2.AddIntegralAreaModifier(tg, label + TSpace + tg.get_Name(), Modifier2.area, -3 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddModifier2(tg, tg.get_T1(), Modifier2.area, -2 * csFactor, ptCenter, ptCenter, false, "T1");
                    Modifier2.AddIntegralAreaModifier(tg, "MIN ALT: " + tg.get_X(), Modifier2.area, -1 * csFactor, ptCenter, ptCenter, false, "H");
                    Modifier2.AddIntegralAreaModifier(tg, "MAX ALT: " + tg.get_X1(), Modifier2.area, 0, ptCenter, ptCenter, false, "H1");
                    Modifier2.AddIntegralAreaModifier(tg, "Grids: " + tg.get_H(), Modifier2.area, 1 * csFactor, ptCenter, ptCenter, false, "H2");
                    Modifier2.AddIntegralAreaModifier(tg, "EFF: " + tg.get_DTG() + WDash, Modifier2.area, 2 * csFactor, ptCenter, ptCenter, false, "W");
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_DTG1(), Modifier2.area, 3 * csFactor, ptCenter, ptCenter, false, "W1");
                    break;
                }

                case TacticalLines.FSA_CIRCULAR:
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
                case TacticalLines.KILLBOXPURPLE_CIRCULAR: {
                    ptCenter = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[Math.trunc(tg.Pixels.length / 2)], 0);
                    Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, false);
                    Modifier2.AddOffsetModifier(tg, tg.get_DTG() + WDash, Modifier2.toEnd, -1 * csFactor, tg.Pixels.length / 2, 0, 4, "left");
                    Modifier2.AddOffsetModifier(tg, tg.get_DTG1(), Modifier2.toEnd, 0, tg.Pixels.length / 2, 0, 4, "left");
                    break;
                }

                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.RFA_CIRCULAR: {
                    rfaLines = Modifier2.getRFALines(tg);
                    ptCenter = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[51], 0);
                    switch (rfaLines) {
                        case 3: { //2 valid modifiers and a label
                            Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -1 * csFactor, ptCenter, ptCenter, true);
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, true);
                            Modifier2.addDTG(tg, Modifier2.area, 1 * csFactor, 2 * csFactor, ptCenter, ptCenter, metrics);
                            break;
                        }

                        case 2: { //one valid modifier and a label
                            Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, -0.5 * csFactor, ptCenter, ptCenter, true);
                            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                                Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0.5 * csFactor, ptCenter, ptCenter, true);
                            } else {
                                Modifier2.addDTG(tg, Modifier2.area, 0.5 * csFactor, 1.5 * csFactor, ptCenter, ptCenter, metrics);
                            }
                            break;
                        }

                        default: {    //one label only
                            Modifier2.AddIntegralAreaModifier(tg, label, Modifier2.area, 0, ptCenter, ptCenter, true);
                            break;
                        }

                    }
                    break;
                }

                case TacticalLines.BLOCK: {
                    //for (j = 0; j < tg.Pixels.length; j++)
                    for (j = 0; j < n; j++) {
                        if (tg.Pixels[j].style === 14) {
                            Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, j, j + 1);
                            break;
                        }
                    }
                    break;
                }

                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR: {
                    rfaLines = Modifier2.getRFALines(tg);
                    pt0 = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);
                    pt1 = lineutility.MidPointDouble(tg.Pixels[2], tg.Pixels[3], 0);
                    switch (rfaLines) {
                        case 3: { //two valid modifiers and one label
                            Modifier2.AddModifier2(tg, label, Modifier2.aboveMiddle, -1 * csFactor, pt0, pt1, false);
                            Modifier2.AddModifier2(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, pt0, pt1, false);
                            Modifier2.addDTG(tg, Modifier2.aboveMiddle, 1 * csFactor, 2 * csFactor, pt0, pt1, metrics);
                            break;
                        }

                        case 2: { //one valid modifier and one label
                            Modifier2.AddModifier2(tg, label, Modifier2.aboveMiddle, -0.5 * csFactor, pt0, pt1, false);
                            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                                Modifier2.AddModifier2(tg, tg.get_Name(), Modifier2.aboveMiddle, 0.5 * csFactor, pt0, pt1, false);
                            } else {
                                Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0.5 * csFactor, 1.5 * csFactor, pt0, pt1, metrics);
                            }
                            break;
                        }

                        default: {    //one label only
                            Modifier2.AddModifier2(tg, label, Modifier2.aboveMiddle, 0, pt0, pt1, false);
                            break;
                        }

                    }
                    break;
                }

                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR: {
                    ptLeft = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);
                    ptRight = lineutility.MidPointDouble(tg.Pixels[2], tg.Pixels[3], 0);
                    Modifier2.AddModifier2(tg, label, Modifier2.aboveMiddle, -0.5 * csFactor, ptLeft, ptRight, false);
                    Modifier2.AddModifier2(tg, tg.get_Name(), Modifier2.aboveMiddle, 0.5 * csFactor, ptLeft, ptRight, false);
                    pt0 = tg.Pixels[0];
                    pt1 = tg.Pixels[1];
                    pt2 = tg.Pixels[2];
                    pt3 = tg.Pixels[3];
                    if (tg.get_Client().toLowerCase() == "ge") {
                        pt0.x -= font.getSize() / 2;
                        pt2.x -= font.getSize() / 2;
                    }
                    if (tg.get_Client().toLowerCase() !== "ge")//added 2-27-12
                    {
                        clsUtility.shiftModifiersLeft(pt0, pt3, 12.5);
                        clsUtility.shiftModifiersLeft(pt1, pt2, 12.5);
                    }
                    if (ptLeft.x === ptRight.x) {
                        ptRight.x += 1;
                    }
                    if (ptLeft.x < ptRight.x) {
                        Modifier2.AddModifier(tg, tg.get_DTG() + WDash, Modifier2.toEnd, 0, pt0, pt3);//was 1,2 switched for CPOF
                        Modifier2.AddModifier(tg, tg.get_DTG1(), Modifier2.toEnd, 1 * csFactor, pt0, pt3);//was 1,2
                    } else {
                        Modifier2.AddModifier(tg, tg.get_DTG() + WDash, Modifier2.toEnd, 0, pt2, pt1);//was 3,0 //switched for CPOF
                        Modifier2.AddModifier(tg, tg.get_DTG1(), Modifier2.toEnd, 1 * csFactor, pt2, pt1);//was 3,0
                    }

                    break;
                }

                case TacticalLines.PAA_RECTANGULAR: {
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddlePerpendicular, 0, 0, 1, true);
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, 1, 2, true);
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddlePerpendicular, 0, 2, 3, true);
                    Modifier2.AddIntegralModifier(tg, label, Modifier2.aboveMiddle, 0, 3, 0, true);
                    rfaLines = Modifier2.getRFALines(tg);
                    pt0 = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[1], 0);
                    pt1 = lineutility.MidPointDouble(tg.Pixels[2], tg.Pixels[3], 0);
                    switch (rfaLines) {
                        case 3: { // two valid modifiers
                            Modifier2.AddModifier2(tg, tg.get_Name(), Modifier2.aboveMiddle, -0.5, pt0, pt1, false);
                            Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0.5 * csFactor, 1.5 * csFactor, pt0, pt1, metrics);
                            break;
                        }

                        case 2: { // one valid modifier
                            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                                Modifier2.AddModifier2(tg, tg.get_Name(), Modifier2.aboveMiddle, 0, pt0, pt1, false);
                            } else {
                                Modifier2.addDTG(tg, Modifier2.aboveMiddle, 0, csFactor, pt0, pt1, metrics);
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    break;
                }

                case TacticalLines.PAA_CIRCULAR: {
                    for (let i: int = 0; i < 4; i++) {
                        Modifier2.AddIntegralModifier(tg, label, Modifier2.area, -0.5 * csFactor, n / 4 * i, n / 4 * i, false);
                    }

                    rfaLines = Modifier2.getRFALines(tg);
                    ptCenter = lineutility.MidPointDouble(tg.Pixels[0], tg.Pixels[Math.trunc(n / 2.0 + 0.5)], 0);
                    switch (rfaLines) {
                        case 3: { // two valid modifiers
                            Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, -0.5, ptCenter, ptCenter, false);
                            Modifier2.addDTG(tg, Modifier2.area, 0.5 * csFactor, 1.5 * csFactor, ptCenter, ptCenter, metrics);
                            break;
                        }

                        case 2: { // one valid modifier
                            if (tg.get_Name() != null && tg.get_Name().length > 0) {
                                Modifier2.AddIntegralAreaModifier(tg, tg.get_Name(), Modifier2.area, 0, ptCenter, ptCenter, false);
                            } else {
                                Modifier2.addDTG(tg, Modifier2.area, 0, csFactor, ptCenter, ptCenter, metrics);
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    break;
                }

                case TacticalLines.RANGE_FAN: {
                    if (tg.get_X() != null) {
                        X = tg.get_X().split(",");
                        for (j = 0; j < X.length; j++) {
                            if (tg.Pixels.length > j * 102 + 25) {
                                pt0 = tg.Pixels[j * 102 + 25];
                                Modifier2.AddAreaModifier(tg, "ALT " + X[j], Modifier2.area, 0, pt0, pt0);
                            }
                        }
                    }
                    if (!tg.get_HideOptionalLabels()) {
                        let am: string[] = tg.get_AM().split(",");
                        for (j = 0; j < am.length; j++) {
                            if (tg.Pixels.length > j * 102 + 25) {
                                pt0 = tg.Pixels[j * 102 + 25];
                                //AddAreaModifier(tg, "RG " + am[j], area, -1, pt0, pt0);
                                if (j === 0) {

                                    Modifier2.AddAreaModifier(tg, "MIN RG " + am[j], 3, -1, pt0, pt0);
                                }

                                else {

                                    Modifier2.AddAreaModifier(tg, "MAX RG " + "(" + j.toString() + ") " + am[j], 3, -1, pt0, pt0);
                                }

                            }
                        }
                    }// end if set range fan text
                    break;
                }

                case TacticalLines.RANGE_FAN_SECTOR:
                case TacticalLines.RADAR_SEARCH: {
                    Modifier2.addSectorModifiers(tg, converter);
                    break;
                }

                default: {
                    break;
                }

            }//end switch
            Modifier2.scaleModifiers(tg);
            tg.Pixels = origPoints;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "AddModifiers2",
                    new RendererException("Failed inside AddModifiers2", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Displays the tg modifiers using a client Graphics2D, this is an option
     * provided to clients for displaying modifiers without using shapes
     *
     * @param tg the tactical graphic
     * @param g2d the graphics object for drawing
     * @deprecated
     */
    public static DisplayModifiers(tg: TGLight,
        g2d: Graphics2D): void {
        try {
            let font: Font = g2d.getFont();
            let j: int = 0;
            let modifier: Modifier2;
            g2d.setBackground(Color.white);
            let pt: POINT2;
            let theta: double = 0;
            let stringWidth: int = 0;
            let stringHeight: int = 0;
            let metrics: FontMetrics = g2d.getFontMetrics();
            let s: string = "";
            let x: int = 0;
            let y: int = 0;
            let pt1: POINT2;
            let pt2: POINT2;
            let quadrant: int = -1;
            let n: int = tg.Pixels.length;
            //for (j = 0; j < tg.modifiers.length; j++)
            for (j = 0; j < n; j++) {
                modifier = tg.modifiers[j] as Modifier2;
                let lineFactor: double = modifier.lineFactor;
                s = modifier.text;
                let x1: double = 0;
                let y1: double = 0;
                let x2: double = 0;
                let y2: double = 0;
                pt = modifier.textPath[0];
                x1 = pt.x;
                y1 = pt.y;
                pt = modifier.textPath[1];
                x2 = pt.x;
                y2 = pt.y;
                theta = Math.atan2(y2 - y1, x2 - x1);
                let midPt: POINT2;
                if (x1 > x2) {
                    theta -= Math.PI;
                }
                switch (modifier.type) {
                    case Modifier2.toEnd: { //corresponds to LabelAndTextBeforeLineTG
                        g2d.rotate(theta, x1, y1);
                        stringWidth = metrics.stringWidth(s);
                        stringHeight = font.getSize();
                        if (x1 < x2 || (x1 === x2 && y1 > y2)) {
                            x = x1 as int - stringWidth;
                            y = y1 as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_FontBackColor());
                            g2d.clearRect(x, y, stringWidth, stringHeight);
                            y = y1 as int + Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_TextColor());
                            g2d.drawString(s, x, y);
                        } else {
                            x = x1 as int;
                            y = y1 as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_FontBackColor());
                            g2d.clearRect(x, y, stringWidth, stringHeight);
                            y = y1 as int + Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_TextColor());
                            g2d.drawString(s, x, y);
                        }
                        break;
                    }

                    case Modifier2.aboveMiddle: {
                        midPt = new POINT2((x1 + x2) / 2, (y1 + y2) / 2);
                        g2d.rotate(theta, midPt.x, midPt.y);
                        stringWidth = metrics.stringWidth(s);
                        stringHeight = font.getSize();
                        x = midPt.x as int - stringWidth / 2;
                        y = midPt.y as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                        g2d.setColor(tg.get_FontBackColor());
                        g2d.clearRect(x, y, stringWidth, stringHeight);
                        y = midPt.y as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                        g2d.setColor(tg.get_TextColor());
                        g2d.drawString(s, x, y);
                        break;
                    }

                    case Modifier2.area: {
                        g2d.rotate(0, x1, y1);
                        stringWidth = metrics.stringWidth(s);
                        stringHeight = font.getSize();

                        x = x1 as int - stringWidth / 2;
                        y = y1 as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                        g2d.setColor(tg.get_FontBackColor());
                        g2d.clearRect(x, y, stringWidth, stringHeight);
                        y = y1 as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                        g2d.setColor(tg.get_TextColor());
                        g2d.drawString(s, x, y);
                        break;
                    }

                    case Modifier2.screen: {    //for SCREEN, GUARD, COVER
                        if (tg.Pixels.length >= 14) {
                            pt1 = tg.Pixels[3];
                            pt2 = tg.Pixels[10];
                            quadrant = lineutility.GetQuadrantDouble(pt1, pt2);
                            theta = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
                            switch (quadrant) {
                                case 1: {
                                    theta += Math.PI / 2;
                                    break;
                                }

                                case 2: {
                                    theta -= Math.PI / 2;
                                    break;
                                }

                                case 3: {
                                    theta -= Math.PI / 2;
                                    break;
                                }

                                case 4: {
                                    theta += Math.PI / 2;
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }

                            g2d.rotate(theta, x1, y1);
                            stringWidth = metrics.stringWidth(s);
                            stringHeight = font.getSize();

                            x = x1 as int - stringWidth / 2;
                            y = y1 as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_FontBackColor());
                            g2d.clearRect(x, y, stringWidth, stringHeight);
                            y = y1 as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_TextColor());
                            g2d.drawString(s, x, y);
                        } else {
                            stringWidth = metrics.stringWidth(s);
                            stringHeight = font.getSize();
                            x = tg.Pixels[0].x as int;//(int) x1 - stringWidth / 2;
                            y = tg.Pixels[0].y as int;//(int) y1 - (int) stringHeight / 2 + (int) (lineFactor * stringHeight);
                            g2d.setColor(tg.get_FontBackColor());
                            g2d.clearRect(x, y, stringWidth, stringHeight);
                            y = y as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                            g2d.setColor(tg.get_TextColor());
                            g2d.drawString(s, x, y);
                        }
                        break;
                    }

                    default: {
                        break;
                    }

                }   //end switch
            }   //end for
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "DisplayModifiers",
                    new RendererException("Failed inside DisplayModifiers", exc));
            } else {
                throw exc;
            }
        }
    }//end function

    /**
     * Returns a Shape object for the text background for labels and modifiers
     *
     * @param tg the tactical graphic object
     * @param pt0 1st point of segment
     * @param pt1 last point of segment
     * @param stringWidth string width
     * @param stringHeight string height
     * @param lineFactor number of text lines above or below the segment
     * @param isTextFlipped true if text is flipped
     * @return the modifier shape
     */
    public static BuildModifierShape(
        tg: TGLight,
        pt0: POINT2,
        pt1: POINT2,
        stringWidth: int,
        stringHeight: int,
        lineFactor: double,
        isTextFlipped: boolean): Shape2 {
        let modifierFill: Shape2;
        try {

            let ptTemp0: POINT2 = new POINT2(pt0);
            let ptTemp1: POINT2 = new POINT2(pt1);

            if (isTextFlipped) {
                lineFactor += 1;
            }

            if (lineFactor < 0) //extend pt0,pt1 above the line
            {
                ptTemp0 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 2, -lineFactor * stringHeight);
                ptTemp1 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 2, -lineFactor * stringHeight);
            }
            if (lineFactor > 0) //extend pt0,pt1 below the line
            {
                ptTemp0 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 3, lineFactor * stringHeight);
                ptTemp1 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 3, lineFactor * stringHeight);
            }
            if (ptTemp0.y === ptTemp1.y) {
                ptTemp0.y += 1;
            }

            let pt3: POINT2;
            let pt4: POINT2;
            let pt5: POINT2;
            let pt6: POINT2;
            let pt7: POINT2;
            pt3 = lineutility.ExtendAlongLineDouble(ptTemp0, ptTemp1, -stringWidth);
            pt4 = lineutility.ExtendDirectedLine(ptTemp1, ptTemp0, pt3, 0, stringHeight / 2);
            pt5 = lineutility.ExtendDirectedLine(ptTemp1, ptTemp0, pt3, 1, stringHeight / 2);
            pt6 = lineutility.ExtendDirectedLine(ptTemp1, ptTemp0, ptTemp0, 1, stringHeight / 2);
            pt7 = lineutility.ExtendDirectedLine(ptTemp1, ptTemp0, ptTemp0, 0, stringHeight / 2);
            modifierFill = new Shape2(Shape2.SHAPE_TYPE_MODIFIER_FILL);

            modifierFill.moveTo(pt4);
            modifierFill.lineTo(pt5);
            modifierFill.lineTo(pt6);
            modifierFill.lineTo(pt7);
            modifierFill.lineTo(pt4);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "BuildModifierShape",
                    new RendererException("Failed inside BuildModifierShape", exc));
            } else {
                throw exc;
            }
        }
        return modifierFill;
    }

    /**
     * For BOUNDARY and other line types which require breaks for the integral
     * text. Currently only boundary uses this
     *
     * @param tg
     * @param g2d the graphics object for drawing
     * @param shapes the shape array
     */
    public static GetIntegralTextShapes(tg: TGLight,
        g2d: Graphics2D,
        shapes: Array<Shape2>): void {
        try {
            if (tg.Pixels == null || shapes == null) {
                return;
            }

            let hmap: Map<number, Color> = clsUtility.getMSRSegmentColors(tg);
            let color: Color;

            let shape: Shape2;
            let segShape: Shape2;//diangostic 1-22-13
            g2d.setFont(tg.get_Font());
            let j: int = 0;
            let affiliation: string;
            let metrics: FontMetrics = g2d.getFontMetrics();
            let echelonSymbol: string;
            let stringWidthEchelonSymbol: int = 0;
            //boolean lineTooShort = false;
            let ptEchelonStart: POINT2;
            let ptEchelonEnd: POINT2;
            let midpt: POINT2;
            let
                ptENY0Start: POINT2;
            let ptENY0End: POINT2;
            let ptENY1Start: POINT2;
            let ptENY1End: POINT2;
            let pt0: POINT2;
            let pt1: POINT2;
            let dist: double = 0;
            let stroke: BasicStroke;
            switch (tg.get_LineType()) {
                case TacticalLines.BOUNDARY: {
                    echelonSymbol = tg.get_EchelonSymbol();
                    //shapes = new ArrayList();
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setLineColor(tg.get_LineColor());
                    shape.set_Style(tg.get_LineStyle());
                    stroke = clsUtility.getLineStroke(tg.get_LineThickness(), shape.get_Style(), tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                    shape.setStroke(stroke);
                    if (echelonSymbol != null && echelonSymbol.length > 0) {
                        stringWidthEchelonSymbol = metrics.stringWidth(echelonSymbol);
                    }
                    //diagnostic
                    if (hmap == null || hmap.size === 0) {
                        shape.moveTo(tg.Pixels[0]);
                        for (j = 1; j < tg.Pixels.length; j++) {
                            shape.lineTo(tg.Pixels[j]);
                        }
                        shapes.push(shape);
                        break;
                    }
                    //end section
                    let n: int = tg.Pixels.length;
                    //for (j = 0; j < tg.Pixels.length - 1; j++)
                    for (j = 0; j < n - 1; j++) {
                        segShape = null;
                        if (hmap != null) {
                            if (hmap.has(j)) {
                                color = hmap.get(j) as Color;
                                segShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                                segShape.setLineColor(color);
                                segShape.set_Style(tg.get_LineStyle());
                                segShape.setStroke(stroke);
                            }
                        }

                        pt0 = tg.Pixels[j];
                        pt1 = tg.Pixels[j + 1];
                        //lineTooShort = GetBoundarySegmentTooShort(tg, g2d, j);
                        if (segShape != null) {
                            segShape.moveTo(pt0);
                        } else {
                            shape.moveTo(pt0);
                        }

                        //uncoment comment to remove line breaks for GE
                        //if (lineTooShort || tg.get_Client() === "ge")
                        if (tg.get_Client() === "ge" || Modifier2.GetBoundarySegmentTooShort(tg, g2d, j) === true) {
                            if (segShape != null) {
                                segShape.lineTo(pt1);
                                shapes.push(segShape);
                                continue;
                            } else {
                                shape.lineTo(pt1);
                                continue;
                            }
                        }

                        midpt = lineutility.MidPointDouble(pt0, pt1, 0);
                        if (segShape != null) {
                            segShape.moveTo(pt0);
                        } else {
                            shape.moveTo(pt0);
                        }

                        if (stringWidthEchelonSymbol > 0) {
                            midpt = lineutility.MidPointDouble(pt0, pt1, 0);
                            dist = lineutility.CalcDistanceDouble(pt0, midpt) - stringWidthEchelonSymbol / 1.5;
                            ptEchelonStart = lineutility.ExtendAlongLineDouble(pt0, pt1, dist);
                            dist = lineutility.CalcDistanceDouble(pt0, midpt) + stringWidthEchelonSymbol / 1.5;
                            ptEchelonEnd = lineutility.ExtendAlongLineDouble(pt0, pt1, dist);
                            if (segShape != null) {
                                segShape.lineTo(ptEchelonStart);
                                segShape.moveTo(ptEchelonEnd);
                            } else {
                                shape.lineTo(ptEchelonStart);
                                shape.moveTo(ptEchelonEnd);
                            }
                        }
                        if (segShape != null) {
                            segShape.lineTo(pt1);
                        } else {
                            shape.lineTo(pt1);
                        }
                        if (segShape != null) {
                            shapes.push(segShape);
                        }
                    }//end for
                    shapes.push(shape);
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "GetIntegralTextShapes",
                    new RendererException("Failed inside GetIntegralTextShapes", exc));
            } else {
                throw exc;
            }
        }
    }

    private static switchDirection(direction: int): int {
        let result: int = -1;
        switch (direction) {
            case 0: {
                return 1;
            }

            case 1: {
                return 0;
            }

            case 2: {
                return 3;
            }

            case 3: {
                return 2;
            }


            default:

        }
        return result;
    }

    /**
     * Displays the modifiers to a Graphics2D from a BufferedImage
     *
     * @param tg the tactical graphic
     * @param g2d the Graphic for drawing
     * @param shapes the shape array
     * @param isTextFlipped true if text is flipped
     * @param converter to convert between geographic and pixel coordinates
     */
    public static DisplayModifiers2(tg: TGLight,
        g2d: Graphics2D,
        shapes: Array<Shape2>,
        isTextFlipped: boolean,
        converter: IPointConversion): void {
        try {
            if (shapes == null) {
                return;
            }

            if (tg.modifiers == null || tg.modifiers.length === 0) {
                return;
            }
            let font: Font;
            let j: int = 0;
            let modifier: Modifier2;
            let fontBackColor: Color = tg.get_FontBackColor();
            let theta: double = 0;
            let stringWidth: double = 0;
            let stringHeight: double = 0;
            let s: string = "";
            let image: SVGSymbolInfo;
            let x: int = 0;
            let y: int = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let quadrant: int = -1;
            let shape2: Shape2;
            let lineType: int = tg.get_LineType();
            font = tg.get_Font();    //might have to change this
            if (font == null) {
                font = g2d.getFont();
            }
            if (font.getSize() === 0) {
                return;
            }
            g2d.setFont(font);
            let metrics: FontMetrics = g2d.getFontMetrics();
            //we need a background color
            if (fontBackColor != null) {
                g2d.setBackground(fontBackColor);
            } else {
                g2d.setBackground(Color.white);
            }

            let direction: int = -1;
            let glyphPosition: Point;
            for (j = 0; j < tg.modifiers.length; j++) {
                modifier = tg.modifiers[j] as Modifier2;

                let lineFactor: double = modifier.lineFactor;

                if (isTextFlipped) {
                    lineFactor = -lineFactor;
                }

                s = modifier.text;
                if (s == null || s === "") {

                    image = modifier.image;
                    if (image == null) {
                        continue;
                    }
                }
                stringWidth = s != null ? metrics.stringWidth(s) as double + 1 : image.getSymbolBounds().width + 1;
                stringHeight = s != null ? font.getSize() as double : image.getSymbolBounds().height;

                let x1: double = 0;
                let y1: double = 0;
                let x2: double = 0;
                let y2: double = 0;
                let dist: double = 0;
                pt0 = modifier.textPath[0];
                x1 = Math.round(pt0.x);
                y1 = Math.round(pt0.y);
                pt1 = modifier.textPath[1];
                x2 = Math.round(pt1.x);
                y2 = Math.round(pt1.y);
                theta = Math.atan2(y2 - y1, x2 - x1);
                let midPt: POINT2;
                if (x1 > x2) {
                    theta -= Math.PI;
                }
                pt0 = new POINT2(x1, y1);
                pt1 = new POINT2(x2, y2);
                midPt = new POINT2((x1 + x2) / 2, (y1 + y2) / 2);
                let modifierPosition: Point2D;  //use this if using justify
                let justify: int = ShapeInfo.justify_left;
                switch (modifier.type) {
                    case Modifier2.aboveEnd: // On line
                    case Modifier2.toEnd: { // Next to line
                        if (x1 === x2) {
                            x2 += 1;
                        }

                        if (lineFactor >= 0) {
                            direction = 2;
                        } else {
                            direction = 3;
                        }

                        if (lineType === TacticalLines.LC || tg.get_Client().toLowerCase() === "ge") {
                            direction = Modifier2.switchDirection(direction);
                        }

                        if ((modifier.type === Modifier2.toEnd && x1 < x2) || (modifier.type === Modifier2.aboveEnd && x2 < x1)) {
                            justify = ShapeInfo.justify_right;
                        } else {
                            justify = ShapeInfo.justify_left;
                        }

                        pt3 = lineutility.ExtendDirectedLine(pt1, pt0, pt0, direction, lineFactor * stringHeight);

                        glyphPosition = new Point(pt3.x as int, pt3.y as int);
                        modifierPosition = new Point2D(pt3.x, pt3.y);
                        break;
                    }

                    case Modifier2.aboveStartInside: {
                        pt3 = lineutility.ExtendAlongLineDouble(pt0, pt1, stringWidth);

                        glyphPosition = new Point(pt3.x as int, pt3.y as int);
                        modifierPosition = new Point2D(pt3.x as int, pt3.y);
                        break;
                    }

                    case Modifier2.aboveEndInside: {
                        pt3 = lineutility.ExtendAlongLineDouble(pt1, pt0, stringWidth);

                        glyphPosition = new Point(pt3.x as int, pt3.y as int);
                        modifierPosition = new Point2D(pt3.x as int, pt3.y);
                        break;
                    }

                    case Modifier2.aboveMiddle:
                    case Modifier2.aboveMiddlePerpendicular: {
                        pt2 = midPt;
                        if (tg.get_Client() === "2D") {
                            lineFactor += 0.5;
                        }

                        if (lineFactor >= 0) {
                            pt3 = lineutility.ExtendDirectedLine(pt0, pt2, pt2, 3, Math.abs((lineFactor) * stringHeight));
                            midPt = lineutility.ExtendDirectedLine(pt0, midPt, midPt, 3, Math.abs((lineFactor) * stringHeight));
                        } else {
                            pt3 = lineutility.ExtendDirectedLine(pt0, pt2, pt2, 2, Math.abs((lineFactor) * stringHeight));
                            midPt = lineutility.ExtendDirectedLine(pt0, midPt, midPt, 2, Math.abs((lineFactor) * stringHeight));
                        }
                        //pt3=lineutility.ExtendDirectedLine(pt0, pt2, pt2, 2, lineFactor*stringHeight);
                        if (x1 === x2 && y1 > y2) {
                            pt3 = lineutility.ExtendDirectedLine(pt0, pt2, pt2, 1, Math.abs((lineFactor) * stringHeight));
                            midPt = lineutility.ExtendDirectedLine(pt0, midPt, midPt, 1, Math.abs((lineFactor) * stringHeight));
                        }
                        if (x1 === x2 && y1 < y2) {
                            pt3 = lineutility.ExtendDirectedLine(pt0, pt2, pt2, 0, Math.abs((lineFactor) * stringHeight));
                            midPt = lineutility.ExtendDirectedLine(pt0, midPt, midPt, 0, Math.abs((lineFactor) * stringHeight));
                        }

                        glyphPosition = new Point(pt3.x as int, pt3.y as int);
                        justify = ShapeInfo.justify_center;
                        modifierPosition = new Point2D(midPt.x, midPt.y);

                        if (modifier.type === Modifier2.aboveMiddlePerpendicular) {
                            // Need to negate the original rotation
                            if (x1 > x2) {
                                theta += Math.PI;
                            }
                            // Adjust the label rotation based on the y values
                            if (y1 > y2) {
                                theta += Math.PI;
                            }
                            // Rotate by 90 degrees. This is how we rotate the label perpendicular to the line
                            theta -= Math.PI / 2;
                        }
                        break;
                    }

                    case Modifier2.area: {
                        theta = 0;

                        //y = (int) y1 + (int) (stringHeight / 2) + (int) (1.25 * lineFactor * stringHeight);
                        y = y1 as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                        x = image != null ? (x1 - stringWidth / 3) as int : x1 as int;

                        glyphPosition = new Point(x, y);
                        justify = ShapeInfo.justify_center;
                        modifierPosition = new Point2D(x, y);
                        break;
                    }

                    case Modifier2.areaImage: {
                        glyphPosition = new Point(x1 as int, y1 as int);
                        justify = ShapeInfo.justify_center;
                        modifierPosition = new Point2D(x1 as int, y1 as int);
                        break;
                    }

                    case Modifier2.screen: {    //for SCREEN, GUARD, COVER, not currently used
                        if (tg.Pixels.length >= 14) {
                            pt1 = tg.Pixels[3];
                            pt2 = tg.Pixels[10];
                            quadrant = lineutility.GetQuadrantDouble(pt1, pt2);
                            theta = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
                            if (Math.abs(theta) < Math.PI / 8) {
                                if (theta < 0) {
                                    theta -= Math.PI / 2;
                                } else {
                                    theta += Math.PI / 2;
                                }
                            }
                            switch (quadrant) {
                                case 1: {
                                    theta += Math.PI / 2;
                                    break;
                                }

                                case 2: {
                                    theta -= Math.PI / 2;
                                    break;
                                }

                                case 3: {
                                    theta -= Math.PI / 2;
                                    break;
                                }

                                case 4: {
                                    theta += Math.PI / 2;
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }

                            x = x1 as int - stringWidth as int / 2;
                            y = y1 as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            y = y1 as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                        } else {
                            theta = 0;
                            x = tg.Pixels[0].x as int;
                            y = tg.Pixels[0].y as int;
                            x = x as int - stringWidth as int / 2;
                            y = y as int - Math.trunc(stringHeight / 2) + (lineFactor * stringHeight) as int;
                            y = y as int + (stringHeight / 2) as int + (lineFactor * stringHeight) as int;
                        }

                        glyphPosition = new Point(x, y);
                        //glyphPosition=new Point2D(x,y);
                        break;
                    }

                    default: {
                        break;
                    }

                }   //end switch

                shape2 = new Shape2(Shape2.SHAPE_TYPE_MODIFIER_FILL);

                shape2.setStroke(new BasicStroke(0, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 3));

                if (tg.get_TextColor() != null) {
                    shape2.setFillColor(tg.get_TextColor());
                } else {
                    if (tg.get_LineColor() != null) {
                        shape2.setFillColor(tg.get_LineColor());
                    }
                }

                if (tg.get_LineColor() != null) {
                    shape2.setLineColor(tg.get_LineColor());
                }
                //only GE uses the converter, generic uses the affine transform and draws at 0,0
                if (converter != null) {
                    shape2.setGlyphPosition(glyphPosition);
                } else {
                    shape2.setGlyphPosition(new Point2D(0, 0));
                }
                //shape2.setGlyphPosition(new Point(0,0));
                //added two settings for use by GE
                if (s != null && s !== "") {
                    shape2.setModifierString(s);
                    let tl: TextLayout = new TextLayout(s, font, g2d.getFontMetrics().getFontRenderContext());
                    shape2.setTextLayout(tl);
                    shape2.setTextJustify(justify);
                } else {
                    if (image != null) {
                        shape2.setModifierImage(image);
                    }
                }

                //shape2.setModifierStringPosition(glyphPosition);//M. Deutch 7-6-11
                shape2.setModifierAngle(theta * 180 / Math.PI);
                shape2.setModifierPosition(modifierPosition);

                if (shape2 != null) {
                    shapes.push(shape2);
                }

            }   //end for
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "DisplayModifiers2",
                    exc);
            } else {
                throw exc;
            }
        }
    }//end function

    /**
     * Builds a shape object to wrap text
     *
     * @param g2d the Graphic object for drawing
     * @param str text to wrap
     * @param font the draw font
     * @param tx the drawing transform, text rotation and translation
     * @return
     */
    public static getTextShape(g2d: Graphics2D,
        str: string,
        font: Font,
        tx: AffineTransform): Shape {
        let tl: TextLayout;
        let frc: FontRenderContext;
        try {
            frc = g2d.getFontRenderContext();
            tl = new TextLayout(str, font, frc);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "getTextShape",
                    new RendererException("Failed inside getTextShape", exc));
            } else {
                throw exc;
            }
        }
        return tl.getOutline(tx);
    }

    /**
     * Creates text outline as a shape
     *
     * @param originalText the original text
     * @return text shape
     */
    public static createTextOutline(originalText: Shape2): Shape2 {
        let siOutline: Shape2;
        try {
            let outline: Shape = originalText.getShape();

            siOutline = new Shape2(Shape2.SHAPE_TYPE_MODIFIER_FILL);
            siOutline.setShape(outline);

            if (originalText.getFillColor().getRed() === 255
                && originalText.getFillColor().getGreen() === 255
                && originalText.getFillColor().getBlue() === 255) {
                siOutline.setLineColor(Color.BLACK);
            } else {
                siOutline.setLineColor(Color.WHITE);
            }

            let width: int = RendererSettings.getInstance().getTextOutlineWidth();

            siOutline.setStroke(new BasicStroke(width, BasicStroke.CAP_ROUND,
                BasicStroke.JOIN_ROUND, 3));

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "createTextOutline",
                    new RendererException("Failed inside createTextOutline", exc));
            } else {
                throw exc;
            }
        }
        return siOutline;
    }

    /**
     * Channels don't return points in tg.Pixels. For Channels modifiers we only
     * need to collect the points, don't need internal arrays, and can calculate
     * on which segments the modifiers lie.
     *
     * @param shape
     * @return
     */
    private static getShapePoints(shape: Shape): Array<POINT2> | null {
        try {
            let ptsPoly: Array<Point2D> = new Array();
            let ptPoly: Point2D;
            let coords: number[] = new Array<number>(6);
            let zeros: int = 0;
            for (let i: PathIterator = shape.getPathIterator(null); !i.isDone(); i.next()) {
                let type: int = i.currentSegment(coords);
                if (type === 0 && zeros === 2) {
                    break;
                }
                switch (type) {
                    case IPathIterator.SEG_MOVETO: {
                        ptPoly = new Point2D(coords[0], coords[1]);
                        ptsPoly.push(ptPoly);
                        zeros++;
                        break;
                    }

                    case IPathIterator.SEG_LINETO: {
                        ptPoly = new Point2D(coords[0], coords[1]);
                        ptsPoly.push(ptPoly);
                        break;
                    }

                    case IPathIterator.SEG_QUADTO: { //quadTo was never used
                        break;
                    }

                    case IPathIterator.SEG_CUBICTO: {  //curveTo was used for some METOC's
                        break;
                    }

                    case IPathIterator.SEG_CLOSE: {    //closePath was never used
                        break;
                    }


                    default:

                }
            }
            if (ptsPoly.length > 0) {
                let pts: Array<POINT2>;
                pts = new Array();
                for (let j: int = 0; j < ptsPoly.length; j++) {
                    let pt2d: Point2D = ptsPoly[j];
                    let pt: POINT2 = new POINT2(pt2d.getX(), pt2d.getY());
                    pts.push(pt);
                }
                return pts;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Modifier2._className, "getshapePoints",
                    new RendererException("Failed inside getShapePoints", exc));
            } else {
                throw exc;
            }
        }
        return null;
    }
}
