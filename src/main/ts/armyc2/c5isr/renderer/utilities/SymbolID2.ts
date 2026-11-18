
import { MSLookup } from "../../renderer/utilities/MSLookup"
import { SymbolID } from "../../renderer/utilities/SymbolID"
import { SymbolUtilities } from "./SymbolUtilities";

/**
 * Utility class for helping to parse out parts of the symbol ID.
 * String and Char based interactions vs SymbolID which focuses more on Integer interactions
 */
export class SymbolID2 {

    // Version, 1-2 (Can't start with zero, will be 10 at a minimum)
    public static readonly Version_APP6D: string = "10";
    /**
     * @deprecated 2525D(10) will be treated like APP6D(also 10)
     * For 2525D use 2525Dch1(11)
     */
    public static readonly Version_2525D: string = "10";
    public static readonly Version_2525Dch1: string = "11";
    /**
     * @deprecated withdrawn from standard
     */
    public static readonly Version_APP6Dch2: string = "12";
    /**
     * @deprecated use 2525Ech1
     */
    public static readonly Version_2525E: string = "13";
    /**
     * @deprecated use APP6Ech2
     */
    public static readonly Version_APP6Ech1: string = "14";
    public static readonly Version_2525Ech1: string = "15";
    public static readonly Version_APP6Ech2: string = "16";

    // Standard Identity, First Digit (3)
    public static readonly StandardIdentity_Context_Reality: string = "0";
    public static readonly StandardIdentity_Context_Exercise: string = "1";
    public static readonly StandardIdentity_Context_Simulation: string = "2";
    public static readonly StandardIdentity_Context_Restricted_Target_Reality: string = "3";
    public static readonly StandardIdentity_Context_No_Strike_Entity_Reality: string = "4";

    // Standard Identity, Second Digit (4)
    public static readonly StandardIdentity_Affiliation_Pending: string = "0";
    public static readonly StandardIdentity_Affiliation_Unknown: string = "1";
    public static readonly StandardIdentity_Affiliation_AssumedFriend: string = "2";
    public static readonly StandardIdentity_Affiliation_Friend: string = "3";
    public static readonly StandardIdentity_Affiliation_Neutral: string = "4";
    public static readonly StandardIdentity_Affiliation_Suspect_Joker: string = "5";
    public static readonly StandardIdentity_Affiliation_Hostile_Faker: string = "6";

    // Symbol Set, 2 Digits (5-6)
    public static readonly SymbolSet_Unknown: string = "00";
    public static readonly SymbolSet_Air: string = "01";
    public static readonly SymbolSet_AirMissile: string = "02";
    public static readonly SymbolSet_Space: string = "05";
    public static readonly SymbolSet_SpaceMissile: string = "06";
    public static readonly SymbolSet_LandUnit: string = "10";
    public static readonly SymbolSet_LandCivilianUnit_Organization: string = "11";
    public static readonly SymbolSet_LandEquipment: string = "15";
    public static readonly SymbolSet_LandInstallation: string = "20";
    public static readonly SymbolSet_ControlMeasure: string = "25";
    public static readonly SymbolSet_DismountedIndividuals: string = "27";
    public static readonly SymbolSet_SeaSurface: string = "30";
    public static readonly SymbolSet_SeaSubsurface: string = "35";
    public static readonly SymbolSet_MineWarfare: string = "36";
    public static readonly SymbolSet_Activities: string = "40";
    public static readonly SymbolSet_Atmospheric: string = "45";
    public static readonly SymbolSet_Oceanographic: string = "46";
    public static readonly SymbolSet_MeteorologicalSpace: string = "47";
    public static readonly SymbolSet_SignalsIntelligence: string = "50";
    public static readonly SymbolSet_CyberSpace: string = "60";
    /**
     * APP6Ev2 only
     */
    public static readonly SymbolSet_CyberSpace_Equipment: string = "64";
    public static readonly SymbolSet_InvalidSymbol: string = "98";

    // Status, 1 Digit
    public static readonly Status_Present: string = "0";
    public static readonly Status_Planned_Anticipated_Suspect: string = "1";
    public static readonly Status_Present_FullyCapable: string = "2";
    public static readonly Status_Present_Damaged: string = "3";
    public static readonly Status_Present_Destroyed: string = "4";
    public static readonly Status_Present_FullToCapacity: string = "5";

    // Headquarters/Task Force/Dummy/Unmanned
    public static readonly HQTFDU_Unknown: string = "0";
    public static readonly HQTFDU_FeintDummy: string = "1";
    public static readonly HQTFDU_Headquarters: string = "2";
    public static readonly HQTFDU_FeintDummy_Headquarters: string = "3";
    public static readonly HQTFDU_TaskForce: string = "4";
    public static readonly HQTFDU_FeintDummy_TaskForce: string = "5";
    public static readonly HQTFDU_TaskForce_Headquarters: string = "6";
    public static readonly HQTFDU_FeintDummy_TaskForce_Headquarters: string = "7";
    public static readonly HQTFDU_Unmanned_Marker: string = "8";
    public static readonly HQTFDU_Unmanned_Marker_Autonomous: string = "9";
    public static readonly HQTFDU_Unmanned_Marker_Remotely_Piloted: string = "A";
    public static readonly HQTFDU_Unmanned_Marker_FeintDummy: string = "B";
    public static readonly HQTFDU_Unmanned_Marker_Autonomous_FeintDummy: string = "C";
    public static readonly HQTFDU_Unmanned_Marker_Remotely_Piloted_FeintDummy: string = "D";

    // Echelon/Mobility/Towed Array Amplifier
    public static readonly Echelon_Unknown: string = "00";
    public static readonly Echelon_Team_Crew: string = "11";
    public static readonly Echelon_Squad: string = "12";
    public static readonly Echelon_Section: string = "13";
    public static readonly Echelon_Platoon_Detachment: string = "14";
    public static readonly Echelon_Company_Battery_Troop: string = "15";
    public static readonly Echelon_Battalion_Squadron: string = "16";
    public static readonly Echelon_Regiment_Group: string = "17";
    public static readonly Echelon_Brigade: string = "18";
    public static readonly Echelon_VersionExtensionFlag: string = "19";
    public static readonly Echelon_Division: string = "21";
    public static readonly Echelon_Corps_MEF: string = "22";
    public static readonly Echelon_Army: string = "23";
    public static readonly Echelon_ArmyGroup_Front: string = "24";
    public static readonly Echelon_Region_Theater: string = "25";
    public static readonly Echelon_Region_Command: string = "26";
    public static readonly Echelon_VersionExtensionFlag2: string = "29";

    public static readonly Mobility_Unknown: string = "00";
    // equipment mobility on land
    public static readonly Mobility_WheeledLimitedCrossCountry: string = "31";
    public static readonly Mobility_WheeledCrossCountry: string = "32";
    public static readonly Mobility_Tracked: string = "33";
    public static readonly Mobility_Wheeled_Tracked: string = "34";
    public static readonly Mobility_Towed: string = "35";
    public static readonly Mobility_Rail: string = "36";
    public static readonly Mobility_PackAnimals: string = "37";
    // equipment mobility on snow
    public static readonly Mobility_OverSnow: string = "41";
    public static readonly Mobility_Sled: string = "42";
    // equipment mobility on water
    public static readonly Mobility_Barge: string = "51";
    public static readonly Mobility_Amphibious: string = "52";
    // naval towed array
    public static readonly Mobility_ShortTowedArray: string = "61";
    public static readonly Mobility_LongTowedArray: string = "62";
    public static readonly Leadership_Individual: string = "71";

    // Frame Shape, 1 digit, position 23
    public static readonly FrameShape_Unknown: string = "0";
    public static readonly FrameShape_Space: string = "1";
    public static readonly FrameShape_Air: string = "2";
    public static readonly FrameShape_LandUnit: string = "3";
    public static readonly FrameShape_LandEquipment: string = "4";
    public static readonly FrameShape_LandInstallation: string = "5";
    public static readonly FrameShape_DismountedIndividuals: string = "6";
    public static readonly FrameShape_SeaSubsurface: string = "7";
    public static readonly FrameShape_Activity_Event: string = "8";
    public static readonly FrameShape_Cyberspace: string = "9";
    public static readonly FrameShape_SeaSurface: string = "A";

    /**
     * Attempts to resolve a bad symbol ID into a value that can be found in {@link MSLookup}.
     * If it fails, it will return the symbol code for an invalid symbol which is displayed as
     * an inverted question mark (110098000010000000000000000000)
     * @param symbolID 30 character string
     * @return 30 character string representing the resolved symbol ID.
     * @deprecated See {@link SymbolUtilities#reconcileSymbolID(string)}
     */
    public static reconcileSymbolID(symbolID: string): string {
        return SymbolUtilities.reconcileSymbolID(symbolID);
    }

    /**
     * Gets the version number from the Symbol ID at positions 1-2
     * @param symbolID 30 character string
     * @return string like {@link SymbolID2#Version_2525Dch1} (11)
     */
    public static getVersion(symbolID: string): string {
        return symbolID.substring(0, 2);
    }

    /**
     * Sets the version number of the Symbol ID at positions 1-2
     * @param symbolID 30 character string
     * @param ver string like {@link SymbolID2#Version_2525Dch1} (11)
     * @return updated 30 character string symbol ID
     */
    public static setVersion(symbolID: string, ver: string): string {
        if (symbolID !== null && symbolID.length >= 20 && ver !== null && ver.length === 2) {
            return ver + symbolID.substring(2);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Context (Reality (0), Exercise (1), Simulation (2)) at position 3
     * Higher values are NATO only
     * @param symbolID 30 Character string
     * @return string (represented as a string in TS since there is no char type)
     */
    public static getContext(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.charAt(2);
        } else {
            return "0";
        }
    }

    /**
     * Set Context (Reality (0), Exercise (1), Simulation (2)) at position 3
     * @param symbolID 30 Character string
     * @param context string
     * @return string updated Symbol ID.
     */
    public static setContext(symbolID: string, context: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(0, 2) + context + symbolID.substring(3);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Affiliation from position 4
     * @param symbolID 30 Character string
     * @return string like {@link SymbolID2#StandardIdentity_Affiliation_Friend}
     */
    public static getAffiliation(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.charAt(3);
        } else {
            return "0";
        }
    }

    /**
     * Set Affiliation at position 4
     * @param symbolID 30 Character string
     * @param affiliation like {@link SymbolID2#StandardIdentity_Affiliation_Friend}
     * @return string updated Symbol ID.
     */
    public static setAffiliation(symbolID: string, affiliation: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(0, 3) + affiliation + symbolID.substring(4);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Symbol Set from positions 5-6
     * @param symbolID 30 Character string
     * @return string like {@link SymbolID2#SymbolSet_LandCivilianUnit_Organization}
     */
    public static getSymbolSet(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(4, 6);
        } else {
            return "00";
        }
    }

    /**
     * Set Symbol Set at positions 5-6
     * @param symbolID 30 Character string
     * @param ss like {@link SymbolID2#SymbolSet_LandCivilianUnit_Organization}
     * @return string updated Symbol ID.
     */
    public static setSymbolSet(symbolID: string, ss: string): string {
        if (symbolID !== null && symbolID.length >= 20 && ss !== null && ss.length === 2) {
            return symbolID.substring(0, 4) + ss + symbolID.substring(6);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Status from position 7
     * @param symbolID 30 Character string
     * @return string like {@link SymbolID2#Status_Present}
     */
    public static getStatus(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.charAt(6);
        } else {
            return "0";
        }
    }

    /**
     * Set Status at position 7
     * @param symbolID 30 Character string
     * @param status like {@link SymbolID2#Status_Present}
     * @return string updated Symbol ID.
     */
    public static setStatus(symbolID: string, status: string): string {
        return symbolID.substring(0, 6) + status + symbolID.substring(7);
    }

    /**
     * Get HQTFDU from position 8
     * @param symbolID 30 Character string
     * @return string like {@link SymbolID2#HQTFDU_Headquarters}
     */
    public static getHQTFDU(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.charAt(7);
        } else {
            return "0";
        }
    }

    /**
     * Set HQTFDU at position 8
     * @param symbolID 30 Character string
     * @param hqtfdu like {@link SymbolID2#HQTFDU_Headquarters}
     * @return string updated Symbol ID.
     */
    public static setHQTFDU(symbolID: string, hqtfdu: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(0, 7) + hqtfdu + symbolID.substring(8);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Amplifier Descriptor which can describe things like
     * Echelon / Mobility / Towed Array / Leadership Indicator from positions 9-10
     * @param symbolID 30 Character string
     * @return string
     */
    public static getAmplifierDescriptor(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(8, 10);
        } else {
            return "00";
        }
    }

    /**
     * Set Amplifier Descriptor which can describe things like
     * Echelon / Mobility / Towed Array / Leadership Indicator at positions 9-10
     * @param symbolID 30 Character string
     * @param ad string
     * @return string
     */
    public static setAmplifierDescriptor(symbolID: string, ad: string): string {
        if (symbolID !== null && symbolID.length >= 20 && ad !== null && ad.length === 2) {
            return symbolID.substring(0, 8) + ad + symbolID.substring(10);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Entity Code from positions 11-16.
     * These six digits identify a unique symbol within a symbol set.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getEntityCode(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(10, 16);
        } else {
            return "000000";
        }
    }

    /**
     * Set Entity Code at positions 11-16.
     * These six digits identify a unique symbol within a symbol set.
     * @param symbolID 30 Character string
     * @param entityCode string
     * @return string
     */
    public static setEntityCode(symbolID: string, entityCode: string): string {
        if (symbolID !== null && symbolID.length >= 20 && entityCode !== null && entityCode.length === 6) {
            return symbolID.substring(0, 10) + entityCode + symbolID.substring(16);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Entity from positions 11-12.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getEntity(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(10, 12);
        } else {
            return "00";
        }
    }

    /**
     * Get Entity Type from positions 13-14.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getEntityType(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(12, 14);
        } else {
            return "00";
        }
    }

    /**
     * Get Entity Subtype from positions 15-16.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getEntitySubtype(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(14, 16);
        } else {
            return "00";
        }
    }

    /**
     * Get Sector 1 Modifier from positions 17-18.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getModifier1(String: string): string {
        if (String !== null && String.length >= 20) {
            return String.substring(16, 18);
        } else {
            return "00";
        }
    }

    /**
     * Get Sector 1 Modifier to positions 17-18.
     * @param symbolID 30 Character string
     * @param mod1 string hex string from "00" to "FF"
     * @return string
     */
    public static setModifier1(symbolID: string, mod1: string): string {
        let newID = symbolID;
        let mod = mod1;
        if (mod === null || mod1 === "" || mod.length > 2) {
            mod = "00";
        } else if (mod.length === 1) {
            mod = "0" + mod;
        }
        if (symbolID !== null && symbolID.length >= 20) {
            newID = newID.substring(0, 16) + mod + newID.substring(18);
        }
        return newID;
    }

    /**
     * Get Common Sector 1 Modifier from position 21.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getCommonModifier1(symbolID: string): string {
        if (symbolID !== null && symbolID.length === 30) {
            return symbolID.charAt(20);
        } else {
            return "0";
        }
    }

    /**
     * Set Common Sector 1 Modifier at position 21.
     * @param symbolID 30 Character string
     * @param mod1I string
     * @return string
     */
    public static setCommonModifier1(symbolID: string, mod1I: string): string {
        if (symbolID !== null && symbolID.length === 30) {
            return symbolID.substring(0, 20) + mod1I + symbolID.substring(21);
        } else {
            return symbolID;
        }
    }

    /**
     * Get Sector 2 Modifier from positions 17-18.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getModifier2(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 20) {
            return symbolID.substring(18, 20);
        } else {
            return "00";
        }
    }

    /**
     * Set Sector 2 Modifier to positions 17-18.
     * @param symbolID 30 Character string
     * @param mod2 string hex string from "00" to "FF"
     * @return string
     */
    public static setModifier2(symbolID: string, mod2: string): string {
        let newID = symbolID;
        let mod = mod2;
        if (mod === null || mod2 === "" || mod.length > 2) {
            mod = "00";
        } else if (mod.length === 1) {
            mod = "0" + mod;
        }
        if (symbolID !== null && symbolID.length >= 20) {
            newID = newID.substring(0, 18) + mod + newID.substring(20);
        }
        return newID;
    }

    /**
     * Get Common Sector 2 Modifier from position 22.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getCommonModifier2(symbolID: string): string {
        if (symbolID !== null && symbolID.length === 30) {
            return symbolID.charAt(21);
        } else {
            return "0";
        }
    }

    /**
     * Set Common Sector 2 Modifier at position 22.
     * @param symbolID 30 Character string
     * @param mod2I string
     * @return string
     */
    public static setCommonModifier2(symbolID: string, mod2I: string): string {
        if (symbolID !== null && symbolID.length === 30) {
            return symbolID.substring(0, 21) + mod2I + symbolID.substring(22);
        } else {
            return symbolID;
        }
    }

    /**
     * In 2525E, position 23 of the symbol code has the Frame Shape modifier.
     * This lets a user force a different frame shape than what a symbol would normally have.
     * This function returns the frame shape value for what the default frame would be for a specific symbol set.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getDefaultFrameShape(symbolID: string): string {
        return SymbolID.getDefaultFrameShape(symbolID);
    }

    /**
     * @param symbolID 30 character symbol ID
     * @param frameShape like SymbolID.FrameShape_LandEquipment
     * @return updated 30 character symbolID
     */
    public static setFrameShape(symbolID: string, frameShape: string): string {
        if (symbolID !== null && symbolID.length >= 23) {
            return symbolID.substring(0, 22) + frameShape + symbolID.substring(23);
        } else {
            return symbolID;
        }
    }

    /**
     * Gets the Frame Shape override from position 23.
     * @param symbolID 30 Character string
     * @return string
     */
    public static getFrameShape(symbolID: string): string {
        if (symbolID !== null && symbolID.length >= 23) {
            return symbolID.charAt(22);
        } else {
            return "0";
        }
    }

    /**
     * Gets the 3 digit country code from positions 28-30
     * @param symbolID 30 Character string
     * @return string
     */
    public static getCountryCode(symbolID: string): string {
        if (symbolID !== null && symbolID.length === 30) {
            return symbolID.substring(27, 30);
        } else {
            return "000";
        }
    }

    /**
     * Sets the country code on the symbol code
     * @param symbolID 30 Character string
     * @param countryCode country code like "840" for USA or "076" for Brazil
     * @return updated 30 character symbolID
     */
    public static setCountryCode(symbolID: string, countryCode: string): string {
        let code = countryCode;
        if (symbolID !== null && symbolID.length >= 20) {
            if (code.length > 3) {
                code = code.substring(0, 3);
            }
            while (code.length < 3) {
                code = "0" + code;
            }
            return symbolID.substring(0, 27) + code;
        } else {
            return symbolID;
        }
    }
}