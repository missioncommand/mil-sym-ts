/*
 * A class to serve JavaRendererServer
 */


import { type int, type double } from "../../c5isr/graphics2d/BasicTypes";
import { BasicStroke } from "../graphics2d/BasicStroke"
import { Font } from "../graphics2d/Font"
import { Graphics2D } from "../graphics2d/Graphics2D"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { CELineArray } from "../JavaLineArray/CELineArray"
import { DISMSupport } from "../JavaLineArray/DISMSupport"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { clsUtility as clsUtilityJTR } from "../JavaTacticalRenderer/clsUtility"
import { mdlGeodesic } from "../JavaTacticalRenderer/mdlGeodesic"
import { Modifier2 } from "../JavaTacticalRenderer/Modifier2"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { Color } from "../renderer/utilities/Color"
import { DistanceUnit } from "../renderer/utilities/DistanceUnit"
import { DrawRules } from "../renderer/utilities/DrawRules"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { MilStdSymbol } from "../renderer/utilities/MilStdSymbol"
import { Modifiers } from "../renderer/utilities/Modifiers"
import { MSInfo } from "../renderer/utilities/MSInfo"
import { MSLookup } from "../renderer/utilities/MSLookup"
import { RendererException } from "../renderer/utilities/RendererException"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { ShapeInfo } from "../renderer/utilities/ShapeInfo"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../renderer/utilities/SymbolUtilities"
import { clsClipPolygon2 } from "../RenderMultipoints/clsClipPolygon2"
import { clsClipQuad } from "../RenderMultipoints/clsClipQuad"
import { clsRenderer2 } from "../RenderMultipoints/clsRenderer2"
import { clsUtility } from "../RenderMultipoints/clsUtility"
import { clsUtilityCPOF } from "../RenderMultipoints/clsUtilityCPOF"
import { clsUtilityGE } from "../RenderMultipoints/clsUtilityGE"

/**
 * Rendering class
 *
 *
 */
export class clsRenderer {

    private static readonly _className: string = "clsRenderer";

    /**
     * Set tg geo points from the client points
     *
     * @param milStd
     * @param tg
     */
    private static setClientCoords(milStd: MilStdSymbol,
        tg: TGLight): void {
        try {
            let latLongs: Array<POINT2> = new Array();
            let j: int = 0;
            let coords: Array<Point2D> = milStd.getCoordinates();
            let pt2d: Point2D;
            let pt2: POINT2;
            let n: int = coords.length;
            //for (j = 0; j < coords.length; j++)
            for (j = 0; j < n; j++) {
                pt2d = coords[j];
                pt2 = clsUtility.Point2DToPOINT2(pt2d);
                latLongs.push(pt2);
            }
            tg.set_LatLongs(latLongs);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsRenderer", "setClientCoords",
                    new RendererException("Failed to set geo points or pixels for " + milStd.getSymbolID(), exc));
            } else {
                throw exc;
            }
        }
    }

    private static getClientCoords(tg: TGLight): Array<Point2D> {
        let coords: Array<Point2D>;
        try {
            let j: int = 0;
            let pt2d: Point2D;
            let pt2: POINT2;
            coords = new Array();
            let n: int = tg.LatLongs.length;
            //for (j = 0; j < tg.LatLongs.length; j++)
            for (j = 0; j < n; j++) {
                pt2 = tg.LatLongs[j];
                pt2d = new Point2D(pt2.x, pt2.y);
                coords.push(pt2d);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsRenderer", "getClientCoords",
                    new RendererException("Failed to set geo points or pixels for " + tg.get_SymbolId(), exc));
            } else {
                throw exc;
            }
        }
        return coords;
    }

    /**
     * Create MilStdSymbol from tactical graphic
     *
     * @deprecated
     * @param tg tactical graphic
     * @param converter geographic to pixels to converter
     * @return MilstdSymbol object
     */
    public static createMilStdSymboFromTGLight(tg: TGLight, converter: IPointConversion): MilStdSymbol {
        let milStd: MilStdSymbol;
        try {
            let symbolId: string = tg.get_SymbolId();
            let lineType: int = clsUtilityJTR.GetLinetypeFromString(symbolId);
            let status: string = tg.get_Status();
            //build tg.Pixels
            tg.Pixels = clsUtility.LatLongToPixels(tg.LatLongs, converter);
            let isClosedArea: boolean = clsUtilityJTR.isClosedPolygon(lineType);
            if (isClosedArea) {
                clsUtilityJTR.ClosePolygon(tg.Pixels);
                clsUtilityJTR.ClosePolygon(tg.LatLongs);
            }

            let coords: Array<Point2D> = clsRenderer.getClientCoords(tg);
            tg.set_Font(new Font("Arial", Font.PLAIN, 12));
            let modifiers: Map<string, string> = new Map();
            modifiers.set(Modifiers.W_DTG_1, tg.get_DTG());
            modifiers.set(Modifiers.W1_DTG_2, tg.get_DTG1());
            modifiers.set(Modifiers.H_ADDITIONAL_INFO_1, tg.get_H());
            modifiers.set(Modifiers.H1_ADDITIONAL_INFO_2, tg.get_H1());
            modifiers.set(Modifiers.H2_ADDITIONAL_INFO_3, tg.get_H2());
            modifiers.set(Modifiers.T_UNIQUE_DESIGNATION_1, tg.get_Name());
            modifiers.set(Modifiers.T1_UNIQUE_DESIGNATION_2, tg.get_T1());
            modifiers.set(Modifiers.Y_LOCATION, tg.get_Location());
            modifiers.set(Modifiers.N_HOSTILE, tg.get_N());

            milStd = new MilStdSymbol(symbolId, "1", coords, modifiers);
            milStd.setFillColor(tg.get_FillColor());
            milStd.setLineColor(tg.get_LineColor());
            milStd.setLineWidth(tg.get_LineThickness());
            milStd.setFillStyle(tg.get_TexturePaint());
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsRenderer", "createMilStdSymboFromTGLight",
                    new RendererException("Failed to set geo points or pixels for " + tg.get_SymbolId(), exc));
            } else {
                throw exc;
            }
        }
        return milStd;
    }

    /**
     * Build a tactical graphic object from the client MilStdSymbol
     *
     * @param milStd MilstdSymbol object
     * @param converter geographic to pixels converter
     * @return tactical graphic
     */
    public static createTGLightFromMilStdSymbol(milStd: MilStdSymbol,
        converter: IPointConversion): TGLight;

    /**
     * @deprecated @param milStd
     * @param converter
     * @param computeChannelPt
     * @return
     */
    public static createTGLightFromMilStdSymbol(milStd: MilStdSymbol,
        converter: IPointConversion, computeChannelPt: boolean): TGLight;
    public static createTGLightFromMilStdSymbol(...args: unknown[]): TGLight {
        switch (args.length) {
            case 2: {
                const [milStd, converter] = args as [MilStdSymbol, IPointConversion];


                let tg: TGLight = new TGLight();
                try {
                    let symbolId: string = milStd.getSymbolID();
                    tg.set_SymbolId(symbolId);
                    let useLineInterpolation: boolean = milStd.getUseLineInterpolation();
                    tg.set_UseLineInterpolation(useLineInterpolation);
                    let lineType: int = clsUtilityJTR.GetLinetypeFromString(symbolId);
                    tg.set_LineType(lineType);
                    let status: string = tg.get_Status();
                    if (status != null && status === "A") {
                        tg.set_LineStyle(1);
                    }
                    tg.set_VisibleModifiers(true);
                    //set tg latlongs and pixels
                    clsRenderer.setClientCoords(milStd, tg);
                    //build tg.Pixels
                    tg.Pixels = clsUtility.LatLongToPixels(tg.LatLongs, converter);
                    //tg.set_Font(new Font("Arial", Font.PLAIN, 12));
                    tg.set_Font(RendererSettings.getInstance().getMPLabelFont());

                    tg.set_FillColor(milStd.getFillColor());
                    tg.set_LineColor(milStd.getLineColor());
                    tg.set_LineThickness(milStd.getLineWidth());
                    tg.set_TexturePaint(milStd.getFillStyle());

                    tg.setIconSize(milStd.getUnitSize());
                    tg.set_KeepUnitRatio(milStd.getKeepUnitRatio());

                    tg.set_FontBackColor(Color.WHITE);
                    tg.set_TextColor(milStd.getTextColor());
                    if (milStd.getModifier(Modifiers.W_DTG_1) != null) {
                        tg.set_DTG(milStd.getModifier(Modifiers.W_DTG_1));
                    }
                    if (milStd.getModifier(Modifiers.W1_DTG_2) != null) {
                        tg.set_DTG1(milStd.getModifier(Modifiers.W1_DTG_2));
                    }
                    if (milStd.getModifier(Modifiers.H_ADDITIONAL_INFO_1) != null) {
                        tg.set_H(milStd.getModifier(Modifiers.H_ADDITIONAL_INFO_1));
                    }
                    if (milStd.getModifier(Modifiers.H1_ADDITIONAL_INFO_2) != null) {
                        tg.set_H1(milStd.getModifier(Modifiers.H1_ADDITIONAL_INFO_2));
                    }
                    if (milStd.getModifier(Modifiers.H2_ADDITIONAL_INFO_3) != null) {
                        tg.set_H2(milStd.getModifier(Modifiers.H2_ADDITIONAL_INFO_3));
                    }
                    if (milStd.getModifier(Modifiers.T_UNIQUE_DESIGNATION_1) != null) {
                        tg.set_Name(milStd.getModifier(Modifiers.T_UNIQUE_DESIGNATION_1));
                    }
                    if (milStd.getModifier(Modifiers.T1_UNIQUE_DESIGNATION_2) != null) {
                        tg.set_T1(milStd.getModifier(Modifiers.T1_UNIQUE_DESIGNATION_2));
                    }
                    if (milStd.getModifier(Modifiers.V_EQUIP_TYPE) != null) {
                        tg.set_V(milStd.getModifier(Modifiers.V_EQUIP_TYPE));
                    }
                    if (milStd.getModifier(Modifiers.AS_COUNTRY) != null) {
                        tg.set_AS(milStd.getModifier(Modifiers.AS_COUNTRY));
                    }
                    if (milStd.getModifier(Modifiers.AP_TARGET_NUMBER) != null) {
                        tg.set_AP(milStd.getModifier(Modifiers.AP_TARGET_NUMBER));
                    }
                    if (milStd.getModifier(Modifiers.Y_LOCATION) != null) {
                        tg.set_Location(milStd.getModifier(Modifiers.Y_LOCATION));
                    }
                    if (milStd.getModifier(Modifiers.N_HOSTILE) != null) {
                        tg.set_N(milStd.getModifier(Modifiers.N_HOSTILE));
                    }
                    tg.set_UseDashArray(milStd.getUseDashArray());
                    tg.set_UseHatchFill(milStd.getUseFillPattern());
                    //tg.set_UsePatternFill(milStd.getUseFillPattern());
                    tg.set_HideOptionalLabels(milStd.getHideOptionalLabels());
                    let isClosedArea: boolean = clsUtilityJTR.isClosedPolygon(lineType);

                    if (lineType === TacticalLines.STRIKWARN) {
                        let poly1Pixels: Array<POINT2> = tg.Pixels.slice(0, tg.Pixels.length / 2);
                        let poly1LatLons: Array<POINT2> = tg.LatLongs.slice(0, tg.LatLongs.length / 2);
                        let poly2Pixels: Array<POINT2> = tg.Pixels.slice(tg.Pixels.length / 2, tg.Pixels.length);
                        let poly2LatLons: Array<POINT2> = tg.LatLongs.slice(tg.LatLongs.length / 2, tg.LatLongs.length);

                        clsUtilityJTR.ClosePolygon(poly1Pixels);
                        clsUtilityJTR.ClosePolygon(poly1LatLons);
                        tg.Pixels = poly1Pixels;
                        tg.LatLongs = poly1LatLons;

                        clsUtilityJTR.ClosePolygon(poly2Pixels);
                        clsUtilityJTR.ClosePolygon(poly2LatLons);
                        tg.Pixels.push(...poly2Pixels);
                        tg.LatLongs.push(...poly2LatLons);
                    }
                    else {
                        if (isClosedArea) {
                            clsUtilityJTR.ClosePolygon(tg.Pixels);
                            clsUtilityJTR.ClosePolygon(tg.LatLongs);
                        }
                    }


                    //implement meters to feet for altitude labels
                    let altitudeLabel: string = milStd.getAltitudeMode();
                    if (altitudeLabel == null || altitudeLabel.length === 0) {
                        altitudeLabel = "AMSL";
                    }
                    let altitudeUnit: DistanceUnit = milStd.getAltitudeUnit();
                    if (altitudeUnit == null) {
                        altitudeUnit = DistanceUnit.FEET;
                    }
                    let distanceUnit: DistanceUnit = milStd.getDistanceUnit();
                    if (distanceUnit == null) {
                        distanceUnit = DistanceUnit.METERS;
                    }

                    let strXAlt: string = "";
                    //construct the H1 and H2 modifiers for sector from the mss AM, AN, and X arraylists
                    if (lineType === TacticalLines.RANGE_FAN_SECTOR) {
                        let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                        let AN: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AN_AZIMUTH);
                        let X: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH);
                        if (AM != null) {
                            let strAM: string = "";
                            for (let j: int = 0; j < AM.length; j++) {
                                strAM += AM[j].toString();
                                if (j < AM.length - 1) {
                                    strAM += ",";
                                }
                            }
                            tg.set_AM(strAM);
                        }
                        if (AN != null) {
                            let strAN: string = "";
                            for (let j: int = 0; j < AN.length; j++) {
                                strAN += AN[j];
                                if (j < AN.length - 1) {
                                    strAN += ",";
                                }
                            }
                            tg.set_AN(strAN);
                        }
                        if (X != null) {
                            let strX: string = "";
                            for (let j: int = 0; j < X.length; j++) {
                                strXAlt = clsRenderer.createAltitudeLabel(X[j], altitudeUnit, altitudeLabel);
                                strX += strXAlt;

                                if (j < X.length - 1) {
                                    strX += ",";
                                }
                            }
                            tg.set_X(strX);
                        }
                        if (AM != null && AN != null) {
                            let numSectors: int = AN.length / 2;
                            let left: double = 0;
                            let right: double = 0;
                            let min: double = 0;
                            let max: double = 0;
                            //construct left,right,min,max from the arraylists
                            let strLeftRightMinMax: string = "";
                            for (let j: int = 0; j < numSectors; j++) {
                                left = AN[2 * j];
                                right = AN[2 * j + 1];
                                if (j + 1 === AM.length) {
                                    break;
                                }
                                min = AM[j];
                                max = AM[j + 1];
                                strLeftRightMinMax += left.toString() + "," + right.toString() + "," + min.toString() + "," + max.toString();
                                if (j < numSectors - 1) {
                                    strLeftRightMinMax += ",";
                                }

                            }
                            let len: int = strLeftRightMinMax.length;
                            let c: string = strLeftRightMinMax.substring(len - 1, len);
                            if (c === ",") {
                                strLeftRightMinMax = strLeftRightMinMax.substring(0, len - 1);
                            }
                            tg.set_LRMM(strLeftRightMinMax);
                        }
                    } else {
                        if (lineType === TacticalLines.RADAR_SEARCH) {
                            let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                            let AN: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AN_AZIMUTH);
                            if (AM != null) {
                                let strAM: string = "";
                                for (let j: int = 0; j < AM.length && j < 2; j++) {
                                    strAM += AM[j].toString();
                                    if (j < AM.length - 1) {
                                        strAM += ",";
                                    }
                                }
                                tg.set_AM(strAM);
                            }
                            if (AN != null) {
                                let strAN: string = "";
                                for (let j: int = 0; j < AN.length && j < 2; j++) {
                                    strAN += AN[j];
                                    if (j < AN.length - 1) {
                                        strAN += ",";
                                    }
                                }
                                tg.set_AN(strAN);
                            }
                            if (AM != null && AN != null) {
                                let left: double = 0;
                                let right: double = 0;
                                let min: double = 0;
                                let max: double = 0;
                                //construct left,right,min,max from the arraylists
                                let strLeftRightMinMax: string = "";
                                left = AN[0];
                                right = AN[1];
                                min = AM[0];
                                max = AM[1];
                                strLeftRightMinMax += left.toString() + "," + right.toString() + "," + min.toString() + "," + max.toString();
                                tg.set_LRMM(strLeftRightMinMax);
                            }
                        }
                    }

                    let j: int = 0;
                    if (lineType === TacticalLines.LAUNCH_AREA || lineType === TacticalLines.DEFENDED_AREA_CIRCULAR || lineType === TacticalLines.SHIP_AOI_CIRCULAR) //geo ellipse
                    {
                        let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                        let AN: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AN_AZIMUTH);
                        if (AM != null && AM.length > 1) {
                            let strAM: string = AM[0].toString(); // major axis
                            tg.set_AM(strAM);
                            let strAM1: string = AM[1].toString(); // minor axis
                            tg.set_AM1(strAM1);
                        }
                        if (AN != null && AN.length > 0) {
                            let strAN: string = AN[0].toString(); // rotation
                            tg.set_AN(strAN);
                        }
                    }
                    switch (lineType) {
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
                        case TacticalLines.ACA:
                        case TacticalLines.ACA_RECTANGULAR:
                        case TacticalLines.ACA_CIRCULAR: {
                            let X: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH);
                            if (X != null && X.length > 0) {
                                strXAlt = clsRenderer.createAltitudeLabel(X[0], altitudeUnit, altitudeLabel);
                                tg.set_X(strXAlt);
                            }
                            if (X != null && X.length > 1) {
                                strXAlt = clsRenderer.createAltitudeLabel(X[1], altitudeUnit, altitudeLabel);
                                tg.set_X1(strXAlt);
                            }
                            break;
                        }

                        case TacticalLines.SC:
                        case TacticalLines.MRR:
                        case TacticalLines.SL:
                        case TacticalLines.TC:
                        case TacticalLines.LLTR:
                        case TacticalLines.AC:
                        case TacticalLines.SAAFR: {
                            let pt: POINT2 = tg.LatLongs[0];
                            let pt2d0: Point2D = new Point2D(pt.x, pt.y);
                            let pt2d0Pixels: Point2D = converter.GeoToPixels(pt2d0);
                            let pt0Pixels: POINT2 = new POINT2(pt2d0Pixels.getX(), pt2d0Pixels.getY());

                            //get some point 10000 meters away from pt
                            //10000 should work for any scale                    
                            let dist: double = 10000;
                            let pt2: POINT2 = mdlGeodesic.geodesic_coordinate(pt, dist, 0);
                            let pt2d1: Point2D = new Point2D(pt2.x, pt2.y);
                            let pt2d1Pixels: Point2D = converter.GeoToPixels(pt2d1);
                            let pt1Pixels: POINT2 = new POINT2(pt2d1Pixels.getX(), pt2d1Pixels.getY());
                            //calculate pixels per meter
                            let distPixels: double = lineutility.CalcDistanceDouble(pt0Pixels, pt1Pixels);
                            let pixelsPerMeter: double = distPixels / dist;

                            let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                            if (AM != null) {
                                let strAM: string = "";
                                for (j = 0; j < AM.length; j++) {
                                    strAM += AM[j].toString();
                                    if (j < AM.length - 1) {
                                        strAM += ",";
                                    }
                                }
                                tg.set_AM(strAM);
                            }
                            let strRadii: string[];
                            //get the widest value
                            //the current requirement is to use the greatest width as the default width
                            let maxWidth: double = 0;
                            let
                                temp: double = 0;
                            let maxWidthMeters: double = 0;
                            if (tg.get_AM() != null && tg.get_AM().length > 0) {
                                strRadii = tg.get_AM().split(",");
                                if (strRadii.length > 0) {
                                    for (j = 0; j < strRadii.length; j++) {
                                        if (!Number.isNaN(parseFloat(strRadii[j]))) {
                                            temp = parseFloat(strRadii[j]);
                                            if (temp > maxWidth) {
                                                maxWidth = temp;
                                            }
                                        }
                                    }
                                    maxWidthMeters = maxWidth;
                                    maxWidth *= pixelsPerMeter / 2;

                                    for (j = 0; j < tg.Pixels.length; j++) {
                                        if (strRadii.length > j) {
                                            if (!Number.isNaN(parseFloat(strRadii[j]))) {
                                                let pixels: double = parseFloat(strRadii[j]) * pixelsPerMeter / 2;
                                                tg.Pixels[j].style = pixels as int;
                                                tg.LatLongs[j].style = pixels as int;
                                            } else {
                                                tg.Pixels[j].style = maxWidth as int;
                                                tg.LatLongs[j].style = maxWidth as int;
                                            }
                                        } else {
                                            tg.Pixels[j].style = maxWidth as int;
                                            tg.LatLongs[j].style = maxWidth as int;
                                        }
                                    }
                                }
                            }

                            maxWidthMeters *= distanceUnit.conversionFactor;
                            maxWidthMeters *= 10.0;
                            maxWidthMeters = Math.round(maxWidthMeters);
                            let tempWidth: int = maxWidthMeters as int;
                            maxWidthMeters = tempWidth / 10.0;

                            tg.set_AM(maxWidthMeters.toString() + " " + distanceUnit.label);
                            //use X, X1 to set tg.H, tg.H1
                            let X = milStd.getModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH);
                            if (X != null && X.length > 0) {
                                strXAlt = clsRenderer.createAltitudeLabel(X[0], altitudeUnit, altitudeLabel);
                                tg.set_X(strXAlt);
                            }
                            if (X != null && X.length > 1) {
                                strXAlt = clsRenderer.createAltitudeLabel(X[1], altitudeUnit, altitudeLabel);
                                tg.set_X1(strXAlt);
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    //circular range fans
                    if (lineType === TacticalLines.RANGE_FAN) {
                        let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                        let X: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH);
                        let strAM: string = "";
                        let strX: string = "";
                        if (AM != null) {
                            // Range fan circular has a maximum of 3 circles
                            for (j = 0; j < AM.length && j < 3; j++) {
                                strAM += AM[j].toString();
                                if (j < AM.length - 1) {
                                    strAM += ",";
                                }

                                if (X != null && j < X.length) {
                                    strXAlt = clsRenderer.createAltitudeLabel(X[j], altitudeUnit, altitudeLabel);
                                    strX += strXAlt;
                                    if (j < X.length - 1) {
                                        strX += ",";
                                    }
                                }
                            }
                        }
                        tg.set_AM(strAM);
                        tg.set_X(strX);
                    }
                    switch (lineType) {
                        case TacticalLines.PAA_RECTANGULAR:
                        case TacticalLines.RECTANGULAR_TARGET:
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
                        case TacticalLines.CIRCULAR:
                        case TacticalLines.BDZ:
                        case TacticalLines.FSA_CIRCULAR:
                        case TacticalLines.NOTACK:
                        case TacticalLines.ACA_CIRCULAR:
                        case TacticalLines.FFA_CIRCULAR:
                        case TacticalLines.NFA_CIRCULAR:
                        case TacticalLines.RFA_CIRCULAR:
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
                        case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                        case TacticalLines.KILLBOXPURPLE_RECTANGULAR: {
                            let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                            if (AM != null && AM.length > 0) {
                                let strAM: string = AM[0].toString();
                                //set width for rectangles or radius for circles
                                tg.set_AM(strAM);
                            }
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                    if (lineType === TacticalLines.RECTANGULAR || lineType === TacticalLines.CUED_ACQUISITION) {
                        let AM: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                        let AN: Array<number> = milStd.getModifiers_AM_AN_X(Modifiers.AN_AZIMUTH);
                        if (AN == null) {
                            AN = new Array();
                        }
                        if (AN.length === 0) {
                            AN.push(0);
                        }

                        if (AM != null && AM.length > 1) {
                            let strAM: string = AM[0].toString();    //width
                            let strAM1: string = AM[1].toString();     //length
                            //set width and length in meters for rectangular target
                            tg.set_AM(strAM);
                            tg.set_AM1(strAM1);
                            //set attitude in degrees
                            let strAN: string = AN[0].toString();
                            tg.set_AN(strAN);
                        }
                        /*
                        if(AM.length>2)
                        {
                            String strH1 = Double.toString(AM[2]);     //buffer size
                            tg.set_H1(strH1);
                        }
                         */
                    }
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException("clsRenderer", "createTGLightfromMilStdSymbol",
                            new RendererException("Failed to build multipoint TG for " + milStd.getSymbolID(), exc));
                    } else {
                        throw exc;
                    }
                }
                return tg;


                break;
            }

            case 3: {
                const [milStd, converter, computeChannelPt] = args as [MilStdSymbol, IPointConversion, boolean];


                let tg: TGLight = new TGLight();
                try {
                    let symbolId: string = milStd.getSymbolID();
                    tg.set_SymbolId(symbolId);
                    let status: string = tg.get_Status();
                    if (status != null && status === "A") {
                        //lineStyle=GraphicProperties.LINE_TYPE_DASHED;
                        tg.set_LineStyle(1);
                    }
                    tg.set_VisibleModifiers(true);
                    //set tg latlongs and pixels
                    clsRenderer.setClientCoords(milStd, tg);
                    //build tg.Pixels
                    tg.Pixels = clsUtility.LatLongToPixels(tg.LatLongs, converter);
                    tg.set_Font(new Font("Arial", Font.PLAIN, 12));
                    tg.set_FillColor(milStd.getFillColor());
                    tg.set_LineColor(milStd.getLineColor());
                    tg.set_LineThickness(milStd.getLineWidth());
                    tg.set_TexturePaint(milStd.getFillStyle());
                    tg.set_FontBackColor(Color.WHITE);
                    tg.set_TextColor(milStd.getTextColor());

                    //            tg.set_DTG(milStd.getModifier(Modifiers.W_DTG_1));
                    //            tg.set_DTG1(milStd.getModifier(Modifiers.W1_DTG_2));
                    //            tg.set_H(milStd.getModifier(Modifiers.H_ADDITIONAL_INFO_1));
                    //            tg.set_H1(milStd.getModifier(Modifiers.H1_ADDITIONAL_INFO_2));
                    //            tg.set_H2(milStd.getModifier(Modifiers.H2_ADDITIONAL_INFO_3));
                    //            tg.set_Name(milStd.getModifier(Modifiers.T_UNIQUE_DESIGNATION_1));
                    //            tg.set_T1(milStd.getModifier(Modifiers.T1_UNIQUE_DESIGNATION_2));
                    //            tg.set_Location(milStd.getModifier(Modifiers.Y_LOCATION));
                    //            tg.set_N(Modifiers.N_HOSTILE);
                    if (milStd.getModifier(Modifiers.W_DTG_1) != null) {
                        tg.set_DTG(milStd.getModifier(Modifiers.W_DTG_1));
                    }
                    if (milStd.getModifier(Modifiers.W1_DTG_2) != null) {
                        tg.set_DTG1(milStd.getModifier(Modifiers.W1_DTG_2));
                    }
                    if (milStd.getModifier(Modifiers.H_ADDITIONAL_INFO_1) != null) {
                        tg.set_H(milStd.getModifier(Modifiers.H_ADDITIONAL_INFO_1));
                    }
                    if (milStd.getModifier(Modifiers.H1_ADDITIONAL_INFO_2) != null) {
                        tg.set_H1(milStd.getModifier(Modifiers.H1_ADDITIONAL_INFO_2));
                    }
                    if (milStd.getModifier(Modifiers.H2_ADDITIONAL_INFO_3) != null) {
                        tg.set_H2(milStd.getModifier(Modifiers.H2_ADDITIONAL_INFO_3));
                    }
                    if (milStd.getModifier(Modifiers.T_UNIQUE_DESIGNATION_1) != null) {
                        tg.set_Name(milStd.getModifier(Modifiers.T_UNIQUE_DESIGNATION_1));
                    }
                    if (milStd.getModifier(Modifiers.T1_UNIQUE_DESIGNATION_2) != null) {
                        tg.set_T1(milStd.getModifier(Modifiers.T1_UNIQUE_DESIGNATION_2));
                    }
                    if (milStd.getModifier(Modifiers.V_EQUIP_TYPE) != null) {
                        tg.set_V(milStd.getModifier(Modifiers.V_EQUIP_TYPE));
                    }
                    if (milStd.getModifier(Modifiers.AS_COUNTRY) != null) {
                        tg.set_AS(milStd.getModifier(Modifiers.AS_COUNTRY));
                    }
                    if (milStd.getModifier(Modifiers.AP_TARGET_NUMBER) != null) {
                        tg.set_AP(milStd.getModifier(Modifiers.AP_TARGET_NUMBER));
                    }
                    if (milStd.getModifier(Modifiers.Y_LOCATION) != null) {
                        tg.set_Location(milStd.getModifier(Modifiers.Y_LOCATION));
                    }
                    if (milStd.getModifier(Modifiers.N_HOSTILE) != null) {
                        tg.set_N(milStd.getModifier(Modifiers.N_HOSTILE));
                    }

                    //int lineType=CELineArray.CGetLinetypeFromString(tg.get_SymbolId());
                    let lineType: int = clsUtilityJTR.GetLinetypeFromString(symbolId);
                    let isClosedArea: boolean = clsUtilityJTR.isClosedPolygon(lineType);

                    if (isClosedArea) {
                        clsUtilityJTR.ClosePolygon(tg.Pixels);
                        clsUtilityJTR.ClosePolygon(tg.LatLongs);
                    }

                    //these channels need a channel point added
                    if (computeChannelPt) {
                        switch (lineType) {
                            case TacticalLines.CATK:
                            case TacticalLines.CATKBYFIRE:
                            case TacticalLines.AAAAA:
                            case TacticalLines.AIRAOA:
                            case TacticalLines.MAIN:
                            case TacticalLines.SPT: {
                                let ptPixels: POINT2 = clsUtilityJTR.ComputeLastPoint(tg.Pixels);
                                tg.Pixels.push(ptPixels);
                                //Point pt = clsUtility.POINT2ToPoint(ptPixels);
                                let pt: Point2D = new Point2D(ptPixels.x, ptPixels.y);
                                //in case it needs the corresponding geo point
                                let ptGeo2d: Point2D = converter.PixelsToGeo(pt);
                                let ptGeo: POINT2 = clsUtility.Point2DToPOINT2(ptGeo2d);
                                tg.LatLongs.push(ptGeo);
                                //}
                                break;
                            }

                            default: {
                                break;
                            }

                        }
                    }
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException("clsRenderer", "createTGLightfromMilStdSymbol",
                            new RendererException("Failed to build multipoint TG for " + milStd.getSymbolID(), exc));
                    } else {
                        throw exc;
                    }
                }
                return tg;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    private static createAltitudeLabel(distance: double, altitudeUnit: DistanceUnit, altitudeLabel: string): string {
        let conversionFactor: double = 0;

        // if using "FL" (Flight Level) for altitudeLabel, override conversion factor to avoid potential user error with altitudeUnit
        if (altitudeLabel === "FL") {
            conversionFactor = DistanceUnit.FLIGHT_LEVEL.conversionFactor;
        } else {
            conversionFactor = altitudeUnit.conversionFactor;
        }

        // Truncate the result
        let result: double = distance * conversionFactor;
        result *= 10.0;
        result = Math.round(result);
        let tempResult: int = result as int;
        let truncatedResult: int = tempResult / 10;
        // MIL-STD-2525D says altitude/depth must be an integer

        // Simplifies labels of "0 units AGL" to "GL" (Ground Level) and "0 units AMSL/BMSL" to "MSL" (Mean Sea Level)
        // as permitted by MIL-STD-2525D 5.3.7.5.1.
        // Also works for "0 units GL" and "0 units MSL", which are improperly labeled but can be understood to mean the same thing.
        if (truncatedResult === 0) {
            if (altitudeLabel === "AGL" || altitudeLabel === "GL") {
                return "GL";
            }
            if (altitudeLabel === "AMSL" || altitudeLabel === "BMSL" || altitudeLabel === "MSL") {
                return "MSL";
            }
        }

        // Flight level is a special altitude displayed as "FL ###" where ### are 3 digits representing hundreds of feet.
        if (altitudeLabel === "FL") {
            return "FL " + String(truncatedResult).padStart(3, '0');
        }

        return truncatedResult + " " + altitudeUnit.label + " " + altitudeLabel;
    }

    private static Shape2ToShapeInfo(shapeInfos: Array<ShapeInfo>, shapes: Array<Shape2>): void {
        try {
            let j: int = 0;
            let shape: Shape2;
            if (shapes == null || shapeInfos == null || shapes.length === 0) {
                return;
            }

            for (j = 0; j < shapes.length; j++) 
            {
                shape = shapes[j];
                if(shape != null && shape !== undefined)
                    shapeInfos.push(shape as ShapeInfo);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsRenderer", "Shape2ToShapeInfo",
                    new RendererException("Failed to build ShapeInfo ArrayList", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Added function to handle when coords or display area spans IDL but not
     * both, it prevents the symbol from rendering if the bounding rectangles
     * don't intersect.
     *
     * @param tg
     * @param converter
     * @param clipArea
     * @return
     */
    public static intersectsClipArea(tg: TGLight, converter: IPointConversion, clipArea: Point2D[] | Rectangle | Rectangle2D): boolean {
        let result: boolean = false;
        try {
            if (clipArea == null || tg.LatLongs.length < 2) {
                return true;
            }

            let clipBounds: Rectangle2D = null;
            let clipPoints: Array<Point2D> = null;

            //            if (clipArea != null) {
            //                if (clipArea.getClass().isAssignableFrom(Rectangle2D.class)) {
            //                    clipBounds = (Rectangle2D) clipArea;
            //                } else if (clipArea.getClass().isAssignableFrom(Rectangle.class)) {
            //                    clipBounds = (Rectangle2D) clipArea;
            //                } else if (clipArea.getClass().isAssignableFrom(ArrayList.class)) {
            //                    clipPoints = (ArrayList<Point2D>) clipArea;
            //                }
            //            }
            if (clipArea != null) {
                if (clipArea instanceof Rectangle2D) {
                    clipBounds = clipArea as Rectangle2D;
                } else {
                    if (clipArea instanceof Rectangle) {
                        let rectx: Rectangle = clipArea as Rectangle;
                        clipBounds = new Rectangle2D(rectx.x, rectx.y, rectx.width, rectx.height);
                    } else {
                        if (clipArea instanceof Array) {
                            clipPoints = clipArea as Array<Point2D>;
                            //double x0=clipPoints[0].getX(),y0=clipPoints[0].getY();
                            //double w=clipPoints[1].getX()-x0,h=clipPoints[3].getY()-y0;
                            //clipBounds = new Rectangle2D(x0, y0, w, h);
                            clipBounds = clsUtility.getMBR(clipPoints);
                        }
                    }

                }

            }
            //assumes we are using clipBounds
            let j: int = 0;
            let x: double = clipBounds.getMinX();
            let y: double = clipBounds.getMinY();
            let width: double = clipBounds.getWidth();
            let height: double = clipBounds.getHeight();
            let tl: POINT2 = new POINT2(x, y);
            let br: POINT2 = new POINT2(x + width, y + height);
            tl = clsUtility.PointPixelsToLatLong(tl, converter);
            br = clsUtility.PointPixelsToLatLong(br, converter);
            //the latitude range
            //boolean ptInside = false, ptAbove = false, ptBelow = false;
            let coordsLeft: double = tg.LatLongs[0].x;
            let coordsRight: double = coordsLeft;
            let coordsTop: double = tg.LatLongs[0].y;
            let coordsBottom: double = coordsTop;
            let intersects: boolean = false;
            let minx: double = tg.LatLongs[0].x;
            let maxx: double = minx;
            let maxNegX: double = 0;
            for (j = 0; j < tg.LatLongs.length; j++) {
                let pt: POINT2 = tg.LatLongs[j];
                if (pt.x < minx) {

                    minx = pt.x;
                }

                if (pt.x > maxx) {

                    maxx = pt.x;
                }

                if (maxNegX === 0 && pt.x < 0) {

                    maxNegX = pt.x;
                }

                if (maxNegX < 0 && pt.x < 0 && pt.x > maxNegX) {

                    maxNegX = pt.x;
                }

                if (pt.y < coordsBottom) {

                    coordsBottom = pt.y;
                }

                if (pt.y > coordsTop) {

                    coordsTop = pt.y;
                }

            }
            let coordSpanIDL: boolean = false;
            if (maxx === 180 || minx === -180) {

                coordSpanIDL = true;
            }

            if (maxx - minx >= 180) {
                coordSpanIDL = true;
                coordsLeft = maxx;
                coordsRight = maxNegX;
            } else {
                coordsLeft = minx;
                coordsRight = maxx;
            }
            //if(canClipPoints)
            //{                
            if (br.y <= coordsBottom && coordsBottom <= tl.y) {
                intersects = true;
            } else if (coordsBottom <= br.y && br.y <= coordsTop) {
                intersects = true;
            }
            else {
                return false;
            }

            //}
            //if it gets this far then the latitude ranges intersect
            //re-initialize intersects for the longitude ranges
            intersects = false;
            //the longitude range
            //the min and max coords longitude
            let boxSpanIDL: boolean = false;
            //boolean coordSpanIDL = false;
            if (tl.x === 180 || tl.x === -180 || br.x === 180 || br.x === -180) {

                boxSpanIDL = true;
            } else if (Math.abs(br.x - tl.x) > 180) {
                boxSpanIDL = true;
            }


            //            if (coordsRight - coordsLeft > 180)
            //            {
            //                double temp = coordsLeft;
            //                coordsLeft = coordsRight;
            //                coordsRight = temp;
            //                coordSpanIDL=true;
            //            }
            //boolean intersects=false;
            if (coordSpanIDL && boxSpanIDL) {
                intersects = true;
            } else if (!coordSpanIDL && !boxSpanIDL)   //was && canclipPoints
            {
                if (coordsLeft <= tl.x && tl.x <= coordsRight) {
                    intersects = true;
                }

                if (coordsLeft <= br.x && br.x <= coordsRight) {
                    intersects = true;
                }

                if (tl.x <= coordsLeft && coordsLeft <= br.x) {
                    intersects = true;
                }

                if (tl.x <= coordsRight && coordsRight <= br.x) {
                    intersects = true;
                }
            } else if (!coordSpanIDL && boxSpanIDL)    //box spans IDL and coords do not
            {
                if (tl.x < coordsRight && coordsRight < 180) {
                    intersects = true;
                }

                if (-180 < coordsLeft && coordsLeft < br.x) {
                    intersects = true;
                }

            } else if (coordSpanIDL && !boxSpanIDL)    //coords span IDL and box does not
            {
                if (coordsLeft < br.x && br.x < 180) {
                    intersects = true;
                }

                if (-180 < tl.x && tl.x < coordsRight) {
                    intersects = true;
                }
            }

            return intersects;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsRenderer", "intersectsClipArea",
                    new RendererException("Failed inside intersectsClipArea", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }

    /**
     * Adds Feint, decoy, or dummy indicator to shapes. Does not check if tactical graphic should have indicator
     */
    private static addFDI(tg: TGLight, shapes: Array<Shape2>): void {
        try {
            let msi: MSInfo = MSLookup.getInstance().getMSLInfo(tg.get_SymbolId());
            let drawRule: int = msi != null ? msi.getDrawRule() : -1;
            let lineType: int = tg.get_LineType();

            if (lineType === TacticalLines.MAIN) {
                // Only Axis of Advance with arrowhead in a different location
                let points: Array<POINT2> = shapes[1].getPoints();
                let ptA: POINT2 = new POINT2(points[points.length - 3]);
                let ptB: POINT2 = new POINT2(points[points.length - 8]);
                let ptC: POINT2 = new POINT2(points[points.length - 7]);
                shapes.push(DISMSupport.getFDIShape(tg, ptA, ptB, ptC));
            } else if (drawRule === DrawRules.AXIS1 || drawRule === DrawRules.AXIS2) {
                // Axis of Advance symbols
                let points: Array<POINT2> = shapes[0].getPoints();
                let midPointIndex = Math.trunc(points.length / 2);
                let ptA: POINT2 = new POINT2(points[midPointIndex - 1]);
                let ptB: POINT2 = new POINT2(points[midPointIndex]);
                let ptC: POINT2 = new POINT2(points[midPointIndex + 1]);
                shapes.push(DISMSupport.getFDIShape(tg, ptA, ptB, ptC));
            }
            // Direction of attack symbols
            else if (lineType === TacticalLines.DIRATKAIR) {
                let points: Array<POINT2> = shapes[2].getPoints();
                let ptA: POINT2 = new POINT2(points[0]);
                let ptB: POINT2 = new POINT2(points[1]);
                let ptC: POINT2 = new POINT2(points[2]);
                shapes.push(DISMSupport.getFDIShape(tg, ptA, ptB, ptC));
            } else if (lineType === TacticalLines.DIRATKGND) {
                let points: Array<POINT2> = shapes[1].getPoints();
                let ptA: POINT2 = new POINT2(points[7]);
                let ptB: POINT2 = new POINT2(points[4]);
                let ptC: POINT2 = new POINT2(points[9]);
                shapes.push(DISMSupport.getFDIShape(tg, ptA, ptB, ptC));
            } else if (lineType === TacticalLines.DIRATKSPT) {
                let points: Array<POINT2> = shapes[1].getPoints();
                let ptA: POINT2 = new POINT2(points[0]);
                let ptB: POINT2 = new POINT2(points[1]);
                let ptC: POINT2 = new POINT2(points[2]);
                shapes.push(DISMSupport.getFDIShape(tg, ptA, ptB, ptC));
            } else {
                // Shape has no arrow. Put on top of shape
                let firstPoint: POINT2 = shapes[0].getPoints()[0];
                let ptUl: POINT2 = new POINT2(firstPoint);
                let ptUr: POINT2 = new POINT2(firstPoint);
                let ptLr: POINT2 = new POINT2(firstPoint);
                let ptLl: POINT2 = new POINT2(firstPoint);
                clsUtility.GetMBR(shapes, ptUl, ptUr, ptLr, ptLl);
                shapes.push(DISMSupport.getFDIShape(tg, ptUl, ptUr));
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsRenderer._className, "addFDI", new RendererException("failed inside addFDI", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * GoogleEarth renderer uses polylines for rendering
     *
     * @param mss MilStdSymbol object
     * @param converter the geographic to pixels coordinate converter
     * @param clipArea the clip bounds
     */
    public static renderWithPolylines(mss: MilStdSymbol,
        converter: IPointConversion,
        clipArea: Point2D[] | Rectangle | Rectangle2D): void;

    /**
     * @param mss
     * @param converter
     * @param clipArea
     * @param g2d
     * @deprecated Graphics2D not used
     */
    public static renderWithPolylines(mss: MilStdSymbol,
        converter: IPointConversion,
        clipArea: Point2D[] | Rectangle | Rectangle2D,
        g2d: Graphics2D): void;
    public static renderWithPolylines(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [mss, converter, clipArea] = args as [MilStdSymbol, IPointConversion, Point2D[] | Rectangle | Rectangle2D];


                try {
                    let tg: TGLight = clsRenderer.createTGLightFromMilStdSymbol(mss, converter);
                    let shapeInfos: Array<ShapeInfo> = new Array();
                    let modifierShapeInfos: Array<ShapeInfo> = new Array();
                    if (clsRenderer.intersectsClipArea(tg, converter, clipArea)) {
                        clsRenderer.render_GE(tg, shapeInfos, modifierShapeInfos, converter, clipArea);
                    }
                    mss.setSymbolShapes(shapeInfos);
                    mss.setModifierShapes(modifierShapeInfos);
                    mss.set_WasClipped(tg.get_WasClipped());
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException("clsRenderer", "renderWithPolylines",
                            new RendererException("Failed inside renderWithPolylines", exc));
                    } else {
                        throw exc;
                    }
                }


                break;
            }

            case 4: {
                const [mss, converter, clipArea, g2d] = args as [MilStdSymbol, IPointConversion, Point2D[] | Rectangle | Rectangle2D, Graphics2D];


                try {
                    let tg: TGLight = clsRenderer.createTGLightFromMilStdSymbol(mss, converter);
                    let shapeInfos: Array<ShapeInfo> = new Array();
                    let modifierShapeInfos: Array<ShapeInfo> = new Array();
                    if (clsRenderer.intersectsClipArea(tg, converter, clipArea)) {
                        clsRenderer.render_GE(tg, shapeInfos, modifierShapeInfos, converter, clipArea, g2d);
                    }
                    mss.setSymbolShapes(shapeInfos);
                    mss.setModifierShapes(modifierShapeInfos);
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException("clsRenderer", "renderWithPolylines",
                            new RendererException("Failed inside renderWithPolylines", exc));
                    } else {
                        throw exc;
                    }
                }


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Google Earth renderer: Called by mapfragment-demo This is the public
     * interface for Google Earth renderer assumes tg.Pixels is filled assumes
     * the caller instantiated the ShapeInfo arrays
     *
     * @param tg tactical graphic
     * @param shapeInfos symbol ShapeInfo array
     * @param modifierShapeInfos modifier ShapeInfo array
     * @param converter geographic to pixels coordinate converter
     * @param clipArea clipping bounds in pixels
     */
    public static render_GE(tg: TGLight,
        shapeInfos: Array<ShapeInfo>,
        modifierShapeInfos: Array<ShapeInfo>,
        converter: IPointConversion,
        clipArea: Point2D[] | Rectangle | Rectangle2D): void;

    /**
     * See render_GE below for comments
     *
     * @param tg
     * @param shapeInfos
     * @param modifierShapeInfos
     * @param converter
     * @param clipArea
     * @param g2d test android-gradle
     * @deprecated Graphics2D not used
     */
    public static render_GE(tg: TGLight,
        shapeInfos: Array<ShapeInfo>,
        modifierShapeInfos: Array<ShapeInfo>,
        converter: IPointConversion,
        clipArea: Point2D[] | Rectangle | Rectangle2D,
        g2d: Graphics2D): void;
    public static render_GE(...args: unknown[]): void {
        switch (args.length) {
            case 5: {
                const [tg, shapeInfos, modifierShapeInfos, converter, clipArea] = args as [TGLight, Array<ShapeInfo>, Array<ShapeInfo>, IPointConversion, Point2D[] | Rectangle2D];


                try {
                    clsRenderer.reversePointsRevD(tg);

                    let clipBounds: Rectangle2D = null;
                    CELineArray.setClient("ge");
                    //            ArrayList<POINT2> origPixels = null;
                    //            ArrayList<POINT2> origLatLongs = null;
                    //            if (clsUtilityGE.segmentColorsSet(tg)) {
                    //                origPixels=lineutility.getDeepCopy(tg.Pixels);
                    //                origLatLongs=lineutility.getDeepCopy(tg.LatLongs);
                    //            }
                    let origFillPixels: Array<POINT2> = lineutility.getDeepCopy(tg.Pixels);

                    if (tg.get_LineType() === TacticalLines.LC || tg.get_LineType() === TacticalLines.LC_HOSTILE) {

                        clsUtilityJTR.SegmentLCPoints(tg, converter);
                    }


                    //            boolean shiftLines = Channels.getShiftLines();
                    //            if (shiftLines) {
                    //                String affiliation = tg.get_Affiliation();
                    //                Channels.setAffiliation(affiliation);
                    //            }
                    //CELineArray.setMinLength(2.5);    //2-27-2013
                    let clipPoints: Array<Point2D> = null;
                    if (clipArea != null) {
                        if (clipArea instanceof Rectangle2D) {
                            clipBounds = clipArea as Rectangle2D;
                        } else if (clipArea instanceof Rectangle) {
                            let rectx: Rectangle = clipArea as Rectangle;
                            clipBounds = new Rectangle2D(rectx.x, rectx.y, rectx.width, rectx.height);
                        } else if (clipArea instanceof Array) {
                            clipPoints = clipArea as Array<Point2D>;
                        }
                    }
                    let zoomFactor: double = clsUtilityGE.getZoomFactor(clipBounds, clipPoints, tg.Pixels);
                    //add sub-section to test clipArea if client passes the rectangle
                    /*
                    let useClipPoints: boolean = false;    //currently not used
                    if (useClipPoints === true && clipBounds != null) {
                        let x: double = clipBounds.getMinX();
                        let y: double = clipBounds.getMinY();
                        let width: double = clipBounds.getWidth();
                        let height: double = clipBounds.getHeight();
                        clipPoints = new Array();
                        clipPoints.push(new Point2D(x, y));
                        clipPoints.push(new Point2D(x + width, y));
                        clipPoints.push(new Point2D(x + width, y + height));
                        clipPoints.push(new Point2D(x, y + height));
                        clipPoints.push(new Point2D(x, y));
                        clipBounds = null;
                    }
                    //end section
                    */
                    if (tg.get_Client() == null || tg.get_Client().length === 0) {
                        tg.set_client("ge");
                    }

                    clsUtility.RemoveDuplicatePoints(tg);

                    let linetype: int = tg.get_LineType();
                    if (linetype < 0) {
                        linetype = clsUtilityJTR.GetLinetypeFromString(tg.get_SymbolId());
                        //clsUtilityCPOF.SegmentGeoPoints(tg, converter);
                        tg.set_LineType(linetype);
                    }

                    let isTextFlipped: boolean = false;
                    let shapes: Array<Shape2>;   //use this to collect all the shapes
                    clsUtilityGE.setSplineLinetype(tg);
                    clsRenderer.setHostileLC(tg);

                    clsUtilityCPOF.SegmentGeoPoints(tg, converter, zoomFactor);
                    if (clipBounds != null || clipPoints != null) {
                        if (clsUtilityCPOF.canClipPoints(tg)) {
                            //check assignment
                            if (clipBounds != null) {
                                clsClipPolygon2.ClipPolygon(tg, clipBounds);
                            } else {
                                if (clipPoints != null) {
                                    clsClipQuad.ClipPolygon(tg, clipPoints);
                                }
                            }

                            clsUtilityGE.removeTrailingPoints(tg, clipArea);
                            tg.LatLongs = clsUtility.PixelsToLatLong(tg.Pixels, converter);
                        }
                    }

                    //if MSR segment data set use original pixels unless tg.Pixels is empty from clipping
                    //            if (origPixels != null) {
                    //                if (tg.Pixels.length === 0) {
                    //                    return;
                    //                } else {
                    //                    tg.Pixels = origPixels;
                    //                    tg.LatLongs = origLatLongs;
                    //                    clipArea = null;
                    //                }
                    //            }
                    clsUtilityJTR.InterpolatePixels(tg);

                    tg.modifiers = new Array();
                    let g2d: Graphics2D = new Graphics2D();
                    g2d.setFont(tg.get_Font());
                    Modifier2.AddModifiersGeo(tg, g2d, clipArea, converter);

                    clsUtilityCPOF.FilterPoints2(tg, converter);
                    clsUtilityJTR.FilterVerticalSegments(tg);
                    clsUtility.FilterAXADPoints(tg, converter);
                    clsUtilityCPOF.ClearPixelsStyle(tg);

                    let linesWithFillShapes: Array<Shape2> = null;

                    let savePixels: Array<POINT2> = tg.Pixels;
                    tg.Pixels = origFillPixels;

                    //check assignment
                    if (clipBounds != null) {
                        linesWithFillShapes = clsClipPolygon2.LinesWithFill(tg, clipBounds);
                    } else if (clipPoints != null) {
                        linesWithFillShapes = clsClipQuad.LinesWithFill(tg, clipPoints);
                    } else if (clipArea == null) {
                        linesWithFillShapes = clsClipPolygon2.LinesWithFill(tg, null);
                    }

                    tg.Pixels = savePixels;

                    let rangeFanFillShapes: Array<Shape2>;
                    //do not fill the original shapes for circular range fans
                    let savefillStyle: int = tg.get_FillStyle();
                    if (linetype === TacticalLines.RANGE_FAN) {
                        tg.set_Fillstyle(0);
                    }

                    //check assignment (pass which clip object is not null)
                    if (clipBounds != null) {
                        shapes = clsRenderer2.GetLineArray(tg, converter, isTextFlipped, clipBounds); //takes clip object           
                    } else if (clipPoints != null) {
                        shapes = clsRenderer2.GetLineArray(tg, converter, isTextFlipped, clipPoints);
                    } else if (clipArea == null) {
                        shapes = clsRenderer2.GetLineArray(tg, converter, isTextFlipped, null);
                    }

                    // Add Feint, decoy, or dummy indicator
                    if (shapes != null
                        && SymbolID.getSymbolSet(tg.get_SymbolId()) === SymbolID.SymbolSet_ControlMeasure
                        && SymbolUtilities.hasFDI(tg.get_SymbolId())) {
                        clsRenderer.addFDI(tg, shapes);
                    }

                    switch (linetype) {
                        case TacticalLines.RANGE_FAN:
                        case TacticalLines.RANGE_FAN_SECTOR:
                        case TacticalLines.RADAR_SEARCH: {
                            if (tg.get_FillColor() == null || tg.get_FillColor().getAlpha() < 2) {
                                break;
                            }
                            let tg1: TGLight = clsUtilityCPOF.GetCircularRangeFanFillTG(tg);
                            tg1.set_Fillstyle(savefillStyle);
                            tg1.set_SymbolId(tg.get_SymbolId());
                            //check assignment (pass which clip object is not null)
                            if (clipBounds != null) {
                                rangeFanFillShapes = clsRenderer2.GetLineArray(tg1, converter, isTextFlipped, clipBounds);
                            } else {
                                if (clipPoints != null) {
                                    rangeFanFillShapes = clsRenderer2.GetLineArray(tg1, converter, isTextFlipped, clipPoints);
                                } else {
                                    if (clipArea == null) {
                                        rangeFanFillShapes = clsRenderer2.GetLineArray(tg1, converter, isTextFlipped, null);
                                    }
                                }

                            }


                            if (rangeFanFillShapes != null) {
                                if (shapes == null) {
                                    console.log("shapes is null");
                                    break;
                                } else {
                                    shapes.splice(0, 0, ...rangeFanFillShapes);
                                }

                            }
                            break;
                        }

                        default: {
                            clsRenderer2.getAutoshapeFillShape(tg, shapes);
                            break;
                        }

                    }
                    //end section

                    //undo any fillcolor for lines with fill
                    clsUtilityCPOF.LinesWithSeparateFill(tg.get_LineType(), shapes);
                    clsClipPolygon2.addAbatisFill(tg, shapes);

                    //if this line is commented then the extra line in testbed goes away
                    if (shapes != null && linesWithFillShapes != null && linesWithFillShapes.length > 0) {
                        shapes.splice(0, 0, ...linesWithFillShapes);
                    }

                    if (clsUtilityCPOF.canClipPoints(tg) === false && clipBounds != null) {
                        shapes = clsUtilityCPOF.postClipShapes(tg, shapes, clipBounds);
                    } else {
                        if (clsUtilityCPOF.canClipPoints(tg) === false && clipPoints != null) {
                            shapes = clsUtilityCPOF.postClipShapes(tg, shapes, clipPoints);
                        }
                    }

                    //returns early if textSpecs are null
                    //currently the client is ignoring these
                    if (modifierShapeInfos != null) {
                        let textSpecs: Array<Shape2> = new Array();
                        Modifier2.DisplayModifiers2(tg, g2d, textSpecs, isTextFlipped, converter);
                        clsRenderer.Shape2ToShapeInfo(modifierShapeInfos, textSpecs);
                    }
                    clsRenderer.Shape2ToShapeInfo(shapeInfos, shapes);
                    clsUtility.addHatchFills(tg, shapeInfos);

                    //check assignment (pass which clip object is not null)
                    if (clipBounds != null) {
                        clsUtilityGE.SetShapeInfosPolylines(tg, shapeInfos, clipBounds);//takes a clip object            
                    } else {
                        if (clipPoints != null) {
                            clsUtilityGE.SetShapeInfosPolylines(tg, shapeInfos, clipPoints);
                        } else {
                            if (clipArea == null) {
                                clsUtilityGE.SetShapeInfosPolylines(tg, shapeInfos, null);
                            }
                        }

                    }

                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(clsRenderer._className, "render_GE",
                            new RendererException("Failed inside render_GE", exc));

                    } else {
                        throw exc;
                    }
                }


                break;
            }

            case 6: {
                const [tg, shapeInfos, modifierShapeInfos, converter, clipArea, g2d] = args as [TGLight, Array<ShapeInfo>, Array<ShapeInfo>, IPointConversion, Point2D[] | Rectangle | Rectangle2D, Graphics2D];

                clsRenderer.render_GE(tg, shapeInfos, modifierShapeInfos, converter, clipArea);


                break;

            }
            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    /**
     * creates a shape for known symbols. The intent is to use client points for
     * the shape and is intended for use with ellipse. If hatch &gt; 1 it creates 2 shapes
     * one for the hatch pattern, the second one is for the outline.
     *
     * @param milStd
     * @param ipc
     * @param clipArea
     * @param shapeType
     * @param lineColor
     * @param fillColor
     * @param hatch
     */
    public static render_Shape(milStd: MilStdSymbol,
        ipc: IPointConversion,
        clipArea: Point2D[] | Rectangle | Rectangle2D = null,
        shapeType: int,
        lineColor: Color = null,
        fillColor: Color = null,
        hatch: int): void {
        try {
            let clipBounds: Rectangle2D = null;
            //CELineArray.setClient("ge");
            let clipPoints: Array<Point2D> = null;

            if (clipArea != null) {
                if (clipArea instanceof Rectangle2D) {
                    clipBounds = clipArea as Rectangle2D;
                } else if (clipArea instanceof Rectangle) {
                    clipBounds = new Rectangle2D(clipArea.x, clipArea.y, clipArea.width, clipArea.height); // clipArea as Rectangle2D;
                } else if (clipArea instanceof Array) {
                    clipPoints = clipArea as Array<Point2D>;
                }

            }

            //can't use following line because it resets the pixels
            //TGLight tg = createTGLightFromMilStdSymbol(milStd, ipc);
            let tg: TGLight = new TGLight();
            tg.set_SymbolId(milStd.getSymbolID());
            //tg.set_VisibleModifiers(true);
            //set tg latlongs and pixels
            clsRenderer.setClientCoords(milStd, tg);
            //build tg.Pixels
            tg.Pixels = clsUtility.LatLongToPixels(tg.LatLongs, ipc);

            //int fillStyle = milStd.getPatternFillType();
            let shape: Shape2 = new Shape2(shapeType);
            shape.setFillColor(fillColor);
            if (lineColor != null) {
                shape.setLineColor(lineColor);
                shape.setStroke(new BasicStroke(milStd.getLineWidth()));
            }
            //the client has already set the coordinates for the shape
            let pt: POINT2;
            for (let j: int = 0; j < tg.Pixels.length; j++) {
                pt = tg.Pixels[j];
                if (j === 0) {
                    shape.moveTo(pt);
                } else {
                    shape.lineTo(pt);
                }
            }

            //post clip the shape and set the polylines
            let shapes: Array<Shape2> = new Array();
            shapes.push(shape);
            //post-clip the shape
            if (clsUtilityCPOF.canClipPoints(tg) === false && clipBounds != null) {
                shapes = clsUtilityCPOF.postClipShapes(tg, shapes, clipBounds);
            } else {
                if (clsUtilityCPOF.canClipPoints(tg) === false && clipPoints != null) {
                    shapes = clsUtilityCPOF.postClipShapes(tg, shapes, clipPoints);
                }
            }

            shape = shapes[0];
            if (hatch > 1) {
                shape = clsUtility.buildHatchArea(tg, shape, hatch, 20);
                shape.setLineColor(lineColor);
                shape.setStroke(new BasicStroke(1));
                //shapes.clear();
                shapes.push(shape);
            }
            let shapeInfos: Array<ShapeInfo> = new Array();
            clsRenderer.Shape2ToShapeInfo(shapeInfos, shapes);
            //set the shapeInfo polylines
            if (clipBounds != null) {
                clsUtilityGE.SetShapeInfosPolylines(tg, shapeInfos, clipBounds);
            } else {
                if (clipPoints != null) {
                    clsUtilityGE.SetShapeInfosPolylines(tg, shapeInfos, clipPoints);
                } else {
                    if (clipArea == null) {
                        clsUtilityGE.SetShapeInfosPolylines(tg, shapeInfos, null);
                    }
                }

            }

            //set milStd symbol shapes
            if (milStd.getSymbolShapes() == null) {
                milStd.setSymbolShapes(shapeInfos);
            } else {
                milStd.getSymbolShapes().push(...shapeInfos);
            }
            return;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsRenderer._className, "render_Shape",
                    new RendererException("Failed inside render_Shape", exc));

            } else {
                throw exc;
            }
        }
    }
    /**
     * to follow right hand rule for LC when affiliation is hostile. also fixes
     * MSDZ point order and maybe various other wayward symbols
     *
     * @param tg
     */
    private static setHostileLC(tg: TGLight): void {
        try {
            let usas1314: boolean = true;
            let pts: Array<POINT2> = new Array();
            let j: int = 0;
            switch (tg.get_LineType()) {
                case TacticalLines.LC: {
                    //    if (usas1314 === false) {
                    //       break;
                    //   }
                    if (!tg.isHostile()) {
                        break;
                    }
                    pts = [...tg.Pixels];
                    for (j = 0; j < tg.Pixels.length; j++) {
                        tg.Pixels[j] = pts[pts.length - j - 1];
                    }
                    //reverse the latlongs also
                    pts = [...tg.LatLongs];
                    for (j = 0; j < tg.LatLongs.length; j++) {
                        tg.LatLongs[j] = pts[pts.length - j - 1];
                    }
                    break;
                }

                case TacticalLines.LINE: {    //CPOF client requests reverse orientation
                    pts = [...tg.Pixels];
                    for (j = 0; j < tg.Pixels.length; j++) {
                        tg.Pixels[j] = pts[pts.length - j - 1];
                    }
                    //reverse the latlongs also
                    pts = [...tg.LatLongs];
                    for (j = 0; j < tg.LatLongs.length; j++) {
                        tg.LatLongs[j] = pts[pts.length - j - 1];
                    }
                    break;
                }

                default: {
                    return;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsRenderer._className, "setHostileLC",
                    new RendererException("Failed inside setHostileLC", exc));

            } else {
                throw exc;
            }
        }
    }

    /**
     * set the clip rectangle as an arraylist or a Rectangle2D depending on the
     * object
     *
     * @param clipBounds
     * @param clipRect
     * @param clipArray
     * @return
     */
    private static setClip(clipBounds: Rectangle2D | Rectangle | Array<Point2D> | null, clipRect: Rectangle2D, clipArray: Array<Point2D>): boolean {
        try {
            if (clipBounds == null) {
                return false;
            } else if (clipBounds instanceof Rectangle2D) {
                clipRect.setRect(clipBounds as Rectangle2D);
            } else if (clipBounds instanceof Rectangle) {
                //clipRect.setRect((Rectangle2D)clipBounds);
                let rectx: Rectangle = clipBounds as Rectangle;
                //clipBounds=new Rectangle2D(rectx.x,rectx.y,rectx.width,rectx.height);
                clipRect.setRect(rectx.x, rectx.y, rectx.width, rectx.height);
            } else if (clipBounds instanceof Array) {
                clipArray.push(...clipBounds);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsRenderer._className, "setClip",
                    new RendererException("Failed inside setClip", exc));

            } else {
                throw exc;
            }
        }
        return true;
    }

    /**
     * public render function transferred from JavaLineArrayCPOF project. Use
     * this function to replicate CPOF renderer functionality.
     *
     * @param mss the milStdSymbol object
     * @param converter the geographic to pixels coordinate converter
     * @param clipBounds the pixels based clip bounds
     */
    public static render(mss: MilStdSymbol,
        converter: IPointConversion,
        clipBounds: Rectangle2D | Array<Point2D> | null): void;

    /**
     * Generic tester button says Tiger or use JavaRendererSample. Generic
     * renderer testers: called by JavaRendererSample and TestJavaLineArray
     * public render function transferred from JavaLineArrayCPOF project. Use
     * this function to replicate CPOF renderer functionality.
     *
     * @param mss MilStdSymbol
     * @param converter geographic to pixels converter
     * @param shapeInfos ShapeInfo array
     * @param modifierShapeInfos modifier ShapeInfo array
     * @param clipBounds clip bounds
     */
    public static render(mss: MilStdSymbol,
        converter: IPointConversion,
        shapeInfos: Array<ShapeInfo>,
        modifierShapeInfos: Array<ShapeInfo>,
        clipBounds: Rectangle2D | Rectangle | Array<Point2D> | null): void;
    public static render(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [mss, converter, clipBounds] = args as [MilStdSymbol, IPointConversion, Rectangle2D | Rectangle | Array<Point2D> | null];


                try {
                    let shapeInfos: Array<ShapeInfo> = new Array();
                    let modifierShapeInfos: Array<ShapeInfo> = new Array();
                    clsRenderer.render(mss, converter, shapeInfos, modifierShapeInfos, clipBounds);
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(clsRenderer._className, "render",
                            new RendererException("render", exc));

                    } else {
                        throw exc;
                    }
                }


                break;
            }

            case 5: {
                const [mss, converter, shapeInfos, modifierShapeInfos, clipBounds] = args as [MilStdSymbol, IPointConversion, Array<ShapeInfo>, Array<ShapeInfo>, Rectangle2D | Array<Point2D> | null];


                try {
                    //boolean shiftLines = Channels.getShiftLines();
                    //end section

                    let clipRect: Rectangle2D = new Rectangle2D();
                    let clipArray: Array<Point2D> = new Array();
                    clsRenderer.setClip(clipBounds, clipRect, clipArray);

                    let tg: TGLight = clsRenderer.createTGLightFromMilStdSymbol(mss, converter);
                    clsRenderer.reversePointsRevD(tg);
                    CELineArray.setClient("generic");
                    //            if (shiftLines) {
                    //                String affiliation = tg.get_Affiliation();
                    //                Channels.setAffiliation(affiliation);
                    //            }
                    //CELineArray.setMinLength(2.5);    //2-27-2013

                    let linetype: int = tg.get_LineType();
                    //replace calls to MovePixels
                    clsUtility.RemoveDuplicatePoints(tg);

                    clsRenderer.setHostileLC(tg);

                    let g2d: Graphics2D = new Graphics2D();
                    g2d.setFont(tg.get_Font());
                    clsUtilityCPOF.SegmentGeoPoints(tg, converter, 1);
                    clsUtility.FilterAXADPoints(tg, converter);

                    //prevent vertical segments for oneway, twoway, alt
                    clsUtilityJTR.FilterVerticalSegments(tg);
                    let isChange1Area: boolean = clsUtilityJTR.IsChange1Area(linetype);
                    let isTextFlipped: boolean = false;
                    //for 3d change 1 symbols we do not transform the points

                    //if it is world view then we want to flip the far points about
                    //the left and right sides to get two symbols
                    let farLeftPixels: Array<POINT2> = new Array();
                    let farRightPixels: Array<POINT2> = new Array();
                    if (isChange1Area === false) {
                        clsUtilityCPOF.GetFarPixels(tg, converter, farLeftPixels, farRightPixels);
                    }

                    let shapesLeft: Array<Shape2> = new Array();
                    let shapesRight: Array<Shape2> = new Array();
                    let shapes: Array<Shape2>;   //use this to collect all the shapes

                    //CPOF 6.0 diagnostic
                    let textSpecsLeft: Array<Shape2>;
                    let textSpecsRight: Array<Shape2>;
                    //Note: DisplayModifiers3 returns early if textSpecs are null
                    textSpecsLeft = new Array();
                    textSpecsRight = new Array();

                    if (farLeftPixels.length > 0) {
                        tg.Pixels = farLeftPixels;
                        shapesLeft = clsRenderer2.GetLineArray(tg, converter, isTextFlipped, clipBounds);
                        //CPOF 6.0
                        //returns early if textSpecs are null
                        Modifier2.DisplayModifiers2(tg, g2d, textSpecsLeft, isTextFlipped, null);
                    }
                    if (farRightPixels.length > 0) {
                        tg.Pixels = farRightPixels;
                        shapesRight = clsRenderer2.GetLineArray(tg, converter, isTextFlipped, clipBounds);
                        //CPOF 6.0
                        //returns early if textSpecs are null
                        Modifier2.DisplayModifiers2(tg, g2d, textSpecsRight, isTextFlipped, null);
                    }

                    //CPOF 6.0 diagnostic
                    let textSpecs: Array<Shape2> = new Array();

                    if (shapesLeft.length === 0 || shapesRight.length === 0) {
                        let linesWithFillShapes: Array<Shape2> = null;
                        if (clipArray != null && clipArray.length > 0) {
                            linesWithFillShapes = clsClipQuad.LinesWithFill(tg, clipArray);
                        } else {
                            if (clipRect != null && clipRect.getWidth() !== 0) {
                                linesWithFillShapes = clsClipPolygon2.LinesWithFill(tg, clipRect);
                            } else {
                                linesWithFillShapes = clsClipPolygon2.LinesWithFill(tg, null);
                            }
                        }


                        //diagnostic: comment two lines if using the WW tester
                        if (clsUtilityCPOF.canClipPoints(tg) && clipBounds != null) {
                            if (clipArray != null && clipArray.length > 0) {
                                clsClipQuad.ClipPolygon(tg, clipArray);
                            } else {
                                if (clipRect != null && clipRect.getWidth() !== 0) {
                                    clsClipPolygon2.ClipPolygon(tg, clipRect);
                                }
                            }


                            tg.LatLongs = clsUtility.PixelsToLatLong(tg.Pixels, converter);
                        }

                        //diagnostic 1-28-13
                        clsUtilityJTR.InterpolatePixels(tg);

                        tg.modifiers = new Array();
                        Modifier2.AddModifiersGeo(tg, g2d, clipBounds, converter);

                        clsUtilityCPOF.FilterPoints2(tg, converter);
                        clsUtilityCPOF.ClearPixelsStyle(tg);
                        //add section to replace preceding line M. Deutch 11-4-2011
                        let rangeFanFillShapes: Array<Shape2> | null;
                        //do not fill the original shapes for circular range fans
                        let savefillStyle: int = tg.get_FillStyle();
                        if (linetype === TacticalLines.RANGE_FAN) {
                            tg.set_Fillstyle(0);
                        }

                        shapes = clsRenderer2.GetLineArray(tg, converter, isTextFlipped, clipBounds);

                        // Add Feint, decoy, or dummy indicator
                        if (shapes != null
                            && SymbolID.getSymbolSet(tg.get_SymbolId()) === SymbolID.SymbolSet_ControlMeasure
                            && SymbolUtilities.hasFDI(tg.get_SymbolId())) {
                            clsRenderer.addFDI(tg, shapes);
                        }

                        switch (linetype) {
                            case TacticalLines.RANGE_FAN:
                            case TacticalLines.RANGE_FAN_SECTOR:
                            case TacticalLines.RADAR_SEARCH: {
                                if (tg.get_FillColor() == null || tg.get_FillColor().getAlpha() < 2) {
                                    break;
                                }
                                let tg1: TGLight = clsUtilityCPOF.GetCircularRangeFanFillTG(tg);
                                tg1.set_Fillstyle(savefillStyle);
                                tg1.set_SymbolId(tg.get_SymbolId());
                                rangeFanFillShapes = clsRenderer2.GetLineArray(tg1, converter, isTextFlipped, clipBounds);

                                if (rangeFanFillShapes != null) {
                                    shapes.splice(0, 0, ...rangeFanFillShapes);
                                }
                                break;
                            }

                            default: {
                                break;
                            }

                        }

                        //undo any fillcolor for lines with fill
                        clsUtilityCPOF.LinesWithSeparateFill(tg.get_LineType(), shapes);
                        clsClipPolygon2.addAbatisFill(tg, shapes);

                        //if this line is commented then the extra line in testbed goes away
                        if (shapes != null && linesWithFillShapes != null && linesWithFillShapes.length > 0) {
                            shapes.splice(0, 0, ...linesWithFillShapes);
                        }

                        if (shapes != null && shapes.length > 0) {
                            Modifier2.DisplayModifiers2(tg, g2d, textSpecs, isTextFlipped, null);
                            clsRenderer.Shape2ToShapeInfo(modifierShapeInfos, textSpecs);
                            mss.setModifierShapes(modifierShapeInfos);
                        }
                    } else //symbol was more than 180 degrees wide, use left and right symbols
                    {
                        shapes = shapesLeft;
                        shapes.push(...shapesRight);

                        if (textSpecs != null) {
                            textSpecs.push(...textSpecsLeft);
                            textSpecs.push(...textSpecsRight);
                        }
                    }
                    //post-clip the points if the tg could not be pre-clipped
                    if (clsUtilityCPOF.canClipPoints(tg) === false && clipBounds != null) {
                        shapes = clsUtilityCPOF.postClipShapes(tg, shapes, clipBounds);
                    }

                    clsRenderer.Shape2ToShapeInfo(shapeInfos, shapes);
                    clsUtility.addHatchFills(tg, shapeInfos);
                    mss.setSymbolShapes(shapeInfos);
                } catch (exc) {
                    if (exc instanceof Error) {
                        ErrorLogger.LogException(clsRenderer._className, "render",
                            new RendererException("Failed inside render", exc));

                    } else {
                        throw exc;
                    }
                }


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public static getCMLineType(version: int, entityCode: int): int {
        // Check if line type is specific to a version
        if (version === SymbolID.Version_2525E) {
            switch (entityCode) {
                // Added in 2525E
                case 110400: {
                    return TacticalLines.GENERIC_LINE;
                }

                case 120700: {
                    return TacticalLines.GENERIC_AREA;
                }

                case 141800: {
                    return TacticalLines.HOL;
                }

                case 141900: {
                    return TacticalLines.BHL;
                }

                case 310800: {
                    return TacticalLines.CSA;
                }

                case 330500: {
                    return TacticalLines.ROUTE;
                }

                case 330501: {
                    return TacticalLines.ROUTE_ONEWAY;
                }

                case 330502: {
                    return TacticalLines.ROUTE_ALT;
                }

                case 344100: {
                    return TacticalLines.FPOL;
                }

                case 344200: {
                    return TacticalLines.RPOL;
                }

                // Updated in 2525E
                case 120500: {
                    return TacticalLines.BASE_CAMP;
                }

                case 120600: {
                    return TacticalLines.GUERILLA_BASE;
                }

                case 151000: {
                    return TacticalLines.FORT;
                }

                case 260400: {
                    return TacticalLines.BCL;
                }

                case 310100: {
                    return TacticalLines.DHA;
                }


                default:

            }
        } else { // 2525Dchange 1 and older
            switch (entityCode) {
                // Updated in 2525E
                case 120500: {
                    return TacticalLines.BASE_CAMP_REVD;
                }

                case 120600: {
                    return TacticalLines.GUERILLA_BASE_REVD;
                }

                case 151000: {
                    return TacticalLines.FORT_REVD;
                }

                case 260400: {
                    return TacticalLines.BCL_REVD;
                }

                case 310100: {
                    return TacticalLines.DHA_REVD;
                }

                // Removed in 2525E
                case 150300: {
                    return TacticalLines.ASSY;
                }

                case 241601: {
                    return TacticalLines.SENSOR;
                }

                case 241602: {
                    return TacticalLines.SENSOR_RECTANGULAR;
                }

                case 241603: {
                    return TacticalLines.SENSOR_CIRCULAR;
                }


                default:

            }
        }
        // Line type isn't specific to a version or doesn't exist
        switch (entityCode) {
            case 200101: {
                return TacticalLines.LAUNCH_AREA;
            }

            case 200201: {
                return TacticalLines.DEFENDED_AREA_CIRCULAR;
            }

            case 200202: {
                return TacticalLines.DEFENDED_AREA_RECTANGULAR;
            }

            case 120100: {
                return TacticalLines.AO;
            }

            case 120200: {
                return TacticalLines.NAI;
            }

            case 120300: {
                return TacticalLines.TAI;
            }

            case 120400: {
                return TacticalLines.AIRFIELD;
            }

            case 151401: {
                return TacticalLines.AIRAOA;
            }

            case 151402: {
                return TacticalLines.AAAAA;
            }

            case 151403: {
                return TacticalLines.MAIN;
            }

            case 151404: {
                return TacticalLines.SPT;
            }

            case 110100: {
                return TacticalLines.BOUNDARY;
            }

            case 110200: {
                return TacticalLines.LL;
            }

            case 110300: {
                return TacticalLines.EWL;
            }

            case 140100: {
                return TacticalLines.FLOT;
            }

            case 140200: {
                return TacticalLines.LC;
            }

            case 140300: {
                return TacticalLines.PL;
            }

            case 140400: {
                return TacticalLines.FEBA;
            }

            case 140500: {
                return TacticalLines.PDF;
            }

            case 140601: {
                return TacticalLines.DIRATKAIR;
            }

            case 140602: {
                return TacticalLines.DIRATKGND;
            }

            case 140603: {
                return TacticalLines.DIRATKSPT;
            }

            case 140700: {
                return TacticalLines.FCL;
            }

            case 140800: {
                return TacticalLines.IL;
            }

            case 140900: {
                return TacticalLines.LOA;
            }

            case 141000: {
                return TacticalLines.LOD;
            }

            case 141100: {
                return TacticalLines.LDLC;
            }

            case 141200: {
                return TacticalLines.PLD;
            }

            case 150200: {
                return TacticalLines.ASSY;
            }

            case 150100: {
                return TacticalLines.GENERAL;
            }

            case 150501: {
                return TacticalLines.JTAA;
            }

            case 150502: {
                return TacticalLines.SAA;
            }

            case 150503: {
                return TacticalLines.SGAA;
            }

            case 150600: {    //dz no eny
                return TacticalLines.DZ;
            }

            case 150700: {    //ez no eny
                return TacticalLines.EZ;
            }

            case 150800: {    //lz no eny
                return TacticalLines.LZ;
            }

            case 150900: {    //pz no eny
                return TacticalLines.PZ;
            }

            case 151100: {
                return TacticalLines.LAA;
            }

            case 151200: {
                return TacticalLines.BATTLE;
            }

            case 151202: {
                return TacticalLines.PNO;
            }

            case 151204: {
                return TacticalLines.CONTAIN;
            }

            case 151205: {
                return TacticalLines.RETAIN;
            }

            case 151300: {
                return TacticalLines.EA;
            }

            case 151203: {
                return TacticalLines.STRONG;
            }

            case 151500: {
                return TacticalLines.ASSAULT;
            }

            case 151600: {
                return TacticalLines.ATKPOS;
            }

            case 151700: {
                return TacticalLines.OBJ;
            }

            case 151800: {
                return TacticalLines.ENCIRCLE;
            }

            case 151900: {
                return TacticalLines.PEN;
            }

            case 152000: {
                return TacticalLines.ATKBYFIRE;
            }

            case 152100: {
                return TacticalLines.SPTBYFIRE;
            }

            case 152200: {
                return TacticalLines.SARA;
            }

            case 141300: {
                return TacticalLines.AIRHEAD;
            }

            case 141400: {
                return TacticalLines.BRDGHD;
            }

            case 141500: {
                return TacticalLines.HOLD;
            }

            case 141600: {
                return TacticalLines.RELEASE;
            }

            case 141700: {
                return TacticalLines.AMBUSH;
            }

            case 170100: {
                return TacticalLines.AC;
            }

            case 170200: {
                return TacticalLines.LLTR;
            }

            case 170300: {
                return TacticalLines.MRR;
            }

            case 170400: {
                return TacticalLines.SL;
            }

            case 170500: {
                return TacticalLines.SAAFR;
            }

            case 170600: {
                return TacticalLines.TC;
            }

            case 170700: {
                return TacticalLines.SC;
            }

            case 170800: {
                return TacticalLines.BDZ;
            }

            case 170900: {
                return TacticalLines.HIDACZ;
            }

            case 171000: {
                return TacticalLines.ROZ;
            }

            case 171100: {
                return TacticalLines.AARROZ;
            }

            case 171200: {
                return TacticalLines.UAROZ;
            }

            case 171300: {
                return TacticalLines.WEZ;
            }

            case 171400: {
                return TacticalLines.FEZ;
            }

            case 171500: {
                return TacticalLines.JEZ;
            }

            case 171600: {
                return TacticalLines.MEZ;
            }

            case 171700: {
                return TacticalLines.LOMEZ;
            }

            case 171800: {
                return TacticalLines.HIMEZ;
            }

            case 171900: {
                return TacticalLines.FAADZ;
            }

            case 172000: {
                return TacticalLines.WFZ;
            }

            case 200401: {
                return TacticalLines.SHIP_AOI_CIRCULAR;
            }

            case 240804: {
                return TacticalLines.RECTANGULAR_TARGET;
            }

            case 220100: {
                return TacticalLines.BEARING;
            }

            case 220101: {
                return TacticalLines.ELECTRO;
            }

            case 220102: {    //EW                //new label
                return TacticalLines.BEARING_EW;
            }

            case 220103: {
                return TacticalLines.ACOUSTIC;
            }

            case 220104: {
                return TacticalLines.ACOUSTIC_AMB;
            }

            case 220105: {
                return TacticalLines.TORPEDO;
            }

            case 220106: {
                return TacticalLines.OPTICAL;
            }

            case 218400: {
                return TacticalLines.NAVIGATION;
            }

            case 220107: {    //Jammer                //new label
                return TacticalLines.BEARING_J;
            }

            case 220108: {    //RDF                   //new label
                return TacticalLines.BEARING_RDF;
            }

            case 240101: {
                return TacticalLines.ACA;
            }

            case 240102: {
                return TacticalLines.ACA_RECTANGULAR;
            }

            case 240103: {
                return TacticalLines.ACA_CIRCULAR;
            }


            case 240201: {
                return TacticalLines.FFA;
            }

            case 240202: {
                return TacticalLines.FFA_RECTANGULAR;
            }

            case 240203: {
                return TacticalLines.FFA_CIRCULAR;
            }


            case 240301: {
                return TacticalLines.NFA;
            }

            case 240302: {
                return TacticalLines.NFA_RECTANGULAR;
            }

            case 240303: {
                return TacticalLines.NFA_CIRCULAR;
            }


            case 240401: {
                return TacticalLines.RFA;
            }

            case 240402: {
                return TacticalLines.RFA_RECTANGULAR;
            }

            case 240403: {
                return TacticalLines.RFA_CIRCULAR;
            }

            case 240503: {
                return TacticalLines.PAA;
            }

            case 240501: {
                return TacticalLines.PAA_RECTANGULAR;
            }

            case 240502: {
                return TacticalLines.PAA_CIRCULAR;
            }

            case 260100: {
                return TacticalLines.FSCL;
            }

            case 300100: {
                return TacticalLines.ICL;
            }

            case 190100: {
                return TacticalLines.IFF_OFF;
            }

            case 190200: {
                return TacticalLines.IFF_ON;
            }

            case 260200: {
                return TacticalLines.CFL;
            }

            case 260300: {
                return TacticalLines.NFL;
            }

            case 260500: {
                return TacticalLines.RFL;
            }

            case 260600: {
                return TacticalLines.MFP;
            }

            case 240701: {
                return TacticalLines.LINTGT;
            }

            case 240702: {
                return TacticalLines.LINTGTS;
            }

            case 240703: {
                return TacticalLines.FPF;
            }

            case 240801: {
                return TacticalLines.AT;
            }

            case 240802: {
                return TacticalLines.RECTANGULAR;
            }

            case 240803: {
                return TacticalLines.CIRCULAR;
            }

            case 240805: {
                return TacticalLines.SERIES;
            }

            case 240806: {
                return TacticalLines.SMOKE;
            }

            case 240808: {
                return TacticalLines.BOMB;
            }

            case 241001: {
                return TacticalLines.FSA;
            }

            case 241002: {
                return TacticalLines.FSA_RECTANGULAR;
            }

            case 200402: {
                return TacticalLines.SHIP_AOI_RECTANGULAR;
            }

            case 200600: {
                return TacticalLines.CUED_ACQUISITION;
            }

            case 200700: {
                return TacticalLines.RADAR_SEARCH;
            }

            case 241003: {
                return TacticalLines.FSA_CIRCULAR;
            }

            case 200300: {
                return TacticalLines.NOTACK;
            }

            case 241101: {
                return TacticalLines.ATI;
            }

            case 241102: {
                return TacticalLines.ATI_RECTANGULAR;
            }

            case 241103: {
                return TacticalLines.ATI_CIRCULAR;
            }

            case 241201: {
                return TacticalLines.CFFZ;
            }

            case 241202: {
                return TacticalLines.CFFZ_RECTANGULAR;
            }

            case 241203: {
                return TacticalLines.CFFZ_CIRCULAR;
            }

            case 241301: {
                return TacticalLines.CENSOR;
            }

            case 241302: {
                return TacticalLines.CENSOR_RECTANGULAR;
            }

            case 241303: {
                return TacticalLines.CENSOR_CIRCULAR;
            }

            case 241401: {
                return TacticalLines.CFZ;
            }

            case 241402: {
                return TacticalLines.CFZ_RECTANGULAR;
            }

            case 241403: {
                return TacticalLines.CFZ_CIRCULAR;
            }

            case 241501: {
                return TacticalLines.DA;
            }

            case 241502: {
                return TacticalLines.DA_RECTANGULAR;
            }

            case 241503: {
                return TacticalLines.DA_CIRCULAR;
            }

            case 241701: {
                return TacticalLines.TBA;
            }

            case 241702: {
                return TacticalLines.TBA_RECTANGULAR;
            }

            case 241703: {
                return TacticalLines.TBA_CIRCULAR;
            }

            case 241801: {
                return TacticalLines.TVAR;
            }

            case 241802: {
                return TacticalLines.TVAR_RECTANGULAR;
            }

            case 241803: {
                return TacticalLines.TVAR_CIRCULAR;
            }

            case 241901: {
                return TacticalLines.ZOR;
            }

            case 241902: {
                return TacticalLines.ZOR_RECTANGULAR;
            }

            case 241903: {
                return TacticalLines.ZOR_CIRCULAR;
            }

            case 242000: {
                return TacticalLines.TGMF;
            }

            case 242100: {
                return TacticalLines.RANGE_FAN;
            }

            case 242200: {
                return TacticalLines.RANGE_FAN_SECTOR;
            }

            case 242301: {
                return TacticalLines.KILLBOXBLUE;
            }

            case 242302: {
                return TacticalLines.KILLBOXBLUE_RECTANGULAR;
            }

            case 242303: {
                return TacticalLines.KILLBOXBLUE_CIRCULAR;
            }

            case 242304: {
                return TacticalLines.KILLBOXPURPLE;
            }

            case 242305: {
                return TacticalLines.KILLBOXPURPLE_RECTANGULAR;
            }

            case 242306: {
                return TacticalLines.KILLBOXPURPLE_CIRCULAR;
            }

            case 270100:
            case 270200: {
                return TacticalLines.ZONE;
            }

            case 270300: {
                return TacticalLines.OBSFAREA;
            }

            case 270400: {
                return TacticalLines.OBSAREA;
            }

            case 270501: {
                return TacticalLines.MNFLDBLK;
            }

            case 270502: {
                return TacticalLines.MNFLDDIS;
            }

            case 270503: {
                return TacticalLines.MNFLDFIX;
            }

            case 270504: {
                return TacticalLines.TURN;
            }

            case 270601: {
                return TacticalLines.EASY;
            }

            case 270602: {
                return TacticalLines.BYDIF;
            }

            case 270603: {
                return TacticalLines.BYIMP;
            }

            case 271100: {
                return TacticalLines.GAP;
            }

            case 271201: {
                return TacticalLines.PLANNED;
            }

            case 271202: {
                return TacticalLines.ESR1;
            }

            case 271203: {
                return TacticalLines.ESR2;
            }

            case 271204: {
                return TacticalLines.ROADBLK;
            }

            case 280100: {
                return TacticalLines.ABATIS;
            }

            case 290100: {
                return TacticalLines.LINE;
            }

            case 290201: {
                return TacticalLines.ATDITCH;
            }

            case 290202: {
                return TacticalLines.ATDITCHC;
            }

            case 290203: {
                return TacticalLines.ATDITCHM;
            }

            case 290204: {
                return TacticalLines.ATWALL;
            }

            case 290301: {
                return TacticalLines.UNSP;
            }

            case 290302: {
                return TacticalLines.SFENCE;
            }

            case 290303: {
                return TacticalLines.DFENCE;
            }

            case 290304: {
                return TacticalLines.DOUBLEA;
            }

            case 290305: {
                return TacticalLines.LWFENCE;
            }

            case 290306: {
                return TacticalLines.HWFENCE;
            }

            case 290307: {
                return TacticalLines.SINGLEC;
            }

            case 290308: {
                return TacticalLines.DOUBLEC;
            }

            case 290309: {
                return TacticalLines.TRIPLE;
            }

            case 290600: {
                return TacticalLines.MFLANE;
            }

            case 270707: {
                return TacticalLines.DEPICT;
            }

            case 270800: {
                return TacticalLines.MINED;
            }

            case 270801: {
                return TacticalLines.FENCED;
            }

            case 290101: {
                return TacticalLines.MINE_LINE;
            }

            case 271000: {
                return TacticalLines.UXO;
            }

            case 271700: {
                return TacticalLines.BIO;
            }

            case 271800: {
                return TacticalLines.CHEM;
            }

            case 271900: {
                return TacticalLines.NUC;
            }

            case 272000: {
                return TacticalLines.RAD;
            }

            case 290400: {
                return TacticalLines.CLUSTER;
            }

            case 290500: {
                return TacticalLines.TRIP;
            }

            case 282003: {
                return TacticalLines.OVERHEAD_WIRE;
            }

            case 271300: {
                return TacticalLines.ASLTXING;
            }

            case 271500: {
                return TacticalLines.FORDSITE;
            }

            case 271600: {
                return TacticalLines.FORDIF;
            }

            case 290700: {
                return TacticalLines.FERRY;
            }

            case 290800: {
                return TacticalLines.RAFT;
            }

            case 290900: {
                return TacticalLines.FORTL;
            }

            case 291000: {
                return TacticalLines.FOXHOLE;
            }

            case 272100: {
                return TacticalLines.MSDZ;
            }

            case 272200: {
                return TacticalLines.DRCL;
            }


            case 310200: {
                return TacticalLines.EPW;
            }

            case 310300: {
                return TacticalLines.FARP;
            }

            case 310400: {
                return TacticalLines.RHA;
            }

            case 310500: {
                return TacticalLines.RSA;
            }

            case 310600: {
                return TacticalLines.BSA;
            }

            case 310700: {
                return TacticalLines.DSA;
            }

            case 330100: {
                return TacticalLines.CONVOY;
            }

            case 330200: {
                return TacticalLines.HCONVOY;
            }

            case 330300: {
                return TacticalLines.MSR;
            }

            case 330301: {
                return TacticalLines.MSR_ONEWAY;
            }

            case 330401: {
                return TacticalLines.ASR_ONEWAY;
            }

            case 330302: {
                return TacticalLines.MSR_TWOWAY;
            }

            case 330402: {
                return TacticalLines.ASR_TWOWAY;
            }

            case 330303: {
                return TacticalLines.MSR_ALT;
            }

            case 330403: {
                return TacticalLines.ASR_ALT;
            }


            case 330400: {
                return TacticalLines.ASR;
            }


            case 340100: {
                return TacticalLines.BLOCK;
            }

            case 340200: {
                return TacticalLines.BREACH;
            }

            case 340300: {
                return TacticalLines.BYPASS;
            }

            case 340400: {
                return TacticalLines.CANALIZE;
            }

            case 340500: {
                return TacticalLines.CLEAR;
            }

            case 340600: {
                return TacticalLines.CATK;
            }

            case 340700: {
                return TacticalLines.CATKBYFIRE;
            }


            case 340800: {
                return TacticalLines.DELAY;
            }

            case 341000: {
                return TacticalLines.DISRUPT;
            }

            case 341100: {
                return TacticalLines.FIX;
            }

            case 341200: {
                return TacticalLines.FOLLA;
            }

            case 341300: {
                return TacticalLines.FOLSP;
            }

            case 341500: {
                return TacticalLines.ISOLATE;
            }

            case 341700: {
                return TacticalLines.OCCUPY;
            }

            case 341800: {
                return TacticalLines.PENETRATE;
            }

            case 341900: {
                return TacticalLines.RIP;
            }

            case 342000: {
                return TacticalLines.RETIRE;
            }

            case 342100: {
                return TacticalLines.SECURE;
            }

            case 342201: {
                return TacticalLines.COVER;
            }

            case 342202: {
                return TacticalLines.GUARD;
            }

            case 342203: {
                return TacticalLines.SCREEN;
            }

            case 342300: {
                return TacticalLines.SEIZE;
            }

            case 342400: {
                return TacticalLines.WITHDRAW;
            }

            case 342500: {
                return TacticalLines.WDRAWUP;
            }

            case 342600: {
                return TacticalLines.CORDONKNOCK;
            }

            case 342700: {
                return TacticalLines.CORDONSEARCH;
            }

            case 272101: {
                return TacticalLines.STRIKWARN;
            }

            default: {
                break;
            }

        }
        return -1;
    }

    /**
     * Some symbol's points are reversed when moving from 2525C to 2525D. This method should be called at the start of each render.
     *
     * It's a simpler fix to reverse the points order at start than to reverse order when rendering.
     *
     * Note: Make sure to only call once to not reverse reversed points
     * @param tg
     */
    private static reversePointsRevD(tg: TGLight): void {
        try {
            if (tg.get_SymbolId().length < 20 || SymbolID.getSymbolSet(tg.get_SymbolId()) !== 25) {
                return;
            }
            switch (tg.get_LineType()) {
                case TacticalLines.LC:
                case TacticalLines.UNSP:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE: {
                    if (tg.Pixels != null) {
                        tg.Pixels.reverse();
                    }
                    if (tg.LatLongs != null) {
                        tg.LatLongs.reverse();
                    }
                    break;
                }

                case TacticalLines.CLUSTER: {
                    if (SymbolID.getVersion(tg.get_SymbolId()) < SymbolID.Version_2525E) {
                        if (tg.Pixels != null) {
                            tg.Pixels.reverse();
                        }
                        if (tg.LatLongs != null) {
                            tg.LatLongs.reverse();
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
                ErrorLogger.LogException("clsRenderer", "reversePointsRevD",
                    new RendererException("Failed inside reversePointsRevD", exc));
            } else {
                throw exc;
            }
        }
    }
}
