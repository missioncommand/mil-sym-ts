import { type int, type float } from "../../graphics2d/BasicTypes";

import { Font } from "../../graphics2d/Font"
import { Color } from "../../renderer/utilities/Color"
import { AffiliationColors } from "../../renderer/utilities/AffiliationColors"
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger"
import { SettingsChangedEvent } from "../../renderer/utilities/SettingsChangedEvent"
import { SettingsEventListener } from "../../renderer/utilities/SettingsEventListener"
import { LogLevel } from "./LogLevel";


/**
 *Static class that holds the setting for the JavaRenderer.
 * Allows different parts of the renderer to know what
 * values are being used.
 *
 */
export class RendererSettings {

    private static _instance: RendererSettings;

    //outline approach.  none, filled rectangle, outline (default),
    //outline quick (outline will not exceed 1 pixels).
    private static _TextBackgroundMethod: int = 3;
    /**
     * There will be no background for text
     */
    public static readonly TextBackgroundMethod_NONE: int = 0;

    /**
     * There will be a colored box behind the text
     */
    public static readonly TextBackgroundMethod_COLORFILL: int = 1;

    /**
     * There will be an adjustable outline around the text (expensive)
     * Outline width of 4 is recommended.
     */
    public static readonly TextBackgroundMethod_OUTLINE: int = 2;

    /**
     * A different approach for outline which is quicker and seems to use
     * less memory.  Also, you may do well with a lower outline thickness setting
     * compared to the regular outlining approach.  Outline Width of 1 is
     * recommended. 
     */
    public static readonly TextBackgroundMethod_OUTLINE_QUICK: int = 3;

    /**
     * Value from 0 to 255. The closer to 0 the lighter the text color has to be
     * to have the outline be black. Default value is 160.
     */
    private static _TextBackgroundAutoColorThreshold: int = 160;

    //if TextBackgroundMethod_OUTLINE is set, This value determines the width of that outline.
    private static _TextOutlineWidth: int = 1;

    //label foreground color, uses line color of symbol if null.
    private static _ColorLabelForeground: Color; //Color.BLACK;
    //label background color, used if TextBackGroundMethod = TextBackgroundMethod_COLORFILL && not null
    private static _ColorLabelBackground: Color;//Color.WHITE;

    private static _PixelSize: int = 50;

    /**
     * Collapse labels for fire support areas when the symbol isn't large enough to show all
     * the labels.
     */
    private static _AutoCollapseModifiers: boolean = true;

    /**
     * @deprecated
     */
    private static _SymbolOutlineWidth: int = 1;

    private static _OutlineSPControlMeasures: boolean = true;



    /**
     * If true (default), when HQ Staff is present, location will be indicated by the free
     * end of the staff
     */
    private static _CenterOnHQStaff: boolean = true;


    public static OperationalConditionModifierType_SLASH: int = 0;
    public static OperationalConditionModifierType_BAR: int = 1;
    private static _OCMType: int = 1;

    public static readonly SeaMineRenderMethod_MEDAL: int = 1;
    public static readonly SeaMineRenderMethod_ALT: int = 2;
    public static _SeaMineRenderMethod: int = 1;

    private static _UseLineInterpolation: boolean = true;

    //private static Font _ModifierFont = new Font("arial", Font.TRUETYPE_FONT, 12);
    private static _ModifierFontName: string = "arial";
    //private static int _ModifierFontType = Font.TRUETYPE_FONT;
    private static _ModifierFontType: int = Font.BOLD;
    private static _ModifierFontWeight: string = "bold";
    private static _ModifierFontSize: int = 12;
    private static _ModifierFontKerning: int = 0;//0=off, 1=on (TextAttribute.KERNING_ON)
    private static _ModifierFontTracking: float = 0;//TextAttribute.TRACKING_LOOSE;//loose=0.4f;
    private _scaleEchelon: boolean = false;
    private _DrawAffiliationModifierAsLabel: boolean = false;

    private static _MPLabelFontName: string = "arial";
    private static _MPLabelFontType: int = Font.BOLD;
    private static _MPLabelFontSize: int = 12;
    private static _KMLLabelScale: float = 1.0;

    private static _DPI: int = 96;

    //acevedo - 11/29/2017 - adding option to render only 2 labels.
    private _TwoLabelOnly: boolean = false;

    //acevedo - 12/8/17 - allow the setting of affiliation colors.
    private _friendlyUnitFillColor: Color = AffiliationColors.FriendlyUnitFillColor;
    /// <summary>
    /// Friendly Unit Fill Color.
    /// </summary>
    private _hostileUnitFillColor: Color = AffiliationColors.HostileUnitFillColor;//new Color(255,130,132);//Color.RED;
    /// <summary>
    /// Hostile Unit Fill Color.
    /// </summary>
    private _neutralUnitFillColor: Color = AffiliationColors.NeutralUnitFillColor;//new Color(144,238,144);//Color.GREEN;//new Color(0,255,0);//new Color(144,238,144);//light green//Color.GREEN;new Color(0,226,0);
    /// <summary>
    /// Neutral Unit Fill Color.
    /// </summary>
    private _unknownUnitFillColor: Color = AffiliationColors.UnknownUnitFillColor;// new Color(255,255,128);//Color.YELLOW;
    /// <summary>
    /// UnknownUn Graphic Fill Color.
    /// </summary>
    private _friendlyGraphicFillColor: Color = AffiliationColors.FriendlyGraphicFillColor;//Crystal Blue //Color.CYAN;
    /// <summary>
    /// Friendly Graphic Fill Color.
    /// </summary>
    private _hostileGraphicFillColor: Color = AffiliationColors.HostileGraphicFillColor;//salmon
    /// <summary>
    /// Hostile Graphic Fill Color.
    /// </summary>
    private _neutralGraphicFillColor: Color = AffiliationColors.NeutralGraphicFillColor;//Bamboo Green //new Color(144,238,144);//light green
    /// <summary>
    /// Neutral Graphic Fill Color.
    /// </summary>
    private _unknownGraphicFillColor: Color = AffiliationColors.UnknownGraphicFillColor;//light yellow  new Color(255,255,224);//light yellow
    /// <summary>
    /// Unknown Unit Line Color.
    /// </summary>
    private _friendlyUnitLineColor: Color = AffiliationColors.FriendlyUnitLineColor;
    /// <summary>
    /// Friendly Unit Line Color.
    /// </summary>
    private _hostileUnitLineColor: Color = AffiliationColors.HostileUnitLineColor;
    /// <summary>
    /// Hostile Unit Line Color.
    /// </summary>
    private _neutralUnitLineColor: Color = AffiliationColors.NeutralUnitLineColor;
    /// <summary>
    /// Neutral Unit Line Color.
    /// </summary>
    private _unknownUnitLineColor: Color = AffiliationColors.UnknownUnitLineColor;
    /// <summary>
    /// Unknown Graphic Line Color.
    /// </summary>
    private _friendlyGraphicLineColor: Color = AffiliationColors.FriendlyGraphicLineColor;
    /// <summary>
    /// Friend Graphic Line Color.
    /// </summary>
    private _hostileGraphicLineColor: Color = AffiliationColors.HostileGraphicLineColor;
    /// <summary>
    /// Hostile Graphic Line Color.
    /// </summary>
    private _neutralGraphicLineColor: Color = AffiliationColors.NeutralGraphicLineColor;
    /// <summary>
    /// Neutral Graphic Line Color.
    /// </summary>
    private _unknownGraphicLineColor: Color = AffiliationColors.UnknownGraphicLineColor;

    /*private   Color WeatherRed = new Color(198,16,33);//0xC61021;// 198,16,33
    private   Color WeatherBlue = new Color(0,0,255);//0x0000FF;// 0,0,255

    private   Color WeatherPurpleDark = new Color(128,0,128);//0x800080;// 128,0,128 Plum Red
    private   Color WeatherPurpleLight = new Color(226,159,255);//0xE29FFF;// 226,159,255 Light Orchid

    private   Color WeatherBrownDark = new Color(128,98,16);//0x806210;// 128,98,16 Safari
    private   Color WeatherBrownLight = new Color(210,176,106);//0xD2B06A;// 210,176,106 Khaki
    */

    private _Listeners: Array<SettingsEventListener> = new Array<SettingsEventListener>();

    private constructor() {

        this.Init();

    }

    public static getInstance(): RendererSettings {
        if (!RendererSettings._instance) {
            RendererSettings._instance = new RendererSettings();
        }


        return RendererSettings._instance;
    }

    private Init(): void {
        try {
            //RendererSettings._ColorLabelBackground = new Color(255, 255, 255, 255);
            //RendererSettings._VMSize = java.lang.Runtime.getRuntime().maxMemory() as int;
            //RendererSettings._CacheSize = Math.round(RendererSettings._VMSize * 0.03);//set cache to 3% of available memory
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("RendererSettings", "Init", exc, LogLevel.WARNING);
            } else {
                throw exc;
            }
        }
    }

    public addEventListener(sel: SettingsEventListener): void {
        this._Listeners.push(sel);
    }

    private raiseEvents(event: string): void {
        for (let l of this._Listeners) {
            l.SettingsEventChanged(event);
        }
    }

    /**
     * None, outline (default), or filled background.
     * If set to OUTLINE, TextOutlineWidth changed to default of 4.
     * If set to OUTLINE_QUICK, TextOutlineWidth changed to default of 1.
     * Use setTextOutlineWidth if you'd like a different value.
     * @param textBackgroundMethod like RenderSettings.TextBackgroundMethod_NONE
     */
    public setTextBackgroundMethod(textBackgroundMethod: int): void {
        RendererSettings._TextBackgroundMethod = textBackgroundMethod;
        if (RendererSettings._TextBackgroundMethod === RendererSettings.TextBackgroundMethod_OUTLINE) {

            RendererSettings._TextOutlineWidth = 4;
        }

        else if (RendererSettings._TextBackgroundMethod === RendererSettings.TextBackgroundMethod_OUTLINE_QUICK) {

            RendererSettings._TextOutlineWidth = 1;
        }
    }

    /**
     * None, outline (default), or filled background.
     * @return method like RenderSettings.TextBackgroundMethod_NONE
     */
    public getTextBackgroundMethod(): int {
        return RendererSettings._TextBackgroundMethod;
    }

    /**
     * default size single point icons will render on the map
     * @param size 
     */
    public setDefaultPixelSize(size: int): void {
        RendererSettings._PixelSize = size;
    }

    /**
     * default size single point icons will render on the map
     * @return 
     */
    public getDefaultPixelSize(): int {
        return RendererSettings._PixelSize;
    }


    /**
     * Set the operational condition modifier to be slashes or bars
     * @param value like RendererSettings.OperationalConditionModifierType_SLASH
     */
    public setOperationalConditionModifierType(value: int): void {
        RendererSettings._OCMType = value;
    }

    public getOperationalConditionModifierType(): int {
        return RendererSettings._OCMType;
    }

    public setSeaMineRenderMethod(method: int): void {
        RendererSettings._SeaMineRenderMethod = method;
    }
    public getSeaMineRenderMethod(): int {
        return RendererSettings._SeaMineRenderMethod;
    }

    /**
     * For lines symbols with "decorations" like FLOT or LOC, when points are
     * too close together, we will start dropping points until we get enough
     * space between 2 points to draw the decoration.  Without this, when points
     * are too close together, you run the chance that the decorated line will
     * look like a plain line because there was no room between points to
     * draw the decoration.
     * @param value boolean
     */
    public setUseLineInterpolation(value: boolean): void {
        RendererSettings._UseLineInterpolation = value;
    }

    /**
     * Returns the current setting for Line Interpolation.
     * @return boolean
     */
    public getUseLineInterpolation(): boolean {
        return RendererSettings._UseLineInterpolation;
    }

    /**
     * set the screen DPI so the renderer can take DPI into account when
     * rendering for things like dashed lines and decorated lines.
     * @param value 
     */
    public setDeviceDPI(value: int): void {
        RendererSettings._DPI = value;
    }
    public getDeviceDPI(): int {
        return RendererSettings._DPI;
    }
    /**
     * Collapse Modifiers for fire support areas when the symbol isn't large enough to show all
     * the labels.  Identifying label will always be visible.  Zooming in, to make the symbol larger,
     * will make more modifiers visible.  Resizing the symbol can also make more modifiers visible.
     * @param value boolean
     */
    public setAutoCollapseModifiers(value: boolean): void { RendererSettings._AutoCollapseModifiers = value; }

    public getAutoCollapseModifiers(): boolean { return RendererSettings._AutoCollapseModifiers; }



    /**
     * if true (default), when HQ Staff is present, location will be indicated by the free
     * end of the staff
     * @param value
     */
    public setCenterOnHQStaff(value: boolean): void {
        RendererSettings._CenterOnHQStaff = value;
    }

    /**
     * if true (default), when HQ Staff is present, location will be indicated by the free
     * end of the staff
     */
    public getCenterOnHQStaff(): boolean {
        return RendererSettings._CenterOnHQStaff;
    }


    /**
     * if RenderSettings.TextBackgroundMethod_OUTLINE is used,
     * the outline will be this many pixels wide.
     *
     * @param width
     * @deprecated - controlled within the renderer
     */
    /*synchronized public void setTextOutlineWidth(int width)
    {
        _TextOutlineWidth = width;
    }*/

    /**
     * if RenderSettings.TextBackgroundMethod_OUTLINE is used,
     * the outline will be this many pixels wide.
     * @return
     */
    public getTextOutlineWidth(): int {
        return RendererSettings._TextOutlineWidth;
    }

    /**
     * Refers to text color of modifier labels
     * @return
     *
     */
    /*public Color getLabelForegroundColor()
    {
        return _ColorLabelForeground;
    }*/

    /**
     * Refers to text color of modifier labels
     * Default Color is Black.  If NULL, uses line color of symbol
     * @param value
     *
     */
    /* synchronized public void setLabelForegroundColor(Color value)
     {
         _ColorLabelForeground = value;
     }*/

    /**
     * Refers to background color of modifier labels
     * @return
     *
     */
    /*    public Color getLabelBackgroundColor()
        {
            return _ColorLabelBackground;
        }*/

    /**
     * Refers to text color of modifier labels
     * Default Color is White.
     * Null value means the optimal background color (black or white)
     * will be chose based on the color of the text.
     * @param value
     *
     */
    /*synchronized public void setLabelBackgroundColor(Color value)
    {
        _ColorLabelBackground = value;
    }*/

    /**
     * Value from 0 to 255. The closer to 0 the lighter the text color has to be
     * to have the outline be black. Default value is 160.
     * @param value
     */
    public setTextBackgroundAutoColorThreshold(value: int): void {
        RendererSettings._TextBackgroundAutoColorThreshold = value;
    }

    /**
     * Value from 0 to 255. The closer to 0 the lighter the text color has to be
     * to have the outline be black. Default value is 160.
     * @return
     */
    public getTextBackgroundAutoColorThreshold(): int {
        return RendererSettings._TextBackgroundAutoColorThreshold;
    }

    /**
     * This applies to Single Point Tactical Graphics.
     * Setting this will determine the default value for milStdSymbols when created.
     * 0 for no outline,
     * 1 for outline thickness of 1 pixel,
     * 2 for outline thickness of 2 pixels,
     * greater than 2 is not currently recommended.
     * @deprecated
     * @param width
     */
    public setSinglePointSymbolOutlineWidth(width: int): void {
        RendererSettings._SymbolOutlineWidth = width;
    }

    /**
     * This applies to Single Point Tactical Graphics.
     * @return
     * @deprecated
     */
    public getSinglePointSymbolOutlineWidth(): int {
        return RendererSettings._SymbolOutlineWidth;
    }

    public setOutlineSPControlMeasures(value: boolean): void {
        RendererSettings._OutlineSPControlMeasures = value;
    }

    public getOutlineSPControlMeasures(): boolean {
        return RendererSettings._OutlineSPControlMeasures;
    }

    /**
     * false to use label font size
     * true to scale it using symbolPixelBounds / 3.5
     * @param value
     */
    public setScaleEchelon(value: boolean): void {
        this._scaleEchelon = value;
    }
    /**
     * Returns the value determining if we scale the echelon font size or
     * just match the font size specified by the label font.
     * @return true or false
     */
    public getScaleEchelon(): boolean {
        return this._scaleEchelon;
    }

    /**
     * Determines how to draw the Affiliation modifier.
     * True to draw as modifier label in the "E/F" location.
     * False to draw at the top right corner of the symbol
     */
    public setDrawAffiliationModifierAsLabel(value: boolean): void {
        this._DrawAffiliationModifierAsLabel = value;
    }
    /**
     * True to draw as modifier label in the "E/F" location.
     * False to draw at the top right corner of the symbol
     */
    public getDrawAffiliationModifierAsLabel(): boolean {
        return this._DrawAffiliationModifierAsLabel;
    }

    /**
     * Sets the font to be used for modifier labels
     * @param name Like "arial"
     * @param weight Like "normal" or "bold"
     * @param size Like 12
     */
    public setLabelFont(name: string, weight: string, size: int): void;


    /**
     *
     * @param name Like "arial"
     * @param type Like Font.BOLD
     * @param size Like 12
     */
    public setLabelFont(name: string, type: int, size: int): void;

    public setLabelFont(...args: unknown[]): void {
        switch (args.length) {
            case 3:
                {
                    if (typeof args[1] === 'string') {
                        const [name, weight, size] = args as [string, string, int];

                        RendererSettings._ModifierFontName = name;
                        RendererSettings._ModifierFontWeight = weight;
                        RendererSettings._ModifierFontType = Font.getTypeInt(weight);
                        RendererSettings._ModifierFontSize = size;
                    }
                    else if (typeof args[1] === 'number') {
                        const [name, type, size] = args as [string, int, int];


                        RendererSettings._ModifierFontName = name;
                        RendererSettings._ModifierFontWeight = Font.getTypeString(type);
                        RendererSettings._ModifierFontType = type;
                        RendererSettings._ModifierFontSize = size;
                    }

                    break;
                }


            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
        this.raiseEvents(SettingsChangedEvent.EventType_FontChanged);
    }

    public setMPLabelFont(name: string, weight: string, size: int): void;
    public setMPLabelFont(name: string, weight: string, size: int, kmlScale: float): void;
    public setMPLabelFont(name: string, type: int, size: int): void;
    public setMPLabelFont(name: string, type: int, size: int, kmlScale: float): void;
    public setMPLabelFont(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                if (typeof args[1] === 'number') {
                    const [name, type, size] = args as [string, int, int];


                    RendererSettings._MPLabelFontName = name;
                    RendererSettings._MPLabelFontType = type;
                    RendererSettings._MPLabelFontSize = size;
                    RendererSettings._KMLLabelScale = 1.0;
                    //_MPLabelFontKerning = 0;
                    //_MPLabelFontTracking = TextAttribute.TRACKING_LOOSE;
                } else {
                    const [name, weight, size] = args as [string, string, int];

                    RendererSettings._MPLabelFontName = name;
                    RendererSettings._MPLabelFontType = Font.getTypeInt(weight);
                    RendererSettings._MPLabelFontSize = size;
                    RendererSettings._KMLLabelScale = 1.0;
                    //_MPLabelFontKerning = 0;
                    //_MPLabelFontTracking = TextAttribute.TRACKING_LOOSE;
                }
                break;
            }

            case 4: {
                if (typeof args[1] === 'number') {
                    const [name, type, size, kmlScale] = args as [string, int, int, float];

                    RendererSettings._MPLabelFontName = name;
                    RendererSettings._ModifierFontWeight = Font.getTypeString(type);
                    RendererSettings._ModifierFontType = type;
                    RendererSettings._MPLabelFontSize = Math.round(size * kmlScale);
                    RendererSettings._KMLLabelScale = kmlScale;
                    //_MPLabelFontKerning = 0;
                    //_MPLabelFontTracking = TextAttribute.TRACKING_LOOSE;
                } else {
                    const [name, weight, size, kmlScale] = args as [string, string, int, float];

                    RendererSettings._MPLabelFontName = name;
                    RendererSettings._ModifierFontWeight = weight;
                    RendererSettings._ModifierFontType = Font.getTypeInt(weight);
                    RendererSettings._MPLabelFontSize = Math.round(size * kmlScale);
                    RendererSettings._KMLLabelScale = kmlScale;
                    //_MPLabelFontKerning = 0;
                    //_MPLabelFontTracking = TextAttribute.TRACKING_LOOSE;
                }
                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
        this.raiseEvents(SettingsChangedEvent.EventType_FontChanged);
    }


    /**
     * the font name to be used for modifier labels
     * @return name of the label font
     */
    public getLabelFontName(): string {
        return RendererSettings._ModifierFontName;
    }

    /**
     * Like Font.BOLD
     * @return type of the label font
     */
    public getLabelFontType(): int {
        return RendererSettings._ModifierFontType;
    }

    /**
     * get font point size
     * @return size of the label font
     */
    public getLabelFontSize(): int {
        return RendererSettings._ModifierFontSize;
    }


    /**
     * get font object used for labels
     * @return Font object
     */
    public getLabelFont(): Font {
        try {

            let temp: Font = new Font(RendererSettings._ModifierFontName, RendererSettings._ModifierFontType, RendererSettings._ModifierFontSize);

            return temp;
        } catch (exc) {
            if (exc instanceof Error) {
                let message: string = "font creation error, returning \"" + RendererSettings._ModifierFontName + "\" font, " + RendererSettings._ModifierFontSize + "pt. Check font name and type.";
                ErrorLogger.LogMessage("RendererSettings", "getLabelFont", message);
                ErrorLogger.LogMessage("RendererSettings", "getLabelFont", exc.message);
                return new Font("arial", Font.BOLD, 12);
            } else {
                throw exc;
            }
        }
    }

    /**
     * get font object used for labels
     * @return Font object
     */
    public getMPLabelFont(): Font {
        try {

            let temp: Font = new Font(RendererSettings._MPLabelFontName, RendererSettings._MPLabelFontType, RendererSettings._MPLabelFontSize);

            return temp;//.deriveFont(map);
        } catch (exc) {
            if (exc instanceof Error) {
                let message: string = "font creation error, returning \"" + RendererSettings._MPLabelFontName + "\" font, " + RendererSettings._MPLabelFontSize + "pt. Check font name and type.";
                ErrorLogger.LogMessage("RendererSettings", "getMPLabelFont", message);
                ErrorLogger.LogMessage("RendererSettings", "getMPLabelFont", exc.message);
                return new Font("arial", Font.BOLD, 12);
            } else {
                throw exc;
            }
        }
    }

    public getKMLLabelScale(): float {
        return RendererSettings._KMLLabelScale;
    }

    /**
     * the font name to be used for modifier labels
     * @return name of the label font
     */
    public getMPLabelFontName(): string
    {
        return RendererSettings._MPLabelFontName;
    }

    /**
     * Like Font.BOLD
     * @return type of the label font
     */
    public getMPLabelFontType(): int
    {
        return RendererSettings._MPLabelFontType;
    }

    /**
     * get font point size
     * @return size of the label font
     */
    public getMPLabelFontSize(): int
    {
        return RendererSettings._MPLabelFontSize;
    }


    /**
     ** Get a boolean indicating between the use of ENY labels in all segments (false) or
     * to only set 2 labels one at the north and the other one at the south of the graphic (true).
     * @return {boolean}
     */
    public getTwoLabelOnly(): boolean {
        return this._TwoLabelOnly;
    }

    /**
     * Set a boolean indicating between the use of ENY labels in all segments (false) or
     * to only set 2 labels one at the north and the other one at the south of the graphic (true).
     * @param TwoLabelOnly
     */
    public setTwoLabelOnly(TwoLabelOnly: boolean): void {
        this._TwoLabelOnly = TwoLabelOnly;
    }

    /**
     * get the preferred fill affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getFriendlyUnitFillColor(): Color {
        return this._friendlyUnitFillColor;
    }
    /**
     * Set the preferred fill affiliation color for units
     *
     * @param friendlyUnitFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setFriendlyUnitFillColor(friendlyUnitFillColor: Color): void {
        if (friendlyUnitFillColor != null) {

            this._friendlyUnitFillColor = friendlyUnitFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getHostileUnitFillColor(): Color {
        return this._hostileUnitFillColor;
    }
    /**
     * Set the preferred fill affiliation color for units
     *
     * @param hostileUnitFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setHostileUnitFillColor(hostileUnitFillColor: Color): void {
        if (hostileUnitFillColor != null) {

            this._hostileUnitFillColor = hostileUnitFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getNeutralUnitFillColor(): Color {
        return this._neutralUnitFillColor;
    }
    /**
     * Set the preferred line affiliation color for units
     *
     * @param neutralUnitFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setNeutralUnitFillColor(neutralUnitFillColor: Color): void {
        if (neutralUnitFillColor != null) {

            this._neutralUnitFillColor = neutralUnitFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getUnknownUnitFillColor(): Color {
        return this._unknownUnitFillColor;
    }
    /**
     * Set the preferred fill affiliation color for units
     *
     * @param unknownUnitFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setUnknownUnitFillColor(unknownUnitFillColor: Color): void {
        if (unknownUnitFillColor != null) {

            this._unknownUnitFillColor = unknownUnitFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getHostileGraphicFillColor(): Color {
        return this._hostileGraphicFillColor;
    }
    /**
     * Set the preferred fill affiliation color for graphics
     *
     * @param hostileGraphicFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setHostileGraphicFillColor(hostileGraphicFillColor: Color): void {
        if (hostileGraphicFillColor != null) {

            this._hostileGraphicFillColor = hostileGraphicFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getFriendlyGraphicFillColor(): Color {
        return this._friendlyGraphicFillColor;
    }
    /**
     * Set the preferred fill affiliation color for graphics
     *
     * @param friendlyGraphicFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setFriendlyGraphicFillColor(friendlyGraphicFillColor: Color): void {
        if (friendlyGraphicFillColor != null) {

            this._friendlyGraphicFillColor = friendlyGraphicFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getNeutralGraphicFillColor(): Color {
        return this._neutralGraphicFillColor;
    }
    /**
     * Set the preferred fill affiliation color for graphics
     *
     * @param neutralGraphicFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setNeutralGraphicFillColor(neutralGraphicFillColor: Color): void {
        if (neutralGraphicFillColor != null) {

            this._neutralGraphicFillColor = neutralGraphicFillColor;
        }

    }
    /**
     * get the preferred fill affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getUnknownGraphicFillColor(): Color {
        return this._unknownGraphicFillColor;
    }
    /**
     * Set the preferred fill affiliation color for graphics
     *
     * @param unknownGraphicFillColor Color like  Color(255, 255, 255)
     *
     * */
    public setUnknownGraphicFillColor(unknownGraphicFillColor: Color): void {
        if (unknownGraphicFillColor != null) {

            this._unknownGraphicFillColor = unknownGraphicFillColor;
        }

    }
    /**
     * get the preferred line affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getFriendlyUnitLineColor(): Color {
        return this._friendlyUnitLineColor;
    }
    /**
     * Set the preferred line affiliation color for units
     *
     * @param friendlyUnitLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setFriendlyUnitLineColor(friendlyUnitLineColor: Color): void {
        if (friendlyUnitLineColor != null) {

            this._friendlyUnitLineColor = friendlyUnitLineColor;
        }

    }
    /**
     * get the preferred line   affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getHostileUnitLineColor(): Color {
        return this._hostileUnitLineColor;
    }
    /**
     * Set the preferred line affiliation color for units
     *
     * @param hostileUnitLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setHostileUnitLineColor(hostileUnitLineColor: Color): void {
        if (hostileUnitLineColor != null) {

            this._hostileUnitLineColor = hostileUnitLineColor;
        }

    }
    /**
     * get the preferred line affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getNeutralUnitLineColor(): Color {
        return this._neutralUnitLineColor;
    }
    /**
     * Set the preferred line affiliation color for units
     *
     * @param neutralUnitLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setNeutralUnitLineColor(neutralUnitLineColor: Color): void {
        if (neutralUnitLineColor != null) {

            this._neutralUnitLineColor = neutralUnitLineColor;
        }

    }
    /**
     * get the preferred line affiliation color for units.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getUnknownUnitLineColor(): Color {
        return this._unknownUnitLineColor;
    }
    /**
     * Set the preferred line affiliation color for units
     *
     * @param unknownUnitLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setUnknownUnitLineColor(unknownUnitLineColor: Color): void {
        if (unknownUnitLineColor != null) {

            this._unknownUnitLineColor = unknownUnitLineColor;
        }

    }
    /**
     * get the preferred line affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getFriendlyGraphicLineColor(): Color {
        return this._friendlyGraphicLineColor;
    }
    /**
     * Set the preferred line affiliation color for graphics
     *
     * @param friendlyGraphicLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setFriendlyGraphicLineColor(friendlyGraphicLineColor: Color): void {
        if (friendlyGraphicLineColor != null) {

            this._friendlyGraphicLineColor = friendlyGraphicLineColor;
        }

    }
    /**
     * get the preferred line affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getHostileGraphicLineColor(): Color {
        return this._hostileGraphicLineColor;
    }
    /**
     * Set the preferred line affiliation color for graphics
     *
     * @param hostileGraphicLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setHostileGraphicLineColor(hostileGraphicLineColor: Color): void {
        if (hostileGraphicLineColor != null) {

            this._hostileGraphicLineColor = hostileGraphicLineColor;
        }

    }
    /**
     * get the preferred line affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getNeutralGraphicLineColor(): Color {
        return this._neutralGraphicLineColor;
    }
    /**
     * Set the preferred line affiliation color for graphics
     *
     * @param neutralGraphicLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setNeutralGraphicLineColor(neutralGraphicLineColor: Color): void {
        if (neutralGraphicLineColor != null) {

            this._neutralGraphicLineColor = neutralGraphicLineColor;
        }

    }
    /**
     * get the preferred line affiliation color for graphics.
     *
     * @return Color like  Color(255, 255, 255)
     *
     * */
    public getUnknownGraphicLineColor(): Color {
        return this._unknownGraphicLineColor;
    }
    /**
     * Set the preferred line affiliation color for graphics
     *
     * @param unknownGraphicLineColor Color like  Color(255, 255, 255)
     *
     * */
    public setUnknownGraphicLineColor(unknownGraphicLineColor: Color): void {
        if (unknownGraphicLineColor != null) {

            this._unknownGraphicLineColor = unknownGraphicLineColor;
        }

    }

    /**
     * Set the preferred line and fill affiliation color for tactical graphics.
     *
     * @param friendlyGraphicLineColor Color
     * @param hostileGraphicLineColor Color
     * @param neutralGraphicLineColor Color
     * @param unknownGraphicLineColor Color
     * @param friendlyGraphicFillColor Color
     * @param hostileGraphicFillColor Color
     * @param neutralGraphicFillColor Color
     * @param unknownGraphicFillColor Color
     */
    public setGraphicPreferredAffiliationColors(friendlyGraphicLineColor: Color,
        hostileGraphicLineColor: Color,
        neutralGraphicLineColor: Color,
        unknownGraphicLineColor: Color,
        friendlyGraphicFillColor: Color,
        hostileGraphicFillColor: Color,
        neutralGraphicFillColor: Color,
        unknownGraphicFillColor: Color): void {


        this.setFriendlyGraphicLineColor(friendlyGraphicLineColor);
        this.setHostileGraphicLineColor(hostileGraphicLineColor);
        this.setNeutralGraphicLineColor(neutralGraphicLineColor);
        this.setUnknownGraphicLineColor(unknownGraphicLineColor);
        this.setFriendlyGraphicFillColor(friendlyGraphicFillColor);
        this.setHostileGraphicFillColor(hostileGraphicFillColor);
        this.setNeutralGraphicFillColor(neutralGraphicFillColor);
        this.setUnknownGraphicFillColor(unknownGraphicFillColor);
    }

    /**
     * Set the preferred line and fill affiliation color for units and tactical graphics.
     *
     * @param friendlyUnitLineColor Color like  Color(255, 255, 255). Set to null to ignore setting
     * @param hostileUnitLineColor Color
     * @param neutralUnitLineColor Color
     * @param unknownUnitLineColor Color
     * @param friendlyUnitFillColor Color
     * @param hostileUnitFillColor Color
     * @param neutralUnitFillColor Color
     * @param unknownUnitFillColor Color
     */
    public setUnitPreferredAffiliationColors(friendlyUnitLineColor: Color,
        hostileUnitLineColor: Color,
        neutralUnitLineColor: Color,
        unknownUnitLineColor: Color,
        friendlyUnitFillColor: Color,
        hostileUnitFillColor: Color,
        neutralUnitFillColor: Color,
        unknownUnitFillColor: Color): void {

        this.setFriendlyUnitLineColor(friendlyUnitLineColor);
        this.setHostileUnitLineColor(hostileUnitLineColor);
        this.setNeutralUnitLineColor(neutralUnitLineColor);
        this.setUnknownUnitLineColor(unknownUnitLineColor);
        this.setFriendlyUnitFillColor(friendlyUnitFillColor);
        this.setHostileUnitFillColor(hostileUnitFillColor);
        this.setNeutralUnitFillColor(neutralUnitFillColor);
        this.setUnknownUnitFillColor(unknownUnitFillColor);
    }

}
