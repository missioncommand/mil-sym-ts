
import { MSLookup } from "../../renderer/utilities/MSLookup"
import { SVGLookup } from "../../renderer/utilities/SVGLookup"
import { SymbolUtilities } from "./SymbolUtilities";

/**
 * Utility class for helping to parse out parts of the symbol ID.
 *
 */
export class SymbolID {
    /*
        //Version, 1-2
    
        //Standard Identity, First Digit (3)
        public static final char StandardIdentity_Context_Reality = '0';
        public static final char StandardIdentity_Context_Exercise = '1';
        public static final char StandardIdentity_Context_Simulation = '2';
    
        //Standard Identity, Second Digit (4)
        public static final char StandardIdentity_Affiliation_Pending = '0';
        public static final char StandardIdentity_Affiliation_Unknown = '1';
        public static final char StandardIdentity_Affiliation_AssumedFriend = '2';
        public static final char StandardIdentity_Affiliation_Friend = '3';
        public static final char StandardIdentity_Affiliation_Neutral = '4';
        public static final char StandardIdentity_Affiliation_Suspect_Joker = '5';
        public static final char StandardIdentity_Affiliation_Hostile_Faker = '6';
    
        //Symbol Set, 2 Digits (5-6)
        public static final String SymbolSet_Unknown = "00";
        public static final String SymbolSet_Air = "01";
        public static final String SymbolSet_AirMissile = "02";
        public static final String SymbolSet_Space = "05";
        public static final String SymbolSet_SpaceMissile = "06";
        public static final String SymbolSet_LandUnit = "10";
        public static final String SymbolSet_LandCivilianUnit_Organization = "11";
        public static final String SymbolSet_LandEquipment = "15";
        public static final String SymbolSet_LandInstallation = "20";
        public static final String SymbolSet_ControlMeasure = "25";
        public static final String SymbolSet_SeaSurface = "30";
        public static final String SymbolSet_SeaSubsurface = "35";
        public static final String SymbolSet_MineWarfare = "36";
        public static final String SymbolSet_Activities = "40";
        public static final String SymbolSet_Atmospheric = "45";
        public static final String SymbolSet_Oceanographic = "46";
        public static final String SymbolSet_MeteorologicalSpace = "47";
        public static final String SymbolSet_SignalsIntelligence_Space = "50";
        public static final String SymbolSet_SignalsIntelligence_Air = "51";
        public static final String SymbolSet_SignalsIntelligence_Land = "52";
        public static final String SymbolSet_SignalsIntelligence_Surface = "53";
        public static final String SymbolSet_SignalsIntelligence_Subsurface = "54";
        public static final String SymbolSet_CyberSpace = "60";
        public static final String SymbolSet_VersionExtensionFlag = "99";
    
        //Status, 1 Digit
        public static final char Status_Present = '0';
        public static final char Status_Planned_Anticipated_Suspect = '1';
        public static final char Status_Present_FullyCapable = '2';
        public static final char Status_Present_Damaged = '3';
        public static final char Status_Present_Destroyed = '4';
        public static final char Status_Present_FullToCapacity = '5';
        public static final char Status_Present_VersionExtensionFlag = '9';
    
        //Headquarters/Task Force/Dummy
        public static final char HQTFD_Unknown = '0';
        public static final char HQTFD_FeintDummy = '1';
        public static final char HQTFD_Headquarters = '2';
        public static final char HQTFD_FeintDummy_Headquarters = '3';
        public static final char HQTFD_TaskForce = '4';
        public static final char HQTFD_FeintDummy_TaskForce = '5';
        public static final char HQTFD_TaskForce_Headquarters = '6';
        public static final char HQTFD_FeintDummy_TaskForce_Headquarters = '7';
        public static final char HQTFD_VersionExtensionFlag = '9';
    
        //Echelon/Mobility/Towed Array Amplifier
        public static final String Echelon_Unknown = "00";
        public static final String Echelon_Team_Crew = "11";
        public static final String Echelon_Squad = "12";
        public static final String Echelon_Section = "13";
        public static final String Echelon_Platoon_Detachment = "14";
        public static final String Echelon_Company_Battery_Troop = "15";
        public static final String Echelon_Battalion_Squadron = "16";
        public static final String Echelon_Regiment_Group = "17";
        public static final String Echelon_Brigade = "18";
        public static final String Echelon_VersionExtensionFlag = "19";
        public static final String Echelon_Division = "21";
        public static final String Echelon_Corps_MEF = "22";
        public static final String Echelon_Army = "23";
        public static final String Echelon_ArmyGroup_Front = "24";
        public static final String Echelon_Region_Theater = "25";
        public static final String Echelon_Region_Command = "26";
        public static final String Echelon_VersionExtensionFlag2 = "29";
    
        public static final String Mobility_Unknown = "00";
        //equipment mobility on land
        public static final String Mobility_WheeledLimitedCrossCountry = "31";
        public static final String Mobility_WheeledCrossCountry = "32";
        public static final String Mobility_Tracked = "33";
        public static final String Mobility_Wheeled_Tracked = "34";
        public static final String Mobility_Towed = "35";
        public static final String Mobility_Rail = "36";
        public static final String Mobility_PackAnimals = "37";
        //equipment mobility on snow
        public static final String Mobility_OverSnow = "41";
        public static final String Mobility_Sled = "42";
        //equipment mobility on water
        public static final String Mobility_Barge = "51";
        public static final String Mobility_Amphibious = "52";
        //naval towed array
        public static final String Mobility_ShortTowedArray = "61";
        public static final String Mobility_LongTowedArray = "62";//*/


    //Version, 1-2 (Can't start with zero, will be 10 at a minimum)
    public static readonly Version_2525D: number = 10;
    public static readonly Version_2525Dch1: number = 11;
    /**
     * @deprecated withdrawn from standard
     */
    public static readonly Version_APP6Dch2: number = 12;
    public static readonly Version_2525E: number = 13;

    //Standard Identity, First Digit (3)
    public static readonly StandardIdentity_Context_Reality: number = 0;
    public static readonly StandardIdentity_Context_Exercise: number = 1;
    public static readonly StandardIdentity_Context_Simulation: number = 2;

    //Standard Identity, Second Digit (4)
    public static readonly StandardIdentity_Affiliation_Pending: number = 0;
    public static readonly StandardIdentity_Affiliation_Unknown: number = 1;
    public static readonly StandardIdentity_Affiliation_AssumedFriend: number = 2;
    public static readonly StandardIdentity_Affiliation_Friend: number = 3;
    public static readonly StandardIdentity_Affiliation_Neutral: number = 4;
    public static readonly StandardIdentity_Affiliation_Suspect_Joker: number = 5;
    public static readonly StandardIdentity_Affiliation_Hostile_Faker: number = 6;

    //Symbol Set, 2 Digits (5-6)
    public static readonly SymbolSet_Unknown: number = 0;
    public static readonly SymbolSet_Air: number = 1;
    public static readonly SymbolSet_AirMissile: number = 2;
    public static readonly SymbolSet_Space: number = 5;
    public static readonly SymbolSet_SpaceMissile: number = 6;
    public static readonly SymbolSet_LandUnit: number = 10;
    public static readonly SymbolSet_LandCivilianUnit_Organization: number = 11;
    public static readonly SymbolSet_LandEquipment: number = 15;
    public static readonly SymbolSet_LandInstallation: number = 20;
    public static readonly SymbolSet_ControlMeasure: number = 25;
    public static readonly SymbolSet_DismountedIndividuals: number = 27;
    public static readonly SymbolSet_SeaSurface: number = 30;
    public static readonly SymbolSet_SeaSubsurface: number = 35;
    public static readonly SymbolSet_MineWarfare: number = 36;
    public static readonly SymbolSet_Activities: number = 40;
    public static readonly SymbolSet_Atmospheric: number = 45;
    public static readonly SymbolSet_Oceanographic: number = 46;
    public static readonly SymbolSet_MeteorologicalSpace: number = 47;
    public static readonly SymbolSet_SignalsIntelligence: number = 50;
    public static readonly SymbolSet_SignalsIntelligence_Space: number = 50;
    public static readonly SymbolSet_SignalsIntelligence_Air: number = 51;
    public static readonly SymbolSet_SignalsIntelligence_Land: number = 52;
    public static readonly SymbolSet_SignalsIntelligence_SeaSurface: number = 53;
    public static readonly SymbolSet_SignalsIntelligence_SeaSubsurface: number = 54;
    public static readonly SymbolSet_CyberSpace: number = 60;

    public static readonly SymbolSet_InvalidSymbol: number = 98;
    public static readonly SymbolSet_VersionExtensionFlag: number = 99;

    //Status, 1 Digit
    public static readonly Status_Present: number = 0;
    public static readonly Status_Planned_Anticipated_Suspect: number = 1;
    public static readonly Status_Present_FullyCapable: number = 2;
    public static readonly Status_Present_Damaged: number = 3;
    public static readonly Status_Present_Destroyed: number = 4;
    public static readonly Status_Present_FullToCapacity: number = 5;
    public static readonly Status_Present_VersionExtensionFlag: number = 9;

    //Headquarters/Task Force/Dummy
    public static readonly HQTFD_Unknown: number = 0;
    public static readonly HQTFD_FeintDummy: number = 1;
    public static readonly HQTFD_Headquarters: number = 2;
    public static readonly HQTFD_FeintDummy_Headquarters: number = 3;
    public static readonly HQTFD_TaskForce: number = 4;
    public static readonly HQTFD_FeintDummy_TaskForce: number = 5;
    public static readonly HQTFD_TaskForce_Headquarters: number = 6;
    public static readonly HQTFD_FeintDummy_TaskForce_Headquarters: number = 7;
    public static readonly HQTFD_VersionExtensionFlag: number = 9;

    //Echelon/Mobility/Towed Array Amplifier
    public static readonly Echelon_Unknown: number = 0;
    public static readonly Echelon_Team_Crew: number = 11;
    public static readonly Echelon_Squad: number = 12;
    public static readonly Echelon_Section: number = 13;
    public static readonly Echelon_Platoon_Detachment: number = 14;
    public static readonly Echelon_Company_Battery_Troop: number = 15;
    public static readonly Echelon_Battalion_Squadron: number = 16;
    public static readonly Echelon_Regiment_Group: number = 17;
    public static readonly Echelon_Brigade: number = 18;
    public static readonly Echelon_VersionExtensionFlag: number = 19;
    public static readonly Echelon_Division: number = 21;
    public static readonly Echelon_Corps_MEF: number = 22;
    public static readonly Echelon_Army: number = 23;
    public static readonly Echelon_ArmyGroup_Front: number = 24;
    public static readonly Echelon_Region_Theater: number = 25;
    public static readonly Echelon_Region_Command: number = 26;
    public static readonly Echelon_VersionExtensionFlag2: number = 29;

    public static readonly Mobility_Unknown: number = 0;
    //equipment mobility on land
    public static readonly Mobility_WheeledLimitedCrossCountry: number = 31;
    public static readonly Mobility_WheeledCrossCountry: number = 32;
    public static readonly Mobility_Tracked: number = 33;
    public static readonly Mobility_Wheeled_Tracked: number = 34;
    public static readonly Mobility_Towed: number = 35;
    public static readonly Mobility_Rail: number = 36;
    public static readonly Mobility_PackAnimals: number = 37;
    //equipment mobility on snow
    public static readonly Mobility_OverSnow: number = 41;
    public static readonly Mobility_Sled: number = 42;
    //equipment mobility on water
    public static readonly Mobility_Barge: number = 51;
    public static readonly Mobility_Amphibious: number = 52;
    //naval towed array
    public static readonly Mobility_ShortTowedArray: number = 61;
    public static readonly Mobility_LongTowedArray: number = 62;

    public static readonly Leadership_Individual: number = 71;

    //Frame Shape, 1 digit, position 23
    public static readonly FrameShape_Unknown: string = '0';
    public static readonly FrameShape_Space: string = '1';
    public static readonly FrameShape_Air: string = '2';
    public static readonly FrameShape_LandUnit: string = '3';
    public static readonly FrameShape_LandEquipment_SeaSurface: string = '4';
    public static readonly FrameShape_LandInstallation: string = '5';
    public static readonly FrameShape_DismountedIndividuals: string = '6';
    public static readonly FrameShape_SeaSubsurface: string = '7';
    public static readonly FrameShape_Activity_Event: string = '8';
    public static readonly FrameShape_Cyberspace: string = '9';


    /**
     * Attempts to resolve a bad symbol ID into a value that can be found in {@link MSLookup}.
     * If it fails, it will return the symbol code for a invalid symbol which is displayed as
     * an inverted question mark (110098000010000000000000000000)
     * @param symbolID 30 character string
     * @return 30 character string representing the resolved symbol ID.
     * @deprecated See {@link SymbolUtilities.reconcileSymbolID()}
     */
    public static reconcileSymbolID(symbolID: string): string {
        return SymbolUtilities.reconcileSymbolID(symbolID);
    }

    /**
     * Gets the version number from the Symbol ID at positions 1-2
     * @param symbolID 30 character string
     * @return number like {@link SymbolID.Version_2525Dch1} (11)
     */
    public static getVersion(symbolID: string): number {
        let v: number = 11;
        if (symbolID != null && symbolID.length >= 20) {
            v = parseInt(symbolID.substring(0, 2));

        }
        return v;
    }

    /**
     * Sets the version number of the Symbol ID at positions 1-2
     * @param symbolID 30 character string
     * @param ver number like {@link SymbolID.Version_2525Dch1} (11)
     * @return updated 30 character string symbol ID
     */
    public static setVersion(symbolID: string, ver: number): string {
        let strVer: string = ver.toString();

        if (symbolID != null && symbolID.length >= 20) {
            if (strVer.length !== 2) {

                strVer = "11";
            }
            //default to 2525Dch1

            return strVer + symbolID.substring(2);
        }
        else {
            return symbolID;
        }
    }


    /**
     * Gets the version number from the Symbol ID at positions 3-4.
     * Restricted and No-Strike values are NATO only.
     * @param symbolID 30 character string
     * @return number, number will not be padded if it starts with a '0'
     */
    public static getStandardIdentity(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(2, 4));
        }
        else {
            return 0;
        }
    }

    /**
     * Sets the version number of the Symbol ID at positions 3-4
     * @param symbolID 30 character string
     * @param si number If number is a single digit, will pad with a '0' before inserting into symbol ID
     * @return updated 30 character string symbol ID
     */
    public static setStandardIdentity(symbolID: string, si: number): string {
        let strSI: string = si.toString();

        if (symbolID != null && symbolID.length >= 20) {
            if (si < 10 && strSI.length === 1) {

                strSI = "0" + strSI;
            }

            else {

                strSI = si.toString();
            }


            return symbolID.substring(0, 2) + strSI + symbolID.substring(4);
        }
        else {
            return symbolID;
        }
    }


    /**
     * Get Context (Reality (0), Exercise (1), Simulation (2)) at position 3
     * Higher values are NATO only
     * @param symbolID 30 Character string
     * @return number
     */
    public static getContext(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(2, 3));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Context (Reality (0), Exercise (1), Simulation (2)) at position 3
     * @param symbolID 30 Character string
     * @param context number
     * @return string updated Symbol ID.
     */
    public static setContext(symbolID: string, context: number): string {
        if (symbolID != null && symbolID.length >= 20 && context < 4) {
            return symbolID.substring(0, 2) + context.toString() + symbolID.substring(3);
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Affiliation from position 4
     * @param symbolID 30 Character string
     * @return number like {@link SymbolID.StandardIdentity_Affiliation_Friend}
     */
    public static getAffiliation(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(3, 4));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Affiliation at position 4
     * @param symbolID 30 Character string
     * @param affiliation like {@link SymbolID.StandardIdentity_Affiliation_Friend}
     * @return string updated Symbol ID.
     */
    public static setAffiliation(symbolID: string, affiliation: number): string {
        if (symbolID != null && symbolID.length >= 20) {
            return symbolID.substring(0, 3) + affiliation.toString() + symbolID.substring(4);
            //            return Integer.parseInt(symbolID.substring(2,4));
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Symbol Set from positions 5-6
     * @param symbolID 30 Character string
     * @return number like {@link SymbolID.SymbolSet_LandCivilianUnit_Organization}
     */
    public static getSymbolSet(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(4, 6));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Symbol Set at positions 5-6
     * @param symbolID 30 Character string
     * @param ss like {@link SymbolID.SymbolSet_LandCivilianUnit_Organization}
     * @return string updated Symbol ID.
     */
    public static setSymbolSet(symbolID: string, ss: number): string {
        let strSS: string = ss.toString();
        if (ss < 10 && strSS.length === 1) {

            strSS = "0" + strSS;
        }

        if (symbolID != null && symbolID.length >= 20) {
            return symbolID.substring(0, 4) + strSS + symbolID.substring(6);
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Symbol Set from position 7
     * @param symbolID 30 Character string
     * @return number like {@link SymbolID.Status_Present}
     */
    public static getStatus(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(6, 7));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Symbol Set at position 7
     * @param symbolID 30 Character string
     * @param status like {@link SymbolID.Status_Present}
     * @return string updated Symbol ID.
     */
    public static setStatus(symbolID: string, status: number): string {
        let strStatus: string = status.toString();

        if (symbolID != null && symbolID.length >= 20 && strStatus.length === 1) {
            return symbolID.substring(0, 6) + strStatus + symbolID.substring(7);
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Symbol Set from position 8
     * @param symbolID 30 Character string
     * @return number like {@link SymbolID.HQTFD_Headquarters}
     */
    public static getHQTFD(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(7, 8));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Symbol Set at position 8
     * @param symbolID 30 Character string
     * @param HQTFD like {@link SymbolID.HQTFD_Headquarters}
     * @return string updated Symbol ID.
     */
    public static setHQTFD(symbolID: string, HQTFD: number): string {
        let strHQTFD: string = HQTFD.toString();

        if (symbolID != null && symbolID.length >= 20 && strHQTFD.length === 1) {
            return symbolID.substring(0, 7) + strHQTFD + symbolID.substring(8);
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Amplifier Descriptor which can describe things like
     * Echelon / Mobility / Towed Array / Leadership Indicator from positions 9-10
     * @param symbolID 30 Character string
     * @return number
     */
    public static getAmplifierDescriptor(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(8, 10));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Amplifier Descriptor which can describe things like
     * Echelon / Mobility / Towed Array / Leadership Indicator at positions 9-10
     * @param symbolID 30 Character string
     * @param ad
     * @return string
     */
    public static setAmplifierDescriptor(symbolID: string, ad: number): string {
        let strAD: string = ad.toString();
        if (ad < 10 && strAD.length === 1) {

            strAD = "0" + strAD;
        }


        if (symbolID != null && symbolID.length >= 20 && strAD.length === 2) {
            return symbolID.substring(0, 8) + strAD + symbolID.substring(10);
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Entity Code from positions 11-16.
     * These six digits identify a unique symbol within a symbol set.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getEntityCode(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(10, 16));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Entity Code at positions 11-16.
     * These six digits identify a unique symbol within a symbol set.
     * @param symbolID 30 Character string
     * @param entityCode number
     * @return string
     */
    public static setEntityCode(symbolID: string, entityCode: number): string {
        let strSS: string = entityCode.toString();
        while (strSS.length < 6)
            strSS = "0" + strSS;
        if (symbolID != null && symbolID.length >= 20) {
            return symbolID.substring(0, 10) + strSS + symbolID.substring(16);
        }
        else {
            return symbolID;
        }
    }

    /**
     * Get Entity from positions 11-12.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getEntity(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(10, 12));
        }
        else {
            return 0;
        }
    }

    /**
     * Get Entity Type from positions 13-14.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getEntityType(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(12, 14));
        }
        else {
            return 0;
        }
    }

    /**
     * Get Entity Subtype from positions 15-16.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getEntitySubtype(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(14, 16));
        }
        else {
            return 0;
        }
    }

    /**
     * Get Sector 1 Modifier from positions 17-18.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getModifier1(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(16, 18));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Sector 1 Modifier at positions 17-18.
     * @param symbolID 30 Character string
     * @param mod1 number
     * @return string
     */
    public static setModifier1(symbolID: string, mod1: number): string {
        let newID: string = symbolID.toString();
        let mod: string = mod1.toString();
        if (mod.length === 1) {

            mod = "0" + mod;
        }

        if (symbolID != null && symbolID.length >= 20) {
            newID = newID.substring(0, 16) + mod + newID.substring(18);
        }
        return newID;
    }

    /**
     * Get Common Sector 1 Modifier from position 21.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getCommonModifier1(symbolID: string): number {
        let m1: string = "";
        if (symbolID != null && symbolID.length === 30) {
            m1 += symbolID.substring(20, 21);
            return parseInt(m1);
        }
        else {
            return 0;
        }
    }

    /**
     * Set Common Sector 1 Modifier at position 21.
     * @param symbolID 30 Character string
     * @param mod1I number
     * @return string
     */
    public static setCommonModifier1(symbolID: string, mod1I: number): string {
        let newID: string = symbolID.toString();
        let mod: string = mod1I.toString();
        if (symbolID != null && symbolID.length === 30) {
            newID = newID.substring(0, 20) + mod + newID.substring(21);
        }
        return newID;
    }

    /**
     * Get Sector 2 Modifier from positions 17-18.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getModifier2(symbolID: string): number {
        if (symbolID != null && symbolID.length >= 20) {
            return parseInt(symbolID.substring(18, 20));
        }
        else {
            return 0;
        }
    }

    /**
     * Set Sector 2 Modifier at positions 17-18.
     * @param symbolID 30 Character string
     * @param mod1 number
     * @return string
     */
    public static setModifier2(symbolID: string, mod1: number): string {
        let newID: string = symbolID.toString();
        let mod: string = mod1.toString();
        if (mod.length === 1) {
            mod = "0" + mod;
        }

        if (symbolID != null && symbolID.length >= 20) {
            newID = newID.substring(0, 18) + mod + newID.substring(20);
        }
        return newID;
    }

    /**
     * Get Common Sector 2 Modifier from position 22.
     * @param symbolID 30 Character string
     * @return number
     */
    public static getCommonModifier2(symbolID: string): number {
        let m1: string = "";
        if (symbolID != null && symbolID.length === 30) {
            m1 += symbolID.substring(21, 22);
            return parseInt(m1);
        }
        else {
            return 0;
        }
    }

    /**
     * Set Common Sector 2 Modifier at position 22.
     * @param symbolID 30 Character string
     * @param mod1I number
     * @return string
     */
    public static setCommonModifier2(symbolID: string, mod1I: number): string {
        let newID: string = symbolID.toString();
        let mod: string = mod1I.toString();
        if (symbolID != null && symbolID.length === 30) {
            newID = newID.substring(0, 21) + mod + newID.substring(22);
        }
        return newID;
    }

    /*
    public static String getStandardIdentity(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(2, 4);
        }
        else
        {
            return "00";
        }
    }

    public static char getContext(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.charAt(3);
        }
        else
        {
            return '0';
        }
    }

    public static char getAffiliation(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.charAt(4);
        }
        else
        {
            return '0';
        }
    }

    public static String getSymbolSet(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(4, 6);
        }
        else
        {
            return "00";
        }
    }

    public static char getStatus(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.charAt(6);
        }
        else
        {
            return '0';
        }
    }

    public static char getHQTFD(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.charAt(7);
        }
        else
        {
            return '0';
        }
    }


    //  get Echelon / Mobility / Towed Array
    //  @param symbolID
    //  @return

    public static String getAmplifierDescriptor(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(8, 10);
        }
        else
        {
            return "00";
        }
    }

    public static String getEntityCode(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(10, 16);
        }
        else
        {
            return "000000";
        }
    }

    public static String getEntity(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(10, 12);
        }
        else
        {
            return "00";
        }
    }

    public static String getEntityType(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(12, 14);
        }
        else
        {
            return "00";
        }
    }

    public static String getEntitySubtype(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(14, 16);
        }
        else
        {
            return "00";
        }
    }

    public static String getModifier1(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(16, 18);
        }
        else
        {
            return "00";
        }
    }

    public static String getModifier2(String symbolID)
    {
        if(symbolID != null && symbolID.length >= 20)
        {
            return symbolID.substring(18, 20);
        }
        else
        {
            return "00";
        }
    }//*/

    /**
     * Returns true is symbol is of the Meteorological variety.
     * @param symbolID 30 Character string
     * @return boolean
     * @deprecated See {@link SymbolUtilities.isWeather()}
     */
    public static isMETOC(symbolID: string): boolean {
        return SymbolUtilities.isWeather(symbolID);
    }

    /**
     * Build string to grab appropriate SVG file
     * @param symbolID 30 Character string
     * @return string
     * @deprecated See {@link SVGLookup.getFrameID()}
     */
    public static getFrameID(symbolID: string): string {
        //SIDC positions 3_456_7
        return SVGLookup.getFrameID(symbolID);
    }

    /**
     * Build string to grab appropriate SVG file
     * @param symbolID 30 Character string
     * @return string
     * @deprecated See {@link SVGLookup.getMainIconID()}
     */
    public static getMainIconID(symbolID: string): string {
        //SIDC positions 5-6 + 11-16
        return SVGLookup.getMainIconID(symbolID);
    }

    /**
     * Build string to grab appropriate SVG file
     * @param symbolID 30 Character string
     * @return string
     * @deprecated See {@link SVGLookup.getMod2ID()} (String)}
     */
    public static getMod2ID(symbolID: string): string {
        //SIDC positions 5-6 + 19-20 + "2"
        return SVGLookup.getMod2ID(symbolID);
    }

    /**
     * Build string to grab appropriate SVG file
     * @param symbolID 30 Character string
     * @return string
     * @deprecated See {@link SVGLookup.getMod1ID()} (String)}
     */
    public static getMod1ID(symbolID: string): string {
        //SIDC positions 5-6 + 17-18 + "1"
        return SVGLookup.getMod1ID(symbolID);
    }

    /**
     * Gets the 3 digit county code from positions 28-30
     * @param symbolID 30 Character string
     * @return number
     */
    public static getCountryCode(symbolID: string): number {
        let scc: string = "0";
        if (symbolID.length === 30) {

            scc = symbolID.substring(27, 30);
        }

        return parseInt(scc);
    }

    /**
     * In 2525E, position 23 of the symbol code has the Frame Shape modifier.
     * This lets a user force a different frame shape than what a symbol would normally have.
     * Like you could have Air Fixed Wing with a ground unit rectangle frame for when it's on the ground.
     * This function returns the frame shape value for what the default frame would be for a specific symbol set.
     * @param symbolID 30 Character string
     * @return string (1 character)
     */
    public static getDefaultFrameShape(symbolID: string): string {
        let ss: number = SymbolID.getSymbolSet(symbolID);

        switch (ss) {
            case SymbolID.SymbolSet_Air:
            case SymbolID.SymbolSet_AirMissile:
            case SymbolID.SymbolSet_SignalsIntelligence_Air: {
                return SymbolID.FrameShape_Air;
            }

            case SymbolID.SymbolSet_Space:
            case SymbolID.SymbolSet_SpaceMissile:
            case SymbolID.SymbolSet_SignalsIntelligence_Space: {
                if (ss === SymbolID.SymbolSet_SignalsIntelligence && SymbolID.getVersion(symbolID) >= SymbolID.Version_2525E) {

                    return SymbolID.FrameShape_LandEquipment_SeaSurface;
                }

                else {

                    return SymbolID.FrameShape_Space;
                }

            }

            case SymbolID.SymbolSet_LandUnit:
            case SymbolID.SymbolSet_LandCivilianUnit_Organization:
            case SymbolID.SymbolSet_SignalsIntelligence_Land: {
                return SymbolID.FrameShape_LandUnit;
            }

            case SymbolID.SymbolSet_LandEquipment:
            case SymbolID.SymbolSet_SeaSurface:
            case SymbolID.SymbolSet_SignalsIntelligence_SeaSurface: {
                return SymbolID.FrameShape_LandEquipment_SeaSurface;
            }

            case SymbolID.SymbolSet_LandInstallation: {
                return SymbolID.FrameShape_LandInstallation;
            }

            case SymbolID.SymbolSet_SeaSubsurface:
            case SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface:
            case SymbolID.SymbolSet_MineWarfare: {
                return SymbolID.FrameShape_SeaSubsurface;
            }

            case SymbolID.SymbolSet_DismountedIndividuals: {
                return SymbolID.FrameShape_DismountedIndividuals;
            }

            case SymbolID.SymbolSet_Activities: {
                return SymbolID.FrameShape_Activity_Event;
            }

            case SymbolID.SymbolSet_CyberSpace: {
                return SymbolID.FrameShape_Cyberspace;
            }

            default: {
                return SymbolID.FrameShape_Unknown;
            }

        }
    }


    /**
     * Gets the Frame Shape override from position 23.
     * @param symbolID 30 Character string
     * @return string (1 character)
     */
    public static getFrameShape(symbolID: string): string {
        if(symbolID != null && symbolID.length >= 23)
            return symbolID.charAt(22);
        else 
            return "0";
    }
}


