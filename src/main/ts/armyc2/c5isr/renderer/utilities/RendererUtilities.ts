import { type float, type int } from "../../graphics2d/BasicTypes";

import { Color } from "../../renderer/utilities/Color"
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { SVGLookup } from "../../renderer/utilities/SVGLookup"
import { SymbolID } from "../../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities"
import { LogLevel } from "./LogLevel";
import { Rectangle2D } from "../../graphics2d/Rectangle2D";


export class RendererUtilities {

    private static readonly OUTLINE_SCALING_FACTOR: float = 2.5;

    public static async imgToBase64String(img: OffscreenCanvas): Promise<string> 
    {
        
        let ctx:OffscreenCanvasRenderingContext2D = img.getContext("2d");
        let blob:Blob = await img.convertToBlob();
        //const dataURL:any = new FileReaderSync().readAsDataURL(blob);//FileReaderSync() for web workers only
        const dataURL:any = new FileReader().readAsDataURL(blob);
        let strDataURL:String = new String(dataURL);
        return strDataURL.toString();

    }
    private static pastIdealOutlineColors: Map<number, Color> = new Map<number, Color>();
    /**
     * 
     * @param color {String} color like "#FFFFFF"
     * @return {String}
     */
    public static getIdealOutlineColor(color: Color): Color {
        let idealColor: Color = Color.white;

        if (color != null && RendererUtilities.pastIdealOutlineColors.has(color.toInt())) {
            return RendererUtilities.pastIdealOutlineColors.get(color.toInt());
        }//*/

        if (color != null) {
            let threshold: int = RendererSettings.getInstance().getTextBackgroundAutoColorThreshold();

            let r: int = color.getRed();
            let g: int = color.getGreen();
            let b: int = color.getBlue();

            let delta: float = ((r * 0.299) + (g * 0.587) + (b * 0.114));

            if ((255 - delta < threshold)) {
                idealColor = Color.black;
            }
            else {
                idealColor = Color.white;
            }
        }

        if (color != null) {
            RendererUtilities.pastIdealOutlineColors.set(color.toInt(), idealColor);
        }


        return idealColor;
    }

    /**
     * Create a copy of the {@Color} object with the passed alpha value.
     * @param color {@Color} object used for RGB values
     * @param alpha {@float} value between 0 and 1
     * @return
     */
    public static setColorAlpha(color: Color, alpha: float): Color {
        if (color != null) {
            if (alpha >= 0 && alpha <= 1) {

                return new Color(color.getRed(), color.getGreen(), color.getBlue(), Math.trunc(alpha * 255));
            }

            else {

                return color;
            }

        }
        else {

            return null;
        }

    }

    /**
     *
     * @param color
     * @return 8 character hex code, will have to prepend '#' or '0x' depending on your usage
     */
    private static ColorToHex(color: Color): string {
        //String hex = String.format("#%02x%02x%02x%02x", color.getAlpha(), color.getRed(), color.getGreen(), color.getBlue());
        let hex: string = color.getAlpha().toString(16).padStart(2, '0') + color.getRed().toString(16).padStart(2, '0') + color.getGreen().toString(16).padStart(2, '0') + color.getBlue().toString(16).padStart(2, '0')
        return hex;
    }

    /**
     *
     * @param color
     * @param withAlpha
     * @return
     */
    public static colorToHexString(color: Color, withAlpha: boolean): string {
        if (color != null) {
            return color.toHexString(withAlpha)
        } else {
            return "";
        }
    }

    /**
     * Clients should use getTextBounds
     * @param {String} fontName like "Arial" or "Arial, sans-serif" so a backup is
     * available in case 'Arial' is not present.
     * @param {Number} fontSize like 12
     * @param {String} fontStyle like "bold"
     * @param {String} text include if you want a width value.
     * @param {OffscreenCanvasRenderingContext2D}
     * @returns {Object} {width:Number,height:Number,descent:Number,fullHeight:Number}
     */
    public static measureText(fontName:string, fontSize:int, fontStyle:string, text:string,context:OffscreenCanvasRenderingContext2D | null):Rectangle2D;
    public static measureText(font:string, text:string,context:OffscreenCanvasRenderingContext2D | null):Rectangle2D;
    public static measureText(text:string,context:OffscreenCanvasRenderingContext2D):Rectangle2D;
    public static measureText(...args: unknown[])
    {
        let bounds:Rectangle2D;
        switch (args.length) 
        {
            case 2: //assumes font already set to context
            {
                const [text, context] = args as [string, OffscreenCanvasRenderingContext2D];
                if (arguments.length === 4)
                {
                    let tm:TextMetrics = context.measureText(text);
                    let top:number = tm.fontBoundingBoxAscent-1;
                    let left = -1;
                    //let bottom:number = tm.fontBoundingBoxDescent;
                    let width = tm.width+2;
                    width = tm.actualBoundingBoxRight + tm.actualBoundingBoxLeft;
                    let height:number = tm.fontBoundingBoxDescent + tm.fontBoundingBoxAscent+2;
                    bounds = new Rectangle2D(top, left, width, height);
                }
                break;
            }
            case 3: //sets font to context
            {
                const [font, text, context] = args as [string, string, OffscreenCanvasRenderingContext2D];
                if (arguments.length === 3)
                {
                    let ctx:OffscreenCanvasRenderingContext2D
                    var size:Rectangle2D;
                    if(context == null)
                    {
                        let osc:OffscreenCanvas = new OffscreenCanvas(10,10);
                        ctx = osc.getContext("2d");
                        ctx.font = font;

                        bounds = this.measureText(text, ctx);
                    }
                    else
                        bounds = this.measureText(text, context);
                }
                break;
            }
            case 5: //sets font to context
            {
                const [fontName, fontSize, fontStyle, text, context] = args as [string, number, string, string, OffscreenCanvasRenderingContext2D];
                if (arguments.length === 5)
                {
                    let font:string = fontStyle + " " + fontSize + "px " + fontName;
                    let ctx:OffscreenCanvasRenderingContext2D
                        var size:Rectangle2D;
                        if(context == null)
                        {
                            let osc:OffscreenCanvas = new OffscreenCanvas(10,10);
                            ctx = osc.getContext("2d");
                            ctx.font = font;
            
                            bounds = this.measureText(text, ctx);
                        }
                        else
                            bounds = this.measureText(text, context);
                }
                break;
            }
        }
        return bounds;
    }

    /**
     *
     * @param hexValue - String representing hex value (formatted "0xRRGGBB"
     * i.e. "0xFFFFFF") OR formatted "0xAARRGGBB" i.e. "0x00FFFFFF" for a color
     * with an alpha value I will also put up with "RRGGBB" and "AARRGGBB"
     * without the starting "0x" or "#"
     * @return
     */
    public static getColorFromHexString(hexValue: string): Color | null {

        try {
            if (hexValue == null || hexValue.length === 0) {

                return null;
            }

            let hexOriginal: string = hexValue;

            let hexAlphabet: string = "0123456789ABCDEF";

            if (hexValue.charAt(0) === '#') {
                hexValue = hexValue.substring(1);
            }
            if (hexValue.substring(0, 2) === "0x" || hexValue.substring(0, 2) === "0X") {
                hexValue = hexValue.substring(2);
            }

            hexValue = hexValue.toUpperCase();

            let count: int = hexValue.length;
            let value: number[];
            let k: int = 0;
            let int1: int = 0;
            let int2: int = 0;

            if (count === 8 || count === 6) {
                value = new Array<number>((count / 2));
                for (let i: int = 0; i < count; i += 2) {
                    int1 = hexAlphabet.indexOf(hexValue.charAt(i));
                    int2 = hexAlphabet.indexOf(hexValue.charAt(i + 1));

                    if (int1 === -1 || int2 === -1) {
                        ErrorLogger.LogMessage("SymbolUtilities", "getColorFromHexString", "Bad hex value: " + hexOriginal, LogLevel.WARNING);
                        return null;
                    }

                    value[k] = (int1 * 16) + int2;
                    k++;
                }

                if (count === 8) {
                    return new Color(value[1], value[2], value[3], value[0]);
                }
                else {
                    return new Color(value[0], value[1], value[2]);
                }
            }
            else {
                ErrorLogger.LogMessage("RendererUtilities", "getColorFromHexString", "Bad hex value: " + hexOriginal, LogLevel.WARNING);
            }
            return null;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("RendererUtilities", "getColorFromHexString", exc);
                return null;
            } else {
                throw exc;
            }
        }
    }

    /**
     * For Renderer Use Only
     * Assumes a fresh SVG String from the SVGLookup with its default values
     * @param symbolID
     * @param svg
     * @param strokeColor hex value like "#FF0000";
     * @param fillColor hex value like "#FF0000";
     * @return SVG String
     */
    public static setSVGFrameColors(symbolID: string, svg: string, strokeColor: Color, fillColor: Color): string {
        let returnSVG: string;
        let hexStrokeColor: string;
        let hexFillColor: string;
        let strokeAlpha: float = 1;
        let fillAlpha: float = 1;
        let strokeOpacity: string = "";
        let fillOpacity: string = "";

        let ss: int = SymbolID.getSymbolSet(symbolID);

        let affiliation: int = SymbolID.getAffiliation(symbolID);
        let defaultFillColor: string;
        if (strokeColor != null) {
            if (strokeColor.getAlpha() !== 255) {
                strokeAlpha = strokeColor.getAlpha() / 255.0;
                strokeOpacity = " stroke-opacity=\"" + strokeAlpha.toString() + "\"";
                fillOpacity = " fill-opacity=\"" + strokeAlpha.toString() + "\"";
            }

            hexStrokeColor = RendererUtilities.colorToHexString(strokeColor, false);
            returnSVG = svg.replaceAll("stroke=\"#000000\"", "stroke=\"" + hexStrokeColor + "\"" + strokeOpacity);
            returnSVG = returnSVG.replaceAll("fill=\"#000000\"", "fill=\"" + hexStrokeColor + "\"" + fillOpacity);

            if (ss === SymbolID.SymbolSet_LandInstallation ||
                ss === SymbolID.SymbolSet_Space ||
                ss === SymbolID.SymbolSet_CyberSpace ||
                ss === SymbolID.SymbolSet_Activities) {//add group fill so the extra shapes in these frames have the new frame color
                let svgStart: string = "<g id=\"" + SVGLookup.getFrameID(symbolID) + "\">";
                let svgStartReplace: string = svgStart.substring(0, svgStart.length - 1) + " fill=\"" + hexStrokeColor + "\"" + fillOpacity + ">";
                returnSVG = returnSVG.replace(svgStart, svgStartReplace);
            }

        }
        if (fillColor != null) {
            if (fillColor.getAlpha() !== 255) {
                fillAlpha = fillColor.getAlpha() / 255.0;
                fillOpacity = " fill-opacity=\"" + fillAlpha.toString() + "\"";
            }

            hexFillColor = RendererUtilities.colorToHexString(fillColor, false);
            switch (affiliation) {
                case SymbolID.StandardIdentity_Affiliation_Friend:
                case SymbolID.StandardIdentity_Affiliation_AssumedFriend: {
                    defaultFillColor = "fill=\"#80E0FF\"";//friendly frame fill
                    break;
                }

                case SymbolID.StandardIdentity_Affiliation_Hostile_Faker: {
                    defaultFillColor = "fill=\"#FF8080\"";//hostile frame fill
                    break;
                }

                case SymbolID.StandardIdentity_Affiliation_Suspect_Joker: {
                    if (SymbolID.getVersion(symbolID) >= SymbolID.Version_2525E) {

                        defaultFillColor = "fill=\"#FFE599\"";
                    }
                    //suspect frame fill
                    else {

                        defaultFillColor = "fill=\"#FF8080\"";
                    }
                    //hostile frame fill
                    break;
                }

                case SymbolID.StandardIdentity_Affiliation_Unknown:
                case SymbolID.StandardIdentity_Affiliation_Pending: {
                    defaultFillColor = "fill=\"#FFFF80\"";//unknown frame fill
                    break;
                }

                case SymbolID.StandardIdentity_Affiliation_Neutral: {
                    defaultFillColor = "fill=\"#AAFFAA\"";//neutral frame fill
                    break;
                }

                default: {
                    defaultFillColor = "fill=\"#80E0FF\"";//friendly frame fill
                    break;
                }

            }

            if (returnSVG == null) {
                returnSVG = svg.replace(defaultFillColor, "fill=\"" + hexFillColor + "\"" + fillOpacity);
            }
            else {
                returnSVG = returnSVG.replace(defaultFillColor, "fill=\"" + hexFillColor + "\"" + fillOpacity);
            }

        }

        if (returnSVG != null) {
            return returnSVG;
        }

        else {

            return svg;
        }

    }

    // Overloaded method to return non-outline symbols as normal.
    public static setSVGSPCMColors(symbolID: string, svg: string, strokeColor: Color, fillColor: Color): string;

    /**
     * For Renderer Use Only
     * Changes colors for single point control measures
     * @param symbolID
     * @param svg
     * @param strokeColor hex value like "#FF0000";
     * @param fillColor hex value like "#FF0000";
     * @param isOutline true if this represents a thicker outline to render first beneath the normal symbol (the function must be called twice)
     * @return SVG String
     *
     */
    public static setSVGSPCMColors(symbolID: string, svg: string, strokeColor: Color, fillColor: Color, isOutline: boolean): string;
    public static setSVGSPCMColors(...args: unknown[]): string {
        switch (args.length) {
            case 4: {
                const [symbolID, svg, strokeColor, fillColor] = args as [string, string, Color, Color];


                return RendererUtilities.setSVGSPCMColors(symbolID, svg, strokeColor, fillColor, false);


                break;
            }

            case 5: {
                let [symbolID, svg, strokeColor, fillColor, isOutline] = args as [string, string, Color, Color, boolean];

                let returnSVG: string = svg;
                let hexStrokeColor: string;
                let hexFillColor: string;
                let strokeAlpha: float = 1;
                let fillAlpha: float = 1;
                let strokeOpacity: string = "";
                let fillOpacity: string = "";
                let strokeCapSquare: string = " stroke-linecap=\"square\"";
                let strokeCapButt: string = " stroke-linecap=\"butt\"";
                let strokeCapRound: string = " stroke-linecap=\"round\"";

                let affiliation: int = SymbolID.getAffiliation(symbolID);
                let defaultFillColor: string;
                if (strokeColor != null) {
                    if (strokeColor.getAlpha() !== 255) {
                        strokeAlpha = strokeColor.getAlpha() / 255.0;
                        strokeOpacity = " stroke-opacity=\"" + strokeAlpha + "\"";
                        fillOpacity = " fill-opacity=\"" + strokeAlpha + "\"";
                    }

                    hexStrokeColor = RendererUtilities.colorToHexString(strokeColor, false);
                    let defaultStrokeColor: string = "#000000";
                    if (symbolID.length === 5) {
                        let mod: int = parseInt(symbolID.substring(2, 4));
                        if (mod >= 13) {

                            defaultStrokeColor = "#00A651";
                        }


                    }
                    //key terrain
                    if (symbolID.length >= 20 &&
                        SymbolUtilities.getBasicSymbolID(symbolID) === "25132100" &&
                        SymbolID.getVersion(symbolID) >= SymbolID.Version_2525E) {
                        defaultStrokeColor = "#800080";
                    }
                    returnSVG = returnSVG.replaceAll("stroke=\"" + defaultStrokeColor + "\"", "stroke=\"" + hexStrokeColor + "\"" + strokeOpacity);
                    returnSVG = returnSVG.replaceAll("fill=\"" + defaultStrokeColor + "\"", "fill=\"" + hexStrokeColor + "\"" + fillOpacity);
                }
                else {
                    strokeColor = Color.BLACK;
                }

                if (isOutline) {
                    // Capture and scale stroke-widths to create outlines. Note that some stroke-widths are not integral numbers.
                    let pattern = RegExp("(stroke-width=\")(\\d+\\.?\\d*)\"", "g");
                    let matches = [...returnSVG.matchAll(pattern)]
                    let strokeWidths: Set<number> = new Set();
                    for (let match of matches) {
                        // match is ["stroke-width="n"", "stroke-width="", "n"]
                        strokeWidths.add(parseFloat(match[2]));
                    }
                    // replace stroke width values in SVG from greatest to least to avoid unintended replacements
                    for (let f of Array.from(strokeWidths).sort((a, b) => b - a)) {
                        let replacement: string = "stroke-width=\"" + (f * RendererUtilities.OUTLINE_SCALING_FACTOR) + "\"";
                        returnSVG = returnSVG.replaceAll("stroke-width=\"" + f + "\"", replacement);
                    }

                    // add stroke-width and stroke (color) to all groups
                    let replacement: string = "<g" + strokeCapSquare + " stroke-width=\"" + (2.5 * RendererUtilities.OUTLINE_SCALING_FACTOR) + "\" stroke=\"#" + RendererUtilities.ColorToHex(strokeColor).substring(2) + "\" ";
                    returnSVG = returnSVG.replaceAll("<g", replacement);
                }
                else {
                    /* //this code just returned the entire svg string back.  Maybe because there's no line breaks.
                    Pattern pattern = Pattern.compile("(font-size=\"\\d+\\.?\\d*)\"");
                    Matcher m = pattern.matcher(svg);
                    TreeSet<String> fontStrings = new TreeSet<>();
                    while (m.find()) {
                        fontStrings.push(m.group(0));
                    }
                    for (String target : fontStrings) {
                        String replacement = target + " fill=\"#" + ColorToHex(strokeColor).substring(2) + "\" ";
                        returnSVG = returnSVG.replace(target, replacement);
                    }
                    //*/
                    let replacement: string = " fill=\"#" + RendererUtilities.ColorToHex(strokeColor).substring(2) + "\" ";
                    returnSVG = returnSVG.replace("fill=\"#000000\"", replacement);//only replace black fills, leave white fills alone.

                    //In case there are lines that don't have stroke defined, apply stroke color to the top level group.
                    let topGroupTag: string = "<g id=\"" + SymbolUtilities.getBasicSymbolID(symbolID) + "\">";//<g id="25212902">
                    let newGroupTag: string = "<g id=\"" + SymbolUtilities.getBasicSymbolID(symbolID) + "\" stroke=\"" + hexStrokeColor + "\"" + strokeOpacity + " " + replacement + ">";
                    returnSVG = returnSVG.replace(topGroupTag, newGroupTag);

                }

                if (fillColor != null) {
                    if (fillColor.getAlpha() !== 255) {
                        fillAlpha = fillColor.getAlpha() / 255.0;
                        fillOpacity = " fill-opacity=\"" + fillAlpha + "\"";
                    }

                    hexFillColor = RendererUtilities.colorToHexString(fillColor, false);
                    defaultFillColor = "fill=\"#000000\"";

                    returnSVG = returnSVG.replaceAll(defaultFillColor, "fill=\"" + hexFillColor + "\"" + fillOpacity);
                }

                return returnSVG;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public static findWidestStrokeWidth(svg: string): float {
        let pattern = RegExp("(stroke-width=\")(\\d+\\.?\\d*)\"", "g");
        let largest: number = 4.0;

        let matches = [...svg.matchAll(pattern)]
        for (let match of matches) {
            // match is ["stroke-width="n"", "stroke-width="", "n"]
            const width = parseFloat(match[2])
            if (width > largest) {
                largest = width;
            }
        }
        return largest * RendererUtilities.OUTLINE_SCALING_FACTOR;
    }

    public static async getData(path:string):Promise<any> {
        const url = path;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
      
          const json = await response.json();
          //console.log(json);
          return json;
        } catch (error) 
        {
            if(console)
                console.error(error.message);
            else
                throw error;
        }
      }
}
