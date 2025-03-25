import { type int, type double, } from "../../graphics2d/BasicTypes";


import { Point2D } from "../../graphics2d/Point2D"
import { TexturePaint } from "../../graphics2d/TexturePaint"
import { Color } from "../../renderer/utilities/Color"
import { DistanceUnit } from "../../renderer/utilities/DistanceUnit"
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger"
import { Modifiers } from "../../renderer/utilities/Modifiers"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { ShapeInfo } from "../../renderer/utilities/ShapeInfo"
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities"


/**
 * Object that holds information on how to draw a multipoint symbol after {@link armyc2.c5isr.web.render.WebRenderer#RenderMultiPointAsMilStdSymbol(String, String, String, String, String, String, double, String, Map, Map)}  is called.
 */
export class MilStdSymbol {

    //private SymbolDef _symbolDefinition;
    //private UnitDef _unitDefinition;
    /**
     * modifiers
     */
    private _Properties: Map<string, string> = null;

    //for tactical graphics
    private _X_Altitude: Array<number> = null;
    private _AM_Distance: Array<number> = null;
    private _AN_Azimuth: Array<number> = null;

    private _symbolID: string = "";

    /**
     * unique ID for this symbol, for client use
     */
    private _UUID: string = "";

    private _SymbolShapes: Array<ShapeInfo> = null;

    /**
     * collection of shapes for the modifiers
     */
    private _ModifierShapes: Array<ShapeInfo> = null;

    private _Coordinates: Array<Point2D> = null;

    private _UnitSize: int = 50;
    private _scale: double = 0;
    private _KeepUnitRatio: boolean = true;

    protected _LineWidth: number = 3;
    protected _LineColor: Color = null;
    protected _FillColor: Color = null;
    protected _TextColor: Color = null;
    protected _TextBackgroundColor: Color = null;

    protected _Rotation: double = 0.0;//DEGREES

    //outline singlepoint TGs
    protected _Outline: boolean = false;
    //if null, renderer determines outline Color.
    protected _OutLineColor: Color;
    protected _OutLineWidth: int = 0;
    protected _tp: TexturePaint;
    protected _fs: boolean = true;

    protected _patternFillType: int = 0;

    private static _AltitudeMode: string = "";

    private static _AltitudeUnit: DistanceUnit;

    private static _DistanceUnit: DistanceUnit;

    private static _useDashArray: boolean = true;

    private static _hideOptionalLabels: boolean = false;

    private static _DrawAffiliationModifierAsLabel: boolean = true;

    private static _UseLineInterpolation: boolean = false;

    protected _Tag: any;

    /*
     * Used to hold metadata for each segment of the symbol for multi-point
     * symbols. Each segment can contain one object.
     */
    //private Map _segmentData;
    // Constants for dynamic properties
    /*
         public static final String SYMBOL_ID = "Symbol ID";
         //public static final String SOURCE = "Source";
         //public static final String EDITOR_CLASS_TYPE = "Editor Class Type";
         public static final String URN = "URN";
         public static final String UIC = "UIC";
         public static final String ANGLE_OF_ROTATION = "Angle of Rotation";
         public static final String LENGTH = "Length";
         public static final String WIDTH = "Width";
         public static final String RADIUS = "Radius";
         public static final String SEGMENT_DATA = "Segment Data";
         */

    /*
     public static final String GEO_POINT = "point";
     public static final String GEO_LINE = "line";
     public static final String GEO_POLYGON = "area";
     public static final String GEO_TEXT = "text";
     public static final String GEO_CIRCLE = "circle";
     public static final String GEO_RECTANGLE = "rectangle";
     public static final String GEO_ARC = "arc";
     public static final String GEO_SQUARE = "square";
     */
    /*
     private static final String _COORDINATES = "Coordinates";
     private static final String _GEOMETRY = "Geometry";
     private static final String _FILL_COLOR = "Fill Color";
     private static final String _FILL_ALPHA = "Fill Alpha";
     private static final String _FILL_STYLE = "Fill Style";
     private static final String _LINE_WIDTH = "Line Width";
     private static final String _LINE_COLOR = "Line Color";
     private static final String _LINE_ALPHA = "Line Alpha";
     private static final String _TEXT_BACKGROUND_COLOR = "Background Color";
     private static final String _TEXT_FOREGROUND_COLOR = "Foreground Color";
     private static final String _USE_FILL = "Use Fill";
     */
    /*
     protected static const _COORDINATES:String = "Coordinates";
     protected static const _GEOMETRY:String = "Geometry";
     protected static const _FILL_COLOR:String = "Fill Color";
     protected static const _FILL_ALPHA:String = "Fill Alpha";
     private int _FILL_STYLE:String = "Fill Style";
     protected static const _LINE_WIDTH:String = 0;
     private Color _LINE_COLOR = Color.BLACK;
     private int _LINE_ALPHA:String = 0;
     private Color _TEXT_BACKGROUND_COLOR = Color.WHITE;
     private Color _TEXT_FOREGROUND_COLOR = Color.BLACK;
     private bool _USE_FILL:String = "Use Fill";*/

    /**
     *
     * @param symbolID code, 20-30 digits long that represents the symbol
     * @param uniqueID for the client's use
     * @param modifiers use keys from Modifiers.
     * @param Coordinates {@link ArrayList} of {@link Point2D} coordinates for the symbol
     * @param keepUnitRatio - default TRUE
     * modifiers
     */
    public constructor(symbolID: string, uniqueID: string, Coordinates: Array<Point2D>, modifiers: Map<string, string>, keepUnitRatio: boolean = true) {
        if (modifiers == null) {
            this._Properties = new Map<string, string>();
        }
        else {
            this._Properties = modifiers;
        }

        this._UUID = uniqueID;
        this.setCoordinates(Coordinates);

        // Set the given symbol id
        this.setSymbolID(symbolID);

        // Set up default line fill and text colors
        this.setLineColor(SymbolUtilities.getDefaultLineColor(this._symbolID));
        this.setTextColor(SymbolUtilities.getLineColorOfAffiliation(symbolID));
        //if(SymbolUtilities.isWarfighting(_symbolID))
        if (SymbolUtilities.hasDefaultFill(this._symbolID)) {
            this.setFillColor(SymbolUtilities.getFillColorOfAffiliation(this._symbolID));
        }
        //if(SymbolUtilities.isNBC(_symbolID) && !(SymbolUtilities.isDeconPoint(symbolID)))
        //    setFillColor(SymbolUtilities.getFillColorOfAffiliation(_symbolID));

        MilStdSymbol._DrawAffiliationModifierAsLabel = RendererSettings.getInstance().getDrawAffiliationModifierAsLabel();

        MilStdSymbol._UseLineInterpolation = RendererSettings.getInstance().getUseLineInterpolation();

        this._KeepUnitRatio = keepUnitRatio;
    }


    public getFillStyle(): TexturePaint {
        return this._tp;
    }

    public setFillStyle(value: TexturePaint): void {
        this._tp = value;
    }

    public getUseFillPattern(): boolean {
        return this._fs;
    }

    public setUseFillPattern(value: boolean): void {
        this._fs = value;
    }

    /**
     * @deprecated
     */
    public getPatternFillType(): int {
        return this._patternFillType;
    }

    /**
     * 0=Solid, 2=ForwardHatch, 3=BackwardHatch, 4=verticalHatch, 5=horizonalHatch, 8=CrossHatch
     * Only affects Basic Shapes.  Will not apply to MilStd Symbology so as to not confuse some
     * symbols with others.
     * @param value {@link Integer}
     * 
     * @deprecated
     */
    public setPatternFillType(value: int): void {
        this._patternFillType = value;
    }

    public getAltitudeMode(): string {
        return MilStdSymbol._AltitudeMode;
    }

    public setAltitudeMode(value: string): void {
        MilStdSymbol._AltitudeMode = value;
    }

    public getAltitudeUnit(): DistanceUnit {
        return MilStdSymbol._AltitudeUnit;
    }

    public setAltitudeUnit(unit: DistanceUnit): void {
        MilStdSymbol._AltitudeUnit = unit;
    }

    public getDistanceUnit(): DistanceUnit {
        return MilStdSymbol._DistanceUnit;
    }

    public setDistanceUnit(unit: DistanceUnit): void {
        MilStdSymbol._DistanceUnit = unit;
    }

    public getUseDashArray(): boolean {
        return MilStdSymbol._useDashArray;
    }

    public setUseDashArray(value: boolean): void {
        MilStdSymbol._useDashArray = value;
    }

    public getHideOptionalLabels(): boolean {
        return MilStdSymbol._hideOptionalLabels;
    }

    public setHideOptionalLabels(value: boolean): void {
        MilStdSymbol._hideOptionalLabels = value;
    }

    public setUseLineInterpolation(value: boolean): void {
        MilStdSymbol._UseLineInterpolation = value;
    }

    public getUseLineInterpolation(): boolean {
        return MilStdSymbol._UseLineInterpolation;
    }

    //Set size for area's internal icon (LAA, mine and CBRN areas)
    public setUnitSize(pixelSize: int): void { this._UnitSize = pixelSize; }

    public getUnitSize(): int { return this._UnitSize; }

    public setKeepUnitRatio(value: boolean): void { this._KeepUnitRatio = value; }

    public getKeepUnitRatio(): boolean { return this._KeepUnitRatio; }

    /**
     * Determines how to draw the Affiliation Modifier. True to draw as modifier
     * label in the "E/F" location. False to draw at the top right corner of the
     * symbol
     * @param value {@link Boolean}
     *  
     * @deprecated
     */
    public setDrawAffiliationModifierAsLabel(value: boolean): void {
        MilStdSymbol._DrawAffiliationModifierAsLabel = value;
    }

    /**
     * True to draw as modifier label in the "E/F" location. False to draw at
     * the top right corner of the symbol
     * @return {@link Boolean}
     * 
     * @deprecated
     */
    public getDrawAffiliationModifierAsLabel(): boolean {
        return MilStdSymbol._DrawAffiliationModifierAsLabel;
    }

    /**
     * Returns the modifier map for the symbol
     * @return {@link Map}
     */
    public getModifierMap(): Map<string, string> {
        return this._Properties;
    }

    /**
     * sets the modifier map for the symbol
     * @param modifiers {@link Map}
     */
    public setModifierMap(modifiers: Map<string, string>): void {
        this._Properties = modifiers;
    }

    /**
     * Get a modifier value
     * @param modifier {@link Modifiers}
     * @return {@link String}
     */
    public getModifier(modifier: string): string;

    /**
     * Gets modifier value based on modifier constant and index in array
     * @param modifier {@link Modifiers}
     * @param index {@link Integer} array location, only applicable to AM, AN and X
     * @return {@link String}
     */
    public getModifier(modifier: string, index: int): string;
    public getModifier(...args: unknown[]): string | null {
        switch (args.length) {
            case 1: {
                const [modifier] = args as [string];


                if (this._Properties.has(modifier)) {
                    return this._Properties.get(modifier);
                }
                else {
                    return this.getModifier(modifier, 0);
                }


                break;
            }

            case 2: {
                const [modifier, index] = args as [string, int];


                if (this._Properties.has(modifier)) {
                    return this._Properties.get(modifier);
                }
                else if (modifier === (Modifiers.AM_DISTANCE)
                        || modifier === (Modifiers.AN_AZIMUTH)
                        || modifier === (Modifiers.X_ALTITUDE_DEPTH)) {
                        let value: string | null = this.getModifier_AM_AN_X(modifier, index);
                        if (value != null && value !== "null" && value !== "") {
                            return value;
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        return null;
                    }

                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Set a modifier value
     * @param modifier {@link Modifiers}
     * @param value {@link String}
     */
    public setModifier(modifier: string, value: string): void;

    /**
     * Modifiers must be added in order. No setting index 2 without first
     * setting index 0 and 1. If setting out of order is attempted, the value
     * will just be added to the end of the list.
     *
     * @param modifier {@link Modifiers}
     * @param value {@link String}
     * @param index {@link Integer}
     */
    public setModifier(modifier: string, value: string, index: int): void;
    public setModifier(...args: unknown[]): void {
        switch (args.length) {
            case 2: {
                const [modifier, value] = args as [string, string];


                if (value !== "") {
                    if (!(modifier === Modifiers.AM_DISTANCE)
                        || modifier === (Modifiers.AN_AZIMUTH)
                        || modifier === (Modifiers.X_ALTITUDE_DEPTH)) {
                        this._Properties.set(modifier, value);
                    }
                    else {
                        this.setModifier(modifier, value, 0);
                    }
                }


                break;
            }

            case 3: {
                const [modifier, value, index] = args as [string, string, int];


                if (value !== "") {
                    if (!(modifier === (Modifiers.AM_DISTANCE)
                        || modifier === (Modifiers.AN_AZIMUTH)
                        || modifier === (Modifiers.X_ALTITUDE_DEPTH))) {
                        this._Properties.set(modifier, value);
                    }
                    else {
                        let dblValue: number = Number.parseFloat(value);
                        if (dblValue != null) {
                            this.setModifier_AM_AN_X(modifier, dblValue, index);
                        }
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
     * Get modifier value for AM, AN or X
     * @param modifier {@link Modifiers}
     * @param index {@link Integer} array location
     * @return {@link Double}
     */
    public getModifier_AM_AN_X(modifier: string, index: int): string | null {
        let modifiers: Array<number>;
        if (modifier === (Modifiers.AM_DISTANCE)) {
            modifiers = this._AM_Distance;
        }
        else if (modifier === (Modifiers.AN_AZIMUTH)) {
                modifiers = this._AN_Azimuth;
            }
            else if (modifier === (Modifiers.X_ALTITUDE_DEPTH)) {
                    modifiers = this._X_Altitude;
                }
                else {
                    return null;
                }

        if (modifiers != null && modifiers.length > index) {
            let value: number = 0;
            value = modifiers[index];
            if (value != null) {
                return value.toString();
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

    public setModifier_AM_AN_X(modifier: string, value: number, index: int): void {
        if ((modifier === (Modifiers.AM_DISTANCE)
            || modifier === (Modifiers.AN_AZIMUTH)
            || modifier === (Modifiers.X_ALTITUDE_DEPTH))) {
            let modifiers: Array<number>;
            if (modifier === (Modifiers.AM_DISTANCE)) {
                if (this._AM_Distance == null) {
                    this._AM_Distance = new Array<number>();
                }
                modifiers = this._AM_Distance;
            }
            else if (modifier === (Modifiers.AN_AZIMUTH)) {
                    if (this._AN_Azimuth == null) {
                        this._AN_Azimuth = new Array<number>();
                    }
                    modifiers = this._AN_Azimuth;
                }
                else if (modifier === (Modifiers.X_ALTITUDE_DEPTH)) {
                        if (this._X_Altitude == null) {
                            this._X_Altitude = new Array<number>();
                        }
                        modifiers = this._X_Altitude;
                    }
            
            if (index + 1 > modifiers.length) {
                modifiers.push(value);
            }
            else {
                modifiers[index] = value;
            }
        }
    }

    public getModifiers_AM_AN_X(modifier: string): Array<number> | null {
        if (modifier === (Modifiers.AM_DISTANCE)) {
            return this._AM_Distance;
        }
        else if (modifier === (Modifiers.AN_AZIMUTH)) {
                return this._AN_Azimuth;
            }
            else if (modifier === (Modifiers.X_ALTITUDE_DEPTH)) {
                    return this._X_Altitude;
                }


        return null;
    }

    public setModifiers_AM_AN_X(modifier: string, modifiers: Array<number>): void {
        if (modifier === (Modifiers.AM_DISTANCE)) {
            this._AM_Distance = modifiers;
        }
        else if (modifier === (Modifiers.AN_AZIMUTH)) {
                this._AN_Azimuth = modifiers;
            }
            else if (modifier === (Modifiers.X_ALTITUDE_DEPTH)) {
                    this._X_Altitude = modifiers;
                }
    }

    /**
     *
     * @param value {@link Color}
     */
    public setFillColor(value: Color): void {
        this._FillColor = value;
    }

    /**
     *
     * @return {@link Color}
     */
    public getFillColor(): Color {
        return this._FillColor;
    }

    /**
    *
    * @param value {@link Color}
    */
    public setTextColor(value: Color): void {
        this._TextColor = value;
    }

    /**
     *
     * @return {@link Color}
     */
    public getTextColor(): Color {
        return this._TextColor;
    }

    /**
    *
    * @param value {@link Color}
    */
    public setTextBackgroundColor(value: Color): void {
        this._TextBackgroundColor = value;
    }

    /**
     *
     * @return {@link Color}
     */
    public getTextBackgroundColor(): Color {
        return this._TextBackgroundColor;
    }

    /**
     *
     * @param value {@link Integer}
     */
    public setLineWidth(value: int): void {
        this._LineWidth = value;
    }

    /**
     *
     * @return {@link Integer}
     */
    public getLineWidth(): int {
        return this._LineWidth;
    }

    /**
     * If value is null or SymbolUtilities.isGreenProtectionGraphic() is true then value is ignored
     *
     * @param value {@link Color}
     */
    public setLineColor(value: Color | null): void {
        if (SymbolUtilities.isGreenProtectionGraphic(this.getSymbolID())) {
            this._LineColor = new Color(0, 166, 81); // Green from SymbolUtilities.getLineColorOfAffiliation()
        } else if (value != null) {
                this._LineColor = value;
        }

    }

    /**
     *
     * @return {@link Color}
     */
    public getLineColor(): Color {
        return this._LineColor;
    }

    /**
     * if null, renderer will use white or black for the outline based on the color
     * of the symbol. Otherwise, it will used the passed color value.
     *
     * @param value {@link Color}
     */
    public setOutlineColor(value: Color): void {
        this._OutLineColor = value;
    }

    public getOutlineColor(): Color {
        return this._OutLineColor;
    }

    /**
     * Extra value for client. defaults to null. Not used for rendering by
     * JavaRenderer
     *
     * @param value  {@link Object}
     * @deprecated
     */
    public setTag(value: any): void {
        this._Tag = value;
    }

    /**
     * Extra value for client. defaults to null. Not used for rendering by
     * JavaRenderer
     *
     * @return {@link Object}
     * @deprecated
     */
    public getTag(): any {
        return this._Tag;
    }

    /**
     *
     * @param value {@link ArrayList}
     */
    public setCoordinates(value: Array<Point2D>): void {
        this._Coordinates = value;
    }

    /**
     *
     * @return {@link ArrayList}
     */
    public getCoordinates(): Array<Point2D> {
        return this._Coordinates;
    }

    /**
     * Shapes that represent the symbol modifiers
     *
     * @param value ArrayList&lt;Shape&gt;
     */
    public setModifierShapes(value: Array<ShapeInfo>): void {
        this._ModifierShapes = value;
    }

    /**
     * Shapes that represent the symbol modifiers
     *
     * @return {@link ArrayList}
     */
    public getModifierShapes(): Array<ShapeInfo> {
        return this._ModifierShapes;
    }

    /**
     * the java shapes that make up the symbol
     *
     * @param value ArrayList&lt;ShapeInfo&gt;
     */
    public setSymbolShapes(value: Array<ShapeInfo>): void {
        this._SymbolShapes = value;
    }

    /**
     * the java shapes that make up the symbol
     *
     * @return {@link ArrayList}
     */
    public getSymbolShapes(): Array<ShapeInfo> {
        return this._SymbolShapes;
    }

    /**
     * The Symbol Id of the MilStdSymbol.
     *
     * @return {@link String}
     */
    public getSymbolID(): string {
        return this._symbolID;
    }

    /**
     * Unique ID of the Symbol. For client use.
     *
     * @return {@link String}
     */
    public getUUID(): string {
        return this._UUID;
    }

    /**
     * Unique ID of the Symbol. For client use.
     *
     * @param ID {@link String}
     */
    public setUUID(ID: string): void {
        this._UUID = ID;
    }

    /**
     * Sets the Symbol ID for the symbol. Should be a 20-30 digit string from
     * the milstd.
     *
     * @param value {@link String}
     */
    public setSymbolID(value: string): void {

        let current: string = this._symbolID;

        try {
            //set symbolID
            if (value != null && value !== "" && current !== value) {
                this._symbolID = value;
            }


        } catch (e) {
            if (e instanceof Error) {
                // Log Error
                ErrorLogger.LogException("MilStdSymbol", "setSymbolID" + " - Did not fall under TG or FE", e);
            } else {
                throw e;
            }
        }
    }	// End set SymbolID
    private _wasClipped: boolean = false;
    public set_WasClipped(value: boolean): void {
        this._wasClipped = value;
    }
    public get_WasClipped(): boolean {
        return this._wasClipped;
    }

}
