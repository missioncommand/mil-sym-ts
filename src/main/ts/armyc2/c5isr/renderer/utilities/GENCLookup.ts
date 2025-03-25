import { ErrorLogger } from './ErrorLogger';
import { RendererUtilities } from './RendererUtilities';

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


    public static async loadData(location?:string)
    {
        let path:string = GENCLookup.gencJSON;//String(genc);
        if(location)
        {
            path = location + path.substring(path.lastIndexOf('/')+1,path.length);
        }
        RendererUtilities.getData(path).then(result => {this.genc = result;}).catch((err) => {ErrorLogger.LogException("GENCLookup","loadData",err)});
        //RendererUtilities.getData(String(genc)).then(result => {this.genc = result;});
    }

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
        type gencIn = 
        {
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
                }
                
            } catch (e) {
                if(console)
                    console.log(e.message);
                else
                    throw e;
            }
        }
        if(GENCLookup._GENCLookup &&GENCLookup._GENCLookup.size > 0)
            GENCLookup._isReady = true;
    }

    public get3CharCode(id: number): string {
        if (GENCLookup._GENCLookup && GENCLookup._GENCLookup.has(String(id))) {
            return GENCLookup._GENCLookup.get(String(id));
        }
        return "";
    }
}
