import { ErrorLogger } from './ErrorLogger';
import { RendererUtilities } from './RendererUtilities';

import jsond from '../../data/smd.json';
import jsone from '../../data/sme.json';
import { SymbolID } from './SymbolID';

/**
 *
 */
export class SectorModUtils {
    //private static smd:string = "/smd.json";
    //private static sme:string = "/sme.json";
    private static _instance: SectorModUtils;
    private static _initCalled: boolean = false;
    private static _isReady: boolean = false;

        //private TAG: string = "GENCLookup";
    //private _IDList: Array<string> = new Array<string>();

    private static _sectorMods:Map<string,string> = new Map<string,string>();
    private static _sectorModLists:Map<string,Array<string[]>> = new Map<string,Array<string[]>>();
    
    private static smd:any;
    private static sme:any;


    /*public static async loadData(location?:string)
    {
        let path:string = GENCLookup.gencJSON;//String(genc);
        if(location)
        {
            path = location + path.substring(path.lastIndexOf('/')+1,path.length);
        }
        RendererUtilities.getData(path).then(result => {this.genc = result;}).catch((err) => {ErrorLogger.LogException("GENCLookup","loadData",err)});
        //RendererUtilities.getData(String(genc)).then(result => {this.genc = result;});
    }//*/

    /**
     * 
     * @param url 
     * @deprecated
     */
    public static async setData(url:string)
    {
        //RendererUtilities.getData(url).then(result => {this.genc = result;}).catch((err) => {ErrorLogger.LogException("GENCLookup","loadData",err)});
    }

    /*public static setDataObject()
    {
        this.genc = json;
    }//*/

    private constructor() 
    {
        this.init();
    }

    public static getInstance(): SectorModUtils {
        if (!SectorModUtils._instance) {
            SectorModUtils._instance = new SectorModUtils();
        }
        return SectorModUtils._instance;
    }

    public isReady():boolean
    {
        return SectorModUtils._isReady;
    }

    private init(): void 
    {
        try
        {
            if(SectorModUtils._initCalled != true)
            {
                SectorModUtils._initCalled = true;
                
                if(typeof jsond === 'object')
                {
                    SectorModUtils.smd = jsond;
                }
                if(typeof jsone === 'object')
                {
                    SectorModUtils.sme = jsone;
                }
                
                this.loadData(SymbolID.Version_2525Dch1);
                this.loadData(SymbolID.Version_2525Ech1);
            }
        }
        catch(e)
        {
            SectorModUtils._isReady=false;
            SectorModUtils._initCalled = false;
            throw e;
        }
        SectorModUtils._isReady=true;
        
    }

    private loadData(version:number):void
    {
        let temp:string[] = null;
        let delimiter:string = "\t";
        let ver:number = 0;
        let ss:number = -1;
        let l:number = 0;
        let code:string = "00";
        let name:string = "";
        let id = null;
        let sb:string = null;
        let sectorList:Array<string[]> = null;

        type modIn = 
        {
            "name": string;
            "category": string;
            "code": string;
        }

        let smJSON: modIn[];

        
        if(version <= SymbolID.Version_2525Dch1)
        {
            ver = SymbolID.Version_2525Dch1;
            smJSON = SectorModUtils.smd["smd"]["secmods"]
        }
        else
        {
            ver = SymbolID.Version_2525Ech1;
            smJSON = SectorModUtils.sme["sme"]["secmods"]
        }

        try 
        {
            let entry:string[] = null;

            for (const modifier of smJSON) 
            {
                if(modifier != null && modifier["code"]==="")
                {
                    if(sectorList !== null && sectorList.length > 0)
                    {
                        id = ver + "-" + ss + "-" + l;
                        SectorModUtils._sectorModLists.set(id,sectorList);
                    }

                    //get symbol set
                    ss = parseInt(modifier["name"].split(" ")[0]);
                    //get location; 1=top, 2=bottom
                    l = parseInt(modifier["category"]);
                    //start new list
                    sectorList = new Array<string[]>();
                }
                else // code is not empty string so a valid modifier
                {
                    name = modifier["name"];
                    code = modifier["code"];
                    if(code.length==1)
                        code = "0" + code;

                    id = ver + "-" + ss + "-" + l + "-" + code;
                    entry = [code,name];
                    sectorList.push(entry);
                    SectorModUtils._sectorMods.set(id, name);
                }
                
            }
            
        } catch (e) {
            if(console && e instanceof Error)
                console.log(e.message);
            else
                throw e;
        }
        

    }

    /**
     *
     * @param version like SymbolID.Version_2525Dch1 or SymbolID.Version_2525Ech1  Only tracks sector mods for these 2 versions.
     * @param symbolSet  like SymbolID.SymbolSet_Air; use 0 for Common Modifiers as they are not tied to a symbol set.
     * @param location 1 for top, 2 for bottom
     * @return and ArrayList of String[] like ["00","Unspecified"],["01","Attack/Strike"]
     */
    public getSectorModList(version:number, symbolSet:number, location:number):Array<string[]>
    {
        let ver:number = SymbolID.Version_2525Dch1;
        if(version >= SymbolID.Version_2525E )
            ver = SymbolID.Version_2525Ech1;

        let ss:number = symbolSet;
        if (ss > 50 && ss < 60)
            ss = 50;

        let id:string = ver + "-" + ss + "-" + location;
        
        if(SectorModUtils._sectorModLists.has(id))
            return SectorModUtils._sectorModLists.get(id);
        else
        {
            let entry:string[] = ["00","Unspecified"];
            let al:Array<string[]> = new Array<string[]>();
            al.push(entry);
            return al;
        }
    }

    /**
     *
     * @param version like SymbolID.Version_2525Dch1 or SymbolID.Version_2525Ech1  Only tracks sector mods for these 2 versions.
     * @param symbolSet  like SymbolID.SymbolSet_Air; use 0 for Common Modifiers as they are not tied to a symbol set.
     * @param location 1 for top, 2 for bottom
     * @param code like "01" or "100"
     */
    public getName(version:number, symbolSet:number, location:number, code:string):string
    {

        let ver:number = SymbolID.Version_2525Dch1;
        if(version >= SymbolID.Version_2525E )
            ver = SymbolID.Version_2525Ech1;

        let ss:number = symbolSet;
        if (ss > 50 && ss < 60)
            ss = 50;

        //verify code is the correct length
        if(ss > 0 && code.length != 2)
        {
            if(code.length > 2)
                code = code.substring(0, 2);
            else
            {
                while(code.length<2)
                    code = "0" + code;
            }
        }
        else if(ss == 0 && code.length != 3)
        {
            if (code.length > 3)
                code = code.substring(0, 3);
            else
            {
                if (code.startsWith("0"))
                    code = "1" + code;
                while (code.length < 3)
                    code = "0" + code;
            }
        }

        let id:string = ver + "-" + ss + "-" + location + "-" + code;

        if(SectorModUtils._sectorMods.has(id))
            return SectorModUtils._sectorMods.get(id);
        else
            return "";
    }
}
