import { type int, type double} from "../graphics2d/BasicTypes";


import { BasicStroke } from "../graphics2d/BasicStroke"
import { GeneralPath } from "../graphics2d/GeneralPath"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { TexturePaint } from "../graphics2d/TexturePaint"
import { arraysupport } from "../JavaLineArray/arraysupport"
import { Channels } from "../JavaLineArray/Channels"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { clsChannelUtility } from "../JavaTacticalRenderer/clsChannelUtility"
import { P1 } from "../JavaTacticalRenderer/P1"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { PatternFillRenderer } from "../renderer/PatternFillRenderer"
import { Color } from "../renderer/utilities/Color"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { clsUtility } from "./clsUtility";
import { SVGSymbolInfo } from "../renderer/utilities/SVGSymbolInfo";

/**
 * Class to calculate the points for the Weather symbols
 *
 */
export class clsMETOC {
    private static readonly _className: string = "clsMETOC";
    public static getWeatherLinetype(version: int, entityCode: int): int {
        switch (entityCode) {
            case 110301: {
                return TacticalLines.CF;
            }

            case 110302: {
                return TacticalLines.UCF;
            }

            case 110303: {
                return TacticalLines.CFG;
            }

            case 110304: {
                return TacticalLines.CFY;
            }

            case 110305: {
                return TacticalLines.WF;
            }

            case 110306: {
                return TacticalLines.UWF;
            }

            case 110307: {
                return TacticalLines.WFG;
            }

            case 110308: {
                return TacticalLines.WFY;
            }

            case 110309: {
                return TacticalLines.OCCLUDED;
            }

            case 110310: {
                return TacticalLines.UOF;
            }

            case 110311: {
                return TacticalLines.OFY;
            }

            case 110312: {
                return TacticalLines.SF;
            }

            case 110313: {
                return TacticalLines.USF;
            }

            case 110314: {
                return TacticalLines.SFG;
            }

            case 110315: {
                return TacticalLines.SFY;
            }

            case 110401: {
                return TacticalLines.TROUGH;
            }

            case 110402: {
                return TacticalLines.UPPER_TROUGH;
            }

            case 110403: {
                return TacticalLines.RIDGE;
            }

            case 110404: {
                return TacticalLines.SQUALL;
            }

            case 110405: {
                return TacticalLines.INSTABILITY;
            }

            case 110406: {
                return TacticalLines.SHEAR;
            }

            case 110407: {
                return TacticalLines.ITC;
            }

            case 110408: {
                return TacticalLines.CONVERGENCE;
            }

            case 110409: {
                return TacticalLines.ITD;
            }

            case 140300: {
                return TacticalLines.JET;
            }

            case 140400: {
                return TacticalLines.STREAM;
            }

            case 162004: {            //tropical storm wind
                break;
            }

            case 170100: {
                return TacticalLines.IFR;
            }

            case 170200: {
                return TacticalLines.MVFR;
            }

            case 170300: {
                return TacticalLines.TURBULENCE;
            }

            case 170400: {
                return TacticalLines.ICING;
            }

            case 170500: {
                return TacticalLines.NON_CONVECTIVE;
            }

            case 170501: {
                return TacticalLines.CONVECTIVE;
            }

            case 170600: {
                return TacticalLines.FROZEN;
            }

            case 170700: {
                return TacticalLines.THUNDERSTORMS;
            }

            case 170800: {
                return TacticalLines.FOG;
            }

            case 170900: {
                return TacticalLines.SAND;
            }

            case 171000: {
                return TacticalLines.FREEFORM;
            }

            case 180100: {
                return TacticalLines.ISOBAR;
            }

            case 180200: {
                return TacticalLines.UPPER_AIR;
            }

            case 180300: {
                return TacticalLines.ISOTHERM;
            }

            case 180400: {
                return TacticalLines.ISOTACH;
            }

            case 180500: {
                return TacticalLines.ISODROSOTHERM;
            }

            case 180600: {
                return TacticalLines.ISOPLETHS;
            }

            case 180700: {
                return TacticalLines.OPERATOR_FREEFORM;
            }

            case 110501: {
                return TacticalLines.LVO;
            }

            case 110502: {
                return TacticalLines.UNDERCAST;
            }

            case 110503: {
                return TacticalLines.LRO;
            }

            case 110504: {
                return TacticalLines.ICE_EDGE;
            }

            case 110505: {
                return TacticalLines.ESTIMATED_ICE_EDGE;
            }

            case 110506: {
                return TacticalLines.ICE_EDGE_RADAR;
            }

            case 110601: {
                return TacticalLines.CRACKS;
            }

            case 110602: {
                return TacticalLines.CRACKS_SPECIFIC_LOCATION;
            }

            case 110603: {
                return TacticalLines.ICE_OPENINGS_LEAD;
            }

            case 110604: {
                return TacticalLines.ICE_OPENINGS_FROZEN;
            }

            case 120102: {
                return TacticalLines.DEPTH_CURVE;
            }

            case 120103: {
                return TacticalLines.DEPTH_CONTOUR;
            }

            case 120104: {
                return TacticalLines.DEPTH_AREA;
            }

            case 120201: {
                return TacticalLines.COASTLINE;
            }

            case 120202: {
                return TacticalLines.ISLAND;
            }

            case 120203: {
                return TacticalLines.BEACH;
            }

            case 120204: {
                return TacticalLines.WATER;
            }

            case 120205: {
                return TacticalLines.FORESHORE_LINE;
            }

            case 120206: {
                return TacticalLines.FORESHORE_AREA;
            }

            case 120305: {
                return TacticalLines.ANCHORAGE_LINE;
            }

            case 120306: {
                return TacticalLines.ANCHORAGE_AREA;
            }


            case 120308: {
                return TacticalLines.PIER;
            }

            case 120312: {
                return TacticalLines.FISH_TRAPS;
            }

            case 120314: {
                return TacticalLines.DRYDOCK;
            }

            case 120317: {
                return TacticalLines.LOADING_FACILITY_LINE;
            }

            case 120318: {
                return TacticalLines.LOADING_FACILITY_AREA;
            }


            case 120319: {
                return TacticalLines.RAMP_ABOVE_WATER;
            }

            case 120320: {
                return TacticalLines.RAMP_BELOW_WATER;
            }


            case 120326: {
                return TacticalLines.JETTY_ABOVE_WATER;
            }

            case 120327: {
                return TacticalLines.JETTY_BELOW_WATER;
            }

            case 120328: {
                return TacticalLines.SEAWALL;
            }

            case 120405: {
                return TacticalLines.PERCHES;
            }

            case 120407: {
                return TacticalLines.LEADING_LINE;
            }

            case 120503: {
                return TacticalLines.UNDERWATER_HAZARD;
            }

            case 120505: {
                return TacticalLines.FOUL_GROUND;
            }

            case 120507: {
                return TacticalLines.KELP;
            }

            case 120511: {
                return TacticalLines.BREAKERS;
            }

            case 120512: {
                return TacticalLines.REEF;
            }

            case 120514: {
                return TacticalLines.DISCOLORED_WATER;
            }

            case 120702: {
                return TacticalLines.EBB_TIDE;
            }

            case 120703: {
                return TacticalLines.FLOOD_TIDE;
            }


            case 130101: {
                return TacticalLines.VDR_LEVEL_12;
            }

            case 130102: {
                return TacticalLines.VDR_LEVEL_23;
            }

            case 130103: {
                return TacticalLines.VDR_LEVEL_34;
            }

            case 130104: {
                return TacticalLines.VDR_LEVEL_45;
            }

            case 130105: {
                return TacticalLines.VDR_LEVEL_56;
            }

            case 130106: {
                return TacticalLines.VDR_LEVEL_67;
            }

            case 130107: {
                return TacticalLines.VDR_LEVEL_78;
            }

            case 130108: {
                return TacticalLines.VDR_LEVEL_89;
            }

            case 130109: {
                return TacticalLines.VDR_LEVEL_910;
            }

            case 130201: {
                return TacticalLines.BEACH_SLOPE_FLAT;
            }

            case 130202: {
                return TacticalLines.BEACH_SLOPE_GENTLE;
            }

            case 130203: {
                return TacticalLines.BEACH_SLOPE_MODERATE;
            }

            case 130204: {
                return TacticalLines.BEACH_SLOPE_STEEP;
            }

            case 140101: {
                return TacticalLines.SOLID_ROCK;
            }

            case 140102: {
                return TacticalLines.CLAY;
            }

            case 140103: {
                return TacticalLines.VERY_COARSE_SAND;
            }

            case 140104: {
                return TacticalLines.COARSE_SAND;
            }

            case 140105: {
                return TacticalLines.MEDIUM_SAND;
            }

            case 140106: {
                return TacticalLines.FINE_SAND;
            }

            case 140107: {
                return TacticalLines.VERY_FINE_SAND;
            }

            case 140108: {
                return TacticalLines.VERY_FINE_SILT;
            }

            case 140109: {
                return TacticalLines.FINE_SILT;
            }

            case 140110: {
                return TacticalLines.MEDIUM_SILT;
            }

            case 140111: {
                return TacticalLines.COARSE_SILT;
            }

            case 140112: {
                return TacticalLines.BOULDERS;
            }

            case 140113: {
                return TacticalLines.OYSTER_SHELLS;
            }

            case 140114: {
                return TacticalLines.PEBBLES;
            }

            case 140115: {
                return TacticalLines.SAND_AND_SHELLS;
            }

            case 140116: {
                return TacticalLines.BOTTOM_SEDIMENTS_LAND;
            }

            case 140117: {
                return TacticalLines.BOTTOM_SEDIMENTS_NO_DATA;
            }

            case 140118: {
                return TacticalLines.BOTTOM_ROUGHNESS_SMOOTH;
            }

            case 140119: {
                return TacticalLines.BOTTOM_ROUGHNESS_MODERATE;
            }

            case 140120: {
                return TacticalLines.BOTTOM_ROUGHNESS_ROUGH;
            }

            case 140121: {
                return TacticalLines.CLUTTER_LOW;
            }

            case 140122: {
                return TacticalLines.CLUTTER_MEDIUM;
            }

            case 140123: {
                return TacticalLines.CLUTTER_HIGH;
            }

            case 140124: {
                return TacticalLines.IMPACT_BURIAL_0;
            }

            case 140125: {
                return TacticalLines.IMPACT_BURIAL_10;
            }

            case 140126: {
                return TacticalLines.IMPACT_BURIAL_20;
            }

            case 140127: {
                return TacticalLines.IMPACT_BURIAL_75;
            }

            case 140128: {
                return TacticalLines.IMPACT_BURIAL_100;
            }

            case 140129: {
                return TacticalLines.BOTTOM_CATEGORY_A;
            }

            case 140130: {
                return TacticalLines.BOTTOM_CATEGORY_B;
            }

            case 140131: {
                return TacticalLines.BOTTOM_CATEGORY_C;
            }

            case 140132: {
                return TacticalLines.BOTTOM_TYPE_A1;
            }

            case 140133: {
                return TacticalLines.BOTTOM_TYPE_A2;
            }

            case 140134: {
                return TacticalLines.BOTTOM_TYPE_A3;
            }

            case 140135: {
                return TacticalLines.BOTTOM_TYPE_B1;
            }

            case 140136: {
                return TacticalLines.BOTTOM_TYPE_B2;
            }

            case 140137: {
                return TacticalLines.BOTTOM_TYPE_B3;
            }

            case 140138: {
                return TacticalLines.BOTTOM_TYPE_C1;
            }

            case 140139: {
                return TacticalLines.BOTTOM_TYPE_C2;
            }

            case 140140: {
                return TacticalLines.BOTTOM_TYPE_C3;
            }


            case 150100: {
                return TacticalLines.MARITIME_LIMIT;
            }

            case 150200: {
                return TacticalLines.MARITIME_AREA;
            }

            case 150300: {
                return TacticalLines.RESTRICTED_AREA;
            }

            case 150400: {
                return TacticalLines.SWEPT_AREA;
            }

            case 150500: {
                return TacticalLines.TRAINING_AREA;
            }

            case 150600: {
                return TacticalLines.OPERATOR_DEFINED;
            }

            case 160100: {
                return TacticalLines.CABLE;
            }

            case 160200: {
                return TacticalLines.SUBMERGED_CRIB;
            }

            case 160300: {
                return TacticalLines.CANAL;
            }

            case 160700: {
                return TacticalLines.OIL_RIG_FIELD;
            }

            case 160800: {
                return TacticalLines.PIPE;
            }


            default: {
                return -1;
            }

        }
        return -1;
    }
    /**
     * @param symbolID Mil-Standard 2525 20-30 digit code
     * @return the line type as an integer if it is a weather symbol, else return -1
     */
    public static IsWeather(symbolID: string): int {
        //the MeTOCs
        try {
            if (symbolID == null) {

                return -1;
            }


            if (symbolID.length > 15) {
                let symbolSet: int = SymbolID.getSymbolSet(symbolID);
                let entityCode: int = SymbolID.getEntityCode(symbolID);
                let version: int = SymbolID.getVersion(symbolID);

                switch (symbolSet) {
                    case 45:
                    case 46: {
                        return clsMETOC.getWeatherLinetype(version, entityCode);
                    }


                    default:

                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsMETOC.IsWeather");
                ErrorLogger.LogException(clsMETOC._className, "isWeather",
                    new RendererException("Failed inside isWeather", exc));
            } else {
                throw exc;
            }
        }
        return -1;
    }
    /**
     * Sets tactical graphic properties based on Mil-Std-2525 Appendix C.
     * @param tg
     */
    private static SetMeTOCProperties(tg: TGLight): void {
        try {
            //METOC's have no user defined fills
            //any fills per Mil-Std-2525 will be set below
            //tg.set_FillColor(null);
            let symbolId: string = tg.get_SymbolId();
            switch (tg.get_LineType()) {   //255:150:150                    
                case TacticalLines.SQUALL: {
                    tg.set_LineColor(Color.BLACK);
                    tg.set_lineCap(BasicStroke.CAP_BUTT);
                    break;
                }

                case TacticalLines.TROUGH: {
                    tg.set_LineStyle(1);
                    tg.set_LineColor(Color.BLACK);
                    tg.set_lineCap(BasicStroke.CAP_ROUND);
                    break;
                }

                case TacticalLines.UPPER_TROUGH: {
                    tg.set_LineColor(Color.BLACK);
                    tg.set_lineCap(BasicStroke.CAP_ROUND);
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_A1: {
                    tg.set_LineColor(new Color(48, 255, 0));   // green
                    tg.set_FillColor(new Color(48, 255, 0));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_A2: {
                    tg.set_LineColor(new Color(127, 255, 0));   //light green
                    tg.set_FillColor(new Color(127, 255, 0));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_C2: {
                    tg.set_LineColor(new Color(255, 80, 0));   //dark orange
                    tg.set_FillColor(new Color(255, 80, 0));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_C3: {
                    tg.set_LineColor(new Color(255, 48, 0));   //orange red
                    tg.set_FillColor(new Color(255, 48, 0));
                    break;
                }

                case TacticalLines.IMPACT_BURIAL_0: {
                    tg.set_LineColor(new Color(0, 0, 255));   //blue
                    tg.set_FillColor(new Color(0, 0, 255));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_C1:
                case TacticalLines.IMPACT_BURIAL_75: {
                    tg.set_LineColor(new Color(255, 127, 0));   //orange
                    tg.set_FillColor(new Color(255, 127, 0));
                    break;
                }

                case TacticalLines.BOTTOM_CATEGORY_C:
                case TacticalLines.IMPACT_BURIAL_100:
                case TacticalLines.CLUTTER_HIGH:
                case TacticalLines.BOTTOM_ROUGHNESS_ROUGH: {
                    tg.set_LineColor(new Color(255, 0, 0));   //red
                    tg.set_FillColor(new Color(255, 0, 0));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_B2:
                case TacticalLines.BOTTOM_CATEGORY_B:
                case TacticalLines.IMPACT_BURIAL_20:
                case TacticalLines.CLUTTER_MEDIUM:
                case TacticalLines.BOTTOM_ROUGHNESS_MODERATE: {
                    tg.set_LineColor(new Color(255, 255, 0));   //yellow
                    tg.set_FillColor(new Color(255, 255, 0));
                    break;
                }

                case TacticalLines.BOTTOM_CATEGORY_A:
                case TacticalLines.IMPACT_BURIAL_10:
                case TacticalLines.CLUTTER_LOW:
                case TacticalLines.BOTTOM_ROUGHNESS_SMOOTH: {
                    tg.set_LineColor(new Color(0, 255, 0));   //green
                    tg.set_FillColor(new Color(0, 255, 0));
                    break;
                }

                case TacticalLines.BOTTOM_SEDIMENTS_NO_DATA: {
                    tg.set_LineColor(new Color(230, 230, 230));   //light gray
                    tg.set_FillColor(new Color(230, 230, 230));
                    break;
                }

                case TacticalLines.BOTTOM_SEDIMENTS_LAND: {
                    tg.set_LineColor(new Color(220, 220, 220));   //gray
                    tg.set_FillColor(new Color(220, 220, 220));
                    break;
                }

                case TacticalLines.SAND_AND_SHELLS: {
                    tg.set_LineColor(new Color(255, 220, 220));   //light peach
                    tg.set_FillColor(new Color(255, 220, 220));
                    break;
                }

                case TacticalLines.PEBBLES: {
                    tg.set_LineColor(new Color(255, 190, 190));   //peach
                    tg.set_FillColor(new Color(255, 190, 190));
                    break;
                }

                case TacticalLines.OYSTER_SHELLS: {
                    tg.set_LineColor(new Color(255, 150, 150));   //dark peach
                    tg.set_FillColor(new Color(255, 150, 150));
                    break;
                }

                case TacticalLines.BOULDERS: {
                    tg.set_LineColor(new Color(255, 0, 0));
                    tg.set_FillColor(new Color(255, 0, 0));
                    break;
                }

                case TacticalLines.COARSE_SILT: {
                    tg.set_LineColor(new Color(200, 255, 105));
                    tg.set_FillColor(new Color(200, 255, 105));
                    break;
                }

                case TacticalLines.MEDIUM_SILT: {
                    tg.set_LineColor(new Color(0, 255, 0));     //green
                    tg.set_FillColor(new Color(0, 255, 0));
                    break;
                }

                case TacticalLines.FINE_SILT: {
                    tg.set_LineColor(new Color(25, 255, 230));     //turquoise
                    tg.set_FillColor(new Color(25, 255, 230));
                    break;
                }

                case TacticalLines.VERY_FINE_SILT: {
                    tg.set_LineColor(new Color(0, 215, 255));     //turquoise
                    tg.set_FillColor(new Color(0, 215, 255));
                    break;
                }

                case TacticalLines.VERY_FINE_SAND: {
                    tg.set_LineColor(new Color(255, 255, 220));     //pale yellow
                    tg.set_FillColor(new Color(255, 255, 220));
                    break;
                }

                case TacticalLines.FINE_SAND: {
                    tg.set_LineColor(new Color(255, 255, 140));     //light yellow
                    tg.set_FillColor(new Color(255, 255, 140));
                    break;
                }

                case TacticalLines.MEDIUM_SAND: {
                    tg.set_LineColor(new Color(255, 235, 0));     //yellow
                    tg.set_FillColor(new Color(255, 235, 0));
                    break;
                }

                case TacticalLines.COARSE_SAND: {
                    tg.set_LineColor(new Color(255, 215, 0));     //light gold
                    tg.set_FillColor(new Color(255, 215, 0));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_B3: {
                    tg.set_LineColor(new Color(255, 207, 0));     //gold
                    tg.set_FillColor(new Color(255, 207, 0));
                    break;
                }

                case TacticalLines.VERY_COARSE_SAND: {
                    tg.set_LineColor(new Color(255, 180, 0));     //gold
                    tg.set_FillColor(new Color(255, 180, 0));
                    break;
                }

                case TacticalLines.CLAY: {
                    tg.set_LineColor(new Color(100, 130, 255));     //periwinkle
                    tg.set_FillColor(new Color(100, 130, 255));
                    break;
                }

                case TacticalLines.SOLID_ROCK: {
                    //tg.set_LineColor(new Color(160, 32, 240));     //purple
                    //tg.set_FillColor(new Color(160, 32, 240));
                    tg.set_LineColor(new Color(255, 0, 255));     //magenta
                    tg.set_FillColor(new Color(255, 0, 255));
                    break;
                }

                case TacticalLines.VDR_LEVEL_12: {
                    tg.set_LineColor(new Color(26, 153, 77));     //dark green
                    tg.set_FillColor(new Color(26, 153, 77));
                    break;
                }

                case TacticalLines.VDR_LEVEL_23: {
                    tg.set_LineColor(new Color(26, 204, 77));     //light green
                    tg.set_FillColor(new Color(26, 204, 77));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_A3: {
                    tg.set_LineColor(new Color(175, 255, 0));    //lime green
                    tg.set_FillColor(new Color(175, 255, 0));
                    break;
                }

                case TacticalLines.VDR_LEVEL_34: {
                    tg.set_LineColor(new Color(128, 255, 51));    //lime green
                    tg.set_FillColor(new Color(128, 255, 51));
                    break;
                }

                case TacticalLines.BOTTOM_TYPE_B1: {
                    tg.set_LineColor(new Color(207, 255, 0));    //yellow green
                    tg.set_FillColor(new Color(207, 255, 0));
                    break;
                }

                case TacticalLines.VDR_LEVEL_45: {
                    tg.set_LineColor(new Color(204, 255, 26));    //yellow green
                    tg.set_FillColor(new Color(204, 255, 26));
                    break;
                }

                case TacticalLines.VDR_LEVEL_56: {
                    tg.set_LineColor(new Color(255, 255, 0));     //yellow
                    tg.set_FillColor(new Color(255, 255, 0));
                    break;
                }

                case TacticalLines.VDR_LEVEL_67: {
                    tg.set_LineColor(new Color(255, 204, 0));     //gold
                    tg.set_FillColor(new Color(255, 204, 0));
                    break;
                }

                case TacticalLines.VDR_LEVEL_78: {
                    tg.set_LineColor(new Color(255, 128, 0));     //light orange
                    tg.set_FillColor(new Color(255, 128, 0));
                    break;
                }

                case TacticalLines.VDR_LEVEL_89: {
                    tg.set_LineColor(new Color(255, 77, 0));      //dark orange
                    tg.set_FillColor(new Color(255, 77, 0));
                    break;
                }

                case TacticalLines.VDR_LEVEL_910: {
                    tg.set_LineColor(Color.RED);
                    tg.set_FillColor(Color.RED);
                    break;
                }

                case TacticalLines.CANAL: {
                    tg.set_LineColor(Color.BLACK);
                    tg.set_LineThickness(2 * tg.get_LineThickness()); // Thick line
                    break;
                }

                case TacticalLines.OPERATOR_DEFINED: {
                    tg.set_LineColor(new Color(255, 128, 0));
                    break;
                }

                case TacticalLines.MARITIME_LIMIT:
                case TacticalLines.MARITIME_AREA: {
                    tg.set_LineColor(Color.MAGENTA);
                    tg.set_LineStyle(1);
                    break;
                }

                case TacticalLines.PERCHES:
                case TacticalLines.SUBMERGED_CRIB: {
                    tg.set_LineColor(Color.BLACK);
                    tg.set_LineStyle(2);
                    tg.set_lineCap(BasicStroke.CAP_ROUND);
                    tg.set_FillColor(Color.BLUE);
                    break;
                }

                case TacticalLines.DISCOLORED_WATER:
                case TacticalLines.UNDERWATER_HAZARD: {
                    tg.set_LineColor(Color.BLACK);
                    tg.set_LineStyle(2);
                    tg.set_FillColor(new Color(0, 191, 255)); //deep sky blue
                    break;
                }

                case TacticalLines.LOADING_FACILITY_AREA: {
                    tg.set_LineColor(new Color(210, 180, 140));
                    tg.set_FillColor(new Color(210, 180, 140));
                    break;
                }

                case TacticalLines.LOADING_FACILITY_LINE: {
                    tg.set_LineColor(Color.GRAY);
                    tg.set_LineThickness(2 * tg.get_LineThickness()); // Thick line
                    break;
                }

                case TacticalLines.DRYDOCK: {
                    tg.set_LineColor(Color.BLACK);
                    //tg.set_FillColor(new Color(165, 42, 42)); //brown
                    tg.set_FillColor(new Color(205, 133, 63)); //brown
                    tg.set_LineStyle(1);
                    break;
                }

                case TacticalLines.FORESHORE_AREA: {
                    //tg.set_LineColor(new Color(154, 205, 50));
                    //tg.set_FillColor(new Color(154, 205, 50));
                    tg.set_LineColor(new Color(173, 255, 47));
                    tg.set_FillColor(new Color(173, 255, 47));
                    break;
                }

                case TacticalLines.FORESHORE_LINE: {
                    //tg.set_LineColor(new Color(154, 205, 50));
                    tg.set_LineColor(new Color(173, 255, 47));
                    break;
                }

                case TacticalLines.RESTRICTED_AREA:
                case TacticalLines.TRAINING_AREA:
                case TacticalLines.ANCHORAGE_LINE:
                case TacticalLines.ANCHORAGE_AREA: {
                    tg.set_LineColor(Color.MAGENTA);
                    //tg.set_LineStyle(1);    //dashed
                    break;
                }

                case TacticalLines.PIPE: {
                    tg.set_LineColor(Color.GRAY);
                    tg.set_FillColor(Color.GRAY);
                    break;
                }

                case TacticalLines.WATER: {
                    tg.set_LineColor(Color.WHITE);
                    tg.set_FillColor(Color.WHITE);
                    break;
                }

                case TacticalLines.FISH_TRAPS: {
                    tg.set_LineColor(new Color(192, 192, 192));
                    tg.set_LineStyle(1);
                    break;
                }

                case TacticalLines.SWEPT_AREA:
                case TacticalLines.OIL_RIG_FIELD:
                case TacticalLines.FOUL_GROUND:
                case TacticalLines.KELP: {
                    tg.set_LineColor(null);
                    break;
                }

                case TacticalLines.BEACH: {
                    tg.set_LineColor(new Color(206, 158, 140));
                    tg.set_FillColor(new Color(206, 158, 140, Math.trunc(255 * 0.12)));
                    break;
                }

                case TacticalLines.DEPTH_AREA: {
                    tg.set_LineColor(Color.BLUE);
                    tg.set_FillColor(Color.WHITE);
                    break;
                }

                case TacticalLines.CONVERGENCE:
                case TacticalLines.ITC: {
                    tg.set_LineColor(new Color(255, 128, 0));
                    tg.set_lineCap(BasicStroke.CAP_BUTT);
                    break;
                }

                case TacticalLines.OFY:
                case TacticalLines.OCCLUDED: {
                    tg.set_LineColor(new Color(160, 32, 240));
                    tg.set_FillColor(new Color(160, 32, 240));
                    break;
                }

                case TacticalLines.UOF: {
                    tg.set_LineColor(new Color(160, 32, 240));
                    break;
                }

                case TacticalLines.WFY:
                case TacticalLines.WFG:
                case TacticalLines.WF: {
                    tg.set_FillColor(Color.RED);
                    tg.set_LineColor(Color.RED);
                    break;
                }

                case TacticalLines.UWF:
                case TacticalLines.IFR: {
                    tg.set_LineColor(Color.RED);
                    break;
                }

                case TacticalLines.CFG:
                case TacticalLines.CFY:
                case TacticalLines.CF: {
                    tg.set_LineColor(Color.BLUE);
                    tg.set_FillColor(Color.BLUE);
                    break;
                }

                case TacticalLines.UCF:
                case TacticalLines.MVFR: {
                    tg.set_LineColor(Color.BLUE);
                    break;
                }

                case TacticalLines.TURBULENCE: {
                    tg.set_LineColor(Color.BLUE);
                    tg.set_LineStyle(2);
                    tg.set_lineCap(BasicStroke.CAP_ROUND);
                    let minThickness: int = Math.max(RendererSettings.getInstance().getDeviceDPI() / 96, 1) * 6;
                    if (tg.get_LineThickness() < minThickness) {

                        tg.set_LineThickness(minThickness);
                    }

                    break;
                }

                case TacticalLines.CABLE: {
                    tg.set_LineColor(Color.MAGENTA);
                    break;
                }

                case TacticalLines.ISLAND: {
                    //tg.set_LineColor(new Color(165, 42, 42)); //brown
                    //tg.set_FillColor(new Color(165, 42, 42)); //brown
                    tg.set_LineColor(new Color(210, 180, 140)); //tan
                    tg.set_FillColor(new Color(210, 180, 140)); //tan
                    break;
                }

                case TacticalLines.SEAWALL:
                case TacticalLines.SEAWALL_GE:
                case TacticalLines.FLOOD_TIDE:
                case TacticalLines.FLOOD_TIDE_GE:
                case TacticalLines.EBB_TIDE:
                case TacticalLines.EBB_TIDE_GE:
                case TacticalLines.JETTY_ABOVE_WATER:
                case TacticalLines.JETTY_ABOVE_WATER_GE: {
                    tg.set_LineColor(Color.GRAY);
                    break;
                }

                case TacticalLines.BEACH_SLOPE_MODERATE:
                case TacticalLines.BEACH_SLOPE_FLAT: {
                    tg.set_LineColor(new Color(179, 179, 179));
                    tg.set_FillColor(null);
                    break;
                }

                case TacticalLines.BEACH_SLOPE_GENTLE:
                case TacticalLines.BEACH_SLOPE_STEEP: {
                    tg.set_LineColor(new Color(128, 128, 128));
                    tg.set_FillColor(null);
                    break;
                }

                case TacticalLines.BREAKERS: {
                    tg.set_LineStyle(1);
                    tg.set_LineColor(Color.GRAY);
                    break;
                }

                case TacticalLines.JETTY_BELOW_WATER:
                case TacticalLines.JETTY_BELOW_WATER_GE: {
                    tg.set_LineStyle(1);
                    tg.set_LineColor(Color.GRAY);
                    break;
                }

                case TacticalLines.DEPTH_CURVE:
                case TacticalLines.DEPTH_CURVE_GE:
                case TacticalLines.DEPTH_CONTOUR:
                case TacticalLines.DEPTH_CONTOUR_GE:
                case TacticalLines.COASTLINE:
                case TacticalLines.COASTLINE_GE:
                case TacticalLines.PIER:
                case TacticalLines.PIER_GE: {
                    tg.set_LineColor(Color.GRAY);
                    break;
                }

                case TacticalLines.FROZEN:
                case TacticalLines.JET:
                case TacticalLines.JET_GE: {
                    tg.set_LineColor(Color.RED);
                    break;
                }

                case TacticalLines.THUNDERSTORMS: {
                    tg.set_LineColor(Color.RED);
                    tg.set_LineStyle(3);
                    break;
                }

                case TacticalLines.RAMP_BELOW_WATER:
                case TacticalLines.RAMP_BELOW_WATER_GE:
                case TacticalLines.ESTIMATED_ICE_EDGE:
                case TacticalLines.ESTIMATED_ICE_EDGE_GE: {
                    tg.set_LineStyle(1);
                    tg.set_LineColor(Color.BLACK);
                    break;
                }

                case TacticalLines.ISODROSOTHERM:
                case TacticalLines.ISODROSOTHERM_GE: {
                    tg.set_LineColor(Color.GREEN);
                    break;
                }

                case TacticalLines.LRO:
                case TacticalLines.UNDERCAST:
                case TacticalLines.LVO:
                case TacticalLines.RIDGE:
                //case TacticalLines.TROUGH:
                case TacticalLines.ICE_OPENINGS_LEAD:
                case TacticalLines.ICE_OPENINGS_LEAD_GE:
                case TacticalLines.ICE_OPENINGS_FROZEN:
                case TacticalLines.ICE_OPENINGS_FROZEN_GE:
                case TacticalLines.LEADING_LINE:
                case TacticalLines.STREAM:
                case TacticalLines.STREAM_GE:
                case TacticalLines.CRACKS:
                case TacticalLines.CRACKS_GE:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION_GE:
                case TacticalLines.ISOBAR:
                case TacticalLines.ISOBAR_GE:
                case TacticalLines.UPPER_AIR:
                case TacticalLines.UPPER_AIR_GE:
                case TacticalLines.ICE_EDGE:
                case TacticalLines.ICE_EDGE_GE:
                case TacticalLines.ICE_EDGE_RADAR:
                case TacticalLines.ICE_EDGE_RADAR_GE:
                case TacticalLines.REEF: {
                    tg.set_LineColor(Color.BLACK);
                    break;
                }

                case TacticalLines.INSTABILITY: {
                    tg.set_LineStyle(4);
                    tg.set_lineCap(BasicStroke.CAP_ROUND);
                    tg.set_LineColor(Color.BLACK);
                    break;
                }

                case TacticalLines.SHEAR: {
                    tg.set_LineStyle(3);
                    tg.set_lineCap(BasicStroke.CAP_ROUND);
                    tg.set_LineColor(Color.BLACK);
                    break;
                }

                case TacticalLines.ISOPLETHS:
                case TacticalLines.ISOPLETHS_GE:
                case TacticalLines.ISOTHERM:
                case TacticalLines.ISOTHERM_GE: {
                    tg.set_LineStyle(1);
                    tg.set_LineColor(Color.RED);
                    break;
                }

                case TacticalLines.ISOTACH:
                case TacticalLines.ISOTACH_GE: {
                    tg.set_LineStyle(1);
                    tg.set_LineColor(new Color(160, 32, 240));
                    break;
                }

                case TacticalLines.SAND: {
                    tg.set_LineColor(new Color(165, 121, 82)); //brown
                    break;
                }

                case TacticalLines.ICING: {
                    tg.set_LineColor(new Color(189, 154, 56)); //brown
                    break;
                }

                case TacticalLines.NON_CONVECTIVE: {
                    tg.set_LineColor(Color.GREEN);
                    break;
                }

                case TacticalLines.CONVECTIVE: {
                    tg.set_LineColor(Color.GREEN);
                    tg.set_LineStyle(3);
                    break;
                }

                case TacticalLines.FOG: {
                    tg.set_LineColor(Color.YELLOW);
                    break;
                }

                case TacticalLines.RAMP_ABOVE_WATER:
                case TacticalLines.RAMP_ABOVE_WATER_GE: {
                    tg.set_LineColor(Color.BLACK);
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in clsMETOC.SetMeTOCProperties");
                ErrorLogger.LogException(clsMETOC._className, "SetMeTOCProperties",
                    new RendererException("Failed inside SetMeTOCProperties", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     *
     * Rotates axis by theta for point and curve
     * Finds next closest point with same x position on the splinePoints curve as pt
     * walks up the curve and if it does not find a range that straddles x it return null.
     * We ultimately will draw a line from pt to the extrapolated point on the splinePoints spline.
     * used for ICE_OPENINGS_FROZEN_LEAD
     *
     * @param splinePoints - the points on the opposite spline
     * @param pt - the point in the original curve from which the line will start
     * @param theta angle of curve at pt. Perpendicular to new line to be drawn
     *
     * @return The extrapolated point on the opposite spline to which the line will be drawn
     */
    private static ExtrapolatePointFromCurve(splinePoints: Array<POINT2>,
        pt: POINT2, theta: double): POINT2 | null {
        try {
            // cos(theta) and sin(theta) only need to be calculated once
            let cosTheta: double = Math.cos(theta);
            let sinTheta: double = Math.sin(theta);

            // p at the end of variable name represents "prime" and means it's a rotated coordinate
            let xp: double = pt.x * cosTheta + pt.y * sinTheta;

            //if we find a pair which straddle xp then extrapolate the y value from the curve and
            //return the point
            for (let j: int = 0; j < splinePoints.length - 1; j++) {
                let x1p: double = splinePoints[j].x * cosTheta + splinePoints[j].y * sinTheta;
                let x2p: double = splinePoints[j + 1].x * cosTheta + splinePoints[j + 1].y * sinTheta;
                if ((x1p <= xp && x2p >= xp) || (x1p >= xp && x2p <= xp)) {
                    let y1p: double = -splinePoints[j].x * sinTheta + splinePoints[j].y * cosTheta;
                    let y2p: double = -splinePoints[j + 1].x * sinTheta + splinePoints[j + 1].y * cosTheta;

                    let mp: double = (y2p - y1p) / (x2p - x1p); // slope
                    let yp: double = y1p + (xp - x1p) * mp;

                    // Rotate back to normal coordinates
                    let x: double = xp * cosTheta - yp * sinTheta;
                    let y: double = xp * sinTheta + yp * cosTheta;
                    return new POINT2(x, y);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsMETOC._className, "ExtrapolatePointFromCurve",
                    new RendererException("Failed inside ExtrapolatePointFromCurve", exc));
            } else {
                throw exc;
            }
        }
        return null;
    }
    /**
     * The public interface, main function to return METOC shapes
     * @param tg the tactical graphic
     * @param shapes the ShapeInfo array
     */
    public static GetMeTOCShape(tg: TGLight,
        shapes: Array<Shape2>): void {
        try {
            if (shapes == null) {

                return;
            }

            let lineObject: GeneralPath;
            let lineObject2: GeneralPath;
            let splinePoints: Array<POINT2> = new Array();
            let splinePoints2: Array<POINT2> = new Array();
            let d: double = 0;
            let j: int = 0;
            let k: int = 0;
            let l: int = 0;
            let shape: Shape2;
            let ptLast: POINT2 = tg.Pixels[tg.Pixels.length - 1];
            let twoSplines: Array<POINT2>;
            let upperSpline: Array<POINT2>;
            let lowerSpline: Array<POINT2>;
            let originalPixels: Array<POINT2>;
            let t: int = 0;
            let u: int = 0;
            let v: int = 0;
            let w: int = 0;
            let tt: int = 0;
            let uu: int = 0;
            let vv: int = 0;
            let ww: int = 0;

            let pixels: Array<POINT2>;
            originalPixels = null;
            let partitions: Array<P1>;
            clsMETOC.SetMeTOCProperties(tg);
            switch (tg.get_LineType()) {
                case TacticalLines.SF:
                case TacticalLines.USF:
                case TacticalLines.SFG:
                case TacticalLines.SFY:
                case TacticalLines.WFY:
                case TacticalLines.WFG:
                case TacticalLines.WF:
                case TacticalLines.UWF:
                case TacticalLines.UCF:
                case TacticalLines.CF:
                case TacticalLines.CFG:
                case TacticalLines.CFY:
                case TacticalLines.OCCLUDED:
                case TacticalLines.UOF:
                case TacticalLines.OFY:
                case TacticalLines.TROUGH:
                case TacticalLines.UPPER_TROUGH:
                case TacticalLines.CABLE:
                case TacticalLines.INSTABILITY:
                case TacticalLines.SHEAR:
                case TacticalLines.RIDGE:
                case TacticalLines.SQUALL:
                case TacticalLines.ITC:
                case TacticalLines.CONVERGENCE:
                case TacticalLines.ITD:
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
                case TacticalLines.OPERATOR_FREEFORM:
                case TacticalLines.LVO:
                case TacticalLines.UNDERCAST:
                case TacticalLines.LRO:
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
                case TacticalLines.ANCHORAGE_LINE:
                case TacticalLines.PIPE:
                case TacticalLines.TRAINING_AREA:
                case TacticalLines.RESTRICTED_AREA:
                case TacticalLines.REEF:
                case TacticalLines.FORESHORE_AREA:
                case TacticalLines.FORESHORE_LINE:
                case TacticalLines.DRYDOCK:
                case TacticalLines.LOADING_FACILITY_LINE:
                case TacticalLines.LOADING_FACILITY_AREA:
                case TacticalLines.PERCHES:
                case TacticalLines.UNDERWATER_HAZARD:
                case TacticalLines.BREAKERS:
                case TacticalLines.DISCOLORED_WATER:
                case TacticalLines.BEACH_SLOPE_FLAT:
                case TacticalLines.BEACH_SLOPE_GENTLE:
                case TacticalLines.MARITIME_LIMIT:
                case TacticalLines.MARITIME_AREA:
                case TacticalLines.OPERATOR_DEFINED:
                case TacticalLines.SUBMERGED_CRIB:
                case TacticalLines.CANAL:
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
                    arraysupport.GetLineArray2(tg, tg.Pixels, shapes, null, null);
                    break;
                }

                case TacticalLines.ISOBAR:
                case TacticalLines.ISOBAR_GE:
                case TacticalLines.UPPER_AIR:
                case TacticalLines.UPPER_AIR_GE:
                case TacticalLines.ISOTHERM:
                case TacticalLines.ISOTHERM_GE:
                case TacticalLines.ISOTACH:
                case TacticalLines.ISOTACH_GE:
                case TacticalLines.ISODROSOTHERM:
                case TacticalLines.ISODROSOTHERM_GE:
                case TacticalLines.ISOPLETHS:
                case TacticalLines.ISOPLETHS_GE:
                case TacticalLines.ICE_EDGE:
                case TacticalLines.ICE_EDGE_GE:
                case TacticalLines.ESTIMATED_ICE_EDGE:
                case TacticalLines.ESTIMATED_ICE_EDGE_GE:
                case TacticalLines.CRACKS:
                case TacticalLines.CRACKS_GE:
                case TacticalLines.DEPTH_CURVE:
                case TacticalLines.DEPTH_CURVE_GE:
                case TacticalLines.DEPTH_CONTOUR:
                case TacticalLines.DEPTH_CONTOUR_GE:
                case TacticalLines.COASTLINE:
                case TacticalLines.COASTLINE_GE:
                case TacticalLines.PIER:
                case TacticalLines.PIER_GE:
                case TacticalLines.RAMP_ABOVE_WATER:
                case TacticalLines.RAMP_ABOVE_WATER_GE:
                case TacticalLines.RAMP_BELOW_WATER:
                case TacticalLines.RAMP_BELOW_WATER_GE:
                case TacticalLines.JETTY_ABOVE_WATER:
                case TacticalLines.JETTY_ABOVE_WATER_GE:
                case TacticalLines.JETTY_BELOW_WATER:
                case TacticalLines.JETTY_BELOW_WATER_GE:
                case TacticalLines.SEAWALL:
                case TacticalLines.SEAWALL_GE:
                case TacticalLines.EBB_TIDE:
                case TacticalLines.FLOOD_TIDE:
                case TacticalLines.EBB_TIDE_GE:
                case TacticalLines.FLOOD_TIDE_GE:
                case TacticalLines.JET:
                case TacticalLines.STREAM:
                case TacticalLines.JET_GE:
                case TacticalLines.STREAM_GE: {
                    lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                    lineObject2.lineTo(ptLast.x, ptLast.y);
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setShape(lineObject2);
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.CRACKS_SPECIFIC_LOCATION:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION_GE:
                case TacticalLines.ICE_EDGE_RADAR:
                case TacticalLines.ICE_EDGE_RADAR_GE: {
                    lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setShape(lineObject2);
                    shapes.push(shape);
                    break;
                }

                case TacticalLines.ICE_OPENINGS_LEAD: {
                    originalPixels = tg.Pixels;
                    partitions = clsChannelUtility.GetPartitions2(tg);
                    v = partitions.length;
                    //for(l=0;l<partitions.length;l++)
                    for (l = 0; l < v; l++) {
                        tg.Pixels = originalPixels;
                        pixels = new Array();
                        for (k = partitions[l].start; k <= partitions[l].end_Renamed + 1; k++) {

                            pixels.push(tg.Pixels[k]);
                        }


                        if (pixels == null || pixels.length === 0) {

                            continue;
                        }


                        twoSplines = new Array();
                        twoSplines = clsMETOC.ParallelLines2(pixels, arraysupport.getScaledSize(20, tg.get_LineThickness()) as int);

                        upperSpline = new Array();
                        lowerSpline = new Array();
                        w = twoSplines.length;
                        //for (j = 0; j < twoSplines.length / 2; j++)
                        for (j = 0; j < w / 2; j++) {
                            upperSpline.push(twoSplines[j]);
                        }

                        //for (j = twoSplines.length / 2; j < twoSplines.length; j++)
                        for (j = w / 2; j < w; j++) {
                            lowerSpline.push(twoSplines[j]);
                        }

                        tg.Pixels = lowerSpline;
                        lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shapes.push(shape);

                        tg.Pixels = upperSpline;
                        lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shapes.push(shape);
                    }
                    break;
                }

                case TacticalLines.ICE_OPENINGS_LEAD_GE: {
                    originalPixels = tg.Pixels;
                    partitions = clsChannelUtility.GetPartitions2(tg);
                    t = partitions.length;
                    //for(l=0;l<partitions.length;l++)
                    for (l = 0; l < t; l++) {
                        tg.Pixels = originalPixels;
                        pixels = new Array();
                        for (k = partitions[l].start; k <= partitions[l].end_Renamed + 1; k++) {

                            pixels.push(tg.Pixels[k]);
                        }


                        if (pixels == null || pixels.length === 0) {

                            continue;
                        }


                        twoSplines = new Array();
                        twoSplines = clsMETOC.ParallelLines2(pixels, arraysupport.getScaledSize(20, tg.get_LineThickness()) as int);

                        upperSpline = new Array();
                        lowerSpline = new Array();
                        u = twoSplines.length;
                        //for (j = 0; j < twoSplines.length / 2; j++)
                        for (j = 0; j < u / 2; j++) {
                            upperSpline.push(twoSplines[j]);
                        }

                        //for (j = twoSplines.length / 2; j < twoSplines.length; j++)
                        for (j = u / 2; j < u; j++) {
                            lowerSpline.push(twoSplines[j]);
                        }

                        tg.Pixels = lowerSpline;
                        lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                        ptLast = tg.Pixels[tg.Pixels.length - 1];
                        lineObject2.lineTo(ptLast.x, ptLast.y);
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shapes.push(shape);

                        tg.Pixels = upperSpline;
                        splinePoints = new Array();
                        lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                        ptLast = tg.Pixels[tg.Pixels.length - 1];
                        lineObject2.lineTo(ptLast.x, ptLast.y);
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shapes.push(shape);
                    }
                    break;
                }

                case TacticalLines.ICE_OPENINGS_FROZEN:
                case TacticalLines.ICE_OPENINGS_FROZEN_GE: {
                    originalPixels = tg.Pixels;
                    partitions = clsChannelUtility.GetPartitions2(tg);
                    t = partitions.length;
                    //for(l=0;l<partitions.length;l++)
                    for (l = 0; l < t; l++) {
                        tg.Pixels = originalPixels;
                        pixels = new Array();
                        for (k = partitions[l].start; k <= partitions[l].end_Renamed + 1; k++) {

                            pixels.push(tg.Pixels[k]);
                        }


                        if (pixels.length === 0) {

                            continue;
                        }


                        twoSplines = clsMETOC.ParallelLines2(pixels, arraysupport.getScaledSize(20, tg.get_LineThickness()) as int);
                        upperSpline = new Array();
                        lowerSpline = new Array();
                        u = twoSplines.length;
                        //for (j = 0; j < twoSplines.length / 2; j++)
                        for (j = 0; j < u / 2; j++) {
                            upperSpline.push(twoSplines[j]);
                        }

                        //for (j = twoSplines.length / 2; j < twoSplines.length; j++)
                        for (j = u / 2; j < u; j++) {
                            lowerSpline.push(twoSplines[j]);
                        }

                        tg.Pixels = lowerSpline;
                        if (tg.get_LineType() === TacticalLines.ICE_OPENINGS_FROZEN) {
                            lineObject2 = clsMETOC.DrawSplines(tg, splinePoints);
                        } else {
                            let splinePoints3: Array<POINT2> = new Array();
                            lineObject2 = clsMETOC.DrawSplines(tg, splinePoints3);
                            splinePoints.push(...splinePoints3);
                            ptLast = tg.Pixels[tg.Pixels.length - 1];
                            lineObject2.lineTo(ptLast.x, ptLast.y);
                        }
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shapes.push(shape);

                        tg.Pixels = upperSpline;
                        if (tg.get_LineType() === TacticalLines.ICE_OPENINGS_FROZEN) {
                            lineObject2 = clsMETOC.DrawSplines(tg, splinePoints2);
                        } else {
                            let splinePoints4: Array<POINT2> = new Array();
                            lineObject2 = clsMETOC.DrawSplines(tg, splinePoints4);
                            splinePoints2.push(...splinePoints4);
                            ptLast = tg.Pixels[tg.Pixels.length - 1];
                            lineObject2.lineTo(ptLast.x, ptLast.y);
                        }
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shapes.push(shape);

                        //parse upper and lower arrays to find the corresponding splines
                        let splinePointsArrays: Array<Array<POINT2>> = new Array();
                        let splinePoints2Arrays: Array<Array<POINT2>> = new Array();
                        let ptsArray: Array<POINT2> = new Array();
                        for (j = 0; j < splinePoints.length; j++) {
                            if (splinePoints[j].style !== 47) {
                                ptsArray.push(splinePoints[j]);
                            } else {
                                splinePointsArrays.push(ptsArray);
                                ptsArray = new Array();
                            }
                        }
                        for (j = 0; j < splinePoints2.length; j++) {
                            if (splinePoints2[j].style !== 47) {
                                ptsArray.push(splinePoints2[j]);
                            } else {
                                splinePoints2Arrays.push(ptsArray);
                                ptsArray = new Array();
                            }
                        }

                        lineObject = new GeneralPath();
                        for (j = 0; j < splinePointsArrays.length; j++) {
                            //the lines to connect the extrapolated points
                            let array: Array<POINT2>;
                            let array2: Array<POINT2>;
                            if (splinePoints2Arrays.length <= j) {

                                break;
                            }

                            if (splinePointsArrays.length >= splinePoints2Arrays.length) {
                                array = splinePointsArrays[j];
                                array2 = splinePoints2Arrays[j];
                            } else {
                                array = splinePoints2Arrays[j];
                                array2 = splinePointsArrays[j];
                            }
                            //extrapolate against points in the shortest array
                            for (k = 0; k < array.length; k++) {
                                let theta: double = 0;
                                if (array.length === 1) {
                                    // Unable to find slope
                                    continue;
                                }

                                else {
                                    if (k === 0) {

                                        theta = Math.atan2(array[k + 1].y - array[k].y, array[k + 1].x - array[k].x);
                                    }

                                    else {
                                        if (k === array.length - 1) {

                                            theta = Math.atan2(array[k].y - array[k - 1].y, array[k].x - array[k - 1].x);
                                        }

                                        else {

                                            theta = Math.atan2(array[k + 1].y - array[k - 1].y, array[k + 1].x - array[k - 1].x);
                                        }

                                    }

                                }


                                let pt: POINT2 = array[k];
                                let pt2: POINT2 = clsMETOC.ExtrapolatePointFromCurve(array2, pt, theta);
                                //if we got a valid extrapolation point then draw the line
                                if (pt2 != null) {
                                    lineObject.moveTo(pt.x, pt.y);
                                    lineObject.lineTo(pt2.x, pt2.y);
                                }
                            }
                        }
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject);
                        shapes.push(shape);
                    }
                    break;
                }

                case TacticalLines.LEADING_LINE: {
                    //the solid line
                    lineObject = clsMETOC.DrawSplines(tg, splinePoints);
                    lineObject2 = new GeneralPath();
                    if (splinePoints.length > 0) {

                        lineObject2.moveTo(splinePoints[0].x, splinePoints[0].y);
                    }

                    else {
                        lineObject2.moveTo(tg.Pixels[0].x, tg.Pixels[0].y);
                        t = tg.Pixels.length;
                        //for(j=0;j<tg.Pixels.length;j++)
                        for (j = 0; j < t; j++) {

                            lineObject2.lineTo(tg.Pixels[j].x, tg.Pixels[j].y);
                        }


                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                        shape.setShape(lineObject2);
                        shape.set_Style(1);
                        shapes.push(shape);
                        return;
                    }

                    let n: int = splinePoints.length / 2;
                    for (j = 1; j <= n; j++) {
                        if (splinePoints.length >= j - 1) {

                            lineObject2.lineTo(splinePoints[j].x, splinePoints[j].y);
                        }

                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setShape(lineObject2);
                    shapes.push(shape);

                    //the dashed line
                    lineObject2 = new GeneralPath();
                    lineObject2.moveTo(splinePoints[n].x, splinePoints[n].y);
                    u = splinePoints.length;
                    //for (j = n + 1; j < splinePoints.length; j++)
                    for (j = n + 1; j < u; j++) {
                        if (splinePoints.length >= j - 1) {

                            lineObject2.lineTo(splinePoints[j].x, splinePoints[j].y);
                        }

                    }
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setShape(lineObject2);
                    shape.set_Style(1);
                    shapes.push(shape);
                    break;
                }

                default: {
                    break;
                }

            }
            //add the last point
            if (tg.get_LineType() !== TacticalLines.ICE_OPENINGS_LEAD &&
                tg.get_LineType() !== TacticalLines.ICE_OPENINGS_LEAD_GE &&
                tg.get_LineType() !== TacticalLines.ICE_OPENINGS_FROZEN &&
                tg.get_LineType() !== TacticalLines.ICE_OPENINGS_FROZEN_GE &&
                tg.get_LineType() !== TacticalLines.ICE_EDGE_RADAR) {
                if (splinePoints != null && splinePoints.length > 0) {
                    lineObject2 = new GeneralPath();
                    lineObject2.moveTo(splinePoints[splinePoints.length - 1].x, splinePoints[splinePoints.length - 1].y);
                    lineObject2.lineTo(ptLast.x, ptLast.y);
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setShape(lineObject2);
                    shape.set_Style(0);
                    shapes.push(shape);
                }
            }
            clsMETOC.SetShapeProperties(tg, shapes);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsMETOC._className, "GetMeTOCShape",
                    new RendererException("Failed inside GetMeTOCShape", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Sets the shape properties based on the tacttical graphic properties and also based on shape
     * styles which may have been set by JavaLineArray
     * @param tg
     * @param shapes shapes array to set properties
     */
    protected static async SetShapeProperties(tg: TGLight, shapes: Array<Shape2>): Promise<void> {
        try {
            if (shapes == null) {
                return;
            }
            switch (tg.get_LineType()) {
                case TacticalLines.DEPTH_AREA: {
                    return;
                }

                default: {
                    break;
                }

            }

            let j: int = 0;
            let n: int = 0;
            let shape: Shape2;
            let stroke: BasicStroke;
            let patternFill: SVGSymbolInfo;
            let lineThickness: int = tg.get_LineThickness();
            let rect: Rectangle2D;
            let tp: TexturePaint = tg.get_TexturePaint();
            switch (tg.get_LineType()) {
                case TacticalLines.FISH_TRAPS:
                case TacticalLines.SWEPT_AREA:
                case TacticalLines.OIL_RIG_FIELD:
                case TacticalLines.FOUL_GROUND:
                case TacticalLines.KELP:
                case TacticalLines.BEACH_SLOPE_MODERATE:
                case TacticalLines.BEACH_SLOPE_STEEP: {
                    patternFill = PatternFillRenderer.MakeMetocPatternFill(tg);
                    shape = shapes[0];
                    shape.setLineColor(tg.get_LineColor());
                    shape.setPatternFillImage(patternFill);
                    break;
                }

                case TacticalLines.SF:
                case TacticalLines.USF:
                case TacticalLines.SFG:
                case TacticalLines.SFY: {
                    n = shapes.length;
                    //for (j = 0; j < shapes.length; j++)
                    for (j = 0; j < n; j++) {
                        shape = shapes[j];
                        if (shape == null || shape.getShape() == null) {
                            continue;
                        }

                        shape.set_Style(tg.get_LineStyle());
                        stroke = clsUtility.getLineStroke(lineThickness, shape.get_Style(), tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                        shape.setStroke(stroke);
                    }
                    return;
                }

                default: {
                    break;
                }

            }

            let shapeType: int = -1;
            let lineType: int = tg.get_LineType();
            let isChange1Area: boolean = clsUtility.IsChange1Area(lineType);
            let isClosedPolygon: boolean = clsUtility.isClosedPolygon(lineType);
            n = shapes.length;
            //for (j = 0; j < shapes.length; j++)
            for (j = 0; j < n; j++) {
                shape = shapes[j];
                if (shape == null || shape.getShape() == null) {
                    continue;
                }

                if (shape.getShapeType() === Shape2.SHAPE_TYPE_FILL) {
                    shape.setFillColor(tg.get_FillColor());
                }

                //clsUtility.ResolveModifierShape(tg,shape);

                shapeType = shape.getShapeType();
                switch (tg.get_LineType()) {
                    case TacticalLines.SF:
                    case TacticalLines.USF:
                    case TacticalLines.SFG:
                    case TacticalLines.SFY:
                    case TacticalLines.ITD: {
                        break;
                    }

                    case TacticalLines.LEADING_LINE:
                    case TacticalLines.TRAINING_AREA: {
                        shape.setLineColor(tg.get_LineColor());
                        break;
                    }

                    default: {
                        shape.setLineColor(tg.get_LineColor());
                        shape.set_Style(tg.get_LineStyle());
                        break;
                    }

                }

                if (isClosedPolygon || shapeType === Shape2.SHAPE_TYPE_FILL) {
                    switch (tg.get_LineType())//these have fill instead of TexturePaint
                    {
                        case TacticalLines.FORESHORE_AREA:
                        case TacticalLines.WATER:
                        case TacticalLines.BEACH:
                        case TacticalLines.ISLAND:
                        case TacticalLines.DRYDOCK:
                        case TacticalLines.LOADING_FACILITY_AREA:
                        case TacticalLines.PERCHES:
                        case TacticalLines.UNDERWATER_HAZARD:
                        case TacticalLines.DISCOLORED_WATER:
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
                        case TacticalLines.FINE_SAND:
                        case TacticalLines.MEDIUM_SAND:
                        case TacticalLines.COARSE_SAND:
                        case TacticalLines.VERY_COARSE_SAND:
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
                        case TacticalLines.BOTTOM_ROUGHNESS_MODERATE:
                        case TacticalLines.BOTTOM_ROUGHNESS_ROUGH:
                        case TacticalLines.BOTTOM_ROUGHNESS_SMOOTH:
                        case TacticalLines.CLUTTER_HIGH:
                        case TacticalLines.CLUTTER_MEDIUM:
                        case TacticalLines.CLUTTER_LOW:
                        case TacticalLines.IMPACT_BURIAL_0:
                        case TacticalLines.IMPACT_BURIAL_10:
                        case TacticalLines.IMPACT_BURIAL_100:
                        case TacticalLines.IMPACT_BURIAL_20:
                        case TacticalLines.IMPACT_BURIAL_75:
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
                        case TacticalLines.SUBMERGED_CRIB:
                        case TacticalLines.FREEFORM: {
                            shape.setFillColor(tg.get_FillColor());
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }

                if (lineType === TacticalLines.INSTABILITY || lineType === TacticalLines.SHEAR) {
                    // Calculate dash array for instability and shear so that dots are on peak of curves
                    let dotLength: double = 1;
                    let spacing: double = lineThickness * 2;

                    let points: Array<POINT2> = shape.getPoints();

                    let arcLength: double = 0;
                    for (let i: int = 0; i < 6; i++) { // 6 segments in each arc
                        arcLength += lineutility.CalcDistanceDouble(points[i], points[i + 1]) as double;
                    }

                    // For very large line thicknesses get a reasonable spacing
                    // Helps avoid calculating negative dashLength if spacing is longer than arc
                    spacing = Math.min(spacing, arcLength / 5);

                    // dashLength is space remaining in arc after adding dots and spacing.
                    // Divide remaining space by two because there's a dash on both sides of the dots
                    let dash: number[];
                    if (lineType === TacticalLines.INSTABILITY) {
                        let dotAndSpaceLength: double = dotLength * 2 + spacing * 3;
                        let dashLength: double = (arcLength - dotAndSpaceLength) / 2;
                        dash = [dashLength, spacing, dotLength, spacing, dotLength, spacing, dashLength, 0];
                    } else { // SHEAR
                        let dotAndSpaceLength: double = dotLength + spacing * 2;
                        let dashLength: double = (arcLength - dotAndSpaceLength) / 2;
                        dash = [dashLength, spacing, dotLength, spacing, dashLength, 0];
                    }
                    stroke = new BasicStroke(lineThickness, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 4, dash, 0);
                } else {
                    if (lineType === TacticalLines.TROUGH) {
                        // The dashed lines look odd when longer than the arc length. This will set a max length for dashes relative to the arc length.
                        let points: Array<POINT2> = shape.getPoints();

                        let arcLength: double = 0;
                        for (let i: int = 0; i < 6; i++) { // 6 segments in each arc
                            arcLength += lineutility.CalcDistanceDouble(points[i], points[i + 1]) as double;
                        }

                        let dashLength: double = 2 * lineThickness; // from clsUtility.getLineStroke

                        dashLength = Math.min(dashLength, arcLength / 4);

                        let dash: number[] = [dashLength, dashLength];
                        stroke = new BasicStroke(lineThickness, tg.get_lineCap(), BasicStroke.JOIN_ROUND, 4, dash, 0);
                    } else {
                        stroke = clsUtility.getLineStroke(lineThickness, shape.get_Style(), tg.get_lineCap(), BasicStroke.JOIN_ROUND);
                    }
                }

                shape.setStroke(stroke);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("error in clsMETOC.SetShapeProperties");
                ErrorLogger.LogException(clsMETOC._className, "SetShapeProperties",
                    new RendererException("Failed inside SetShapeProperties", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Draws an arrow to the GeneralPath object from pt1 to pt2.
     *
     * @param pt1 arrow tip
     * @param pt2 - arrow base
     * @param size - arrow size in pixels
     * @param lineObject - general path to draw the arrow
     *
     * @return arrow sprite
     */
    private static DrawArrow(pt1: POINT2,
        pt2: POINT2,
        size: double,
        lineObject: GeneralPath): void {
        try {
            let ptBase: POINT2 = new POINT2();
            let ptTemp: POINT2 = new POINT2();
            let pts: Array<POINT2> = new Array();
            ptBase = lineutility.ExtendAlongLineDouble(pt2, pt1, size);
            ptTemp = lineutility.ExtendDirectedLine(pt1, ptBase, ptBase, 2, size);

            pts.push(ptTemp);
            pts.push(pt2);
            ptTemp = lineutility.ExtendDirectedLine(pt1, ptBase, ptBase, 3, size);
            pts.push(ptTemp);
            lineObject.moveTo(pts[0].x, pts[0].y);
            lineObject.lineTo(pts[1].x, pts[1].y);
            lineObject.lineTo(pts[2].x, pts[2].y);
            pts.length = 0; // pts.clear()
            pts = null;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsMETOC._className, "DrawArrow",
                    new RendererException("Failed inside DrawArrow", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Returns a GeneralPath for symbols which require splines. Also returns the calculated
     * spline points for those symbols with additional features based on them.
     * @param tg
     * @param splinePoints2 spline points in pixels
     * @return
     */
    private static DrawSplines(tg: TGLight,
        splinePoints2: Array<POINT2>): GeneralPath {
        let lineObject: GeneralPath = new GeneralPath();
        try {
            let i: int = 0;
            let j: int = 0;
            let n: int = 0;
            let t: int = 0;
            let splinePoints: Array<POINT2>;
            let array: Array<POINT2> = tg.get_Pixels();
            let pt0: POINT2 = new POINT2();
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();
            let pt3: POINT2 = new POINT2();
            let
                pt4: POINT2 = new POINT2();
            let pt5: POINT2 = new POINT2();
            let pt6: POINT2 = new POINT2();
            let pt: POINT2;
            let pt_before: POINT2;
            let pt_after: POINT2;
            let Di: POINT2;
            let p2: POINT2;
            let p3: POINT2;
            let pt_after2: POINT2;
            let tension: double = 0.33;
            let control_scale: double = (tension / 0.5 * 0.175);
            let d: double = 0;
            let tmpArray: Array<POINT2>;
            n = array.length;
            //for (i = 0; i < array.length - 1; i++) //was length-1
            for (i = 0; i < n - 1; i++) //was length-1
            {
                pt = array[i];
                if (i === 0) {
                    lineObject.moveTo(pt.x, pt.y);
                    pt_before = pt;
                } else {
                    pt_before = array[i - 1];
                }

                if (i === array.length - 1) {
                    pt2 = array[i];
                } else {
                    pt2 = array[i + 1];
                }

                if (i < array.length - 2) {
                    pt_after = array[i + 1];
                } else {
                    pt_after = array[array.length - 1];
                }

                if (i < array.length - 2) {
                    pt_after2 = array[i + 2];
                } else {
                    pt_after2 = array[array.length - 1];
                }


                Di = new POINT2();
                p2 = new POINT2();

                Di.x = pt_after.x - pt_before.x;
                Di.y = pt_after.y - pt_before.y;
                p2.x = pt.x + control_scale * Di.x;
                p2.y = pt.y + control_scale * Di.y;

                p3 = new POINT2();
                let DiPlus1: POINT2 = new POINT2();

                DiPlus1.x = pt_after2.x - pt.x;
                DiPlus1.y = pt_after2.y - pt.y;
                p3.x = pt_after.x - control_scale * DiPlus1.x;
                p3.y = pt_after.y - control_scale * DiPlus1.y;

                tmpArray = clsMETOC.drawCubicBezier2(tg, lineObject, pt, p2, p3, pt2);

                //ICE_OPENINGS_FROZEN needs to know which segment corresponds to each spline point
                if (tg.get_LineType() === TacticalLines.ICE_OPENINGS_FROZEN ||
                    tg.get_LineType() === TacticalLines.ICE_OPENINGS_FROZEN_GE) {
                    if (tmpArray.length > 0) {

                        tmpArray[tmpArray.length - 1].style = 47;
                    }
                    //use this to differentiate the arrays
                }
                splinePoints2.push(...tmpArray);

                splinePoints = tmpArray;

                switch (tg.get_LineType()) {
                    case TacticalLines.EBB_TIDE: {
                        if (i === array.length - 2) {
                            if (splinePoints.length >= 2) {

                                clsMETOC.DrawArrow(splinePoints[splinePoints.length - 2], tg.Pixels[tg.Pixels.length - 1], arraysupport.getScaledSize(10, tg.get_LineThickness()), lineObject);
                            }

                        }
                        break;
                    }

                    case TacticalLines.FLOOD_TIDE: {
                        d = arraysupport.getScaledSize(10, tg.get_LineThickness());
                        if (i === 0 && splinePoints.length > 1) {
                            //finally get the feather points
                            //must allocate for the feather points, requires 4 additional points
                            pt0 = splinePoints[0];
                            pt1 = splinePoints[1];
                            pt2 = lineutility.ExtendLineDouble(pt0, pt1, d);
                            pt3 = lineutility.ExtendLineDouble(pt0, pt1, d * 2);
                            pt4 = lineutility.ExtendLineDouble(pt0, pt1, d * 3);
                            pt5 = lineutility.ExtendDirectedLine(pt3, pt2, pt2, 3, d);
                            pt6 = lineutility.ExtendDirectedLine(pt4, pt3, pt3, 3, d);

                            //first feather line
                            lineObject.moveTo(pt3.x, pt3.y);
                            lineObject.lineTo(pt5.x, pt5.y);
                            //second feather line
                            lineObject.moveTo(pt4.x, pt4.y);
                            lineObject.lineTo(pt6.x, pt6.y);
                        }
                        if (i === array.length - 2) {
                            if (splinePoints.length >= 2) {

                                clsMETOC.DrawArrow(splinePoints[splinePoints.length - 2], tg.Pixels[tg.Pixels.length - 1], d, lineObject);
                            }

                        }
                        break;
                    }

                    case TacticalLines.STREAM:
                    case TacticalLines.JET: {
                        if (splinePoints.length > i + 1) {
                            clsMETOC.DrawArrow(splinePoints[i + 1], splinePoints[i], arraysupport.getScaledSize(10, tg.get_LineThickness()), lineObject);
                        }
                        break;
                    }

                    case TacticalLines.FLOOD_TIDE_GE: {
                        d = arraysupport.getScaledSize(10, tg.get_LineThickness());
                        if (i === 0 && splinePoints.length > 1) {
                            //finally get the feather points
                            //must allocate for the feather points, requires 4 additional points
                            pt0 = splinePoints[0];
                            pt1 = splinePoints[1];
                            pt2 = lineutility.ExtendLineDouble(pt0, pt1, d);
                            pt3 = lineutility.ExtendLineDouble(pt0, pt1, d * 2);
                            pt4 = lineutility.ExtendLineDouble(pt0, pt1, d * 3);
                            pt5 = lineutility.ExtendDirectedLine(pt3, pt2, pt2, 3, d);
                            pt6 = lineutility.ExtendDirectedLine(pt4, pt3, pt3, 3, d);

                            //first feather line
                            lineObject.moveTo(pt3.x, pt3.y);
                            lineObject.lineTo(pt5.x, pt5.y);
                            //second feather line
                            lineObject.moveTo(pt4.x, pt4.y);
                            lineObject.lineTo(pt6.x, pt6.y);
                        }
                        if (i === array.length - 2)//the last point in the array
                        {
                            lineObject.moveTo(splinePoints2[0].x as int, splinePoints2[0].y as int);
                            t = splinePoints2.length;
                            //for(j=1;j<splinePoints2.length;j++)
                            for (j = 1; j < t; j++) {

                                lineObject.lineTo(splinePoints2[j].x as int, splinePoints2[j].y as int);
                            }


                            if (splinePoints.length >= 2) {

                                clsMETOC.DrawArrow(splinePoints[splinePoints.length - 2], tg.Pixels[tg.Pixels.length - 1], d, lineObject);
                            }

                        }
                        break;
                    }

                    case TacticalLines.EBB_TIDE_GE: {
                        if (i === array.length - 2)//the last point in the array
                        {
                            lineObject = new GeneralPath();
                            lineObject.moveTo(splinePoints2[0].x as int, splinePoints2[0].y as int);
                            t = splinePoints2.length;
                            //for(j=1;j<splinePoints2.length;j++)
                            for (j = 1; j < t; j++) {

                                lineObject.lineTo(splinePoints2[j].x as int, splinePoints2[j].y as int);
                            }


                            if (splinePoints.length >= 2) {

                                clsMETOC.DrawArrow(splinePoints[splinePoints.length - 2], tg.Pixels[tg.Pixels.length - 1], arraysupport.getScaledSize(10, tg.get_LineThickness()), lineObject);
                            }

                        }
                        break;
                    }

                    case TacticalLines.JET_GE:
                    case TacticalLines.STREAM_GE: {
                        if (splinePoints.length > i + 1) {
                            clsMETOC.DrawArrow(splinePoints[i + 1], splinePoints[i], arraysupport.getScaledSize(10, tg.get_LineThickness()), lineObject);
                        }
                        if (i === array.length - 2)//the last point in the array
                        {
                            lineObject.moveTo(splinePoints2[0].x as int, splinePoints2[0].y as int);
                            t = splinePoints2.length;
                            //for(j=1;j<splinePoints2.length;j++)
                            for (j = 1; j < t; j++) {

                                lineObject.lineTo(splinePoints2[j].x as int, splinePoints2[j].y as int);
                            }

                        }
                        break;
                    }

                    case TacticalLines.ICE_OPENINGS_FROZEN_GE:
                    case TacticalLines.ICE_OPENINGS_LEAD_GE:
                    case TacticalLines.SEAWALL_GE:
                    case TacticalLines.JETTY_BELOW_WATER_GE:
                    case TacticalLines.JETTY_ABOVE_WATER_GE:
                    case TacticalLines.RAMP_ABOVE_WATER_GE:
                    case TacticalLines.RAMP_BELOW_WATER_GE:
                    case TacticalLines.PIER_GE:
                    case TacticalLines.COASTLINE_GE:
                    case TacticalLines.DEPTH_CONTOUR_GE:
                    case TacticalLines.DEPTH_CURVE_GE:
                    case TacticalLines.CRACKS_GE:
                    case TacticalLines.ESTIMATED_ICE_EDGE_GE:
                    case TacticalLines.ICE_EDGE_GE:
                    case TacticalLines.ISOPLETHS_GE:
                    case TacticalLines.ISODROSOTHERM_GE:
                    case TacticalLines.ISOTACH_GE:
                    case TacticalLines.ISOTHERM_GE:
                    case TacticalLines.UPPER_AIR_GE:
                    case TacticalLines.ISOBAR_GE: {
                        if (splinePoints2 != null && splinePoints2.length > 0) {
                            lineObject = new GeneralPath();
                            if (i === array.length - 2)//the last point in the array
                            {
                                lineObject.moveTo(splinePoints2[0].x as int, splinePoints2[0].y as int);
                                t = splinePoints2.length;
                                //for(j=1;j<splinePoints2.length;j++)
                                for (j = 1; j < t; j++) {

                                    lineObject.lineTo(splinePoints2[j].x as int, splinePoints2[j].y as int);
                                }

                            }
                        }
                        break;
                    }

                    case TacticalLines.ICE_EDGE_RADAR: {
                        t = splinePoints.length;
                        d = arraysupport.getScaledSize(5, tg.get_LineThickness());
                        //for (j = 0; j < splinePoints.length - 1; j++)
                        for (j = 0; j < t - 1; j++) {
                            pt0 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt2 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt0, 45, d);
                            pt1 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt3 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt1, -45, d);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt2.x, pt2.y);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt3.x, pt3.y);

                            pt0 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt2 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt0, 135, d);
                            pt1 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt3 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt1, -135, d);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt2.x, pt2.y);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt3.x, pt3.y);
                        }
                        break;
                    }

                    case TacticalLines.ICE_EDGE_RADAR_GE: {
                        t = splinePoints.length;
                        d = arraysupport.getScaledSize(5, tg.get_LineThickness());
                        //for (j = 0; j < splinePoints.length - 1; j++)
                        for (j = 0; j < t - 1; j++) {
                            pt0 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt2 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt0, 45, d);
                            pt1 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt3 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt1, -45, d);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt2.x, pt2.y);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt3.x, pt3.y);

                            pt0 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt2 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt0, 135, d);
                            pt1 = new POINT2(splinePoints[j].x, splinePoints[j].y);
                            pt3 = lineutility.ExtendAngledLine(splinePoints[j], splinePoints[j + 1], pt1, -135, d);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt2.x, pt2.y);
                            lineObject.moveTo(splinePoints[j].x, splinePoints[j].y);
                            lineObject.lineTo(pt3.x, pt3.y);
                        }
                        if (i === array.length - 2)//the last point in the array
                        {
                            lineObject.moveTo(splinePoints2[0].x as int, splinePoints2[0].y as int);
                            t = splinePoints2.length;
                            //for(j=1;j<splinePoints2.length;j++)
                            for (j = 1; j < t; j++) {

                                lineObject.lineTo(splinePoints2[j].x as int, splinePoints2[j].y as int);
                            }

                        }
                        break;
                    }

                    case TacticalLines.CRACKS_SPECIFIC_LOCATION: {
                        t = splinePoints.length;
                        d = arraysupport.getScaledSize(5, tg.get_LineThickness());
                        //for (j = 0; j < splinePoints.length - 1; j++)
                        for (j = 0; j < t - 1; j++) {
                            //get perpendicular points (point pair)
                            pt0 = splinePoints[j + 1];
                            pt1 = lineutility.ExtendDirectedLine(splinePoints[j], splinePoints[j + 1], pt0, 2, d);
                            lineObject.moveTo(pt1.x, pt1.y);
                            pt1 = lineutility.ExtendDirectedLine(splinePoints[j], splinePoints[j + 1], pt0, 3, d);
                            lineObject.lineTo(pt1.x, pt1.y);
                        }
                        break;
                    }

                    case TacticalLines.CRACKS_SPECIFIC_LOCATION_GE: {
                        t = splinePoints.length;
                        d = arraysupport.getScaledSize(5, tg.get_LineThickness());
                        //for (j = 0; j < splinePoints.length - 1; j++)
                        for (j = 0; j < t - 1; j++) {
                            //get perpendicular points (point pair)
                            pt0 = splinePoints[j + 1];
                            pt1 = lineutility.ExtendDirectedLine(splinePoints[j], splinePoints[j + 1], pt0, 2, d);
                            lineObject.moveTo(pt1.x, pt1.y);
                            pt1 = lineutility.ExtendDirectedLine(splinePoints[j], splinePoints[j + 1], pt0, 3, d);
                            lineObject.lineTo(pt1.x, pt1.y);
                        }
                        if (i === array.length - 2)//the last point in the array
                        {
                            lineObject.moveTo(splinePoints2[0].x as int, splinePoints2[0].y as int);
                            t = splinePoints2.length;
                            //for(j=1;j<splinePoints2.length;j++)
                            for (j = 1; j < t; j++) {

                                lineObject.lineTo(splinePoints2[j].x as int, splinePoints2[j].y as int);
                            }

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
                ErrorLogger.LogException(clsMETOC._className, "DrawSplines",
                    new RendererException("Failed inside DrawSplines", exc));
            } else {
                throw exc;
            }
        }
        return lineObject;
    }

    /**
     * Calculates a point on a segment using a ratio of the segment length.
     * This function is used for calculating control points on Bezier curves.
     *
     * @param P0 the 1st point on the segment.
     * @param P1 the last point on the segment
     * @param ratio the fraction of the segment length
     *
     * @return calculated point on the P0-P1 segment.
     */
    private static getPointOnSegment(P0: POINT2, P1: POINT2, ratio: double): POINT2 {
        //return {x: (P0.x + ((P1.x - P0.x) * ratio)), y: (P0.y + ((P1.y - P0.y) * ratio))};
        //var pt:Point=new Point();
        let pt: POINT2 = new POINT2();
        try {
            pt.x = P0.x + (P1.x - P0.x) * ratio;
            pt.y = P0.y + (P1.y - P0.y) * ratio;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsMETOC._className, "getPointOnSegment",
                    new RendererException("Failed inside getPointOnSegment", exc));
            } else {
                throw exc;
            }
        }
        return pt;
    }

    /**
     * This function will trace a cubic approximation of the cubic Bezier
     * It will calculate a series of (control point/Destination point] which
     * will be used to draw quadratic Bezier starting from P0
     *
     * @param lineObject - the sprite to use for drawing
     * @param P0 - 1st client point
     * @param P1 - 1st control point for a cubic Bezier
     * @param P2 - 2nd control point
     * @param P3 - 2nd client point
     *
     * @return an array of points along the spline at linetype specific intervals
     */
    private static drawCubicBezier2(
        tg: TGLight,
        lineObject: GeneralPath,
        P0: POINT2,
        P1: POINT2,
        P2: POINT2,
        P3: POINT2): Array<POINT2> {
        let array: Array<POINT2> = new Array();
        try {
            // this stuff may be unnecessary
            // calculates the useful base points
            let PA: POINT2 = clsMETOC.getPointOnSegment(P0, P1, 0.75);
            let PB: POINT2 = clsMETOC.getPointOnSegment(P3, P2, 0.75);

            // get 1/16 of the [P3, P0] segment
            let dx: double = (P3.x - P0.x) / 16;
            let dy: double = (P3.y - P0.y) / 16;

            // calculates control point 1
            let Pc_1: POINT2 = clsMETOC.getPointOnSegment(P0, P1, 0.375);

            // calculates control point 2
            let Pc_2: POINT2 = clsMETOC.getPointOnSegment(PA, PB, 0.375);
            Pc_2.x -= dx;
            Pc_2.y -= dy;

            // calculates control point 3
            let Pc_3: POINT2 = clsMETOC.getPointOnSegment(PB, PA, 0.375);
            Pc_3.x += dx;
            Pc_3.y += dy;

            // calculates control point 4
            let Pc_4: POINT2 = clsMETOC.getPointOnSegment(P3, P2, 0.375);

            // calculates the 3 anchor points
            let Pa_1: POINT2 = lineutility.MidPointDouble(Pc_1, Pc_2, 0);
            let Pa_2: POINT2 = lineutility.MidPointDouble(PA, PB, 0);
            let Pa_3: POINT2 = lineutility.MidPointDouble(Pc_3, Pc_4, 0);
            switch (tg.get_LineType()) {   //draw the solid curve for these
                case TacticalLines.ISOBAR:
                case TacticalLines.UPPER_AIR:
                case TacticalLines.ISODROSOTHERM:
                case TacticalLines.ICE_EDGE:
                case TacticalLines.CRACKS:
                case TacticalLines.DEPTH_CURVE:
                case TacticalLines.DEPTH_CONTOUR:
                case TacticalLines.COASTLINE:
                case TacticalLines.PIER:
                case TacticalLines.RAMP_ABOVE_WATER:
                case TacticalLines.JETTY_ABOVE_WATER:
                case TacticalLines.SEAWALL:
                case TacticalLines.ICE_OPENINGS_LEAD:
                case TacticalLines.ISOTACH:
                case TacticalLines.ISOTHERM:
                case TacticalLines.ISOPLETHS:
                case TacticalLines.ESTIMATED_ICE_EDGE:
                case TacticalLines.RAMP_BELOW_WATER:
                case TacticalLines.JETTY_BELOW_WATER: {
                    lineObject.moveTo(P0.x, P0.y);
                    lineObject.curveTo(P1.x, P1.y, P2.x, P2.y, P3.x, P3.y);
                    return array;
                }

                case TacticalLines.ICE_OPENINGS_LEAD_GE:
                case TacticalLines.SEAWALL_GE:
                case TacticalLines.JETTY_BELOW_WATER_GE:
                case TacticalLines.JETTY_ABOVE_WATER_GE:
                case TacticalLines.RAMP_ABOVE_WATER_GE:
                case TacticalLines.RAMP_BELOW_WATER_GE:
                case TacticalLines.PIER_GE:
                case TacticalLines.COASTLINE_GE:
                case TacticalLines.DEPTH_CONTOUR_GE:
                case TacticalLines.DEPTH_CURVE_GE:
                case TacticalLines.CRACKS_GE:
                case TacticalLines.ESTIMATED_ICE_EDGE_GE:
                case TacticalLines.ICE_EDGE_GE:
                case TacticalLines.ISOPLETHS_GE:
                case TacticalLines.ISOTACH_GE:
                case TacticalLines.ISOTHERM_GE:
                case TacticalLines.ISOBAR_GE:
                case TacticalLines.UPPER_AIR_GE:
                case TacticalLines.ISODROSOTHERM_GE:
                case TacticalLines.ICE_OPENINGS_FROZEN:
                case TacticalLines.ICE_OPENINGS_FROZEN_GE:
                case TacticalLines.ICE_EDGE_RADAR:
                case TacticalLines.ICE_EDGE_RADAR_GE:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION_GE:
                case TacticalLines.EBB_TIDE:
                case TacticalLines.FLOOD_TIDE:
                case TacticalLines.EBB_TIDE_GE:
                case TacticalLines.FLOOD_TIDE_GE:
                case TacticalLines.JET:
                case TacticalLines.STREAM:
                case TacticalLines.JET_GE:
                case TacticalLines.STREAM_GE: {
                    lineObject.moveTo(P0.x, P0.y);
                    lineObject.curveTo(P1.x, P1.y, P2.x, P2.y, P3.x, P3.y);
                    //do not return, we still need the spline points
                    //to claculate other features
                    break;
                }

                default: {
                    //the rest of them must use the calculated curve points
                    break;
                }

            }
            //var sprite:Sprite;
            let j: int = 0;
            let distance: double = 0;
            let n: int = 0;
            let x: double = 0;
            let y: double = 0;
            let increment: double = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let t: double = 0;
            let pt: POINT2;
            array.length = 0; // array.clear()
            //distance=clsUtility.Distance2(P0,Pa_1);
            //add the curve points to tg.Pixels
            switch (tg.get_LineType()) {
                case TacticalLines.ICE_EDGE_RADAR:
                case TacticalLines.ICE_EDGE_RADAR_GE: {
                    increment = arraysupport.getScaledSize(20, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.ICE_OPENINGS_FROZEN:
                case TacticalLines.ICE_OPENINGS_FROZEN_GE:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION_GE: {
                    //increment = 12.0;
                    increment = arraysupport.getScaledSize(7, tg.get_LineThickness());
                    break;
                }

                default: {
                    increment = arraysupport.getScaledSize(10, tg.get_LineThickness());
                    break;
                }

            }

            distance = lineutility.CalcDistanceDouble(P0, Pa_1);
            if (distance < increment) {

                distance = increment;
            }

            n = Math.trunc(distance / increment);

            pt0 = P0;
            pt1 = Pc_1;
            pt2 = Pa_1;
            for (j = 0; j < n; j++) {
                t = j as double * (increment / distance);
                x = (1 - t) * (1 - t) * pt0.x + 2 * (1 - t) * t * pt1.x + t * t * pt2.x;
                y = (1 - t) * (1 - t) * pt0.y + 2 * (1 - t) * t * pt1.y + t * t * pt2.y;
                pt = new POINT2(x, y);
                //array.push(pt);
                array.push(pt);
            }
            //distance=clsUtility.Distance2(Pa_1,Pa_2);
            distance = lineutility.CalcDistanceDouble(Pa_1, Pa_2);

            //add the curve points to tg.Pixels
            n = Math.trunc(distance / increment);
            pt0 = Pa_1;
            pt1 = Pc_2;
            pt2 = Pa_2;
            for (j = 0; j < n; j++) {
                t = j as double * (increment / distance);
                x = (1 - t) * (1 - t) * pt0.x + 2 * (1 - t) * t * pt1.x + t * t * pt2.x;
                y = (1 - t) * (1 - t) * pt0.y + 2 * (1 - t) * t * pt1.y + t * t * pt2.y;
                pt = new POINT2(x, y);
                array.push(pt);
            }

            //distance=clsUtility.Distance2(Pa_2,Pa_3);
            distance = lineutility.CalcDistanceDouble(Pa_2, Pa_3);
            //add the curve points to tg.Pixels
            n = Math.trunc(distance / increment);
            pt0 = Pa_2;
            pt1 = Pc_3;
            pt2 = Pa_3;
            for (j = 0; j < n; j++) {
                t = j as double * (increment / distance);
                x = (1 - t) * (1 - t) * pt0.x + 2 * (1 - t) * t * pt1.x + t * t * pt2.x;
                y = (1 - t) * (1 - t) * pt0.y + 2 * (1 - t) * t * pt1.y + t * t * pt2.y;
                pt = new POINT2(x, y);
                array.push(pt);
            }
            //distance=clsUtility.Distance2(Pa_3,P3);
            distance = lineutility.CalcDistanceDouble(Pa_3, P3);
            //add the curve points to tg.Pixels
            n = Math.trunc(distance / increment);
            pt0 = Pa_3;
            pt1 = Pc_4;
            pt2 = P3;
            for (j = 0; j < n; j++) {
                t = j as double * (increment / distance);
                x = (1 - t) * (1 - t) * pt0.x + 2 * (1 - t) * t * pt1.x + t * t * pt2.x;
                y = (1 - t) * (1 - t) * pt0.y + 2 * (1 - t) * t * pt1.y + t * t * pt2.y;
                pt = new POINT2(x, y);
                array.push(pt);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsMETOC._className, "drawCubicBezier2",
                    new RendererException("Failed inside drawCubicBezier2", exc));
            } else {
                throw exc;
            }
        }
        return array;
    }

    /*
     *
     * Called by Splines2TG to get straight channel lines for splines.
     *
     * @param tg - TGlight
     *
     * @return An ArrayList to use for building the parallel splines
     */
    //    private static ArrayList ParallelLines(TGLight tg,int rev) {
    //        ArrayList<POINT2> channelPoints2 = new ArrayList();
    //        try {
    //            double[] pLinePoints = new double[tg.Pixels.length * 2];
    //            double[] channelPoints = new double[6 * tg.Pixels.length];
    //            int j = 0;
    //            int n=tg.Pixels.length;
    //            //for (j = 0; j < tg.Pixels.length; j++)
    //            for (j = 0; j < n; j++) 
    //            {
    //                pLinePoints[2 * j] = tg.Pixels[j].x;
    //                pLinePoints[2 * j + 1] = tg.Pixels[j].y;
    //            }
    //            int numPoints = tg.Pixels.length;
    //            int channelWidth = 20;
    //            int usePtr = 0;
    //            ArrayList<Shape2> shapes = null;
    //
    //            try {
    //                CELineArray.CGetChannel2Double(pLinePoints, pLinePoints, channelPoints, numPoints, numPoints, (int) TacticalLines.CHANNEL, channelWidth, usePtr, shapes,rev);
    //            } catch (Exception e) {
    //                ErrorLogger.LogException(_className, "ParallelLines",
    //                    new RendererException("Failed inside ParallelLines", e));
    //            }
    //
    //            POINT2 pt2 = null;
    //            int style = 0;
    //            n=channelPoints.length;
    //            //for (j = 0; j < channelPoints.length / 3; j++) 
    //            for (j = 0; j < n / 3; j++) 
    //            {
    //                pt2 = new POINT2(channelPoints[3 * j], channelPoints[3 * j + 1], style);
    //                channelPoints2.push(pt2);
    //            }
    //        } catch (Exception exc) {
    //            ErrorLogger.LogException(_className, "ParallelLines",
    //                    new RendererException("Failed inside ParallelLines", exc));
    //        }
    //        return channelPoints2;
    //    }
    /**
     * Call this function with segment
     * @param Pixels a segment of tg.Pixels
     * @return
     */
    private static ParallelLines2(Pixels: Array<POINT2>, channelWidth: int): Array<POINT2> {
        let channelPoints2: Array<POINT2> = new Array();
        try {
            let pLinePoints: number[] = new Array<number>(Pixels.length * 2);
            let channelPoints: number[] = new Array<number>(6 * Pixels.length);
            let j: int = 0;
            let n: int = Pixels.length;
            //for (j = 0; j < Pixels.length; j++)
            for (j = 0; j < n; j++) {
                pLinePoints[2 * j] = Pixels[j].x;
                pLinePoints[2 * j + 1] = Pixels[j].y;
            }
            let numPoints: int = Pixels.length;
            let usePtr: int = 0;
            let shapes: Array<Shape2>;

            try {
                let tg: TGLight = new TGLight();
                tg.set_LineType(TacticalLines.CHANNEL);
                Channels.GetChannel1Double(tg, pLinePoints, pLinePoints, channelPoints, numPoints, numPoints, channelWidth, usePtr, shapes);
            } catch (e) {
                if (e instanceof Error) {
                    ErrorLogger.LogException(clsMETOC._className, "ParallelLines2",
                        new RendererException("Failed inside ParallelLines2", e));
                } else {
                    throw e;
                }
            }

            let pt2: POINT2;
            let style: int = 0;
            n = channelPoints.length;
            //for (j = 0; j < channelPoints.length / 3; j++) 
            for (j = 0; j < n / 3; j++) {
                pt2 = new POINT2(channelPoints[3 * j], channelPoints[3 * j + 1], style);
                channelPoints2.push(pt2);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsMETOC._className, "ParallelLines2",
                    new RendererException("Failed inside ParallelLines2", exc));
            } else {
                throw exc;
            }
        }
        return channelPoints2;
    }
}
