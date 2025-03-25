import { type int, type double } from "../../../graphics2d/BasicTypes";
import { Point2D } from "../../../graphics2d/Point2D";
import { MilStdAttributes } from "../../../renderer/utilities/MilStdAttributes";
import { Modifiers } from "../../../renderer/utilities/Modifiers";

/**
 *
 */
export class JavaRendererUtilities {

    public static readonly HOSTILE_FILL_COLOR: string = "FFFF8080";
    public static readonly FRIENDLY_FILL_COLOR: string = "FF80E0FF";
    public static readonly NEUTRAL_FILL_COLOR: string = "FFAAFFAA";
    public static readonly UNKNOWN_FILL_COLOR: string = "FFFFFF80";

    /**
     * Converts ARGB string format to the Google used ABGR string format. Google
     * reverses the blue and red positioning.
     *
     * @param rgbString A color string of the format AARRGGBB in hex value.
     * @return the reverse of the input string in hex. The format should now be
     * AABBGGRR
     */
    public static ARGBtoABGR(rgbString: string): string {
        if (rgbString.length === 6) {
            let s: string = "FF";
            rgbString = s.concat(rgbString);
        }

        let bgrString: string = rgbString.toUpperCase();

        if (rgbString.length === 8) {
            let c: string[] = rgbString.split("");
            let temp1: string = c[2];
            let temp2: string = c[3];
            c[2] = c[6];
            c[3] = c[7];
            c[6] = temp1;
            c[7] = temp2;
            bgrString = c.join();
        }
        else {
            if (rgbString.length === 6) {
                let c: string[] = rgbString.split("");
                let temp1: string = c[0];
                let temp2: string = c[1];
                c[0] = c[4];
                c[1] = c[5];
                c[4] = temp1;
                c[5] = temp2;
                bgrString = "FF" + c.join();
                //bgrString = "FF" + bgrString;
            }
            else {
                console.error("JavaRendererUtilties.ARGBtoABGR(): " + "\"" + rgbString.toString() + "\" is not a 6 or 8 character String in the format of RRGGBB or AARRGGBB");
            }
        }


        return bgrString;
    }

    /**
     * Returns a symbolId with just the identifiable symbol Id pieces. All
     * variable information is returned as '*'. For example, a boundary,
     * "GFGPGLB----KUSX" returns "G*G*GLB---****X";
     *
     * @param symbolCode A 15 character symbol ID.
     * @return The normalized SymbolCode.
     * @deprecated
     */
    public static normalizeSymbolCode(symbolCode: string): string {

        let newSymbolCode: string = symbolCode;

        if (symbolCode.startsWith("G") || symbolCode.startsWith("S")) {
            // Remove Affiliation
            newSymbolCode = newSymbolCode.substring(0, 1) + '*' + newSymbolCode.substring(2);
            // Remove planned/present field
            newSymbolCode = newSymbolCode.substring(0, 3) + '*' + newSymbolCode.substring(4);
            // Remove echelon, special code and country codes
            newSymbolCode = newSymbolCode.substring(0, 10) + "****" + newSymbolCode.substring(14);
        }

        // If a unit replace last character with *.
        if (symbolCode.startsWith("S")) {
            newSymbolCode = newSymbolCode.substring(0, 14) + '*';
        }

        return newSymbolCode;
    }

    public static addAltModeToModifiersString(attributes: Map<string, string>, altMode: string): void {
        if (altMode === "relativeToGround") {

            attributes.set(MilStdAttributes.AltitudeMode, "AGL");
        }

        else {
            if (altMode === "absolute") {

                attributes.set(MilStdAttributes.AltitudeMode, "AMSL");
            }

        }

    }

    /**
     *
     * @param SymbolInfo something like
     * "SymbolID?LineColor=0x000000&amp;FillColor=0xFFFFFF&amp;size=35"
     */
    public static createParameterMapFromURL(SymbolInfo: string): Map<string, string> {
        let modifiers: Map<string, string> = new Map<string, string>();
        let symbolID: string;
        let parameters: string;
        let key: string;
        let value: string;
        let arrParameters: string[];
        let arrKeyValue: string[];
        let temp: string;
        let questionIndex: int = SymbolInfo.lastIndexOf('?');

        try {
            if (questionIndex === -1) {
                symbolID = decodeURI(SymbolInfo);
            } else {
                symbolID = decodeURI(SymbolInfo.substring(0, questionIndex));
            }

        } catch (exc) {
            if (exc instanceof Error) {
                console.error("Error parsing SymbolID");
                console.error(exc.message);
            } else {
                throw exc;
            }
        }

        try {   //build a map for the other createMilstdSymbol function to use
            //to build a milstd symbol.
            if (questionIndex > 0 && (questionIndex + 1 < SymbolInfo.length)) {
                parameters = SymbolInfo.substring(questionIndex + 1, SymbolInfo.length);
                arrParameters = parameters.split("&");
                let n: int = arrParameters.length;
                //for(int i = 0; i < arrParameters.length; i++)
                for (let i: int = 0; i < n; i++) {
                    arrKeyValue = arrParameters[i].split("=");
                    if (arrKeyValue.length === 2 && arrKeyValue[1] != null && arrKeyValue[1] !== "") {

                        key = arrKeyValue[0];
                        value = arrKeyValue[1];

                        temp = decodeURI(value);
                        modifiers.set(key.toUpperCase(), temp);

                        //console.log("key: " + key + " value: " + temp);
                    }
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                console.error("Error parsing \"" + key.toUpperCase() + "\" parameter from URL");
                console.error(exc.message);
            } else {
                throw exc;
            }
        }
        return modifiers;
    }

    /*
     * Try to turn a bad code into something renderable.
     *
     * @param symbolID
     * @return
     * @deprecated use SymbolUtilties.reconcileSymbolID() 9/5/2013
     */
    /*public static String ReconcileSymbolID(String symbolID) {
        StringBuilder sb = new StringBuilder("");
        char codingScheme = symbolID.charAt(0);

        if (symbolID.length < 15) {
            while (symbolID.length < 15) {
                symbolID += "-";
            }
        }
        if (symbolID.length > 15) {
            symbolID = symbolID.substring(0, 14);
        }

        if (symbolID != null && symbolID.length == 15) {
            if (codingScheme == 'S' || //warfighting
                    codingScheme == 'I' ||//sigint
                    codingScheme == 'O' ||//stability operation
                    codingScheme == 'E')//emergency management
            {
                sb.append(codingScheme);

                if (SymbolUtilities.hasValidAffiliation(symbolID) == false) {
                    sb.append('U');
                } else {
                    sb.append(symbolID.charAt(1));
                }

                if (SymbolUtilities.hasValidBattleDimension(symbolID) == false) {
                    sb.append('Z');
                    sb.replace(0, 1, "S");
                } else {
                    sb.append(symbolID.charAt(2));
                }

                if (SymbolUtilities.hasValidStatus(symbolID) == false) {
                    sb.append('P');
                } else {
                    sb.append(symbolID.charAt(3));
                }

                sb.append("------");
                sb.append(symbolID.substring(10, 15));

            } else if (codingScheme == 'G')//tactical
            {
                sb.append(codingScheme);

                if (SymbolUtilities.hasValidAffiliation(symbolID) == false) {
                    sb.append('U');
                } else {
                    sb.append(symbolID.charAt(1));
                }

                sb.append('G');

                if (SymbolUtilities.hasValidStatus(symbolID) == false) {
                    sb.append('P');
                } else {
                    sb.append(symbolID.charAt(3));
                }

                sb.append("GPP---");//return an action point
                sb.append(symbolID.substring(10, 15));

            } else if (codingScheme == 'W')//weather
            {//no default weather graphic
                return "SUZP-----------";//unknown
            } else//bad codingScheme
            {
                sb.append('S');
                if (SymbolUtilities.hasValidAffiliation(symbolID) == false) {
                    sb.append('U');
                } else {
                    sb.append(symbolID.charAt(1));
                }

                if (SymbolUtilities.hasValidBattleDimension(symbolID) == false) {
                    sb.append('Z');
                } else {
                    sb.append(symbolID.charAt(2));
                }

                if (SymbolUtilities.hasValidStatus(symbolID) == false) {
                    sb.append('P');
                } else {
                    sb.append(symbolID.charAt(3));
                }

                sb.append("------");
                sb.append(symbolID.substring(10, 15));
            }
        } else {
            return "SUZP-----------";//unknown
        }

        return sb.toString();

    }//*/

    /**
     * Checks symbolID and if the relevant modifiers are present
     *
     * @param symbolCode
     * @param modifiers
     * @return
     * @deprecated
     */
    public static is3dSymbol(symbolCode: string, modifiers: Map<string, string>): boolean {
        let returnValue: boolean = false;

        try {
            let symbolId: string = symbolCode.substring(4, 10);

            if (symbolId === "ACAI--" || // Airspace Coordination Area Irregular
                symbolId === "ACAR--" || // Airspace Coordination Area Rectangular
                symbolId === "ACAC--" || // Airspace Coordination Area Circular
                symbolId === "AKPC--" || // Kill box circular
                symbolId === "AKPR--" || // Kill box rectangular
                symbolId === "AKPI--" || // Kill box irregular
                symbolId === "ALC---" || // Air corridor
                symbolId === "ALM---" || // 
                symbolId === "ALS---" || // SAAFR
                symbolId === "ALU---" || // UAV
                symbolId === "ALL---" || // Low level transit route
                symbolId === "AAR---"
                || symbolId === "AAF---"
                || symbolId === "AAH---"
                || symbolId === "AAM---" || // MEZ
                symbolId === "AAML--" || // LOMEZ
                symbolId === "AAMH--") {

                try {
                    if (modifiers != null) {

                        // These guys store array values.  Put in appropriate data strucutre
                        // for MilStdSymbol.
                        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                            let altitudes: string[] = modifiers.get(Modifiers.X_ALTITUDE_DEPTH).split(",");
                            if (altitudes.length < 2) {
                                returnValue = false;
                            } else {
                                returnValue = true;
                            }
                        }

                    }
                } catch (exc) {
                    if (exc instanceof Error) {
                        console.error(exc.message);
                    } else {
                        throw exc;
                    }
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            } else {
                throw e;
            }
        }
        return returnValue;
    }

    /**
     * Determines if a String represents a valid number
     *
     * @param text
     * @return "1.56" == true, "1ab" == false
     */
    public static isNumber(text: string): boolean {
        if (text != null && RegExp("((-|\\+)?[0-9]+(\\.[0-9]+)?)+").test(text)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Takes a throwable and puts it's stacktrace into a string.
     *
     * @param thrown
     * @return
     */
    public static getStackTrace(thrown: Error): string {
        try {
            /*
            let writer: java.io.Writer = new java.io.StringWriter();
            let printWriter: java.io.PrintWriter = new java.io.PrintWriter(writer);
            thrown.printStackTrace(printWriter);
            return writer.toString();
            */
            return thrown.stack;
        } catch (exc) {
            if (exc instanceof Error) {
                //console.log("JavaRendererUtilties.getStackTrace()");
                //return "Error - couldn't retrieve stack trace";
                return "";
            } else {
                throw exc;
            }
        }
    }

    public static getEndPointWithAngle(ptStart: Point2D,
        //Point2D pt1,
        //Point2D pt2,
        angle: double,
        distance: double): Point2D {
        let newX: double = 0;
        let newY: double = 0;
        let pt: Point2D = new Point2D();
        try {
            //first get the angle psi between pt0 and pt1
            let psi: double = 0;//Math.atan((pt1.y - pt0.y) / (pt1.x - pt0.x));
            //double psi = Math.atan((ptStart.getY() - ptStart.getY()) / (ptStart.getX() - (ptStart.getX()+100)));
            //convert alpha to radians
            let alpha1: double = Math.PI * angle / 180;

            //theta is the angle of extension from the x axis
            let theta: double = psi + alpha1;
            //dx is the x extension from pt2
            let dx: double = distance * Math.cos(theta);
            //dy is the y extension form pt2
            let dy: double = distance * Math.sin(theta);
            newX = ptStart.getX() + dx;
            newY = ptStart.getY() + dy;

            pt.setLocation(newX, newY);
        } catch (exc) {
            if (exc instanceof Error) {
                console.log(exc.message);
                console.log(exc.stack)
            } else {
                throw exc;
            }
        }
        return pt;
    }

    /**
     *
     * @param latitude1
     * @param longitude1
     * @param latitude2
     * @param longitude2
     * @param unitOfMeasure meters, kilometers, miles, feet, yards, nautical,
     * nautical miles.
     * @return
     */
    public static measureDistance(latitude1: double, longitude1: double, latitude2: double, longitude2: double, unitOfMeasure: string): double {
        // latitude1,latitude2 = latitude, longitude1,longitude2 = longitude
        //Radius is 6378.1 (km), 3963.1 (mi), 3443.9 (nm

        let distance: double = -1;
        let
            rad: double = 0;

        let uom: string = unitOfMeasure.toLowerCase();

        if (uom === "meters") {
            rad = 6378137;
        } else {
            if (uom === "kilometers") {
                rad = 6378.137;
            } else {
                if (uom === "miles") {
                    rad = 3963.1;
                } else {
                    if (uom === "feet") {
                        rad = 20925524.9;
                    } else {
                        if (uom === "yards") {
                            rad = 6975174.98;
                        } else {
                            if (uom === "nautical") {
                                rad = 3443.9;
                            } else {
                                if (uom === "nautical miles") {
                                    rad = 3443.9;
                                } else {
                                    return -1.0;
                                }
                            }

                        }

                    }

                }

            }

        }


        latitude1 = latitude1 * (Math.PI / 180);
        latitude2 = latitude2 * (Math.PI / 180);
        longitude1 = longitude1 * (Math.PI / 180);
        longitude2 = longitude2 * (Math.PI / 180);
        distance = (Math.acos(Math.cos(latitude1) * Math.cos(longitude1) * Math.cos(latitude2) * Math.cos(longitude2) + Math.cos(latitude1) * Math.sin(longitude1) * Math.cos(latitude2) * Math.sin(longitude2) + Math.sin(latitude1) * Math.sin(latitude2)) * rad);

        return distance;
    }
}
