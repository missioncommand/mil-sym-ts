const SymbolID = C5Ren.SymbolID
const SymbolUtilities = C5Ren.SymbolUtilities
const MSLookup = C5Ren.MSLookup
const MilStdIconRenderer = C5Ren.MilStdIconRenderer
const MilStdAttributes = C5Ren.MilStdAttributes
const RendererSettings = C5Ren.RendererSettings
const MSInfo = C5Ren.MSInfo

const unitTestIDs = ["01110000", "02110000", "05110000", "06110000", "10110000", "11110000", "15110000", "20110000", "30110000", "35110000", "36110000", "40130500", "50110100", "51110100", "52110100", "53110100", "54110100", "60110100"];
const VERSION = SymbolID.Version_2525Dch1;

// Relies on module jszip
async function exportTestImages(filename) {
    const zip = new JSZip();
    let toZip = []

    toZip.push(...createUnitModTestImages());
    toZip.push(...createTGModTestImages());
    toZip.push(...createAffiliationTestImages());
    toZip.push(...createContextTestImages());
    toZip.push(...createStatusTestImages());
    toZip.push(...createAmplifierTestImages());
    toZip.push(...createHQTFDTestImages());
    toZip.push(...createCustomColorTestImages());
    toZip.push(...createSPImages());
    toZip.push(...createSector1TestImages());
    toZip.push(...createSector2TestImages());

    for (const file of toZip) {
        zip.file(file.filename, file.file);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const contentUrl = URL.createObjectURL(content);
    var a = document.createElement("a");
    a.href = contentUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(contentUrl);
    }, 0);
}

function createUnitModTestImages() {
    let res = []
    const modifiers = new Map();
    const attributes = new Map();
    populateModifiersForUnits(modifiers);

    // Mine warfare
    var id = VERSION + "0336272611000000000000000840";
    let modFolder = "Modifiers/No Modifiers/";
    res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id, modifiers, attributes) })

    // Other symbol sets
    for (const basicID of unitTestIDs) {
        if (basicID.startsWith("36"))
            continue;

        id = VERSION + "0300272600000000000000000840";

        id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
        id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));

        msi = MSLookup.getInstance().getMSLInfo(basicID, SymbolID.getVersion(id));
        if (msi.getModifiers().includes(Modifiers.R_MOBILITY_INDICATOR)) {
            id = SymbolID.setAmplifierDescriptor(id, 31);
        } else if (msi.getModifiers().includes(Modifiers.AG_AUX_EQUIP_INDICATOR)) {
            id = SymbolID.setAmplifierDescriptor(id, 61);
        }

        modFolder = "Modifiers/Unit/";
        res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id, modifiers, attributes) });
    }
    return res
}

function createTGModTestImages() {
    let res = []
    modifiers = new Map();
    attributes = new Map();
    populateModifiersForTGs(modifiers);

    const idList = MSLookup.getInstance().getIDList(VERSION);

    // Control measures
    for (const basicID of idList) {
        let id = VERSION + "0325000000000000000000000840";

        if (basicID.size < 8 || !basicID.startsWith("25"))
            continue;

        id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));

        if (SymbolUtilities.isMultiPoint(id) || !canRender(id))
            continue;

        let msi = MSLookup.getInstance().getMSLInfo(basicID, SymbolID.getVersion(id));
        if (msi.getModifiers().length == 0)
            continue;

        let symbolSetFolder = "Modifiers/Control Measure/";
        res.push({ filename: symbolSetFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id, modifiers, attributes) });
    }

    // METOC - no list of modifiers in msd. List of symbols with modifiers made by hand
    for (const basicID of ["45110102", "45110202", "45162200", "45162300"]) {
        id = VERSION + "0345000000000000000000000840";

        id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));

        symbolSetFolder = "Modifiers/Atmospheric/";
        res.push({ filename: symbolSetFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id, modifiers, attributes) });
    }

    return res;
}

function createAffiliationTestImages() {
    let res = []

    // Test units
    modifiers = new Map();
    attributes = new Map();
    modifiers.set(Modifiers.AO_ENGAGEMENT_BAR, "AO:AOA-AO");
    for (const aff of [0, 1, 2, 3, 4, 5, 6]) {
        for (const basicID of unitTestIDs) {
            let id = VERSION + "0000000000000000000000000000";

            id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
            id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
            id = SymbolID.setAffiliation(id, aff);

            let affiliationName = parseAffiliation(aff);
            const modFolder = "Affiliation/" + basicID + "/";
            res.push({ filename: modFolder + affiliationName + ".svg", file: renderAndSave(id, modifiers, attributes) });
        }
    }

    // Test all affiliations for a single control measure to check colors
    for (const aff of [0, 1, 2, 3, 4, 5, 6]) {
        let id = VERSION + "0025000013100300000000000000";

        id = SymbolID.setAffiliation(id, aff);

        let affiliationName = parseAffiliation(aff);
        const symbolSetFolder = "Affiliation/Action Point/";
        res.push({ filename: symbolSetFolder + affiliationName + ".svg", file: renderAndSave(id, modifiers, attributes) });
    }

    // Test all control measures with hostile to check full symbol changes color
    idList = MSLookup.getInstance().getIDList(VERSION);
    for (const basicID of idList) {
        let id = VERSION + "0625000000000000000000000000";

        if (basicID.length < 8 || !basicID.startsWith("25"))
            continue;

        id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));

        if (SymbolUtilities.isMultiPoint(id) || !canRender(id))
            continue;

        const symbolSetFolder = "Affiliation/Hostile Control Measure/";
        res.push({ filename: symbolSetFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id, modifiers, attributes) });
    }
    return res
}

function createContextTestImages() {
    let res = []
    for (const context of [0, 1, 2]) {
        for (const basicID of unitTestIDs) {
            let id = VERSION + "0300000000000000000000000000";

            id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
            id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
            id = SymbolID.setContext(id, context);

            const modFolder = "Context/" + context + " " + parseContext(context) + "/";
            res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
        }
    }

    // Test J and K outside frame for joker and hostile affiliations
    for (const aff of [SymbolID.StandardIdentity_Affiliation_Hostile_Faker, SymbolID.StandardIdentity_Affiliation_Suspect_Joker]) {
        for (const basicID of unitTestIDs) {
            if (basicID.startsWith("50")) // No exercise for unknown frame
                continue;

            let id = VERSION + "1000000000000000000000000000";

            id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
            id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
            id = SymbolID.setAffiliation(id, aff);

            const modFolder = "Context/" + "1 Exercise - " + parseAffiliation(aff) + "/";
            res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
        }
    }
    return res
}

function createStatusTestImages() {
    let res = []
    for (const status of [0, 1, 2, 3, 4, 5]) {
        for (const basicID of unitTestIDs) {
            let id = VERSION + "0300000000000000000000000000";

            id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
            id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
            id = SymbolID.setStatus(id, status);

            let statusName = status + " " + parseStatus(status) + " - " + parseAffiliation(3);

            let msi = MSLookup.getInstance().getMSLInfo(basicID, SymbolID.getVersion(id));
            if (status > 1) {
                if (!(msi.getModifiers().includes(Modifiers.AL_OPERATIONAL_CONDITION))) {
                    if (status == 2)
                        statusName = "2 no operational condition Expected";
                    else
                        continue;
                }
            }

            RendererSettings.getInstance().setOperationalConditionModifierType(RendererSettings.OperationalConditionModifierType_BAR);
            let modFolder = "Status (Bar)/" + statusName + "/";
            res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });

            if (status >= 2 && status <= 4) {
                RendererSettings.getInstance().setOperationalConditionModifierType(RendererSettings.OperationalConditionModifierType_SLASH);
                modFolder = "Status (Slash)/" + statusName + "/";
                res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
            }

            // Test assumed friend with status - want to confirm dotted frame overrides planned frame
            // Also check that dotted frame is there with operational condition
            if (status <= 2) {
                if (status == 2 && !msi.getModifiers().includes(Modifiers.AL_OPERATIONAL_CONDITION))
                    continue;
                id = SymbolID.setStandardIdentity(id, 2);

                statusName = status + " " + parseStatus(status) + " - " + parseAffiliation(2);
                modFolder = "Assumed friend Status/" + statusName + "/";
                res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
            }
        }
    }
    return res
}

function createAmplifierTestImages() {
    let res = []
    for (const amp of [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 51, 52, 61, 62]) {
        for (const basicID of unitTestIDs) {
            let id = VERSION + "0300000000000000000000000000";

            id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
            id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
            id = SymbolID.setAmplifierDescriptor(id, amp);

            let ampName = amp + " " + parseAmp(amp);

            let msi = MSLookup.getInstance().getMSLInfo(basicID, SymbolID.getVersion(id));

            if (amp < 30) {
                // echelon
                if (!msi.getModifiers().includes(Modifiers.B_ECHELON)) {
                    if (amp == 11) {
                        // Confirm not added
                        ampName = "11 no echelon expected";
                    } else {
                        continue;
                    }
                }
            } else if (amp < 60) {
                // mobility indicator
                if (!(msi.getModifiers().includes(Modifiers.R_MOBILITY_INDICATOR))) {
                    if (amp == 31) {
                        // Confirm not added
                        ampName = "31 no mobility expected";
                    } else {
                        continue;
                    }
                }
            } else {
                // auxiliary equipment indicator
                if (!msi.getModifiers().includes(Modifiers.AG_AUX_EQUIP_INDICATOR)) {
                    if (amp == 61) {
                        // Confirm not added
                        ampName = "61 no tow array expected";
                    } else {
                        continue;
                    }
                }
            }
            const modFolder = "Amplifier/" + ampName + "/";
            res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
        }
    }
    return res
}

function createHQTFDTestImages() {
    let res = []
    for (const HQTFD of [0, 1, 2, 3, 4, 5, 6, 7]) {
        for (const basicID of unitTestIDs) {
            let id = VERSION + "0300000000000000000000000000";

            id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
            id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
            id = SymbolID.setHQTFD(id, HQTFD);

            let HQTFDName = HQTFD + " " + parseHQTFD(HQTFD);

            let msi = MSLookup.getInstance().getMSLInfo(basicID, SymbolID.getVersion(id));
            let HQTFD_bin = (HQTFD >>> 0).toString(2); // Convert to binary
            if (HQTFD > 0) {
                if (!(msi.getModifiers().includes(Modifiers.D_TASK_FORCE_INDICATOR)
                    || msi.getModifiers().includes(Modifiers.AB_FEINT_DUMMY_INDICATOR)
                    || msi.getModifiers().includes(Modifiers.S_HQ_STAFF_INDICATOR))) {
                    if (HQTFD == 7)
                        // Confirm not added
                        HQTFDName = "7 no HQTFD expected";
                    else
                        continue;
                } else if (HQTFD_bin.charAt(HQTFD_bin.length - 1) == '1'
                    && !msi.getModifiers().includes(Modifiers.AB_FEINT_DUMMY_INDICATOR)) {
                    continue;
                } else if (HQTFD >= 2 && HQTFD_bin.charAt(HQTFD_bin.length - 2) == '1'
                    && !msi.getModifiers().includes(Modifiers.S_HQ_STAFF_INDICATOR)) {
                    continue;
                } else if (HQTFD >= 4 && !msi.getModifiers().includes(Modifiers.D_TASK_FORCE_INDICATOR)) {
                    continue;
                }
            }

            modFolder = "HQTFD/" + HQTFDName + "/";
            res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
        }
    }
    return res
}

function createSector1TestImages() {
    let res = []
    let sector1Mods = new Map();
    sector1Mods.set("01", 41);
    sector1Mods.set("02", 8);
    sector1Mods.set("05", 7);
    sector1Mods.set("06", 3);
    sector1Mods.set("10", 98);
    sector1Mods.set("11", 26);
    sector1Mods.set("15", 24);
    sector1Mods.set("20", 14);
    sector1Mods.set("25", 50);
    sector1Mods.set("30", 25);
    sector1Mods.set("35", 22);
    sector1Mods.set("36", -1);
    sector1Mods.set("40", 20);
    sector1Mods.set("45", -1);
    sector1Mods.set("46", -1);
    sector1Mods.set("47", -1);
    sector1Mods.set("50", -1); // No need to test all sigint
    sector1Mods.set("51", 65);
    sector1Mods.set("52", -1); // No need to test all sigint
    sector1Mods.set("53", -1); // No need to test all sigint
    sector1Mods.set("54", -1); // No need to test all sigint
    sector1Mods.set("60", -1);

    for (const basicID of unitTestIDs) {
        if (sector1Mods.get(basicID.substring(0, 2)) > 0)
            for (const sector1Mod of Array(1 + sector1Mods.get(basicID.substring(0, 2))).keys()) {
                let id = VERSION + "0300000000000000000000000000";

                id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
                id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
                id = SymbolID.setModifier1(id, sector1Mod);

                const modFolder = "Sector Mods/" + basicID + "/";
                res.push({ filename: modFolder + SymbolID.getMod1ID(id) + ".svg", file: renderAndSave(id) });
            }
    }

    // Static Depiction
    for (const sector1Mod of Array.from(new Array(1 + 50 - 13), (x, i) => i + 13)) {
        let id = VERSION + "0325000027070100000000000000";
        id = SymbolID.setModifier1(id, sector1Mod);

        const modFolder = "Sector Mods/" + SymbolUtilities.getBasicSymbolID(id) + "/";
        res.push({ filename: modFolder + SymbolID.getMod1ID(id) + ".svg", file: renderAndSave(id) });

    }
    return res
}

function createSector2TestImages() {
    let res = []
    let sector2Mods = new Map();
    sector2Mods.set("01", 12);
    sector2Mods.set("02", 16);
    sector2Mods.set("05", 5);
    sector2Mods.set("06", 15);
    sector2Mods.set("10", 78);
    sector2Mods.set("11", 2);
    sector2Mods.set("15", 9);
    sector2Mods.set("20", 9);
    sector2Mods.set("25", -1);
    sector2Mods.set("30", 16);
    sector2Mods.set("35", 17);
    sector2Mods.set("36", -1);
    sector2Mods.set("40", 2);
    sector2Mods.set("45", -1);
    sector2Mods.set("46", -1);
    sector2Mods.set("47", -1);
    sector2Mods.set("50", -1); // No need to test all sigint
    sector2Mods.set("51", 1);
    sector2Mods.set("52", -1); // No need to test all sigint
    sector2Mods.set("53", -1); // No need to test all sigint
    sector2Mods.set("54", -1); // No need to test all sigint
    sector2Mods.set("60", -1);

    for (const basicID of unitTestIDs) {
        if (sector2Mods.get(basicID.substring(0, 2)) > 0)
            for (const sector2Mod of Array(1 + sector2Mods.get(basicID.substring(0, 2))).keys()) {
                let id = VERSION + "0300000000000000000000000000";

                id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
                id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));
                id = SymbolID.setModifier2(id, sector2Mod);

                modFolder = "Sector Mods/" + basicID + "/";
                res.push({ filename: modFolder + SymbolID.getMod2ID(id) + ".svg", file: renderAndSave(id) });
            }
    }
    return res
}

function createCustomColorTestImages() {
    let res = []
    modifiers = new Map();
    attributes = new Map();
    populateModifiersForUnits(modifiers);
    attributes.set(MilStdAttributes.TextColor, "00FFFF");
    attributes.set(MilStdAttributes.LineColor, "FF00FF");
    attributes.set(MilStdAttributes.FillColor, "FFFF00");
    attributes.set(MilStdAttributes.EngagementBarColor, "0000FF");

    for (const basicID of unitTestIDs) {
        let id = VERSION + "0300272600000000000000000840";
        id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
        id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));

        let msi = MSLookup.getInstance().getMSLInfo(basicID, SymbolID.getVersion(id));
        if (msi.getModifiers().includes(Modifiers.R_MOBILITY_INDICATOR)) {
            id = SymbolID.setAmplifierDescriptor(id, 31);
        } else if (msi.getModifiers().includes(Modifiers.AG_AUX_EQUIP_INDICATOR)) {
            id = SymbolID.setAmplifierDescriptor(id, 61);
        }

        modFolder = "Custom Color/Unit/";
        res.push({ filename: modFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id, modifiers, attributes) });
    }
    return res
}

function createSPImages() {
    let res = []
    let idList = MSLookup.getInstance().getIDList(VERSION);

    for (const basicID of idList) {
        let id = VERSION + "0300000000000000000000000000";

        if (basicID.length < 8)
            continue;

        id = SymbolID.setEntityCode(id, Number.parseInt(basicID.substring(2)));
        id = SymbolID.setSymbolSet(id, Number.parseInt(basicID.substring(0, 2)));

        if (SymbolUtilities.isMultiPoint(id) || !canRender(id))
            continue;

        let symbolSetName = MSInfo.parseSymbolSetName(id);

        let symbolSetFolder = "svg/" + symbolSetName + "/";
        res.push({ filename: symbolSetFolder + SymbolID.getMainIconID(id) + ".svg", file: renderAndSave(id) });
    }
    return res
}

function renderAndSave(id, modifiers = new Map(), attributes = new Map()) {
    attributes.set(MilStdAttributes.PixelSize, "256");
    mir = MilStdIconRenderer.getInstance();

    if (!mir.CanRender(id, attributes))
        console.error("CanRender() false: " + id);
    ii = mir.RenderSVG(id, modifiers, attributes);

    return new Blob([ii.getSVG()], { type: "image/svg+xml" });
}

function populateModifiersForUnits(modifiers) {
    modifiers.set(Modifiers.H_ADDITIONAL_INFO_1, "Hj");
    modifiers.set(Modifiers.H1_ADDITIONAL_INFO_2, "H1");
    modifiers.set(Modifiers.X_ALTITUDE_DEPTH, "X");//X
    modifiers.set(Modifiers.K_COMBAT_EFFECTIVENESS, "K");//K
    modifiers.set(Modifiers.Q_DIRECTION_OF_MOVEMENT, "45");//Q
    modifiers.set(Modifiers.W_DTG_1, SymbolUtilities.getDateLabel(new Date()));//W
    modifiers.set(Modifiers.W1_DTG_2, SymbolUtilities.getDateLabel(new Date()));//W1
    modifiers.set(Modifiers.J_EVALUATION_RATING, "J");
    modifiers.set(Modifiers.M_HIGHER_FORMATION, "M");
    modifiers.set(Modifiers.N_HOSTILE, "ENY");
    modifiers.set(Modifiers.P_IFF_SIF_AIS, "P");
    modifiers.set(Modifiers.Y_LOCATION, "Yj");
    modifiers.set(Modifiers.C_QUANTITY, "C");
    modifiers.set(Modifiers.F_REINFORCED_REDUCED, "RD");
    modifiers.set(Modifiers.L_SIGNATURE_EQUIP, "!");
    modifiers.set(Modifiers.AA_SPECIAL_C2_HQ, "AA");
    modifiers.set(Modifiers.G_STAFF_COMMENTS, "Gj");
    modifiers.set(Modifiers.V_EQUIP_TYPE, "Vj");
    modifiers.set(Modifiers.T_UNIQUE_DESIGNATION_1, "Tj");
    modifiers.set(Modifiers.T1_UNIQUE_DESIGNATION_2, "T1");
    modifiers.set(Modifiers.Z_SPEED, "999");//Z
    modifiers.set(Modifiers.R2_SIGNIT_MOBILITY_INDICATOR, "2");
    modifiers.set(Modifiers.AD_PLATFORM_TYPE, "AD");
    modifiers.set(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME, "AE");
    modifiers.set(Modifiers.AF_COMMON_IDENTIFIER, "AF");
    modifiers.set(Modifiers.AO_ENGAGEMENT_BAR, "AO:AOA-AO");
    modifiers.set(Modifiers.AR_SPECIAL_DESIGNATOR, "AR");
    modifiers.set(Modifiers.AQ_GUARDED_UNIT, "AQ");
    modifiers.set(Modifiers.AS_COUNTRY, "AS");
}

function populateModifiersForTGs(modifiers) {
    modifiers.set(Modifiers.H_ADDITIONAL_INFO_1, "H");
    modifiers.set(Modifiers.H1_ADDITIONAL_INFO_2, "H1");
    modifiers.set(Modifiers.X_ALTITUDE_DEPTH, "X");//X
    modifiers.set(Modifiers.Q_DIRECTION_OF_MOVEMENT, "45");//Q
    modifiers.set(Modifiers.W_DTG_1, SymbolUtilities.getDateLabel(new Date()));//W
    modifiers.set(Modifiers.W1_DTG_2, SymbolUtilities.getDateLabel(new Date()));//W1
    modifiers.set(Modifiers.N_HOSTILE, "ENY");
    modifiers.set(Modifiers.Y_LOCATION, "Y");
    modifiers.set(Modifiers.C_QUANTITY, "C");
    modifiers.set(Modifiers.L_SIGNATURE_EQUIP, "!");
    modifiers.set(Modifiers.V_EQUIP_TYPE, "V");
    modifiers.set(Modifiers.T_UNIQUE_DESIGNATION_1, "T");
    modifiers.set(Modifiers.T1_UNIQUE_DESIGNATION_2, "T1");
    modifiers.set(Modifiers.AP_TARGET_NUMBER, "AP");
    modifiers.set(Modifiers.AP1_TARGET_NUMBER_EXTENSION, "AP1");
}

function canRender(symbolID) {
    return MilStdIconRenderer.getInstance().CanRender(symbolID, null)
}

function parseAffiliation(affiliation) {
    switch (affiliation) {
        case SymbolID.StandardIdentity_Affiliation_Pending:
            return "Pending";
        case SymbolID.StandardIdentity_Affiliation_Unknown:
            return "Unknown";
        case SymbolID.StandardIdentity_Affiliation_AssumedFriend:
            return "Assumed Friend";
        case SymbolID.StandardIdentity_Affiliation_Friend:
            return "Friend";
        case SymbolID.StandardIdentity_Affiliation_Neutral:
            return "Neutral";
        case SymbolID.StandardIdentity_Affiliation_Suspect_Joker:
            return "Suspect";
        case SymbolID.StandardIdentity_Affiliation_Hostile_Faker:
            return "Hostile";
        default:
            return "UNKNOWN";
    }
}

function parseContext(context) {
    switch (context) {
        case SymbolID.StandardIdentity_Context_Reality:
            return "Reality";
        case SymbolID.StandardIdentity_Context_Exercise:
            return "Exercise";
        case SymbolID.StandardIdentity_Context_Simulation:
            return "Simulation";
        default:
            return "UNKNOWN";
    }
}

function parseStatus(status) {
    switch (status) {
        case SymbolID.Status_Present:
            return "Present";
        case SymbolID.Status_Planned_Anticipated_Suspect:
            return "Planned";
        case SymbolID.Status_Present_FullyCapable:
            return "Fully capable";
        case SymbolID.Status_Present_Damaged:
            return "Damaged";
        case SymbolID.Status_Present_Destroyed:
            return "Destroyed";
        case SymbolID.Status_Present_FullToCapacity:
            return "Full to capacity";
        default:
            return "UNKNOWN";
    }
}

function parseHQTFD(HQTFD) {
    switch (HQTFD) {
        case SymbolID.HQTFD_Unknown:
            return "Unknown";
        case SymbolID.HQTFD_FeintDummy:
            return "Dummy";
        case SymbolID.HQTFD_Headquarters:
            return "Headquarters";
        case SymbolID.HQTFD_FeintDummy_Headquarters:
            return "Dummy Headquarters";
        case SymbolID.HQTFD_TaskForce:
            return "Task Force";
        case SymbolID.HQTFD_FeintDummy_TaskForce:
            return "Dummy Task Force";
        case SymbolID.HQTFD_TaskForce_Headquarters:
            return "Task Force Headquarters";
        case SymbolID.HQTFD_FeintDummy_TaskForce_Headquarters:
            return "Dummy Task Force Headquarters";
        default:
            return "UNKNOWN";
    }
}

function parseAmp(amp) {
    switch (amp) {
        case SymbolID.Echelon_Team_Crew:
            return "Team";
        case SymbolID.Echelon_Squad:
            return "Squad";
        case SymbolID.Echelon_Section:
            return "Section";
        case SymbolID.Echelon_Platoon_Detachment:
            return "Platoon";
        case SymbolID.Echelon_Company_Battery_Troop:
            return "Company";
        case SymbolID.Echelon_Battalion_Squadron:
            return "Battalion";
        case SymbolID.Echelon_Regiment_Group:
            return "Regiment";
        case SymbolID.Echelon_Brigade:
            return "Brigade";
        case SymbolID.Echelon_Division:
            return "Division";
        case SymbolID.Echelon_Corps_MEF:
            return "Corps";
        case SymbolID.Echelon_Army:
            return "Army";
        case SymbolID.Echelon_ArmyGroup_Front:
            return "Army Group";
        case SymbolID.Echelon_Region_Theater:
            return "Region";
        case SymbolID.Echelon_Region_Command:
            return "Command";
        case SymbolID.Mobility_WheeledLimitedCrossCountry:
            return "Wheeled limited cross country";
        case SymbolID.Mobility_WheeledCrossCountry:
            return "Wheeled cross country";
        case SymbolID.Mobility_Tracked:
            return "Tracked";
        case SymbolID.Mobility_Wheeled_Tracked:
            return "Wheeled and tracked combination";
        case SymbolID.Mobility_Towed:
            return "Towed";
        case SymbolID.Mobility_Rail:
            return "Rail";
        case SymbolID.Mobility_PackAnimals:
            return "Pack animals";
        case SymbolID.Mobility_OverSnow:
            return "Over snow";
        case SymbolID.Mobility_Sled:
            return "Sled";
        case SymbolID.Mobility_Barge:
            return "Barge";
        case SymbolID.Mobility_Amphibious:
            return "Amphibious";
        case SymbolID.Mobility_ShortTowedArray:
            return "Short towed array";
        case SymbolID.Mobility_LongTowedArray:
            return "Long towed Array";
        default:
            return "UNKNOWN";
    }
}