

//import { MilStdAttributes } from "../../renderer/utilities/MilStdAttributes"

/**
 * Modifier Constants to be used as keys in the modifiers map
 */
export class Modifiers {
    /**
     * <pre>
     * Symbol Icon
     * The innermost part of a symbol, comprised of an icon and optional modifiers, that represents a joint military object (see 5.3.4).
     * Format: Graphic
     * Symbol Set: All
     * Remarks: Determined by SIDC positions 11-20.
     * </pre>
     */
    public static readonly A_SYMBOL_ICON: string = "A_SYMBOL_ICON";
    /**
     * <pre>
     * Echelon
     * An amplifier in a unit symbol that identifies command level (see 5.3.7.1 and table VII).
     * Format: Graphic
     * Symbol Set: All
     * Remarks: Determined by SIDC positions 9-10.
     * </pre>
     */
    public static readonly B_ECHELON: string = "B_ECHELON";
    /**
     * <pre>
     * Quantity
     * An amplifier in an equipment symbol that identifies the number of items present.
     * Examples include:
     * 350 Beds 50 Gallons
     * Format:
     * Alphanumeric - {1,19}
     * [#########] [XXXXXXXXXX]
     * Symbol Set: 10, 11, 15, 25, 27, 60
     * Remarks: Two-part composite field.
     * Where # is the numeric value [1-999999999], and X is the unit of measure.
     * Note: There should be a space between the numeric and the unit of measure values.
     * </pre>
     */
    public static readonly C_QUANTITY: string = "C_QUANTITY";
    /**
     * <pre>
     * Task Force Indicator
     * An amplifier that identifies a unit or activities symbol as a task force (see 5.3.7.2 and figure 14).
     * Format: Graphic
     * Symbol Set: 10
     * Remarks: Determined by SIDC position 8.
     * </pre>
     */
    public static readonly D_TASK_FORCE_INDICATOR: string = "D_TASK_FORCE_INDICATOR";

    /**
     * <pre>
     * Frame Shape Modifier
     * A graphic modifier that displays standard identity, battle dimension, or exercise
     * amplifying descriptors of an object (see 5.3.1 and table II).
     * Format: Graphic
     * Symbol Set: ALL BUT 25,45,46,47
     * Remarks: 2525C, not processed as a modifier in 2525D+
     * </pre>
     */
    public static readonly E_FRAME_SHAPE_MODIFIER: string = "E_FRAME_SHAPE_MODIFIER";

    /**
     * <pre>
     * Reinforced or Reduced
     * An amplifier in a unit symbol that displays (+) for reinforced, (-) for reduced, (<u>+</u>) reinforced and reduced.
     * Format: Alphanumeric - {1,1}
     * Symbol Set: 10
     * Remarks:
     * </pre>
     */
    public static readonly F_REINFORCED_REDUCED: string = "F_REINFORCED_REDUCED";
    /**
     * <pre>
     * Staff Comments
     * An amplifier for units, equipment and installations; content is implementation specific.
     * Format: Alphanumeric - {1,20}
     * Symbol Set: 01, 05, 10, 15, 20, 27, 30, 35, 40
     * Remarks:
     * </pre>
     */
    public static readonly G_STAFF_COMMENTS: string = "G_STAFF_COMMENTS";
    /**
     * <pre>
     * Additional Information
     * An amplifier for units, equipment and installations; content is implementation specific.
     * Format: Alphanumeric - {1,20}
     * Symbol Set: ALL
     * Remarks:
     * </pre>
     */
    public static readonly H_ADDITIONAL_INFO_1: string = "H_ADDITIONAL_INFO_1";

    /**
     * <pre>
     * Unlisted Point Information
     * An alphanumeric text amplifier used to provide an up to a three-character letter field acronym to describe a point that is not already listed.
     * Format: Alphanumeric - {1,3}
     * Symbol Set: 25
     * Remarks: Only used with Action Points (General) control measure. SIDC 130100.
     * </pre>
     */
    public static readonly H1_ADDITIONAL_INFO_2: string = "H1_ADDITIONAL_INFO_2";

    /**
     * A text modifier for tactical graphics; content is
     * implementation specific.
     * CM: P,L,A,N,B/C,R/N
     * Length: 20
     * @deprecated 2525C
     */
    public static readonly H2_ADDITIONAL_INFO_3: string = "H2_ADDITIONAL_INFO_3";

    /**
     * <pre>
     * Evaluation Rating
     * An amplifier that consists of a one-letter reliability rating and a one-number credibility rating. (See ATP 2-33.4)
     * Format: Alphanumeric - {2,2} [X][#]
     * Symbol Set: 10, 15, 20,27, 40
     * Remarks:
     *
     * Reliability Ratings:
     * A-completely reliable
     * B-usually reliable
     * C-fairly reliable
     * D-not usually reliable
     * E-unreliable
     * F-reliability cannot be judged
     *
     * Credibility Ratings:
     * 1-confirmed by other sources
     * 2-probably true
     * 3-possibly true
     * 4-doubtfully true
     * 5-improbable
     * 6-truth cannot be judged
     * </pre>
     */
    public static readonly J_EVALUATION_RATING: string = "J_EVALUATION_RATING";
    /**
     * <pre>
     * Effectiveness
     * An amplifier for units and installations that indicates unit effectiveness or installation capability.
     * Format: Alphanumeric - {2,3}
     * Symbol Set: 10, 15, 27
     * Remarks:
     * List of Values:
     * FO - Fully Operational
     * SO - Substantially operational
     * MO - Marginally operational
     * NO - Not operational
     * UNK - Unknown
     * </pre>
     */
    public static readonly K_COMBAT_EFFECTIVENESS: string = "K_COMBAT_EFFECTIVENESS";
    /**
     * <pre>
     * Signature Equipment
     * An amplifier for hostile equipment; "!" indicates detectable electronic signatures.
     * Format: Alphanumeric - {1,1}
     * Symbol Set: 15
     * Remarks: The amplifier displayed is the exclamation mark "!".
     * </pre>
     */
    public static readonly L_SIGNATURE_EQUIP: string = "L_SIGNATURE_EQUIP";
    /**
     * <pre>
     * Higher Formation
     * An amplifier for units that indicates number or title of higher echelon command (corps are designated by Roman numerals).
     * Format: Alphanumeric - {1,21}
     * Symbol Set: 10
     * Remarks: The amplifier displayed is the exclamation mark "!".
     * </pre>
     */
    public static readonly M_HIGHER_FORMATION: string = "M_HIGHER_FORMATION";
    /**
     * <pre>
     * Hostile (Enemy)
     * An amplifier for equipment; letters "ENY" denote hostile symbols.
     * Format: Alphanumeric - {3,3}
     * Symbol Set: 15,25
     * Remarks: Determined by SIDC position 4.
     * Note: This amplifier must be used when displaying enemy/hostile control measures on monochromatic displays
     * </pre>
     */
    public static readonly N_HOSTILE: string = "N_HOSTILE";
    /**
     * <pre>
     * IFF/SIF/AIS
     * An amplifier displaying IFF/SIF/AIS Identification modes and codes.
     * Format:
     * Symbol Set: 01, 10, 15, 27, 30, 35
     * Remarks: 'MODE' is not required when displaying.
     * </pre>
     */
    public static readonly P_IFF_SIF_AIS: string = "P_IFF_SIF_AIS";
    /**
     * <pre>
     * Direction of Movement Indicator
     * An amplifier consisting of a line with arrow that identifies the direction of movement or intended movement of an object (see 5.3.7.9 and figure 14).
     * Format: Graphic (Alphanumeric for exchange only)
     * Symbol Set: 10, 15, 20, 25, 27
     * Remarks:
     * Renderer Assumes a value in degrees with no text
     * MilStd:
     *
     * </pre>
     */
    public static readonly Q_DIRECTION_OF_MOVEMENT: string = "Q_DIRECTION_OF_MOVEMENT";
    /**
     * <pre>
     * Mobility Indicator
     * An amplifier that depicts the mobility of an object not intrinsic to the entity itself (see 5.3.7.9, figure 14 and table IX).
     * Format: Graphic
     * Symbol Set: 10
     * Remarks: Determined by SIDC positions 9-10
     * </pre>
     */
    public static readonly R_MOBILITY_INDICATOR: string = "R_MOBILITY_INDICATOR";
    /**
     * <pre>
     * SIGINT Mobility Indicator
     * An amplifier that indicates the mobility of a SIGINT unit.
     * Format: Alphanumeric - {1,1}
     * Symbol Set: 50, 51, 52, 53, 54
     * Remarks:
     * List of Values:
     * M = Mobile,
     * S = Static
     * U = Uncertain.
     * </pre>
     */
    public static readonly R2_SIGNIT_MOBILITY_INDICATOR: string = "R2_SIGNIT_MOBILITY_INDICATOR";
    /**
     * <pre>
     * Headquarters Staff Indicator
     * An amplifier for units, installations and activities that identifies them as a headquarters (see figure 14 and figure 13).
     * Format: Graphic
     * Symbol Set: 10, 20, 40
     * Remarks: Determined by SIDC position 8.
     * </pre>
     */
    public static readonly S_HQ_STAFF_INDICATOR: string = "S_HQ_STAFF_INDICATOR";
    /**
     * <pre>
     * Offset Location Indicator
     * An amplifier used to indicate the offset or precise location of a single point symbol (see 5.3.7.5, 5.3.12, and figure 14).
     * Format: Graphic
     * Symbol Set: 10, 20, 25, 27, 40
     * Remarks: Determined by individual system implementations, not implemented by the renderer.
     * </pre>
     */
    public static readonly S2_OFFSET_INDICATOR: string = "S2_OFFSET_INDICATOR";
    /**
     * <pre>
     * Unique Designation
     * An amplifier that uniquely identifies a particular symbol or track number. Identifies acquisitions number when used with SIGINT symbology.
     * Format: Alphanumeric - {1,30}
     * Symbol Set: All
     * Remarks:
     * </pre>
     */
    public static readonly T_UNIQUE_DESIGNATION_1: string = "T_UNIQUE_DESIGNATION_1";
    /**
     * <pre>
     * Lines - Unique Identifier or Primary Purpose
     * An amplifier that uniquely identifies a particular symbol or track number. Identifies acquisitions number when used with SIGINT symbology.
     * Format: Alphanumeric - {1,30}
     * Symbol Set: All
     * Remarks:
     * </pre>
     */
    public static readonly T1_UNIQUE_DESIGNATION_2: string = "T1_UNIQUE_DESIGNATION_2";
    /**
     * <pre>
     * Type
     * An amplifier for equipment that indicates types of equipment.
     * Format: Alphanumeric - {1,24}
     * Symbol Set: Not Installation(20), Activites(40), or CyberSpace(60)
     * Remarks:
     * Example:
     * AH-64 for Attack Helicopter
     * </pre>
     */
    public static readonly V_EQUIP_TYPE: string = "V_EQUIP_TYPE";
    /**
     * <pre>
     * Date/Time Group (DTG) W
     * An amplifier for displaying a date-time group (DDHHMMSSZMONYYYY) or (DDHHMMZMMMYYYY) or "O/O" for On Order.
     * Field "W" is used to provide DTG or if used with field "W1" the start of a period of time.
     * Field "W1" is used to provide the end of a period of time.
     * Format: Alphanumeric - {3,16}
     * Symbol Set: 10, 15, 20, 25, 27, 40, 45
     * Remarks:
     * The date-time group is composed of a group of six numeric digits with a time zone suffix and the standardized three-letter abbreviation for the month followed by four digits representing the year.
     * The first pair of digits represents the day; the second pair, the hour; the third pair, the minutes. For automated systems, two digits may be added before the time zone suffix and after the minutes to designate seconds (see 5.3.7.8).
     * </pre>
     */
    public static readonly W_DTG_1: string = "W_DTG_1";
    /**
     * <pre>
     * Date/Time Group (DTG) W1
     * An amplifier for displaying a date-time group (DDHHMMSSZMONYYYY) or (DDHHMMZMMMYYYY) or "O/O" for On Order.
     * Field "W" is used to provide DTG or if used with field "W1" the start of a period of time.
     * Field "W1" is used to provide the end of a period of time.
     * Format: Alphanumeric - {3,16}
     * Symbol Set: 25
     * Remarks:
     * The date-time group is composed of a group of six numeric digits with a time zone suffix and the standardized three-letter abbreviation for the month followed by four digits representing the year.
     * The first pair of digits represents the day; the second pair, the hour; the third pair, the minutes. For automated systems, two digits may be added before the time zone suffix and after the minutes to designate seconds (see 5.3.7.8).
     * </pre>
     */
    public static readonly W1_DTG_2: string = "W1_DTG_2";
    /**
     * <pre>
     * Altitude/Depth
     * An amplifier that displays either altitude, flight level, depth for submerged objects or height of equipment or structures on the ground, the minimum, maximum and/or specific altitude (in feet or meters in relation to a reference datum) or depth (for submerged objects in feet below sea level). See 5.3.7.6 for content.
     * Format:
     * Symbol Set: All but 40 & 60
     * Remarks:
     * SM = Statute Miles
     * DM = Data Miles
     * Notes:
     * The Renderer handles the whole value as a string for Single Point Icons.
     * For multipoints, it expects just a number and an accompanying attribute {@link MilStdAttributes.AltitudeUnits}
     * Default behavior assumes feet.
     * </pre>
     */
    public static readonly X_ALTITUDE_DEPTH: string = "X_ALTITUDE_DEPTH";
    /**
     * <pre>
     * Location
     * An amplifier that displays a symbol's location in degrees, minutes and decimal minutes (or in MGRS, GARS, or other applicable display formats).
     * Format: Alphanumeric - {3,16}
     * Symbol Set: 10, 15, 20, 25, 27, 30, 40
     * Remarks: Exchange format is implementation specific.
     * </pre>
     */
    public static readonly Y_LOCATION: string = "Y_LOCATION";
    /**
     * <pre>
     * Speed
     * An amplifier that displays velocity (see 5.3.7.7).
     * Format: Alphanumeric - {5,9} [#####] [XXX]
     * Symbol Set: NOT 20, 35, 40, 60
     * Remarks:
     * Two-part composite field.
     * Where # is the numeric value [1-999999999], and XXX is the unit of measure (KPH, KPS, MPH, NMH, KTS).
     * Note: There should be a space between the numeric and the unit of measure values.
     * </pre>
     */
    public static readonly Z_SPEED: string = "Z_SPEED";
    /**
     * <pre>
     * Special C2 Headquarters
     * A amplifier that is contained inside the frame in place of the main icon and contains the name of the special C2 Headquarters.
     * Format: Alphanumeric - {1,9}
     * Symbol Set: 10
     * Remarks:
     * Examples: Named command such as SHAPE, PACOM, and joint, multinational, or coalition commands such as CJTF, JTF, or MJTF.
     * </pre>
     */
    public static readonly AA_SPECIAL_C2_HQ: string = "AA_SPECIAL_C2_HQ";
    /**
     * <pre>
     * Feint/Dummy indicator
     * An amplifier that identifies an offensive or defensive unit, intended to draw the enemy's attention away from the area of the main attack.
     * Format: Graphic
     * Symbol Set: 10, 15, 20, 25
     * Remarks: Determined by SIDC position 8.
     * </pre>
     */
    public static readonly AB_FEINT_DUMMY_INDICATOR: string = "AB_FEINT_DUMMY_INDICATOR";

    /**
     * <pre>
     * Platform Type
     * An amplifier that identifies the electronic identification for a pulsed or non-pulsed electromagnetic emission.
     * Format: Alphanumeric - {5,5}
     * Symbol Set: 10, 15
     * Remarks:
     * List of Values:
     * ELNOT = Electronic intelligence notation
     * CENOT = Communications intelligence notation
     * </pre>
     */
    public static readonly AD_PLATFORM_TYPE: string = "AD_PLATFORM_TYPE";
    /**
     * <pre>
     * Platform Type
     * An amplifier that identifies equipment teardown time in minutes.
     * Format: Numeric – {1,3}
     * Symbol Set: 10(2525E), 15
     * Remarks:
     * </pre>
     */
    public static readonly AE_EQUIPMENT_TEARDOWN_TIME: string = "AE_EQUIPMENT_TEARDOWN_TIME";
    /**
     * <pre>
     * Common Identifier
     * An amplifier to provide a common name used to identify an entity.
     * Format: Alphanumeric - {1,12}
     * Symbol Set: 10(2525E), 15, 27
     * Remarks: Example: "Hawk" for Hawk SAM system.
     * </pre>
     */
    public static readonly AF_COMMON_IDENTIFIER: string = "AF_COMMON_IDENTIFIER";
    /**
     * <pre>
     * Auxiliary Equipment Indicator
     * An amplifier for equipment that indicates the presence of a towed sonar array (see 5.3.7.11, figure 14 and table IX).
     * Format: Graphic
     * Symbol Set: 15
     * Remarks: Determined by SIDC positions 9-10.
     * </pre>
     */
    public static readonly AG_AUX_EQUIP_INDICATOR: string = "AG_AUX_EQUIP_INDICATOR";
    /**
     * <pre>
     * Area of Uncertainty
     * An amplifier that indicates the area where an object is most likely to be, based on the object's last report and
     * the reporting accuracy of the sensor that detected the object (see 5.3.7.13.1 and figure 18.
     * Format: Graphic (Alphanumeric for exchange only)
     * Symbol Set: 01, 05, 10, 15, 20, 25, 27, 30, 35, 40
     * Remarks:
     * The amplifier can be displayed as an ellipse, a bearing box, or a line of bearing, depending on the report received for the object.
     * Notes: Not implemented by the renderer
     * </pre>
     */
    public static readonly AH_AREA_OF_UNCERTAINTY: string = "AH_AREA_OF_UNCERTAINTY";
    /**
     * <pre>
     * Dead Reckoning Trailer
     * An amplifier that identifies where an object should be located at present, given its last reported course and speed (see 5.3.7.13.2).
     * Format: Graphic
     * Symbol Set: 01, 05, 10, 15, 20, 25, 27, 30, 35, 40
     * Remarks:
     * Locally derived information. This datum is not exchanged.
     * Notes: Not implemented by the renderer
     * </pre>
     */
    public static readonly AI_DEAD_RECKONING_TRAILER: string = "AI_DEAD_RECKONING_TRAILER";
    /**
     * <pre>
     * Speed Leader
     * An amplifier that depicts the speed and direction of movement of an object (see 5.3.7.13.3 and figure 18).
     * Format: Graphic
     * Symbol Set: 10, 15, 30, 35
     * Remarks:
     * Land units and equipment use the Direction of Movement and Speed amplifiers for this information.
     * Notes: Not implemented by the renderer
     * </pre>
     */
    public static readonly AJ_SPEED_LEADER: string = "AJ_SPEED_LEADER";
    /**
     * <pre>
     * Pairing Line
     * An amplifier that connects two objects and is updated dynamically as the positions of the two objects change (see 5.3.7.13.4 and figure 18).
     * Format: Graphic
     * Symbol Set: NA
     * Remarks:
     * Notes: Not implemented by the renderer
     * </pre>
     */
    public static readonly AK_PAIRING_LINE: string = "AK_PAIRING_LINE";
    /**
     * <pre>
     * Operational Condition
     * An amplifier that indicates operational condition or capacity.
     * Format: Graphic
     * Symbol Set: 01, 05,10, 15, 20, 30, 35
     * Remarks: Determined by SIDC position 7.
     * </pre>
     */
    public static readonly AL_OPERATIONAL_CONDITION: string = "AL_OPERATIONAL_CONDITION";

    /**
     * <pre>
     * Distance
     * An amplifier that displays a minimum, maximum, or a specific distance (range, radius, width, length, etc.), in meters.
     * Format: Alphanumeric - {3,9} [#] [X]
     * Symbol Set: 25
     * Remarks:
     * "#" is the value (range 0-99999)
     * XXX is the distance unit.
     * There should be a space between the integer and the unit of measure values.
     * Where more than one distance is specified the AM amplifier will be suffixed with a numeric entry, e.g. AM1, AM2.
     * Note:
     * Renderer expects just a number or a comma delimited string of numbers and an accompanying attribute {@link MilStdAttributes.DistanceUnits}
     * Default behavior assumes meters.
     * </pre>
     */
    public static readonly AM_DISTANCE: string = "AM_DISTANCE";
    /**
     * <pre>
     * Azimuth
     * An amplifier that displays an angle measured from true north to any other line in degrees.
     * Format: Alphanumeric - {7,8} [#####] [XXX]
     * Symbol Set: 25
     * Remarks:
     * For Degrees entries.
     * XXX DGT, where XXX is degrees from 000-359 and DGT is referenced to TRUE North.
     * For Mils entries.
     * XXXX MGT, where XXXX is MILS from 0000-6399 and MGT is referenced to TRUE North.
     * Where more than one angle is specified the AN amplifier will be suffixed with a numeric entry, e.g. AN1, AN2.
     * Note:
     * Renderer expects just a number or a comma delimited string of numbers
     * </pre>
     */
    public static readonly AN_AZIMUTH: string = "AN_AZIMUTH";

    /**
     * Engagement Bar
     * A graphic amplifier placed immediately atop the symbol. May denote:
     * A) local/remote engagement status - 'R' for remote, 'B' for mix of local/remote, none for local
     * B) engagement status
     * C) weapon type.
     *
     * Format:
     * Composite list of values
     * Alphanumeric - {6,10}
     * A:BBB-CC
     * Symbol Set: 01, 05, 10, 30, 35
     * Remarks: See 5.3.7.15.3 for explanation of engagement bar structure and codes.
     * A - Type of Engagement
     * BBB - Engagement Stage
     * CC - Type of Weapon Assignment
     */
    public static readonly AO_ENGAGEMENT_BAR: string = "AO_ENGAGEMENT_BAR";

    /**
     * <pre>
     * Target Number
     * An amplifier used in Fire Support operations to uniquely designate targets in accordance with STANAG 2934.
     * Format: Alphanumeric - {6,6} [XX][####]
     * Symbol Set: 25
     * Remarks:
     * Two-part composite field.
     * Where positions 1-2 are text, and positions 3-6 are numeric.
     * </pre>
     */
    public static readonly AP_TARGET_NUMBER: string = "AP_TARGET_NUMBER";

    /**
     * <pre>
     * Target Number Extension
     * An amplifier used to identify a target number extension which is a sequentially assigned number identifying the individual elements in a target (MIL-STD-6017),
     * Format: Numeric – {2,3} [-##]
     * Symbol Set: 25
     * Remarks:
     * Position 1 is a dash (-) and positions 2-3 are numbers, from 1 through 15.
     * It is applicable only to the "Point or Single Target" symbol.
     * It is conditional upon the presence of the Target Number amplifier and is visually displayed appended to the Target Number amplifier.
     * </pre>
     */
    public static readonly AP1_TARGET_NUMBER_EXTENSION: string = "AP1_TARGET_NUMBER_EXTENSION";

    /**
     * <pre>
     * Guarded Unit
     * An amplifier used during ballistic missile defense. Some tracks are designated as guarded by a particular unit.
     * Format: Alphanumeric - {6,6} [XX]
     * Symbol Set: 10(2525E), 15, 20(2525E), 30
     * Remarks:
     * Single value:
     * BG - Guarded Unit
     * </pre>
     */
    public static readonly AQ_GUARDED_UNIT: string = "AQ_GUARDED_UNIT";

    /**
     * <pre>
     * Special Designator
     * An amplifier that identifies special track designators.
     * Format: Alphanumeric - {3,3}
     * Symbol Set: 10, 30, 35
     * Remarks:
     * List of values:
     * NRT - Non-Real Time.
     * SIG - Tactically Significant Tracks.
     * </pre>
     */
    public static readonly AR_SPECIAL_DESIGNATOR: string = "AR_SPECIAL_DESIGNATOR";

    /**
     * <pre>
     * Country
     * A three-letter code that indicates the country of origin of the organization (US systems shall use GENC).
     * Format: Alphanumeric - {3,3}
     * Symbol Set: All
     * Remarks: Determined by SIDC positions 28-30.
     * </pre>
     */
    public static readonly AS_COUNTRY: string = "AS_COUNTRY";

    /**
     * <pre>
     * Capacity of Installation
     * Capacity of installation displayed.
     * Format: Alphanumeric - {1,19} [#########] [XXXXXXXXXX]
     * Symbol Set: 2525E addition, not currently defined.  Probably 20
     * Remarks:
     * Two-part composite field.
     * Comprised of:
     * Quantity 0-99999999 followed by the unit of measure.
     * e.g. 400 Beds
     * </pre>
     */
    public static readonly AT_CAPACITY_OF_INSTALLATION: string = "AT_CAPACITY_OF_INSTALLATION";

    /**
     * <pre>
     * Leadership
     * Identifies Leadership (ONLY IN DISMOUNTED INDIVIDUAL)
     * Format: Graphic
     * Symbol Set: 27(2525E)
     * Remarks: Determined by SIDC positions 9-10.
     * </pre>
     */
    public static readonly AV_LEADERSHIP: string = "AV_LEADERSHIP";

    /**
     * <pre>
     * Headquarters Element
     * An amplifier that indicates what type of element of a headquarters is being represented, such as TOC, MAIN2.
     * Format: Alphanumeric {0,8}
     * Symbol Set: 10(2525E)
     * Remarks: Location currently undefined
     * </pre>
     */
    public static readonly AW_HEADQUARTERS_ELEMENT: string = "AW_HEADQUARTERS_ELEMENT";

    /**
     * <pre>
     * Installation Composition
     * Indicates the component type of the installation
     * Format: Alphanumeric {3,7}
     * Symbol Set: 20(2525E)
     * Remarks: Location currently undefined
     * List of Values:
     * DEVELOP - Development.
     * RSRCH - Research.
     * PROD - Production.
     * SVC - Service.
     * STORE - Storage.
     * UTIL - Utility.
     * </pre>
     */
    public static readonly AX_INSTALLATION_COMPOSITION: string = "AX_INSTALLATION_COMPOSITION";

    /**
     * <pre>
     * Network Identifier
     * Indicates the network the entity has privileges within.
     * Format: Alphanumeric
     * Symbol Set: undefined
     * Remarks:
     * The colour of the graphic shall be assignable by the operator.
     * Notes: undefined
     * </pre>
     */
    public static readonly AY_NETWORK_IDENTIFIER: string = "AY_NETWORK_IDENTIFIER";

    //public static final String LENGTH = "Length";
    //public static final String WIDTH = "Width";
    //public static final String RADIUS = "Radius";
    //public static final String SEGMENT_DATA = "Segment Data";

    /**
     * Returns an Arraylist of the all the modifiers that appear as labels and are not
     * derived from the symbol code or are external to symbol data like offset indicator.
     * Also includes modifiers that control the shape of a symbol like AM &amp; AN.
     * @return Array<string>
     */
    public static GetModifierList(): Array<string> {
        let list: Array<string> = new Array<string>();

        //list.push(A_SYMBOL_ICON);//graphical, feeds off of symbol code,
        //list.push(B_ECHELON);//graphical, feeds off of symbol code,
        list.push(Modifiers.C_QUANTITY);
        list.push(Modifiers.D_TASK_FORCE_INDICATOR);//graphical, feeds off of symbol code,
        //list.push(E_FRAME_SHAPE_MODIFIER);//symbol frame, feeds off of symbol code, symbol set
        list.push(Modifiers.F_REINFORCED_REDUCED);//R = reinforced, D = reduced, RD = reinforced and reduced
        list.push(Modifiers.G_STAFF_COMMENTS);
        list.push(Modifiers.H_ADDITIONAL_INFO_1);
        list.push(Modifiers.H1_ADDITIONAL_INFO_2);
        list.push(Modifiers.J_EVALUATION_RATING);
        list.push(Modifiers.K_COMBAT_EFFECTIVENESS);
        list.push(Modifiers.L_SIGNATURE_EQUIP);
        list.push(Modifiers.M_HIGHER_FORMATION);
        list.push(Modifiers.N_HOSTILE);
        list.push(Modifiers.P_IFF_SIF_AIS);
        list.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);//number in mils
        //list.push(R_MOBILITY_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.R2_SIGNIT_MOBILITY_INDICATOR);
        //list.push(S_HQ_STAFF_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.T_UNIQUE_DESIGNATION_1);
        list.push(Modifiers.T1_UNIQUE_DESIGNATION_2);
        list.push(Modifiers.V_EQUIP_TYPE);
        list.push(Modifiers.W_DTG_1);
        list.push(Modifiers.W1_DTG_2);
        list.push(Modifiers.X_ALTITUDE_DEPTH);
        list.push(Modifiers.Y_LOCATION);
        list.push(Modifiers.Z_SPEED);

        list.push(Modifiers.AA_SPECIAL_C2_HQ);
        //list.push(AB_FEINT_DUMMY_INDICATOR);//graphical, feeds off of symbol code,
        //list.push(AC_INSTALLATION);//graphical, feeds off of symbol code,
        list.push(Modifiers.AD_PLATFORM_TYPE);
        list.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
        list.push(Modifiers.AF_COMMON_IDENTIFIER);
        //list.push(AG_AUX_EQUIP_INDICATOR);
        list.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
        list.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
        list.push(Modifiers.AJ_SPEED_LEADER);//graphical
        //list.push(AK_PAIRING_LINE);
        //list.push(AL_OPERATIONAL_CONDITION);//2525C ////graphical, feeds off of symbol code, SIDC positions 4
        list.push(Modifiers.AM_DISTANCE);
        list.push(Modifiers.AN_AZIMUTH);
        list.push(Modifiers.AO_ENGAGEMENT_BAR);//2525C
        list.push(Modifiers.AP_TARGET_NUMBER);
        list.push(Modifiers.AP1_TARGET_NUMBER_EXTENSION);
        list.push((Modifiers.AQ_GUARDED_UNIT));
        list.push((Modifiers.AR_SPECIAL_DESIGNATOR));
        //list.push((AS_COUNTRY));


        return list;
    }

    /**
     * Returns an ArrayList of the modifier constants that are determined by the symbol code
     * and therefore don't need their values to be manually typed or selected.
     * (Based on the comments in GetModifierList, GetUnitModifierList, and GetControlMeasureModifierList.)
     * @return Array<string>
     */
    public static GetSymbolCodeModifiersList(): Array<string> {
        let list: Array<string> = new Array();

        list.push(Modifiers.A_SYMBOL_ICON);//graphical, feeds off of symbol code,
        list.push(Modifiers.B_ECHELON);//graphical, feeds off of symbol code,
        list.push(Modifiers.D_TASK_FORCE_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.N_HOSTILE);//textual, feeds off symbol code (gets set to "ENY" if hostile)
        list.push(Modifiers.R_MOBILITY_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.S_HQ_STAFF_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.AG_AUX_EQUIP_INDICATOR);//graphical, feeds off of symbol code,
        list.push(Modifiers.AJ_SPEED_LEADER);//graphical
        list.push(Modifiers.AL_OPERATIONAL_CONDITION);//2525C ////graphical, feeds off of symbol code, SIDC positions 4
        list.push(Modifiers.AS_COUNTRY);//no need to manually enter code as the selector for the code is now implemented
        //list.push(-1); // TODO add missing modifiers (weather, others?) so this nameless default value doesn't get added

        return list;
    }

    /**
     * Returns an Arraylist of the modifier names for units
     * @return Array<string>
     */
    public static GetUnitModifierList(): Array<string> {
        let list: Array<string> = new Array<string>();

        //list.push(ModifierType.A_SYMBOL_ICON);//graphical, feeds off of symbol code, SIDC positions 3, 5-10
        //list.push(ModifierType.B_ECHELON);//graphical, feeds off of symbol code, SIDC positions 11-12
        list.push(Modifiers.C_QUANTITY);
        //list.push(D_TASK_FORCE_INDICATOR);//graphical, feeds off of symbol code, SIDC positions 11-12
        //list.push(E_FRAME_SHAPE_MODIFIER);//symbol frame, feeds off of symbol code, SIDC positions 3-4
        list.push(Modifiers.F_REINFORCED_REDUCED);//R = reinforced, D = reduced, RD = reinforced and reduced
        list.push(Modifiers.G_STAFF_COMMENTS);
        list.push(Modifiers.H_ADDITIONAL_INFO_1);
        //list.push(H1_ADDITIONAL_INFO_2);
        //list.push(H2_ADDITIONAL_INFO_3);
        list.push(Modifiers.J_EVALUATION_RATING);
        list.push(Modifiers.K_COMBAT_EFFECTIVENESS);
        list.push(Modifiers.L_SIGNATURE_EQUIP);
        list.push(Modifiers.M_HIGHER_FORMATION);
        list.push(Modifiers.N_HOSTILE);
        list.push(Modifiers.P_IFF_SIF_AIS);
        list.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);//number in mils
        //list.push(R_MOBILITY_INDICATOR);//graphical, feeds off of symbol code, SIDC positions 11-12
        list.push(Modifiers.R2_SIGNIT_MOBILITY_INDICATOR);
        //list.push(S_HQ_STAFF_OR_OFFSET_INDICATOR);//graphical, feeds off of symbol code, SIDC positions 11-12
        list.push(Modifiers.T_UNIQUE_DESIGNATION_1);
        //list.push(T1_UNIQUE_DESIGNATION_2);
        list.push(Modifiers.V_EQUIP_TYPE);
        list.push(Modifiers.W_DTG_1);
        list.push(Modifiers.W1_DTG_2);
        list.push(Modifiers.X_ALTITUDE_DEPTH);
        list.push(Modifiers.Y_LOCATION);
        list.push(Modifiers.Z_SPEED);

        list.push(Modifiers.AA_SPECIAL_C2_HQ);
        //list.push(AB_FEINT_DUMMY_INDICATOR);//graphical, feeds off of symbol code, SIDC positions 11-12
        //list.push(AC_INSTALLATION);//graphical, feeds off of symbol code, SIDC positions 11-12
        list.push(Modifiers.AD_PLATFORM_TYPE);
        list.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
        list.push(Modifiers.AF_COMMON_IDENTIFIER);
        //list.push(AG_AUX_EQUIP_INDICATOR);//graphical
        //list.push(AH_AREA_OF_UNCERTAINTY);//graphical and on client of renderer
        //list.push(AI_DEAD_RECKONING_TRAILER);//graphical
        list.push(Modifiers.AJ_SPEED_LEADER);
        list.push(Modifiers.AK_PAIRING_LINE);
        //list.push(AL_OPERATIONAL_CONDITION);//2525C ////graphical, feeds off of symbol code, SIDC positions 4
        list.push(Modifiers.AO_ENGAGEMENT_BAR);//2525C
        list.push(Modifiers.AP_TARGET_NUMBER);
        list.push(Modifiers.AP1_TARGET_NUMBER_EXTENSION);
        list.push((Modifiers.AQ_GUARDED_UNIT));
        list.push((Modifiers.AR_SPECIAL_DESIGNATOR));
        list.push((Modifiers.AS_COUNTRY));


        return list;
    }

    /**
     * Returns an Arraylist of the modifiers for Control Measures
     * @return Array<string>
     */
    public static GetControlMeasureModifierList(): Array<string> {
        let list: Array<string> = new Array<string>();

        //list.push(ModifierType.B_ECHELON);//graphical, feeds off of symbol code,
        list.push(Modifiers.C_QUANTITY);
        list.push(Modifiers.H_ADDITIONAL_INFO_1);
        list.push(Modifiers.H1_ADDITIONAL_INFO_2);
        list.push(Modifiers.N_HOSTILE);
        list.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);//number in mils
        //list.push(S2);//graphical, up to renderer client
        list.push(Modifiers.T_UNIQUE_DESIGNATION_1);
        list.push(Modifiers.T1_UNIQUE_DESIGNATION_2);
        list.push(Modifiers.V_EQUIP_TYPE);
        list.push(Modifiers.W_DTG_1);
        list.push(Modifiers.W1_DTG_2);
        list.push(Modifiers.X_ALTITUDE_DEPTH);
        list.push(Modifiers.Y_LOCATION);

        list.push(Modifiers.AM_DISTANCE);
        list.push(Modifiers.AN_AZIMUTH);
        list.push(Modifiers.AP_TARGET_NUMBER);
        list.push(Modifiers.AP1_TARGET_NUMBER_EXTENSION);
        list.push((Modifiers.AS_COUNTRY));




        return list;
    }

    /**
     *
     * @param modifier like Modifiers.C_QUANTITY
     * @return modifier name based on modifier constants
     */
    public static getModifierName(modifier: string): string {
        switch (modifier) {
            case Modifiers.A_SYMBOL_ICON: {
                return "Symbol Icon";
            }

            case Modifiers.B_ECHELON: {
                return "Echelon";
            }

            case Modifiers.C_QUANTITY: {
                return "Quantity";
            }

            case Modifiers.D_TASK_FORCE_INDICATOR: {
                return "Task Force Indicator";
            }

            case Modifiers.F_REINFORCED_REDUCED: {
                return "Reinforce Reduced";
            }

            case Modifiers.G_STAFF_COMMENTS: {
                return "Staff Comments";
            }

            case Modifiers.H_ADDITIONAL_INFO_1: {
                return "Additional Info 1";
            }

            case Modifiers.H1_ADDITIONAL_INFO_2: {
                return "Additional Info 2";
            }

            case Modifiers.J_EVALUATION_RATING: {
                return "Evaluation Rating";
            }

            case Modifiers.K_COMBAT_EFFECTIVENESS: {
                return "Combat Effectiveness";
            }

            case Modifiers.L_SIGNATURE_EQUIP: {
                return "Signature Equipment";
            }

            case Modifiers.M_HIGHER_FORMATION: {
                return "Higher Formation";
            }

            case Modifiers.N_HOSTILE: {
                return "Hostile";
            }

            case Modifiers.P_IFF_SIF_AIS: {
                return "IFF SIF AIS";
            }

            case Modifiers.Q_DIRECTION_OF_MOVEMENT: {
                return "Direction of Movement";
            }

            case Modifiers.R_MOBILITY_INDICATOR: {
                return "Mobility Indicator";
            }

            case Modifiers.R2_SIGNIT_MOBILITY_INDICATOR: {
                return "Signals Intelligence Mobility Indicator";
            }

            case Modifiers.S_HQ_STAFF_INDICATOR: {
                return "HQ Staff";
            }

            case Modifiers.S2_OFFSET_INDICATOR: {
                return "Offset Indicator";
            }

            case Modifiers.T_UNIQUE_DESIGNATION_1: {
                return "Unique Designation 1";
            }

            case Modifiers.T1_UNIQUE_DESIGNATION_2: {
                return "Unique Designation 2";
            }

            case Modifiers.V_EQUIP_TYPE: {
                return "Equipment Type";
            }

            case Modifiers.W_DTG_1: {
                return "Date Time Group 1";
            }

            case Modifiers.W1_DTG_2: {
                return "Date Time Group 2";
            }

            case Modifiers.X_ALTITUDE_DEPTH: {
                return "Altitude Depth";
            }

            case Modifiers.Y_LOCATION: {
                return "Location";
            }

            case Modifiers.Z_SPEED: {
                return "Speed";
            }

            case Modifiers.AA_SPECIAL_C2_HQ: {
                return "Special C2 HQ";
            }

            case Modifiers.AB_FEINT_DUMMY_INDICATOR: {
                return "Feint Dummy Indicator";
            }

            case Modifiers.AD_PLATFORM_TYPE: {
                return "Platform Type";
            }

            case Modifiers.AE_EQUIPMENT_TEARDOWN_TIME: {
                return "Equipment Teardown Time";
            }

            case Modifiers.AF_COMMON_IDENTIFIER: {
                return "Common Identifier";
            }

            case Modifiers.AG_AUX_EQUIP_INDICATOR: {
                return "Auxiliary Equipment Indicator";
            }

            case Modifiers.AH_AREA_OF_UNCERTAINTY: {
                return "Area of Uncertainty";
            }

            case Modifiers.AI_DEAD_RECKONING_TRAILER: {
                return "Dead Reckoning Trailer";
            }

            case Modifiers.AJ_SPEED_LEADER: {
                return "Speed Leader";
            }

            case Modifiers.AK_PAIRING_LINE: {
                return "Pairing Line";
            }

            case Modifiers.AL_OPERATIONAL_CONDITION: {
                return "Operational Condition";
            }

            case Modifiers.AM_DISTANCE: {
                return "Distance";
            }

            case Modifiers.AN_AZIMUTH: {
                return "Azimuth";
            }

            case Modifiers.AO_ENGAGEMENT_BAR: {
                return "Engagement Bar";
            }
            //*/
            case Modifiers.AP_TARGET_NUMBER: {
                return "Target Number";
            }

            case Modifiers.AP1_TARGET_NUMBER_EXTENSION: {
                return "Target Number Extension";
            }

            case Modifiers.AQ_GUARDED_UNIT: {
                return "Guarded Unit";
            }

            case Modifiers.AR_SPECIAL_DESIGNATOR: {
                return "Special Designator";
            }

            case Modifiers.AS_COUNTRY: {
                return "Country";
            }

            default: {
                return "";
            }


        }
    }

    /**
     *
     * @param modifier like Modifiers.C_QUANTITY
     * @return modifier name based on modifier constants
     */
    public static getModifierLetterCode(modifier: string): string {
        switch (modifier) {
            case Modifiers.A_SYMBOL_ICON: {
                return "A";
            }

            case Modifiers.B_ECHELON: {
                return "B";
            }

            case Modifiers.C_QUANTITY: {
                return "C";
            }

            case Modifiers.D_TASK_FORCE_INDICATOR: {
                return "D";
            }

            case Modifiers.F_REINFORCED_REDUCED: {
                return "F";
            }

            case Modifiers.G_STAFF_COMMENTS: {
                return "G";
            }

            case Modifiers.H_ADDITIONAL_INFO_1: {
                return "H";
            }

            case Modifiers.H1_ADDITIONAL_INFO_2: {
                return "H1";
            }

            case Modifiers.J_EVALUATION_RATING: {
                return "J";
            }

            case Modifiers.K_COMBAT_EFFECTIVENESS: {
                return "K";
            }

            case Modifiers.L_SIGNATURE_EQUIP: {
                return "L";
            }

            case Modifiers.M_HIGHER_FORMATION: {
                return "M";
            }

            case Modifiers.N_HOSTILE: {
                return "N";
            }

            case Modifiers.P_IFF_SIF_AIS: {
                return "P";
            }

            case Modifiers.Q_DIRECTION_OF_MOVEMENT: {
                return "Q";
            }

            case Modifiers.R_MOBILITY_INDICATOR: {
                return "R";
            }

            case Modifiers.R2_SIGNIT_MOBILITY_INDICATOR: {
                return "R2";
            }

            case Modifiers.S_HQ_STAFF_INDICATOR: {
                return "S";
            }

            case Modifiers.S2_OFFSET_INDICATOR: {
                return "S2";
            }

            case Modifiers.T_UNIQUE_DESIGNATION_1: {
                return "T";
            }

            case Modifiers.T1_UNIQUE_DESIGNATION_2: {
                return "T1";
            }

            case Modifiers.V_EQUIP_TYPE: {
                return "V";
            }

            case Modifiers.W_DTG_1: {
                return "W";
            }

            case Modifiers.W1_DTG_2: {
                return "W1";
            }

            case Modifiers.X_ALTITUDE_DEPTH: {
                return "X";
            }

            case Modifiers.Y_LOCATION: {
                return "Y";
            }

            case Modifiers.Z_SPEED: {
                return "Z";
            }

            case Modifiers.AA_SPECIAL_C2_HQ: {
                return "AA";
            }

            case Modifiers.AB_FEINT_DUMMY_INDICATOR: {
                return "AB";
            }

            case Modifiers.AD_PLATFORM_TYPE: {
                return "AD";
            }

            case Modifiers.AE_EQUIPMENT_TEARDOWN_TIME: {
                return "AE";
            }

            case Modifiers.AF_COMMON_IDENTIFIER: {
                return "AF";
            }

            case Modifiers.AG_AUX_EQUIP_INDICATOR: {
                return "AG";
            }

            case Modifiers.AH_AREA_OF_UNCERTAINTY: {
                return "AH";
            }

            case Modifiers.AI_DEAD_RECKONING_TRAILER: {
                return "AI";
            }

            case Modifiers.AJ_SPEED_LEADER: {
                return "AJ";
            }

            case Modifiers.AK_PAIRING_LINE: {
                return "AK";
            }

            case Modifiers.AL_OPERATIONAL_CONDITION: {
                return "AL";
            }

            case Modifiers.AM_DISTANCE: {
                return "AM";
            }

            case Modifiers.AN_AZIMUTH: {
                return "AN";
            }

            case Modifiers.AO_ENGAGEMENT_BAR: {
                return "AO";
            }

            case Modifiers.AP_TARGET_NUMBER: {
                return "AP";
            }

            case Modifiers.AP1_TARGET_NUMBER_EXTENSION: {
                return "AP1";
            }

            case Modifiers.AQ_GUARDED_UNIT: {
                return "AQ";
            }

            case Modifiers.AR_SPECIAL_DESIGNATOR: {
                return "AR";
            }

            case Modifiers.AS_COUNTRY: {
                return "AS";
            }

            default: {
                return "";
            }


        }
    }

    /**
     * Returns the description for a modifier constant
     * @param modifier {@link Modifiers}
     * @return 
     */
    public static getModifierDescription(modifier: string): string {
        switch (modifier) {
            case Modifiers.A_SYMBOL_ICON: {
                return "The innermost part of a symbol, comprised of an icon and optional modifiers, that represents a joint military object (see 5.3.4).\n" +
                    "Determined by SIDC positions 11-20.";
            }

            case Modifiers.B_ECHELON: {
                return "A graphic amplifier in a unit symbol that identifies command level (see 5.3.7.1 and table D-III).";
            }

            case Modifiers.C_QUANTITY: {
                return "A text amplifier in an equipment symbol that identifies the number of items present.\n" +
                    "Examples include: \"350 Beds\" or \"50 Gallons\"";
            }

            case Modifiers.D_TASK_FORCE_INDICATOR: {
                return "A graphic amplifier that identifies a unit or activities symbol as a task force (see 5.3.7.2 and figure 13).\n" +
                    "Determined by SIDC position 8.";
            }

            case Modifiers.F_REINFORCED_REDUCED: {
                return "A text modifier in a unit symbol that displays (+) for reinforced, (-) for reduced,(+) reinforced and reduced.\n" +
                    "R = reinforced,D = reduced, RD = reinforced and reduced";
            }

            case Modifiers.G_STAFF_COMMENTS:
            case Modifiers.H_ADDITIONAL_INFO_1: {
                return "A text modifier for units, equipment and installations; content is implementation specific.";
            }

            case Modifiers.H1_ADDITIONAL_INFO_2: {
                return "An alphanumeric text amplifier used to provide an up to a three-character letter field acronym to describe a point that is not already listed.";
            }

            case Modifiers.J_EVALUATION_RATING: {
                return "A text modifier for units, equipment, and installations that consists of\n "
                    + "a one letter reliability rating and a one-number credibility rating.\n"
                    + "Reliability Ratings: A-completely reliable, B-usually reliable,\n "
                    + "C-fairly reliable, D-not usually reliable, E-unreliable,\n "
                    + "F-reliability cannot be judged.\n"
                    + "Credibility Ratings: 1-confirmed by other sources,\n"
                    + "2-probably true, 3-possibly true, 4-doubtfully true,\n"
                    + "5-improbable, 6-truth cannot be judged.\n"
                    + "Example \"A1\"";
            }

            case Modifiers.K_COMBAT_EFFECTIVENESS: {
                return "A text modifier for units and installations that indicates unit effectiveness or installation capability." +
                    "FO - Fully Operational\n" +
                    "SO - Substantially operational\n" +
                    "MO - Marginally operational\n" +
                    "NO - Not operational\n" +
                    "UNK - Unknown";
            }

            case Modifiers.L_SIGNATURE_EQUIP: {
                return "A text modifier for hostile equipment; \"!\" indicates detectable electronic signatures.";
            }

            case Modifiers.M_HIGHER_FORMATION: {
                return "An amplifier for units that indicates number or title of higher echelon command (corps are designated by Roman numerals).";
            }

            case Modifiers.N_HOSTILE: {
                return "An amplifier for equipment; letters \"ENY\" denote hostile symbols." +
                    "Determined by SIDC position 4.";
            }

            case Modifiers.P_IFF_SIF_AIS: {
                return "An amplifier displaying IFF/SIF/AIS Identification modes and codes." +
                    "Alphanumeric - {4,4}\n" +
                    "MODE 1:##, where ## is a two-digit octal number (0-7). The rightmost digit is limited to 0-3.\n" +
                    "[1:##]\n" +
                    "Note: ‘MODE' is not required when displaying.\n" +
                    "Alphanumeric - {6,6}\n" +
                    "MODE 2:####, where #### is a four-digit octal number (0-7).\n" +
                    "[2:####]\n" +
                    "Alphanumeric - {6,6}\n" +
                    "MODE 3:####, where #### is a four-digit octal number (0-7).\n" +
                    "[3:####]\n" +
                    "Alphanumeric - {6,6}\n" +
                    "MODE 5:####, where #### is a 4-digit hexadecimal number (0-F). The leftmost digit is limited from 0 to 3.\n" +
                    "[5:####]\n" +
                    "Alphanumeric - {8,8}\n" +
                    "MODE S:XXXXXX\n" +
                    "[S:XXXXXX]\n" +
                    "Alphanumeric - {x,x}\n" +
                    "AIS IMO:XXXXXX";
            }

            case Modifiers.Q_DIRECTION_OF_MOVEMENT: {
                return "An amplifier consisting of a line with arrow that identifies the direction of movement or intended movement of an object (see 5.3.7.9 and figure 14).\n";
            }

            case Modifiers.R_MOBILITY_INDICATOR: {
                return "An amplifier that depicts the mobility of an object not intrinsic to the entity itself (see 5.3.7.9, figure 14 and table IX).\n" +
                    "Determined by SIDC positions 9-10";
            }

            case Modifiers.R2_SIGNIT_MOBILITY_INDICATOR: {
                return "An amplifier that indicates the mobility of a SIGINT unit." +
                    "List of Values:\n" +
                    "M = Mobile,\n" +
                    "S = Static\n" +
                    "U = Uncertain.";
            }

            case Modifiers.S_HQ_STAFF_INDICATOR: {
                return "An amplifier for units, installations and activities that identifies them as a headquarters (see figure 14 and figure 13).\n" +
                    "Determined by SIDC position 8.";
            }

            case Modifiers.S2_OFFSET_INDICATOR: {
                return "An amplifier used to indicate the offset or precise location of a single point symbol (see 5.3.7.5, 5.3.12, and figure 14).";
            }

            case Modifiers.T_UNIQUE_DESIGNATION_1: {
                return "An amplifier that uniquely identifies a particular symbol or track number. Identifies acquisitions number when used with SIGINT symbology.";
            }

            case Modifiers.T1_UNIQUE_DESIGNATION_2: {
                return "Lines - Second unique identifier for boundaries.\n" +
                    "Lines - Other than phase lines that have a specific purpose, (for example, restrictive fire line RFL),\n " +
                    "   should have the primary purpose labelled on top of the line at both ends of the line inside the\n " +
                    "   lateral boundaries or as often as necessary for clarity.\n" +
                    "Points - Provides the unit servicing the point";
            }

            case Modifiers.V_EQUIP_TYPE: {
                return "An amplifier for equipment that indicates types of equipment.\n" +
                    "Example: " +
                    "AH-64 for Attack Helicopter";
            }

            case Modifiers.W_DTG_1:
            case Modifiers.W1_DTG_2: {
                return "An amplifier for displaying a date-time group (DDHHMMSSZMONYYYY) or (DDHHMMZMMMYYYY) or \"O/O\" for On Order.\n" +
                    "Field \"W\" is used to provide DTG or if used with field \"W1\" the start of a period of time.\n" +
                    "Field \"W1\" is used to provide the end of a period of time.\n" +
                    "The date-time group is composed of a group of six numeric digits with a time zone suffix and the standardized three-letter abbreviation for the month followed by four digits representing the year.\n" +
                    "The first pair of digits represents the day; the second pair, the hour; the third pair, the minutes. For automated systems, two digits may be added before the time zone suffix and after the minutes to designate seconds (see 5.3.7.8).";
            }

            case Modifiers.X_ALTITUDE_DEPTH: {
                return "An amplifier that displays either altitude, flight level, depth for submerged objects or height of equipment or structures on the ground, the minimum, maximum and/or specific altitude (in feet or meters in relation to a reference datum) or depth (for submerged objects in feet below sea level). See 5.3.7.6 for content.";
            }

            case Modifiers.Y_LOCATION: {
                return "An amplifier that displays a symbol's location in degrees, minutes and decimal minutes (or in MGRS, GARS, or other applicable display formats).";
            }

            case Modifiers.Z_SPEED: {
                return "An amplifier that displays velocity (see 5.3.7.7).";
            }

            case Modifiers.AA_SPECIAL_C2_HQ: {
                return "A amplifier that is contained inside the frame in place of the main icon and contains the name of the special C2 Headquarters.";
            }

            case Modifiers.AB_FEINT_DUMMY_INDICATOR: {
                return "An amplifier that identifies an offensive or defensive unit, intended to draw the enemy's attention away from the area of the main attack.\n" +
                    "Determined by SIDC position 8.";
            }

            case Modifiers.AD_PLATFORM_TYPE: {
                return "Electronic intelligence notation (ELNOT) or communications intelligence notation (CENOT)";
            }

            case Modifiers.AE_EQUIPMENT_TEARDOWN_TIME: {
                return "Equipment teardown time in minutes.";
            }

            case Modifiers.AF_COMMON_IDENTIFIER: {
                return "Example: \"Hawk\" for Hawk SAM system.";
            }

            case Modifiers.AG_AUX_EQUIP_INDICATOR: {
                return "Towed sonar array indicator: A graphic modifier for equipment that indicates the presence of a towed sonar array (see 5.3.7.10, figure 13 and table IX).\n" +
                    "Determined by SIDC positions 9-10";
            }

            case Modifiers.AH_AREA_OF_UNCERTAINTY: {
                return "A graphic modifier for units, equipment and installations that indicates the area where an object is most likely to be, based on the object's last report and the reporting accuracy of the sensor that detected the object (see 5.3.7.12.1 and table D-III).";
            }

            case Modifiers.AI_DEAD_RECKONING_TRAILER: {
                return "A graphic amplifier for units and equipment that identifies where an object should be located at present, given its last reported course and speed (see 5.3.7.12.2).";
            }

            case Modifiers.AJ_SPEED_LEADER: {
                return "A graphic amplifier for units, equipment and installations that depicts the speed and direction of movement of an object (see 5.3.7.12.3 and figure 17).";
            }

            case Modifiers.AK_PAIRING_LINE: {
                return "A graphic amplifier for units, equipment and installations that connects two objects and is updated dynamically as the positions of the two objects change (see 5.3.7.12.4 and figure 17).";
            }

            case Modifiers.AL_OPERATIONAL_CONDITION: {
                return "A graphic amplifier for equipment or installations that indicates operational condition or capacity.";
            }

            case Modifiers.AM_DISTANCE: {
                return "An amplifier that displays a minimum, maximum, or a specific distance (range, radius, width, length, etc.), in meters.";
            }

            case Modifiers.AN_AZIMUTH: {
                return "An amplifier that displays an angle measured from true north to any other line in degrees.";
            }

            case Modifiers.AO_ENGAGEMENT_BAR: {
                return "An amplifier placed immediately atop the symbol.\n" +
                    "May denote: 1) local/remote status 2) engagement status 3) weapon type.";
            }

            case Modifiers.AP_TARGET_NUMBER: {
                return "An amplifier used in Fire Support operations to uniquely designate targets in accordance with STANAG 2934.";
            }

            case Modifiers.AP1_TARGET_NUMBER_EXTENSION: {
                return "An amplifier used to identify a target number extension which is a sequentially assigned number identifying the individual elements in a target (MIL-STD-6017),";
            }

            case Modifiers.AQ_GUARDED_UNIT: {
                return "An amplifier used during ballistic missile defense. Some tracks are designated as guarded by a particular unit.";
            }

            case Modifiers.AR_SPECIAL_DESIGNATOR: {
                return "An amplifier that identifies special track designators.";
            }

            case Modifiers.AS_COUNTRY: {
                return "A three-letter code that indicates the country of origin of the organization (US systems shall use GENC).";
            }

            default: {
                return "";
            }


        }
    }

    /**
     * go from "T" or "T1" to integer constant values 9 and 10
     * @param modLetter 
     * @return {@link Modifiers}
     */
    public static getModifierKey(modLetter: string): string | null {
        switch (modLetter) {
            case "A": {
                return Modifiers.A_SYMBOL_ICON;
            }

            case "B": {
                return Modifiers.B_ECHELON;
            }

            case "C": {
                return Modifiers.C_QUANTITY;
            }

            case "D": {
                return Modifiers.D_TASK_FORCE_INDICATOR;
            }

            case "F": {
                return Modifiers.F_REINFORCED_REDUCED;
            }

            case "G": {
                return Modifiers.G_STAFF_COMMENTS;
            }

            case "H": {
                return Modifiers.H_ADDITIONAL_INFO_1;
            }

            case "H1": {
                return Modifiers.H1_ADDITIONAL_INFO_2;
            }

            case "J": {
                return Modifiers.J_EVALUATION_RATING;
            }

            case "K": {
                return Modifiers.K_COMBAT_EFFECTIVENESS;
            }

            case "L": {
                return Modifiers.L_SIGNATURE_EQUIP;
            }

            case "M": {
                return Modifiers.M_HIGHER_FORMATION;
            }

            case "N": {
                return Modifiers.N_HOSTILE;
            }

            case "P": {
                return Modifiers.P_IFF_SIF_AIS;
            }

            case "Q": {
                return Modifiers.Q_DIRECTION_OF_MOVEMENT;
            }

            case "R": {
                return Modifiers.R_MOBILITY_INDICATOR;
            }

            case "R2": {
                return Modifiers.R2_SIGNIT_MOBILITY_INDICATOR;
            }

            case "S": {
                return Modifiers.S_HQ_STAFF_INDICATOR;
            }

            case "S2": {
                return Modifiers.S2_OFFSET_INDICATOR;
            }

            case "T": {
                return Modifiers.T_UNIQUE_DESIGNATION_1;
            }

            case "T1": {
                return Modifiers.T1_UNIQUE_DESIGNATION_2;
            }

            case "V": {
                return Modifiers.V_EQUIP_TYPE;
            }

            case "W": {
                return Modifiers.W_DTG_1;
            }

            case "W1": {
                return Modifiers.W1_DTG_2;
            }

            case "X": {
                return Modifiers.X_ALTITUDE_DEPTH;
            }

            case "Y": {
                return Modifiers.Y_LOCATION;
            }

            case "Z": {
                return Modifiers.Z_SPEED;
            }

            case "AA": {
                return Modifiers.AA_SPECIAL_C2_HQ;
            }

            case "AB": {
                return Modifiers.AB_FEINT_DUMMY_INDICATOR;
            }

            case "AD": {
                return Modifiers.AD_PLATFORM_TYPE;
            }

            case "AE": {
                return Modifiers.AE_EQUIPMENT_TEARDOWN_TIME;
            }

            case "AF": {
                return Modifiers.AF_COMMON_IDENTIFIER;
            }

            case "AG": {
                return Modifiers.AG_AUX_EQUIP_INDICATOR;
            }

            case "AH": {
                return Modifiers.AH_AREA_OF_UNCERTAINTY;
            }

            case "AI": {
                return Modifiers.AI_DEAD_RECKONING_TRAILER;
            }

            case "AJ": {
                return Modifiers.AJ_SPEED_LEADER;
            }

            case "AK": {
                return Modifiers.AK_PAIRING_LINE;
            }

            case "AL": {
                return Modifiers.AL_OPERATIONAL_CONDITION;
            }

            case "AM": {
                return Modifiers.AM_DISTANCE;
            }

            case "AN": {
                return Modifiers.AN_AZIMUTH;
            }

            case "AO": {
                return Modifiers.AO_ENGAGEMENT_BAR;
            }

            case "AP": {
                return Modifiers.AP_TARGET_NUMBER;
            }

            case "AP1": {
                return Modifiers.AP1_TARGET_NUMBER_EXTENSION;
            }

            case "AQ": {
                return Modifiers.AQ_GUARDED_UNIT;
            }

            case "AR": {
                return Modifiers.AR_SPECIAL_DESIGNATOR;
            }

            case "AS": {
                return Modifiers.AS_COUNTRY;
            }

            default: {
                return null;
            }


        }
    }
}

