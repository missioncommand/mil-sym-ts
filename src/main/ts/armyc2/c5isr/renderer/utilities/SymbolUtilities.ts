import { type int, type double } from "../../graphics2d/BasicTypes";

import { Point } from "../../graphics2d/Point";
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { AffiliationColors } from "../../renderer/utilities/AffiliationColors"
import { Color } from "../../renderer/utilities/Color"
import { DrawRules } from "../../renderer/utilities/DrawRules"
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger"
import { Modifiers } from "../../renderer/utilities/Modifiers"
import { MSInfo } from "../../renderer/utilities/MSInfo"
import { MSLookup } from "../../renderer/utilities/MSLookup"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { SVGLookup } from "../../renderer/utilities/SVGLookup"
import { SymbolID } from "../../renderer/utilities/SymbolID"

/**
 * Has various utility functions for prcessing the symbol code.
 * See {@link SymbolID} for additional functions related to parsing the symbol code.
 *
 */
export class SymbolUtilities {
    //this regex is from: https://docs.oracle.com/javase/7/docs/api/java/lang/Double.html
    private static readonly Digits: string = "(\\p{Digit}+)";
    private static readonly HexDigits: string = "(\\p{XDigit}+)";
    // an exponent is 'e' or 'E' followed by an optionally
    // signed decimal integer.
    private static readonly Exp: string = "[eE][+-]?" + SymbolUtilities.Digits;
    private static readonly fpRegex: string =
        ("[\\x00-\\x20]*" +  // Optional leading "whitespace"
            "[+-]?(" + // Optional sign character
            "NaN|" +           // "NaN" string
            "Infinity|" +      // "Infinity" string

            // A decimal floating-point string representing a finite positive
            // number without a leading sign has at most five basic pieces:
            // Digits . Digits ExponentPart FloatTypeSuffix
            //
            // Since this method allows integer-only strings as input
            // in addition to strings of floating-point literals, the
            // two sub-patterns below are simplifications of the grammar
            // productions from section 3.10.2 of
            // The Java™ Language Specification.

            // Digits ._opt Digits_opt ExponentPart_opt FloatTypeSuffix_opt
            "(((" + SymbolUtilities.Digits + "(\\.)?(" + SymbolUtilities.Digits + "?)(" + SymbolUtilities.Exp + ")?)|" +

            // . Digits ExponentPart_opt FloatTypeSuffix_opt
            "(\\.(" + SymbolUtilities.Digits + ")(" + SymbolUtilities.Exp + ")?)|" +

            // Hexadecimal strings
            "((" +
            // 0[xX] HexDigits ._opt BinaryExponent FloatTypeSuffix_opt
            "(0[xX]" + SymbolUtilities.HexDigits + "(\\.)?)|" +

            // 0[xX] HexDigits_opt . HexDigits BinaryExponent FloatTypeSuffix_opt
            "(0[xX]" + SymbolUtilities.HexDigits + "?(\\.)" + SymbolUtilities.HexDigits + ")" +

            ")[pP][+-]?" + SymbolUtilities.Digits + "))" +
            "[fFdD]?))" +
            "[\\x00-\\x20]*");// Optional trailing "whitespace"

    private static readonly pIsNumber: RegExp = RegExp(SymbolUtilities.fpRegex);

    /**
     * Determines if a String represents a valid number
     *
     * @param text string
     * @return "1.56" == true, "1ab" == false
     */
    public static isNumber(text: string): boolean {
        //return SymbolUtilities.pIsNumber.test(text);
        return !isNaN(parseFloat(text)) || !isNaN(parseInt(text))
    }


    /*private static String convert(int integer)
    {
        String hexAlphabet = "0123456789ABCDEF";
        String foo = "gfds" + "dhs";
        char char1 =  hexAlphabet.charAt((integer - integer % 16)/16);
        char char2 = hexAlphabet.charAt(integer % 16);
        String returnVal = char1.toString() + char2.toString();
        return returnVal;
    }

    public static String colorToHexString(Color color, Boolean withAlpha)
    {
        String hex = "";
        if(withAlpha == false)
        {
            hex = "#" + convert(color.getRed()) +
                    convert(color.getGreen()) +
                    convert(color.getBlue());
        }
        else
        {
            hex = "#" + convert(color.getAlpha()) +
                    convert(color.getRed()) +
                    convert(color.getGreen()) +
                    convert(color.getBlue());
        }
        return hex;
    }//*/

    /*private static String convert(int integer)
    {
        String hexAlphabet = "0123456789ABCDEF";
        String foo = "gfds" + "dhs";
        char char1 =  hexAlphabet.charAt((integer - integer % 16)/16);
        char char2 = hexAlphabet.charAt(integer % 16);
        String returnVal = char1.toString() + char2.toString();
        return returnVal;
    }

    public static String colorToHexString(Color color, Boolean withAlpha)
    {
        if(color != null) {
            String hex = "";
            if (withAlpha == false) {
                hex = "#" + convert(color.getRed()) +
                        convert(color.getGreen()) +
                        convert(color.getBlue());
            } else {
                hex = "#" + convert(color.getAlpha()) +
                        convert(color.getRed()) +
                        convert(color.getGreen()) +
                        convert(color.getBlue());
            }
            return hex;
        }
        else
            return null;
    }//*/


    /**
     * Converts a Java Date object into a properly formatted String for W or W1.
     * DDHHMMSSZMONYYYY
     * Field W: D = day, H = hour, M = minute, S = second, Z = Greenwich or local time, MON= month and Y = year.
     * @param date {@link Date}
     * @return string
     */
    public static getDateLabel(date: Date): string {
        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        let modifierString: string = "";
        modifierString += String(date.getDate()).padStart(2, '0')
        modifierString += String(date.getHours()).padStart(2, '0')
        modifierString += String(date.getMinutes()).padStart(2, '0')
        modifierString += String(date.getSeconds()).padStart(2, '0')
        modifierString += SymbolUtilities.getZuluCharFromTimeZoneOffset(date);
        modifierString += monthNamesShort[date.getUTCMonth()]
        modifierString += date.getUTCFullYear()

        return modifierString.toUpperCase();
    }

    /**
     * Given date, return character String representing which NATO time zone
     * you're in.
     *
     * @param time {@link Date}
     * @return string
     */
    private static getZuluCharFromTimeZoneOffset(time: Date): string {
        let tzDescription = time.getTimezoneOffset() / 60;
        if (tzDescription === -1) {
            return "A";
        } else if (tzDescription === -2) {
            return "B";
        } else if (tzDescription === -3) {
            return "C";
        } else if (tzDescription === -4) {
            return "D";
        } else if (tzDescription === -5) {
            return "E";
        } else if (tzDescription === -6) {
            return "F";
        } else if (tzDescription === -7) {
            return "G";
        } else if (tzDescription === -8) {
            return "H";
        } else if (tzDescription === -9) {
            return "I";
        } else if (tzDescription === -10) {
            return "K";
        } else if (tzDescription === -11) {
            return "L";
        } else if (tzDescription === -12) {
            return "M";
        } else if (tzDescription === 1 || tzDescription === -13) {
            return "N";
        } else if (tzDescription === 2) {
            return "O";
        } else if (tzDescription === 3) {
            return "P";
        } else if (tzDescription === 4) {
            return "Q";
        } else if (tzDescription === 5) {
            return "R";
        } else if (tzDescription === 6) {
            return "S";
        } else if (tzDescription === 7) {
            return "T";
        } else if (tzDescription === 8) {
            return "U";
        } else if (tzDescription === 9) {
            return "V";
        } else if (tzDescription === 10) {
            return "W";
        } else if (tzDescription === 11) {
            return "X";
        } else if (tzDescription === 12) {
            return "Y";
        } else if (tzDescription === 0) {
            return "Z";
        } else {
            return "-";
        }
    }

    /**
     * Determines if a symbol, based on it's symbol ID, can have the specified modifier/amplifier.
     * @param symbolID 30 Character string
     * @param modifier {@link Modifiers}
     * @return 
     */
    public static hasModifier(symbolID: string, modifier: string): boolean {
        let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);

        if (msi != null && msi.getDrawRule() !== DrawRules.DONOTDRAW) {
            let mods: Array<string> = msi.getModifiers();

            if (mods != null && mods.includes(modifier)) {

                return true;
            }

            else {
                if (msi.getSymbolSet() === SymbolID.SymbolSet_ControlMeasure && modifier === Modifiers.AB_FEINT_DUMMY_INDICATOR) {

                    return true;
                }

                else {

                    return false;
                }

            }

        }
        return false;
    }

    /**
     * Gets Basic Symbol ID which is the Symbol Set + Entity Code
     * @param id 30 Character string
     * @return 8 character string (Symbol Set + Entity Code)
     */
    public static getBasicSymbolID(id: string): string {
        if (id.length === 8) {
            return id;
        }
        else {
            if (id.startsWith("B")) {

                return id;
            }

            else {
                if (id === "octagon") {

                    return id;
                }

                else {
                    if (id.length >= 20 && id.length <= 30) {
                        let key: string = id.substring(4, 6) + id.substring(10, 16);
                        return key;
                    }
                    else {
                        if (id.length === 15) {
                            return SymbolUtilities.getBasicSymbolID2525C(id);
                        }
                    }

                }

            }

        }

        return id;
    }

    /**
     * Gets the basic Symbol ID for a 2525C symbol
     * S*F*GPU---*****
     * G*G*GPP---****X
     * @param strSymbolID 15 Character string
     * @return 15 Character string
     * @deprecated function will be removed
     */
    public static getBasicSymbolID2525C(strSymbolID: string): string {
        if (strSymbolID != null && strSymbolID.length === 15) {
            let res: string = "";
            let scheme: string = strSymbolID.charAt(0);
            if (scheme === 'G') {
                res += strSymbolID.charAt(0);
                res += "*";
                res += strSymbolID.charAt(2);
                res += "*";
                res += strSymbolID.substring(4, 10);
                res += "****X";
            } else if (scheme !== 'W' && scheme !== 'B' && scheme !== 'P') {
                res += strSymbolID.charAt(0);
                res += "*";
                res += strSymbolID.charAt(2);
                res += "*";
                res += strSymbolID.substring(4, 10);
                res += "*****";
            } else {
                return strSymbolID;
            }

            return res;
        }
        return strSymbolID;
    }

    /**
     * Attempts to resolve a bad symbol ID into a value that can be found in {@link MSLookup}.
     * If it fails, it will return the symbol code for a invalid symbol which is displayed as
     * an inverted question mark (110098000010000000000000000000)
     * @param symbolID 30 character string
     * @return 30 character string representing the resolved symbol ID.
     */
    public static reconcileSymbolID(symbolID: string): string {

        let newID: string = "";
        try {


            let v: int = SymbolID.getVersion(symbolID);
            if (v < SymbolID.Version_2525E) {

                newID = SymbolID.Version_2525Dch1.toString();
            }

            else {

                newID = SymbolID.Version_2525E.toString();
            }

            let c: int = SymbolID.getContext(symbolID);
            if (c > 2) {

                newID += SymbolID.StandardIdentity_Context_Reality.toString();
            }

            else {

                newID += c.toString();
            }

            let a: int = SymbolID.getAffiliation(symbolID);
            if (a > 6) {

                newID += SymbolID.StandardIdentity_Affiliation_Unknown.toString();
            }

            else {

                newID += a.toString();
            }

            let ss: int = SymbolID.getSymbolSet(symbolID);
            switch (ss) {
                case SymbolID.SymbolSet_Unknown:
                case SymbolID.SymbolSet_Air:
                case SymbolID.SymbolSet_AirMissile:
                case SymbolID.SymbolSet_SignalsIntelligence_Air:
                case SymbolID.SymbolSet_Space:
                case SymbolID.SymbolSet_SpaceMissile:
                case SymbolID.SymbolSet_SignalsIntelligence_Space:
                case SymbolID.SymbolSet_LandUnit:
                case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                case SymbolID.SymbolSet_LandEquipment:
                case SymbolID.SymbolSet_SignalsIntelligence_Land:
                case SymbolID.SymbolSet_LandInstallation:
                case SymbolID.SymbolSet_DismountedIndividuals:
                case SymbolID.SymbolSet_SeaSurface:
                case SymbolID.SymbolSet_SignalsIntelligence_SeaSurface:
                case SymbolID.SymbolSet_SeaSubsurface:
                case SymbolID.SymbolSet_MineWarfare:
                case SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface:
                case SymbolID.SymbolSet_Activities:
                case SymbolID.SymbolSet_ControlMeasure:
                case SymbolID.SymbolSet_Atmospheric:
                case SymbolID.SymbolSet_Oceanographic:
                case SymbolID.SymbolSet_MeteorologicalSpace:
                case SymbolID.SymbolSet_CyberSpace: {
                    newID += String(ss).padStart(2, '0');
                    break;
                }

                default: {
                    newID += String(SymbolID.SymbolSet_Unknown).padStart(2, '0');
                }
                //SymbolID.SymbolSet_Unknown.toString();
            }

            let s: int = SymbolID.getStatus(symbolID);
            if (s > SymbolID.Status_Present_FullToCapacity) {

                newID += SymbolID.Status_Present.toString();
            }

            else {

                newID += s.toString();
            }


            newID += SymbolID.getHQTFD(symbolID).toString();//just add, won't get used if value bad
            newID += String(SymbolID.getAmplifierDescriptor(symbolID)).padStart(2, '0');//just add, won't get used if value bad

            let ec: int = SymbolID.getEntityCode(symbolID);

            if (ec === 0) {

                newID += "000000";
            }
            //root symbol for symbol set
            else {
                if (SVGLookup.getInstance().getSVGLInfo(SVGLookup.getMainIconID(newID + ec + "0000"), v) == null) {
                    //set to invalid symbol since we couldn't find it in the lookup
                    newID = SymbolID.setSymbolSet(newID, 98);
                    newID += 100000;
                }
                else {
                    newID += String(ec).padStart(6, '0');
                }

            }
            //we found it so add the entity code

            //newID += SymbolID.getMod1ID(symbolID);//just add, won't get used if value bad
            //newID += SymbolID.getMod2ID(symbolID);//just add, won't get used if value bad
            newID += symbolID.substring(16);//just add, won't get used if value bad
        } catch (exc) {
            if (exc instanceof Error) {
                newID = "110098000010000000000000000000";//invalid symbol
            } else {
                throw exc;
            }
        }

        return newID;
    }

    /**
     * Gets line color used if no line color has been set. The color is specified based on the affiliation of
     * the symbol and whether it is a unit or not.
     * @param symbolID 30 character string
     * @return 
     */
    public static getLineColorOfAffiliation(symbolID: string): Color | null {
        let retColor: Color | null = null;

        let symbolSet: int = SymbolID.getSymbolSet(symbolID);
        let set: int = SymbolID.getSymbolSet(symbolID);
        let affiliation: int = SymbolID.getAffiliation(symbolID);
        let symStd: int = SymbolID.getVersion(symbolID);
        let entityCode: int = SymbolID.getEntityCode(symbolID);

        try {
            // We can't get the line color if there is no symbol id, since that also means there is no affiliation
            if ((symbolID == null) || (symbolID === "")) {
                return retColor;
            }

            if (symbolSet === SymbolID.SymbolSet_ControlMeasure) {
                let entity: int = SymbolID.getEntity(symbolID);
                let entityType: int = SymbolID.getEntityType(symbolID);
                let entitySubtype: int = SymbolID.getEntitySubtype(symbolID);


                if (SymbolUtilities.isGreenProtectionGraphic(entity, entityType, entitySubtype)) {
                    //Obstacles/Protection Graphics, some are green obstacles and we need to
                    //check for those.
                    retColor = new Color(0, 166, 81);//Color.GREEN;
                }
                //just do color by affiliation if no other color has been set yet.
                if (retColor == null) {
                    switch (affiliation) {
                        case SymbolID.StandardIdentity_Affiliation_Friend:
                        case SymbolID.StandardIdentity_Affiliation_AssumedFriend: {
                            retColor = AffiliationColors.FriendlyGraphicLineColor;//Color.BLACK;//0x000000;	// Black
                            break;
                        }

                        case SymbolID.StandardIdentity_Affiliation_Hostile_Faker: {
                            retColor = AffiliationColors.HostileGraphicLineColor;//Color.RED;//0xff0000;	// Red
                            break;
                        }

                        case SymbolID.StandardIdentity_Affiliation_Suspect_Joker: {
                            if (symStd >= SymbolID.Version_2525E) {

                                retColor = AffiliationColors.SuspectGraphicLineColor;
                            }
                            //255,188,1
                            else {

                                retColor = AffiliationColors.HostileGraphicLineColor;
                            }
                            //Color.RED;//0xff0000;	// Red
                            break;
                        }

                        case SymbolID.StandardIdentity_Affiliation_Neutral: {
                            retColor = AffiliationColors.NeutralGraphicLineColor;//Color.GREEN;//0x00ff00;	// Green
                            break;
                        }

                        default: {
                            retColor = AffiliationColors.UnknownGraphicLineColor;//Color.YELLOW;//0xffff00;	// Yellow
                            break;
                        }

                    }
                }
            }
            else {
                if (set >= 45 && set <= 47)//METOC
                {
                    // If not black then color will be set in clsMETOC.SetMeTOCProperties()
                    retColor = Color.BLACK;
                    ;
                }
                else {
                    if (set === SymbolID.SymbolSet_MineWarfare && (RendererSettings.getInstance().getSeaMineRenderMethod() === RendererSettings.SeaMineRenderMethod_MEDAL)) {
                        if (!(entityCode === 110600 || entityCode === 110700)) {
                            switch (affiliation) {
                                case SymbolID.StandardIdentity_Affiliation_Friend:
                                case SymbolID.StandardIdentity_Affiliation_AssumedFriend: {
                                    retColor = AffiliationColors.FriendlyUnitFillColor;//0x00ffff;	// Cyan
                                    break;
                                }

                                case SymbolID.StandardIdentity_Affiliation_Hostile_Faker: {
                                    retColor = AffiliationColors.HostileGraphicLineColor;//Color.RED;//0xff0000;	// Red
                                    break;
                                }

                                case SymbolID.StandardIdentity_Affiliation_Suspect_Joker: {
                                    if (symStd >= SymbolID.Version_2525E) {

                                        retColor = AffiliationColors.SuspectGraphicLineColor;
                                    }
                                    //255,188,1
                                    else {

                                        retColor = AffiliationColors.HostileGraphicLineColor;
                                    }
                                    //Color.RED;//0xff0000;	// Red
                                    break;
                                }

                                case SymbolID.StandardIdentity_Affiliation_Neutral: {
                                    retColor = AffiliationColors.NeutralUnitFillColor;//0x7fff00;	// Light Green
                                    break;
                                }

                                default: {//unknown, pending, everything else
                                    retColor = AffiliationColors.UnknownUnitFillColor;//new Color(255,250, 205); //0xfffacd;	// LemonChiffon 255 250 205
                                    break;
                                }

                            }
                        }
                        else {
                            retColor = Color.BLACK;
                        }
                    }
                    else//everything else
                    {
                        //stopped doing check because all warfighting
                        //should have black for line color.
                        retColor = Color.BLACK;
                    }
                }

            }

        } catch (e) {
            if (e instanceof Error) {
                // Log Error
                ErrorLogger.LogException("SymbolUtilities", "getLineColorOfAffiliation", e);
                //throw e;
            } else {
                throw e;
            }
        }    // End catch
        return retColor;
    }    // End get LineColorOfAffiliation

    /**
     * For Control Measures, returns the default color for a symbol when it differs from the
     * affiliation line color.  If there is no default color, returns the value from {@link getLineColorOfAffiliation()}
     * @param symbolID 30 Character string
     * @return 
     */
    public static getDefaultLineColor(symbolID: string): Color | null {
        try {
            if (symbolID == null || symbolID === "") {
                return null;
            }

            let symbolSet: int = SymbolID.getSymbolSet(symbolID);
            let entityCode: int = SymbolID.getEntityCode(symbolID);
            let version: int = SymbolID.getVersion(symbolID);

            if (symbolSet === SymbolID.SymbolSet_ControlMeasure) {
                if (entityCode === 200600) {
                    return Color.WHITE;
                } else {
                    if (entityCode === 200700) {
                        return new Color(51, 136, 136);
                    } else {
                        if (entityCode === 200101) {
                            return new Color(255, 155, 0);
                        } else {
                            if (entityCode === 200201 || entityCode === 200202) {
                                return new Color(85, 119, 136);
                            } else {
                                if (version >= SymbolID.Version_2525E &&
                                    (entityCode === 132100 || //key terrain
                                        entityCode === 282001 || //Tower, Low
                                        entityCode === 282002 || //Tower, High
                                        entityCode === 282003)) { // Overhead wire
                                    return new Color(128, 0, 128);//purple
                                }
                            }

                        }

                    }

                }

            }
        } catch (e) {
            if (e instanceof Error) {
                ErrorLogger.LogException("SymbolUtilities", "getDefaultLineColor", e);
            } else {
                throw e;
            }
        }
        return SymbolUtilities.getLineColorOfAffiliation(symbolID);
    }

    /**
     * Checks if a symbol should be filled by default
     * 
     * @param strSymbolID The 20 digit representation of the 2525D symbol
     * @return true if there is a default fill
     */
    public static hasDefaultFill(strSymbolID: string): boolean {
        let ec: int = SymbolID.getEntityCode(strSymbolID);
        switch (ec) {
            case 200101:
            case 200201:
            case 200202:
            case 200600:
            case 200700: {
                return true;
            }

            default: {
                return !SymbolUtilities.isTacticalGraphic(strSymbolID);
            }

        }
    }

    /**
     * Determines if the symbol is a tactical graphic
     *
     * @param strSymbolID 30 Character string
     * @return true if symbol set is 25 (control measure), or is a weather graphic
     */
    public static isTacticalGraphic(strSymbolID: string): boolean {
        try {
            let ss: int = SymbolID.getSymbolSet(strSymbolID);

            if (ss === SymbolID.SymbolSet_ControlMeasure || SymbolUtilities.isWeather(strSymbolID)) {
                return true;
            }
        } catch (e) {
            if (e instanceof Error) {
                ErrorLogger.LogException("SymbolUtilities", "getFillColorOfAffiliation", e);
            } else {
                throw e;
            }
        }
        return false;
    }

    /**
     * Determines if the Symbol can be rendered as a multipoint graphic and not just as an icon
     * @param symbolID 30 Character string
     * @return 
     */
    public static isMultiPoint(symbolID: string): boolean {
        let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);
        if (msi == null) {
            return false;
        }
        let drawRule: int = msi.getDrawRule();
        let ss: int = msi.getSymbolSet();
        if (ss !== SymbolID.SymbolSet_ControlMeasure && ss !== SymbolID.SymbolSet_Oceanographic && ss !== SymbolID.SymbolSet_Atmospheric && ss !== SymbolID.SymbolSet_MeteorologicalSpace) {
            return false;
        }
        else {
            if (ss === SymbolID.SymbolSet_ControlMeasure) {
                if (msi.getMaxPointCount() > 1) {

                    return true;
                }

                else {
                    if ((drawRule < DrawRules.POINT1 || drawRule > DrawRules.POINT16 || drawRule === DrawRules.POINT12) &&
                        drawRule !== DrawRules.DONOTDRAW && drawRule !== DrawRules.AREA22) {
                        return true;
                    }
                    else {

                        return false;
                    }

                }

            }
            else {
                if (ss === SymbolID.SymbolSet_Oceanographic || ss === SymbolID.SymbolSet_Atmospheric || ss === SymbolID.SymbolSet_MeteorologicalSpace) {
                    if (msi.getMaxPointCount() > 1) {

                        return true;
                    }

                    else {

                        return false;
                    }

                }
            }

        }

        return false;
    }

    public static isActionPoint(symbolID: string): boolean {
        let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);
        if (msi.getDrawRule() === DrawRules.POINT1) {
            let ec: int = SymbolID.getEntityCode(symbolID);
            if (ec !== 131300 && ec !== 131301 && ec !== 182600 && ec !== 212800) {

                return true;
            }

        }
        return false;
    }


    /**
     * Control Measures and Tactical Graphics that have labels but not with the Action Point layout
     * @param strSymbolID 30 Character string
     * @return 
     * @deprecated see {@link isSPWithSpecialModifierLayout(String)}
     */
    public static isTGSPWithSpecialModifierLayout(strSymbolID: string): boolean {
        try {
            let ss: int = SymbolID.getSymbolSet(strSymbolID);
            let entityCode: int = SymbolID.getEntityCode(strSymbolID);
            if (ss === SymbolID.SymbolSet_ControlMeasure) //|| isWeather(strSymbolID)) {
            {
                if (SymbolUtilities.isCBRNEvent(strSymbolID)) {

                    return true;
                }


                if (SymbolUtilities.isSonobuoy(strSymbolID)) {

                    return true;
                }


                switch (entityCode) {
                    case 130500: //contact point
                    case 130700: //decision point
                    case 212800: //harbor
                    case 131300: //point of interest
                    case 131800: //waypoint
                    case 240900: //fire support station
                    case 180100: //Air Control point
                    case 180200: //Communications Check point
                    case 160300: //T (target reference point)
                    case 240601: //ap,ap1,x,h (Point/Single Target)
                    case 240602: //ap (nuclear target)
                    case 270701: //static depiction
                    case 282001: //tower, low
                    case 282002: { //tower, high
                        return true;
                    }

                    default: {
                        return false;
                    }

                }
            }
            else {
                if (ss === SymbolID.SymbolSet_Atmospheric) {
                    switch (entityCode) {
                        case 162300: //Freezing Level
                        case 162200: //tropopause Level
                        case 110102: //tropopause Low
                        case 110202: { //tropopause High
                            return true;
                        }

                        default: {
                            return false;
                        }

                    }
                }
            }

        } catch (e) {
            if (e instanceof Error) {
                ErrorLogger.LogException("SymbolUtilities", "isTGSPWithSpecialModifierLayout", e);
            } else {
                throw e;
            }
        }
        return false;
    }

    /**
     * Returns the fill color for the symbol based on its affiliation
     * @param symbolID 30 Character string
     * @return 
     */
    public static getFillColorOfAffiliation(symbolID: string): Color | null {
        let retColor: Color | null = null;
        let entityCode: int = SymbolID.getEntityCode(symbolID);
        let entity: int = SymbolID.getEntity(symbolID);
        let entityType: int = SymbolID.getEntityType(symbolID);
        let entitySubtype: int = SymbolID.getEntitySubtype(symbolID);

        let affiliation: int = SymbolID.getAffiliation(symbolID);

        try {
            // We can't get the fill color if there is no symbol id, since that also means there is no affiliation
            if ((symbolID == null) || (symbolID === "")) {
                return null;
            }
            if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_ControlMeasure) {
                switch (entityCode) {
                    case 200101: {
                        retColor = new Color(255, 155, 0, (.25 * 255) as int);
                        break;
                    }

                    case 200201:
                    case 200202:
                    case 200600: {
                        retColor = new Color(85, 119, 136, (.25 * 255) as int);
                        break;
                    }

                    case 200700: {
                        retColor = new Color(51, 136, 136, (.25 * 255) as int);
                        break;
                    }


                    default:

                }
            }
            else {
                if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_MineWarfare &&
                    (RendererSettings.getInstance().getSeaMineRenderMethod() === RendererSettings.SeaMineRenderMethod_MEDAL) &&
                    (!(entityCode === 110600 || entityCode === 110700))) {
                    retColor = new Color(0, 0, 0, 0);//transparent
                }
            }

            //just do color by affiliation if no other color has been set yet
            if (retColor == null) {
                switch (affiliation) {
                    case SymbolID.StandardIdentity_Affiliation_Friend:
                    case SymbolID.StandardIdentity_Affiliation_AssumedFriend: {
                        retColor = AffiliationColors.FriendlyUnitFillColor;//0x00ffff;	// Cyan
                        break;
                    }

                    case SymbolID.StandardIdentity_Affiliation_Hostile_Faker: {
                        retColor = AffiliationColors.HostileUnitFillColor;//0xfa8072;	// Salmon
                        break;
                    }

                    case SymbolID.StandardIdentity_Affiliation_Suspect_Joker: {
                        if (SymbolID.getVersion(symbolID) >= SymbolID.Version_2525E) {

                            retColor = AffiliationColors.SuspectGraphicFillColor;
                        }
                        //255,229,153
                        else {

                            retColor = AffiliationColors.HostileGraphicFillColor;
                        }
                        //Color.RED;//0xff0000;	// Red
                        break;
                    }

                    case SymbolID.StandardIdentity_Affiliation_Neutral: {
                        retColor = AffiliationColors.NeutralUnitFillColor;//0x7fff00;	// Light Green
                        break;
                    }

                    default: {//unknown, pending, everything else
                        retColor = AffiliationColors.UnknownUnitFillColor;//new Color(255,250, 205); //0xfffacd;	// LemonChiffon 255 250 205
                        break;
                    }

                }
            }
        } catch (e) {
            if (e instanceof Error) {
                // Log Error
                ErrorLogger.LogException("SymbolUtilities", "getFillColorOfAffiliation", e);
                //throw e;
            } else {
                throw e;
            }
        }    // End catch

        return retColor;
    }    // End FillColorOfAffiliation

    /**
     *
     * @param symbolID 30 Character string
     * @param modifier {@link Modifiers}
     * @return 
     * @deprecated see {@link hasModifier()}
     */
    public static canSymbolHaveModifier(symbolID: string, modifier: string): boolean {
        return SymbolUtilities.hasModifier(symbolID, modifier);
    }

    /**
     * Checks if the Symbol Code has FDI set.
     * Does not check if the symbol can have an FDI.
     * @param symbolID 30 Character string
     * @return 
     */
    public static hasFDI(symbolID: string): boolean {
        let hqtfd: int = SymbolID.getHQTFD(symbolID);
        if (hqtfd === SymbolID.HQTFD_FeintDummy
            || hqtfd === SymbolID.HQTFD_FeintDummy_TaskForce
            || hqtfd === SymbolID.HQTFD_FeintDummy_Headquarters
            || hqtfd === SymbolID.HQTFD_FeintDummy_TaskForce_Headquarters) {
            return true;
        }
        else {

            return false;
        }

    }

    /**
     * Returns true if graphic is protection graphic (obstacles which render green)
     * @param symbolID 30 Character string
     * @return 
     */
    public static isGreenProtectionGraphic(symbolID: string): boolean;

    /***
     * Returns true if graphic is protection graphic (obstacles which render green)
     * Assumes control measure symbol code where SS == 25
     * @param entity 
     * @param entityType 
     * @param entitySubtype 
     * @return 
     */
    public static isGreenProtectionGraphic(entity: int, entityType: int, entitySubtype: int): boolean;
    public static isGreenProtectionGraphic(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                const [symbolID] = args as [string];


                if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_ControlMeasure) {
                    return SymbolUtilities.isGreenProtectionGraphic(SymbolID.getEntity(symbolID), SymbolID.getEntityType(symbolID), SymbolID.getEntitySubtype(symbolID));
                } else {
                    return false;
                }


                break;
            }

            case 3: {
                const [entity, entityType, entitySubtype] = args as [int, int, int];


                if (entity >= 27 && entity <= 29)//Protection Areas, Points and Lines
                {
                    if (entity === 27) {
                        if (entityType > 0 && entityType <= 5) {

                            return true;
                        }

                        else {
                            if (entityType === 7 || entityType === 8 || entityType === 10 || entityType === 12) {
                                return true;
                            }
                            else {

                                return false;
                            }

                        }

                    }
                    else {
                        if (entity === 28) {
                            if (entityType > 0 && entityType <= 7) {

                                return true;
                            }

                            if (entityType === 19) {

                                return true;
                            }

                            else {

                                return false;
                            }

                        }
                        else {
                            if (entity === 29) {
                                if (entityType >= 1 && entityType <= 5) {

                                    return true;
                                }

                                else {

                                    return false;
                                }

                            }
                        }

                    }

                }
                else {
                    return false;
                }
                return false;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Returns true if Symbol ID represents a chemical, biological, radiological or nuclear incident.
     * @param symbolID 30 Character string
     * @return 
     */
    public static isCBRNEvent(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let ec: int = SymbolID.getEntityCode(symbolID);

        if (ss === SymbolID.SymbolSet_ControlMeasure) {
            switch (ec) {
                case 281300:
                case 281400:
                case 281500:
                case 281600:
                case 281700: {
                    return true;
                }

                default:
            }
        }
        return false;
    }

    /**
     * Returns true if Symbol ID represents a Sonobuoy.
     * @param symbolID 30 Character string
     * @return 
     */
    public static isSonobuoy(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let e: int = SymbolID.getEntity(symbolID);
        let et: int = SymbolID.getEntityType(symbolID);
        if (ss === 25 && e === 21 && et === 35) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Obstacles are generally required to have a green line color
     * @param symbolID 30 Character string
     * @return 
     * @deprecated see {@link isGreenProtectionGraphic()}
     */
    public static isObstacle(symbolID: string): boolean {

        if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_ControlMeasure &&
            SymbolID.getEntity(symbolID) === 27) {
            return true;
        }
        else {

            return false;
        }

    }

    /**
     * Return true if symbol is from the Atmospheric, Oceanographic or Meteorological Space Symbol Sets.
     * @param symbolID 30 Character string
     * @return 
     */
    public static isWeather(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        if (ss >= SymbolID.SymbolSet_Atmospheric && ss <= SymbolID.SymbolSet_MeteorologicalSpace) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol has the HQ staff indicated by the symbol ID
     * @param symbolID 30 Character string
     * @return 
     */
    public static isHQ(symbolID: string): boolean {
        let hq: int = SymbolID.getHQTFD(symbolID);
        if (SymbolUtilities.hasModifier(symbolID, Modifiers.S_HQ_STAFF_INDICATOR) &&
            (hq === SymbolID.HQTFD_FeintDummy_Headquarters ||
                hq === SymbolID.HQTFD_Headquarters ||
                hq === SymbolID.HQTFD_FeintDummy_TaskForce_Headquarters ||
                hq === SymbolID.HQTFD_TaskForce_Headquarters)) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Checks if this is a single point control measure or meteorological graphic with a unique layout.
     * Basically anything that's not an action point style graphic with modifiers
     * @param symbolID 30 Character string
     * @return 
     */
    public static isSPWithSpecialModifierLayout(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let ec: int = SymbolID.getEntityCode(symbolID);

        if (ss === SymbolID.SymbolSet_ControlMeasure) {
            switch (ec) {
                case 130500: //Control Point
                case 130700: //Decision Point
                case 131300: //Point of Interest
                case 131800: //Waypoint
                case 131900: //Airfield (AEGIS Only)
                case 132000: //Target Handover
                case 132100: //Key Terrain
                case 160300: //Target Point Reference
                case 180100: //Air Control Point
                case 180200: //Communications Check Point
                case 180600: //TACAN
                case 210300: //Defended Asset
                case 210600: //Air Detonation
                case 210800: //Impact Point
                case 211000: //Launched Torpedo
                case 212800: //Harbor
                case 213500: //Sonobuoy
                case 213501: //Ambient Noise Sonobuoy
                case 213502: //Air Transportable Communication (ATAC) (Sonobuoy)
                case 213503: //Barra (Sonobuoy)
                case 213504:
                case 213505:
                case 213506:
                case 213507:
                case 213508:
                case 213509:
                case 213510:
                case 213511:
                case 213512:
                case 213513:
                case 213514:
                case 213515:
                case 214900: //General Sea Subsurface Station
                case 215600: //General Sea Station
                case 217000: //Shore Control Station
                case 240601: //Point or Single Target
                case 240602: //Nuclear Target
                case 240900: //Fire Support Station
                case 250600: //Known Point
                case 270701: //Static Depiction
                case 282001: //Tower, Low
                case 282002: //Tower, High
                case 281300: //Chemical Event
                case 281400: //Biological Event
                case 281500: //Nuclear Event
                case 281600: //Nuclear Fallout Producing Event
                case 281700: { //Radiological Event
                    return true;
                }

                default: {
                    return false;
                }

            }
        }
        else {
            if (ss === SymbolID.SymbolSet_Atmospheric) {
                switch (ec) {
                    case 162300: //Freezing Level
                    case 162200: //tropopause Level
                    case 110102: //tropopause low
                    case 110202: { //tropopause high
                        return true;
                    }

                    default: {
                        return false;
                    }

                }
            }
        }

        return false;
    }

    /**
     * Gets the anchor point for single point Control Measure as the anchor point isn't always they center of the symbol.
     * @param symbolID 30 Character string
     * @param bounds {@link Rectangle2D} representing the bound of the core symbol in the image.
     * @return  representing the point in the image that is the anchor point of the symbol.
     */
    public static getCMSymbolAnchorPoint(symbolID: string, bounds: Rectangle2D): Point {

        let centerX: double = bounds.getWidth() / 2;
        let centerY: double = bounds.getHeight() / 2;

        let ss: int = SymbolID.getSymbolSet(symbolID);
        let ec: int = SymbolID.getEntityCode(symbolID);
        let msi: MSInfo;
        let drawRule: int = 0;

        //center/anchor point is always half width and half height except for control measures
        //and meteorological
        if (ss === SymbolID.SymbolSet_ControlMeasure) {
            drawRule = MSLookup.getInstance().getMSLInfo(symbolID).getDrawRule();
            switch (drawRule)//here we check the 'Y' value for the anchor point
            {
                case DrawRules.POINT1://action points //bottom center
                case DrawRules.POINT5://entry point
                case DrawRules.POINT6://ground zero
                case DrawRules.POINT7: {//missile detection point
                    centerY = bounds.getHeight();
                    break;
                }

                case DrawRules.POINT4: {//drop point  //almost bottom and center
                    centerY = (bounds.getHeight() * 0.80);
                    break;
                }

                case DrawRules.POINT10: {//Sonobuoy  //center of circle which isn't center of symbol
                    centerY = (bounds.getHeight() * 0.75);
                    break;
                }

                case DrawRules.POINT13: {//booby trap  //almost bottom and center
                    centerY = (bounds.getHeight() * 0.74);
                    break;
                }

                case DrawRules.POINT15: {//Marine Life  //center left
                    centerX = 0;
                    break;
                }

                case DrawRules.POINT16: {//Tower  //circle at base of tower
                    centerY = (bounds.getHeight() * 0.87);
                    break;
                }

                case DrawRules.POINT2: {//Several different symbols
                    if (ec === 280500) {
                        //Wide Area Antitank Mine
                        centerY = (bounds.getHeight() * 0.35);
                    } else if (ec === 280400) {
                        //Antitank Mine w/ Anti-handling Device
                        centerY = (bounds.getHeight() * 0.33);
                    } else if (ec === 280200) {
                        //Antipersonnel Mine
                        centerY = (bounds.getHeight() * 0.7);
                    } else if (ec === 280201) {
                        //Antipersonnel Mine with Directional Effects
                        centerY = (bounds.getHeight() * 0.65);
                    } else if (ec === 219000) {
                        //Sea Anomaly
                        centerY = (bounds.getHeight() * 0.7);
                    } else if (ec === 212500) {
                        //Electromagnetic - Magnetic Anomaly Detections (MAD)
                        centerY = (bounds.getHeight() * 0.4);
                    }
                    break;
                }

                default:
            }

            switch (ec)
            //have to adjust center X as some graphics have integrated text outside the symbol
            {
                case 180400: { //Pickup Point (PUP)
                    centerX = bounds.getWidth() * 0.3341;
                    break;
                }

                case 240900: { //Fire Support Station
                    centerX = bounds.getWidth() * 0.38;
                    break;
                }

                case 280201: { //Antipersonnel Mine with Directional Effects
                    centerX = bounds.getWidth() * 0.43;
                    break;
                }
            }
        }

        return new Point(Math.round(centerX), Math.round(centerY));
    }


    /**
     * Returns true if the symbol is an installation
     * @param symbolID 30 Character string
     * @return 
     */

    public static isInstallation(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let entity: int = SymbolID.getEntity(symbolID);
        if (ss === SymbolID.SymbolSet_LandInstallation && entity === 11) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol is from an air based symbol set
     * @param symbolID 30 Character string
     * @return 
     */
    public static isAir(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let entity: int = SymbolID.getEntity(symbolID);
        if (ss === SymbolID.SymbolSet_Air ||
            ss === SymbolID.SymbolSet_AirMissile ||
            ss === SymbolID.SymbolSet_SignalsIntelligence_Air) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol is from a space based symbol set
     * @param symbolID 30 Character string
     * @return 
     */
    public static isSpace(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let entity: int = SymbolID.getEntity(symbolID);
        if (ss === SymbolID.SymbolSet_Space ||
            ss === SymbolID.SymbolSet_SpaceMissile ||
            ss === SymbolID.SymbolSet_SignalsIntelligence_Space) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol is from a land based symbol set
     * @param symbolID 30 Character string
     * @return 
     */
    public static isLand(symbolID: string): boolean {
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let entity: int = SymbolID.getEntity(symbolID);
        if (ss === SymbolID.SymbolSet_LandUnit ||
            ss === SymbolID.SymbolSet_LandCivilianUnit_Organization ||
            ss === SymbolID.SymbolSet_LandEquipment ||
            ss === SymbolID.SymbolSet_LandInstallation ||
            ss === SymbolID.SymbolSet_SignalsIntelligence_Land) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol ID has the task for indicator
     * @param symbolID 30 Character string
     * @return 
     */
    public static isTaskForce(symbolID: string): boolean {
        let hqtfd: int = SymbolID.getHQTFD(symbolID);
        if ((hqtfd === SymbolID.HQTFD_TaskForce ||
            hqtfd === SymbolID.HQTFD_TaskForce_Headquarters ||
            hqtfd === SymbolID.HQTFD_FeintDummy_TaskForce ||
            hqtfd === SymbolID.HQTFD_FeintDummy_TaskForce_Headquarters) &&
            SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.B_ECHELON)) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol ID indicates the context is Reality
     * @param symbolID 30 Character string
     * @return 
     */
    public static isReality(symbolID: string): boolean {
        let c: int = SymbolID.getContext(symbolID);
        if (c === SymbolID.StandardIdentity_Context_Reality ||
            c === 3 || c === 4) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol ID indicates the context is Exercise
     * @param symbolID 30 Character string
     * @return 
     */
    public static isExercise(symbolID: string): boolean {
        let c: int = SymbolID.getContext(symbolID);
        if (c === SymbolID.StandardIdentity_Context_Exercise ||
            c === 5 || c === 6) {

            return true;
        }

        else {

            return false;
        }

    }

    /**
     * Returns true if the symbol ID indicates the context is Simulation
     * @param symbolID 30 Character string
     * @return 
     */
    public static isSimulation(symbolID: string): boolean {
        let c: int = SymbolID.getContext(symbolID);
        if (c === SymbolID.StandardIdentity_Context_Simulation ||
            c === 7 || c === 8) {

            return true;
        }

        else {

            return false;
        }

    }



    /**
     * Reads the Symbol ID string and returns the text that represents the echelon
     * code.
     * @param echelon  from positions 9-10 in the symbol ID
     * See {@link SymbolID.getAmplifierDescriptor()}
     * @return string (23 (Army) would be "XXXX")
     */
    public static getEchelonText(echelon: int): string {
        let text: string;
        if (echelon === SymbolID.Echelon_Team_Crew) {
            text = '\u{00D8}';
        } else if (echelon === SymbolID.Echelon_Squad) {
            text = '\u{2022}';
        } else if (echelon === SymbolID.Echelon_Section) {
            text = '\u{2022}\u{2022}';
        } else if (echelon === SymbolID.Echelon_Platoon_Detachment) {
            text = '\u{2022}\u{2022}\u{2022}';
        } else if (echelon === SymbolID.Echelon_Company_Battery_Troop) {
            text = "I";
        } else if (echelon === SymbolID.Echelon_Battalion_Squadron) {
            text = "II";
        } else if (echelon === SymbolID.Echelon_Regiment_Group) {
            text = "III";
        } else if (echelon === SymbolID.Echelon_Brigade) {
            text = "X";
        } else if (echelon === SymbolID.Echelon_Division) {
            text = "XX";
        } else if (echelon === SymbolID.Echelon_Corps_MEF) {
            text = "XXX";
        } else if (echelon === SymbolID.Echelon_Army) {
            text = "XXXX";
        } else if (echelon === SymbolID.Echelon_ArmyGroup_Front) {
            text = "XXXXX";
        } else if (echelon === SymbolID.Echelon_Region_Theater) {
            text = "XXXXXX";
        } else if (echelon === SymbolID.Echelon_Region_Command) {
            text = "++";
        }
        return text;
    }

    /**
     * Returns the Standard Identity Modifier based on the Symbol ID
     * @param symbolID 30 Character string
     * @return string
     */
    public static getStandardIdentityModifier(symbolID: string): string {
        let textChar: string;
        let si: int = SymbolID.getStandardIdentity(symbolID);
        let context: int = SymbolID.getContext(symbolID);
        let affiliation: int = SymbolID.getAffiliation(symbolID);

        if (context === SymbolID.StandardIdentity_Context_Simulation) {
            //Simulation
            textChar = "S";
        }

        else {
            if (context === SymbolID.StandardIdentity_Context_Exercise) {
                if (affiliation === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {
                    //exercise Joker
                    textChar = "J";
                } else if (affiliation === SymbolID.StandardIdentity_Affiliation_Hostile_Faker) {
                    //exercise faker
                    textChar = "K";
                } else if (context === SymbolID.StandardIdentity_Context_Exercise) {
                    //exercise
                    textChar = "X";
                }
            }
        }


        return textChar;
    }

    /**
     * Returns true if the unit has a rectangle frame
     * @param symbolID 30 Character string
     * @return 
     */
    public static hasRectangleFrame(symbolID: string): boolean {
        let affiliation: int = SymbolID.getAffiliation(symbolID);
        let ss: int = SymbolID.getSymbolSet(symbolID);
        if (ss !== SymbolID.SymbolSet_ControlMeasure) {
            if (affiliation === SymbolID.StandardIdentity_Affiliation_Friend
                || affiliation === SymbolID.StandardIdentity_Affiliation_AssumedFriend
                || (SymbolID.getContext(symbolID) === SymbolID.StandardIdentity_Context_Exercise &&
                    (affiliation === SymbolID.StandardIdentity_Affiliation_Hostile_Faker
                        || affiliation === SymbolID.StandardIdentity_Affiliation_Suspect_Joker))) {
                return true;
            }
            else {

                return false;
            }

        }
        else {

            return false;
        }

    }

    /**
     * Returns the height ratio for the unit specified by the symbol ID
     * Based on Figure 4 in 2525E.
     * @param symbolID 30 Character string
     * @return 
     */
    public static getUnitRatioHeight(symbolID: string): double {
        let ver: int = SymbolID.getVersion(symbolID);
        let aff: int = SymbolID.getAffiliation(symbolID);

        let rh: double = 0;

        if (ver < SymbolID.Version_2525E) {
            let ss: int = SymbolID.getSymbolSet(symbolID);

            if (aff === SymbolID.StandardIdentity_Affiliation_Hostile_Faker ||
                aff === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {
                switch (ss) {
                    case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                    case SymbolID.SymbolSet_LandUnit:
                    case SymbolID.SymbolSet_LandInstallation:
                    case SymbolID.SymbolSet_LandEquipment:
                    case SymbolID.SymbolSet_SignalsIntelligence_Land:
                    case SymbolID.SymbolSet_Activities:
                    case SymbolID.SymbolSet_CyberSpace: {
                        rh = 1.44;
                        break;
                    }

                    default: {
                        rh = 1.3;
                    }

                }
            }
            else {
                if (aff === SymbolID.StandardIdentity_Affiliation_Friend ||
                    aff === SymbolID.StandardIdentity_Affiliation_AssumedFriend) {
                    switch (ss) {
                        case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                        case SymbolID.SymbolSet_LandUnit:
                        case SymbolID.SymbolSet_LandInstallation:
                        case SymbolID.SymbolSet_SignalsIntelligence_Land:
                        case SymbolID.SymbolSet_Activities:
                        case SymbolID.SymbolSet_CyberSpace: {
                            rh = 1;
                            break;
                        }

                        default: {
                            rh = 1.2;
                        }

                    }
                }
                else {
                    if (aff === SymbolID.StandardIdentity_Affiliation_Neutral) {
                        switch (ss) {
                            case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                            case SymbolID.SymbolSet_LandUnit:
                            case SymbolID.SymbolSet_LandInstallation:
                            case SymbolID.SymbolSet_LandEquipment:
                            case SymbolID.SymbolSet_SignalsIntelligence_Land:
                            case SymbolID.SymbolSet_Activities:
                            case SymbolID.SymbolSet_CyberSpace: {
                                rh = 1.1;
                                break;
                            }

                            default: {
                                rh = 1.2;
                            }

                        }
                    }
                    else //UNKNOWN
                    {
                        switch (ss) {
                            case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                            case SymbolID.SymbolSet_LandUnit:
                            case SymbolID.SymbolSet_LandInstallation:
                            case SymbolID.SymbolSet_LandEquipment:
                            case SymbolID.SymbolSet_SignalsIntelligence_Land:
                            case SymbolID.SymbolSet_Activities:
                            case SymbolID.SymbolSet_CyberSpace: {
                                rh = 1.44;
                                break;
                            }

                            default: {
                                rh = 1.3;
                            }

                        }
                    }
                }

            }

        }
        else //2525E and up
        {
            let frameID: string = SVGLookup.getFrameID(symbolID);
            if (frameID.length === 6) {

                aff = parseInt(frameID.substring(2, 3));
            }

            else {
                //"octagon"
                return 1;
            }

            let fs: string = (frameID.charAt(3));

            if (aff === SymbolID.StandardIdentity_Affiliation_Hostile_Faker ||
                aff === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {
                switch (fs) {
                    case SymbolID.FrameShape_LandUnit:
                    case SymbolID.FrameShape_LandInstallation:
                    case SymbolID.FrameShape_LandEquipment_SeaSurface:
                    case SymbolID.FrameShape_Activity_Event:
                    case SymbolID.FrameShape_Cyberspace: {
                        rh = 1.44;
                        break;
                    }

                    default: {
                        rh = 1.3;
                    }

                }
            }
            else {
                if (aff === SymbolID.StandardIdentity_Affiliation_Friend ||
                    aff === SymbolID.StandardIdentity_Affiliation_AssumedFriend) {
                    switch (fs) {
                        case SymbolID.FrameShape_LandUnit:
                        case SymbolID.FrameShape_LandInstallation:
                        case SymbolID.FrameShape_Activity_Event:
                        case SymbolID.FrameShape_Cyberspace: {
                            rh = 1;
                            break;
                        }

                        default: {
                            rh = 1.2;
                        }

                    }
                }
                else {
                    if (aff === SymbolID.StandardIdentity_Affiliation_Neutral) {
                        switch (fs) {
                            case SymbolID.FrameShape_LandUnit:
                            case SymbolID.FrameShape_LandInstallation:
                            case SymbolID.FrameShape_LandEquipment_SeaSurface:
                            case SymbolID.FrameShape_Activity_Event:
                            case SymbolID.FrameShape_Cyberspace: {
                                rh = 1.1;
                                break;
                            }

                            default: {
                                rh = 1.2;
                            }

                        }
                    }
                    else //UNKNOWN
                    {
                        switch (fs) {
                            case SymbolID.FrameShape_LandUnit:
                            case SymbolID.FrameShape_LandInstallation:
                            case SymbolID.FrameShape_LandEquipment_SeaSurface:
                            case SymbolID.FrameShape_Activity_Event:
                            case SymbolID.FrameShape_Cyberspace: {
                                rh = 1.44;
                                break;
                            }

                            default: {
                                rh = 1.3;
                            }

                        }
                    }
                }

            }



        }

        return rh;
    }

    /**
     * Returns the width ratio for the unit specified by the symbol ID
     * Based on Figure 4 in 2525E.
     * @param symbolID 30 Character string
     * @return 
     */
    public static getUnitRatioWidth(symbolID: string): double {
        let ver: int = SymbolID.getVersion(symbolID);
        let aff: int = SymbolID.getAffiliation(symbolID);

        let rw: double = 0;

        if (ver < SymbolID.Version_2525E) {
            let ss: int = SymbolID.getSymbolSet(symbolID);

            if (aff === SymbolID.StandardIdentity_Affiliation_Hostile_Faker ||
                aff === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {
                switch (ss) {
                    case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                    case SymbolID.SymbolSet_LandUnit:
                    case SymbolID.SymbolSet_LandInstallation:
                    case SymbolID.SymbolSet_LandEquipment:
                    case SymbolID.SymbolSet_SignalsIntelligence_Land:
                    case SymbolID.SymbolSet_Activities:
                    case SymbolID.SymbolSet_CyberSpace: {
                        rw = 1.44;
                        break;
                    }

                    default: {
                        rw = 1.1;
                    }

                }
            }
            else {
                if (aff === SymbolID.StandardIdentity_Affiliation_Friend ||
                    aff === SymbolID.StandardIdentity_Affiliation_AssumedFriend) {
                    switch (ss) {
                        case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                        case SymbolID.SymbolSet_LandUnit:
                        case SymbolID.SymbolSet_LandInstallation:
                        case SymbolID.SymbolSet_SignalsIntelligence_Land:
                        case SymbolID.SymbolSet_Activities:
                        case SymbolID.SymbolSet_CyberSpace: {
                            rw = 1.5;
                            break;
                        }

                        case SymbolID.SymbolSet_LandEquipment: {
                            rw = 1.2;
                            break;
                        }

                        default: {
                            rw = 1.1;
                        }

                    }
                }
                else {
                    if (aff === SymbolID.StandardIdentity_Affiliation_Neutral) {
                        rw = 1.1;
                    }
                    else //UNKNOWN
                    {
                        switch (ss) {
                            case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                            case SymbolID.SymbolSet_LandUnit:
                            case SymbolID.SymbolSet_LandInstallation:
                            case SymbolID.SymbolSet_LandEquipment:
                            case SymbolID.SymbolSet_SignalsIntelligence_Land:
                            case SymbolID.SymbolSet_Activities:
                            case SymbolID.SymbolSet_CyberSpace: {
                                rw = 1.44;
                                break;
                            }

                            default: {
                                rw = 1.5;
                            }

                        }
                    }
                }

            }

        }
        else //2525E and above
        {
            let frameID: string = SVGLookup.getFrameID(symbolID);
            if (frameID.length === 6) {

                aff = parseInt(frameID.substring(2, 3));
            }

            else {
                //"octagon"
                return 1;
            }

            let fs: string = (frameID.charAt(3));

            if (aff === SymbolID.StandardIdentity_Affiliation_Hostile_Faker ||
                aff === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {
                switch (fs) {
                    case SymbolID.FrameShape_LandUnit:
                    case SymbolID.FrameShape_LandInstallation:
                    case SymbolID.FrameShape_LandEquipment_SeaSurface:
                    case SymbolID.FrameShape_Activity_Event:
                    case SymbolID.FrameShape_Cyberspace: {
                        rw = 1.44;
                        break;
                    }

                    default: {
                        rw = 1.1;
                    }

                }
            }
            else {
                if (aff === SymbolID.StandardIdentity_Affiliation_Friend ||
                    aff === SymbolID.StandardIdentity_Affiliation_AssumedFriend) {
                    switch (fs) {
                        case SymbolID.FrameShape_LandUnit:
                        case SymbolID.FrameShape_LandInstallation:
                        case SymbolID.FrameShape_Activity_Event:
                        case SymbolID.FrameShape_Cyberspace: {
                            rw = 1.5;
                            break;
                        }

                        case SymbolID.FrameShape_LandEquipment_SeaSurface: {
                            rw = 1.2;
                            break;
                        }

                        default: {
                            rw = 1.1;
                        }

                    }
                }
                else {
                    if (aff === SymbolID.StandardIdentity_Affiliation_Neutral) {
                        rw = 1.1;
                    }
                    else //UNKNOWN
                    {
                        switch (fs) {
                            case SymbolID.FrameShape_LandUnit:
                            case SymbolID.FrameShape_LandInstallation:
                            case SymbolID.FrameShape_LandEquipment_SeaSurface:
                            case SymbolID.FrameShape_Activity_Event:
                            case SymbolID.FrameShape_Cyberspace: {
                                rw = 1.44;
                                break;
                            }

                            default: {
                                rw = 1.5;
                            }

                        }
                    }
                }

            }

        }

        return rw;
    }

}

