import { Area } from "../graphics2d/Area"
import { BasicStroke } from "../graphics2d/BasicStroke"
import { Point } from "../graphics2d/Point"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { TexturePaint } from "../graphics2d/TexturePaint"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { PatternFillRenderer } from "../renderer/PatternFillRenderer"
import { Color } from "../renderer/utilities/Color"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { RendererException } from "../renderer/utilities/RendererException"
import { ShapeInfo } from "../renderer/utilities/ShapeInfo"
import { clsUtility as clsUtilityJTR } from "../JavaTacticalRenderer/clsUtility";

import { type int, type double } from "../../c5isr/graphics2d/BasicTypes";

/**
 * Server general utility class
 *
 */
export class clsUtility {
    private static readonly _className: string = "clsUtility";
    public static readonly Hatch_ForwardDiagonal: int = 2;
    public static readonly Hatch_BackwardDiagonal: int = 3;
    public static readonly Hatch_Vertical: int = 4;
    public static readonly Hatch_Horizontal: int = 5;
    public static readonly Hatch_Cross: int = 8;

    /**
     * Adds hatch fill to shapes via PatternFillRendererD.MakeHatchPatternFill() or buildHatchFill()
     * @param tg
     * @param shapes
     */
    static addHatchFills(tg: TGLight, shapes: Array<ShapeInfo>): void {
        try {
            if (shapes == null || shapes.length === 0) {

                return;
            }


            let lineType: int = tg.get_LineType();
            let hatchStyle: int = tg.get_FillStyle();
            let j: int = 0;
            let hatch2: int = 0;
            let shape2: Shape2;
            let index: int = 0;
            let hatchLineThickness: double = (tg.get_LineThickness() / 2.0) as double;
            let hatchColor: Color = tg.get_LineColor();
            let hatchSpacing: int = Math.trunc(hatchLineThickness * 10);

            //            if(armyc2.c5isr.JavaTacticalRenderer.clsUtility.isClosedPolygon(lineType)==false)
            //                if(armyc2.c5isr.JavaTacticalRenderer.clsUtility.IsChange1Area(lineType, null)==false)
            //                    return;
            if (clsUtilityJTR.isClosedPolygon(lineType) === false) {
                if (clsUtilityJTR.IsChange1Area(lineType) === false) {
                    return;
                }
            }

            switch (lineType) {
                case TacticalLines.NFA:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.LAA: {
                    hatchStyle = clsUtility.Hatch_BackwardDiagonal;
                    break;
                }

                case TacticalLines.BIO:
                case TacticalLines.NUC:
                case TacticalLines.CHEM:
                case TacticalLines.RAD: {
                    hatchStyle = clsUtility.Hatch_BackwardDiagonal;
                    hatchColor = Color.yellow;
                    hatchLineThickness = tg.get_LineThickness();
                    break;
                }

                case TacticalLines.WFZ: {
                    hatchStyle = clsUtility.Hatch_BackwardDiagonal;
                    if (tg.get_LineColor() === Color.BLACK) {

                        hatchColor = Color.GRAY;
                    }

                    hatchSpacing = Math.trunc(hatchSpacing / 2);
                    break;
                }

                case TacticalLines.OBSAREA: {
                    //CPOF client required adding a simple shape for
                    //setting texturepaint which WebRenderer does not use
                    for (j = 0; j < shapes.length; j++) {
                        let shape: ShapeInfo = shapes[j];
                        let color: Color = shape.getLineColor();
                        if (color == null) {

                            continue;
                        }

                        //if(shape.getLineColor().getRGB()==0)
                        if (shape.getLineColor().toRGB() === 0) {

                            shapes.splice(j, 1);
                        }

                    }
                    hatchStyle = clsUtility.Hatch_BackwardDiagonal;
                    hatchSpacing = Math.trunc(hatchSpacing * 1.25);
                    break;
                }

                default: {
                    if (hatchStyle <= 0) {

                        return;
                    }

                    break;
                }

            }
            //get the index of the shape with the same fillstyle
            let n: int = shapes.length;
            //for(j=0;j<shapes.length;j++)
            for (j = 0; j < n; j++) {
                shape2 = shapes[j] as Shape2;
                hatch2 = shape2.getFillStyle();
                if (hatch2 === hatchStyle) {
                    index = j;
                    break;
                }
            }
            n = shapes.length;
            //for(int k=0;k<shapes.length;k++)
            for (let k: int = 0; k < n; k++) {
                //the outline should always be the 0th shape for areas
                let shape: ShapeInfo;
                if (lineType === TacticalLines.RANGE_FAN || lineType === TacticalLines.RANGE_FAN_SECTOR || lineType === TacticalLines.RADAR_SEARCH) {
                    shape = shapes[k];
                    shape2 = shapes[k] as Shape2;
                    hatchStyle = shape2.getFillStyle();
                }
                else {

                    shape = shapes[index];
                }


                if (hatchStyle < clsUtility.Hatch_ForwardDiagonal) {
                    //Hatch_ForwardDiagonal is the 0th hatch element
                    continue;
                }


                if (tg.get_UseHatchFill()) {
                    let hatchImg = PatternFillRenderer.MakeHatchPatternFill(hatchStyle, hatchSpacing, hatchLineThickness as int, hatchColor);
                    shape.setPatternFillImage(hatchImg);
                }
                else {
                    if (hatchStyle !== clsUtility.Hatch_Cross) {
                        let shape3: Shape2 = clsUtility.buildHatchArea(tg, shape, hatchStyle, hatchSpacing);
                        //shape.setStroke(new BasicStroke(1));
                        shape3.setStroke(new BasicStroke(hatchLineThickness));
                        shape3.setLineColor(hatchColor);
                        shapes.push(shape3);
                    }
                    else    //cross hatch
                    {
                        let shapeBk: Shape2 = clsUtility.buildHatchArea(tg, shape, clsUtility.Hatch_BackwardDiagonal, hatchSpacing);
                        let shapeFwd: Shape2 = clsUtility.buildHatchArea(tg, shape, clsUtility.Hatch_ForwardDiagonal, hatchSpacing);
                        //shapeBk.setStroke(new BasicStroke(1));
                        shapeBk.setStroke(new BasicStroke(hatchLineThickness));
                        shapeBk.setLineColor(hatchColor);
                        shapes.push(shapeBk);
                        //shapeFwd.setStroke(new BasicStroke(1));
                        shapeFwd.setStroke(new BasicStroke(hatchLineThickness));
                        shapeFwd.setLineColor(hatchColor);
                        shapes.push(shapeFwd);
                    }
                }

                if (lineType !== TacticalLines.RANGE_FAN && lineType !== TacticalLines.RANGE_FAN_SECTOR && lineType !== TacticalLines.RADAR_SEARCH) {

                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "addHatchFills",
                    new RendererException("Failed inside addHatchFills", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Build Hatch fill. Does not use texture paint or shader.
     * @param tg
     * @param shape
     * @param hatchStyle
     * @return
     */
    static buildHatchArea(tg: TGLight, shape: ShapeInfo, hatchStyle: int, spacing: double): Shape2 {
        let hatchLineShape: Shape2;
        try {
            hatchLineShape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
            let hatchLineArea: Area;
            let rect: Rectangle = shape.getBounds();
            let x0: double = rect.getX();
            let y0: double = rect.getY();
            let width: double = rect.getWidth();
            let height: double = rect.getHeight();
            //we need a square
            if (width > height) {

                height = width;
            }

            else {

                width = height;
            }


            //diagnostic
            if (tg.get_UseHatchFill()) {
                //                hatchLineShape.moveTo(new POINT2(x0,y0));
                //                hatchLineShape.lineTo(new POINT2(x0+width,y0));
                //                hatchLineShape.lineTo(new POINT2(x0+width,y0+width));
                //                hatchLineShape.lineTo(new POINT2(x0,y0+width));
                hatchLineShape.setFillStyle(hatchStyle);
                //                hatchLineShape.lineTo(new POINT2(x0,y0));
                //                Area shapeArea=new Area(shape.getShape());
                //                hatchLineArea=new Area(hatchLineShape.getShape());
                //                //intersect the hatch lines with the original shape area to get the fill
                //                hatchLineArea.intersect(shapeArea);
                //                hatchLineShape.setShape(hatchLineArea);
                hatchLineShape.setShape(lineutility.createStrokedShape(shape.getShape()));
                return hatchLineShape;
            }
            //end section

            width *= 2;
            height *= 2;
            //the next two values should be equal
            let horizLimit: int = 0;
            let vertLimit: int = 0;
            let j: int = 0;
            let vertPts: Array<POINT2> = new Array();
            let horizPts: Array<POINT2> = new Array();
            let vertPt: POINT2;
            let horizPt: POINT2;
            if (hatchStyle === clsUtility.Hatch_BackwardDiagonal) {
                horizLimit = Math.trunc(width / spacing);
                vertLimit = Math.trunc(height / spacing);
                for (j = 0; j < vertLimit; j++) {
                    vertPt = new POINT2(x0, y0 + spacing * j);
                    vertPts.push(vertPt);
                }
                for (j = 0; j < horizLimit; j++) {
                    horizPt = new POINT2(x0 + spacing * j, y0);
                    horizPts.push(horizPt);
                }

                hatchLineShape.moveTo(new POINT2(x0 - spacing / 2, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0, y0));
                for (j = 0; j < vertLimit; j++) {
                    if (j % 2 === 0) {
                        hatchLineShape.lineTo(vertPts[j]);
                        hatchLineShape.lineTo(horizPts[j]);
                    }
                    else {
                        hatchLineShape.lineTo(horizPts[j]);
                        hatchLineShape.lineTo(vertPts[j]);
                    }
                }
                //go outside the bottom right corner to complete a valid area
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing / 2, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 - spacing / 2, y0 - spacing / 2));
            }
            if (hatchStyle === clsUtility.Hatch_ForwardDiagonal) {
                horizLimit = Math.trunc(width / spacing);
                vertLimit = Math.trunc(height / spacing);
                width /= 2;
                for (j = 0; j < vertLimit; j++) {
                    vertPt = new POINT2(x0 + width, y0 + spacing * j);
                    vertPts.push(vertPt);
                }
                for (j = 0; j < horizLimit; j++) {
                    horizPt = new POINT2(x0 + width - spacing * j, y0);
                    horizPts.push(horizPt);
                }

                hatchLineShape.moveTo(new POINT2(x0 + width + spacing / 2, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0, y0));
                for (j = 0; j < vertLimit; j++) {
                    if (j % 2 === 0) {
                        hatchLineShape.lineTo(vertPts[j]);
                        hatchLineShape.lineTo(horizPts[j]);
                    }
                    else {
                        hatchLineShape.lineTo(horizPts[j]);
                        hatchLineShape.lineTo(vertPts[j]);
                    }
                }
                //go outside the bottom left corner to complete a valid area
                hatchLineShape.lineTo(new POINT2(x0 - spacing / 2, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 - spacing, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 - spacing, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing / 2, y0 - spacing / 2));
            }
            if (hatchStyle === clsUtility.Hatch_Vertical) {
                horizLimit = Math.trunc(width / (spacing / 2));
                vertLimit = Math.trunc(height / (spacing / 2));
                for (j = 0; j < horizLimit; j++) {
                    if (j % 2 === 0) {
                        vertPt = new POINT2(x0 + spacing / 2 * j, y0);
                        vertPts.push(vertPt);
                        vertPt = new POINT2(x0 + spacing / 2 * j, y0 + height);
                        vertPts.push(vertPt);
                    }
                    else {
                        vertPt = new POINT2(x0 + spacing / 2 * j, y0 + height);
                        vertPts.push(vertPt);
                        vertPt = new POINT2(x0 + spacing / 2 * j, y0);
                        vertPts.push(vertPt);
                    }
                }
                hatchLineShape.moveTo(new POINT2(x0 - spacing / 2, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0, y0));
                for (j = 0; j < vertLimit - 1; j++) {
                    hatchLineShape.lineTo(vertPts[j]);
                }
                //go outside the bottom right corner to complete a valid area
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing / 2, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 - spacing / 2, y0 - spacing / 2));
            }
            if (hatchStyle === clsUtility.Hatch_Horizontal) {
                horizLimit = Math.trunc(width / (spacing / 2));
                vertLimit = Math.trunc(height / (spacing / 2));
                for (j = 0; j < vertLimit; j++) {
                    if (j % 2 === 0) {
                        horizPt = new POINT2(x0, y0 + spacing / 2 * j);
                        horizPts.push(horizPt);
                        horizPt = new POINT2(x0 + width, y0 + spacing / 2 * j);
                        horizPts.push(horizPt);
                    }
                    else {
                        horizPt = new POINT2(x0 + width, y0 + spacing / 2 * j);
                        horizPts.push(horizPt);
                        horizPt = new POINT2(x0, y0 + spacing / 2 * j);
                        horizPts.push(horizPt);
                    }
                }
                hatchLineShape.moveTo(new POINT2(x0 - spacing / 2, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0, y0));
                for (j = 0; j < vertLimit - 1; j++) {
                    hatchLineShape.lineTo(horizPts[j]);
                }
                //go outside the bottom left corner to complete a valid area
                hatchLineShape.lineTo(new POINT2(x0 - spacing / 2, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 - spacing, y0 + height + spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 - spacing, y0 - spacing / 2));
                hatchLineShape.lineTo(new POINT2(x0 + width + spacing / 2, y0 - spacing / 2));
            }

            let shapeArea: Area = new Area(shape.getShape());
            hatchLineArea = new Area(hatchLineShape.getShape());
            //intersect the hatch lines with the original shape area to get the fill
            hatchLineArea.intersect(shapeArea);
            hatchLineShape.setShape(hatchLineArea);
            //return null;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "buildHatchArea",
                    new RendererException("Failed inside buildHatchArea", exc));
            } else {
                throw exc;
            }
        }
        return hatchLineShape;
    }

    protected static POINT2ToPoint(pt2: POINT2): Point {
        let pt: Point = new Point();
        pt.x = pt2.x as int;
        pt.y = pt2.y as int;
        return pt;
    }
    protected static PointToPOINT2(pt: Point): POINT2 {
        let pt2: POINT2 = new POINT2(pt.x, pt.y);
        return pt2;
    }
    protected static POINT2ToPoint2D(pt2: POINT2): Point2D {
        let pt2d: Point2D = new Point2D(pt2.x, pt2.y);
        return pt2d;
    }
    static Points2DToPOINT2(pts2d: Array<Point2D>): Array<POINT2> {
        let pts: Array<POINT2> = new Array();
        let pt: POINT2;
        let n: int = pts2d.length;
        //for(int j=0;j<pts2d.length;j++)        
        for (let j: int = 0; j < n; j++) {
            pt = new POINT2(pts2d[j].getX(), pts2d[j].getY());
            pts.push(pt);
        }
        return pts;
    }
    static Point2DToPOINT2(pt2d: Point2D): POINT2 {
        let pt2: POINT2 = new POINT2(pt2d.getX(), pt2d.getY());
        return pt2;
    }
    /**
     * @deprecated   
     * @param tg
     * @return 
     */
    protected static addModifiersBeforeClipping(tg: TGLight): boolean {
        let result: boolean = false;
        let linetype: int = tg.get_LineType();
        switch (linetype) {
            case TacticalLines.TORPEDO:
            case TacticalLines.OPTICAL:
            case TacticalLines.ELECTRO:
            case TacticalLines.BEARING_EW:
            case TacticalLines.ACOUSTIC:
            case TacticalLines.ACOUSTIC_AMB:
            case TacticalLines.BEARING:
            case TacticalLines.BEARING_J:
            case TacticalLines.BEARING_RDF:
            case TacticalLines.MSR:
            case TacticalLines.MSR_ONEWAY:
            case TacticalLines.MSR_TWOWAY:
            case TacticalLines.MSR_ALT:
            case TacticalLines.ASR:
            case TacticalLines.ASR_ONEWAY:
            case TacticalLines.ASR_TWOWAY:
            case TacticalLines.ASR_ALT:
            case TacticalLines.ROUTE:
            case TacticalLines.ROUTE_ONEWAY:
            case TacticalLines.ROUTE_ALT:
            case TacticalLines.HCONVOY:
            case TacticalLines.CONVOY:
            case TacticalLines.MFP:
            case TacticalLines.RFL:
            case TacticalLines.NFL:
            case TacticalLines.CFL:
            case TacticalLines.FSCL:
            case TacticalLines.BCL_REVD:
            case TacticalLines.BCL:
            case TacticalLines.ICL:
            case TacticalLines.IFF_OFF:
            case TacticalLines.IFF_ON:
            case TacticalLines.GENERIC_LINE:
            case TacticalLines.FPF:
            case TacticalLines.LINTGT:
            case TacticalLines.LINTGTS:
            case TacticalLines.MSDZ:
            case TacticalLines.GAP:
            case TacticalLines.IL:
            case TacticalLines.DIRATKAIR:
            case TacticalLines.PDF:
            case TacticalLines.AC:
            case TacticalLines.SAAFR:
            case TacticalLines.LLTR:
            case TacticalLines.SC:
            case TacticalLines.MRR:
            case TacticalLines.SL:
            case TacticalLines.TC:
            case TacticalLines.BOUNDARY:
            case TacticalLines.WDRAWUP:
            case TacticalLines.WITHDRAW:
            case TacticalLines.RETIRE:
            case TacticalLines.FPOL:
            case TacticalLines.RPOL:
            case TacticalLines.RIP:
            case TacticalLines.DELAY:
            case TacticalLines.CATK:
            case TacticalLines.CATKBYFIRE:
            case TacticalLines.SCREEN:
            case TacticalLines.COVER:
            case TacticalLines.GUARD:
            case TacticalLines.FLOT:
            case TacticalLines.LC:
            case TacticalLines.PL:
            case TacticalLines.FEBA:
            case TacticalLines.LL:
            case TacticalLines.EWL:
            case TacticalLines.FCL:
            case TacticalLines.HOLD:
            case TacticalLines.BRDGHD:
            case TacticalLines.HOLD_GE:
            case TacticalLines.BRDGHD_GE:
            case TacticalLines.LOA:
            case TacticalLines.LOD:
            case TacticalLines.LDLC:
            case TacticalLines.PLD:
            case TacticalLines.RELEASE:
            case TacticalLines.HOL:
            case TacticalLines.BHL: {
                result = true;
                break;
            }

            default: {
                break;
            }

        }
        if (clsUtilityJTR.isClosedPolygon(linetype) === true) {

            result = true;
        }

        return result;
    }

    /**
     * @deprecated
     */
    protected static FilterPoints(tg: TGLight): void {
        try {
            let lineType: int = tg.get_LineType();
            let minSpikeDistance: double = 0;
            switch (lineType) {
                //case TacticalLines.LC:
                case TacticalLines.ATDITCH:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.FLOT:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.FORTL:
                case TacticalLines.STRONG: {
                    minSpikeDistance = 25;
                    break;
                }

                case TacticalLines.LC:
                case TacticalLines.OBSAREA:
                case TacticalLines.OBSFAREA:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ZONE:
                case TacticalLines.LINE:
                case TacticalLines.ATWALL:
                case TacticalLines.UNSP:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE: {
                    minSpikeDistance = 35;
                    break;
                }

                case TacticalLines.UCF:
                case TacticalLines.CF:
                case TacticalLines.CFG:
                case TacticalLines.CFY: {
                    minSpikeDistance = 60;
                    break;
                }

                case TacticalLines.SF:
                case TacticalLines.USF:
                case TacticalLines.OCCLUDED:
                case TacticalLines.UOF: {
                    minSpikeDistance = 60;//was 120
                    break;
                }

                case TacticalLines.SFG:
                case TacticalLines.SFY: {
                    minSpikeDistance = 60;//was 180
                    break;
                }

                case TacticalLines.WFY:
                case TacticalLines.WFG:
                case TacticalLines.OFY: {
                    minSpikeDistance = 60;//was 120
                    break;
                }

                case TacticalLines.WF:
                case TacticalLines.UWF: {
                    minSpikeDistance = 40;
                    break;
                }


                case TacticalLines.RIDGE:
                case TacticalLines.ICE_EDGE_RADAR:  //METOCs
                case TacticalLines.ICE_OPENINGS_FROZEN:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION: {
                    minSpikeDistance = 35;
                    break;
                }

                default: {
                    return;
                }

            }
            let j: int = 0;
            let dist: double = 0;
            let pts: Array<POINT2> = new Array();
            let ptsGeo: Array<POINT2> = new Array();
            pts.push(tg.Pixels[0]);
            ptsGeo.push(tg.LatLongs[0]);
            let lastGoodPt: POINT2 = tg.Pixels[0];
            let currentPt: POINT2;
            let currentPtGeo: POINT2;
            let foundGoodPt: boolean = false;
            let n: int = tg.Pixels.length;
            //for(j=1;j<tg.Pixels.length;j++)
            for (j = 1; j < n; j++) {
                //we can not filter out the original end points
                currentPt = tg.Pixels[j];
                currentPtGeo = tg.LatLongs[j];
                if (currentPt.style === -1) {
                    lastGoodPt = currentPt;
                    pts.push(currentPt);
                    ptsGeo.push(currentPtGeo);
                    foundGoodPt = true;
                    currentPt.style = 0;
                    continue;
                }
                dist = lineutility.CalcDistanceDouble(lastGoodPt, currentPt);
                switch (lineType) {
                    case TacticalLines.LC: {
                        if (dist > minSpikeDistance) {
                            lastGoodPt = currentPt;
                            pts.push(currentPt);
                            ptsGeo.push(currentPtGeo);
                            foundGoodPt = true;
                        }
                        else {   //the last point is no good
                            //replace the last good point with the last point
                            if (j === tg.Pixels.length - 1) {
                                pts[pts.length - 1] = currentPt;
                                ptsGeo[ptsGeo.length - 1] = currentPtGeo;
                            }
                        }
                        break;
                    }

                    default: {
                        if (dist > minSpikeDistance || j === tg.Pixels.length - 1) {
                            lastGoodPt = currentPt;
                            pts.push(currentPt);
                            ptsGeo.push(currentPtGeo);
                            foundGoodPt = true;
                        }
                        break;
                    }

                }
            }
            if (foundGoodPt === true) {
                tg.Pixels = pts;
                tg.LatLongs = ptsGeo;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsUtility", "FilterPoints",
                    new RendererException("Failed inside FilterPoints", exc));

            } else {
                throw exc;
            }
        }
    }

    public static PixelsToLatLong(pts: Array<POINT2>, converter: IPointConversion): Array<POINT2> {
        let j: int = 0;
        let pt: POINT2;
        let ptGeo: POINT2;
        let ptsGeo: Array<POINT2> = new Array();
        let n: int = pts.length;
        //for(j=0;j<pts.length;j++)
        for (j = 0; j < n; j++) {
            pt = pts[j];
            ptGeo = clsUtility.PointPixelsToLatLong(pt, converter);
            ptsGeo.push(ptGeo);
        }
        return ptsGeo;
    }

    static LatLongToPixels(pts: Array<POINT2>, converter: IPointConversion): Array<POINT2> {
        let j: int = 0;
        let pt: POINT2;
        let ptPixels: POINT2;
        let ptsPixels: Array<POINT2> = new Array();
        let n: int = pts.length;
        //for(j=0;j<pts.length;j++)
        for (j = 0; j < n; j++) {
            pt = pts[j];
            ptPixels = clsUtility.PointLatLongToPixels(pt, converter);
            ptsPixels.push(ptPixels);
        }
        return ptsPixels;
    }

    private static PointLatLongToPixels(ptLatLong: POINT2, converter: IPointConversion): POINT2 {
        let pt2: POINT2 = new POINT2();
        let pt2d: Point2D = clsUtility.POINT2ToPoint2D(ptLatLong);
        pt2d = converter.GeoToPixels(pt2d);
        pt2 = clsUtility.Point2DToPOINT2(pt2d);
        pt2.style = ptLatLong.style;
        return pt2;
    }

    static FilterAXADPoints(tg: TGLight, converter: IPointConversion): void {
        try {
            let lineType: int = tg.get_LineType();
            switch (lineType) {
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.SPT:
                case TacticalLines.MAIN: {
                    break;
                }

                default: {
                    return;
                }

            }
            let j: int = 0;
            let pts: Array<POINT2> = new Array();
            let ptsGeo: Array<POINT2> = new Array();
            let pt0: POINT2 = tg.Pixels[0];
            let pt1: POINT2 = tg.Pixels[1];

            let pt: Point2D = new Point2D(pt1.x, pt1.y);
            let pt1Geo2d: Point2D = converter.PixelsToGeo(pt);

            let pt1geo: POINT2 = new POINT2(pt1Geo2d.getX(), pt1Geo2d.getY());
            let ptj: POINT2;
            let ptjGeo: POINT2;
            let controlPt: POINT2 = tg.Pixels[tg.Pixels.length - 1]; //the control point
            let pt0Relative: POINT2 = lineutility.PointRelativeToLine(pt0, pt1, pt0, controlPt);
            let relativeDist: double = lineutility.CalcDistanceDouble(pt0Relative, controlPt);
            relativeDist += 5;
            let pt0pt1dist: double = lineutility.CalcDistanceDouble(pt0, pt1);
            let foundGoodPoint: boolean = false;
            if (relativeDist > pt0pt1dist) {
                //first point is too close, begin rebuilding the arrays
                pts.push(pt0);
                pt = new Point2D(pt0.x, pt0.y);
                pt1Geo2d = converter.PixelsToGeo(pt);

                pt1geo = new POINT2(pt1Geo2d.getX(), pt1Geo2d.getY());
                ptsGeo.push(pt1geo);
                //create a good first point and add it to the array
                pt1 = lineutility.ExtendAlongLineDouble(pt0, pt1, relativeDist);
                pts.push(pt1);

                pt = new Point2D(pt1.x, pt1.y);
                pt1Geo2d = converter.PixelsToGeo(pt);
                pt1geo = new POINT2(pt1Geo2d.getX(), pt1Geo2d.getY());
                ptsGeo.push(pt1geo);
            }
            else {
                //the first point is good, there is no need to do anything
                foundGoodPoint = true;
                pts = tg.Pixels;
                ptsGeo = tg.LatLongs;
            }

            //do not add mores points to the array until we find at least one good point
            let n: int = tg.Pixels.length;
            if (foundGoodPoint === false) {
                //for(j=2;j<tg.Pixels.length-1;j++)
                for (j = 2; j < n - 1; j++) {
                    ptj = tg.Pixels[j];
                    ptjGeo = tg.LatLongs[j];
                    if (foundGoodPoint) {
                        //then stuff the remainder of the arrays with the original points
                        pts.push(ptj);
                        ptsGeo.push(ptjGeo);
                    }
                    else    //no good points yet
                    {
                        //calculate the distance and continue if it is no good
                        pt0pt1dist = lineutility.CalcDistanceDouble(pt0, ptj);
                        if (relativeDist > pt0pt1dist) {

                            continue;
                        }

                        else {
                            //found a good point
                            pts.push(ptj);
                            ptsGeo.push(ptjGeo);
                            //set the boolean so that it will stuff the array with the rest of the points
                            foundGoodPoint = true;
                        }
                    }
                }
                //finally add the control point to the arrays and set the arrays
                pts.push(controlPt);
                //pt1Geo2d=converter.convertPixelsToLonLat(controlPt.x, controlPt.y);
                pt = new Point2D(controlPt.x, controlPt.y);
                pt1Geo2d = converter.PixelsToGeo(pt);

                pt1geo = new POINT2(pt1Geo2d.getX(), pt1Geo2d.getY());
                ptsGeo.push(pt1geo);
            }   //end if foundGoodPoint is false

            //add all the successive points which are far enough apart
            let lastGoodPt: POINT2 = pts[1];
            let currentPt: POINT2;
            let currentPtGeo: POINT2;
            let dist: double = 0;
            tg.Pixels = new Array();
            tg.LatLongs = new Array();
            for (j = 0; j < 2; j++) {
                tg.Pixels.push(pts[j]);
                tg.LatLongs.push(ptsGeo[j]);
            }
            n = pts.length;
            //for(j=2;j<pts.length-1;j++)
            for (j = 2; j < n - 1; j++) {
                currentPt = pts[j];
                currentPtGeo = ptsGeo[j];
                dist = lineutility.CalcDistanceDouble(currentPt, lastGoodPt);
                if (dist > 5) {
                    lastGoodPt = currentPt;
                    tg.Pixels.push(currentPt);
                    tg.LatLongs.push(currentPtGeo);
                }
            }
            //add the control point
            tg.Pixels.push(pts[pts.length - 1]);
            tg.LatLongs.push(ptsGeo[ptsGeo.length - 1]);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsUtility", "FilterAXADPoints",
                    new RendererException("Failed inside FilterAXADPoints", exc));

            } else {
                throw exc;
            }
        }
    }
    /**
     *
     * @param tg
     */
    static RemoveDuplicatePoints(tg: TGLight): void {
        try {
            //do not remove autoshape duplicate points
            //            if(isAutoshape(tg))
            //                return;
            switch (tg.get_LineType()) {
                case TacticalLines.SC:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC:
                case TacticalLines.LLTR:
                case TacticalLines.AC:
                case TacticalLines.SAAFR: {
                    break;
                }

                default: {
                    if (clsUtilityJTR.isAutoshape(tg)) {
                        return;
                    }

                }

            }

            //we assume tg.H to have colors if it is comma delimited.
            //only exit if colors are not set
            switch (tg.get_LineType())   //preserve segment data
            {
                case TacticalLines.CATK:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.SPT:
                case TacticalLines.MAIN:
                case TacticalLines.CATKBYFIRE: {	//80
                    return;
                }

                case TacticalLines.BOUNDARY:
                case TacticalLines.MSR:
                case TacticalLines.ASR:
                case TacticalLines.ROUTE: {
                    let strH: string = tg.get_H();
                    if (strH != null && strH.length > 0) {
                        let strs: string[] = strH.split(",");
                        if (strs.length > 1) {

                            return;
                        }

                    }
                    break;
                }

                default: {
                    break;
                }

            }
            let linetype: int = tg.get_LineType();
            if (clsUtilityJTR.IsChange1Area(linetype)) {
                return;
            }


            let ptCurrent: POINT2;
            let ptLast: POINT2;
            let isClosedPolygon: boolean = clsUtilityJTR.isClosedPolygon(tg.get_LineType());
            let minSize: int = 2;
            if (isClosedPolygon) {
                minSize = 3;
            }

            for (let j: int = 1; j < tg.Pixels.length; j++) {
                ptLast = new POINT2(tg.Pixels[j - 1]);
                ptCurrent = new POINT2(tg.Pixels[j]);
                //if(ptCurrent.x==ptLast.x && ptCurrent.y==ptLast.y)
                if (Math.abs(ptCurrent.x - ptLast.x) < 0.5 && Math.abs(ptCurrent.y - ptLast.y) < 0.5) {
                    if (tg.Pixels.length > minSize) {
                        tg.Pixels.splice(j, 1);
                        tg.LatLongs.splice(j, 1);
                        j = 1;
                    }
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsUtility", "RemoveDuplicatePoints",
                    new RendererException("Failed inside RemoveDuplicatePoints", exc));

            } else {
                throw exc;
            }
        }
    }
    static PointPixelsToLatLong(ptPixels: POINT2, converter: IPointConversion): POINT2 {
        let pt2: POINT2 = new POINT2();
        try {
            //Point pt=POINT2ToPoint(ptPixels);
            let pt: Point2D = new Point2D(ptPixels.x, ptPixels.y);
            let pt2d: Point2D = converter.PixelsToGeo(pt);
            pt2 = clsUtility.Point2DToPOINT2(pt2d);
            pt2.style = ptPixels.style;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsUtility", "PointPixelsToLatLong",
                    new RendererException("Could not convert point to geo", exc));
            } else {
                throw exc;
            }
        }
        return pt2;
    }

    static getMBR(clipBounds: Array<Point2D>): Rectangle2D {
        let rect: Rectangle2D;
        try {
            let j: int = 0;
            let pt: Point2D;
            let xmax: double = clipBounds[0].getX();
            let xmin: double = xmax;
            let ymax: double = clipBounds[0].getY();
            let ymin: double = ymax;
            let n: int = clipBounds.length;
            //for(j=0;j<clipBounds.length;j++)
            for (j = 0; j < n; j++) {
                pt = clipBounds[j];
                if (pt.getX() < xmin) {

                    xmin = pt.getX();
                }

                if (pt.getX() > xmax) {

                    xmax = pt.getX();
                }

                if (pt.getY() <= ymin) {

                    ymin = pt.getY();
                }

                if (pt.getY() > ymax) {

                    ymax = pt.getY();
                }

            }
            rect = new Rectangle2D(xmin, ymin, xmax - xmin, ymax - ymin);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "AddBoundaryPointsForLines",
                    new RendererException("Failed inside AddBoundaryPointsForLines", exc));
            } else {
                throw exc;
            }
        }
        return rect;
    }

    static GetMBR(shapes: Array<Shape2>,
        ptUl: POINT2,
        ptUr: POINT2,
        ptLr: POINT2,
        ptLl: POINT2): void {
        try {
            let firstPoint: POINT2 = shapes[0].getPoints()[0];
            ptUl.x = firstPoint.x;
            ptUl.y = firstPoint.y;
            ptUr.x = firstPoint.x;
            ptUr.y = firstPoint.y;
            ptLl.x = firstPoint.x;
            ptLl.y = firstPoint.y;
            ptLr.x = firstPoint.x;
            ptLr.y = firstPoint.y;
            for (let shape of shapes) {
                let points: Array<POINT2> = shape.getPoints();
                for (let j: int = 0; j < points.length; j++) {
                    let x: double = points[j].x;
                    let y: double = points[j].y;
                    if (x < ptLl.x) {
                        ptLl.x = x;
                        ptUl.x = x;
                    }
                    if (x > ptLr.x) {
                        ptLr.x = x;
                        ptUr.x = x;
                    }
                    if (y > ptLl.y) {
                        ptLl.y = y;
                        ptLr.y = y;
                    }
                    if (y < ptUl.y) {
                        ptUl.y = y;
                        ptUr.y = y;
                    }
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtility._className, "GetMBR",
                    new RendererException("Failed inside GetMBR", exc));
            } else {
                throw exc;
            }
        }
    }
}
