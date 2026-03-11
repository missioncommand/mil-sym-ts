import { ErrorLogger } from './ErrorLogger';
import { RendererUtilities } from './RendererUtilities';

import json from '../../data/c2d.json';
import { SymbolUtilities } from './SymbolUtilities';
import { SymbolID } from './SymbolID';
import { GENCLookup } from './GENCLookup';

/**
 * Utility class that takes a 15 character 2525C symbolID and 
 * tries to map it to a 2525Dch1 code if possible.
 */
export class C2DLookup {
    private static c2dJSON:string = "/c2d.json";
    private static _instance: C2DLookup;
    private static _initCalled: boolean = false;
    private static _isReady: boolean = false;

    private static _C2DLookup: Map<string, string[]>;
    private static c2d:any;


    private constructor() 
    {
        this.init();
    }

    public static getInstance(): C2DLookup {
        if (!C2DLookup._instance) {
            C2DLookup._instance = new C2DLookup();
        }
        return C2DLookup._instance;
    }

    public isReady():boolean
    {
        return C2DLookup._isReady;
    }

    private init(): void {
        
        if(typeof json === 'object')
        {
            C2DLookup.c2d = json;
        }
        
        type c2dIn = 
        {
            "basic": string;
            "ss": string;
            "ec": string;
            "s1": string;
            "s2": string;
        }

        if (C2DLookup._initCalled === false) {
            C2DLookup._initCalled = true;
            C2DLookup._C2DLookup = new Map();
            try {
                
                let c2dJSON: c2dIn[] = C2DLookup.c2d["c2d"]["symbols"]
                for (let symbolJSON of c2dJSON) {
                    C2DLookup._C2DLookup.set(symbolJSON["basic"], [symbolJSON["ss"],symbolJSON["ec"],symbolJSON["s1"],symbolJSON["s2"]]);
                }
                
            } catch (e) {
                if(console && e instanceof Error)
                    console.log(e.message);
                else
                    throw e;
            }
        }
        if(C2DLookup._C2DLookup && C2DLookup._C2DLookup.size > 0)
            C2DLookup._isReady = true;
    }

    /**
     * Take a complete 15 character 2525C symbol code and converts it to 2525D if there is a match.
     * Returns null if no match.
     * @param symbolID 15 character 2525C symbol code.
     * @param includeCountryCode default true, Update the country code as well.
     * @return 30 character 2525D code or null if no matching symbol.
     */
    public getDCode(symbolID:string, includeCountryCode:boolean = true):string
    {
        let basicID:string = SymbolUtilities.getBasicSymbolID2525C(symbolID);
        let newCode:string = "110000000000000000000000000000";

        let parts:string[] = C2DLookup._C2DLookup.get(basicID);
        if(parts==null)
            return null;

        //set symbol set
        newCode = SymbolID.setSymbolSet(newCode, parseInt(parts[0]));
        //set entity code
        newCode = SymbolID.setEntityCode(newCode, parseInt(parts[1]));
        //set sector modifier 1
        if(parts[2]!=="")
            newCode = SymbolID.setModifier1(newCode, (parts[2]));
        //set sector modifier 2
        if(parts[3]!=="")
            newCode = SymbolID.setModifier1(newCode, (parts[3]));

        //get affiliation to set context and affiliation
        let aff:string = symbolID.charAt(1);

        switch (aff)
        {
            case 'G':
            case 'W':
            case 'M':
            case 'D':
            case 'L':
            case 'J':
            case 'K':
                newCode = SymbolID.setContext(newCode, SymbolID.StandardIdentity_Context_Exercise);
                break;
            default:
                newCode = SymbolID.setContext(newCode, SymbolID.StandardIdentity_Context_Reality);
        }

        //set affiliation
        if(aff=='F' || aff=='D')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_Friend);
        else if(aff=='H' || aff=='K')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_Hostile_Faker);
        else if(aff=='N' || aff=='L')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_Neutral);
        else if(aff=='P' || aff=='G')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_Pending);
        else if(aff=='S' || aff=='J')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_Suspect_Joker);
        else if(aff=='A' || aff=='M')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_AssumedFriend);
        else if(aff=='U' || aff=='W')
            newCode = SymbolID.setAffiliation(newCode, SymbolID.StandardIdentity_Affiliation_Unknown);

        //set status
        let status:string = symbolID.charAt(3);

        if(status == 'A')
            newCode = SymbolID.setStatus(newCode, SymbolID.Status_Planned_Anticipated_Suspect);
        if(status == 'P')
            newCode = SymbolID.setStatus(newCode, SymbolID.Status_Present);
        if(status == 'C')
            newCode = SymbolID.setStatus(newCode, SymbolID.Status_Present_FullyCapable);
        if(status == 'D')
            newCode = SymbolID.setStatus(newCode, SymbolID.Status_Present_Damaged);
        if(status == 'X')
            newCode = SymbolID.setStatus(newCode, SymbolID.Status_Present_Destroyed);
        if(status == 'F')
            newCode = SymbolID.setStatus(newCode, SymbolID.Status_Present_FullToCapacity);

        let modifier:string = symbolID.substring(10,12);
        if(modifier.charAt(0)!='H' &&//installation
                modifier.charAt(0)!='M' && //mobility
                modifier.charAt(0)!='N') //towed array
        {
            switch(modifier.charAt(1))
            {
                case 'A':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Team_Crew);
                    break;
                case 'B':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Squad);
                    break;
                case 'C':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Section);
                    break;
                case 'D':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Platoon_Detachment);
                    break;
                case 'E':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Company_Battery_Troop);
                    break;
                case 'F':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Battalion_Squadron);
                    break;
                case 'G':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Regiment_Group);
                    break;
                case 'H':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Brigade);
                    break;
                case 'I':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Division);
                    break;
                case 'J':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Corps_MEF);
                    break;
                case 'K':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Army);
                    break;
                case 'L':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_ArmyGroup_Front);
                    break;
                case 'M':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Region_Theater);
                    break;
                case 'N':
                    newCode = SymbolID.setAmplifierDescriptor(newCode,SymbolID.Echelon_Region_Command);
                    break;

            }

            switch (modifier.charAt(0))
            {
                case 'A':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_Headquarters);
                    break;
                case 'B':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_TaskForce_Headquarters);
                    break;
                case 'C':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_FeintDummy_Headquarters);
                    break;
                case 'D':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_FeintDummy_TaskForce_Headquarters);
                    break;
                case 'E':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_TaskForce);
                    break;
                case 'F':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_FeintDummy);
                    break;
                case 'G':
                    newCode = SymbolID.setHQTFD(newCode,SymbolID.HQTFD_FeintDummy_TaskForce);
                    break;
            }
        }
        else
        {
            if(modifier === "HB")
                SymbolID.setHQTFD(newCode,SymbolID.HQTFD_FeintDummy);
            else if(modifier.charAt(0)=='M')
            {
                switch(modifier.charAt(1))
                {
                    case 'O':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_WheeledLimitedCrossCountry);
                        break;
                    case 'P':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_WheeledCrossCountry);
                        break;
                    case 'Q':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Tracked);
                        break;
                    case 'R':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Wheeled_Tracked);
                        break;
                    case 'S':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Towed);
                        break;
                    case 'T':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Rail);
                        break;
                    case 'U':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_OverSnow);
                        break;
                    case 'V':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Sled);
                        break;
                    case 'W':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_PackAnimals);
                        break;
                    case 'X':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Barge);
                        break;
                    case 'Y':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_Amphibious);
                        break;
                }
            }
            else if(modifier.charAt(0)=='N')
            {
                switch(modifier.charAt(1)) {
                    case 'S':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_ShortTowedArray);
                        break;
                    case 'L':
                        newCode = SymbolID.setAmplifierDescriptor(newCode, SymbolID.Mobility_LongTowedArray);
                        break;
                }
            }
        }

        switch(SymbolID.getEntityCode(newCode))
        {
            case 151406://Axis of Advance for a Feint
            case 140605://Direction of attack feint
            case 270705://Dummy Minefield
            case 270706://Dummy Minefield, Dynamic
            case 270900://Decoy Mined Area
            case 270901://Decoy Mined Area, Fenced
                newCode = SymbolID.setVersion(newCode,10);
                break;
            default:
                break;
        }

        //country code
        if(includeCountryCode)
            newCode = newCode.substring(0,27) + GENCLookup.getInstance().get3DigitCode(parseInt(symbolID.substring(12,14)));

        return newCode;
    }
}
