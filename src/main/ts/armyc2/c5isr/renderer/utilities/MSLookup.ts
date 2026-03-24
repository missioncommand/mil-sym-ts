import { Modifiers } from "../../renderer/utilities/Modifiers"
import { MSInfo } from "../../renderer/utilities/MSInfo"
import { SymbolID } from "../../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../../renderer/utilities/SymbolUtilities"
import { ErrorLogger } from "./ErrorLogger";
import { LogLevel } from "./LogLevel";
import { RendererUtilities } from "./RendererUtilities";

import jsond from '../../data/msd.json';
import jsone from '../../data/mse.json';

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
    private static _MSLookup6D: Map<string, MSInfo>;
    private static _MSLookup6E: Map<string, MSInfo>;
    //private TAG: string = "MSLookup";
    private _IDListD: Array<string> = [];
    private _IDListE: Array<string> = [];
    private _IDList6D: Array<string> = [];
    private _IDList6E: Array<string> = [];
    private static msdJSON:string = "/msd.json";
    private static mseJSON:string = "/mse.json";

    /*public static async loadData(location?:string)
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
        await Promise.all(promises).then(values => {MSLookup.msd = values[0];MSLookup.mse = values[1];}).catch(error => {throw error;})

        //let promises:Array<Promise<any>> = new Array<Promise<any>>()
        
        //promises.push(RendererUtilities.getData(String(msdj)));
        //promises.push(RendererUtilities.getData(String(msej)));// RendererUtilities.getData(String(svgd)).then(function(result){this.genc = result;this.init();});
        //await Promise.all(promises).then(values => {MSLookup.msd = values[0];MSLookup.mse = values[1];}).catch(error => {throw error;})
    }//*/

    /**
     * 
     * @param urls 
     * @deprecated
     */
    public static async setData(urls:string[])
    {
        /*let promises:Array<Promise<any>> = new Array<Promise<any>>();

        promises.push(RendererUtilities.getData(urls[0]));
        promises.push(RendererUtilities.getData(urls[1]));// RendererUtilities.getData(String(svgd)).then(function(result){this.genc = result;this.init();});
        await Promise.all(promises).then(values => {MSLookup.msd = values[0];MSLookup.mse = values[1];}).catch(error => {throw error;})//*/
    }

    /*public static setDataObject()
    {
        this.msd = jsond;
        this.mse = jsone;
    }//*/

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

        if(typeof jsond === 'object')
        {
            MSLookup.msd = jsond;
            MSLookup.mse = jsone;
        }
        
        if (MSLookup._initCalled === false) {
            MSLookup._initCalled = true;
            MSLookup._MSLookupD = new Map();
            MSLookup._MSLookupE = new Map();
            MSLookup._MSLookup6D = new Map();
            MSLookup._MSLookup6E = new Map();
            this._IDListD = new Array();
            this._IDListE = new Array();
            this._IDList6D = new Array();
            this._IDList6E = new Array();

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
            versions: string;
            geometry?: string;
            drawRules?: string;
            modifiers?: string;
            aux1?: string;
        }
        let intSS: number = 0;

        try 
        {
            let msJSON: JSONSymbol[];
            if (version >= SymbolID.Version_2525E) {
                lookup = MSLookup._MSLookupE;
                list = this._IDListE;
                msJSON = MSLookup.mse["mse"]["SYMBOL"]
            } else {
                lookup = MSLookup._MSLookupD;
                list = this._IDListD;
                msJSON = MSLookup.msd["msd"]["SYMBOL"]
            }

            let ss: string = ""
            let e: string = ""
            let et: string = ""
            let est: string = ""
            let versions: string = "";
            for (let JSONSymbol of msJSON) {
                if (JSONSymbol.code.length != 6) {
                    JSONSymbol.code = "000000";
                }
                if (JSONSymbol.ss !== "") {
                    ss = JSONSymbol.ss;
                }

                if(JSONSymbol.e !== null && JSONSymbol.e !=="")
                {
                    e = JSONSymbol.e;
                    et = "";
                    est = "";
                }

                if(JSONSymbol.et !== null && JSONSymbol.et !=="")
                {
                    et = JSONSymbol.et;
                    est = "";
                }

                if(JSONSymbol.est !== null && JSONSymbol.est !=="")
                {
                    est = JSONSymbol.est;
                }

                if(JSONSymbol.versions !== null && JSONSymbol.versions !=="")
                {
                    versions = JSONSymbol.versions;
                }

                intSS = parseInt(ss);
                let id = ss + JSONSymbol.code;
                if (JSONSymbol.code !== "000000") {
                    if (JSONSymbol.geometry || JSONSymbol.drawRules) {//Control Measures and METOCS
                        let modifiers: Array<string> = new Array<string>() ;
                        if (JSONSymbol.modifiers != null && JSONSymbol.modifiers != "null" && JSONSymbol.modifiers !== "") 
                        {
                            modifiers = JSONSymbol.modifiers.split(",");
                        }

                        let g: string = JSONSymbol.geometry || "";
                        let dr: string = JSONSymbol.drawRules || "";

                        //multi points
                        let verArr:string[] = versions.split(",");
                        for(let ver of verArr)
                            this.addToLookup(new MSInfo(parseInt(ver), ss, e, et, est, JSONSymbol.code, g, dr, this.populateModifierList(modifiers)));
                    } else {//Everything else
                        //single points
                        let verArr:string[] = versions.split(",");
                        for(let ver of verArr)
                            this.addToLookup(new MSInfo(parseInt(ver), ss, e, et, est, JSONSymbol.code, this.populateModifierList(ss, JSONSymbol.code, parseInt(ver))));
                    }
                    this.addToList(versions, id);
                }
                else if(intSS != SymbolID.SymbolSet_ControlMeasure &&
                    intSS != SymbolID.SymbolSet_Atmospheric &&
                    intSS != SymbolID.SymbolSet_Oceanographic &&
                    intSS != SymbolID.SymbolSet_MeteorologicalSpace)
                {
                    let verArr:string[] = versions.split(",");
                    for(let ver of verArr)
                        this.addToLookup(new MSInfo(parseInt(ver), ss, e, et, est, JSONSymbol.code, this.populateModifierList(ss,JSONSymbol.code, parseInt(ver))));
                    this.addToList(versions, id);
                }
            }
        } 
        catch (exc) 
        {
            if (exc instanceof Error) {
                console.log(exc.message);
            } else {
                throw exc;
            }
        }
    }

    private addToLookup(msi:MSInfo):void
    {
        let version:number = msi.getVersion();
        if(version==SymbolID.Version_2525Dch1)
            MSLookup._MSLookupD.set(msi.getBasicSymbolID(), msi);
        if(version==SymbolID.Version_APP6D)
            MSLookup._MSLookup6D.set(msi.getBasicSymbolID(), msi);
        if(version==SymbolID.Version_2525Ech1)
            MSLookup._MSLookupE.set(msi.getBasicSymbolID(), msi);
        if(version==SymbolID.Version_APP6Ech2)
            MSLookup._MSLookup6E.set(msi.getBasicSymbolID(), msi);
    }

    private addCustomToLookupAndList(msi:MSInfo):boolean
    {
        let success:boolean = false;
        let version:number = msi.getVersion();
        if(version==SymbolID.Version_2525Dch1) {
            if(!MSLookup._MSLookupD.has(msi.getBasicSymbolID())) {
                MSLookup._MSLookupD.set(msi.getBasicSymbolID(), msi);
                this._IDListD.push(msi.getBasicSymbolID());
                success = true;
            }
        }
        if(version==SymbolID.Version_APP6D){
            if (!MSLookup._MSLookup6D.has(msi.getBasicSymbolID())) {
                MSLookup._MSLookup6D.set(msi.getBasicSymbolID(), msi);
                this._IDList6D.push(msi.getBasicSymbolID());
                success = true;
            }
        }
        if(version==SymbolID.Version_2525Ech1){
            if(!MSLookup._MSLookupE.has(msi.getBasicSymbolID())) {
                MSLookup._MSLookupE.set(msi.getBasicSymbolID(), msi);
                this._IDListE.push(msi.getBasicSymbolID());
                success = true;
            }
        }
        if(version==SymbolID.Version_APP6Ech2) {
            if(!MSLookup._MSLookup6E.has(msi.getBasicSymbolID())) {
                MSLookup._MSLookup6E.set(msi.getBasicSymbolID(), msi);
                this._IDList6E.push(msi.getBasicSymbolID());
                success = true;
            }
        }
        return success;
    }

    private addToList(versions:string, basicSymbolID:string):void
    {
        if(versions.indexOf(SymbolID.Version_2525Dch1.toString())>=0)
            this._IDListD.push(basicSymbolID);
        if(versions.indexOf(SymbolID.Version_APP6D.toString())>=0)
            this._IDList6D.push(basicSymbolID);
        if(versions.indexOf(SymbolID.Version_2525Ech1.toString())>=0)
            this._IDListE.push(basicSymbolID);
        if(versions.indexOf(SymbolID.Version_APP6Ech2.toString())>=0)
            this._IDList6E.push(basicSymbolID);
    }


    private populateModifierList(modifiers: string[] | null): Array<string>;

    private populateModifierList(symbolSet: string, ec: string, version: number): Array<string>;
    private populateModifierList(...args: unknown[]): Array<string> {
        switch (args.length) {
            case 1: {
                const [modifiers] = args as [string[]];

                let mods: Array<string> = new Array<string>();
                
                if (modifiers != null && modifiers.length > 0) {
                    for (let mod of modifiers) 
                    {
                        let key:string = Modifiers.getModifierKey(mod);
                        if(key != null)
                            mods.push(key);
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
                            modifiers.push(Modifiers.C_QUANTITY);
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
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
                            modifiers.push(Modifiers.K_COMBAT_EFFECTIVENESS);
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_LandInstallation: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            modifiers.push(Modifiers.AV_LEADERSHIP);
                            break;
                        }

                        case SymbolID.SymbolSet_Space:
                        case SymbolID.SymbolSet_SpaceMissile: 
                        case SymbolID.SymbolSet_Air:
                        case SymbolID.SymbolSet_AirMissile: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
                            modifiers.push(Modifiers.C_QUANTITY);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            //modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_SeaSurface: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            //modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AG_AUX_EQUIP_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
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
                            //modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_Activities: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        }

                        case SymbolID.SymbolSet_CyberSpace: {
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
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
                else if(version == SymbolID.Version_2525Dch1){
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AS_COUNTRY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
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
                else if(version == SymbolID.Version_APP6D)
                {
                    switch (ss) {
                        case SymbolID.SymbolSet_LandUnit:
                        case SymbolID.SymbolSet_LandCivilianUnit_Organization:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
                            modifiers.push(Modifiers.C_QUANTITY);
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
                            if(ss==SymbolID.SymbolSet_LandUnit && ec === "110000")
                                modifiers.push(Modifiers.AA_SPECIAL_C2_HQ);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AD_PLATFORM_TYPE);
                            modifiers.push(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AH_AREA_OF_UNCERTAINTY);
                            modifiers.push(Modifiers.AI_DEAD_RECKONING_TRAILER);
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_LandEquipment:
                        case SymbolID.SymbolSet_SignalsIntelligence_Land:
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_LandInstallation:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
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
                            modifiers.push(Modifiers.AK_PAIRING_LINE);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_DismountedIndividuals:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
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
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AF_COMMON_IDENTIFIER);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            modifiers.push(Modifiers.AV_LEADERSHIP);
                            break;
                        case SymbolID.SymbolSet_Space:
                        case SymbolID.SymbolSet_SpaceMissile:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_Air:
                        case SymbolID.SymbolSet_AirMissile:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);//air only
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_SeaSurface:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.P_IFF_SIF_AIS);
                            //modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_SeaSubsurface:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            //modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.T_UNIQUE_DESIGNATION_1);
                            modifiers.push(Modifiers.V_EQUIP_TYPE);
                            modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.Z_SPEED);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AJ_SPEED_LEADER);
                            modifiers.push(Modifiers.AL_OPERATIONAL_CONDITION);
                            modifiers.push(Modifiers.AO_ENGAGEMENT_BAR);
                            modifiers.push(Modifiers.AQ_GUARDED_UNIT);
                            modifiers.push(Modifiers.AR_SPECIAL_DESIGNATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_Activities:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.C_QUANTITY);
                            modifiers.push(Modifiers.G_STAFF_COMMENTS);
                            modifiers.push(Modifiers.H_ADDITIONAL_INFO_1);
                            modifiers.push(Modifiers.J_EVALUATION_RATING);
                            modifiers.push(Modifiers.Q_DIRECTION_OF_MOVEMENT);
                            modifiers.push(Modifiers.W_DTG_1);
                            modifiers.push(Modifiers.Y_LOCATION);
                            modifiers.push(Modifiers.AB_FEINT_DUMMY_INDICATOR);
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
                        case SymbolID.SymbolSet_CyberSpace:
                            modifiers.push(Modifiers.A_SYMBOL_ICON);
                            modifiers.push(Modifiers.B_ECHELON);
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
                            modifiers.push(Modifiers.AS_COUNTRY);
                            break;
        
                        case SymbolID.SymbolSet_ControlMeasure:
                            //values come from files during MSLookup load
                            break;
                        case SymbolID.SymbolSet_Atmospheric:
                            //Tropopause low, Tropopause high
                            if ((ec === "110102") || (ec === "110202") ||
                                    (ec === "162200"))
                                modifiers.push(Modifiers.X_ALTITUDE_DEPTH);
                            else if (ec === "140200")
                                modifiers.push(Modifiers.AN_AZIMUTH);
                            break;
                        case SymbolID.SymbolSet_MineWarfare:
                        case SymbolID.SymbolSet_Oceanographic:
                        case SymbolID.SymbolSet_MeteorologicalSpace:
                        default://no modifiers
                            break;
        
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
                    if (version == SymbolID.Version_2525E || version == SymbolID.Version_2525Ech1)
                        return MSLookup._MSLookupE.get(basicID);
                    else if (version == SymbolID.Version_APP6Ech2 || version == SymbolID.Version_APP6Ech1)
                        return MSLookup._MSLookup6E.get(basicID);
                    else if (version == SymbolID.Version_APP6D)
                        return MSLookup._MSLookup6D.get(basicID);
                    else if (version == SymbolID.Version_2525Dch1)
                        return MSLookup._MSLookupD.get(basicID);
                    else
                        return null;
                }
                else {
                    if (length >= 20 && length <= 30)//probably got a full id instead of a basic ID.
                    {
                        return this.getMSLInfo(SymbolUtilities.getBasicSymbolID(basicID), version);
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
        if (version == SymbolID.Version_2525E || version == SymbolID.Version_2525Ech1)
            return this._IDListE;
        else if (version == SymbolID.Version_APP6D)
            return this._IDList6D;
        else if (version == SymbolID.Version_2525Dch1)
            return this._IDListD;
        else if (version == SymbolID.Version_APP6Ech1 || version == SymbolID.Version_APP6Ech2)
            return this._IDList6E;
        else//default to 2525Dch1
            return this._IDListD;
    }

    public addCustomSymbol(msInfo:MSInfo):boolean
    {
        let success:boolean = false;
        try
        {
            if(msInfo != null)
                success = this.addCustomToLookupAndList(msInfo);
            else
                ErrorLogger.LogMessage("Attempt to add custom msInfo with null object.",LogLevel.INFO,false);
            if(msInfo != null && !success)
                ErrorLogger.LogMessage("Symbol Set and Entity Code combination already exist: " + msInfo.getBasicSymbolID(),LogLevel.INFO,false);
        }
        catch(exc)
        {
            if(exc instanceof Error)
            ErrorLogger.LogException("MSLookup", "addCustomSymbol",exc);
        }
        return success;
        
    }
}
