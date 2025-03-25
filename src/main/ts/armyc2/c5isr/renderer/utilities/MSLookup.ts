import { Modifiers } from "../../renderer/utilities/Modifiers"
import { MSInfo } from "../../renderer/utilities/MSInfo"
import { SymbolID } from "../../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities"
import { ErrorLogger } from "./ErrorLogger";
import { LogLevel } from "./LogLevel";
import { RendererUtilities } from "./RendererUtilities";

/**
 * Class that holds all the  objects with symbol information
 */
export class MSLookup {

    private static mse: any;
    private static msd: any;
    private static _instance: MSLookup;
    private static _initCalled: boolean = false;
    private static _isReady: boolean = false;

    private static _MSLookupD: Map<string, MSInfo>;
    private static _MSLookupE: Map<string, MSInfo>;
    //private TAG: string = "MSLookup";
    private _IDListD: Array<string> = [];
    private _IDListE: Array<string> = [];
    private static msdJSON:string = "/msd.json";
    private static mseJSON:string = "/mse.json";

    public static async loadData(location?:string)
    {
        let pathd:string = MSLookup.msdJSON;//String(msdj);
        let pathe:string = MSLookup.mseJSON;//String(msej);
        if(location)
        {
            pathd = location + pathd.substring(pathd.lastIndexOf('/')+1,pathd.length);
            pathe = location + pathe.substring(pathe.lastIndexOf('/')+1,pathe.length);
        }

        let promises:Array<Promise<any>> = new Array<Promise<any>>()
        
        promises.push(RendererUtilities.getData(pathd));
        promises.push(RendererUtilities.getData(pathe));// RendererUtilities.getData(String(svgd)).then(function(result){this.genc = result;this.init();});
        await Promise.all(promises).then(values => {MSLookup.msd = values[0];MSLookup.mse = values[1];}).catch(error => {throw error;})//*/

        /*let promises:Array<Promise<any>> = new Array<Promise<any>>()
        
        promises.push(RendererUtilities.getData(String(msdj)));
        promises.push(RendererUtilities.getData(String(msej)));// RendererUtilities.getData(String(svgd)).then(function(result){this.genc = result;this.init();});
        await Promise.all(promises).then(values => {MSLookup.msd = values[0];MSLookup.mse = values[1];}).catch(error => {throw error;})//*/
    }
    /*
     * Holds SymbolDefs for all symbols. (basicSymbolID, Description, MinPoint, MaxPoints, etc...) Call
     * getInstance().
     *
     */
    private constructor() 
    {
        this.init();
    }

    public static getInstance(): MSLookup {
        if (!MSLookup._instance) {
            MSLookup._instance = new MSLookup();
        }
        return MSLookup._instance;
    }

    private init(): void {
        if (MSLookup._initCalled === false) {
            MSLookup._initCalled = true;
            MSLookup._MSLookupD = new Map();
            MSLookup._MSLookupE = new Map();
            this._IDListD = new Array();
            this._IDListE = new Array();

            try 
            {
                this.populateLookup(SymbolID.Version_2525Dch1);
                this.populateLookup(SymbolID.Version_2525E);
                if(this._IDListD.length > 0 && this._IDListE.length > 0)
                    MSLookup._isReady = true;
                
            } catch (e) {
                if (e instanceof Error) {
                    console.log(e.message);
                } else {
                    throw e;
                }
            }
        }
    }

    public isReady():boolean
    {
        return MSLookup._isReady;
    }

    private async populateLookup(version: number) {
        let lookup: Map<string, MSInfo>;
        let list: Array<string>;
        type JSONSymbol = {
            ss: string;
            e: string;
            et: string;
            est: string;
            code: string;
            geometry?: string;
            drawRules?: string;
            modifiers?: string;
            aux1?: string;
        }

        try {
            let msJSON: JSONSymbol[];
            if (version === SymbolID.Version_2525E) {
                lookup = MSLookup._MSLookupE;
                list = this._IDListE;
                msJSON = MSLookup.mse["mse"]["SYMBOL"]
            } else {
                lookup = MSLookup._MSLookupD;
                list = this._IDListD;
                msJSON = MSLookup.msd["msd"]["SYMBOL"]
            }

            let ss: string = ""
            for (let JSONSymbol of msJSON) {
                if (JSONSymbol.code.length != 6) {
                    JSONSymbol.code = "000000";
                }
                if (JSONSymbol.ss !== "") {
                    ss = JSONSymbol.ss;
                }

                if (JSONSymbol.code !== "000000") {
                    let id = ss + JSONSymbol.code;
                    if (JSONSymbol.geometry || JSONSymbol.drawRules) {//Control Measures and METOCS
                        let modifiers: string[] | null = null;
                        if (JSONSymbol.modifiers && JSONSymbol.modifiers !== "") {
                            modifiers = JSONSymbol.modifiers.split(",");
                        }

                        let g: string = JSONSymbol.geometry || "";
                        let dr: string = JSONSymbol.drawRules || "";
                        lookup.set(id, new MSInfo(version, ss, JSONSymbol.e, JSONSymbol.et, JSONSymbol.est, JSONSymbol.code, g, dr, this.populateModifierList(modifiers)));
                    } else {//Everything else
                        //_MSLookupD.set(id, new MSInfo(ss, e, et, est, ec));
                        lookup.set(id, new MSInfo(version, ss, JSONSymbol.e, JSONSymbol.et, JSONSymbol.est, JSONSymbol.code, this.populateModifierList(ss, JSONSymbol.code, version)));
                    }
                    list.push(id);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                console.log(exc.message);
            } else {
                throw exc;
            }
        }
    }

    private populateModifierList(modifiers: string[] | null): Array<string>;

    private populateModifierList(symbolSet: string, ec: string, version: number): Array<string>;
    private populateModifierList(...args: unknown[]): Array<string> {
        switch (args.length) {
            case 1: {
                const [modifiers] = args as [string[]];

                let mods: Array<string> = new Array<string>();
                if (modifiers != null && modifiers.length > 0) {
                    for (let mod of modifiers) {
                        mods.push(Modifiers.getModifierKey(mod));
                    }
                }
                return mods;
            }

            case 3: {
                const [symbolSet, ec, version] = args as [string, string, number];

                let ss: number = parseInt(symbolSet);
                let modifiers: Array<string> = new Array<string>();

                if (version >= SymbolID.Version_2525E) {
                    switch (ss) {
                        case SymbolID.SymbolSet_LandUnit:
                        case SymbolID.SymbolSet_LandCivilianUnit_Organization: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
                            modifiers.push(Modifiers.D_TASK_FORCE_INDICATOR);
                            modifiers.push(Modifiers.F_REINFORCED_REDUCED);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.L_SIGNATURE_EQUIP);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.S_HQ_STAFF_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            if (ss === SymbolID.SymbolSet_LandUnit && ec === "110000") {

                                modifiers.push(Modifiers.AA_SPECIAL_C2_HQ);
                            }

                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_LandEquipment:
                        case SymbolID.SymbolSet_SignalsIntelligence: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.L_SIGNATURE_EQUIP);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.N_HOSTILE);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.R_MOBILITY_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AG_AUX_EQUIP_INDICATOR);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            break;
                        }

                        case SymbolID.SymbolSet_LandInstallation: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.S_HQ_STAFF_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            //modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_DismountedIndividuals: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            modifiers.push(Modifiers.AV_LEADERSHIP);
                            break;
                        }

                        case SymbolID.SymbolSet_Space:
                        case SymbolID.SymbolSet_SpaceMissile: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_Air:
                        case SymbolID.SymbolSet_AirMissile: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_SeaSurface: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_SeaSubsurface: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_Activities: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_CyberSpace: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
                            modifiers.push(Modifiers.D_TASK_FORCE_INDICATOR);
                            modifiers.push(Modifiers.F_REINFORCED_REDUCED);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.L_SIGNATURE_EQUIP);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.S_HQ_STAFF_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        /*case SymbolID.SymbolSet_SignalsIntelligence_Air:
                        case SymbolID.SymbolSet_SignalsIntelligence_Land:
                        case SymbolID.SymbolSet_SignalsIntelligence_SeaSurface:
                        case SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface:
                        case SymbolID.SymbolSet_SignalsIntelligence_Space:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.D_TASK_FORCE_INDICATOR);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.R2_SIGNIT_MOBILITY_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W1_DTG_2);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);//like equipment
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);//like equipment
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);//like equipment
                            break;*/

                        case SymbolID.SymbolSet_ControlMeasure: {
                            //values come from files during MSLookup load
                            break;
                        }

                        case SymbolID.SymbolSet_Atmospheric: {
                            //Tropopause low, Tropopause high
                            if ((ec === "110102") || (ec === "110202") ||
                                (ec === "162200")) {

                                modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            }

                            else {
                                if (ec === "140200") {

                                    modifiers.push(Modifiers.AN_AZIMUTH);
                                }

                            }

                            break;
                        }

                        case SymbolID.SymbolSet_MineWarfare:
                        case SymbolID.SymbolSet_Oceanographic:
                        case SymbolID.SymbolSet_MeteorologicalSpace:
                        default://no modifiers

                    }
                }
                else {
                    switch (ss) {
                        case SymbolID.SymbolSet_LandUnit:
                        case SymbolID.SymbolSet_LandCivilianUnit_Organization: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
                            modifiers.push(Modifiers.D_TASK_FORCE_INDICATOR);
                            modifiers.push(Modifiers.F_REINFORCED_REDUCED);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.S_HQ_STAFF_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            if (ss === SymbolID.SymbolSet_LandUnit && ec === "110000") {

                                modifiers.push(Modifiers.AA_SPECIAL_C2_HQ);
                            }

                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_LandEquipment:
                        case SymbolID.SymbolSet_SignalsIntelligence_Land: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.L_SIGNATURE_EQUIP);
                            modifiers.push(Modifiers.N_HOSTILE);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.R_MOBILITY_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AG_AUX_EQUIP_INDICATOR);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            break;
                        }

                        case SymbolID.SymbolSet_LandInstallation: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.S_HQ_STAFF_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            break;
                        }

                        case SymbolID.SymbolSet_Space:
                        case SymbolID.SymbolSet_SpaceMissile:
                        case SymbolID.SymbolSet_SignalsIntelligence_Space: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            break;
                        }

                        case SymbolID.SymbolSet_Air:
                        case SymbolID.SymbolSet_AirMissile:
                        case SymbolID.SymbolSet_SignalsIntelligence_Air: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);//air only
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            break;
                        }

                        case SymbolID.SymbolSet_SeaSurface:
                        case SymbolID.SymbolSet_SignalsIntelligence_SeaSurface: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            break;
                        }

                        case SymbolID.SymbolSet_SeaSubsurface:
                        case SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.AG_AUX_EQUIP_INDICATOR);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            break;
                        }

                        case SymbolID.SymbolSet_Activities: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_CyberSpace: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
                            modifiers.push(Modifiers.D_TASK_FORCE_INDICATOR);
                            modifiers.push(Modifiers.F_REINFORCED_REDUCED);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
                            modifiers.push(Modifiers.L_SIGNATURE_EQUIP);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.S_HQ_STAFF_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        /*case SymbolID.SymbolSet_SignalsIntelligence_Air:
                        case SymbolID.SymbolSet_SignalsIntelligence_Land:
                        case SymbolID.SymbolSet_SignalsIntelligence_SeaSurface:
                        case SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface:
                        case SymbolID.SymbolSet_SignalsIntelligence_Space:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.D_TASK_FORCE_INDICATOR);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.M_HIGHER_FORMATION);
                            modifiers.push(Modifiers.R2_SIGNIT_MOBILITY_INDICATOR);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W1_DTG_2);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);//like equipment
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);//like equipment
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);//like equipment
                            break;*/

                        case SymbolID.SymbolSet_ControlMeasure: {
                            //values come from files during MSLookup load
                            break;
                        }

                        case SymbolID.SymbolSet_Atmospheric: {
                            //Tropopause low, Tropopause high
                            if ((ec === "110102") || (ec === "110202") ||
                                (ec === "162200")) {
                                modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            } else {
                                if (ec === "140200") {
                                    modifiers.push(Modifiers.AN_AZIMUTH);
                                }

                            }

                            break;
                        }

                        case SymbolID.SymbolSet_MineWarfare:
                        case SymbolID.SymbolSet_Oceanographic:
                        case SymbolID.SymbolSet_MeteorologicalSpace:
                        default://no modifiers

                    }
                }

                if (ss === SymbolID.SymbolSet_SignalsIntelligence_Air ||
                    ss === SymbolID.SymbolSet_SignalsIntelligence_Land ||
                    ss === SymbolID.SymbolSet_SignalsIntelligence_SeaSurface ||
                    ss === SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface ||
                    ss === SymbolID.SymbolSet_SignalsIntelligence_Space) {

                    modifiers.push(Modifiers.R2_SIGNIT_MOBILITY_INDICATOR);
                }

                return modifiers;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * @param symbolID Full 20-30 digits from the symbol code
     * @return 
     */
    public getMSLInfo(symbolID: string): MSInfo;

    /**
     * @param basicID id SymbolSet + Entity code like 50110100
     * @param version like SymbolID.Version_2525Dch1
     * @return 
     */
    public getMSLInfo(basicID: string, version: number): MSInfo;
    public getMSLInfo(...args: unknown[]): MSInfo | null {
        switch (args.length) {
            case 1: {
                const [symbolID] = args as [string];

                let length: number = symbolID.length;

                if (length >= 20 && length <= 30) {
                    let version: number = SymbolID.getVersion(symbolID);
                    return this.getMSLInfo(SymbolUtilities.getBasicSymbolID(symbolID), version);
                } else {
                    return null;
                }
            }

            case 2: {
                const [basicID, version] = args as [string, number];

                let length: number = basicID.length;
                if (length === 8) {
                    if (version < SymbolID.Version_2525E) {
                        return MSLookup._MSLookupD.get(basicID) || null;
                    } else if (version === SymbolID.Version_2525E) {
                        return MSLookup._MSLookupE.get(basicID) || null;
                    } else {
                        return MSLookup._MSLookupD.get(basicID) || null;
                    }
                } else {
                    if (length >= 20 && length <= 30)//probably got a full id instead of a basic ID.
                    {
                        if (version < SymbolID.Version_2525E) {
                            return MSLookup._MSLookupD.get(SymbolUtilities.getBasicSymbolID(basicID)) || null;
                        } else if (version === SymbolID.Version_2525E) {
                            return MSLookup._MSLookupE.get(SymbolUtilities.getBasicSymbolID(basicID)) || null;
                        } else {
                            return MSLookup._MSLookupD.get(SymbolUtilities.getBasicSymbolID(basicID)) || null;
                        }
                    } else {
                        return null;
                    }
                }
            }
            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * returns a list of all the keys in the order they are listed in the MilStd 2525D document.
     * @param version see {@link SymbolID.Version_2525E} and {@link SymbolID.Version_2525Dch1}
     * @return 
     */
    public getIDList(version: number): Array<string> {
        if (version < SymbolID.Version_2525E) {
            return this._IDListD;
        } else if (version === SymbolID.Version_2525E) {
            return this._IDListE;
        } else {
            return this._IDListD;
        }
    }

    public addCustomSymbol(msInfo:MSInfo):boolean
    {
        let success = false;
        try
        {
            let version:number = msInfo.getVersion();
            if (version < SymbolID.Version_2525E) 
            {
                if(this._IDListD.indexOf(msInfo.getBasicSymbolID()) == -1)
                {
                    this._IDListD.push(msInfo.getBasicSymbolID());
                    MSLookup._MSLookupD.set(msInfo.getBasicSymbolID(), msInfo);
                    success = true;
                }
                else
                    ErrorLogger.LogMessage("Symbol Set and Entity Code combination already exist: " + msInfo.getBasicSymbolID(), LogLevel.INFO,false);
            }
            else if (version === SymbolID.Version_2525E) 
            {
                if(this._IDListE.indexOf(msInfo.getBasicSymbolID()) == -1)
                {
                    this._IDListE.push(msInfo.getBasicSymbolID());
                    MSLookup._MSLookupE.set(msInfo.getBasicSymbolID(), msInfo);
                    success = true;
                }
                else
                    ErrorLogger.LogMessage("Symbol Set and Entity Code combination already exist: " + msInfo.getBasicSymbolID(), LogLevel.INFO,false);
            }
        }
        catch(e)
        {
            ErrorLogger.LogException("MSLookup", "addCustomSymbol",e);
        }
        return success;
        
    }
}
