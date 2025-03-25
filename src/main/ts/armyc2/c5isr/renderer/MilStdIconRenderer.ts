
import { type int } from "../graphics2d/BasicTypes";

import { SinglePointSVGRenderer } from "../renderer/SinglePointSVGRenderer"
import { DrawRules } from "../renderer/utilities/DrawRules"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { GENCLookup } from "../renderer/utilities/GENCLookup"
import { ImageInfo } from "../renderer/utilities/ImageInfo"
import { MilStdAttributes } from "../renderer/utilities/MilStdAttributes"
import { MSInfo } from "../renderer/utilities/MSInfo"
import { MSLookup } from "../renderer/utilities/MSLookup"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { RendererUtilities } from "../renderer/utilities/RendererUtilities"
import { SVGInfo } from "../renderer/utilities/SVGInfo"
import { SVGLookup } from "../renderer/utilities/SVGLookup"
import { SVGSymbolInfo } from "../renderer/utilities/SVGSymbolInfo"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { LogLevel } from "./utilities/LogLevel";
import { SymbolUtilities } from "./utilities/SymbolUtilities";


/**
 * This class is used for rendering icons that represent the single point graphics in the MilStd 2525.
 * It can also be used for rendering icon previews for multipoint graphics.
 */
export class MilStdIconRenderer
/* implements IIconRenderer */ {

    private TAG: string = "MilStdIconRenderer";

    private static _instance: MilStdIconRenderer;
    private _initSuccess: boolean = false;
    //private _SPR: SinglePointRenderer;
    private _SPSVGR: SinglePointSVGRenderer;

    private constructor() {
        this.init();
    }

    public static getInstance(): MilStdIconRenderer {
        if (!MilStdIconRenderer._instance) {
            MilStdIconRenderer._instance = new MilStdIconRenderer();
        }
        return MilStdIconRenderer._instance;
    }

    /**
     *
     *
     */
    private init(): void// List<Typeface> fonts, List<String> xml
    {
        try {
            if (!this._initSuccess) {

                //Make sure Lookups are loaded in init so they're not loaded during the first render call
                SVGLookup.getInstance();
                MSLookup.getInstance();

                //test SVGLookup////////////////////////////////////////////////////////////////////
                /*SVGInfo oct = SVGLookup.getInstance().getSVGLInfo("octagon");
                console.log(oct.toString());*/

                //test MSLookup/////////////////////////////////////////////////////////////////////
                /*MSInfo msi = MSLookup.getInstance().getMSLInfo("50110100",0);//
                msi = MSLookup.getInstance().getMSLInfo("36190100",0);//"Non-Mine Mine–Like Object, Bottom"
                console.log(msi.getPath());
                console.log(msi.getName());
                msi = MSLookup.getInstance().getMSLInfo("01110300",0);//"Unmanned Aircraft (UA) / Unmanned Aerial Vehicle (UAV) / Unmanned Aircraft System (UAS) / Remotely Piloted Vehicle (RPV)"
                console.log(msi.getPath());
                console.log(msi.getName());//*/

                // setup single point renderer
                //this._SPR = SinglePointRenderer.getInstance();
                this._SPSVGR = SinglePointSVGRenderer.getInstance();

                //Load country codes
                GENCLookup.getInstance();

                this._initSuccess = true;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(this.TAG, "init", exc);
            } else {
                throw exc;
            }
        }
    }

    public isReady(): boolean {
        return this._initSuccess;
    }

    // @Override

    /**
     * Checks symbol codes and returns whether they can be rendered.
     * For multi-point graphics, modifiers are ignored because we don't need that
     * information to show preview icons in the SymbolPicker.
     *
     * @param symbolID 20-30 digit 2525D Symbol ID Code
     * @param attributes (currently unused)
     * @return true if the basic form of the graphic can be rendered
     */
    public CanRender(symbolID: string, attributes: Map<string, string>): boolean {
        let message: string = "";
        try {
            // Extract 8-digit ID to use with SVGLookup.
            // MSLookup can handle long codes, but SVGLookup can't because it also takes other strings.
            let lookupID: string = SymbolUtilities.getBasicSymbolID(symbolID);
            let lookupSVGID: string = SVGLookup.getMainIconID(symbolID);

            // Renderer only supports 2525D at the moment. 2525E will be in the future.
            /*
            int symStd = -1;
            int version = SymbolID.getVersion(symbolID);
            //SymbolID.Version_2525Dch1
            //SymbolID.Version_2525E
            */

            let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);
            if (msi == null) {
                message = `Cannot find ${lookupID} in MSLookup`
            } else {
                if (msi.getDrawRule() === DrawRules.DONOTDRAW) {
                    message = `${lookupID} (${msi.getName()}) is DoNotDraw`
                } else {
                    let version: int = SymbolID.getVersion(symbolID);
                    let si: SVGInfo = SVGLookup.getInstance().getSVGLInfo(lookupSVGID, version);
                    if (si != null)// || (SymbolID.getEntityCode(symbolID)==000000 && SVGLookup.getInstance().getSVGLInfo(SVGLookup.getFrameID(symbolID)) != null))
                    {
                        return true;
                    }
                    else {
                        message = `Cannot find ${lookupID} (${msi.getName()}) in SVGLookup`;
                    }
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("MilStdIconRenderer", "CanRender", exc);
            } else {
                throw exc;
            }
        }
        ErrorLogger.LogMessage("MilStdIconRenderer", "CanRender()", message, LogLevel.FINE);
        //ErrorLogger.LogMessage("MilStdIconRenderer", "CanRender", message);
        return false;
    }


    public RenderSVG(symbolID: string, modifiers: Map<string, string>,
        attributes: Map<string, string>): SVGSymbolInfo | null {

        //Update to use _SPSVGR.RenderUnit
        let ss: int = SymbolID.getSymbolSet(symbolID);

        let temp: ImageInfo;
        let svgTemp: SVGSymbolInfo;
        let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);
        if (msi == null) 
        {
            //TODO: if null, try to fix the code so that something renders
            //This check currently happening in RenderUnit & RenderSP via renconcileSymbolID()
            //Checks for bad codes and tries to resolve.  IF it can't returns unknown symbol.
        }
        if (msi != null && msi.getDrawRule() === DrawRules.DONOTDRAW) {
            return null;
        }

        //Check in case attributes are something other than Map<string,string>, null or undefined
        if(attributes != null && attributes instanceof Map === false)
            attributes = new Map<string,string>();
        if(modifiers != null && modifiers instanceof Map === false)
            modifiers = new Map<string,string>();

        if (ss === SymbolID.SymbolSet_ControlMeasure) 
        {
            if (msi != null) 
            {
                //Point12 is actually a multipoint and 17 & 18 are rectangular target and sector range fan
                if (SymbolUtilities.isMultiPoint(symbolID) === false) {
                    svgTemp = this._SPSVGR.RenderSP(symbolID, modifiers, attributes);
                } else {
                    svgTemp = this._SPSVGR.RenderSP(symbolID, null, attributes);
                }
            }
        }
        else if (ss === SymbolID.SymbolSet_Atmospheric ||
                ss === SymbolID.SymbolSet_Oceanographic ||
                ss === SymbolID.SymbolSet_MeteorologicalSpace) 
        {
            svgTemp = this._SPSVGR.RenderSP(symbolID, modifiers, attributes);
        }
        else 
        {
            svgTemp = this._SPSVGR.RenderUnit(symbolID, modifiers, attributes);
        }

        return svgTemp;
    }

    public AddCustomSymbol(msInfo:MSInfo,svgInfo:SVGInfo):boolean
    {
        let success:boolean = false;
        if(msInfo.getBasicSymbolID()===svgInfo.getID())//Make sure IDs match
        {
            //Make sure entry isn't already there
            if(MSLookup.getInstance().getMSLInfo(msInfo.getBasicSymbolID(),msInfo.getVersion())==null &&
                SVGLookup.getInstance().getSVGLInfo(svgInfo.getID(),msInfo.getVersion())==null)
                {
                    if(MSLookup.getInstance().addCustomSymbol(msInfo))
                        success = SVGLookup.getInstance().addCustomSymbol(svgInfo,msInfo.getVersion());
                }

        }
        else
        {
            ErrorLogger.LogMessage("Symbol Set and Entity Codes do not match", LogLevel.INFO,false);
        }
        return success;
    }


    /*private getDefaultAttributes(symbolID: string): Map<string, string> | null {
        let map: Map<string, string> = new Map<string, string>();
        try {
            if (symbolID == null || symbolID.length !== 15) {
                if (symbolID == null) {
                    symbolID = "null";
                }
                ErrorLogger.LogMessage("MilStdIconRenderer", "getDefaultAttributes",
                    "getDefaultAttributes passed bad symbolID: " + symbolID);
                return null;
            }

            map.set(MilStdAttributes.Alpha, "255");
            if (SymbolUtilities.hasDefaultFill(symbolID)) {
                map.set(MilStdAttributes.FillColor,
                    RendererUtilities.colorToHexString(SymbolUtilities.getFillColorOfAffiliation(symbolID), false));
            }

            map.set(MilStdAttributes.LineColor,
                RendererUtilities.colorToHexString(SymbolUtilities.getLineColorOfAffiliation(symbolID), false));

            map.set(MilStdAttributes.OutlineSymbol, "false");
            // attribute[MilStdAttributes.SymbolOutlineColor] = null;
            // map.set(MilStdAttributes.OutlineWidth,"1");

            map.set(MilStdAttributes.DrawAsIcon, "false");

            let rs: RendererSettings = RendererSettings.getInstance();

            map.set(MilStdAttributes.KeepUnitRatio, "true");
            return map;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("MilStdIconRenderer", "getDefaultAttributes", exc);
            } else {
                throw exc;
            }
        }
        return map;
    }//*/

}
