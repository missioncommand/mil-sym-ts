import { MultiPointHandler } from "./MultiPointHandler";
import { POINT2 } from "../../JavaLineArray/POINT2";
import { TGLight } from "../../JavaTacticalRenderer/TGLight";
import { clsRenderer } from "../../RenderMultipoints/clsRenderer";
import { Point2D } from "../../graphics2d/Point2D";
import { Rectangle } from "../../graphics2d/Rectangle";
import { Color } from "../../renderer/utilities/Color";
import { DrawRules } from "../../renderer/utilities/DrawRules";
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger";
import { IPointConversion } from "../../renderer/utilities/IPointConversion";
import { LogLevel } from "../../renderer/utilities/LogLevel";
import { MSLookup } from "../../renderer/utilities/MSLookup";
import { MilStdAttributes } from "../../renderer/utilities/MilStdAttributes";
import { MilStdSymbol } from "../../renderer/utilities/MilStdSymbol";
import { RendererSettings } from "../../renderer/utilities/RendererSettings";
import { RendererUtilities } from "../../renderer/utilities/RendererUtilities";
import { ShapeInfo3D } from "./utilities/ShapeInfo3D";
import { PointConverter } from "./PointConverter";
import { JavaRendererUtilities } from "./utilities/JavaRendererUtilities";
import { WebRenderer } from "./WebRenderer";
import { Point3D } from "./utilities/Point3D";
import { type int, type double } from "../../graphics2d/BasicTypes";
import { BasicStroke } from "../../graphics2d/BasicStroke";
import { Modifiers } from "../../renderer/utilities/Modifiers";
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities";
import { ShapeInfo } from "../../renderer/utilities/ShapeInfo";
import { Font } from "../../graphics2d/Font";
import { Rectangle2D } from "../../graphics2d/Rectangle2D";
import { Basic3DShapes } from "./utilities/Basic3DShapes";

export class Shape3DHandler {
    /**
     * 3D version of {@link MultiPointHandler.RenderSymbol()}
     */
    public static RenderMilStd3dSymbol(id: string,
        name: string,
        description: string,
        symbolCode: string,
        controlPoints: string,
        altitudeMode: string,
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
        let shapes: Array<ShapeInfo3D> = new Array<ShapeInfo3D>();
        let modifiers: Array<ShapeInfo3D> = new Array<ShapeInfo3D>();
        //ArrayList<Point2D> pixels = new ArrayList<Point2D>();
        let geoCoords: Array<Point2D> = new Array<Point2D>();
        let len: int = coordinates.length;
        //diagnostic create geoCoords here
        let coordsUL: Point2D = null;

        // 3D default colors
        if (symbolAttributes.get(MilStdAttributes.LineColor) == null) {
            var defaultColor = SymbolUtilities.getLineColorOfAffiliation(symbolCode);
            if (defaultColor == null) {
                defaultColor = new Color(Color.BLACK);
            }
            symbolAttributes.set(MilStdAttributes.LineColor, defaultColor.toHexString());
        }
        if (symbolAttributes.get(MilStdAttributes.FillColor) == null) {
            var defaultColor = SymbolUtilities.getFillColorOfAffiliation(symbolCode);
            if (defaultColor == null) {
                defaultColor = new Color(Color.WHITE);
            }
            defaultColor.setAlpha(170);
            symbolAttributes.set(MilStdAttributes.FillColor, defaultColor.toHexString(true));
        }

        if (altitudeMode == undefined || altitudeMode == "clampToGround")
            altitudeMode = "absolute"

        if (!JavaRendererUtilities.is3dSymbol(symbolCode)) {
            const basicID: string = SymbolUtilities.getBasicSymbolID(symbolCode);
            const errorMsg = "Basic ID: " + basicID + " is not a 3D Symbol";
            let ErrorOutput: string = "";
            ErrorOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the 3D MilStdSymbol " + symbolCode + " - ID: " + id + " - ");
            ErrorOutput += errorMsg; //reason for error
            ErrorOutput += ("\"}");
            ErrorLogger.LogMessage("Shape3DHandler", "RenderMilStd3dSymbol", errorMsg, LogLevel.FINE);
            return ErrorOutput;
        }

        let symbolIsValid: string = MultiPointHandler.canRenderMultiPoint(symbolCode, symbolModifiers, len);
        if (symbolIsValid !== "true") {
            let ErrorOutput: string = "";
            ErrorOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the 3D MilStdSymbol " + symbolCode + " - ID: " + id + " - ");
            ErrorOutput += symbolIsValid; //reason for error
            ErrorOutput += ("\"}");
            ErrorLogger.LogMessage("Shape3DHandler", "RenderMilStd3dSymbol", symbolIsValid, LogLevel.FINE);
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
                symbolAttributes.set(MilStdAttributes.UseDashArray, 'true');
                symbolAttributes.set(MilStdAttributes.UsePatternFill, "true");
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

            // Convert 2D shape to 3D
            if (MSLookup.getInstance().getMSLInfo(symbolCode).getDrawRule() === DrawRules.CORRIDOR1) {
                // Remove circles from air corridor for 3d
                // Set line color for other shapes
                for (let i = 0; i < mSymbol.getSymbolShapes().length - 1; i++) {
                    mSymbol.getSymbolShapes()[i].setLineColor(mSymbol.getSymbolShapes()[mSymbol.getSymbolShapes().length - 1].getLineColor());
                }
                mSymbol.setSymbolShapes(mSymbol.getSymbolShapes().slice(0, -1).reverse());
            }
            // Confirm there are at least two altitudes per shape
            let altitudes = mSymbol.getModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH);
            if (altitudes.length === 1) {
                altitudes = [0, altitudes[0]];
            }
            const lastAlt = altitudes[altitudes.length - 1];
            const nextToLastAlt = altitudes[altitudes.length - 2];
            while (altitudes.length < mSymbol.getSymbolShapes().length * 2) {
                altitudes.push(nextToLastAlt, lastAlt);
            }
            for (let shapeIndex = 0; shapeIndex < mSymbol.getSymbolShapes().length; shapeIndex++) {
                const minAlt = altitudes[shapeIndex * 2];
                const maxAlt = altitudes[(shapeIndex * 2) + 1];
                const oldShape = mSymbol.getSymbolShapes()[shapeIndex];

                var bottomShape = new ShapeInfo3D();
                bottomShape.setShapeType(oldShape.getShapeType());
                bottomShape.setStroke(oldShape.getStroke());
                bottomShape.setLineColor(oldShape.getLineColor());
                bottomShape.setFillColor(oldShape.getFillColor());
                bottomShape.setPatternFillImage(oldShape.getPatternFillImageInfo());
                bottomShape.setPolylines([]);
                var topShape = new ShapeInfo3D();
                topShape.setShapeType(oldShape.getShapeType());
                topShape.setStroke(oldShape.getStroke());
                topShape.setLineColor(oldShape.getLineColor());
                topShape.setFillColor(oldShape.getFillColor());
                topShape.setPatternFillImage(oldShape.getPatternFillImageInfo());
                topShape.setPolylines([]);

                for (let polyLineIndex = 0; polyLineIndex < oldShape.getPolylines().length; polyLineIndex++) {
                    const polyline = oldShape.getPolylines()[polyLineIndex];
                    bottomShape.getPolylines().push([]);
                    topShape.getPolylines().push([]);
                    for (let ptIndex = 0; ptIndex < polyline.length; ptIndex++) {
                        const pt = polyline[ptIndex];
                        const pt2 = polyline[(ptIndex + 1) % polyline.length];
                        bottomShape.getPolylines()[polyLineIndex].push(new Point3D(pt, minAlt));
                        topShape.getPolylines()[polyLineIndex].push(new Point3D(pt, maxAlt));

                        var sideShape = new ShapeInfo3D();
                        sideShape.setShapeType(oldShape.getShapeType());
                        sideShape.setStroke(oldShape.getStroke());
                        sideShape.setLineColor(oldShape.getLineColor());
                        sideShape.setFillColor(oldShape.getFillColor());
                        sideShape.setPatternFillImage(oldShape.getPatternFillImageInfo());
                        sideShape.setPolylines([[new Point3D(pt, minAlt), new Point3D(pt2, minAlt), new Point3D(pt2, maxAlt), new Point3D(pt, maxAlt), new Point3D(pt, minAlt)]]);
                        shapes.push(sideShape);
                    }
                }
                shapes.push(bottomShape);
                shapes.push(topShape);
            }

            const modifierAlt = Math.max(...altitudes.slice(0, mSymbol.getSymbolShapes().length * 2));
            for (const oldShape of mSymbol.getModifierShapes()) {
                var modShape = new ShapeInfo3D();
                modShape.setModifierString(oldShape.getModifierString());
                modShape.setModifierPosition(new Point3D(oldShape.getModifierPosition(), modifierAlt));
                modShape.setModifierAngle(oldShape.getModifierAngle());
                modShape.setTextJustify(oldShape.getTextJustify());
                modShape.setModifierImage(oldShape.getModifierImageInfo());

                modifiers.push(modShape);
            }

            if (format === WebRenderer.OUTPUT_FORMAT_KML) {
                var textColor = mSymbol.getTextColor();
                if (textColor == null)
                    textColor = mSymbol.getLineColor();

                jsonOutput = Shape3DHandler.KMLize(id, name, description, symbolCode, shapes, modifiers, ipc, normalize, textColor, altitudeMode);
            } else if (format === WebRenderer.OUTPUT_FORMAT_GEOJSON) {
                jsonOutput += ("{\"type\":\"FeatureCollection\",\"features\":");
                jsonContent = Shape3DHandler.GeoJSONize(shapes, modifiers, ipc, normalize, mSymbol.getTextColor(), mSymbol.getTextBackgroundColor());
                jsonOutput += (jsonContent);

                //moving meta data properties to the last feature with no coords as feature collection doesn't allow properties
                jsonOutput = jsonOutput.slice(0, -1);
                if (jsonContent.length > 2)
                    jsonOutput += ",";
                jsonOutput += ("{\"type\": \"Feature\",\"geometry\": { \"type\": \"Polygon\",\"coordinates\": [ ]}");

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
                jsonOutput += ("\"}}]}");
            }
        } catch (exc) {
            if (exc instanceof Error) {
                let st: string = JavaRendererUtilities.getStackTrace(exc);
                jsonOutput = "";
                jsonOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the 3D MilStdSymbol " + symbolCode + ": " + "- ");
                jsonOutput += (exc.message + " - ");
                jsonOutput += (st);
                jsonOutput += ("\"}");

                ErrorLogger.LogException("Shape3DHandler", "RenderMilStd3dSymbol", exc);
            } else {
                throw exc;
            }
        }

        ErrorLogger.LogMessage("Shape3DHandler", "RenderMilStd3dSymbol()", "exit RenderMilStd3dSymbol", LogLevel.FINER);
        return jsonOutput.toString();
    }

    /**
     *
     * @param id
     * @param name
     * @param description
     * @param basicShapeType
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
    public static RenderBasic3DShape(id: string,
        name: string,
        description: string,
        basicShapeType: int,
        controlPoints: string,
        altitudeMode: string,
        scale: number,
        bbox: string,
        symbolModifiers: Map<string, string>,
        symbolAttributes: Map<string, string>,
        format: int): string {
        let normalize: boolean = true;
        //Double controlLat = 0.0;
        //Double controlLong = 0.0;
        //Double metPerPix = GeoPixelConversion.metersPerPixel(scale);
        //String bbox2=getBoundingRectangle(controlPoints,bbox);
        let jsonOutput: string = "";
        let jsonContent: string = "";

        let rect: Rectangle;
        let coordinates: string[] = controlPoints.split(" ");
        let shapes: Array<ShapeInfo3D> = new Array<ShapeInfo3D>();
        let modifiers: Array<ShapeInfo3D> = new Array<ShapeInfo3D>();
        //ArrayList<Point2D> pixels = new ArrayList<Point2D>();
        let geoCoords: Array<Point2D> = new Array<Point2D>();
        let len: int = coordinates.length;
        //diagnostic create geoCoords here
        let coordsUL: Point2D = null;
        const symbolCode = "";

        // 3D default colors
        if (symbolAttributes.get(MilStdAttributes.LineColor) == null) {
            var defaultColor = SymbolUtilities.getLineColorOfAffiliation(symbolCode);
            if (defaultColor == null) {
                defaultColor = new Color(Color.BLACK);
            }
            symbolAttributes.set(MilStdAttributes.LineColor, defaultColor.toHexString());
        }
        if (symbolAttributes.get(MilStdAttributes.FillColor) == null) {
            var defaultColor = SymbolUtilities.getFillColorOfAffiliation(symbolCode);
            if (defaultColor == null) {
                defaultColor = new Color(Color.WHITE);
            }
            defaultColor.setAlpha(170);
            symbolAttributes.set(MilStdAttributes.FillColor, defaultColor.toHexString(true));
        }

        if (altitudeMode == undefined || altitudeMode == "clampToGround")
            altitudeMode = "absolute"

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

                width = Math.abs(rightX - leftX) as int;
                height = Math.abs(bottomY - topY) as int;

                rect = new Rectangle(leftX, topY, width, height);
            }
        } else {
            rect = null;
        }

        if (ipc == null) {
            let ptCoordsUL: Point2D = MultiPointHandler.getGeoUL(geoCoords);
            ipc = new PointConverter(ptCoordsUL.getX(), ptCoordsUL.getY(), scale);
        }
        
        let geoCoords2: Array<Point2D> = new Array<Point2D>();
        geoCoords2.push(new Point2D(left, top));
        geoCoords2.push(new Point2D(right, bottom));

        //        if (normalize) {
        //            NormalizeGECoordsToGEExtents(0, 360, geoCoords2);
        //        }

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

            let tg: TGLight = clsRenderer.createTGLightFromMilStdSymbolBasicShape(mSymbol, ipc, basicShapeType);
            let shapeInfos: Array<ShapeInfo> = [];
            let modifierShapeInfos: Array<ShapeInfo> = [];
            let clipArea: Point2D[] | Rectangle | Rectangle2D;
            if (bboxCoords == null) {
                clipArea = rect;
            } else {
                clipArea = bboxCoords;
            }
            if (clsRenderer.intersectsClipArea(tg, ipc, clipArea)) {
                clsRenderer.render_GE(tg, shapeInfos, modifierShapeInfos, ipc, clipArea);
            }
            mSymbol.setSymbolShapes(shapeInfos);
            mSymbol.setModifierShapes(modifierShapeInfos);
            mSymbol.set_WasClipped(tg.get_WasClipped());

            // Convert 2D shape to 3D
            // Confirm there are at least two altitudes per shape
            let altitudes = mSymbol.getModifiers_AM_AN_X(Modifiers.X_ALTITUDE_DEPTH);
            if (altitudes.length === 1) {
                altitudes = [0, altitudes[0]];
            }
            if (basicShapeType === Basic3DShapes.ROUTE){
                altitudes = altitudes.slice(0, 2)
            }
            const lastAlt = altitudes[altitudes.length - 1];
            const nextToLastAlt = altitudes[altitudes.length - 2];
            while (altitudes.length < mSymbol.getSymbolShapes().length * 2) {
                altitudes.push(nextToLastAlt, lastAlt);
            }
            for (let shapeIndex = 0; shapeIndex < mSymbol.getSymbolShapes().length; shapeIndex++) {
                const minAlt = altitudes[shapeIndex * 2];
                const maxAlt = altitudes[(shapeIndex * 2) + 1];
                const oldShape = mSymbol.getSymbolShapes()[shapeIndex];

                var bottomShape = new ShapeInfo3D();
                bottomShape.setShapeType(oldShape.getShapeType());
                bottomShape.setStroke(oldShape.getStroke());
                bottomShape.setLineColor(oldShape.getLineColor());
                bottomShape.setFillColor(oldShape.getFillColor());
                bottomShape.setPatternFillImage(oldShape.getPatternFillImageInfo());
                bottomShape.setPolylines([]);
                var topShape = new ShapeInfo3D();
                topShape.setShapeType(oldShape.getShapeType());
                topShape.setStroke(oldShape.getStroke());
                topShape.setLineColor(oldShape.getLineColor());
                topShape.setFillColor(oldShape.getFillColor());
                topShape.setPatternFillImage(oldShape.getPatternFillImageInfo());
                topShape.setPolylines([]);

                for (let polyLineIndex = 0; polyLineIndex < oldShape.getPolylines().length; polyLineIndex++) {
                    const polyline = oldShape.getPolylines()[polyLineIndex];
                    bottomShape.getPolylines().push([]);
                    topShape.getPolylines().push([]);
                    for (let ptIndex = 0; ptIndex < polyline.length; ptIndex++) {
                        const pt = polyline[ptIndex];
                        const pt2 = polyline[(ptIndex + 1) % polyline.length];
                        bottomShape.getPolylines()[polyLineIndex].push(new Point3D(pt, minAlt));
                        topShape.getPolylines()[polyLineIndex].push(new Point3D(pt, maxAlt));

                        var sideShape = new ShapeInfo3D();
                        sideShape.setShapeType(oldShape.getShapeType());
                        sideShape.setStroke(oldShape.getStroke());
                        sideShape.setLineColor(oldShape.getLineColor());
                        sideShape.setFillColor(oldShape.getFillColor());
                        sideShape.setPatternFillImage(oldShape.getPatternFillImageInfo());
                        sideShape.setPolylines([[new Point3D(pt, minAlt), new Point3D(pt2, minAlt), new Point3D(pt2, maxAlt), new Point3D(pt, maxAlt), new Point3D(pt, minAlt)]]);
                        shapes.push(sideShape);
                    }
                }
                shapes.push(bottomShape);
                shapes.push(topShape);
            }

            const modifierAlt = Math.max(...altitudes.slice(0, mSymbol.getSymbolShapes().length * 2));
            for (const oldShape of mSymbol.getModifierShapes()) {
                var modShape = new ShapeInfo3D();
                modShape.setModifierString(oldShape.getModifierString());
                modShape.setModifierPosition(new Point3D(oldShape.getModifierPosition(), modifierAlt));
                modShape.setModifierAngle(oldShape.getModifierAngle());
                modShape.setTextJustify(oldShape.getTextJustify());
                modShape.setModifierImage(oldShape.getModifierImageInfo());

                modifiers.push(modShape);
            }

            if (format === WebRenderer.OUTPUT_FORMAT_KML) {
                var textColor = mSymbol.getTextColor();
                if (textColor == null)
                    textColor = mSymbol.getLineColor();

                jsonOutput = Shape3DHandler.KMLize(id, name, description, symbolCode, shapes, modifiers, ipc, normalize, textColor, altitudeMode);
            } else if (format === WebRenderer.OUTPUT_FORMAT_GEOJSON) {
                jsonOutput += ("{\"type\":\"FeatureCollection\",\"features\":");
                jsonContent = Shape3DHandler.GeoJSONize(shapes, modifiers, ipc, normalize, mSymbol.getTextColor(), mSymbol.getTextBackgroundColor());
                jsonOutput += (jsonContent);

                //moving meta data properties to the last feature with no coords as feature collection doesn't allow properties
                jsonOutput = jsonOutput.slice(0, -1);
                if (jsonContent.length > 2)
                    jsonOutput += ",";
                jsonOutput += ("{\"type\": \"Feature\",\"geometry\": { \"type\": \"Polygon\",\"coordinates\": [ ]}");

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
                jsonOutput += ("\"}}]}");
            }
        } catch (exc) {
            if (exc instanceof Error) {
                let st: string = JavaRendererUtilities.getStackTrace(exc);
                jsonOutput = "";
                jsonOutput += ("{\"type\":\"error\",\"error\":\"There was an error creating the MilStdSymbol " + symbolCode + ": " + "- ");
                jsonOutput += (exc.message + " - ");
                jsonOutput += (st);
                jsonOutput += ("\"}");

                ErrorLogger.LogException("Shape3DHandler", "RenderBasic3DShape", exc);
            } else {
                throw exc;
            }
        }

        ErrorLogger.LogMessage("Shape3DHandler", "RenderBasic3DShape()", "exit RenderBasic3DShape", LogLevel.FINER);
        return jsonOutput.toString();
    }

    /**
     * 3D Version of {@link MultiPointHandler.KMLize()}
     */
    private static KMLize(id: string,
        name: string,
        description: string,
        symbolCode: string,
        shapes: Array<ShapeInfo3D>,
        modifiers: Array<ShapeInfo3D>,
        ipc: IPointConversion,
        normalize: boolean,
        textColor: Color,
        altitudeMode: string): string {

        let kml: string = "";

        let tempModifier: ShapeInfo3D;

        let cdataStart: string = "<![CDATA[";
        let cdataEnd: string = "]]>";

        let len: int = shapes.length;
        kml += ("<Folder id=\"" + id + "\">");
        kml += ("<name>" + cdataStart + name + cdataEnd + "</name>");
        kml += ("<visibility>1</visibility>");
        for (let i: int = 0; i < len; i++) {
            let shapesToAdd: string = Shape3DHandler.ShapeToKMLString(name, description, symbolCode, shapes[i], ipc, normalize, altitudeMode);
            kml += (shapesToAdd);
        }

        let len2: int = modifiers.length;

        for (let j: int = 0; j < len2; j++) {

            tempModifier = modifiers[j];

            //if(geMap)//if using google earth
            //assume kml text is going to be centered
            //AdjustModifierPointToCenter(tempModifier);

            let labelsToAdd: string = Shape3DHandler.LabelToKMLString(tempModifier, ipc, normalize, textColor, altitudeMode);
            kml += (labelsToAdd);
        }

        kml += ("</Folder>");
        return kml.toString();
    }

    /**
     * 3D Version of {@link MultiPointHandler.ShapeToKMLString()}
     */
    private static ShapeToKMLString(name: string,
        description: string,
        symbolCode: string,
        shapeInfo: ShapeInfo3D,
        ipc: IPointConversion,
        normalize: boolean,
        altitudeMode: string): string {

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
            googleLineColor = RendererUtilities.colorToHexString(shapeInfo.getLineColor(), true).substring(1);
            googleLineColor = JavaRendererUtilities.ARGBtoABGR(googleLineColor);

            stroke = shapeInfo.getStroke();
            if (stroke != null) {
                lineWidth = stroke.getLineWidth() as int;
            }

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
                googleFillColor = RendererUtilities.colorToHexString(shapeInfo.getFillColor(), true).substring(1);
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

        let shapesArray: Point3D[][] = shapeInfo.getPolylines();
        let len: int = shapesArray.length;
        kml += ("<MultiGeometry>");

        for (let i: int = 0; i < len; i++) {
            let shape: Point3D[] = shapesArray[i];
            normalize = MultiPointHandler.normalizePoints(shape, ipc);
            if (lineColor != null && fillColor == null) {
                kml += ("<Polygon>");
                kml += ("<tessellate>1</tessellate>");
                kml += ("<altitudeMode>" + altitudeMode + "</altitudeMode>");
                kml += ("<outerBoundaryIs><LinearRing><coordinates>");
                let n: int = shape.length;
                //for (int j = 0; j < shape.length; j++) 
                for (let j: int = 0; j < n; j++) {
                    let coord: Point3D = shape[j] as Point3D;
                    let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                    if (normalize) {
                        geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                    }

                    let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
                    let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
                    let altitude: double = coord.getZ();

                    kml += (longitude);
                    kml += (",");
                    kml += (latitude);
                    kml += (",");
                    kml += (altitude);
                    if (j < shape.length - 1) {

                        kml += (" ");
                    }
                }

                kml += ("</coordinates></LinearRing></outerBoundaryIs>");
                kml += ("</Polygon>");
            }

            if (fillColor != null) {

                if (i === 0) {
                    kml += ("<Polygon>");
                    kml += ("<tessellate>1</tessellate>");
                    kml += ("<altitudeMode>" + altitudeMode + "</altitudeMode>");
                }
                //kml += ("<outerBoundaryIs>");
                if (i === 1 && len > 1) {
                    kml += ("<innerBoundaryIs>");
                } else {
                    kml += ("<outerBoundaryIs>");
                }
                kml += ("<LinearRing>");
                kml += ("<coordinates>");

                let n: int = shape.length;
                //for (int j = 0; j < shape.length; j++) 
                for (let j: int = 0; j < n; j++) {
                    let coord: Point3D = shape[j] as Point3D;
                    let geoCoord: Point2D = ipc.PixelsToGeo(coord);

                    let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
                    let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
                    let altitude: double = coord.getZ();

                    //fix for fill crossing DTL
                    if (normalize) {
                        if (longitude > 0) {
                            longitude -= 360;
                        }
                    }

                    kml += (longitude);
                    kml += (",");
                    kml += (latitude);
                    kml += (",");
                    kml += (altitude);
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
     * 3D Version of {@link MultiPointHandler.LabelToKMLString()}
     */
    private static LabelToKMLString(shapeInfo: ShapeInfo3D, ipc: IPointConversion, normalize: boolean, textColor: Color, altitudeMode: string): string {
        let kml: string = "";

        //Point2D coord = (Point2D) new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY());
        let coord: Point3D = new Point3D(shapeInfo.getModifierPosition().getX(), shapeInfo.getModifierPosition().getY(), shapeInfo.getModifierPosition().getZ());
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        //M. Deutch 9-26-11
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
        let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
        let altitude: double = coord.getZ();
        let angle: number = Math.round(shapeInfo.getModifierAngle());

        let text: string = shapeInfo.getModifierString();

        let cdataStart: string = "<![CDATA[";
        let cdataEnd: string = "]]>";

        let color: string = RendererUtilities.colorToHexString(textColor, false).substring(1);
        color = JavaRendererUtilities.ARGBtoABGR(color);
        let kmlScale: double = RendererSettings.getInstance().getKMLLabelScale();

        if (kmlScale > 0 && text != null && text !== "") {
            kml += ("<Placemark>");//("<Placemark id=\"" + id + "_lp" + i + "\">");
            kml += ("<name>" + cdataStart + text + cdataEnd + "</name>");
            kml += ("<Style>");
            kml += ("<IconStyle>");
            kml += ("<scale>" + kmlScale + "</scale>");
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
            kml += ("<extrude>0</extrude>");
            kml += ("<altitudeMode>" + altitudeMode + "</altitudeMode>");
            kml += ("<coordinates>");
            kml += (longitude);
            kml += (",");
            kml += (latitude);
            kml += (",");
            kml += (altitude);
            kml += ("</coordinates>");
            kml += ("</Point>");
            kml += ("</Placemark>");
        } else {
            return "";
        }

        return kml.toString();
    }

    /**
     * 3D Version of {@link MultiPointHandler.GeoJSONize()}
     */
    private static GeoJSONize(shapes: Array<ShapeInfo3D>, modifiers: Array<ShapeInfo3D>, ipc: IPointConversion, normalize: boolean, textColor: Color, textBackgroundColor: Color): string {
        let tempModifier: ShapeInfo3D;
        let fc: string = "";//JSON feature collection

        fc += ("[");

        let len: int = shapes.length;
        for (let i: int = 0; i < len; i++) {
            let shapesToAdd: string = null;
            let tempShape: ShapeInfo3D = shapes[i];
            if (tempShape != null && tempShape !== undefined) {
                shapesToAdd = Shape3DHandler.ShapeToGeoJSONString(tempShape, ipc, normalize);
                if (shapesToAdd != null && shapesToAdd.length > 0) {
                    fc += (shapesToAdd);
                    if (i < len - 1) {
                        fc += (",");
                    }
                }
            }
        }

        let len2: int = modifiers.length;

        for (let j: int = 0; j < len2; j++) {
            tempModifier = modifiers[j];

            let modifiersToAdd: string;
            if (modifiers[j].getModifierImage() != null) {
                modifiersToAdd = Shape3DHandler.ImageToGeoJSONString(tempModifier, ipc, normalize);
            } else {
                modifiersToAdd = Shape3DHandler.LabelToGeoJSONString(tempModifier, ipc, normalize, textColor, textBackgroundColor);
            }
            if (modifiersToAdd.length > 0) {
                if (fc.length > 1)
                    fc += (",");
                fc += (modifiersToAdd);
            }
        }
        fc += ("]");
        let GeoJSON: string = fc.toString();
        return GeoJSON;
    }

    /**
     * 3D Version of {@link MultiPointHandler.ShapeToGeoJSONString()}
     */
    private static ShapeToGeoJSONString(shapeInfo: ShapeInfo3D, ipc: IPointConversion, normalize: boolean): string {
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
        } else if (lineCap === BasicStroke.CAP_ROUND) {
            properties += ("\"stroke-linecap\":\"round\",");
        } else if (lineCap === BasicStroke.CAP_BUTT) {
            properties += ("\"stroke-linecap\":\"butt\",");
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
                let coord: Point3D = pointList[j] as Point3D;
                let geoCoord: Point2D = ipc.PixelsToGeo(coord);
                //M. Deutch 9-27-11
                if (normalize) {
                    geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
                }
                let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
                let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
                let altitude: double = coord.getZ();

                //fix for fill crossing DTL
                if (normalize && fillColor != null) {
                    if (longitude > 0) {
                        longitude -= 360;
                    }
                }

                //diagnostic M. Deutch 10-18-11
                //set the point as geo so that the 
                //coord.setLocation(longitude, latitude);
                coord = new Point3D(longitude, latitude, altitude);
                pointList[j] = coord;
                //end section

                geometry += ("[");
                geometry += (longitude);
                geometry += (",");
                geometry += (latitude);
                geometry += (",");
                geometry += (altitude);
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

    /**
     * 3D Version of {@link MultiPointHandler.ImageToGeoJSONString()}
     */
    private static ImageToGeoJSONString(shapeInfo: ShapeInfo3D, ipc: IPointConversion, normalize: boolean): string {
        let JSONed: string = "";

        //AffineTransform at = shapeInfo.getAffineTransform();
        //Point2D coord = (Point2D)new Point2D(at.getTranslateX(), at.getTranslateY());
        //Point2D coord = (Point2D) new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY());
        let coord: Point3D = new Point3D(shapeInfo.getModifierPosition().getX(), shapeInfo.getModifierPosition().getY(), shapeInfo.getModifierPosition().getZ());
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        //M. Deutch 9-27-11
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
        let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
        let altitude: double = coord.getZ();
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
            JSONed += (",");
            JSONed += (altitude);
            JSONed += ("]");
            JSONed += ("}}");

        } else {
            return "";
        }

        return JSONed.toString();
    }

    /**
     * 3D Version of {@link MultiPointHandler.LabelToGeoJSONString()}
     */
    private static LabelToGeoJSONString(shapeInfo: ShapeInfo3D, ipc: IPointConversion, normalize: boolean, textColor: Color, textBackgroundColor: Color): string {
        let JSONed: string = "";

        let outlineColor: Color = MultiPointHandler.getIdealTextBackgroundColor(textColor);
        if (textBackgroundColor != null) {
            outlineColor = textBackgroundColor;
        }

        //AffineTransform at = shapeInfo.getAffineTransform();
        //Point2D coord = (Point2D)new Point2D(at.getTranslateX(), at.getTranslateY());
        //Point2D coord = (Point2D) new Point2D(shapeInfo.getGlyphPosition().getX(), shapeInfo.getGlyphPosition().getY());
        let coord: Point3D = new Point3D(shapeInfo.getModifierPosition().getX(), shapeInfo.getModifierPosition().getY(), shapeInfo.getModifierPosition().getZ());
        let geoCoord: Point2D = ipc.PixelsToGeo(coord);
        //M. Deutch 9-27-11
        if (normalize) {
            geoCoord = MultiPointHandler.NormalizeCoordToGECoord(geoCoord);
        }
        let latitude: double = Math.round(geoCoord.getY() * 100000000.0) / 100000000.0;
        let longitude: double = Math.round(geoCoord.getX() * 100000000.0) / 100000000.0;
        let altitude: double = coord.getZ();
        let angle: double = shapeInfo.getModifierAngle();
        coord.setLocation(longitude, latitude);

        //diagnostic M. Deutch 10-18-11
        shapeInfo.setGlyphPosition(coord);

        let text: string = shapeInfo.getModifierString();

        let justify: int = shapeInfo.getTextJustify();
        let strJustify: string = "left";
        if (justify === 0) {
            strJustify = "left";
        } else if (justify === 1) {
            strJustify = "center";
        } else if (justify === 2) {
            strJustify = "right";
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
            JSONed += (",");
            JSONed += (altitude);
            JSONed += ("]");
            JSONed += ("}}");

        } else {
            return "";
        }

        return JSONed.toString();
    }
}