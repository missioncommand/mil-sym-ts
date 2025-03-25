import { POINT2 } from "../../JavaLineArray/POINT2";
import { TGLight } from "../../JavaTacticalRenderer/TGLight";
import { clsRenderer } from "../../RenderMultipoints/clsRenderer";
import { AffineTransform } from "../../graphics2d/AffineTransform";
import { BasicStroke } from "../../graphics2d/BasicStroke";
import { Font } from "../../graphics2d/Font";
import { Point2D } from "../../graphics2d/Point2D";
import { Rectangle } from "../../graphics2d/Rectangle";
import { Rectangle2D } from "../../graphics2d/Rectangle2D";
import { Color } from "../../renderer/utilities/Color";
import { DistanceUnit } from "../../renderer/utilities/DistanceUnit";
import { DrawRules } from "../../renderer/utilities/DrawRules";
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger";
import { GENCLookup } from "../../renderer/utilities/GENCLookup";
import { IPointConversion } from "../../renderer/utilities/IPointConversion";
import { LogLevel } from "../../renderer/utilities/LogLevel";
import { MSInfo } from "../../renderer/utilities/MSInfo";
import { MSLookup } from "../../renderer/utilities/MSLookup";
import { MilStdAttributes } from "../../renderer/utilities/MilStdAttributes";
import { MilStdSymbol } from "../../renderer/utilities/MilStdSymbol";
import { Modifiers } from "../../renderer/utilities/Modifiers";
import { PointConversion } from "../../renderer/utilities/PointConversion";
import { RendererSettings } from "../../renderer/utilities/RendererSettings";
import { RendererUtilities } from "../../renderer/utilities/RendererUtilities";
import { ShapeInfo } from "../../renderer/utilities/ShapeInfo";
import { SymbolID } from "../../renderer/utilities/SymbolID";
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities";
import { GeoPixelConversion } from "./GeoPixelConversion";
import { PointConverter } from "./PointConverter";
import { JavaRendererUtilities } from "./utilities/JavaRendererUtilities";
import { LineInfo } from "./utilities/LineInfo";
import { SymbolInfo } from "./utilities/SymbolInfo";
import { TextInfo } from "./utilities/TextInfo";
import { mdlGeodesic } from "../../JavaTacticalRenderer/mdlGeodesic";
import { MultiPointHandlerSVG } from "./MultiPointHandlerSVG";
import { WebRenderer } from "./WebRenderer";

import { type int, type double } from "../../graphics2d/BasicTypes";

export class MultiPointHandler {
    private static readonly _maxPixelWidth: int = 1920;
    private static readonly _minPixelWidth: int = 720;



    /**
     * GE has the unusual distinction of being an application with coordinates
     * outside its own extents. It appears to only be a problem when lines cross
     * the IDL
     *
     * @param pts2d the client points
     */
    public static NormalizeGECoordsToGEExtents(leftLongitude: double,
        rightLongitude: double,
        pts2d: Array<Point2D>): void {
        try {
            let j: int = 0;
            let x: double = 0;
            let y: double = 0;
            let pt2d: Point2D;
            let n: int = pts2d.length;
            //for (j = 0; j < pts2d.length; j++) 
            for (j = 0; j < n; j++) {
                pt2d = pts2d[j];
                x = pt2d.getX();
                y = pt2d.getY();
                while (x < leftLongitude) {
                    x += 360;
                }
                while (x > rightLongitude) {
                    x -= 360;
                }

                pt2d = new Point2D(x, y);
                pts2d[j] = pt2d;
            }
        } catch (exc) {
            if (exc instanceof Error) {
            } else {
                throw exc;
            }
        }
    }

    /**
     * GE recognizes coordinates in the range of -180 to +180
     *
     * @param pt2d
     * @return
     */
    static NormalizeCoordToGECoord(pt2d: Point2D): Point2D {
        let ptGeo: Point2D;
        try {
            let x: double = pt2d.getX();
            let y: double = pt2d.getY();
            while (x < -180) {
                x += 360;
            }
            while (x > 180) {
                x -= 360;
            }

            ptGeo = new Point2D(x, y);
        } catch (exc) {
            if (exc instanceof Error) {
            } else {
                throw exc;
            }
        }
        return ptGeo;
    }

    /**
     * We have to ensure the bounding rectangle at least includes the symbol or
     * there are problems rendering, especially when the symbol crosses the IDL
     *
     * @param controlPoints the client symbol anchor points
     * @param bbox the original bounding box
     * @return the modified bounding box
     */
    private static getBoundingRectangle(controlPoints: string,
        bbox: string): string {
        let bbox2: string = "";
        try {
            //first get the minimum bounding rect for the geo coords
            let left: number = 0.0;
            let right: number = 0.0;
            let top: number = 0.0;
            let bottom: number = 0.0;

            let coordinates: string[] = controlPoints.split(" ");
            let len: int = coordinates.length;
            let i: int = 0;
            left = Number.MAX_VALUE;
            right = -Number.MAX_VALUE;
            top = -Number.MAX_VALUE;
            bottom = Number.MAX_VALUE;
            for (i = 0; i < len; i++) {
                let coordPair: string[] = coordinates[i].split(",");
                let latitude: number = parseFloat(coordPair[1].trim());
                let longitude: number = parseFloat(coordPair[0].trim());
                if (longitude < left) {
                    left = longitude;
                }
                if (longitude > right) {
                    right = longitude;
                }
                if (latitude > top) {
                    top = latitude;
                }
                if (latitude < bottom) {
                    bottom = latitude;
                }
            }
            bbox2 = left.toString() + "," + bottom.toString() + "," + right.toString() + "," + top.toString();
        } catch (ex) {
            if (ex instanceof Error) {
                console.log("Failed to create bounding rectangle in MultiPointHandler.getBoundingRect");
            } else {
                throw ex;
            }
        }
        return bbox2;
    }

    /**
     * need to use the symbol to get the upper left control point in order to
     * produce a valid PointConverter
     *
     * @param geoCoords
     * @return
     */
    private static getControlPoint(geoCoords: Array<Point2D>): Point2D {
        let pt2d: Point2D;
        try {
            let left: double = Number.MAX_VALUE;
            let right: double = -Number.MAX_VALUE;
            let top: double = -Number.MAX_VALUE;
            let bottom: double = Number.MAX_VALUE;
            let ptTemp: Point2D;
            let n: int = geoCoords.length;
            //for (int j = 0; j < geoCoords.length; j++) 
            for (let j: int = 0; j < n; j++) {
                ptTemp = geoCoords[j];
                if (ptTemp.getX() < left) {
                    left = ptTemp.getX();
                }
                if (ptTemp.getX() > right) {
                    right = ptTemp.getX();
                }
                if (ptTemp.getY() > top) {
                    top = ptTemp.getY();
                }
                if (ptTemp.getY() < bottom) {
                    bottom = ptTemp.getY();
                }
            }
            pt2d = new Point2D(left, top);
        } catch (ex) {
            if (ex instanceof Error) {
                console.log("Failed to create control point in MultiPointHandler.getControlPoint");
            } else {
                throw ex;
            }
        }
        return pt2d;
    }

    /**
     * Assumes a reference in which the north pole is on top.
     *
     * @param geoCoords the geographic coordinates
     * @return the upper left corner of the MBR containing the geographic
     * coordinates
     */
    private static getGeoUL(geoCoords: Array<Point2D>): Point2D {
        let ptGeo: Point2D;
        try {
            let j: int = 0;
            let pt: Point2D;
            let left: double = geoCoords[0].getX();
            let top: double = geoCoords[0].getY();
            let right: double = geoCoords[0].getX();
            let bottom: double = geoCoords[0].getY();
            let n: int = geoCoords.length;
            //for (j = 1; j < geoCoords.length; j++) 
            for (j = 1; j < n; j++) {
                pt = geoCoords[j];
                if (pt.getX() < left) {
                    left = pt.getX();
                }
                if (pt.getX() > right) {
                    right = pt.getX();
                }
                if (pt.getY() > top) {
                    top = pt.getY();
                }
                if (pt.getY() < bottom) {
                    bottom = pt.getY();
                }
            }
            //if geoCoords crosses the IDL
            if (right - left > 180) {
                //There must be at least one x value on either side of +/-180. Also, there is at least
                //one positive value to the left of +/-180 and negative x value to the right of +/-180.
                //We are using the orientation with the north pole on top so we can keep
                //the existing value for top. Then the left value will be the least positive x value
                //left = geoCoords[0].getX();
                left = 180;
                //for (j = 1; j < geoCoords.length; j++) 
                n = geoCoords.length;
                for (j = 0; j < n; j++) {
                    pt = geoCoords[j];
                    if (pt.getX() > 0 && pt.getX() < left) {
                        left = pt.getX();
                    }
                }
            }
            ptGeo = new Point2D(left, top);
        } catch (ex) {
            if (ex instanceof Error) {
                console.log("Failed to create control point in MultiPointHandler.getControlPoint");
            } else {
                throw ex;
            }
        }
        return ptGeo;
    }
    private static getBboxFromCoords(geoCoords: Array<Point2D>): string {
        //var ptGeo = null;
        let bbox: string;
        try {
            let j: int = 0;
            let pt: Point2D;
            let left: double = geoCoords[0].getX();
            let top: double = geoCoords[0].getY();
            let right: double = geoCoords[0].getX();
            let bottom: double = geoCoords[0].getY();
            for (j = 1; j < geoCoords.length; j++) {
                pt = geoCoords[j];
                if (pt.getX() < left) {
                    left = pt.getX();
                }
                if (pt.getX() > right) {
                    right = pt.getX();
                }
                if (pt.getY() > top) {
                    top = pt.getY();
                }
                if (pt.getY() < bottom) {
                    bottom = pt.getY();
                }
            }
            //if geoCoords crosses the IDL
            if (right - left > 180) {
                //There must be at least one x value on either side of +/-180. Also, there is at least
                //one positive value to the left of +/-180 and negative x value to the right of +/-180.
                //We are using the orientation with the north pole on top so we can keep
                //the existing value for top. Then the left value will be the least positive x value
                //left = geoCoords[0].x;
                left = 180;
                right = -180;
                for (j = 0; j < geoCoords.length; j++) {
                    pt = geoCoords[j];
                    if (pt.getX() > 0 && pt.getX() < left) {
                        left = pt.getX();
                    }
                    if (pt.getX() < 0 && pt.getX() > right) {
                        right = pt.getX();
                    }
                }
            }
            //ptGeo = new Point2D(left, top);
            bbox = left.toString() + "," + bottom.toString() + "," + right.toString() + "," + top.toString();
        } catch (ex) {
            if (ex instanceof Error) {
                console.log("Failed to create control point in MultiPointHandler.getBboxFromCoords");
            } else {
                throw ex;
            }
        }
        //return ptGeo;            
        return bbox;
    }

    private static crossesIDL(geoCoords: Array<Point2D>): boolean {
        let result: boolean = false;
        let pt2d: Point2D = MultiPointHandler.getControlPoint(geoCoords);
        let left: double = pt2d.getX();
        let ptTemp: Point2D;
        let n: int = geoCoords.length;
        //for (int j = 0; j < geoCoords.length; j++) 
        for (let j: int = 0; j < n; j++) {
            ptTemp = geoCoords[j];
            if (Math.abs(ptTemp.getX() - left) > 180) {
                return true;
            }
        }
        return result;
    }

    /**
     * Checks if a symbol is one with decorated lines which puts a strain on
     * google earth when rendering like FLOT. These complicated lines should be
     * clipped when possible.
     *
     * @param symbolID
     * @return
     */
    public static ShouldClipSymbol(symbolID: string): boolean {
        //TODO: need to reevaluate this function to make sure we clip the right symbols.
        let status: int = SymbolID.getStatus(symbolID);

        if (SymbolUtilities.isTacticalGraphic(symbolID) && status === SymbolID.Status_Planned_Anticipated_Suspect) {
            return true;
        }

        if (SymbolUtilities.isWeather(symbolID)) {
            return true;
        }

        let id: int = parseInt(SymbolUtilities.getBasicSymbolID(symbolID));
        //TODO: needs to be reworked
        if (id === 25341100 || //Task Fix
            id === 25260200 || //CFL
            id === 25110100 || //Boundary
            id === 25110200 || //Light Line (LL)
            id === 25110300 || //Engineer Work Line (EWL)
            id === 25140100 || //FLOT
            id === 25140200 || //Line of contact is now just two flots, but APP6 still has it as a separate symbol
            id === 25151000 || //Fortified Area
            id === 25151100 || //Limited Access Area
            id === 25172000 || //Weapons Free Zone
            id === 25151202 || //Battle Position/Prepared but not Occupied
            id === 25151203 || //Strong Point
            id === 25141200 || //Probable Line of Deployment (PLD)
            id === 25270800 || //Mined Area
            id === 25270801 || //Mined Area, Fenced
            id === 25170100 || //Air Corridor
            id === 25170200 || //Low Level Transit Route (LLTR)
            id === 25170300 || //Minimum-Risk Route (MRR)
            id === 25170400 || //Safe Lane (SL)
            id === 25170500 || //Standard Use ARmy Aircraft Flight Route (SAAFR)
            id === 25170600 || //Transit Corridors (TC)
            id === 25170700 || //Special Corridor (SC)

            id === 25270100 || //Obstacle Belt
            id === 25270200 || //Obstacle Zone
            id === 25270300 || //Obstacle Free Zone
            id === 25270400 || //Obstacle Restricted Zone

            id === 25290100 || //Obstacle Line
            id === 25290201 || //Antitank Ditch - Under Construction
            id === 25290202 || //Antitank Ditch - Completed
            id === 25290203 || //Antitank Ditch Reinforced, with Antitank Mines
            id === 25290204 || //Antitank Wall
            id === 25290301 || //Unspecified
            id === 25290302 || //Single Fence
            id === 25290303 || //Double Fence
            id === 25290304 || //Double Apron Fence
            id === 25290305 || //Low Wire Fence
            id === 25290306 || //High Wire Fence
            id === 25290307 || //Single Concertina
            id === 25290308 || //Double Strand Concertina
            id === 25290309 || //Triple Strand Concertina

            id === 25341100 || //Obstacles Effect Fix now Mission Tasks Fix
            id === 25290400 || //Mine Cluster
            id === 25282003 || //Aviation / Overhead Wire
            id === 25270602 || //Bypass Difficult
            id === 25271500 || //Ford Easy
            id === 25271600 || //Ford Difficult

            id === 25290900 || //Fortified Line

            id === 25271700 || //Biological Contaminated Area
            id === 25271800 || //Chemical Contaminated Area
            id === 25271900 || //Nuclear Contaminated Area
            id === 25272000 || //Radiological Contaminated Area

            id === 25240301 || //No Fire Area (NFA) - Irregular
            id === 25240302 || //No Fire Area (NFA) - Rectangular
            id === 25240303 || //No Fire Area (NFA) - Circular


            id === 25240701 || //Linear Target
            id === 25240702 || //Linear Smoke Target
            id === 25240703 || //Final Protective Fire (FPF)
            id === 25151800 || //Encirclement

            id === 25330300 || //MSR
            id === 25330301 || //MSR / One Way Traffic
            id === 25330302 || //MSR / Two Way Traffic
            id === 25330303 || //MSR / Alternating Traffic

            id === 25330400 || //ASR
            id === 25330401 || //ASR / One Way Traffic
            id === 25330402 || //ASR / Two Way Traffic
            id === 25330403 || //AMSR / Alternating Traffic

            id === 25151205 || //Retain
            id === 25341500 || //Isolate

            id === 25340600 || //counterattack.
            id === 25340700 || //counterattack by fire.
            //id == G*G*PA----****X || //AoA for Feint - appears to be gone in 2525D
            id === 25271200 || //Blown Bridges Planned
            id === 25271202 || //Blown Bridges Explosives, State of Readiness 1 (Safe)
            id === 25341200) // Follow and Assume
        {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Assumes bbox is of form left,bottom,right,top and it is currently only
     * using the width to calculate a reasonable scale. If the original scale is
     * within the max and min range it returns the original scale.
     *
     * @param bbox
     * @param origScale
     * @return
     */
    private static getReasonableScale(bbox: string, origScale: double): double {
        try {
            let bounds: string[] = bbox.split(",");
            let left: double = parseFloat(bounds[0]);
            let right: double = parseFloat(bounds[2]);
            let top: double = parseFloat(bounds[3]);
            let bottom: double = parseFloat(bounds[1]);

            let ul: POINT2 = new POINT2(left, top);
            let ur: POINT2 = new POINT2(right, top);

            let widthInMeters: double = 0;
            if ((left === -180 && right === 180) || (left === 180 && right === -180)) {

                widthInMeters = 40075017 / 2;
            }
            // Earth's circumference / 2
            else {

                widthInMeters = mdlGeodesic.geodesic_distance(ul, ur, null, null);
            }


            let minScale: double = widthInMeters / (MultiPointHandler._maxPixelWidth as double / RendererSettings.getInstance().getDeviceDPI() / GeoPixelConversion.INCHES_PER_METER);
            if (origScale < minScale) {
                return minScale;
            }

            let maxScale: double = widthInMeters / (MultiPointHandler._minPixelWidth as double / RendererSettings.getInstance().getDeviceDPI() / GeoPixelConversion.INCHES_PER_METER);
            if (origScale > maxScale) {
                return maxScale;
            }
        } catch (ignored) {
        }
        return origScale;
    }

    /**
     *
     * @param id
     * @param name
     * @param description
     * @param symbolCode
     * @param controlPoints
     * @param scale
     * @param bbox
     * @param symbolModifiers {@link Map}, keyed using constants from
     * Modifiers. Pass in comma delimited String for modifiers with multiple
     * values like AM, AN &amp; X
     * @param symbolAttributes {@link Map}, keyed using constants from
     * MilStdAttributes. pass in double[] for AM, AN and X; Strings for the
     * rest.
     * @param format
     * @return
     */
    public static RenderSymbol(id: string,
        name: string,
        description: string,
        symbolCode: string,
        controlPoints: string,
        scale: number,
        bbox: string,
        symbolModifiers: Map<string, string>,
        symbolAttributes: Map<string, string>,
        format: int): string//,
    {
        //console.log("MultiPointHandler.RenderSymbol()");
        let normalize: boolean = true;
        //Double controlLat = 0.0;
        //Double controlLong = 0.0;
        //Double metPerPix = GeoPixelConversion.metersPerPixel(scale);
        //String bbox2=getBoundingRectangle(controlPoints,bbox);
        let jsonOutput: string = "";
        let jsonContent: string = "";

        let rect: Rectangle;
        let coordinates: string[] = controlPoints.split(" ");
        let tgl: TGLight = new TGLight();
        let shapes: Array<ShapeInfo> = new Array<ShapeInfo>();
        let modifiers: Array<ShapeInfo> = new Array<ShapeInfo>();
        //ArrayList<Point2D> pixels = new ArrayList<Point2D>();
        let geoCoords: Array<Point2D> = new Array<Point2D>();
        let len: int = coordinates.length;
        //diagnostic create geoCoords here
        let coordsUL: Point2D = null;

        let symbolIsValid: string = MultiPointHandler.canRenderMultiPoint(symbolCode, symbolModifiers, len);
        if (symbolIsValid !== "true") {
            let ErrorOutput: string = "";
            ErrorOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the MilStdSymbol " + symbolCode + " - ID: " + id + " - ");
            ErrorOutput += symbolIsValid; //reason for error
            ErrorOutput += ("\"}");
            ErrorLogger.LogMessage("MultiPointHandler", "RenderSymbol", symbolIsValid, LogLevel.FINE);
            return ErrorOutput;
        }

        if (MSLookup.getInstance().getMSLInfo(symbolCode).getDrawRule() != DrawRules.AREA10) // AREA10 can support infinite points
            len = Math.min(len, MSLookup.getInstance().getMSLInfo(symbolCode).getMaxPointCount());
        for (let i: int = 0; i < len; i++) {
            let coordPair: string[] = coordinates[i].split(",");
            let latitude: number = parseFloat(coordPair[1].trim());
            let longitude: number = parseFloat(coordPair[0].trim());
            geoCoords.push(new Point2D(longitude, latitude));
        }
        let tgPoints: Array<POINT2>;
        let ipc: IPointConversion;

        //Deutch moved section 6-29-11
        let left: number = 0.0;
        let right: number = 0.0;
        let top: number = 0.0;
        let bottom: number = 0.0;
        let temp: Point2D;
        let ptGeoUL: Point2D;
        let width: int = 0;
        let height: int = 0;
        let leftX: int = 0;
        let topY: int = 0;
        let bottomY: int = 0;
        let rightX: int = 0;
        let j: int = 0;
        let bboxCoords: Array<Point2D>;
        if (bbox != null && bbox !== "") {
            let bounds: string[];
            if (bbox.includes(" "))//trapezoid
            {
                bboxCoords = new Array<Point2D>();
                let x: double = 0;
                let y: double = 0;
                let coords: string[] = bbox.split(" ");
                let arrCoord: string[];
                for (let coord of coords) {
                    arrCoord = coord.split(",");
                    x = parseFloat(arrCoord[0]);
                    y = parseFloat(arrCoord[1]);
                    bboxCoords.push(new Point2D(x, y));
                }
                //use the upper left corner of the MBR containing geoCoords
                //to set the converter
                ptGeoUL = MultiPointHandler.getGeoUL(bboxCoords);
                left = ptGeoUL.getX();
                top = ptGeoUL.getY();
                let bbox2: string = MultiPointHandler.getBboxFromCoords(bboxCoords);
                scale = MultiPointHandler.getReasonableScale(bbox2, scale);
                ipc = new PointConverter(left, top, scale);
                let ptPixels: Point2D;
                let ptGeo: Point2D;
                let n: int = bboxCoords.length;
                //for (j = 0; j < bboxCoords.length; j++) 
                for (j = 0; j < n; j++) {
                    ptGeo = bboxCoords[j];
                    ptPixels = ipc.GeoToPixels(ptGeo);
                    x = ptPixels.getX();
                    y = ptPixels.getY();
                    if (x < 20) {
                        x = 20;
                    }
                    if (y < 20) {
                        y = 20;
                    }
                    ptPixels.setLocation(x, y);
                    //end section
                    bboxCoords[j] = ptPixels;
                }
            } else//rectangle
            {
                bounds = bbox.split(",");
                left = parseFloat(bounds[0]);
                right = parseFloat(bounds[2]);
                top = parseFloat(bounds[3]);
                bottom = parseFloat(bounds[1]);
                scale = MultiPointHandler.getReasonableScale(bbox, scale);
                ipc = new PointConverter(left, top, scale);
            }

            let pt2d: Point2D;
            if (bboxCoords == null) {
                pt2d = new Point2D(left, top);
                temp = ipc.GeoToPixels(pt2d);

                leftX = temp.getX() as int;
                topY = temp.getY() as int;

                pt2d = new Point2D(right, bottom);
                temp = ipc.GeoToPixels(pt2d);

                bottomY = temp.getY() as int;
                rightX = temp.getX() as int;
                //diagnostic clipping does not work at large scales
                //                if(scale>10e6)
                //                {
                //                    //diagnostic replace above by using a new ipc based on the coordinates MBR
                //                    coordsUL=getGeoUL(geoCoords);
                //                    temp = ipc.GeoToPixels(coordsUL);
                //                    left=coordsUL.getX();
                //                    top=coordsUL.getY();
                //                    //shift the ipc to coordsUL origin so that conversions will be more accurate for large scales.
                //                    ipc = new PointConverter(left, top, scale);
                //                    //shift the rect to compenstate for the shifted ipc so that we can maintain the original clipping area.
                //                    leftX -= (int)temp.getX();
                //                    rightX -= (int)temp.getX();
                //                    topY -= (int)temp.getY();
                //                    bottomY -= (int)temp.getY();
                //                    //end diagnostic
                //                }
                //end section

                width = Math.abs(rightX - leftX) as int;
                height = Math.abs(bottomY - topY) as int;

                rect = new Rectangle(leftX, topY, width, height);
            }
        } else {
            rect = null;
        }
        //end section

        //        for (int i = 0; i < len; i++) {
        //            String[] coordPair = coordinates[i].split(",");
        //            Double latitude = Double.valueOf(coordPair[1].trim());
        //            Double longitude = Double.valueOf(coordPair[0].trim());
        //            geoCoords.push(new Point2D(longitude, latitude));
        //        }
        if (ipc == null) {
            let ptCoordsUL: Point2D = MultiPointHandler.getGeoUL(geoCoords);
            ipc = new PointConverter(ptCoordsUL.getX(), ptCoordsUL.getY(), scale);
        }
        //if (crossesIDL(geoCoords) == true) 
        //        if(Math.abs(right-left)>180)
        //        {
        //            normalize = true;
        //            ((PointConverter)ipc).set_normalize(true);
        //        } 
        //        else {
        //            normalize = false;
        //            ((PointConverter)ipc).set_normalize(false);
        //        }

        //seems to work ok at world view
        //        if (normalize) {
        //            NormalizeGECoordsToGEExtents(0, 360, geoCoords);
        //        }

        //M. Deutch 10-3-11
        //must shift the rect pixels to synch with the new ipc
        //the old ipc was in synch with the bbox, so rect x,y was always 0,0
        //the new ipc synchs with the upper left of the geocoords so the boox is shifted
        //and therefore the clipping rectangle must shift by the delta x,y between
        //the upper left corner of the original bbox and the upper left corner of the geocoords
        let geoCoords2: Array<Point2D> = new Array<Point2D>();
        geoCoords2.push(new Point2D(left, top));
        geoCoords2.push(new Point2D(right, bottom));

        //        if (normalize) {
        //            NormalizeGECoordsToGEExtents(0, 360, geoCoords2);
        //        }

        //disable clipping
        if (MultiPointHandler.ShouldClipSymbol(symbolCode) === false) {

            if (MultiPointHandler.crossesIDL(geoCoords) === false) {
                rect = null;
                bboxCoords = null;
            }
        }


        tgl.set_SymbolId(symbolCode);// "GFGPSLA---****X" AMBUSH symbol code
        tgl.set_Pixels(null);

        try {

            //String fillColor = null;
            let mSymbol: MilStdSymbol = new MilStdSymbol(symbolCode, null, geoCoords, null);
            
            if (format == WebRenderer.OUTPUT_FORMAT_GEOSVG) {
                // Use dash array and hatch pattern fill for SVG output
                symbolAttributes.set(MilStdAttributes.UseDashArray, 'true')
                symbolAttributes.set(MilStdAttributes.UsePatternFill, "true")
            }

            if (symbolModifiers != null || symbolAttributes != null) {
                MultiPointHandler.populateModifiers(symbolModifiers, symbolAttributes, mSymbol);
            } else {
                mSymbol.setFillColor(null);
            }

            if (bboxCoords == null) {
                clsRenderer.renderWithPolylines(mSymbol, ipc, rect);
            } else {
                clsRenderer.renderWithPolylines(mSymbol, ipc, bboxCoords);
            }

            shapes = mSymbol.getSymbolShapes();
            modifiers = mSymbol.getModifierShapes();

            if (format === WebRenderer.OUTPUT_FORMAT_JSON) {
                jsonOutput += ("{\"type\":\"symbol\",");
                jsonContent = MultiPointHandler.JSONize(shapes, modifiers, ipc, true, normalize);
                jsonOutput += (jsonContent);
                jsonOutput += ("}");
            } else if (format === WebRenderer.OUTPUT_FORMAT_GEOJSON) {
                /*
                jsonOutput += ("{\"type\":\"FeatureCollection\",\"features\":");
                jsonContent = GeoJSONize(shapes, modifiers, ipc, normalize, mSymbol.getTextColor(), mSymbol.getTextBackgroundColor());
                jsonOutput += (jsonContent);
                jsonOutput += (",\"properties\":{\"id\":\"");
                jsonOutput += (id);
                jsonOutput += ("\",\"name\":\"");
                jsonOutput += (name);
                jsonOutput += ("\",\"description\":\"");
                jsonOutput += (description);
                jsonOutput += ("\",\"symbolID\":\"");
                jsonOutput += (symbolCode);
                jsonOutput += ("\",\"wasClipped\":\"");
                jsonOutput += (mSymbol.get_WasClipped()).toString();
                jsonOutput += ("\"}}");         */

                jsonOutput += ("{\"type\":\"FeatureCollection\",\"features\":");
                jsonContent = MultiPointHandler.GeoJSONize(shapes, modifiers, ipc, normalize, mSymbol.getTextColor(), mSymbol.getTextBackgroundColor());
                jsonOutput += (jsonContent);

                //moving meta data properties to the last feature with no coords as feature collection doesn't allow properties
                jsonOutput = jsonOutput.slice(0, -1);
                jsonOutput += (",{\"type\": \"Feature\",\"geometry\": { \"type\": \"Polygon\",\"coordinates\": [ ]}");

                jsonOutput += (",\"properties\":{\"id\":\"");
                jsonOutput += (id);
                jsonOutput += ("\",\"name\":\"");
                jsonOutput += (name);
                jsonOutput += ("\",\"description\":\"");
                jsonOutput += (description);
                jsonOutput += ("\",\"symbolID\":\"");
                jsonOutput += (symbolCode);
                jsonOutput += ("\",\"wasClipped\":\"");
                jsonOutput += (mSymbol.get_WasClipped()).toString();
                //jsonOutput += ("\"}}");

                jsonOutput += ("\"}}]}");
            } else if (format === WebRenderer.OUTPUT_FORMAT_GEOSVG) {
                let textColor = mSymbol.getTextColor() ? mSymbol.getTextColor().toHexString(false) : "";
                let backgroundColor = mSymbol.getTextBackgroundColor() ? mSymbol.getTextBackgroundColor().toHexString(false) : "";
                //returns an svg with a geoTL and geoBR value to use to place the canvas on the map
                jsonOutput = MultiPointHandlerSVG.GeoSVGize(id, name, description, symbolCode, shapes, modifiers, ipc, normalize, textColor, backgroundColor, mSymbol.get_WasClipped());
            }
        } catch (exc) {
            if (exc instanceof Error) {
                let st: string = JavaRendererUtilities.getStackTrace(exc);
                jsonOutput = "";
                jsonOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the MilStdSymbol " + symbolCode + ": " + "- ");
                jsonOutput += (exc.message + " - ");
                jsonOutput += (st);
                jsonOutput += ("\"}");

                ErrorLogger.LogException("MultiPointHandler", "RenderSymbol", exc);
            } else {
                throw exc;
            }
        }

        /*
        let debug: boolean = false;
        if (debug === true) {
            console.log("Symbol Code: " + symbolCode);
            console.log("Scale: " + scale);
            console.log("BBOX: " + bbox);
            if (controlPoints != null) {
                console.log("Geo Points: " + controlPoints);
            }
            if (tgl != null && tgl.get_Pixels() != null)//pixels != null
            {
                console.log("Pixel: " + tgl.get_Pixels().toString());
            }
            if (bbox != null) {
                console.log("geo bounds: " + bbox);
            }
            if (rect != null) {
                console.log("pixel bounds: " + rect.toString());
            }
            if (jsonOutput != null) {
                console.log(jsonOutput.toString());
            }
        }
            */

        ErrorLogger.LogMessage("MultiPointHandler", "RenderSymbol()", "exit RenderSymbol", LogLevel.FINER);
        return jsonOutput.toString();

    }

    /**
     *
     * @param id
     * @param name
     * @param description
     * @param symbolCode
     * @param controlPoints
     * @param scale
     * @param bbox
     * @param symbolModifiers
     * @param symbolAttributes
     * @return
     */
    public static RenderSymbolAsMilStdSymbol(id: string,
        name: string,
        description: string,
        symbolCode: string,
        controlPoints: string,
        scale: number,
        bbox: string,
        symbolModifiers: Map<string, string>,
        symbolAttributes: Map<string, string>): MilStdSymbol//,
    //ArrayList<ShapeInfo>shapes)
    {
        let mSymbol: MilStdSymbol;
        //console.log("MultiPointHandler.RenderSymbol()");
        let normalize: boolean = true;
        let controlLat: number = 0.0;
        let controlLong: number = 0.0;
        //String jsonContent = "";

        let rect: Rectangle;

        //for symbol & line fill
        let tgPoints: Array<POINT2>;

        let coordinates: string[] = controlPoints.split(" ");
        let tgl: TGLight = new TGLight();
        let shapes: Array<ShapeInfo>;//new ArrayList<ShapeInfo>();
        let modifiers: Array<ShapeInfo>;//new ArrayList<ShapeInfo>();
        //ArrayList<Point2D> pixels = new ArrayList<Point2D>();
        let geoCoords: Array<Point2D> = new Array<Point2D>();
        let len: int = coordinates.length;

        let ipc: IPointConversion;

        //Deutch moved section 6-29-11
        let left: number = 0.0;
        let right: number = 0.0;
        let top: number = 0.0;
        let bottom: number = 0.0;
        let temp: Point2D;
        let ptGeoUL: Point2D;
        let width: int = 0;
        let height: int = 0;
        let leftX: int = 0;
        let topY: int = 0;
        let bottomY: int = 0;
        let rightX: int = 0;
        let j: int = 0;
        let bboxCoords: Array<Point2D>;
        if (bbox != null && bbox !== "") {
            let bounds: string[];
            if (bbox.includes(" "))//trapezoid
            {
                bboxCoords = new Array<Point2D>();
                let x: double = 0;
                let y: double = 0;
                let coords: string[] = bbox.split(" ");
                let arrCoord: string[];
                for (let coord of coords) {
                    arrCoord = coord.split(",");
                    x = parseFloat(arrCoord[0]);
                    y = parseFloat(arrCoord[1]);
                    bboxCoords.push(new Point2D(x, y));
                }
                //use the upper left corner of the MBR containing geoCoords
                //to set the converter
                ptGeoUL = MultiPointHandler.getGeoUL(bboxCoords);
                left = ptGeoUL.getX();
                top = ptGeoUL.getY();
                ipc = new PointConverter(left, top, scale);
                let ptPixels: Point2D;
                let ptGeo: Point2D;
                let n: int = bboxCoords.length;
                //for (j = 0; j < bboxCoords.length; j++) 
                for (j = 0; j < n; j++) {
                    ptGeo = bboxCoords[j];
                    ptPixels = ipc.GeoToPixels(ptGeo);
                    x = ptPixels.getX();
                    y = ptPixels.getY();
                    if (x < 20) {
                        x = 20;
                    }
                    if (y < 20) {
                        y = 20;
                    }
                    ptPixels.setLocation(x, y);
                    //end section
                    bboxCoords[j] = ptPixels;
                }
            } else//rectangle
            {
                bounds = bbox.split(",");
                left = parseFloat(bounds[0]);
                right = parseFloat(bounds[2]);
                top = parseFloat(bounds[3]);
                bottom = parseFloat(bounds[1]);
                scale = MultiPointHandler.getReasonableScale(bbox, scale);
                ipc = new PointConverter(left, top, scale);
            }

            let pt2d: Point2D;
            if (bboxCoords == null) {
                pt2d = new Point2D(left, top);
                temp = ipc.GeoToPixels(pt2d);

                leftX = temp.getX() as int;
                topY = temp.getY() as int;

                pt2d = new Point2D(right, bottom);
                temp = ipc.GeoToPixels(pt2d);

                bottomY = temp.getY() as int;
                rightX = temp.getX() as int;
                //diagnostic clipping does not work for large scales
                //                if (scale > 10e6) {
                //                    //get widest point in the AOI
                //                    double midLat = 0;
                //                    if (bottom < 0 && top > 0) {
                //                        midLat = 0;
                //                    } else if (bottom < 0 && top < 0) {
                //                        midLat = top;
                //                    } else if (bottom > 0 && top > 0) {
                //                        midLat = bottom;
                //                    }
                //
                //                    temp = ipc.GeoToPixels(new Point2D(right, midLat));
                //                    rightX = (int) temp.getX();
                //                }
                //end section

                width = Math.abs(rightX - leftX) as int;
                height = Math.abs(bottomY - topY) as int;

                if (width === 0 || height === 0) {

                    rect = null;
                }

                else {

                    rect = new Rectangle(leftX, topY, width, height);
                }

            }
        } else {
            rect = null;
        }
        //end section

        //check for required points & parameters
        let symbolIsValid: string = MultiPointHandler.canRenderMultiPoint(symbolCode, symbolModifiers, len);
        if (symbolIsValid !== "true") {
            ErrorLogger.LogMessage("MultiPointHandler", "RenderSymbolAsMilStdSymbol", symbolIsValid, LogLevel.WARNING);
            return mSymbol;
        }

        if (MSLookup.getInstance().getMSLInfo(symbolCode).getDrawRule() != DrawRules.AREA10) // AREA10 can support infinite points
            len = Math.min(len, MSLookup.getInstance().getMSLInfo(symbolCode).getMaxPointCount());
        for (let i: int = 0; i < len; i++) {
            let coordPair: string[] = coordinates[i].split(",");
            let latitude: number = parseFloat(coordPair[1].trim());
            let longitude: number = parseFloat(coordPair[0].trim());
            geoCoords.push(new Point2D(longitude, latitude));
        }
        if (ipc == null) {
            let ptCoordsUL: Point2D = MultiPointHandler.getGeoUL(geoCoords);
            ipc = new PointConverter(ptCoordsUL.getX(), ptCoordsUL.getY(), scale);
        }
        //if (crossesIDL(geoCoords) == true) 
        //        if(Math.abs(right-left)>180)
        //        {
        //            normalize = true;
        //            ((PointConverter)ipc).set_normalize(true);
        //        } 
        //        else {
        //            normalize = false;
        //            ((PointConverter)ipc).set_normalize(false);
        //        }

        //seems to work ok at world view
        //        if (normalize) {
        //            NormalizeGECoordsToGEExtents(0, 360, geoCoords);
        //        }

        //M. Deutch 10-3-11
        //must shift the rect pixels to synch with the new ipc
        //the old ipc was in synch with the bbox, so rect x,y was always 0,0
        //the new ipc synchs with the upper left of the geocoords so the boox is shifted
        //and therefore the clipping rectangle must shift by the delta x,y between
        //the upper left corner of the original bbox and the upper left corner of the geocoords
        let geoCoords2: Array<Point2D> = new Array<Point2D>();
        geoCoords2.push(new Point2D(left, top));
        geoCoords2.push(new Point2D(right, bottom));

        //        if (normalize) {
        //            NormalizeGECoordsToGEExtents(0, 360, geoCoords2);
        //        }

        //disable clipping
        if (MultiPointHandler.ShouldClipSymbol(symbolCode) === false) {

            if (MultiPointHandler.crossesIDL(geoCoords) === false) {
                rect = null;
                bboxCoords = null;
            }
        }

        tgl.set_SymbolId(symbolCode);// "GFGPSLA---****X" AMBUSH symbol code
        tgl.set_Pixels(null);

        try {

            let fillColor: string;
            mSymbol = new MilStdSymbol(symbolCode, null, geoCoords, null);

            //            mSymbol.setUseDashArray(true);

            if (symbolModifiers != null || symbolAttributes != null) {
                MultiPointHandler.populateModifiers(symbolModifiers, symbolAttributes, mSymbol);
            } else {
                mSymbol.setFillColor(null);
            }

            if (mSymbol.getFillColor() != null) {
                let fc: Color = mSymbol.getFillColor();
                fillColor = RendererUtilities.colorToHexString(fc, false);

            }

            if (bboxCoords == null) {
                clsRenderer.renderWithPolylines(mSymbol, ipc, rect);
            } else {
                clsRenderer.renderWithPolylines(mSymbol, ipc, bboxCoords);
            }

            shapes = mSymbol.getSymbolShapes();
            modifiers = mSymbol.getModifierShapes();

            //convert points////////////////////////////////////////////////////
            let polylines: Array<Array<Point2D>>;
            let newPolylines: Array<Array<Point2D>>;
            let newLine: Array<Point2D>;
            for (let shape of shapes) {
                polylines = shape.getPolylines();
                //console.log("pixel polylines: " + polylines.toString());
                newPolylines = MultiPointHandler.ConvertPolylinePixelsToCoords(polylines, ipc, normalize);
                shape.setPolylines(newPolylines);
            }

            for (let label of modifiers) {
                let pixelCoord: Point2D = label.getModifierPosition();
                if (pixelCoord == null) {
                    pixelCoord = label.getGlyphPosition();
                }
                let geoCoord: Point2D = ipc.PixelsToGeo(pixelCoord);

                if (normalize) {
                    geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                }

                let latitude: double = geoCoord.getY();
                let longitude: double = geoCoord.getX();
                label.setModifierPosition(new Point2D(longitude, latitude));

            }

            ////////////////////////////////////////////////////////////////////
            mSymbol.setModifierShapes(modifiers);
            mSymbol.setSymbolShapes(shapes);

        } catch (exc) {
            if (exc instanceof Error) {
                console.log(exc.message);
                console.log("Symbol Code: " + symbolCode);
                console.log(exc.stack);
            } else {
                throw exc;
            }
        }

        /*
        let debug: boolean = false;
        if (debug === true) {
            console.log("Symbol Code: " + symbolCode);
            console.log("Scale: " + scale);
            console.log("BBOX: " + bbox);
            if (controlPoints != null) {
                console.log("Geo Points: " + controlPoints);
            }
            if (tgl != null && tgl.get_Pixels() != null)//pixels != null
            {
                //console.log("Pixel: " + pixels.toString());
                console.log("Pixel: " + tgl.get_Pixels().toString());
            }
            if (bbox != null) {
                console.log("geo bounds: " + bbox);
            }
            if (rect != null) {
                console.log("pixel bounds: " + rect.toString());
            }
        }
            */

        return mSymbol;

    }

    private static ConvertPolylinePixelsToCoords(polylines: Array<Array<Point2D>>, ipc: IPointConversion, normalize: boolean): Array<Array<Point2D>> {
        let newPolylines: Array<Array<Point2D>> = new Array<Array<Point2D>>();

        let latitude: double = 0;
        let longitude: double = 0;
        let newLine: Array<Point2D>;
        try {
            for (let line of polylines) {
                newLine = new Array<Point2D>();
                for (let pt of line) {
                    let geoCoord: Point2D = ipc.PixelsToGeo(pt);

                    if (normalize) {
                        geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                    }

                    latitude = geoCoord.getY();
                    longitude = geoCoord.getX();
                    newLine.push(new Point2D(longitude, latitude));
                }
                newPolylines.push(newLine);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                console.log(exc.message);
                console.log(exc.stack);
            } else {
                throw exc;
            }
        }
        return newPolylines;
    }

    /**
     * Multipoint Rendering on flat 2D maps
     *
     * @param id A unique ID for the symbol. only used in KML currently
     * @param name
     * @param description
     * @param symbolCode
     * @param controlPoints
     * @param pixelWidth pixel dimensions of the viewable map area
     * @param pixelHeight pixel dimensions of the viewable map area
     * @param bbox The viewable area of the map. Passed in the format of a
     * string "lowerLeftX,lowerLeftY,upperRightX,upperRightY." example:
     * "-50.4,23.6,-42.2,24.2"
     * @param symbolModifiers Modifier with multiple values should be comma
     * delimited
     * @param symbolAttributes
     * @param format An enumeration: 0 for KML, 1 for JSON.
     * @return A JSON or KML string representation of the graphic.
     */
    public static RenderSymbol2D(id: string,
        name: string,
        description: string,
        symbolCode: string,
        controlPoints: string,
        pixelWidth: int,
        pixelHeight: int,
        bbox: string,
        symbolModifiers: Map<string, string>,
        symbolAttributes: Map<string, string>,
        format: int): string {
        let jsonOutput: string = "";
        let jsonContent: string = "";

        let rect: Rectangle;

        let tgPoints: Array<POINT2>;

        let coordinates: string[] = controlPoints.split(" ");
        let tgl: TGLight = new TGLight();
        let shapes: Array<ShapeInfo> = new Array<ShapeInfo>();
        let modifiers: Array<ShapeInfo> = new Array<ShapeInfo>();
        let geoCoords: Array<Point2D> = new Array<Point2D>();
        let len: int = coordinates.length;
        let ipc: IPointConversion;

        //check for required points & parameters
        let symbolIsValid: string = MultiPointHandler.canRenderMultiPoint(symbolCode, symbolModifiers, len);
        if (symbolIsValid !== "true") {
            let ErrorOutput: string = "";
            ErrorOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the MilStdSymbol " + symbolCode + " - ID: " + id + " - ");
            ErrorOutput += symbolIsValid; //reason for error
            ErrorOutput += ("\"}");
            ErrorLogger.LogMessage("MultiPointHandler", "RenderSymbol2D", symbolIsValid, LogLevel.FINE);
            return ErrorOutput;
        }

        let left: number = 0.0;
        let right: number = 0.0;
        let top: number = 0.0;
        let bottom: number = 0.0;
        if (bbox != null && bbox !== "") {
            let bounds: string[] = bbox.split(",");

            left = parseFloat(bounds[0]);
            right = parseFloat(bounds[2]);
            top = parseFloat(bounds[3]);
            bottom = parseFloat(bounds[1]);

            ipc = new PointConversion(pixelWidth, pixelHeight, top, left, bottom, right);
        } else {
            console.log("Bad bbox value: " + bbox);
            console.log("bbox is viewable area of the map.  Passed in the format of a string \"lowerLeftX,lowerLeftY,upperRightX,upperRightY.\" example: \"-50.4,23.6,-42.2,24.2\"");
            return "ERROR - Bad bbox value: " + bbox;
        }
        //end section

        //get coordinates
        if (MSLookup.getInstance().getMSLInfo(symbolCode).getDrawRule() != DrawRules.AREA10) // AREA10 can support infinite points
            len = Math.min(len, MSLookup.getInstance().getMSLInfo(symbolCode).getMaxPointCount());
        for (let i: int = 0; i < len; i++) {
            let coordPair: string[] = coordinates[i].split(",");
            let latitude: number = parseFloat(coordPair[1].trim());
            let longitude: number = parseFloat(coordPair[0].trim());
            geoCoords.push(new Point2D(longitude, latitude));
        }

        try {
            let mSymbol: MilStdSymbol = new MilStdSymbol(symbolCode, null, geoCoords, null);

            if (format == WebRenderer.OUTPUT_FORMAT_GEOSVG) {
                // Use dash array and hatch pattern fill for SVG output
                symbolAttributes.set(MilStdAttributes.UseDashArray, 'true')
                symbolAttributes.set(MilStdAttributes.UsePatternFill, "true")
            }

            if (symbolModifiers != null && symbolModifiers.size !== 0) {
                MultiPointHandler.populateModifiers(symbolModifiers, symbolAttributes, mSymbol);
            } else {
                mSymbol.setFillColor(null);
            }

            //build clipping bounds
            let temp: Point2D;
            let leftX: int = 0;
            let topY: int = 0;
            let bottomY: int = 0;
            let rightX: int = 0;
            let width: int = 0;
            let height: int = 0;
            let normalize: boolean = false;
            //            if(Math.abs(right-left)>180)
            //            {
            //                ((PointConversion)ipc).set_normalize(true);                
            //                normalize=true;
            //            }
            //            else      
            //            {
            //                ((PointConversion)ipc).set_normalize(false);
            //            }
            if (MultiPointHandler.ShouldClipSymbol(symbolCode) || MultiPointHandler.crossesIDL(geoCoords)) {
                let lt: Point2D = new Point2D(left, top);
                //temp = ipc.GeoToPixels(new Point2D(left, top));
                temp = ipc.GeoToPixels(lt);
                leftX = temp.getX() as int;
                topY = temp.getY() as int;

                let rb: Point2D = new Point2D(right, bottom);
                //temp = ipc.GeoToPixels(new Point2D(right, bottom));
                temp = ipc.GeoToPixels(rb);
                bottomY = temp.getY() as int;
                rightX = temp.getX() as int;
                //////////////////

                width = Math.abs(rightX - leftX) as int;
                height = Math.abs(bottomY - topY) as int;

                rect = new Rectangle(leftX, topY, width, height);
            }

            //new interface
            //IMultiPointRenderer mpr = MultiPointRenderer.getInstance();
            clsRenderer.renderWithPolylines(mSymbol, ipc, rect);
            shapes = mSymbol.getSymbolShapes();
            modifiers = mSymbol.getModifierShapes();

            //boolean normalize = false;

            if (format === WebRenderer.OUTPUT_FORMAT_JSON) {
                jsonOutput += ("{\"type\":\"symbol\",");
                //jsonContent = JSONize(shapes, modifiers, ipc, normalize);
                jsonOutput += (jsonContent);
                jsonOutput += ("}");
            } else if (format === WebRenderer.OUTPUT_FORMAT_GEOJSON) {
                jsonOutput += ("{\"type\":\"FeatureCollection\",\"features\":");
                jsonContent = MultiPointHandler.GeoJSONize(shapes, modifiers, ipc, normalize, mSymbol.getTextColor(), mSymbol.getTextBackgroundColor());
                jsonOutput += (jsonContent);

                //moving meta data properties to the last feature with no coords as feature collection doesn't allow properties
                jsonOutput = jsonOutput.slice(0, -1);
                jsonOutput += (",{\"type\": \"Feature\",\"geometry\": { \"type\": \"Polygon\",\"coordinates\": [ ]}");

                jsonOutput += (",\"properties\":{\"id\":\"");
                jsonOutput += (id);
                jsonOutput += ("\",\"name\":\"");
                jsonOutput += (name);
                jsonOutput += ("\",\"description\":\"");
                jsonOutput += (description);
                jsonOutput += ("\",\"symbolID\":\"");
                jsonOutput += (symbolCode);
                jsonOutput += ("\",\"wasClipped\":\"");
                jsonOutput += (mSymbol.get_WasClipped()).toString();
                //jsonOutput += ("\"}}");

                jsonOutput += ("\"}}]}");

            } else if (format === WebRenderer.OUTPUT_FORMAT_GEOSVG) {
                let textColor = mSymbol.getTextColor() ? mSymbol.getTextColor().toHexString(false) : "";
                let backgroundColor = mSymbol.getTextBackgroundColor() ? mSymbol.getTextBackgroundColor().toHexString(false) : "";
                //returns an svg with a geoTL and geoBR value to use to place the canvas on the map
                jsonOutput = MultiPointHandlerSVG.GeoSVGize(id, name, description, symbolCode, shapes, modifiers, ipc, normalize, textColor, backgroundColor, mSymbol.get_WasClipped());
            }
        } catch (exc) {
            if (exc instanceof Error) {
                jsonOutput = "";
                jsonOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the MilStdSymbol " + symbolCode + ": " + "- ");
                jsonOutput += (exc.message + " - ");
                jsonOutput += (ErrorLogger.getStackTrace(exc));
                jsonOutput += ("\"}");
            } else {
                throw exc;
            }
        }

        /*
        let debug: boolean = false;
        if (debug === true) {
            console.log("Symbol Code: " + symbolCode);
            console.log("BBOX: " + bbox);
            if (controlPoints != null) {
                console.log("Geo Points: " + controlPoints);
            }
            if (tgl != null && tgl.get_Pixels() != null)//pixels != null
            {
                //console.log("Pixel: " + pixels.toString());
                console.log("Pixel: " + tgl.get_Pixels().toString());
            }
            if (bbox != null) {
                console.log("geo bounds: " + bbox);
            }
            if (rect != null) {
                console.log("pixel bounds: " + rect.toString());
            }
            if (jsonOutput != null) {
                console.log(jsonOutput.toString());
            }
        }
            */

        return jsonOutput.toString();

    }

    /**
     * For Mike Deutch testing
     *
     * @param id
     * @param name
     * @param description
     * @param symbolCode
     * @param controlPoints
     * @param pixelWidth
     * @param pixelHeight
     * @param bbox
     * @param symbolModifiers
     * @param shapes
     * @param modifiers
     * @param format
     * @return
     * @deprecated
     */
    public static RenderSymbol2DX(id: string,
        name: string,
        description: string,
        symbolCode: string,
        controlPoints: string,
        pixelWidth: int,
        pixelHeight: int,
        bbox: string,
        symbolModifiers: Map<string, string>,
        symbolAttributes: Map<string, string>,
        shapes: Array<ShapeInfo>,
        modifiers: Array<ShapeInfo>,
        format: int): string//,
    //ArrayList<ShapeInfo>shapes)
    {

        let jsonOutput: string = "";
        let jsonContent: string = "";

        let rect: Rectangle;

        let coordinates: string[] = controlPoints.split(" ");
        let tgl: TGLight = new TGLight();
        let geoCoords: Array<Point2D> = new Array<Point2D>();
        let ipc: IPointConversion;

        let left: number = 0.0;
        let right: number = 0.0;
        let top: number = 0.0;
        let bottom: number = 0.0;
        if (bbox != null && bbox !== "") {
            let bounds: string[] = bbox.split(",");

            left = parseFloat(bounds[0]);
            right = parseFloat(bounds[2]);
            top = parseFloat(bounds[3]);
            bottom = parseFloat(bounds[1]);

            ipc = new PointConversion(pixelWidth, pixelHeight, top, left, bottom, right);
        } else {
            console.log("Bad bbox value: " + bbox);
            console.log("bbox is viewable area of the map.  Passed in the format of a string \"lowerLeftX,lowerLeftY,upperRightX,upperRightY.\" example: \"-50.4,23.6,-42.2,24.2\"");
            return "ERROR - Bad bbox value: " + bbox;
        }
        //end section

        //get coordinates
        let len: int = coordinates.length;
        for (let i: int = 0; i < len; i++) {
            let coordPair: string[] = coordinates[i].split(",");
            let latitude: number = parseFloat(coordPair[1].trim());
            let longitude: number = parseFloat(coordPair[0].trim());
            geoCoords.push(new Point2D(longitude, latitude));
        }

        try {
            let mSymbol: MilStdSymbol = new MilStdSymbol(symbolCode, null, geoCoords, null);

            if (symbolModifiers != null && symbolModifiers.size !== 0) {
                MultiPointHandler.populateModifiers(symbolModifiers, symbolAttributes, mSymbol);
            } else {
                mSymbol.setFillColor(null);
            }

            clsRenderer.renderWithPolylines(mSymbol, ipc, rect);
            shapes = mSymbol.getSymbolShapes();
            modifiers = mSymbol.getModifierShapes();

            let normalize: boolean = false;

            if (format === WebRenderer.OUTPUT_FORMAT_JSON) {
                jsonOutput += ("{\"type\":\"symbol\",");
                jsonContent = MultiPointHandler.JSONize(shapes, modifiers, ipc, false, normalize);
                jsonOutput += (jsonContent);
                jsonOutput += ("}");
            } 
        } catch (exc) {
            if (exc instanceof Error) {
                jsonOutput = "";
                jsonOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the MilStdSymbol " + symbolCode + ": " + "- ");
                jsonOutput += (exc.message + " - ");
                jsonOutput += ("\"}");
            } else {
                throw exc;
            }
        }

        let debug: boolean = true;
        if (debug === true) {
            console.log("Symbol Code: " + symbolCode);
            console.log("BBOX: " + bbox);
            if (controlPoints != null) {
                console.log("Geo Points: " + controlPoints);
            }
            if (tgl != null && tgl.get_Pixels() != null)//pixels != null
            {
                //console.log("Pixel: " + pixels.toString());
                console.log("Pixel: " + tgl.get_Pixels().toString());
            }
            if (bbox != null) {
                console.log("geo bounds: " + bbox);
            }
            if (rect != null) {
                console.log("pixel bounds: " + rect.toString());
            }
            if (jsonOutput != null) {
                console.log(jsonOutput.toString());
            }
        }
        return jsonOutput.toString();

    }

    private static MilStdSymbolToSymbolInfo(symbol: MilStdSymbol): SymbolInfo {
        let si: SymbolInfo;

        let tiList: Array<TextInfo> = new Array<TextInfo>();
        let liList: Array<LineInfo> = new Array<LineInfo>();

        let tiTemp: TextInfo;
        let liTemp: LineInfo;
        let siTemp: ShapeInfo;

        let lines: Array<ShapeInfo> = symbol.getSymbolShapes();
        let modifiers: Array<ShapeInfo> = symbol.getModifierShapes();

        let lineCount: int = lines.length;
        let modifierCount: int = modifiers.length;
        for (let i: int = 0; i < lineCount; i++) {
            siTemp = lines[i];
            if (siTemp.getPolylines() != null) {
                liTemp = new LineInfo();
                liTemp.setFillColor(siTemp.getFillColor());
                liTemp.setLineColor(siTemp.getLineColor());
                liTemp.setPolylines(siTemp.getPolylines());
                liTemp.setStroke(siTemp.getStroke());
                liList.push(liTemp);
            }
        }

        for (let j: int = 0; j < modifierCount; j++) {
            tiTemp = new TextInfo();
            siTemp = modifiers[j];
            if (siTemp.getModifierString() != null) {
                tiTemp.setModifierString(siTemp.getModifierString());
                tiTemp.setModifierStringPosition(siTemp.getModifierPosition());
                tiTemp.setModifierStringAngle(siTemp.getModifierAngle());
                tiList.push(tiTemp);
            }
        }
        si = new SymbolInfo(tiList, liList);
        return si;
    }

    /**
     * Populates a symbol with the modifiers from a JSON string. This function
     * will overwrite any previously populated modifier data.
     *
     *
     *
     * @param symbol An existing MilStdSymbol
     * @return
     */
    private static populateModifiers(saModifiers: Map<string, string>, saAttributes: Map<string, string>, symbol: MilStdSymbol): boolean {
        let modifiers: Map<string, string> = new Map();
        let attributes: Map<string, string> = saAttributes;

        // Stores array graphic modifiers for MilStdSymbol;
        let altitudes: Array<number> = null;
        let azimuths: Array<number> = null;
        let distances: Array<number> = null;

        // Stores colors for symbol.
        let fillColor: string = null;
        let lineColor: string = null;
        let textColor: string = null;
        let textBackgroundColor: string = null;

        let lineWidth: int = 0;
        let altMode: string = "";
        let useDashArray: boolean = symbol.getUseDashArray();
        let usePatternFill: boolean = symbol.getUseFillPattern();
        let patternFillType: int = 0;
        let hideOptionalLabels: boolean = false;
        let distanceUnit: DistanceUnit;
        let altitudeUnit: DistanceUnit;
        let pixelSize: int = 50;
        let keepUnitRatio: boolean = true;

        try {

            // The following attirubtes are labels.  All of them
            // are strings and can be added on the creation of the
            // MilStdSymbol by adding to a Map and passing in the
            // modifiers parameter.
            if (saModifiers != null) {
                if (saModifiers.has(Modifiers.C_QUANTITY)) {
                    modifiers.set(Modifiers.C_QUANTITY, saModifiers.get(Modifiers.C_QUANTITY));
                }

                if (saModifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                    modifiers.set(Modifiers.H_ADDITIONAL_INFO_1, saModifiers.get(Modifiers.H_ADDITIONAL_INFO_1));
                }

                if (saModifiers.has(Modifiers.H1_ADDITIONAL_INFO_2)) {
                    modifiers.set(Modifiers.H1_ADDITIONAL_INFO_2, saModifiers.get(Modifiers.H1_ADDITIONAL_INFO_2));
                }

                if (saModifiers.has(Modifiers.H2_ADDITIONAL_INFO_3)) {
                    modifiers.set(Modifiers.H2_ADDITIONAL_INFO_3, saModifiers.get(Modifiers.H2_ADDITIONAL_INFO_3));
                }

                if (saModifiers.has(Modifiers.N_HOSTILE)) {
                    if (saModifiers.get(Modifiers.N_HOSTILE) == null) {
                        modifiers.set(Modifiers.N_HOSTILE, "");
                    } else {
                        modifiers.set(Modifiers.N_HOSTILE, saModifiers.get(Modifiers.N_HOSTILE));
                    }
                }

                if (saModifiers.has(Modifiers.Q_DIRECTION_OF_MOVEMENT)) {
                    modifiers.set(Modifiers.Q_DIRECTION_OF_MOVEMENT, saModifiers.get(Modifiers.Q_DIRECTION_OF_MOVEMENT));
                }

                if (saModifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                    modifiers.set(Modifiers.T_UNIQUE_DESIGNATION_1, saModifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1));
                }

                if (saModifiers.has(Modifiers.T1_UNIQUE_DESIGNATION_2)) {
                    modifiers.set(Modifiers.T1_UNIQUE_DESIGNATION_2, saModifiers.get(Modifiers.T1_UNIQUE_DESIGNATION_2));
                }

                if (saModifiers.has(Modifiers.V_EQUIP_TYPE)) {
                    modifiers.set(Modifiers.V_EQUIP_TYPE, saModifiers.get(Modifiers.V_EQUIP_TYPE));
                }

                if (saModifiers.has(Modifiers.AS_COUNTRY)) {
                    modifiers.set(Modifiers.AS_COUNTRY, saModifiers.get(Modifiers.AS_COUNTRY));
                } else {
                    if (SymbolID.getCountryCode(symbol.getSymbolID()) > 0 && GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbol.getSymbolID())) !== "") {
                        modifiers.set(Modifiers.AS_COUNTRY, GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbol.getSymbolID())));
                    }
                }


                if (saModifiers.has(Modifiers.AP_TARGET_NUMBER)) {
                    modifiers.set(Modifiers.AP_TARGET_NUMBER, saModifiers.get(Modifiers.AP_TARGET_NUMBER));
                }

                if (saModifiers.has(Modifiers.W_DTG_1)) {
                    modifiers.set(Modifiers.W_DTG_1, saModifiers.get(Modifiers.W_DTG_1));
                }

                if (saModifiers.has(Modifiers.W1_DTG_2)) {
                    modifiers.set(Modifiers.W1_DTG_2, saModifiers.get(Modifiers.W1_DTG_2));
                }

                if (saModifiers.has(Modifiers.Y_LOCATION)) {
                    modifiers.set(Modifiers.Y_LOCATION, saModifiers.get(Modifiers.Y_LOCATION));
                }

                //Required multipoint modifier arrays
                if (saModifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                    altitudes = new Array<number>();
                    let arrAltitudes: string[] = saModifiers.get(Modifiers.X_ALTITUDE_DEPTH).split(",");
                    for (let x of arrAltitudes) {
                        if (x !== "") {
                            altitudes.push(parseFloat(x));
                        }
                    }
                }

                if (saModifiers.has(Modifiers.AM_DISTANCE)) {
                    distances = new Array<number>();
                    let arrDistances: string[] = saModifiers.get(Modifiers.AM_DISTANCE).split(",");
                    for (let am of arrDistances) {
                        if (am !== "") {
                            distances.push(parseFloat(am));
                        }
                    }
                }

                if (saModifiers.has(Modifiers.AN_AZIMUTH)) {
                    azimuths = new Array<number>();
                    let arrAzimuths: string[] = saModifiers.get(Modifiers.AN_AZIMUTH).split(",");
                    for (let an of arrAzimuths) {
                        if (an !== "") {
                            azimuths.push(parseFloat(an));
                        }
                    }
                }
            }
            if (saAttributes != null) {
                // These properties are ints, not labels, they are colors.//////////////////
                if (saAttributes.has(MilStdAttributes.FillColor)) {
                    fillColor = String(saAttributes.get(MilStdAttributes.FillColor));
                }

                if (saAttributes.has(MilStdAttributes.LineColor)) {
                    lineColor = String(saAttributes.get(MilStdAttributes.LineColor));
                }

                if (saAttributes.has(MilStdAttributes.LineWidth)) {
                    lineWidth = parseInt(saAttributes.get(MilStdAttributes.LineWidth));
                }

                if (saAttributes.has(MilStdAttributes.TextColor)) {
                    textColor = String(saAttributes.get(MilStdAttributes.TextColor));
                }

                if (saAttributes.has(MilStdAttributes.TextBackgroundColor)) {
                    textBackgroundColor = String(saAttributes.get(MilStdAttributes.TextBackgroundColor));
                }

                if (saAttributes.has(MilStdAttributes.AltitudeMode)) {
                    altMode = saAttributes.get(MilStdAttributes.AltitudeMode);
                }

                if (saAttributes.has(MilStdAttributes.UseDashArray)) {
                    useDashArray = saAttributes.get(MilStdAttributes.UseDashArray).toLowerCase() === 'true';
                }

                if (saAttributes.has(MilStdAttributes.UsePatternFill)) {
                    usePatternFill = saAttributes.get(MilStdAttributes.UsePatternFill).toLowerCase() === 'true';
                }

                if (saAttributes.has(MilStdAttributes.PatternFillType)) {
                    patternFillType = parseInt((saAttributes.get(MilStdAttributes.PatternFillType)));
                }

                if (saAttributes.has(MilStdAttributes.HideOptionalLabels)) {
                    hideOptionalLabels = saAttributes.get(MilStdAttributes.HideOptionalLabels).toLowerCase() === 'true';
                }

                if (saAttributes.has(MilStdAttributes.AltitudeUnits)) {
                    altitudeUnit = DistanceUnit.parse(saAttributes.get(MilStdAttributes.AltitudeUnits));
                }

                if (saAttributes.has(MilStdAttributes.DistanceUnits)) {
                    distanceUnit = DistanceUnit.parse(saAttributes.get(MilStdAttributes.DistanceUnits));
                }

                if (saAttributes.has(MilStdAttributes.PixelSize)) {
                    pixelSize = parseInt(saAttributes.get(MilStdAttributes.PixelSize));
                    symbol.setUnitSize(pixelSize);
                }

                if (saAttributes.has(MilStdAttributes.KeepUnitRatio)) {
                    keepUnitRatio = saAttributes.get(MilStdAttributes.KeepUnitRatio).toLowerCase() === 'true';
                    symbol.setKeepUnitRatio(keepUnitRatio);
                }
            }

            symbol.setModifierMap(modifiers);

            if (fillColor != null && fillColor !== "") {
                symbol.setFillColor(RendererUtilities.getColorFromHexString(fillColor));
            }

            if (lineColor != null && lineColor !== "") {
                symbol.setLineColor(RendererUtilities.getColorFromHexString(lineColor));
                symbol.setTextColor(RendererUtilities.getColorFromHexString(lineColor));
            }
            else {
                if (symbol.getLineColor() == null) {

                    symbol.setLineColor(Color.black);
                }

            }


            if (lineWidth > 0) {
                symbol.setLineWidth(lineWidth);
            }

            if (textColor != null && textColor !== "") {
                symbol.setTextColor(RendererUtilities.getColorFromHexString(textColor));
            } else {
                if (symbol.getTextColor() == null) {

                    symbol.setTextColor(Color.black);
                }

            }


            if (textBackgroundColor != null && textBackgroundColor !== "") {
                symbol.setTextBackgroundColor(RendererUtilities.getColorFromHexString(textBackgroundColor));
            }

            if (altMode != null) {
                symbol.setAltitudeMode(altMode);
            }

            symbol.setUseDashArray(useDashArray);
            symbol.setUseFillPattern(usePatternFill);
            symbol.setHideOptionalLabels(hideOptionalLabels);
            symbol.setAltitudeUnit(altitudeUnit);
            symbol.setDistanceUnit(distanceUnit);

            // Check grpahic modifiers variables.  If we set earlier, populate
            // the fields, otherwise, ignore.
            if (altitudes != null) {
                symbol.setModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH, altitudes);
            }
            if (distances != null) {
                symbol.setModifiers_AM_AN_X(Modifiers.AM_DISTANCE, distances);
            }

            if (azimuths != null) {
                symbol.setModifiers_AM_AN_X(Modifiers.AN_AZIMUTH, azimuths);
            }

            //Check if sector range fan has required min range
            if (SymbolUtilities.getBasicSymbolID(symbol.getSymbolID()) === "25242200") {
                if (symbol.getModifiers_AM_AN_X(Modifiers.AN_AZIMUTH) != null
                    && symbol.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE) != null) {
                    let anCount: int = symbol.getModifiers_AM_AN_X(Modifiers.AN_AZIMUTH).length;
                    let amCount: int = symbol.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE).length;
                    let am: Array<number>;
                    if (amCount < ((anCount / 2) + 1)) {
                        am = symbol.getModifiers_AM_AN_X(Modifiers.AM_DISTANCE);
                        if (am[0] !== 0.0) {
                            am.splice(0, 0, 0.0);
                        }
                    }
                }
            }
        } catch (exc2) {
            if (exc2 instanceof Error) {
                ErrorLogger.LogException("MPH.populateModifiers", "PopulateModifiers", exc2);
            } else {
                throw exc2;
            }
        }
        return true;

    }

    private static KMLize(id: string, name: string,
        description: string,
        symbolCode: string,
        shapes: Array<ShapeInfo>,
        modifiers: Array<ShapeInfo>,
        ipc: IPointConversion,
        normalize: boolean, textColor: Color): string {

        let kml: string = "";

        let tempModifier: ShapeInfo;

        let cdataStart: string = "<![CDATA[";
        let cdataEnd: string = "]]>";

        let len: int = shapes.length;
        kml += ("<Folder id=\"" + id + "\">");
        kml += ("<name>" + cdataStart + name + cdataEnd + "</name>");
        kml += ("<visibility>1</visibility>");
        for (let i: int = 0; i < len; i++) {

            let shapesToAdd: string = MultiPointHandler.ShapeToKMLString(name, description, symbolCode, shapes[i], ipc, normalize);
            kml += (shapesToAdd);
        }

        let len2: int = modifiers.length;

        for (let j: int = 0; j < len2; j++) {

            tempModifier = modifiers[j];

            //if(geMap)//if using google earth
            //assume kml text is going to be centered
            //AdjustModifierPointToCenter(tempModifier);

            let labelsToAdd: string = MultiPointHandler.LabelToKMLString(tempModifier, ipc, normalize, textColor);
            kml += (labelsToAdd);
        }

        kml += ("</Folder>");
        return kml.toString();
    }

    /**
     * 
     * @param shapes
     * @param modifiers
     * @param ipc
     * @param geMap
     * @param normalize
     * @return 
     * @deprecated Use GeoJSONize()
     */
    private static JSONize(shapes: Array<ShapeInfo>, modifiers: Array<ShapeInfo>, ipc: IPointConversion, geMap: boolean, normalize: boolean): string {
        let polygons: string = "";
        let lines: string = "";
        let labels: string = "";
        let jstr: string = "";
        let tempModifier: ShapeInfo;

        let len: int = shapes.length;
        for (let i: int = 0; i < len; i++) {
            if (jstr.length > 0) {
                jstr += ",";
            }
            let shapesToAdd: string = MultiPointHandler.ShapeToJSONString(shapes[i], ipc, geMap, normalize);
            if (shapesToAdd.length > 0) {
                if (shapesToAdd.startsWith("line", 2)) {
                    if (lines.length > 0) {
                        lines += ",";
                    }

                    lines += shapesToAdd;
                } else {
                    if (shapesToAdd.startsWith("polygon", 2)) {
                        if (polygons.length > 0) {
                            polygons += ",";
                        }

                        polygons += shapesToAdd;
                    }
                }

            }
        }

        jstr += "\"polygons\": [" + polygons + "],"
            + "\"lines\": [" + lines + "],";
        let len2: int = modifiers.length;
        labels = "";
        for (let j: int = 0; j < len2; j++) {
            tempModifier = modifiers[j];
            if (geMap) {
                MultiPointHandler.AdjustModifierPointToCenter(tempModifier);
            }
            let labelsToAdd: string = MultiPointHandler.LabelToJSONString(tempModifier, ipc, normalize);
            if (labelsToAdd.length > 0) {
                if (labels.length > 0) {
                    labels += ",";
                }

                labels += labelsToAdd;

            }
        }
        jstr += "\"labels\": [" + labels + "]";
        return jstr;
    }

    private static getIdealTextBackgroundColor(fgColor: Color): Color {
        //ErrorLogger.LogMessage("SymbolDraw","getIdealtextBGColor", "in function", Level.SEVERE);
        try {
            //an array of three elements containing the
            //hue, saturation, and brightness (in that order),
            //of the color with the indicated red, green, and blue components/
            let hsbvals: double[] = new Array<number>(3);

            if (fgColor != null) {/*
                 Color.RGBtoHSB(fgColor.getRed(), fgColor.getGreen(), fgColor.getBlue(), hsbvals);

                 if(hsbvals != null)
                 {
                 //ErrorLogger.LogMessage("SymbolDraw","getIdealtextBGColor", "length: " + hsbvals.length.toString());
                 //ErrorLogger.LogMessage("SymbolDraw","getIdealtextBGColor", "H: " + String.valueOf(hsbvals[0]) + " S: " + String.valueOf(hsbvals[1]) + " B: " + String.valueOf(hsbvals[2]),Level.SEVERE);
                 if(hsbvals[2] > 0.6)
                 return Color.BLACK;
                 else
                 return Color.WHITE;
                 }*/

                let nThreshold: int = RendererSettings.getInstance().getTextBackgroundAutoColorThreshold();//160;
                let bgDelta: int = Math.trunc((fgColor.getRed() * 0.299) + (fgColor.getGreen() * 0.587) + (fgColor.getBlue() * 0.114));
                //ErrorLogger.LogMessage("bgDelta: " + String.valueOf(255-bgDelta));
                //if less than threshold, black, otherwise white.
                //return (255 - bgDelta < nThreshold) ? Color.BLACK : Color.WHITE;//new Color(0, 0, 0, fgColor.getAlpha())
                return (255 - bgDelta < nThreshold) ? new Color(0, 0, 0, fgColor.getAlpha()) : new Color(255, 255, 255, fgColor.getAlpha());
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("SymbolDraw", "getIdealtextBGColor", exc);
            } else {
                throw exc;
            }
        }
        return Color.WHITE;
    }

    private static LabelToGeoJSONString(shapeInfo: ShapeInfo, ipc: IPointConversion, normalize: boolean, textColor: Color, textBackgroundColor: Color): string {

        let JSONed: string = "";
        let properties: string = "";
        let geometry: string = "";

        let outlineColor: Color = MultiPointHandler.getIdealTextBackgroundColor(textColor);
        if (textBackgroundColor != null) {
            outlineColor = textBackgroundColor;
        }

        //AffineTransform at = shapeInfo.getAffineTransform();
        //Point2D coord = (Point2D)new Point2D(at.getTranslateX(), at.getTranslateY());
        //Point2D coord = (Point2D) new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY());
        let coord: Point2D = new Point2D(shapeInfo.getModifierPosition().getX(), shapeInfo.getModifierPosition().getY()) as Point2D;
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        //M. Deutch 9-27-11
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
        let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
        let angle: double = shapeInfo.getModifierAngle();
        coord.setLocation(longitude, latitude);

        //diagnostic M. Deutch 10-18-11
        shapeInfo.setGlyphPosition(coord);

        let text: string = shapeInfo.getModifierString();

        let justify: int = shapeInfo.getTextJustify();
        let strJustify: string = "left";
        if (justify === 0) {
            strJustify = "left";
        } else {
            if (justify === 1) {
                strJustify = "center";
            } else {
                if (justify === 2) {
                    strJustify = "right";
                }
            }

        }


        let RS: RendererSettings = RendererSettings.getInstance();

        if (text != null && text !== "") {

            JSONed += ("{\"type\":\"Feature\",\"properties\":{\"label\":\"");
            JSONed += (text);
            JSONed += ("\",\"pointRadius\":0,\"fontColor\":\"");
            JSONed += (RendererUtilities.colorToHexString(textColor, false));
            JSONed += ("\",\"fontSize\":\"");
            JSONed += (RS.getMPLabelFont().getSize().toString() + "pt\"");
            JSONed += (",\"fontFamily\":\"");
            JSONed += (RS.getMPLabelFont().getName());
            JSONed += (", sans-serif");

            if (RS.getMPLabelFont().getType() === Font.BOLD) {
                JSONed += ("\",\"fontWeight\":\"bold\"");
            } else {
                JSONed += ("\",\"fontWeight\":\"normal\"");
            }

            //JSONed += (",\"labelAlign\":\"lm\"");
            JSONed += (",\"labelAlign\":\"");
            JSONed += (strJustify);
            JSONed += ("\",\"labelBaseline\":\"alphabetic");
            JSONed += ("\",\"labelXOffset\":0");
            JSONed += (",\"labelYOffset\":0");
            JSONed += (",\"labelOutlineColor\":\"");
            JSONed += (RendererUtilities.colorToHexString(outlineColor, false));
            JSONed += ("\",\"labelOutlineWidth\":");
            JSONed += ("4");
            JSONed += (",\"rotation\":");
            JSONed += (angle);
            JSONed += (",\"angle\":");
            JSONed += (angle);
            JSONed += ("},");

            JSONed += ("\"geometry\":{\"type\":\"Point\",\"coordinates\":[");
            JSONed += (longitude);
            JSONed += (",");
            JSONed += (latitude);
            JSONed += ("]");
            JSONed += ("}}");

        } else {
            return "";
        }

        return JSONed.toString();
    }

    private static ShapeToGeoJSONString(shapeInfo: ShapeInfo, ipc: IPointConversion, normalize: boolean): string {
        let JSONed: string = "";
        let properties: string = "";
        let geometry: string = "";
        let geometryType: string;
        let sda: string;
        /*
         NOTE: Google Earth / KML colors are backwards.
         They are ordered Alpha,Blue,Green,Red, not Red,Green,Blue,Aplha like the rest of the world
         * */
        let lineColor: Color = shapeInfo.getLineColor();
        let fillColor: Color = shapeInfo.getFillColor();

        if (shapeInfo.getShapeType() === ShapeInfo.SHAPE_TYPE_FILL || fillColor != null || shapeInfo.getPatternFillImage() != null) {
            geometryType = "\"Polygon\"";
        } else //if(shapeInfo.getShapeType() == ShapeInfo.SHAPE_TYPE_POLYLINE)
        {
            geometryType = "\"MultiLineString\"";
        }

        let stroke: BasicStroke;
        stroke = shapeInfo.getStroke();
        let lineWidth: int = 4;

        if (stroke != null) {
            lineWidth = Math.trunc(stroke.getLineWidth());
            //lineWidth++;
            //console.log("lineWidth: " + lineWidth.toString());
        }

        //generate JSON properties for feature
        properties += ("\"properties\":{");
        properties += ("\"label\":\"\",");
        if (lineColor != null) {
            properties += ("\"strokeColor\":\"" + RendererUtilities.colorToHexString(lineColor, false) + "\",");
            properties += ("\"lineOpacity\":" + (lineColor.getAlpha() / 255).toString() + ",");
        }
        if (fillColor != null) {
            properties += ("\"fillColor\":\"" + RendererUtilities.colorToHexString(fillColor, false) + "\",");
            properties += ("\"fillOpacity\":" + (fillColor.getAlpha() / 255).toString() + ",");
        }
        if (shapeInfo.getPatternFillImage() != null) {
            properties += ("\"fillPattern\":\"" + shapeInfo.getPatternFillImage() + "\",");
        }
        if (stroke.getDashArray() != null) {
            sda = "\"strokeDasharray\":[" + stroke.getDashArray().toString() + "],";
            properties += (sda);
        }


        let lineCap: int = stroke.getEndCap();
        properties += ("\"lineCap\":" + lineCap + ",");

        let strokeWidth: string = lineWidth.toString();
        properties += ("\"strokeWidth\":" + strokeWidth + ",");
        properties += ("\"strokeWeight\":" + strokeWidth + "");
        properties += ("},");


        properties += ("\"style\":{");
        if (lineColor != null) {
            properties += ("\"stroke\":\"" + RendererUtilities.colorToHexString(lineColor, false) + "\",");
            properties += ("\"line-opacity\":" + (lineColor.getAlpha() / 255).toString() + ",");
        }
        if (fillColor != null) {
            properties += ("\"fill\":\"" + RendererUtilities.colorToHexString(fillColor, false) + "\",");
            properties += ("\"fill-opacity\":" + (fillColor.getAlpha() / 255).toString() + ",");
        }
        if (stroke.getDashArray() != null) {
            let da: number[] = stroke.getDashArray();
            sda = da[0].toString();
            if (da.length > 1) {
                for (let i: int = 1; i < da.length; i++) {
                    sda = sda + " " + da[i].toString();
                }
            }
            sda = "\"stroke-dasharray\":\"" + sda + "\",";
            properties += (sda);
            sda = null;
        }

        if (lineCap === BasicStroke.CAP_SQUARE) {

            properties += ("\"stroke-linecap\":\"square\",");
        }

        else {
            if (lineCap === BasicStroke.CAP_ROUND) {

                properties += ("\"stroke-linecap\":\"round\",");
            }

            else {
                if (lineCap === BasicStroke.CAP_BUTT) {

                    properties += ("\"stroke-linecap\":\"butt\",");
                }

            }

        }


        strokeWidth = lineWidth.toString();
        properties += ("\"stroke-width\":" + strokeWidth);
        properties += ("}");


        //generate JSON geometry for feature
        geometry += ("\"geometry\":{\"type\":");
        geometry += (geometryType);
        geometry += (",\"coordinates\":[");

        let shapesArray: Point2D[][] = shapeInfo.getPolylines();

        for (let i: int = 0; i < shapesArray.length; i++) {
            let pointList: Point2D[] = shapesArray[i];

            normalize = MultiPointHandler.normalizePoints(pointList, ipc);

            geometry += ("[");

            //console.log("Pixel Coords:");
            for (let j: int = 0; j < pointList.length; j++) {
                let coord: Point2D = pointList[j] as Point2D;
                let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                //M. Deutch 9-27-11
                if (normalize) {
                    geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                }
                let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
                let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;

                //fix for fill crossing DTL
                if (normalize && fillColor != null) {
                    if (longitude > 0) {
                        longitude -= 360;
                    }
                }

                //diagnostic M. Deutch 10-18-11
                //set the point as geo so that the 
                //coord.setLocation(longitude, latitude);
                coord = new Point2D(longitude, latitude);
                pointList[j] = coord;
                //end section

                geometry += ("[");
                geometry += (longitude);
                geometry += (",");
                geometry += (latitude);
                geometry += ("]");

                if (j < (pointList.length - 1)) {
                    geometry += (",");
                }
            }

            geometry += ("]");

            if (i < (shapesArray.length - 1)) {
                geometry += (",");
            }
        }
        geometry += ("]}");

        JSONed += ("{\"type\":\"Feature\",");
        JSONed += (properties.toString());
        JSONed += (",");
        JSONed += (geometry.toString());
        JSONed += ("}");

        return JSONed.toString();
    }

    private static ImageToGeoJSONString(shapeInfo: ShapeInfo, ipc: IPointConversion, normalize: boolean): string {

        let JSONed: string = "";
        let properties: string = "";
        let geometry: string = "";

        //AffineTransform at = shapeInfo.getAffineTransform();
        //Point2D coord = (Point2D)new Point2D(at.getTranslateX(), at.getTranslateY());
        //Point2D coord = (Point2D) new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY());
        let coord: Point2D = new Point2D(shapeInfo.getModifierPosition().getX(), shapeInfo.getModifierPosition().getY()) as Point2D;
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        //M. Deutch 9-27-11
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
        let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
        let angle: double = shapeInfo.getModifierAngle();
        coord.setLocation(longitude, latitude);

        //diagnostic M. Deutch 10-18-11
        shapeInfo.setGlyphPosition(coord);

        let image: string = shapeInfo.getModifierImage();

        let RS: RendererSettings = RendererSettings.getInstance();

        if (image != null) {

            JSONed += ("{\"type\":\"Feature\",\"properties\":{\"image\":\"");
            JSONed += (image);
            JSONed += ("\",\"rotation\":");
            JSONed += (angle);
            JSONed += (",\"angle\":");
            JSONed += (angle);
            JSONed += ("},");
            JSONed += ("\"geometry\":{\"type\":\"Point\",\"coordinates\":[");
            JSONed += (longitude);
            JSONed += (",");
            JSONed += (latitude);
            JSONed += ("]");
            JSONed += ("}}");

        } else {
            return "";
        }

        return JSONed.toString();
    }

    private static GeoJSONize(shapes: Array<ShapeInfo>, modifiers: Array<ShapeInfo>, ipc: IPointConversion, normalize: boolean, textColor: Color, textBackgroundColor: Color): string {

        let jstr: string = "";
        let tempModifier: ShapeInfo;
        let fc: string = "";//JSON feature collection

        fc += ("[");

        let len: int = shapes.length;
        for (let i: int = 0; i < len; i++) 
        {

            let shapesToAdd: string = null;
            let tempShape:ShapeInfo = shapes[i];
            if(tempShape != null && tempShape !== undefined)
                shapesToAdd = MultiPointHandler.ShapeToGeoJSONString(tempShape, ipc, normalize);
            if (shapesToAdd != null && shapesToAdd.length > 0) {
                fc += (shapesToAdd);
            }
            if (shapesToAdd != null && i < len - 1) {
                fc += (",");
            }
        }

        let len2: int = modifiers.length;

        for (let j: int = 0; j < len2; j++) {
            tempModifier = modifiers[j];

            let modifiersToAdd: string;
            if (modifiers[j].getModifierImage() != null) {
                modifiersToAdd = MultiPointHandler.ImageToGeoJSONString(tempModifier, ipc, normalize);
            } else {
                modifiersToAdd = MultiPointHandler.LabelToGeoJSONString(tempModifier, ipc, normalize, textColor, textBackgroundColor);
            }
            if (modifiersToAdd.length > 0) {
                fc += (",");
                fc += (modifiersToAdd);
            }
        }
        fc += ("]");
        let GeoJSON: string = fc.toString();
        return GeoJSON;
    }

    /**
     * 
     * @param shapes
     * @param modifiers
     * @param ipc
     * @param normalize
     * @deprecated
     */
    private static MakeWWReady(
        shapes: Array<ShapeInfo>,
        modifiers: Array<ShapeInfo>,
        ipc: IPointConversion,
        normalize: boolean): void {
        let temp: ShapeInfo;
        let len: int = shapes.length;
        for (let i: int = 0; i < len; i++) {

            temp = MultiPointHandler.ShapeToWWReady(shapes[i], ipc, normalize);
            shapes[i] = temp;

        }

        let len2: int = modifiers.length;
        let tempModifier: ShapeInfo;
        for (let j: int = 0; j < len2; j++) {

            tempModifier = modifiers[j];

            //Do we need this for World Wind?
            tempModifier = MultiPointHandler.LabelToWWReady(tempModifier, ipc, normalize);
            modifiers[j] = tempModifier;

        }

    }

    private static normalizePoints(shape: Array<Point2D>, ipc: IPointConversion): boolean {
        let geoCoords: Point2D[] = new Array();
        let n: int = shape.length;
        //for (int j = 0; j < shape.length; j++) 
        for (let j: int = 0; j < n; j++) {
            let coord: Point2D = shape[j];
            let geoCoord: Point2D = ipc.PixelsToGeo(coord);
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
            let latitude: double = geoCoord.getY();
            let longitude: double = geoCoord.getX();
            let pt2d: Point2D = new Point2D(longitude, latitude);
            geoCoords.push(pt2d);
        }
        let normalize: boolean = MultiPointHandler.crossesIDL(geoCoords);
        return normalize;
    }

    private static IsOnePointSymbolCode(symbolCode: string): boolean {
        let basicCode: string = SymbolUtilities.getBasicSymbolID(symbolCode);
        //TODO: Revisit for basic shapes
        //some airspaces affected
        if (symbolCode === "CAKE-----------") {
            return true;
        } else {
            if (symbolCode === "CYLINDER-------") {
                return true;
            } else {
                if (symbolCode === "RADARC---------") {
                    return true;
                }
            }

        }


        return false;
    }

    private static ShapeToKMLString(name: string,
        description: string,
        symbolCode: string,
        shapeInfo: ShapeInfo,
        ipc: IPointConversion,
        normalize: boolean): string {

        let kml: string = "";

        let lineColor: Color;
        let fillColor: Color;
        let googleLineColor: string;
        let googleFillColor: string;

        //String lineStyleId = "lineColor";

        let stroke: BasicStroke;
        let lineWidth: int = 4;

        symbolCode = JavaRendererUtilities.normalizeSymbolCode(symbolCode);

        let cdataStart: string = "<![CDATA[";
        let cdataEnd: string = "]]>";

        kml += ("<Placemark>");//("<Placemark id=\"" + id + "_mg" + "\">");
        kml += ("<description>" + cdataStart + "<b>" + name + "</b><br/>" + "\n" + description + cdataEnd + "</description>");
        //kml += ("<Style id=\"" + lineStyleId + "\">");
        kml += ("<Style>");

        lineColor = shapeInfo.getLineColor();
        if (lineColor != null) {
            googleLineColor = RendererUtilities.colorToHexString(shapeInfo.getLineColor(), false);

            stroke = shapeInfo.getStroke();

            if (stroke != null) {
                lineWidth = stroke.getLineWidth() as int;
            }

            googleLineColor = JavaRendererUtilities.ARGBtoABGR(googleLineColor);

            kml += ("<LineStyle>");
            kml += ("<color>" + googleLineColor + "</color>");
            kml += ("<colorMode>normal</colorMode>");
            kml += ("<width>" + lineWidth.toString() + "</width>");
            kml += ("</LineStyle>");
        }

        fillColor = shapeInfo.getFillColor();
        let fillPattern: string = shapeInfo.getPatternFillImage();
        if (fillColor != null || fillPattern != null) {
            kml += ("<PolyStyle>");

            if (fillColor != null) {
                googleFillColor = RendererUtilities.colorToHexString(shapeInfo.getFillColor(), false);
                googleFillColor = JavaRendererUtilities.ARGBtoABGR(googleFillColor);
                kml += ("<color>" + googleFillColor + "</color>");
                kml += ("<colorMode>normal</colorMode>");
            }
            if (fillPattern != null) {
                kml += ("<shader>" + fillPattern + "</shader>");
            }

            kml += ("<fill>1</fill>");
            if (lineColor != null) {
                kml += ("<outline>1</outline>");
            } else {
                kml += ("<outline>0</outline>");
            }
            kml += ("</PolyStyle>");
        }

        kml += ("</Style>");

        let shapesArray: Point2D[][] = shapeInfo.getPolylines();
        let len: int = shapesArray.length;
        kml += ("<MultiGeometry>");

        for (let i: int = 0; i < len; i++) {
            let shape: Point2D[] = shapesArray[i];
            normalize = MultiPointHandler.normalizePoints(shape, ipc);
            if (lineColor != null && fillColor == null) {
                kml += ("<LineString>");
                kml += ("<tessellate>1</tessellate>");
                kml += ("<altitudeMode>clampToGround</altitudeMode>");
                kml += ("<coordinates>");
                let n: int = shape.length;
                //for (int j = 0; j < shape.length; j++) 
                for (let j: int = 0; j < n; j++) {
                    let coord: Point2D = shape[j] as Point2D;
                    let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                    if (normalize) {
                        geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                    }

                    let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
                    let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;

                    kml += (longitude);
                    kml += (",");
                    kml += (latitude);
                    if (j < shape.length - 1) {

                        kml += (" ");
                    }

                }

                kml += ("</coordinates>");
                kml += ("</LineString>");
            }

            if (fillColor != null) {

                if (i === 0) {
                    kml += ("<Polygon>");
                }
                //kml += ("<outerBoundaryIs>");
                if (i === 1 && len > 1) {
                    kml += ("<innerBoundaryIs>");
                } else {
                    kml += ("<outerBoundaryIs>");
                }
                kml += ("<LinearRing>");
                kml += ("<altitudeMode>clampToGround</altitudeMode>");
                kml += ("<tessellate>1</tessellate>");
                kml += ("<coordinates>");

                //this section is a workaround for a google earth bug. Issue 417 was closed
                //for linestrings but they did not fix the smae issue for fills. If Google fixes the issue
                //for fills then this section will need to be commented or it will induce an error.
                let lastLongitude: double = Number.MIN_VALUE;
                if (normalize === false && MultiPointHandler.IsOnePointSymbolCode(symbolCode)) {
                    let n: int = shape.length;
                    //for (int j = 0; j < shape.length; j++) 
                    for (let j: int = 0; j < n; j++) {
                        let coord: Point2D = shape[j] as Point2D;
                        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                        let longitude: double = geoCoord.getX();
                        if (lastLongitude !== Number.MIN_VALUE) {
                            if (Math.abs(longitude - lastLongitude) > 180) {
                                normalize = true;
                                break;
                            }
                        }
                        lastLongitude = longitude;
                    }
                }
                let n: int = shape.length;
                //for (int j = 0; j < shape.length; j++) 
                for (let j: int = 0; j < n; j++) {
                    let coord: Point2D = shape[j] as Point2D;
                    let geoCoord: Point2D = ipc.PixelsToGeo(coord);

                    let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
                    let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;

                    //fix for fill crossing DTL
                    if (normalize) {
                        if (longitude > 0) {
                            longitude -= 360;
                        }
                    }

                    kml += (longitude);
                    kml += (",");
                    kml += (latitude);
                    if (j < shape.length - 1) {

                        kml += (" ");
                    }

                }

                kml += ("</coordinates>");
                kml += ("</LinearRing>");
                if (i === 1 && len > 1) {
                    kml += ("</innerBoundaryIs>");
                } else {
                    kml += ("</outerBoundaryIs>");
                }
                if (i === len - 1) {
                    kml += ("</Polygon>");
                }
            }
        }

        kml += ("</MultiGeometry>");
        kml += ("</Placemark>");

        return kml.toString();
    }

    /**
     * 
     * @param shapeInfo
     * @param ipc
     * @param normalize
     * @return
     * @deprecated
     */
    private static ShapeToWWReady(
        shapeInfo: ShapeInfo,
        ipc: IPointConversion,
        normalize: boolean): ShapeInfo {

        let shapesArray: Point2D[][] = shapeInfo.getPolylines();
        let len: int = shapesArray.length;

        for (let i: int = 0; i < len; i++) {
            let shape: Point2D[] = shapesArray[i];

            if (shapeInfo.getLineColor() != null) {
                let n: int = shape.length;
                //for (int j = 0; j < shape.length; j++) 
                for (let j: int = 0; j < n; j++) {
                    let coord: Point2D = shape[j] as Point2D;
                    let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                    //M. Deutch 9-26-11
                    if (normalize) {
                        geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                    }

                    shape[j] = geoCoord;

                }

            }

            if (shapeInfo.getFillColor() != null) {
                let n: int = shape.length;
                //for (int j = 0; j < shape.length; j++) 
                for (let j: int = 0; j < n; j++) {
                    let coord: Point2D = shape[j] as Point2D;
                    let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                    //M. Deutch 9-26-11
                    //commenting these two lines seems to help with fill not go around the pole
                    //if(normalize)
                    //geoCoord=NormalizeCoordToGECoord(geoCoord);

                    shape[j] = geoCoord;
                }
            }
        }

        return shapeInfo;
    }

    private static LabelToWWReady(shapeInfo: ShapeInfo,
        ipc: IPointConversion,
        normalize: boolean): ShapeInfo | null {

        try {
            let coord: Point2D = new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY()) as Point2D;
            let geoCoord: Point2D = ipc.PixelsToGeo(coord);
            //M. Deutch 9-26-11
            if (normalize) {
                geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
            }
            let latitude: double = geoCoord.getY();
            let longitude: double = geoCoord.getX();
            let angle: number = Math.round(shapeInfo.getModifierAngle());

            let text: string = shapeInfo.getModifierString();

            if (text != null && text !== "") {
                shapeInfo.setModifierPosition(geoCoord);
            } else {
                return null;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                console.error(exc.message);
                console.log(exc.stack);
            } else {
                throw exc;
            }
        }

        return shapeInfo;
    }

    /**
     * Google earth centers text on point rather than drawing from that point.
     * So we need to adjust the point to where the center of the text would be.
     *
     * @param modifier
     */
    private static AdjustModifierPointToCenter(modifier: ShapeInfo): void {
        let at: AffineTransform;
        try {
            let bounds2: Rectangle = modifier.getTextLayout().getBounds();
            let bounds: Rectangle2D = new Rectangle2D(bounds2.getX(), bounds2.getY(), bounds2.getWidth(), bounds2.getHeight());
        } catch (exc) {
            if (exc instanceof Error) {
                console.error(exc.message);
                console.log(exc.stack);
            } else {
                throw exc;
            }
        }
    }

    /**
     * 
     * @param shapeInfo
     * @param ipc
     * @param geMap
     * @param normalize
     * @return
     * @deprecated
     */
    private static ShapeToJSONString(shapeInfo: ShapeInfo, ipc: IPointConversion, geMap: boolean, normalize: boolean): string {
        let JSONed: string = "";
        /*
         NOTE: Google Earth / KML colors are backwards.
         They are ordered Alpha,Blue,Green,Red, not Red,Green,Blue,Aplha like the rest of the world
         * */
        let fillColor: string;
        let lineColor: string;

        if (shapeInfo.getLineColor() != null) {
            lineColor = RendererUtilities.colorToHexString(shapeInfo.getLineColor(), false);
            if (geMap) {
                lineColor = JavaRendererUtilities.ARGBtoABGR(lineColor);
            }

        }
        if (shapeInfo.getFillColor() != null) {
            fillColor = RendererUtilities.colorToHexString(shapeInfo.getFillColor(), false);
            if (geMap) {
                fillColor = JavaRendererUtilities.ARGBtoABGR(fillColor);
            }
        }

        let stroke: BasicStroke;
        stroke = shapeInfo.getStroke();
        let lineWidth: int = 4;

        if (stroke != null) {
            lineWidth = stroke.getLineWidth() as int;
        }

        let shapesArray: Point2D[][] = shapeInfo.getPolylines();
        let n: int = shapesArray.length;
        //for (int i = 0; i < shapesArray.length; i++) 
        for (let i: int = 0; i < n; i++) {
            let shape: Point2D[] = shapesArray[i];

            if (fillColor != null) {
                JSONed += ("{\"polygon\":[");
            } else {
                JSONed += ("{\"line\":[");
            }

            let t: int = shape.length;
            //for (int j = 0; j < shape.length; j++) 
            for (let j: int = 0; j < t; j++) {
                let coord: Point2D = shape[j] as Point2D;
                let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                //M. Deutch 9-27-11
                if (normalize) {
                    geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                }
                let latitude: double = geoCoord.getY();
                let longitude: double = geoCoord.getX();

                //diagnostic M. Deutch 10-18-11
                //set the point as geo so that the 
                coord = new Point2D(longitude, latitude);
                shape[j] = coord;

                JSONed += ("[");
                JSONed += (longitude);
                JSONed += (",");
                JSONed += (latitude);
                JSONed += ("]");

                if (j < (shape.length - 1)) {
                    JSONed += (",");
                }
            }

            JSONed += ("]");
            if (lineColor != null) {
                JSONed += (",\"lineColor\":\"");
                JSONed += (lineColor);

                JSONed += ("\"");
            }
            if (fillColor != null) {
                JSONed += (",\"fillColor\":\"");
                JSONed += (fillColor);
                JSONed += ("\"");
            }

            JSONed += (",\"lineWidth\":\"");
            JSONed += (lineWidth.toString());
            JSONed += ("\"");

            JSONed += ("}");

            if (i < (shapesArray.length - 1)) {
                JSONed += (",");
            }
        }

        return JSONed.toString();
    }

    private static LabelToKMLString(shapeInfo: ShapeInfo, ipc: IPointConversion, normalize: boolean, textColor: Color): string {
        let kml: string = "";

        //Point2D coord = (Point2D) new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY());
        let coord: Point2D = new Point2D(shapeInfo.getModifierPosition().getX(), shapeInfo.getModifierPosition().getY()) as Point2D;
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        //M. Deutch 9-26-11
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
        let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
        let angle: number = Math.round(shapeInfo.getModifierAngle());

        let text: string = shapeInfo.getModifierString();

        let cdataStart: string = "<![CDATA[";
        let cdataEnd: string = "]]>";

        let color: string = RendererUtilities.colorToHexString(textColor, false);
        color = JavaRendererUtilities.ARGBtoABGR(color);
        let kmlScale: double = RendererSettings.getInstance().getKMLLabelScale();

        if (kmlScale > 0 && text != null && text !== "") {
            kml += ("<Placemark>");//("<Placemark id=\"" + id + "_lp" + i + "\">");
            kml += ("<name>" + cdataStart + text + cdataEnd + "</name>");
            kml += ("<Style>");
            kml += ("<IconStyle>");
            kml += ("<scale>.7</scale>");
            kml += ("<heading>" + angle + "</heading>");
            kml += ("<Icon>");
            kml += ("<href></href>");
            kml += ("</Icon>");
            kml += ("</IconStyle>");
            kml += ("<LabelStyle>");
            kml += ("<color>" + color + "</color>");
            kml += ("<scale>" + kmlScale.toString() + "</scale>");
            kml += ("</LabelStyle>");
            kml += ("</Style>");
            kml += ("<Point>");
            kml += ("<extrude>1</extrude>");
            kml += ("<altitudeMode>relativeToGround</altitudeMode>");
            kml += ("<coordinates>");
            kml += (longitude);
            kml += (",");
            kml += (latitude);
            kml += ("</coordinates>");
            kml += ("</Point>");
            kml += ("</Placemark>");
        } else {
            return "";
        }

        return kml.toString();
    }

    /**
     * 
     * @param shapeInfo
     * @param ipc
     * @param normalize
     * @return
     * @deprecated
     */
    private static LabelToJSONString(shapeInfo: ShapeInfo, ipc: IPointConversion, normalize: boolean): string {
        let JSONed: string = "";
        /*
         NOTE: Google Earth / KML colors are backwards.
         They are ordered Alpha,Blue,Green,Red, not Red,Green,Blue,Aplha like the rest of the world
         * */
        JSONed += ("{\"label\":");

        let coord: Point2D = new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY()) as Point2D;
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = geoCoord.getY();
        let longitude: double = geoCoord.getX();
        let angle: double = shapeInfo.getModifierAngle();
        coord.setLocation(longitude, latitude);

        shapeInfo.setGlyphPosition(coord);

        let text: string = shapeInfo.getModifierString();

        if (text != null && text !== "") {
            JSONed += ("[");
            JSONed += (longitude);
            JSONed += (",");
            JSONed += (latitude);
            JSONed += ("]");

            JSONed += (",\"text\":\"");
            JSONed += (text);
            JSONed += ("\"");

            JSONed += (",\"angle\":\"");
            JSONed += (angle);
            JSONed += ("\"}");
        } else {
            return "";
        }

        return JSONed.toString();
    }

    public static canRenderMultiPoint(symbolID: string, modifiers: Map<string, string>, numPoints: int): string {
        try {
            let basicID: string = SymbolUtilities.getBasicSymbolID(symbolID);
            let info: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);

            if (info == null) {
                if (SymbolID.getVersion(symbolID) === SymbolID.Version_2525E) {
                    return "Basic ID: " + basicID + " not recognized in version E (13)";
                } else {
                    return "Basic ID: " + basicID + " not recognized in version D (11)";
                }
            }

            let drawRule: int = info.getDrawRule();

            if (drawRule === DrawRules.DONOTDRAW) {
                return "Basic ID: " + basicID + " has no draw rule";
            } else if (!SymbolUtilities.isMultiPoint(symbolID)) {
                return "Basic ID: " + basicID + " is not a multipoint symbol";
            } else if (numPoints < info.getMinPointCount()) {
                return "Basic ID: " + basicID + " requires a minimum of " + info.getMinPointCount().toString() + " points. " + numPoints.toString() + " are present.";
            }

            //now check for required modifiers
            let AM: Array<number> = new Array();
            let AN: Array<number> = new Array();
            if (modifiers.has(Modifiers.AM_DISTANCE)) {
                let amArray: string[] = modifiers.get(Modifiers.AM_DISTANCE).split(",");
                for (let str of amArray) {
                    if (str !== "") {
                        AM.push(parseFloat(str));
                    }
                }
            }
            if (modifiers.has(Modifiers.AN_AZIMUTH)) {
                let anArray: string[] = modifiers.get(Modifiers.AN_AZIMUTH).split(",");
                for (let str of anArray) {
                    if (str !== "") {
                        AN.push(parseFloat(str));
                    }
                }
            }

            return MultiPointHandler.hasRequiredModifiers(symbolID, drawRule, AM, AN);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("MultiPointHandler", "canRenderMultiPoint", exc);
                return "false: " + exc.message;
            } else {
                throw exc;
            }
        }
    }

    private static hasRequiredModifiers(symbolID: string, drawRule: int, AM: Array<number>, AN: Array<number>): string {

        let message: string = symbolID;
        try {
            if (drawRule > 700) {
                if (drawRule === DrawRules.CIRCULAR1) {
                    if (AM != null && AM.length > 0) {
                        return "true";
                    } else {
                        message += " requires a modifiers object that has 1 distance/AM value.";
                        return message;
                    }
                } else {
                    if (drawRule === DrawRules.RECTANGULAR2) {
                        if (AM != null && AM.length >= 2
                            && AN != null && AN.length >= 1) {
                            return "true";
                        } else {
                            message += (" requires a modifiers object that has 2 distance/AM values and 1 azimuth/AN value.");
                            return message;
                        }
                    } else {
                        if (drawRule === DrawRules.ARC1) {
                            if (AM != null && AM.length >= 1
                                && AN != null && AN.length >= 2) {
                                return "true";
                            } else {
                                message += (" requires a modifiers object that has 2 distance/AM values and 2 azimuth/AN values per sector.  The first sector can have just one AM value although it is recommended to always use 2 values for each sector.");
                                return message;
                            }
                        } else {
                            if (drawRule === DrawRules.CIRCULAR2) {
                                if (AM != null && AM.length > 0) {
                                    return "true";
                                } else {
                                    message += (" requires a modifiers object that has at least 1 distance/AM value");
                                    return message;
                                }
                            } else {
                                if (drawRule === DrawRules.RECTANGULAR1) {
                                    if (AM != null && AM.length > 0) {
                                        return "true";
                                    } else {
                                        message += (" requires a modifiers object that has 1 distance/AM value.");
                                        return message;
                                    }
                                } else {
                                    if (drawRule === DrawRules.ELLIPSE1) {
                                        if (AM != null && AM.length >= 2
                                            && AN != null && AN.length >= 1) {
                                            return "true";
                                        } else {
                                            message += (" requires a modifiers object that has 2 distance/AM values and 1 azimuth/AN value.");
                                            return message;
                                        }
                                    }
                                    else {
                                        if (drawRule === DrawRules.RECTANGULAR3) {
                                            if (AM != null && AM.length >= 1) {
                                                return "true";
                                            } else {
                                                message += (" requires a modifiers object that has 1 distance/AM value.");
                                                return message;
                                            }
                                        } else {
                                            //should never get here
                                            return "true";
                                        }
                                    }

                                }

                            }

                        }

                    }

                }

            } else {
                if (drawRule === DrawRules.POINT17) {
                    if (AM != null && AM.length >= 2
                        && AN != null && AN.length >= 1) {
                        return "true";
                    } else {
                        message += (" requires a modifiers object that has 2 distance/AM values and 1 azimuth/AN value.");
                        return message;
                    }
                } else {
                    if (drawRule === DrawRules.POINT18) {
                        if (AM != null && AM.length >= 2
                            && AN != null && AN.length >= 2) {
                            return "true";
                        } else {
                            message += (" requires a modifiers object that has 2 distance/AM values and 2 azimuth/AN values.");
                            return message;
                        }
                    } else {
                        if (drawRule === DrawRules.CORRIDOR1) {
                            if (AM != null && AM.length > 0) {
                                return "true";
                            } else {
                                message += (" requires a modifiers object that has 1 distance/AM value.");
                                return message;
                            }
                        } else {
                            //no required parameters
                            return "true";
                        }
                    }

                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("MultiPointHandler", "hasRequiredModifiers", exc);
                return "true";
            } else {
                throw exc;
            }
        }
    }
}
