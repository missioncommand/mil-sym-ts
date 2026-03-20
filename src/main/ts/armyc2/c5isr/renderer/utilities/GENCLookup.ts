import { ErrorLogger } from './ErrorLogger';
import { RendererUtilities } from './RendererUtilities';

import json from '../../data/genc.json';

/**
 * Utility class that takes the 3 digit country code from the symbol ID and returns the 3 character string representation
 * of that country. For example, 840 turns into "USA" for the United States.
 */
export class GENCLookup {
    private static gencJSON:string = "/genc.json";
    private static _instance: GENCLookup;
    private static _initCalled: boolean = false;
    private static _isReady: boolean = false;

    private static _GENCLookup: Map<string, string>;
    //private TAG: string = "GENCLookup";
    //private _IDList: Array<string> = new Array<string>();
    private static genc:any;


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

    public static getInstance(): GENCLookup {
        if (!GENCLookup._instance) {
            GENCLookup._instance = new GENCLookup();
        }
        return GENCLookup._instance;
    }

    public isReady():boolean
    {
        return GENCLookup._isReady;
    }

    private init(): void {
        
        if(typeof json === 'object')
        {
            GENCLookup.genc = json;
        }
        
        type gencIn = 
        {
            "2char": string;
            "3char": string;
            "numeric": string;
            "name": string;
        }

        if (GENCLookup._initCalled === false) {
            GENCLookup._initCalled = true;
            GENCLookup._GENCLookup = new Map();
            try {
                
                let gencJSON: gencIn[] = GENCLookup.genc["genc"]["countries"]
                for (let countryJSON of gencJSON) {
                    GENCLookup._GENCLookup.set(countryJSON["numeric"], countryJSON["3char"]);
                    if(countryJSON["2char"].length===2)
                        GENCLookup._GENCLookup.set(countryJSON["2char"], countryJSON["numeric"]);
                }
                
            } catch (e) {
                if(console && e instanceof Error)
                    console.log(e.message);
                else
                    throw e;
            }
        }
        if(GENCLookup._GENCLookup &&GENCLookup._GENCLookup.size > 0)
            GENCLookup._isReady = true;
    }

    /**
     *
     * @param id 3 digit code from 2525D+ symbol code
     * @return
     */
    public get3CharCode(id: string | number): string {
        
        if (GENCLookup._GENCLookup && GENCLookup._GENCLookup.has(String(id))) {
            return GENCLookup._GENCLookup.get(String(id));
        }
        return "";
    }
    
    /**
     *
     * @param id 2 char string from 2525C symbol code
     * @return
     */
    public get3DigitCode(id: string): string {
        if (GENCLookup._GENCLookup && GENCLookup._GENCLookup.has(id)) {
            let code = GENCLookup._GENCLookup.get(id);
            while(code.length < 3)
                code = "0" + code;
            return code;
        }
        return "000";
    }

    
}
