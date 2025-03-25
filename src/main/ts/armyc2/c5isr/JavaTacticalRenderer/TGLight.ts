import { type int } from "../graphics2d/BasicTypes";


import { BasicStroke } from "../graphics2d/BasicStroke"
import { Font } from "../graphics2d/Font"
import { TexturePaint } from "../graphics2d/TexturePaint"
import { POINT2 } from "../JavaLineArray/POINT2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { Modifier2 } from "../JavaTacticalRenderer/Modifier2"
import { Color } from "../renderer/utilities/Color"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../renderer/utilities/SymbolUtilities"

/**
 * A class to encapsulate the tactical graphic object. Many of the properties
 * correspond to a client MilStdSymbol object.
 *
 *
 */
export class TGLight {

    public LatLongs: Array<POINT2>;
    private static readonly _className: string = "TGLight";

    public get_LatLongs(): Array<POINT2> {
        return this.LatLongs;
    }

    public set_LatLongs(value: Array<POINT2>): void {
        this.LatLongs = value;
    }

    public Pixels: Array<POINT2>;

    public get_Pixels(): Array<POINT2> {
        return this.Pixels;
    }

    public set_Pixels(value: Array<POINT2>): void {
        this.Pixels = value;
    }

    public modifiers: Array<Modifier2>;

    public get_Modifiers(): Array<Modifier2> {
        return this.modifiers;
    }

    public set_Modifiers(value: Array<Modifier2>): void {
        this.modifiers = value;
    }

    protected tp: TexturePaint;

    public set_TexturePaint(value: TexturePaint): void {
        this.tp = value;
    }

    public get_TexturePaint(): TexturePaint {
        return this.tp;
    }

    protected maskOff: boolean;

    public constructor() {
        
    }

    private font: Font;

    public set_Font(value: Font): void {
        this.font = value;
    }

    public get_Font(): Font {
        return this.font;
    }

    private iconSize: int = 50;

    /**
     * Set the icon size for areas that have a symbol like LAA or Biological Contaminated Area
     * @param pixelSize
     */
    public setIconSize(pixelSize: int): void { this.iconSize = pixelSize; }

    public getIconSize(): int { return this.iconSize; }

    private keepUnitRatio: boolean = true;

    public set_KeepUnitRatio(value: boolean): void {
        this.keepUnitRatio = value;
    }

    public get_KeepUnitRation(): boolean {
        return this.keepUnitRatio;
    }

    private lineType: int = 0;

    public set_LineType(value: int): void {
        this.lineType = value;
    }

    public get_LineType(): int {
        return this.lineType;
    }

    private lineStyle: int = 0;

    public set_LineStyle(value: int): void {
        this.lineStyle = value;
    }

    public get_LineStyle(): int {
        return this.lineStyle;
    }

    private lineColor: Color | null;

    public get_LineColor(): Color | null {
        return this.lineColor;
    }

    public set_LineColor(value: Color | null): void {
        this.lineColor = value;
    }

    private fillStyle: int = 0;

    public get_FillStyle(): int {
        return this.fillStyle;
    }

    public set_Fillstyle(value: int): void {
        this.fillStyle = value;
    }

    private fillColor: Color | null;

    public get_FillColor(): Color | null {
        return this.fillColor;
    }

    public set_FillColor(value: Color | null): void {
        this.fillColor = value;
    }

    private fontBackColor: Color = Color.WHITE;

    //private Color fontBackColor=RendererSettings.getInstance().getLabelBackgroundColor();
    public get_FontBackColor(): Color {
        return this.fontBackColor;
    }

    public set_FontBackColor(value: Color): void {
        this.fontBackColor = value;
    }

    private textColor: Color;

    public get_TextColor(): Color {
        return this.textColor;
    }

    public set_TextColor(value: Color): void {
        this.textColor = value;
    }

    private lineThickness: int = 0;

    public get_LineThickness(): int {
        return this.lineThickness;
    }

    public set_LineThickness(value: int): void {
        this.lineThickness = value;
    }

    private t: string = "";

    public get_Name(): string {
        if (this.visibleModifiers) {
            return this.t;
        } else {
            return "";
        }
    }

    private client: string = "";

    public get_Client(): string {
        return this.client;
    }

    public set_client(value: string): void {
        this.client = value;
    }

    public set_Name(value: string): void {
        this.t = value;
    }

    private t1: string = "";

    public get_T1(): string {
        if (this.visibleModifiers) {
            return this.t1;
        } else {
            return "";
        }
    }

    public set_T1(value: string): void {
        this.t1 = value;
    }

    private am: string = "";

    public get_AM(): string {
        if (this.visibleModifiers) {
            return this.am;
        } else {
            return "";
        }
    }

    public set_AM(value: string): void {
        this.am = value;
    }

    private am1: string = "";

    public get_AM1(): string {
        if (this.visibleModifiers) {
            return this.am1;
        } else {
            return "";
        }
    }

    public set_AM1(value: string): void {
        this.am1 = value;
    }

    private an: string = "";

    public get_AN(): string {
        if (this.visibleModifiers) {
            return this.an;
        } else {
            return "";
        }
    }

    public set_AN(value: string): void {
        this.an = value;
    }

    private v: string = "";

    public get_V(): string {
        if (this.visibleModifiers) {
            return this.v;
        } else {
            return "";
        }
    }

    public set_V(value: string): void {
        this.v = value;
    }


    private ap: string = "";

    public get_AP(): string {
        if (this.visibleModifiers) {
            return this.ap;
        } else {
            return "";
        }
    }

    public set_AP(value: string): void {
        this.ap = value;
    }

    private as: string = "";

    public get_AS(): string {
        if (this.visibleModifiers) {
            return this.as;
        } else {
            return "";
        }
    }

    public set_AS(value: string): void {
        this.as = value;
    }

    private x: string = "";

    public get_X(): string {
        return this.x;
    }

    public set_X(value: string): void {
        this.x = value;
    }

    private x1: string = "";

    public get_X1(): string {
        return this.x1;
    }

    public set_X1(value: string): void {
        this.x1 = value;
    }

    private h: string = "";

    public get_H(): string {
        if (this.visibleModifiers || this.lineType === TacticalLines.RECTANGULAR) {
            return this.h;
        } else {
            return "";
        }
    }

    public set_H(value: string): void {
        this.h = value;
    }

    public get_Location(): string {
        if (this.visibleModifiers) {
            if (this.y.length > 0) {
                return this.y;
            } else {
                return this.h;
            }
        } else {
            return "";
        }
    }

    public set_Location(value: string): void {
        this.y = value;
    }

    private h1: string = "";

    /**
     * @deprecated
     */
    public get_H1(): string {
        if (this.visibleModifiers) {
            return this.h1;
        } else {
            return "";
        }
    }

    /**
     * @deprecated
     */
    public set_H1(value: string): void {
        this.h1 = value;
    }

    //location
    private y: string = "";

    private n: string = "ENY";

    public get_N(): string {
        return this.n;
    }

    public set_N(value: string): void {
        this.n = value;
    }

    private h2: string = "";

    /**
     * @deprecated
     */
    public get_H2(): string {
        if (this.visibleModifiers || this.lineType === TacticalLines.RECTANGULAR) {
            return this.h2;
        } else {
            return "";
        }
    }

    /**
     * @deprecated
     */
    public set_H2(value: string): void {
        this.h2 = value;
    }

    /**
     * Only used for range fan
     * left azimuth,right azimuth,min radius,max radius
     */
    private leftRightMinMax: string = "";

    public get_LRMM(): string {
        return this.leftRightMinMax;
    }

    public set_LRMM(value: string): void {
        this.leftRightMinMax = value;
    }

    private w: string = "";

    public get_DTG(): string {
        if (this.visibleModifiers) {
            return this.w;
        } else {
            return "";
        }
    }

    public set_DTG(value: string): void {
        this.w = value;
    }

    private w1: string = "";

    public get_DTG1(): string {
        if (this.visibleModifiers) {
            return this.w1;
        } else {
            return "";
        }
    }

    public set_DTG1(value: string): void {
        this.w1 = value;
    }


    private standardIdentity: string = "00";

    public get_StandardIdentity(): string {
        return this.standardIdentity;
    }

    /**
     * @return true if standard identity is suspect/joker or hostile/faker
     */
    public isHostile(): boolean {
        if (this.standardIdentity != null) {
            return this.standardIdentity.charAt(1) === '5' || this.standardIdentity.charAt(1) === '6';
        } else {
            return false;
        }
    }

    private echelonSymbol: string = "";

    get_EchelonSymbol(): string {
        return this.echelonSymbol;
    }

    public set_EchelonSymbol(value: string): void {
        this.echelonSymbol = value;
    }

    private symbolId: string = "00000000";

    public get_SymbolId(): string {
        return this.symbolId;
    }

    // "P" for present or "A" for anticipated
    private status: string = "P";

    public get_Status(): string {
        return this.status;
    }

    public set_Status(value: string): void {
        this.status = value;
    }

    /**
     * Sets tactical graphic properties based on the 20-30 digit Mil-Std-2525 symbol code
     *
     * @param value
     */
    public set_SymbolId(value: string): void {
        try {
            this.symbolId = value;
            let symbolSet: int = SymbolID.getSymbolSet(this.symbolId);
            if (symbolSet === 25) {
                this.standardIdentity = SymbolID.getStandardIdentity(this.symbolId) + "";
                if (this.standardIdentity.length === 1) {

                    this.standardIdentity = "0" + this.standardIdentity;
                }


                this.status = "P"; // default to present
                if (SymbolID.getStatus(this.symbolId) === 1) {
                    // Planned/Anticipated/Suspect
                    this.status = "A";
                    this.lineStyle = 1; // dashed
                }

                let amplifier: int = SymbolID.getAmplifierDescriptor(this.symbolId);
                this.echelonSymbol = SymbolUtilities.getEchelonText(amplifier);
                if (this.echelonSymbol == null) {
                    this.echelonSymbol = "";
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                //clsUtility.WriteFile("Error in TGLight.set_SymbolId");
                ErrorLogger.LogException(TGLight._className, "set_SymbolId",
                    new RendererException("Failed inside set_SymbolId", exc));
            } else {
                throw exc;
            }
        }
    }

    private visibleModifiers: boolean = true;

    /**
     * @deprecated
     */
    public set_VisibleModifiers(value: boolean): void {
        this.visibleModifiers = value;
    }

    /**
     * @deprecated
     */
    protected get_VisibleModifiers(): boolean {
        return this.visibleModifiers;
    }

    private visibleLabels: boolean;

    /**
     * @deprecated
     */
    public set_VisibleLabels(value: boolean): void {
        this.visibleLabels = value;
    }

    /**
     * @deprecated
     */
    protected get_VisibleLabels(): boolean {
        return this.visibleLabels;
    }

    protected _useLineInterpolation: boolean = false;

    public get_UseLineInterpolation(): boolean {
        return this._useLineInterpolation;
    }

    public set_UseLineInterpolation(value: boolean): void {
        this._useLineInterpolation = value;
    }

    protected _useDashArray: boolean = false;

    public get_UseDashArray(): boolean {
        return this._useDashArray;
    }

    public set_UseDashArray(value: boolean): void {
        this._useDashArray = value;
    }

    protected _useHatchFill: boolean = false;

    public get_UseHatchFill(): boolean {
        return this._useHatchFill;
    }

    public set_UseHatchFill(value: boolean): void {
        this._useHatchFill = value;
    }

    //    boolean _usePatternFill = false;    
    //    public boolean get_UsePatternFill() {
    //        return _usePatternFill;
    //    }
    //
    //    public void set_UsePatternFill(boolean value) {
    //        _usePatternFill = value;
    //    }

    private _wasClipped: boolean = false;

    public set_WasClipped(value: boolean): void {
        this._wasClipped = value;
    }

    public get_WasClipped(): boolean {
        return this._wasClipped;
    }

    //boolean determines whether to add the range and azimuth modifiers for range fans
    private _HideOptionalLabels: boolean = false;

    public get_HideOptionalLabels(): boolean {
        return this._HideOptionalLabels;
    }

    public set_HideOptionalLabels(value: boolean): void {
        this._HideOptionalLabels = value;
    }

    private lineCap: int = BasicStroke.CAP_SQUARE;

    public set_lineCap(cap: int): void {
        this.lineCap = cap;
    }

    public get_lineCap(): int {
        return this.lineCap;
    }
}
