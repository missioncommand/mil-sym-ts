import { SymbolID } from "../../renderer/utilities/SymbolID"
import { MSLookup } from "../../renderer/utilities/MSLookup"
import { MSInfo } from "../../renderer/utilities/MSInfo"
import { DrawRules } from "../../renderer/utilities/DrawRules"
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
import { AffiliationColors } from "./AffiliationColors";
import { RendererUtilities } from "./RendererUtilities";


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

    private patternScale: double = 1;

    private static _AltitudeMode: string = "";

    private static _AltitudeUnit: DistanceUnit;

    private static _DistanceUnit: DistanceUnit;

    private static _useDashArray: boolean = true;

    private static _hideOptionalLabels: boolean = false;

    private static _DrawAffiliationModifierAsLabel: boolean = true;

    private static _UseLineInterpolation: boolean = false;

    protected _Tag: any;

    /**
     * Text is not affected by scale changes
     */
    public static readonly TextScaleSensitive_No:number = 0;
    /**
     * Text is affected only by significant scale changes
     */
    public static readonly TextScaleSensitive_OnSlightZoomIn:number = 1;
    /**
     * Text is affected by zoom in scale changes
     */
    public static readonly TextScaleSensitive_OnZoomIn:number = 2;
    /**
     * Text is affected by any scale changes
     */
    public static readonly TextScaleSensitive_OnZoomInOut:number = 3;


    /**
     * Symbol is not affected by scale changes
     */
    public static readonly SymbolScaleSensitive_No:number = 0;
    /**
     * Symbol has arrow heads that are affected by scale change
     */
    public static readonly SymbolScaleSensitive_ArrowHeads:number = 1;
    /**
     * Symbol has lines details that are affected by scale change (like FLOT)
     */
    public static readonly SymbolScaleSensitive_DecoratedLines:number = 2;
    /**
     * Symbol has pattern fills that are affected by scale if you're not using the fill pattern image
     * ShapeInfo.getPatternFillImage()
     */
    public static readonly SymbolScaleSensitive_PatternFills:number = 3;



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
                        let value: string = String(this.getModifier_AM_AN_X(modifier, index));
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
    public getModifier_AM_AN_X(modifier: string, index: int): number | null {
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
                return value;
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
        if(RendererSettings.getInstance().getTextBackgroundMethod() != RendererSettings.TextBackgroundMethod_NONE && this._TextBackgroundColor == null)
        {
            //If text background enabled and a background color has not been set yet:
            this._TextBackgroundColor = new Color(RendererUtilities.getIdealOutlineColor(this._TextColor));
        }
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
            this._LineColor = AffiliationColors.ObstacleGreen;//new Color(0, 166, 81); // Green from SymbolUtilities.getLineColorOfAffiliation()
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
    /**
     * 
     * @param value 
     * @deprecated see {@link #setWasClipped(boolean)}
     */
    public set_WasClipped(value: boolean): void {
        this._wasClipped = value;
    }
    /**
     * 
     * @returns 
     * @deprecated see {@link #getWasClipped()}
     */
    public get_WasClipped(): boolean {
        return this._wasClipped;
    }

    public setWasClipped(value: boolean): void {
        this._wasClipped = value;
    }
    public getWasClipped(): boolean {
        return this._wasClipped;
    }
    

    /**
     * Determines if the symbol has integral or modifier/amplifier text that would
     * be impacted if the maps is zoomed in or out after initial draw.
     * @return 0=not sensitive, 1=slightly little zoom in sensitive, 2=zoom in sensitive, 3=zoom in/out sensitive
     */
    public isTextScaleSensitive():number
    {
        let modifiers:Array<ShapeInfo>  = this.getModifierShapes();
        if(this._Properties == null)
            return 0;//no scale sensitive text
        if (this._Properties.size===0)
            return 0;
        else if(SymbolID.getSymbolSet(this._symbolID)==SymbolID.SymbolSet_ControlMeasure)
        {
            let msi:MSInfo = MSLookup.getInstance().getMSLInfo(this._symbolID);
            if(msi != null)
            {
                let dr:number = msi.getDrawRule();
                
                let ec:string = SymbolID.getEntityCode(this._symbolID).toString();
                switch (dr)
                {
                    case DrawRules.AXIS1:
                    case DrawRules.AXIS2:
                        if(this._Properties.has(Modifiers.W_DTG_1) ||
                        this._Properties.has(Modifiers.W1_DTG_2))
                            return 3;
                        else
                            return 0;
                    case DrawRules.CORRIDOR1:
                        if(this._Properties.size > 1)
                            return 3;
                        else
                            return 0;
                    case DrawRules.LINE5://Bearing Lines (2201##), Linear Targets (2407##)
                        if(ec.startsWith("2201"))
                        {
                            if(this._Properties.has(Modifiers.H_ADDITIONAL_INFO_1))
                                return 2;
                            else
                                return 0;
                        }
                        else if(ec.startsWith("2407"))
                        {
                            if(modifiers != null && modifiers.length != 0)
                            {
                                let size:number = modifiers.length;
                                if(size == 1)
                                    return 2;
                                else//size > 1
                                    return 3;
                            }
                            else
                                return 0;
                        }
                        else
                            return 0;
                    case DrawRules.RECTANGULAR1:
                        if(modifiers != null && modifiers.length > 1 && ec.startsWith("24"))
                            return 3;
                        else 
                            return 0; 
                    case DrawRules.CIRCULAR1:
                        if(modifiers != null && modifiers.length > 1 && (ec.startsWith("2003") || ec.startsWith("24")))
                            return 3;
                        else 
                            return 0; 
                    case DrawRules.RECTANGULAR3:
                        if(modifiers != null && modifiers.length != 0)
                            return 2;
                        else 
                            return 0; 

                    case DrawRules.CIRCULAR2:
                    case DrawRules.ARC1:
                        return 0;
                    
                    default:
                        break;
                }
            }

            let ec:number = (SymbolID.getEntityCode(this._symbolID));
            switch (ec)
            {

                //A Little Zoom in sensitive (1)
                case 140300://Phase line, only 5% sensitive
                case 140400://Forward Edge of Battle, only 5% sensitive
                case 330100://Moving Convoy
                case 330200://Halted Convoy
                    return 1;

                //Zoom in sensitive (2)
                case 110200://Light Line
                case 110300://Engineer Work Line
                case 140700://Final Coordination Line
                case 140900://Limit of Advance
                case 141000://Line of Departure
                case 141100://Line of Departure / Line of Contact
                case 141200://Probable Line of Deployment
                case 141400://Bridgehead Line
                case 141500://Holding Line
                case 141600://Release Line
                case 141800://Handover Line
                case 141900://Battle Handover Line
                case 142000://Named Area of Interest Line (NAI)
                case 190100://Identification, Friend-or-Foe (IFF) Off Line
                case 190200://Identification, Friend-or-Foe (IFF) On Line
                case 200401://Ship Area of Interest, Eclipse/Circle (AEGIS only)
                case 200402://Ship Area of Interest, Rectangle (AEGIS only)
                case 330300://Main Supply Route (MSR)
                case 330301://One Way Traffic
                case 330302://Two Way Traffic
                case 330303://Alternating Traffic
                case 330400://Alternate Supply Route (ASR)
                case 330401://One Way Traffic
                case 330402://Two Way Traffic
                case 330403://Alternating Traffic
                    return 2;
                case 120400://Airfield Zone
                case 142100://Mobility Corridor
                case 370100://Human Terrain
                    if(this._Properties.has(Modifiers.H_ADDITIONAL_INFO_1))
                        return 2;
                    else
                        return 0;
                case 290100://Obstacle Line
                    if(this._Properties.has(Modifiers.T_UNIQUE_DESIGNATION_1))
                        return 2;
                    else
                        return 0;
                case 140100://FLOT
                    if(SymbolID.getAffiliation(this._symbolID)==SymbolID.StandardIdentity_Affiliation_Hostile_Faker)
                        return 2;
                    else
                        return 1;

                //Very Zoom in/out sensitive (multi-line text) (3)
                //friendly and more than 1 text
                //Hostile and more than 3 text assuming ENY is present
                case 110100://boundary line
                    if(this._Properties.has(Modifiers.T_UNIQUE_DESIGNATION_1) ||
                        this._Properties.has(Modifiers.T1_UNIQUE_DESIGNATION_2) ||
                        this._Properties.has(Modifiers.AS_COUNTRY))
                        return 3;
                    else
                        return 0;

                case 150501://Joint Tactical Action Area (JTAA), 2 rows of text
                case 150502://Submarine Action Area (SAA), 2 rows of text
                case 150503://Submarine Generated Action Area (SGAA), 2 rows of text
                case 200300://No Attack (NOTACK) Zone (AEGIS only)
                case 140601://Friendly Aviation
                case 140602://Friendly Direction of Main Attack
                case 140603://Friendly Direction of Supporting Attack
                case 140605://Direction of Attack Feint
                    if(this._Properties.has(Modifiers.W_DTG_1) ||
                        this._Properties.has(Modifiers.W1_DTG_2))
                        return 3;
                    else
                        return 0;
                case 151100://Limited Access Area if sector 1 modifier present
                    if(SymbolID.getModifier1(this._symbolID)!=0 || this._Properties.has(Modifiers.H_ADDITIONAL_INFO_1))
                        return 3;
                    else
                        return 0;

                case 152400://Restricted Terrain
                case 152500://Severly Restricted Terrain
                    if(modifiers != null && modifiers.length>1)
                        return 3;
                    else
                        return 0;

                //Labels all contained in area but can drift away from each-other or overlap
                case 120700: //Generic
                case 170900: //High-Density Airspace Control Zone
                case 171000: //Restricted Operations Zone (ROZ)
                case 171100: //Air-to-Air Restricted Operations Zone (AARROZ)
                case 171200: //Unmanned Aircraft Restricted Operations Zone (UA-ROZ)
                case 171300: //Weapon Engagement Zone
                case 171400: //Fighter Engagement Zone (FEZ)
                case 171500: //Joint Engagement Zone (JEZ)
                case 171600: //Missile Engagement Zone (MEZ)
                case 171700: //Low (Altitude) Missile Engagement Zone (LOMEZ)
                case 171800: //High (Altitude) Missile Engagement Zone (HIMEZ)
                case 171900: //Short Range Air Defense Engagement Zone (SHORADEZ)
                case 172000: //Weapons Free Zone
                case 240101: //Airspace Coordination Area (ACA) - Irregular
                case 240201: //Free Fire Area (FFA) - Irregular
                case 240301: //No Fire Area (NFA) - Irregular
                case 240401: //Restricted Fire Area (RFA) - Irregular
                case 240806: //Smoke
                case 241001://Fire Support Area - Irregular
                case 241101: //Artillery Target Intelligence Zone (ATI), - Irregular
                case 241201: //Call For Fire Zone (CFFZ) - Irregular
                case 241301: //Censor Zone, - Irregular
                case 241401: //Critical Friendly Zone (CFZ), - Irregular
                case 241501: //Dead Space Area (DA), - Irregular
                case 241601: //Sensor Zone, Irregular
                case 241701: //Target Build-up Area, Irregular
                case 241801: //Target Value Area, Irregular
                case 241901: //Zone of Responsibility, Irregular
                case 242000: //Terminally Guided Munition Footprint (TGMF)
                case 242702: //Psyops Zone, Irregular
                case 242800: //Kill Zone
                case 242301: //Blue Kill Box, Irregular
                case 242304: //Purple Kill Box, Irregular
                case 270300: //Obstacle Free Zone
                case 290600: //Lane
                case 310100: //Detainee Holding Area
                case 310200: //Enemy Prisoner of War Holding Area
                case 310300: //Forward Arming and Refueling Point (FARP)
                case 310400: //Refugee Holding Area
                case 310800: //Corps Support Area (CSA)
                    if(modifiers != null && modifiers.length>1)
                        return 3;
                    else
                        return 0;

                //CASES for areas with 4 tags like PAA
                case 242400: //Artillery Manoeuvre Area (AMA)
                case 240501: //Position Area for Artillery (PAA) - Irregular
                    if(modifiers != null && modifiers.length>4)
                        return 3;
                    else
                        return 0;

                case 110400://Generic
                case 260100://Fire Support Coordination Line (FSCL)
                case 260200://Coordinated Fire Line (CFL)
                case 260300://No Fire Line
                case 260400://Battlefield Coordination Line
                case 260500://Restrictive Fire Line
                case 300100://Intelligence Coordination Line (ICL)
                    if(this._Properties.has(Modifiers.W_DTG_1) ||
                            this._Properties.has(Modifiers.W1_DTG_2))
                        return 3;
                    else
                        return 2;

                case 260600://Munition Flight Path
                case 340800://Delay
                    if(this._Properties.has(Modifiers.W_DTG_1) ||
                    this._Properties.has(Modifiers.W1_DTG_2))
                        return 2;
                    else
                        return 0;

                case 270800://Mined Area
                    if(this._Properties.has(Modifiers.W_DTG_1) ||
                        this._Properties.has(Modifiers.H_ADDITIONAL_INFO_1))
                        return 2;
                    else
                        return 0;

                case 220109://Navigational Rhumb Line
                    if(modifiers != null && modifiers.length > 1)
                        return 3;
                    else
                        return 2;

                case 271100://Bridge or Gap
                case 271300://Assault Crossing
                    if(this._Properties.has(Modifiers.W_DTG_1) ||
                        this._Properties.has(Modifiers.W1_DTG_2))
                        return 3;
                    else //TODO: Bridge or Fix placement and it will be a 0 in other cases
                        return 2;

                default://No Scale Sensitive text
                    return 0;
            }
        }

        return 0;
    }

    /**
    * Checks if the symbol has features that make it scale aware and would require a refresh
    * on zooming in or out.
    * @return 0=No,1=arrowheads,2=decoratedLines,3=patternFills
    */
    public isSymbolScaleSensitive():number
    {
        //return SymbolUtilities.isScaleAware(this._symbolID);
        let ec:number = SymbolID.getEntityCode(this._symbolID);

        if(SymbolID.getSymbolSet(this._symbolID)==SymbolID.SymbolSet_ControlMeasure) {
            switch (ec)
            {
                //ArrowHead or smaller detail
                case 152000://Attack By Fire
                case 152100://Attack By Fire
                case 152200://Search Area/Reconnaissance Area
                case 141700://Ambush
                case 140601://Airborne/Aviation
                case 140602://Direction of Main attack
                case 140603://Direction of Supporting attack
                case 140605://Direction of Supporting attack Feint
                case 142100://Mobility Corridor
                case 240701://Linear Target
                case 240702://Linear Smoke Target
                case 240703://Final Protective Fire
                case 270502://Disrupt
                case 270504://Turn
                case 270601://Obstacle Bypass Easy
                case 270602://Obstacle Bypass Difficult
                case 270603://Obstacle Bypass Impossible
                case 271100://Bridge or Gap?
                case 271300://Assault Crossing?
                case 280100://Abatis?
                case 290600://?Lane?
                case 290700://Ferry
                case 290800://Raft Site
                case 340200://Breach
                case 340300://Bypass
                case 340400://Canalize
                case 340500://Clear
                case 340800://Delay
                case 341000://Disrupt
                case 341200://Follow and Assume
                case 341300://Follow and Support
                //case 341700://Occupy, details relative to size
                //case 341800://Penetrate, details relative to size
                //case 341900://Relief in Place (RIP), details relative to size
                //case 342000://Retire/Retirement, details relative to size
                case 342100://Secure, details relative to size
                case 342201://Cover, details relative to size
                case 342202://Guard, details relative to size
                case 342203://Screen, details relative to size
                case 342300://Screen, details relative to size
                case 342400://Withdraw, details relative to size
                case 342500://Withdraw under pressure, details relative to size
                case 343000://Capture
                case 343200://Control
                case 343300://Demonstrate
                case 343400://Deny
                case 343500://Development
                case 343600://Escort
                case 343700://Exfiltration
                case 343800://Infiltration
                case 343900://Locate
                case 344000://Pursuit
                case 344100://Forward Passage of Lines
                case 344200://Rearward Passage of Lines
                case 344400://Disengage
                case 344500://Evacuate
                case 344600://Recover
                case 344700://Turn
                    return 1;//arrowhead

                //Decorated Lines
                case 130701://Decision Line
                case 140100://FLOT
                case 140200://Line of Contact
                //case 140500://?Principal Direction of Fire?
                case 151000://Fortified Area
                case 151800://Encirclement
                case 151203://Strong Point
                case 151202://Battle Position Prepared (P) but not Occupied
                case 151204://Contain
                case 151205://Retain
                case 151208://Mobile Defense
                case 152600://Area Defense
                case 152800://Mobility Defense
                case 270100://Obstacle Belt
                case 270200://Obstacle Zone
                case 270300://Obstacle Free Zone
                case 270400://Obstacle Restricted Zone
                //case 270503://Fix?
                case 270801://Mined Area, Fenced
                case 282003://Overhead Wire
                case 290100://Obstacle Line
                case 290201://Ditch Under Construction
                case 290202://Ditch Completed
                case 290203://Ditch Reinforced
                case 290204://Antitank Wall
                case 290301://Wire Obstacles, Unspecified
                case 290302://Wire Obstacles, Single Fence
                case 290303://Wire Obstacles, Double Fence
                case 290304://Wire Obstacles, Double Apron Fence
                case 290305://Wire Obstacles, Low Wire Fence
                case 290306://Wire Obstacles, High Wire Fence
                case 290307://Wire Obstacles, Single Concertina
                case 290308://Wire Obstacles, Double Strand Concertina
                case 290309://Wire Obstacles, Triple Strand Concertina
                case 290900://Fortified Line
                case 291000://Fighting Position?
                case 330100://Moving Convoy
                case 330200://Halted Convoy
                case 330301://MSR One Way Traffic
                case 330302://MSR Two Way Traffic
                case 330303://MSR Alternating Traffic
                case 330401://ASR One Way Traffic
                case 330402://ASR Two Way Traffic
                case 330403://ASR Alternating Traffic
                case 341100://Fix
                //case 341500://Isolate, most detail contained inside
                //case 342600://Cordon and Knock, most detail contained inside
                //case 342700://Cordon and Search, most detail contained inside
                    return 2;//decoration

                //Areas with Pattern Fill
                case 151100://Limited Access Area
                case 172000://Weapons Free Zone
                case 152400://Restricted Terrain
                case 152500://Severely Restricted Terrain
                case 240301://NFA Irregular
                case 240302://NFA Rectangular
                case 240303://NFA Circular
                case 271700://Bio Contaminated Area
                case 271701://Bio Contaminated Area - Toxic
                case 271800://Chem Contaminated Area
                case 271801://Chem Contaminated Area - Toxic
                case 271900://Nuc Contaminated Area
                case 272000://Rad Contaminated Area
                case 272001://Rad Contaminated Area - Toxic
                    if(!this.getUseFillPattern())
                        return 3;//pattern fill
                    else
                        return 0;
                default:
                    return 0;
            }
        }

        return 0;
    }


    /**
     * Multipoint features and patterns scale with line width ({@link #getLineWidth()}).
     * {@link #patternScale} is the ratio of how much to increase features and patterns by with line width.
     * default value is 1.0. Can be set with {@link RendererSettings#setPatternScale(double)} and {@link MilStdAttributes#PatternScale}
     * @param scale
     */
    public setPatternScale(scale: double): void {
        this.patternScale = scale;
    }

    public getPatternScale(): double {
        return this.patternScale;
    }

}
