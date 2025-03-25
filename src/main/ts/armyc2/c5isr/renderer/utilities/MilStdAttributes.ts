/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { DistanceUnit } from "../../renderer/utilities/DistanceUnit"
import { Modifiers } from "../../renderer/utilities/Modifiers"
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities"


/**
 * Symbol attribute constants 
 */
export class MilStdAttributes {

    /**
     * Line color of the symbol. hex value.
     */
    public static readonly LineColor: string = "LINECOLOR";

    /**
     * Fill color of the symbol. hex value
     */
    public static readonly FillColor: string = "FILLCOLOR";

    /**
     * Main color of internal icon.  Only relevant to framed symbols. hex value
     */
    public static readonly IconColor: string = "ICONCOLOR";

    /**
     * size of the single point image
     */
    public static readonly PixelSize: string = "PIXELSIZE";


    /**
     * defaults to true
     */
    public static readonly KeepUnitRatio: string = "KEEPUNITRATIO";

    /**
     * transparency value of the symbol with values from 0 - 255.
     */
    public static readonly Alpha: string = "ALPHA";

    /**
     * outline the symbol, true/false
     */
    public static readonly OutlineSymbol: string = "OUTLINESYMBOL";

    /**
     * specify and outline color rather than letting renderer picking 
     * the best contrast color. hex value
     */
    public static readonly OutlineColor: string = "OUTLINECOLOR";

    /*
     * specifies thickness of the symbol outline
     */
    //public static final String OutlineWidth = 9;

    /**
     * just draws the core symbol
     */
    public static readonly DrawAsIcon: string = "DRAWASICON";

    /**
     * Specifies the line width of the multipoint symbology
     */
    public static readonly LineWidth: string = "LINEWIDTH";

    /**
     * Specifies the color for text labels
     */
    public static readonly TextColor: string = "TEXTCOLOR";

    /**
     * Specifies the color for the text background (color outline or fill)
     */
    public static readonly TextBackgroundColor: string = "TEXTBACKGROUNDCOLOR";

    /**
     * If false, the renderer will create a bunch of little lines to create
     * the "dash" effect (expensive but necessary for KML).  
     * If true, it will be on the user to create the dash effect using the
     * DashArray from the Stroke object from the ShapeInfo object.
     */
    public static readonly UseDashArray: string = "USEDASHARRAY";

    /**
     * The mode that altitude labels will be displayed in, the default value is AMSL.
     *
     * This value acts as a label, appending whatever string that is passed in to the end of the altitude units.
     * Currently only effective for multi-point graphics.
     */
    public static readonly AltitudeMode: string = "ALTITUDEMODE";

    /**
     * At the moment, this refers to the optional range fan labels.
     */
    public static readonly HideOptionalLabels: string = "HIDEOPTIONALLABELS";

    /**
     * For internal use
     */
    public static readonly UsePatternFill: string = "USEPATTERNFILL";

    /**
     * For internal use
     */
    public static readonly PatternFillType: string = "PATTERNFILLTYPE";

    /**
     * The conversion factor and the label that you want all distances to display in. The conversion factor
     * is converting from meters. The default unit is meters.<br><br>
     *
     * Must be in the form [conversionFactor],[label]. So for example converting to feet would be "3.28084,FT".
     * The helper class {@link DistanceUnit} can be used.
     */
    public static readonly DistanceUnits: string = "DISTANCEUNITS";

    /**
     * The conversion factor and the label that you want all distances to display in.
     * Conventionally, the conversion factor is converting from meters by default,
     * but other values could be passed, like "1,KM" to use an unaltered value in kilometers.<br><br>
     *
     * Must be in the form [conversionFactor],[label]. So for example converting meters to feet would be "3.28084,FT".
     * The helper class {@link DistanceUnit} can be used.
     * Currently only effective for multi-point graphics.
     */
    public static readonly AltitudeUnits: string = "ALTITUDEUNITS";

    /**
     * If the engagement/target amplifier bar is to be used to designate targets, non-targets, and
     * pruned or expired targets, a different coloring schema shall be used. Hostile tracks which
     * are deemed targets shall have a red bar (RGB: 255, 0, 0) to indicate target. For hostile
     * tracks deemed to be non-targets, white (RGB: 255, 255, 255) should be used to indicate non
     * target. Finally, for hostile tracks which have been pruned or have expired shall be colored
     * orange (RGB: 255, 120, 0).
     * This attribute expects a hex string for the color
     */
    public static readonly EngagementBarColor: string = "ENGAGEMENTBARCOLOR";

    /**
     * No Longer relevant
     * @return 
     * @deprecated see {@link GetAttributesList()}
     */
    public static GetModifierList(): Array<string> {
        let list: Array<string> = new Array();

        list.push(MilStdAttributes.LineColor);
        list.push(MilStdAttributes.FillColor);
        //list.push(IconColor);
        //list.push(FontSize);
        list.push(MilStdAttributes.PixelSize);
        list.push(MilStdAttributes.KeepUnitRatio);
        list.push(MilStdAttributes.Alpha);
        list.push(MilStdAttributes.OutlineSymbol);
        list.push(MilStdAttributes.OutlineColor);
        //list.push(OutlineWidth);
        list.push(MilStdAttributes.DrawAsIcon);
        list.push(MilStdAttributes.HideOptionalLabels);
        list.push(MilStdAttributes.DistanceUnits);
        list.push(MilStdAttributes.AltitudeUnits);
        list.push(MilStdAttributes.EngagementBarColor);

        return list;
    }

    public static GetAttributesList(symbolID: string): Array<string> {
        let list: Array<string> = new Array();

        list.push(MilStdAttributes.LineColor);
        list.push(MilStdAttributes.FillColor);
        //list.push(IconColor);
        list.push(MilStdAttributes.PixelSize);

        if (SymbolUtilities.isMultiPoint(symbolID) === false) {
            list.push(MilStdAttributes.KeepUnitRatio);
            list.push(MilStdAttributes.OutlineSymbol);
            list.push(MilStdAttributes.OutlineColor);
            list.push(MilStdAttributes.DrawAsIcon);
            if (SymbolUtilities.hasModifier(symbolID, Modifiers.AO_ENGAGEMENT_BAR)) {

                list.push(MilStdAttributes.EngagementBarColor);
            }

        }
        else {
            list.push(MilStdAttributes.LineWidth);
            list.push(MilStdAttributes.HideOptionalLabels);
            list.push(MilStdAttributes.DistanceUnits);
            list.push(MilStdAttributes.AltitudeUnits);
        }
        list.push(MilStdAttributes.Alpha);

        return list;
    }

    /**
     * @param attribute constant like MilStdAttributes.LineColor
     * @return attribute name based on attribute constants
     */
    public static getAttributeName(attribute: string): string {
        switch (attribute) {
            case MilStdAttributes.LineColor: {
                return "Line Color";
            }

            case MilStdAttributes.FillColor: {
                return "Fill Color";
            }

            case MilStdAttributes.PixelSize: {
                return "Pixel Size";
            }

            case MilStdAttributes.KeepUnitRatio: {
                return "Keep Unit Ratio";
            }

            case MilStdAttributes.Alpha: {
                return "Alpha";
            }

            case MilStdAttributes.OutlineSymbol: {
                return "Outline Symbol";
            }

            case MilStdAttributes.OutlineColor: {
                return "Outline Color";
            }

            case MilStdAttributes.DrawAsIcon: {
                return "Draw as Icon";
            }

            case MilStdAttributes.LineWidth: {
                return "Line Width";
            }

            case MilStdAttributes.TextColor: {
                return "Text Color";
            }

            case MilStdAttributes.TextBackgroundColor: {
                return "Text Background Color";
            }

            case MilStdAttributes.UseDashArray: {
                return "Use Dash Array";
            }

            case MilStdAttributes.AltitudeMode: {
                return "Altitude Mode";
            }

            case MilStdAttributes.HideOptionalLabels: {
                return "Hide Optional Labels";
            }

            case MilStdAttributes.UsePatternFill: {
                return "Use Pattern Fill";
            }

            case MilStdAttributes.PatternFillType: {
                return "Pattern Fill Type";
            }

            case MilStdAttributes.DistanceUnits: {
                return "Distance Units";
            }

            case MilStdAttributes.AltitudeUnits: {
                return "Altitude Units";
            }

            default: {
                return "unrecognized attribute";
            }

        }
    }

    /**
     * Takes a string representation of an attribute and returns the appropriate int key value
     * @param attribute "LINECOLOR" will return MilStdAtttributes.LineColor
     * @return number value representing Attribute constant.
     */
    public static getAttributeKey(attribute: string): string | null {
        switch (attribute.toUpperCase()) {
            case "LINECOLOR": {
                return MilStdAttributes.LineColor;
            }

            case "FILLCOLOR": {
                return MilStdAttributes.FillColor;
            }

            case "PIXELSIZE": {
                return MilStdAttributes.PixelSize;
            }

            case "KEEPUNITRATIO": {
                return MilStdAttributes.KeepUnitRatio;
            }

            case "ALPHA": {
                return MilStdAttributes.Alpha;
            }

            case "OUTLINESYMBOL": {
                return MilStdAttributes.OutlineSymbol;
            }

            case "OUTLINECOLOR": {
                return MilStdAttributes.OutlineColor;
            }

            case "DRAWASICON": {
                return MilStdAttributes.DrawAsIcon;
            }

            case "LINEWIDTH": {
                return MilStdAttributes.LineWidth;
            }

            case "TEXTCOLOR": {
                return MilStdAttributes.TextColor;
            }

            case "TEXTBACKGROUNDCOLOR": {
                return MilStdAttributes.TextBackgroundColor;
            }

            case "USEDASHARRAY": {
                return MilStdAttributes.UseDashArray;
            }

            case "ALTITUDEMODE": {
                return MilStdAttributes.AltitudeMode;
            }

            case "HIDEOPTIONALLABELS": {
                return MilStdAttributes.HideOptionalLabels;
            }

            case "USEPATTERNFILL": {
                return MilStdAttributes.UsePatternFill;
            }

            case "PATTERNFILLTYPE": {
                return MilStdAttributes.PatternFillType;
            }

            case "DISTANCEUNITS": {
                return MilStdAttributes.DistanceUnits;
            }

            case "ALTITUDEUNITS": {
                return MilStdAttributes.AltitudeUnits;
            }

            default: {
                return null;
            }

        }
    }
}
