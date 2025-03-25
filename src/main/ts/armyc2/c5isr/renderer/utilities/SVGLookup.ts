import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { SVGInfo } from "../../renderer/utilities/SVGInfo"
import { SymbolID } from "../../renderer/utilities/SymbolID"
import { ErrorLogger } from "./ErrorLogger";
import { RendererUtilities } from "./RendererUtilities";


export class SVGLookup
{
    private static _instance: SVGLookup;
    private static _initCalled: boolean = false;
    private static _isReady: boolean = false;
    private static _SVGLookupD: Map<string, SVGInfo>;
    private static _SVGLookupE: Map<string, SVGInfo>;

    private static svgd:any;
    private static svge:any;

    private static svgdJSON:string = "/svgd.json";
    private static svgeJSON:string = "/svge.json";

    public static async loadData(location?:string)
    {

        let pathd:string = SVGLookup.svgdJSON;//String(svgdj);
        let pathe:string = SVGLookup.svgeJSON;//String(svgej);
        if(location)
        {
            pathd = location + pathd.substring(pathd.lastIndexOf('/')+1,pathd.length);
            pathe = location + pathe.substring(pathe.lastIndexOf('/')+1,pathe.length);
        }

        let promises:Array<Promise<any>> = new Array<Promise<any>>()
        
        promises.push(RendererUtilities.getData(pathd));
        promises.push(RendererUtilities.getData(pathe));// RendererUtilities.getData(String(svgd)).then(function(result){this.genc = result;this.init();});
        await Promise.all(promises).then(values => {SVGLookup.svgd = values[0];SVGLookup.svge = values[1];}).catch(error => {throw error;})

        /*let promises:Array<Promise<any>> = new Array<Promise<any>>()
        
        promises.push(RendererUtilities.getData(String(svgdj)));
        promises.push(RendererUtilities.getData(String(svgej)));// RendererUtilities.getData(String(svgd)).then(function(result){this.genc = result;this.init();});
        await Promise.all(promises).then(values => {SVGLookup.svgd = values[0];SVGLookup.svge = values[1];}).catch(error => {throw error;})//*/
    }

    private constructor() {
        
        this.init();
    }

    public static getInstance(): SVGLookup {
        if (!SVGLookup._instance) {
            SVGLookup._instance = new SVGLookup();
            //SVGLookup._instance.init();
        }
        return SVGLookup._instance;
    }

    private init(): void {
        if (SVGLookup._initCalled === false) {
            SVGLookup._initCalled = true;
            SVGLookup._SVGLookupD = new Map();
            SVGLookup._SVGLookupE = new Map();
            try 
            {
                //TODO: potentially wrap this in a web worker.
                this.populateLookup(SVGLookup.svgd, SymbolID.Version_2525Dch1);
                this.populateLookup(SVGLookup.svge, SymbolID.Version_2525E);
                if(SVGLookup._SVGLookupD.size > 0 && SVGLookup._SVGLookupD.size > 0)
                    SVGLookup._isReady = true;

            } 
            catch (exc) 
            {
                SVGLookup._initCalled = false;
                throw exc;
            }
        }
        

    }

    public isReady():boolean
    {
        return SVGLookup._isReady;
    }

    private populateLookup(svgData:any, version: number): void {
        let temp: string[];
        let id: string;
        let bbox: Rectangle2D;
        let svg: string;
        let delimiter: string = "~";
        //let element: any = null;

        try 
        {

            let lookup: Map<string, SVGInfo>;

            if (version === SymbolID.Version_2525E) {

                lookup = SVGLookup._SVGLookupE;
            }

            else {

                lookup = SVGLookup._SVGLookupD;
            }

            let svgCount:number = svgData.svgdata.SVGElements.length;

            
            for  (let i:number = 0; i < svgCount; i++) 
            {
                let temp : any = svgData.svgdata.SVGElements[i];
                

                if(temp != null) 
                {
                    let id:string = temp.id;
                    let left: number = 0;
                    let top: number = 0;
                    let width: number = 0;
                    let height: number = 0;
                    left = parseFloat(temp.X);
                    top = parseFloat(temp.Y);
                    width = parseFloat(temp.Width);
                    height = parseFloat(temp.Height);
                    svg = temp.SVG;
                    bbox = new Rectangle2D(left, top, width, height);//RectUtilities.makeRectF(left, top, width, height);

                    lookup.set(id, new SVGInfo(id, bbox, svg));
                }
            }
        }
        catch (e) {
            console.log((e as Error).message);
        }
    }

    /**
     *
     * @param id
     * @return
     */
    public getSVGLInfo(id: string, version: number): SVGInfo | null {
        if (version >= SymbolID.Version_2525E) {
            if (SVGLookup._SVGLookupE.has(id)) {

                return SVGLookup._SVGLookupE.get(id);
            }

        }
        else {
            if (SVGLookup._SVGLookupD.has(id)) {

                return SVGLookup._SVGLookupD.get(id);
            }

        }

        return null;
    }

    public getSVGOctagon(): SVGInfo | null {
        if (SVGLookup._SVGLookupD.has("octagon")) {

            return SVGLookup._SVGLookupD.get("octagon");
        }

        else {

            return null;
        }

    }

    public static getFrameID(symbolID: string): string {
        //SIDC positions 3_456_7
        // String frameID = symbolID.charAt(2) + "_" + symbolID.substring(3, 6) + "_" + symbolID.charAt(6);

        let frameID: string;
        let ss: string;
        let affiliation: number = SymbolID.getAffiliation(symbolID);
        let status: number = SymbolID.getStatus(symbolID);
        //Some affiliations are always dashed and only have one SVG for status with a value of 0
        if (affiliation === SymbolID.StandardIdentity_Affiliation_Pending ||
            affiliation === SymbolID.StandardIdentity_Affiliation_AssumedFriend ||
            affiliation === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {
            // "When the frame is assumed friend, suspect, or pending, the status shall not be displayed."
            status = 0;
        }
        if (status > 1) {
            // Anything above 1 for status means present for the frame
            status = 0;
        }


        let context: number = SymbolID.getContext(symbolID);
        //they didn't make duplicate frame so I have to change the number for
        //the lookup to work.

        if (SymbolID.getVersion(symbolID) < SymbolID.Version_2525E)//2525Dch1 or less
        {
            switch (SymbolID.getSymbolSet(symbolID)) {
                case 1: //Air
                case 2: //Air Missile
                case 51: { //Air SIGINT
                    ss = "01";
                    break;
                }

                case 5: //Space
                case 6: //Space Missile
                case 50: { //Space SIGINT
                    ss = "05";
                    break;
                }

                case 10: //Land Unit
                case 11: {//Land Civilian Unit/Org
                    ss = "10";
                    break;
                }

                case 15://Land Equipment
                case 52://Land SigInt
                case 53: {//Sea Surface SIGINT
                    ss = "30";
                    break;
                }

                case 30: {//Sea Surface
                    ss = "30";
                    if (SymbolID.getEntityCode(symbolID) === 150000) {

                        return "octagon";
                    }
                    //this symbol has no frame and a size of 1L x 1L.
                    break;
                }

                case 20: { //Land Installation
                    ss = "20";
                    break;
                }

                case SymbolID.SymbolSet_DismountedIndividuals: { //Dismount Individual
                    ss = "27";
                    break;
                }

                case 35: //Sea Subsurface
                case 36: //Mine Warfare
                case 54: { //Sea Subsurface SigInt
                    ss = "35";
                    break;
                }

                case 40: { //Activities/Events
                    ss = "40";
                    break;
                }

                case 60: { //Cyberspace
                    ss = "60"; //No cyberspace SVG frame at the moment so setting to activities
                    break;
                }

                default: {
                    ss = "00";

                    if (context === SymbolID.StandardIdentity_Context_Exercise && affiliation > SymbolID.StandardIdentity_Affiliation_Unknown) {
                        //really there are no unknown exercise symbols outside of pending and unknown
                        //default to unknown
                        affiliation = SymbolID.StandardIdentity_Affiliation_Unknown;
                    }
                }

            }
            frameID = context + "_" + affiliation + ss + "_" + status;
        }
        else//2525E or above
        {
            let frameShape: string = SymbolID.getFrameShape(symbolID);
            if (frameShape === SymbolID.FrameShape_Unknown) {

                /*if(SymbolID.getSymbolSet(symbolID) != SymbolID.SymbolSet_SignalsIntelligence)
                {//get frame shape associated with symbol set
                    frameShape=SymbolID.getDefaultFrameShape(symbolID);
                }//*/
                frameShape = SymbolID.getDefaultFrameShape(symbolID);
                if (context === SymbolID.StandardIdentity_Context_Exercise &&
                    SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_Unknown &&
                    affiliation > SymbolID.StandardIdentity_Affiliation_Unknown) {
                    //really there are no unknown exercise symbols outside pending and unknown affiliations
                    //default to unknown
                    affiliation = SymbolID.StandardIdentity_Affiliation_Unknown;

                }
            }
            if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_SeaSurface &&
                SymbolID.getEntityCode(symbolID) === 150000 &&  //Own Ship
                (frameShape === SymbolID.FrameShape_LandEquipment_SeaSurface || frameShape === SymbolID.FrameShape_Unknown)) {
                return "octagon";
            }
            frameID = context + "_" + affiliation + frameShape + "_" + status;
        }

        return frameID;
    }

    public static getMainIconID(symbolID: string): string {
        //SIDC positions 5-6 + 11-16
        let mainIconID: string = symbolID.substring(4, 6) + symbolID.substring(10, 16);
        let ss: number = SymbolID.getSymbolSet(symbolID);

        if (ss === SymbolID.SymbolSet_MineWarfare) {
            if (RendererSettings.getInstance().getSeaMineRenderMethod() === RendererSettings.SeaMineRenderMethod_ALT ||
                mainIconID === "36110600" || mainIconID === "36110700") {
                mainIconID += "_a";
            }
        }
        else {
            if (ss === SymbolID.SymbolSet_LandUnit) {
                switch (SymbolID.getEntityCode(symbolID)) {
                    case 111000:
                    case 111001:
                    case 111002:
                    case 111003:
                    case 111004:
                    case 111005:
                    case 111500:
                    case 120100:
                    case 120400:
                    case 120401:
                    case 120402:
                    case 120501:
                    case 120502:
                    case 120601:
                    case 120801:
                    case 121100:
                    case 121101:
                    case 121102:
                    case 121103:
                    case 121104:
                    case 121105:
                    case 121106:
                    case 121300:
                    case 121301:
                    case 121302:
                    case 121303:
                    case 121802:
                    case 130100:
                    case 130101:
                    case 130102:
                    case 130103:
                    case 130200:
                    case 130302:
                    case 140102:
                    case 140103:
                    case 140104:
                    case 140105:
                    case 140702:
                    case 140703:
                    case 141702:
                    case 150504:
                    case 150800:
                    case 160200:
                    case 161200:
                    case 161300:
                    case 161400:
                    case 161700:
                    case 161800:
                    case 161900:
                    case 162000:
                    case 162100:
                    case 162200:
                    case 163400:
                    case 163700:
                    case 163800:
                    case 163900:
                    case 164000:
                    case 164100:
                    case 164200:
                    case 164300:
                    case 164400:
                    case 164500:
                    case 164600:
                    case 165000: {//NATO Only
                        //do thing to append correct number
                        mainIconID += SVGLookup.getPostFixForIcon(symbolID);
                        break;
                    }

                    default: {
                        break;
                    }

                }

            }
            else {
                if (ss === SymbolID.SymbolSet_LandEquipment) {
                    switch (SymbolID.getEntityCode(symbolID)) {
                        case 120111: {
                            //do thing to append correct number
                            mainIconID += SVGLookup.getPostFixForIcon(symbolID);
                            break;
                        }

                        default: {
                            break;
                        }

                    }
                }
                else {
                    if (ss === SymbolID.SymbolSet_LandInstallation) {
                        switch (SymbolID.getEntityCode(symbolID)) {
                            case 110300:
                            case 111200:
                            case 120103:
                            case 120105:
                            case 120106:
                            case 120107:
                            case 120701:
                            case 120702: {
                                //do thing to append correct number
                                mainIconID += SVGLookup.getPostFixForIcon(symbolID);
                                break;
                            }

                            default: {
                                break;
                            }

                        }
                    }
                    else {
                        if (ss === SymbolID.SymbolSet_Activities) {
                            switch (SymbolID.getEntityCode(symbolID)) {
                                case 110303:
                                case 130201:
                                case 131202:
                                case 131208: {
                                    //do thing to append correct number
                                    mainIconID += SVGLookup.getPostFixForIcon(symbolID);
                                    break;
                                }

                                default: {
                                    break;
                                }

                            }
                        }
                        else {
                            if (ss === SymbolID.SymbolSet_Unknown) {

                                mainIconID = "00000000";
                            }
                            //unknown with question mark
                            else {
                                if (ss !== SymbolID.SymbolSet_Air &&
                                    ss !== SymbolID.SymbolSet_AirMissile &&
                                    ss !== SymbolID.SymbolSet_Space &&
                                    ss !== SymbolID.SymbolSet_SpaceMissile &&
                                    ss !== SymbolID.SymbolSet_LandCivilianUnit_Organization &&
                                    ss !== SymbolID.SymbolSet_DismountedIndividuals &&
                                    ss !== SymbolID.SymbolSet_ControlMeasure &&
                                    ss !== SymbolID.SymbolSet_SeaSurface &&
                                    ss !== SymbolID.SymbolSet_SeaSubsurface &&
                                    ss !== SymbolID.SymbolSet_Atmospheric &&
                                    ss !== SymbolID.SymbolSet_Oceanographic &&
                                    ss !== SymbolID.SymbolSet_MeteorologicalSpace &&
                                    ss !== SymbolID.SymbolSet_SignalsIntelligence_Space &&
                                    ss !== SymbolID.SymbolSet_SignalsIntelligence_Air &&
                                    ss !== SymbolID.SymbolSet_SignalsIntelligence_Land &&
                                    ss !== SymbolID.SymbolSet_SignalsIntelligence_SeaSurface &&
                                    ss !== SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface &&
                                    ss !== SymbolID.SymbolSet_CyberSpace) {
                                    mainIconID = "98100000";//invalid symbol, inverted question mark
                                }
                            }

                        }

                    }

                }

            }

        }


        return mainIconID;
    }


    private static getPostFixForIcon(symbolID: string): string {
        let aff: number = SymbolID.getAffiliation(symbolID);
        let pf: string = "";
        if (aff === SymbolID.StandardIdentity_Affiliation_Friend ||
            aff === SymbolID.StandardIdentity_Affiliation_AssumedFriend) {

            pf += "_1";
        }

        else {
            if (aff === SymbolID.StandardIdentity_Affiliation_Neutral) {

                pf += "_2";
            }

            else {
                if (aff === SymbolID.StandardIdentity_Affiliation_Hostile_Faker ||
                    aff === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {

                    pf += "_3";
                }

                else {
                    if (aff === SymbolID.StandardIdentity_Affiliation_Unknown ||
                        aff === SymbolID.StandardIdentity_Affiliation_Pending) {

                        pf += "_0";
                    }

                }

            }

        }


        return pf;
    }

    public static getMod1ID(symbolID: string): string {
        let mod1ID: string;


        if ((SymbolID.getVersion(symbolID) >= SymbolID.Version_2525E) && symbolID.charAt(20) !== '0') {//2525E with Modifier 1 Indicator set
            mod1ID = symbolID.substring(20, 21) + symbolID.substring(16, 18) + "_1";
        }
        else //2525D or no Modifier 1 Indicator set
        {
            //SIDC positions 5-6 + 17-18 + "1"

            if (SymbolID.getEntity(symbolID) >= 11) {

                mod1ID = symbolID.substring(4, 6) + symbolID.substring(16, 18) + "1";
            }

            else {

                mod1ID = symbolID.substring(4, 6) + "001";
            }


            if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_LandUnit) {
                switch (SymbolID.getModifier1(symbolID)) {
                    case 98: {
                        mod1ID += SVGLookup.getPostFixForIcon(symbolID);
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
        }
        return mod1ID;
    }

    public static getMod2ID(symbolID: string): string {
        let mod2ID: string;
        if ((SymbolID.getVersion(symbolID) >= SymbolID.Version_2525E) && symbolID.charAt(21) !== '0') {//2525E with Modifier 1 Indicator set
            mod2ID = symbolID.substring(21, 22) + symbolID.substring(18, 20) + "_2";
        }
        else //2525D or no Modifier 1 Indicator set
        {
            //SIDC positions 5-6 + 19-20 + "2"
            if (SymbolID.getEntity(symbolID) >= 11) {

                mod2ID = symbolID.substring(4, 6) + symbolID.substring(18, 20) + "2";
            }

            else {

                mod2ID = symbolID.substring(4, 6) + "002";
            }


            if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_LandUnit) {
                switch (SymbolID.getModifier2(symbolID)) {
                    case 60:
                    case 62:
                    case 84:
                    case 89: {
                        mod2ID += SVGLookup.getPostFixForIcon(symbolID);
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
        }
        return mod2ID;
    }

    public static getEchelonAmplifier(symbolID: string): string {
        let amp: string;
        let ver: number = SymbolID.getVersion(symbolID);
        if (ver < SymbolID.Version_2525E) {
            amp = symbolID.charAt(3) + symbolID.substring(8, 10);
        }
        else // >= 2525E
        {
            //This will eventually be different with the introduction of the frame shape modifier
            amp = symbolID.charAt(3) + symbolID.substring(8, 10);
        }
        return amp;
    }

    public static getHQTFFD(symbolID: string): string {
        let hqtffd: string;
        let ver: number = SymbolID.getVersion(symbolID);
        if (ver < SymbolID.Version_2525E) {
            hqtffd = symbolID.substring(3, 6) + symbolID.charAt(7);
        }
        else // >= 2525E
        {
            //This will eventually be different with the introduction of the frame shape modifier
            hqtffd = symbolID.substring(3, 6) + symbolID.charAt(7);
        }
        return hqtffd;
    }

    public static getOCA(symbolID: string, useSlash: boolean): string | null {
        if (useSlash) {
            let status: number = SymbolID.getStatus(symbolID);
            if (status === SymbolID.Status_Present_Damaged || status === SymbolID.Status_Present_Destroyed) {

                return status.toString();
            }

            else {

                return null;
            }

        }
        else//get the bar
        {
            let oca: string;
            let ver: number = SymbolID.getVersion(symbolID);
            if (ver < SymbolID.Version_2525E) {
                oca = symbolID.substring(2, 7) + "2";
            }
            else // >= 2525E
            {
                //This will eventually be different with the introduction of the frame shape modifier
                oca = symbolID.substring(2, 7) + "2";
            }
            return oca;
        }
    }

    public static getAllKeys(): Array<string> {
        let kl: Array<string> = new Array();
        let keys: any = SVGLookup._SVGLookupD.keys();//keys is an iterator
        
        for(const value of keys)
        {
            kl.push(value);
        }
        return kl;
    }

    public addCustomSymbol(svgInfo:SVGInfo, version:number):boolean
    {
        let success:boolean = false;
        try
        {
            let basicID = svgInfo.getID();
            if (version < SymbolID.Version_2525E) 
            {
                if(SVGLookup._SVGLookupD.has(svgInfo.getID()) == false)
                {
                    SVGLookup._SVGLookupD.set(svgInfo.getID(),svgInfo);
                }
            }
            else if (version === SymbolID.Version_2525E) 
            {
                if(SVGLookup._SVGLookupE.has(svgInfo.getID()) == false)
                {
                    SVGLookup._SVGLookupE.set(svgInfo.getID(),svgInfo);
                }
            }
        }
        catch(e)
        {
            ErrorLogger.LogException("SVGLookup","addCUstomSymbol",e);
        }
        return success;
    }

}


