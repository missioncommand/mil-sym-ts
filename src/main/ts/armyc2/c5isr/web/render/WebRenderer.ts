
// This import is if we need to call a javascript function
// It requires that you import the plugins.jar from the jdk folder into the project libraries
//import netscape.javascript.JSObject;



import { type long, type double, type int } from "../../../c5isr/graphics2d/BasicTypes";
import { Font } from "../../graphics2d/Font";
import { Point2D } from "../../graphics2d/Point2D";
import { Rectangle2D } from "../../graphics2d/Rectangle2D";
import { Color } from "../../renderer/utilities/Color";
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger";
import { LogLevel } from "../../renderer/utilities/LogLevel";
import { MilStdAttributes } from "../../renderer/utilities/MilStdAttributes";
import { MilStdSymbol } from "../../renderer/utilities/MilStdSymbol";
import { Modifiers } from "../../renderer/utilities/Modifiers";
import { RendererSettings } from "../../renderer/utilities/RendererSettings";
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities";
import { MultiPointHandler } from "./MultiPointHandler";
import { SymbolModifiers } from "./SymbolModifiers";
import { JavaRendererUtilities } from "./utilities/JavaRendererUtilities";
import { RendererUtilities } from "../../renderer/utilities/RendererUtilities";
import { mdlGeodesic } from "../../JavaTacticalRenderer/mdlGeodesic"
import { POINT2 } from "../../JavaLineArray/POINT2";
import { ref } from "../../JavaLineArray/ref"



/**
 * Main class for rendering multi-point graphics such as Control Measures, Atmospheric, and Oceanographic.
 *
 */
//@SuppressWarnings("unused")
export class WebRenderer /* extends Applet */ {
    // private static readonly serialVersionUID: long = -2691218568602318366n;

    /**
     * @deprecated
     */
    public static readonly OUTPUT_FORMAT_JSON = 1;
    public static readonly OUTPUT_FORMAT_GEOJSON = 2;
    public static readonly OUTPUT_FORMAT_GEOSVG = 3;


    // Arbitrary default values of attributes
    public static readonly MIN_ALT_DEFAULT: double = 0.0;
    public static readonly MAX_ALT_DEFAULT: double = 100.0;
    public static readonly RADIUS1_DEFAULT: double = 50.0;
    public static readonly RADIUS2_DEFAULT: double = 100.0;
    public static readonly LEFT_AZIMUTH_DEFAULT: double = 0.0;
    public static readonly RIGHT_AZIMUTH_DEFAULT: double = 90.0;

    public static readonly ERR_ATTRIBUTES_NOT_FORMATTED: string = "{\"type\":\"error\","
        + "\"error\":\"The attribute paramaters are not formatted "
        + "correctly";

    public static readonly DEFAULT_ATTRIBUTES: string =
        `{"attributes":[{"radius1":${WebRenderer.RADIUS1_DEFAULT},
    "radius2":${WebRenderer.RADIUS2_DEFAULT},
    "minalt":${WebRenderer.MIN_ALT_DEFAULT},"maxalt":${WebRenderer.MAX_ALT_DEFAULT},
    "leftAzimuth":${WebRenderer.LEFT_AZIMUTH_DEFAULT},"rightAzimuth":${WebRenderer.RIGHT_AZIMUTH_DEFAULT}}]}`;


    private static _initSuccess: boolean = false;


    private static init(): void {
        try {
            if (WebRenderer._initSuccess === false) {
                //use WebRenderer.setLoggingLevel()

                //sets default value for single point symbology to have an outline.
                //outline color will be automatically determined based on line color
                //unless a color value is manually set.

                //Set Renderer Settings/////////////////////////////////////////////
                RendererSettings.getInstance().setTextBackgroundMethod(
                    RendererSettings.TextBackgroundMethod_OUTLINE_QUICK);
                //RendererSettings.getInstance().setLabelForegroundColor(Color.BLACK);
                //RendererSettings.getInstance().setLabelBackgroundColor(new Color(255, 255, 255, 200));
                RendererSettings.getInstance().setLabelFont("arial", Font.PLAIN, 12);
                ErrorLogger.setLevel(LogLevel.FINE);

                WebRenderer._initSuccess = true;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("WebRenderer", "init", exc, LogLevel.WARNING);
            } else {
                throw exc;
            }
        }


    }

 /**\
     * Set minimum level at which an item can be logged.
     * In descending order:
     * OFF = Integer.MAX_VALUE
     * Severe = 1000
     * Warning = 900
     * Info = 800
     * Config = 700
     * Fine = 500
     * Finer = 400
     * Finest = 300
     * All = Integer.MIN_VALUE
     * Use like WebRenderer.setLoggingLevel(Level.INFO);
     * or
     * Use like WebRenderer.setLoggingLevel(800);
     */
    public static setLoggingLevel(level: LogLevel | int): void {
        if (level instanceof LogLevel) {
            try {
                ErrorLogger.setLevel(level, true);
                ErrorLogger.LogMessage("WebRenderer", "setLoggingLevel(Level)",
                    "Logging level set to: " + ErrorLogger.getLevel().getName(),
                    LogLevel.CONFIG);
            } catch (exc) {
                if (exc instanceof Error) {
                    ErrorLogger.LogException("WebRenderer", "setLoggingLevel(Level)", exc, LogLevel.INFO);
                } else {
                    throw exc;
                }
            }
        } else {
            try {
                if (level > 1000) {
                    ErrorLogger.setLevel(LogLevel.OFF, true);
                } else if (level > 900) {
                    ErrorLogger.setLevel(LogLevel.SEVERE, true);
                } else if (level > 800) {
                    ErrorLogger.setLevel(LogLevel.WARNING, true);
                } else if (level > 700) {
                    ErrorLogger.setLevel(LogLevel.INFO, true);
                } else if (level > 500) {
                    ErrorLogger.setLevel(LogLevel.CONFIG, true);
                } else if (level > 400) {
                    ErrorLogger.setLevel(LogLevel.FINE, true);
                } else if (level > 300) {
                    ErrorLogger.setLevel(LogLevel.FINER, true);
                } else if (level > Number.MIN_VALUE) {
                    ErrorLogger.setLevel(LogLevel.FINEST, true);
                } else {
                    ErrorLogger.setLevel(LogLevel.ALL, true);
                }

                ErrorLogger.LogMessage("WebRenderer", "setLoggingLevel(int)",
                    "Logging level set to: " + ErrorLogger.getLevel().getName(),
                    LogLevel.CONFIG);
            } catch (exc) {
                if (exc instanceof Error) {
                    ErrorLogger.LogException("WebRenderer", "setLoggingLevel(int)", exc, LogLevel.INFO);
                } else {
                    throw exc;
                }
            }
        }
    }


    /**
     * Single Point Tactical Graphics are rendered from font files.
     * The font size you specify here determines how big the symbols will 
     * be rendered.  This should be set once at startup.
     * @param size 
     */
    public static setTacticalGraphicPointSize(size: int): void {
        //        sps.setTacticalGraphicPointSize(size);
    }

    /**
     * Units are rendered from font files.
     * The font size you specify here determines how big the symbols will 
     * be rendered.  This should be set once at startup. 
     * @param size 
     */
    public static setUnitPointSize(size: int): void {
        //        sps.setUnitPointSize(size);
    }

    /**
     * Modifier Text Color will by default match the line color.
     * This will override all modifier text color.
     * @param hexColor 
     */
    /*    public static void setModifierTextColor(String hexColor)
        {
            Color textColor = RendererUtilities.getColorFromHexString(hexColor);
            if(textColor==null)
            {
                textColor = Color.black;
            }
            RendererSettings.getInstance().setLabelForegroundColor(textColor);
        }*/





    /**
     * Renders all multi-point symbols, creating KML that can be used to draw
     * it on a Google map.  Multipoint symbols cannot be draw the same 
     * at different scales. For instance, graphics with arrow heads will need to 
     * redraw arrowheads when you zoom in on it.  Similarly, graphics like a 
     * Forward Line of Troops drawn with half circles can improve performance if 
     * clipped when the parts of the graphic that aren't on the screen.  To help 
     * readjust graphics and increase performance, this function requires the 
     * scale and bounding box to help calculate the new locations.
     * @param id A unique identifier used to identify the symbol by Google map. 
     * The id will be the folder name that contains the graphic.
     * @param name a string used to display to the user as the name of the 
     * graphic being created.
     * @param description a brief description about the graphic being made and 
     * what it represents.
     * @param symbolCode A 20-30 digit symbolID corresponding to one of the
     * graphics in the MIL-STD-2525D
     * @param controlPoints The vertices of the graphics that make up the
     * graphic.  Passed in the format of a string, using decimal degrees 
     * separating lat and lon by a comma, separating coordinates by a space.  
     * The following format shall be used "x1,y1[,z1] [xn,yn[,zn]]..."
     * @param altitudeMode Indicates whether the symbol should interpret 
     * altitudes as above sea level or above ground level. Options are 
     * "clampToGround", "relativeToGround" (from surface of earth), "absolute" 
     * (sea level), "relativeToSeaFloor" (from the bottom of major bodies of 
     * water).
     * @param scale A number corresponding to how many meters one meter of our 
     * map represents. A value "50000" would mean 1:50K which means for every 
     * meter of our map it represents 50000 meters of real world distance.
     * @param bbox The viewable area of the map.  Passed in the format of a
     * string "lowerLeftX,lowerLeftY,upperRightX,upperRightY." Not required
     * but can speed up rendering in some cases.
     * example: "-50.4,23.6,-42.2,24.2"
     * @param modifiers {@link Map}, keyed using constants from Modifiers.
     * Pass in comma delimited String for modifiers with multiple values like AM, AN &amp; X
     * @param attributes {@link Map}, keyed using constants from MilStdAttributes.
     * @param format An enumeration: 2 for GeoJSON.
     * @return A JSON string representation of the graphic.
     */
    public static RenderSymbol(id: string, name: string, description: string,
        symbolCode: string, controlPoints: string, altitudeMode: string,
        scale: double, bbox: string, modifiers: Map<string, string>, attributes: Map<string, string>, format: int): string {
        let output: string = "";
        try {

            JavaRendererUtilities.addAltModeToModifiersString(attributes, altitudeMode);

            
            output = MultiPointHandler.RenderSymbol(id, name, description, symbolCode, controlPoints,
                scale, bbox, modifiers, attributes, format);

            //DEBUGGING
            if (ErrorLogger.getLevel().intValue() <= LogLevel.FINER.intValue()) {
                console.log("");
                let sb: string = "";
                sb += ("\nID: " + id + "\n");
                sb += ("Name: " + name + "\n");
                sb += ("Description: " + description + "\n");
                sb += ("SymbolID: " + symbolCode + "\n");
                sb += ("Scale: " + scale.toString() + "\n");
                sb += ("BBox: " + bbox + "\n");
                sb += ("Coords: " + controlPoints + "\n");
                sb += ("Modifiers: " + modifiers + "\n");
                ErrorLogger.LogMessage("WebRenderer", "RenderSymbol", sb.toString(), LogLevel.FINER);
            }
            if (ErrorLogger.getLevel().intValue() <= LogLevel.FINEST.intValue()) {
                let briefOutput: string = output.replaceAll("</Placemark>", "</Placemark>\n");
                briefOutput = output.replaceAll("(?s)<description[^>]*>.*?</description>", "<description></description>");
                ErrorLogger.LogMessage("WebRenderer", "RenderSymbol", "Output:\n" + briefOutput, LogLevel.FINEST);
            }
        


        } catch (ea) {
            if (ea instanceof Error) {

                output = "{\"type\":'error',error:'There was an error creating the MilStdSymbol - " + ea.toString() + "'}";
                ErrorLogger.LogException("WebRenderer", "RenderSymbol", ea, LogLevel.WARNING);
            } else {
                throw ea;
            }
        }

        return output;
    }





    /**
     * Renders all multi-point symbols, creating KML or JSON for the user to
     * parse and render as they like.
     * This function requires the bounding box to help calculate the new
     * locations.
     * @param id A unique identifier used to identify the symbol by Google map.
     * The id will be the folder name that contains the graphic.
     * @param name a string used to display to the user as the name of the 
     * graphic being created.
     * @param description a brief description about the graphic being made and 
     * what it represents.
     * @param symbolCode A 20-30 digit symbolID corresponding to one of the
     * graphics in the MIL-STD-2525D
     * @param controlPoints The vertices of the graphics that make up the
     * graphic.  Passed in the format of a string, using decimal degrees
     * separating lat and lon by a comma, separating coordinates by a space.
     * The following format shall be used "x1,y1 [xn,yn]..."
     * @param pixelWidth pixel dimensions of the viewable map area
     * @param pixelHeight pixel dimensions of the viewable map area
     * @param bbox The viewable area of the map.  Passed in the format of a
     * string "lowerLeftX,lowerLeftY,upperRightX,upperRightY."
     * example: "-50.4,23.6,-42.2,24.2"
     * @param modifiers {@link Map}, keyed using constants from Modifiers.
     * Pass in comma delimited String for modifiers with multiple values like AM, AN &amp; X
     * @param attributes {@link Map}, keyed using constants from MilStdAttributes.
     * @param format An enumeration: 2 for GeoJSON.
     * @return A JSON (1) or KML (0) string representation of the graphic.
     */
    public static RenderSymbol2D(id: string, name: string, description: string, symbolCode: string, controlPoints: string,
        pixelWidth: int, pixelHeight: int, bbox: string, modifiers: Map<string, string>,
        attributes: Map<string, string>, format: int): string {
        let output: string = "";
        try {
            output = MultiPointHandler.RenderSymbol2D(id, name, description,
                symbolCode, controlPoints, pixelWidth, pixelHeight, bbox,
                modifiers, attributes, format);
        } catch (exc) {
            if (exc instanceof Error) {
                output = "{\"type\":'error',error:'There was an error creating the MilStdSymbol: " + symbolCode + " - ID: " + id + " " + exc.toString() + "'}";
            } else {
                throw exc;
            }
        }
        return output;
    }


    /**
     * Renders all MilStd 2525 multi-point symbols, creating MilStdSymbol that contains the
     * information needed to draw the symbol on the map.
     * DOES NOT support RADARC, CAKE, TRACK etc...
     * ArrayList&lt;Point2D&gt; milStdSymbol.getSymbolShapes[index].getPolylines()
     * and 
     * ShapeInfo = milStdSymbol.getModifierShapes[index]. 
     * 
     * 
     * @param id
     *            A unique identifier used to identify the symbol by Google map.
     *            The id will be the folder name that contains the graphic.
     * @param name
     *            a string used to display to the user as the name of the
     *            graphic being created.
     * @param description
     *            a brief description about the graphic being made and what it
     *            represents.
     * @param symbolCode
     *            A 20-30 digit symbolID corresponding to one of the graphics
     *            in the MIL-STD-2525D
     * @param controlPoints
     *            The vertices of the graphics that make up the graphic. Passed
     *            in the format of a string, using decimal degrees separating
     *            lat and lon by a comma, separating coordinates by a space. The
     *            following format shall be used "x1,y1[,z1] [xn,yn[,zn]]..."
     * @param altitudeMode
     *            Indicates whether the symbol should interpret altitudes as
     *            above sea level or above ground level. Options are
     *            "clampToGround", "relativeToGround" (from surface of earth),
     *            "absolute" (sea level), "relativeToSeaFloor" (from the bottom
     *            of major bodies of water).
     * @param scale
     *            A number corresponding to how many meters one meter of our map
     *            represents. A value "50000" would mean 1:50K which means for
     *            every meter of our map it represents 50000 meters of real
     *            world distance.
     * @param bbox
     *            The viewable area of the map. Passed in the format of a string
     *            "lowerLeftX,lowerLeftY,upperRightX,upperRightY." Not required
     *            but can speed up rendering in some cases. example:
     *            "-50.4,23.6,-42.2,24.2"
     * @param modifiers
     *            Used like:
     *            modifiers.set(Modifiers.T_UNIQUE_DESIGNATION_1, "T");
     *            Or
     *            modifiers.set(Modifiers.AM_DISTANCE, "1000,2000,3000");
     * @param attributes
     * 			  Used like:
     *            attributes.set(MilStdAttributes.LineWidth, "3");
     *            Or
     *            attributes.set(MilStdAttributes.LineColor, "#00FF00");
     * @return MilStdSymbol
     */
    public static RenderMultiPointAsMilStdSymbol(id: string, name: string, description: string, symbolCode: string,
        controlPoints: string, altitudeMode: string, scale: double, bbox: string, modifiers: Map<string, string>, attributes: Map<string, string>): MilStdSymbol {
        let mSymbol: MilStdSymbol;
        try {
            mSymbol = MultiPointHandler.RenderSymbolAsMilStdSymbol(id, name, description, symbolCode,
                controlPoints, scale, bbox, modifiers, attributes);

            //Uncomment to show sector1 modifiers as fill pattern
            //            int symbolSet = SymbolID.getEntityCode(symbolCode);
            //            if(symbolSet == 270707 || symbolSet == 270800 || symbolSet == 270801 || symbolSet == 151100) //Mined Areas
            //            {
            //                int size = RendererSettings.getInstance().getDefaultPixelSize();
            //
            //                ArrayList<ShapeInfo> shapes = mSymbol.getSymbolShapes();
            //                if(shapes.length > 0){
            //                    ShapeInfo shape = shapes[0];
            //                    shape.setPatternFillImage(PatternFillRendererD.MakeSymbolPatternFill(symbolCode,size));
            //                    if(shape.getPatternFillImage() != null)
            //                        shape.setShader(new BitmapShader(shape.getPatternFillImage(), Shader.TileMode.REPEAT, Shader.TileMode.REPEAT));
            //                }
            //            }
        } catch (ea) {
            if (ea instanceof Error) {
                mSymbol = null;
                ErrorLogger.LogException("WebRenderer", "RenderMultiPointAsMilStdSymbol" + " - " + symbolCode, ea, LogLevel.WARNING);
            } else {
                throw ea;
            }
        }

        //console.log("RenderMultiPointAsMilStdSymbol exit");
        return mSymbol;
    }



    /**
     * Given a symbol code meant for a single point symbol, returns the
     * anchor point at which to display that image based off the image returned
     * from the URL of the SinglePointServer.
     * 
     * @param symbolID - the 20-30 digit symbolID of a single point MilStd2525
     * symbol. 
     * @return A pixel coordinate of the format "x,y".
     * Returns an empty string if an error occurs.
     * @deprecated 
     */
    public getSinglePointAnchor(symbolID: string): string {
        let anchorPoint: string = "";
        let anchor: Point2D = new Point2D();
        anchorPoint = anchor.getX() + "," + anchor.getY();
        return anchorPoint;
    }

    /**
     * Given a symbol code meant for a single point symbol, returns the
     * anchor point at which to display that image based off the image returned
     * from the URL of the SinglePointServer.
     *
     * @param symbolID - the 20-30 digit symbolID of a single point MilStd2525
     * symbol.
     * @return A pixel coordinate of the format "anchorX,anchorY,SymbolBoundsX,
     * SymbolBoundsY,SymbolBoundsWidth,SymbolBoundsHeight,IconWidth,IconHeight".
     * Anchor, represents the center point of the core symbol within the image.
     * The image should be centered on this point.
     * Symbol bounds represents the bounding rectangle of the core symbol within
     * the image.
     * IconWidth/Height represents the height and width of the image in its
     * entirety.
     * Returns an empty string if an error occurs.
     * @deprecated
     */
    public static getSinglePointInfo(symbolID: string): string {
        let info: string = "";
        let anchor: Point2D = new Point2D();
        let symbolBounds: Rectangle2D = new Rectangle2D();
        return info;
    }

    /**
     * Returns true if we recommend clipping a particular symbol.
     * Would return false for and Ambush but would return true for a Line of 
     * Contact due to the decoration on the line.
     * @param symbolID
     * @return 
     */
    public static ShouldClipMultipointSymbol(symbolID: string): string {
        if (MultiPointHandler.ShouldClipSymbol(symbolID)) {

            return "true";
        }

        else {

            return "false";
        }

    }

    /**
    * Given a symbol code meant for a single point symbol, returns the
    * symbol as a byte array.
    *
    * @param symbolID - the 20-30 digit symbolID of a single point MilStd2525
    * symbol.
    * @return byte array.
     * @deprecated
    */
    public static getSinglePointByteArray(symbolID: string): null {
        //return sps.getSinglePointByteArray(symbolID);
        return null;
    }

    /**
     * Converts a rectangle with two points and a width to a polygon that contains the four corners of the rectangle
     * 
     * @param endpoints the two end points of the rectangle
     * @param width  the width of the rectangle
     * @returns the points of a polygon containing the four points of a rectangle
     */
    public static getRectangleCorners(endpoints: string, width: number) {
        let pt0 = new POINT2();
        let pt1 = new POINT2();
        const points: POINT2[] = [];
    
        let attitude = new ref<number[]>();
        let a21 = new ref<number[]>();
    
        let coordinates = endpoints.split(" ");
        let latlon = coordinates[0].split(",");
        pt0.x = parseFloat(latlon[0]);
        pt0.y = parseFloat(latlon[1]);
    
        latlon = coordinates[1].split(",");
        pt1.x = parseFloat(latlon[0]);
        pt1.y = parseFloat(latlon[1]);
    
        mdlGeodesic.geodesic_distance(pt0, pt1, attitude, a21);
    
        points.push(mdlGeodesic.geodesic_coordinate(pt0, width / 2.0, attitude.value[0] - 90)); //top left
        points.push(mdlGeodesic.geodesic_coordinate(pt0, width / 2.0, attitude.value[0] + 90)); //top right
        points.push(mdlGeodesic.geodesic_coordinate(pt1, width / 2.0, attitude.value[0] + 90));  //bottom right
        points.push(mdlGeodesic.geodesic_coordinate(pt1, width / 2.0, attitude.value[0] - 90)); //bottom left
      
        let pointString = "";
        for(let point of points) {
          pointString += `${point.getX()},${point.getY()} `;
        }
        ;
        return pointString.trim();
    
    }
}
