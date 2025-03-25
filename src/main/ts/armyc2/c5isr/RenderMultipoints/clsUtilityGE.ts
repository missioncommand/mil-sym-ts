/*
 * A class to create renderables for the ShapeInfo from the GeneralPath
 * This class is used for the GoogleEarth Renderer
 */
import { Area } from "../graphics2d/Area"
import { BasicStroke } from "../graphics2d/BasicStroke"
import { Line2D } from "../graphics2d/Line2D"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point2D } from "../graphics2d/Point2D"
import { Polygon } from "../graphics2d/Polygon"
import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { clsMETOC } from "../JavaTacticalRenderer/clsMETOC";
import { clsUtility as clsUtilityJTR } from "../JavaTacticalRenderer/clsUtility";
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { Color } from "../renderer/utilities/Color"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"
import { ShapeInfo } from "../renderer/utilities/ShapeInfo"
import { clsUtility } from "./clsUtility";

import { type int, type double } from "../../c5isr/graphics2d/BasicTypes";

/**
 * Utilities require for GoogleEarth functionality
 *
 */
export class clsUtilityGE {
    private static readonly _className: string = "clsUtilityGE";
    static setSplineLinetype(tg: TGLight): void {
        switch (tg.get_LineType()) {
            case TacticalLines.BRDGHD: {
                tg.set_LineType(TacticalLines.BRDGHD_GE);
                break;
            }

            case TacticalLines.HOLD: {
                tg.set_LineType(TacticalLines.HOLD_GE);
                break;
            }

            case TacticalLines.ICE_OPENINGS_FROZEN: {
                tg.set_LineType(TacticalLines.ICE_OPENINGS_FROZEN_GE);
                break;
            }

            case TacticalLines.ICE_OPENINGS_LEAD: {
                tg.set_LineType(TacticalLines.ICE_OPENINGS_LEAD_GE);
                break;
            }

            case TacticalLines.ICE_EDGE_RADAR: {
                tg.set_LineType(TacticalLines.ICE_EDGE_RADAR_GE);
                break;
            }

            case TacticalLines.CRACKS_SPECIFIC_LOCATION: {
                tg.set_LineType(TacticalLines.CRACKS_SPECIFIC_LOCATION_GE);
                break;
            }

            case TacticalLines.JET: {
                tg.set_LineType(TacticalLines.JET_GE);
                break;
            }

            case TacticalLines.STREAM: {
                tg.set_LineType(TacticalLines.STREAM_GE);
                break;
            }

            case TacticalLines.FLOOD_TIDE: {
                tg.set_LineType(TacticalLines.FLOOD_TIDE_GE);
                break;
            }

            case TacticalLines.EBB_TIDE: {
                tg.set_LineType(TacticalLines.EBB_TIDE_GE);
                break;
            }

            case TacticalLines.SEAWALL: {
                tg.set_LineType(TacticalLines.SEAWALL_GE);
                break;
            }

            case TacticalLines.JETTY_BELOW_WATER: {
                tg.set_LineType(TacticalLines.JETTY_BELOW_WATER_GE);
                break;
            }

            case TacticalLines.JETTY_ABOVE_WATER: {
                tg.set_LineType(TacticalLines.JETTY_ABOVE_WATER_GE);
                break;
            }

            case TacticalLines.RAMP_BELOW_WATER: {
                tg.set_LineType(TacticalLines.RAMP_BELOW_WATER_GE);
                break;
            }

            case TacticalLines.RAMP_ABOVE_WATER: {
                tg.set_LineType(TacticalLines.RAMP_ABOVE_WATER_GE);
                break;
            }

            case TacticalLines.PIER: {
                tg.set_LineType(TacticalLines.PIER_GE);
                break;
            }

            case TacticalLines.COASTLINE: {
                tg.set_LineType(TacticalLines.COASTLINE_GE);
                break;
            }

            case TacticalLines.DEPTH_CONTOUR: {
                tg.set_LineType(TacticalLines.DEPTH_CONTOUR_GE);
                break;
            }

            case TacticalLines.DEPTH_CURVE: {
                tg.set_LineType(TacticalLines.DEPTH_CURVE_GE);
                break;
            }

            case TacticalLines.CRACKS: {
                tg.set_LineType(TacticalLines.CRACKS_GE);
                break;
            }

            case TacticalLines.ESTIMATED_ICE_EDGE: {
                tg.set_LineType(TacticalLines.ESTIMATED_ICE_EDGE_GE);
                break;
            }

            case TacticalLines.ICE_EDGE: {
                tg.set_LineType(TacticalLines.ICE_EDGE_GE);
                break;
            }

            case TacticalLines.ISOTHERM: {
                tg.set_LineType(TacticalLines.ISOTHERM_GE);
                break;
            }

            case TacticalLines.UPPER_AIR: {
                tg.set_LineType(TacticalLines.UPPER_AIR_GE);
                break;
            }

            case TacticalLines.ISOBAR: {
                tg.set_LineType(TacticalLines.ISOBAR_GE);
                break;
            }

            case TacticalLines.ISODROSOTHERM: {
                tg.set_LineType(TacticalLines.ISODROSOTHERM_GE);
                break;
            }

            case TacticalLines.ISOTACH: {
                tg.set_LineType(TacticalLines.ISOTACH_GE);
                break;
            }

            case TacticalLines.ISOPLETHS: {
                tg.set_LineType(TacticalLines.ISOPLETHS_GE);
                break;
            }

            default: {
                break;
            }

        }
        return;
    }

    /**
     * GE has no capability for dashed lines. This function sets each polyline in the array as a new
     * polyline broken into points corresponding to the dash pattern
     * @param polylines
     * @param shape
     */
    private static createDashedPolylines(polylines: Array<Array<Point2D>>, shape: ShapeInfo): void {
        try {
            if (shape.getLineColor() == null) {
                return;
            }

            let stroke: BasicStroke = shape.getStroke();
            let dash: number[] = stroke.getDashArray();
            if (dash == null || dash.length < 2) {
                return;
            }

            let dashedPolylines: Array<Array<Point2D>> = new Array();

            for (let polyline of polylines) {
                let dashIndex: int = 0; // Current index in dash array
                let remainingInIndex: double = dash[dashIndex]; // Length remaining in current dash array index
                for (let i: int = 0; i < polyline.length - 1; i++) {
                    let segStartPt: Point2D = polyline[i]; // segment start, moves as segment is processed
                    let segEndPt: Point2D = polyline[i + 1]; // Segment end

                    let segLength: double = 0; // distance remaining in segment
                    while ((segLength = lineutility.CalcDistanceDouble(segStartPt, segEndPt)) > 0) {
                        // If the line segment length is shorter than the current dash then move to the end of the segment continuing to draw or move
                        // Otherwise move to the end of the current dash and start the next dash there
                        if (segLength < remainingInIndex) {
                            if (dashIndex % 2 === 0) {
                                // Continue line
                                let dashedPolyline: Array<Point2D> = new Array(segStartPt, segEndPt);
                                dashedPolylines.push(dashedPolyline);
                            }
                            remainingInIndex -= segLength;
                            break; // Next segment
                        } else {
                            // Flip to line or space at dashFlipPoint
                            let dashFlipPoint: Point2D = lineutility.ExtendAlongLineDouble2(segStartPt, segEndPt, remainingInIndex);
                            if (dashIndex % 2 === 0) {
                                // Continue line
                                let dashedPolyline: Array<Point2D> = new Array(segStartPt, dashFlipPoint);
                                dashedPolylines.push(dashedPolyline);
                            }
                            // Next dash
                            dashIndex++;
                            if (dashIndex >= dash.length) {

                                dashIndex = 0;
                            }

                            remainingInIndex = dash[dashIndex];
                            segStartPt = dashFlipPoint;
                        }
                    }
                }
            }
            polylines.length = 0; // polylines.clear()
            polylines.push(...dashedPolylines);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "createDashedPolylines",
                    new RendererException("Failed inside createDashedPolylines", exc));
            } else {
                throw exc;
            }
        }
    }
    private static createSimpleFillShape(tg: TGLight, shape: ShapeInfo, polylines: Array<Array<Point2D>>): ShapeInfo | null {
        try {
            let s: BasicStroke = shape.getStroke();
            let dash: number[] = s.getDashArray();
            if (clsUtilityJTR.isClosedPolygon(tg.get_LineType()) === false) {
                if (clsUtilityJTR.IsChange1Area(tg.get_LineType()) === false) {
                    return null;
                }
            }

            if (dash == null || dash.length < 2) {
                return null;
            }

            if (shape.getFillColor() == null) {
                return null;
            }


            //if we reach this point we know it is a dashed line so we need a separate fill shape
            let j: int = 0;
            let k: int = 0;
            let shape2: ShapeInfo = new ShapeInfo(shape.getShape());
            shape2.setShapeType(ShapeInfo.SHAPE_TYPE_FILL);
            let polylines2: Array<Array<Point2D>> = new Array();
            let polyline: Array<Point2D>;
            let polyline2: Array<Point2D>;
            let pt2d: Point2D;
            s = new BasicStroke(0);
            shape2.setStroke(s);
            shape2.setFillColor(shape.getFillColor());
            let n: int = polylines.length;
            //for(j=0;j<polylines.length;j++)
            for (j = 0; j < n; j++) {
                polyline = polylines[j];
                polyline2 = new Array();
                let t: int = polyline.length;
                //for(k=0;k<polyline.length;k++)
                for (k = 0; k < t; k++) {
                    pt2d = new Point2D(polyline[k].getX(), polyline[k].getY());
                    polyline2.push(pt2d);
                }
                polylines2.push(polyline2);
            }
            //reset our original dashed shapinfo type to polyline
            shape.setShapeType(ShapeInfo.SHAPE_TYPE_POLYLINE);
            //this line will prevent unecessary work by multipointhandler
            shape.setFillColor(null);
            shape2.setPolylines(polylines2);
            //            shape2.setAffineTransform(new AffineTransform());
            return shape2;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "createSimpleFillShape",
                    new RendererException("Failed inside createSimpleFillShape", exc));
            } else {
                throw exc;
            }
        }
        return null;
    }
    private static createSimplePatternFillShape(tg: TGLight, shape: ShapeInfo, polylines: Array<Array<Point2D>>): ShapeInfo | null {
        try {
            let s: BasicStroke = shape.getStroke();
            let dash: number[] = s.getDashArray();
            if (clsUtilityJTR.isClosedPolygon(tg.get_LineType()) === false) {
                if (clsUtilityJTR.IsChange1Area(tg.get_LineType()) === false) {
                    return null;
                }

            }

            if (dash == null || dash.length < 2) {
                return null;
            }

            if (shape.getPatternFillImage() == null) {
                return null;
            }


            //if we reach this point we know it is a dashed line so we need a separate pattern fill shape
            let j: int = 0;
            let k: int = 0;
            let shape2: ShapeInfo = new ShapeInfo(shape.getShape());
            shape2.setShapeType(ShapeInfo.SHAPE_TYPE_FILL);
            let polylines2: Array<Array<Point2D>> = new Array();
            let polyline: Array<Point2D>;
            let polyline2: Array<Point2D>;
            let pt2d: Point2D;
            s = new BasicStroke(0);
            shape2.setStroke(s);
            shape2.setPatternFillImage(shape.getPatternFillImageInfo());
            shape2.setTexturePaint(shape.getTexturePaint());
            let n: int = polylines.length;
            //for(j=0;j<polylines.length;j++)
            for (j = 0; j < n; j++) {
                polyline = polylines[j];
                polyline2 = new Array();
                let t: int = polyline.length;
                //for(k=0;k<polyline.length;k++)
                for (k = 0; k < t; k++) {
                    pt2d = new Point2D(polyline[k].getX(), polyline[k].getY());
                    polyline2.push(pt2d);
                }
                polylines2.push(polyline2);
            }
            //reset our original dashed shapinfo type to polyline
            shape.setShapeType(ShapeInfo.SHAPE_TYPE_POLYLINE);
            //this line will prevent unecessary work by multipointhandler
            shape.setPatternFillImage(null);
            shape.setTexturePaint(null);
            shape2.setPolylines(polylines2);
            //            shape2.setAffineTransform(new AffineTransform());
            return shape2;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "createSimplePatternFillShape",
                    new RendererException("Failed inside createSimplePatternFillShape", exc));
            } else {
                throw exc;
            }
        }
        return null;
    }
    private static allowFillForThese(tg: TGLight): boolean {
        try {
            let linetype: int = tg.get_LineType();
            let bolMETOC: int = clsMETOC.IsWeather(tg.get_SymbolId());
            if (bolMETOC >= 0) {

                return true;
            }


            switch (linetype) {
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA:
                case TacticalLines.MAIN:
                case TacticalLines.SPT:

                case TacticalLines.SARA:
                case TacticalLines.RANGE_FAN_SECTOR:
                case TacticalLines.RADAR_SEARCH:
                case TacticalLines.RANGE_FAN:
                case TacticalLines.MNFLDFIX:
                case TacticalLines.TURN:
                case TacticalLines.MNFLDDIS:
                //case TacticalLines.OVERHEAD_WIRE:
                case TacticalLines.EASY:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.FERRY:
                case TacticalLines.BYDIF:
                case TacticalLines.BYIMP:
                case TacticalLines.DEPTH_AREA: {
                    return true;
                }

                default: {
                    return false;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "allowFillForThese",
                    new RendererException("Failed inside allowFillForThese", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }
    static SetShapeInfosPolylines(tg: TGLight, shapeInfos: Array<ShapeInfo>, clipBounds: Rectangle2D | Rectangle | Array<Point2D> | null): void {
        try {
            let j: int = 0;
            let shape: Shape;
            let shapeInfo: ShapeInfo;
            let polylines: Array<Array<Point2D>>;
            let type: int = -1;
            let simpleFillShape: ShapeInfo;//diagnostic
            let isClosed: boolean = clsUtilityJTR.isClosedPolygon(tg.get_LineType());
            let linetype: int = tg.get_LineType();
            let fillColor: Color;
            let n: int = shapeInfos.length;
            //for(j=0;j<shapeInfos.length;j++)
            for (j = 0; j < n; j++) {
                shapeInfo = shapeInfos[j];
                type = shapeInfo.getShapeType();
                shape = shapeInfo.getShape();
                if (isClosed === false && type !== Shape2.SHAPE_TYPE_FILL) {
                    polylines = clsUtilityGE.createRenderablesFromShape(tg, shape, type, clipBounds);
                }

                else {

                    polylines = clsUtilityGE.createRenderablesFromShape(tg, shape, type, null);
                }

                //create a simple fill shape here and change the shape type to SHAPE_TYPE_POLYLINE if it has non-null dash
                //add the simple fill shape to shapeInfos after the loop
                if (simpleFillShape == null) {
                    simpleFillShape = clsUtilityGE.createSimpleFillShape(tg, shapeInfo, polylines);
                }

                if (simpleFillShape == null) {
                    simpleFillShape = clsUtilityGE.createSimplePatternFillShape(tg, shapeInfo, polylines);
                }


                fillColor = shapeInfo.getFillColor();
                //if(simpleFillShape!=null || fillColor != null)//the symbol has a basic fill shape
                if (simpleFillShape != null) {
                    //the symbol has a basic fill shape
                    if (clsUtilityGE.allowFillForThese(tg) === false) {

                        shapeInfo.setFillColor(null);
                    }

                }


                if (!tg.get_UseDashArray()) {
                    clsUtilityGE.createDashedPolylines(polylines, shapeInfo);
                }


                shapeInfo.setPolylines(polylines);
            }
            if (simpleFillShape != null) {
                shapeInfos.splice(0, 0, simpleFillShape);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "SetShapeInfosPolylines",
                    new RendererException("Failed inside SetShapeInfosPolylines", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * Separates the Shape into separate polylines, eas as an ArrayList of Point2D
     * @param shape
     * @return
     */
    private static createRenderablesFromShape(tg: TGLight, shape: Shape, shapeType: int, clipArea: Rectangle2D | Rectangle | Array<Point2D> | null | null): Array<Array<Point2D>> {
        let ptsPoly: Array<Point2D> = new Array();
        let polylines2: Array<Array<Point2D>> = new Array<Array<Point2D>>();
        let ptPoly: Point2D;
        try {
            //this is not going to work for splines
            let coords: number[] = new Array<number>(6);
            for (let i: PathIterator = shape.getPathIterator(null); !i.isDone(); i.next()) {
                let type: int = i.currentSegment(coords);
                switch (type) {
                    case PathIterator.SEG_MOVETO: {
                        //newshape.moveTo(coords[0], coords[1]);
                        //finalize the last Polyline and add it to the array
                        if (ptsPoly.length > 0) {
                            if (shapeType === ShapeInfo.SHAPE_TYPE_FILL) {
                                if (ptsPoly[ptsPoly.length - 1].getX() !== ptsPoly[0].getX() ||
                                    ptsPoly[ptsPoly.length - 1].getY() !== ptsPoly[0].getY()) {
                                    let pt2d: Point2D = new Point2D(ptsPoly[0].getX(), ptsPoly[0].getY());
                                    ptsPoly.push(pt2d);
                                }
                            }
                            if (ptsPoly.length > 1) {

                                polylines2.push(ptsPoly);
                            }

                        }
                        //start the ArrayList for next Polyline                       
                        ptsPoly = new Array();
                        ptPoly = new Point2D(coords[0], coords[1]);
                        ptsPoly.push(ptPoly);
                        break;
                    }

                    case PathIterator.SEG_LINETO: {
                        //newshape.lineTo(coords[0], coords[1]);
                        ptPoly = new Point2D(coords[0], coords[1]);
                        ptsPoly.push(ptPoly);
                        break;
                    }

                    case PathIterator.SEG_QUADTO: { //quadTo was never used
                        //no idea what to do with this
                        //newshape.quadTo(coords[0], coords[1], coords[2], coords[3]);
                        break;
                    }

                    case PathIterator.SEG_CUBICTO: {  //curveTo was used for some METOC's
                        //no idea what to do with these
                        //newshape.curveTo(coords[0], coords[1], coords[2], coords[3],
                        //        coords[4], coords[5]);
                        break;
                    }

                    case PathIterator.SEG_CLOSE: {    //closePath was never used
                        //newshape.closePath();
                        break;
                    }


                    default:

                }
            }
            if (ptsPoly.length > 1) {
                //add the last line to the ArrayList
                //if it is a fill shape then the Google Earth linear ring requires the last point be added
                if (shapeType === ShapeInfo.SHAPE_TYPE_FILL) {
                    if (ptsPoly[ptsPoly.length - 1].getX() !== ptsPoly[0].getX() ||
                        ptsPoly[ptsPoly.length - 1].getY() !== ptsPoly[0].getY()) {
                        let pt2d: Point2D = new Point2D(ptsPoly[0].getX(), ptsPoly[0].getY());
                        ptsPoly.push(pt2d);
                    }
                }
                polylines2.push(ptsPoly);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "createRenderableFromShape",
                    new RendererException("Failed inside createRenderableFromShape", exc));
            } else {
                throw exc;
            }
        }
        //return newshape;
        return polylines2;
    }
    /**
     * Assumes a convex polygon for the clipping area.
     * expand the polygon using pixels and a similar algorithm to what flash renderer does for DEPTH AREA
     * @param pts clipping area to expand
     * @param expand pixels expansion
     * @return
     */
    static expandPolygon(pts: Array<Point2D>,
        expand: double): Array<Point2D> {
        let lgPoly: Array<Point2D>;
        try {
            let j: int = 0;
            let destPts: Point2D[];
            let isClosed: boolean = false;
            if (pts[pts.length - 1].getX() === pts[0].getX() && pts[pts.length - 1].getY() === pts[0].getY()) {
                pts.splice(pts.length - 1, 1);
                isClosed = true;
            }
            let pts2: Array<POINT2> = clsUtility.Points2DToPOINT2(pts);
            let pt0: POINT2;
            let pt1: POINT2;
            let pt2: POINT2;
            let pt3: POINT2;
            let m: double = 0;
            let m1: double = 0;
            let b: double = 0;
            let b1: double = 0;
            let lineSegments: Array<Line2D> = new Array();
            //n vertical segments
            let n: int = pts2.length;
            //for(j=0;j<pts2.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                pt0 = new POINT2(pts2[j]);
                pt1 = new POINT2(pts2[j + 1]);
                //no vertical segments
                if (pt0.x === pt1.x) {
                    pt1.x += 1;
                    pts2[j + 1] = pt1;
                }
            }
            let ptn: POINT2 = pts2[pts2.length - 1];
            pt0 = new POINT2(pts2[0]);
            //last segment not vertical
            if (ptn.x === pt0.x) {
                ptn.x += 1;
                pts2[pts2.length - 1] = ptn;
            }
            //close pts2
            pts2.push(pt0);;

            //POINT2 ptOther=null;
            //int quadrant=-1,otherQuadrant=-1;
            let poly: Polygon = new Polygon();
            n = pts2.length;
            //for(j=0;j<pts2.length;j++)
            for (j = 0; j < n; j++) {

                poly.addPoint(pts2[j].x as int, pts2[j].y as int);
            }


            let lineSegment: Line2D;
            let midPt: POINT2;
            //pts2 is closed
            n = pts2.length;
            //for(j=0;j<pts2.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                pt0 = new POINT2(pts2[j]);
                pt1 = new POINT2(pts2[j + 1]);
                m = (pt0.y - pt1.y) / (pt0.x - pt1.x);
                //m1=-1/m;
                if (Math.abs(m) < 1) {
                    pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, lineutility.extend_above, expand);
                    pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, lineutility.extend_above, expand);
                    midPt = lineutility.MidPointDouble(pt2, pt3, 0);
                    //we want the polygon to not contain the extended points
                    if (poly.contains(midPt.x, midPt.y)) {
                        pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, lineutility.extend_below, expand);
                        pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, lineutility.extend_below, expand);
                    }
                }
                else {
                    pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, lineutility.extend_left, expand);
                    pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, lineutility.extend_left, expand);
                    midPt = lineutility.MidPointDouble(pt2, pt3, 0);
                    //we want the polygon to not contain the extended points
                    if (poly.contains(midPt.x, midPt.y)) {
                        pt2 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, lineutility.extend_right, expand);
                        pt3 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, lineutility.extend_right, expand);
                    }
                }
                lineSegment = new Line2D(pt2.x, pt2.y, pt3.x, pt3.y);
                lineSegments.push(lineSegment);
            }
            //we will intersect the line segments to form an expanded polygon
            let expandPts: Array<POINT2> = new Array();
            let thisLine: Line2D;
            let nextLine: Line2D;
            let x1: double = 0;
            let y1: double = 0;
            let x2: double = 0;
            let y2: double = 0;
            let x: double = 0;
            let y: double = 0;
            let t: int = lineSegments.length;
            //for(j=0;j<lineSegments.length;j++)
            for (j = 0; j < t; j++) {
                thisLine = lineSegments[j];
                x1 = thisLine.getX1();
                y1 = thisLine.getY1();
                x2 = thisLine.getX2();
                y2 = thisLine.getY2();
                //thisLine line equation
                m = (y1 - y2) / (x1 - x2);
                b = y1 - m * x1;

                if (j === lineSegments.length - 1) {

                    nextLine = lineSegments[0];
                }

                else {

                    nextLine = lineSegments[j + 1];
                }


                x1 = nextLine.getX1();
                y1 = nextLine.getY1();
                x2 = nextLine.getX2();
                y2 = nextLine.getY2();
                //nextLine line equation
                m1 = (y1 - y2) / (x1 - x2);
                b1 = y1 - m1 * x1;

                //intersect thisLine with nextLine
                if (m !== m1) {
                    x = (b1 - b) / (m - m1);	//cannot blow up
                    y = (m * x + b);
                }
                else    //this should not happen
                {
                    x = thisLine.getX2();
                    y = thisLine.getY2();
                }
                expandPts.push(new POINT2(x, y));
            }
            lgPoly = new Array();
            t = expandPts.length;
            //for(j=0;j<expandPts.length;j++)
            for (j = 0; j < t; j++) {

                lgPoly.push(new Point2D(expandPts[j].x, expandPts[j].y));
            }


            //close the aray if the original clipping array if applicable
            if (isClosed) {

                lgPoly.push(new Point2D(lgPoly[0].getX(), lgPoly[0].getY()));
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "expandPolygon2",
                    new RendererException("Failed inside expandPolygon2", exc));
            } else {
                throw exc;
            }
        }
        return lgPoly;
    }
    /**
     * use cheap algorithm to expand polygons, works best on regular 4+ sided convex polygons
     * used primarily for expanding the original clipping areas. After clipping a tactical line against
     * the expanded clipping area, the original clipping area can be used to drop the clip lines
     * @param pts points to expand, usually a clipping area
     * @param expandX X expansion factor, e.g 10% growth would be 1.1
     * @param expandY Y expansion factor
     * @return points for the expanded polygon
     */
    protected static expandPolygon2(pts: Array<Point2D>,
        expandX: double,
        expandY: double): Array<Point2D> {
        let lgPoly: Array<Point2D>;
        try {
            //            AffineTransform at=new AffineTransform();
            //            at.setToIdentity();        
            //get the center of the pts using an average
            let avgX: double = 0;
            let avgY: double = 0;
            let totalX: double = 0;
            let totalY: double = 0;
            let j: int = 0;
            let isClosed: boolean = false;
            //open the array, remove the last point if necessary
            if (pts[pts.length - 1].getX() === pts[0].getX() && pts[pts.length - 1].getY() === pts[0].getY()) {
                pts.splice(pts.length - 1, 1);
                isClosed = true;
            }
            //asumes open array
            let n: int = pts.length;
            //for(j=0;j<pts.length;j++)
            for (j = 0; j < n; j++) {
                totalX += pts[j].getX();
                totalY += pts[j].getY();
            }
            avgX = totalX / pts.length;
            avgY = totalY / pts.length;
            let srcPts: Point2D[] = new Array<Point2D>(pts.length);
            //for(j=0;j<pts.length;j++)
            n = pts.length;
            for (j = 0; j < n; j++) {
                srcPts[j] = new Point2D(pts[j].getX(), pts[j].getY());
            }
            let destPts: Point2D[] = new Array<Point2D>(pts.length);
            //translate the points to crcumscribe 0,0
            //            at.translate(-avgY, -avgY);//ideally would be close to 0        
            //            at.transform(srcPts, 0, destPts, 0, srcPts.length);
            //            at.setToIdentity();
            //scale the points by 10%
            //            at.scale(expandX, expandY);
            //            at.transform(destPts, 0, destPts, 0, destPts.length);
            //            at.setToIdentity();
            //            at.translate(avgY, avgY);
            //            at.transform(destPts, 0, destPts, 0, destPts.length);
            lgPoly = new Array<Point2D>();
            let t: int = destPts.length;
            //for(j=0;j<destPts.length;j++)
            for (j = 0; j < t; j++) {
                lgPoly.push(destPts[j]);
            }
            //close the aray if the original clipping array was closed
            if (isClosed) {

                lgPoly.push(new Point2D(destPts[0].getX(), destPts[0].getY()));
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "expandPolygon",
                    new RendererException("Failed inside expandPolygon", exc));
            } else {
                throw exc;
            }
        }
        return lgPoly;
    }
    /**
     * @deprecated 
     * For tactical lines break up the arraylists into separate arraylists within the bounds.
     * This was added for the Google Earth 3D map because small scales cut off and we want the clip lines
     * to not be visible.
     * @param ptsPoly
     * @param clipBounds
     * @return 
     */
    private static ptsPolyToPtsPoly(tg: TGLight, ptsPoly: Array<Array<Point2D>>,
        clipBounds: Rectangle2D): Array<Array<Point2D>>;
    /**
     * @deprecated 
     * function to remove the clip lines from the polygon that was clipped
     * @param ptsPoly the clipped points array
     * @param clipBounds the clipping points
     * @return 
     */
    private static ptsPolyToPtsPoly(tg: TGLight, ptsPoly: Array<Array<Point2D>>,
        clipBounds: Array<Point2D>): Array<Array<Point2D>>;
    private static ptsPolyToPtsPoly(...args: unknown[]): Array<Array<Point2D>> {
        if (args[2] instanceof Rectangle2D) {
            const [tg, ptsPoly, clipBounds] = args as [TGLight, Array<Array<Point2D>>, Rectangle2D];


            let ptsPoly2: Array<Array<Point2D>>;
            try {
                if (clsUtilityJTR.IsChange1Area(tg.get_LineType()) === true) {
                    return ptsPoly;
                }


                let j: int = 0;
                let k: int = 0;
                let pts: Array<Point2D>;
                let addPts: Array<Point2D>;
                let pt0: Point2D;
                let pt1: Point2D;
                let line: Line2D;
                ptsPoly2 = new Array();
                let n: int = ptsPoly.length;
                //for(j=0;j<ptsPoly.length;j++)
                for (j = 0; j < n; j++) {
                    addPts = null;
                    pts = ptsPoly[j];
                    //find the first point inside the clipbounds
                    let t: int = pts.length;
                    //for(k=0;k<pts.length-1;k++)
                    for (k = 0; k < t - 1; k++) {
                        pt0 = pts[k];
                        pt1 = pts[k + 1];

                        line = new Line2D(pt0, pt1);
                        //both points out of bounds, do not add points
                        if (clipBounds.contains(pt0) === false && clipBounds.contains(pt1) === false) {
                            if (clipBounds.intersectsLine(line) === false) {
                                addPts = null;
                                continue;
                            }
                            else {
                                if (addPts == null) {
                                    addPts = new Array();
                                    addPts.push(pt0);
                                }
                                if (addPts.includes(pt0) === false) {

                                    addPts.push(pt0);
                                }


                                addPts.push(pt1);
                                ptsPoly2.push(addPts);
                                addPts = null;
                            }
                        }
                        else {
                            if (clipBounds.contains(pt0) === false && clipBounds.contains(pt1) === true) {
                                if (addPts == null) {
                                    addPts = new Array();
                                    addPts.push(pt0);
                                }
                                if (addPts.includes(pt0) === false) {

                                    addPts.push(pt0);
                                }


                                addPts.push(pt1);
                            }
                            else {
                                if (clipBounds.contains(pt0) === true && clipBounds.contains(pt1) === true) {
                                    if (addPts == null) {
                                        addPts = new Array();
                                        addPts.push(pt0);
                                    }
                                    if (addPts.includes(pt0) === false) {

                                        addPts.push(pt0);
                                    }


                                    addPts.push(pt1);
                                }
                                else {
                                    if (clipBounds.contains(pt0) === true && clipBounds.contains(pt1) === false) {
                                        if (addPts == null) {
                                            addPts = new Array();
                                            addPts.push(pt0);
                                        }
                                        if (addPts.includes(pt0) === false) {

                                            addPts.push(pt0);
                                        }

                                        //end the current polyline
                                        //and add it to the array list
                                        addPts.push(pt1);
                                        ptsPoly2.push(addPts);
                                        addPts = null;
                                    }
                                }

                            }

                        }

                    }
                    //add the final array list
                    if (addPts != null && addPts.length > 0) {

                        ptsPoly2.push(addPts);
                    }

                }
            } catch (exc) {
                if (exc instanceof Error) {
                    ErrorLogger.LogException(clsUtilityGE._className, "ptsPolyToPtsPoly",
                        new RendererException("Failed inside ptsPolyToPtsPoly", exc));
                } else {
                    throw exc;
                }
            }
            return ptsPoly2;
        } else {
            const [tg, ptsPoly, clipBounds] = args as [TGLight, Array<Array<Point2D>>, Array<Point2D>];

            let ptsPoly2: Array<Array<Point2D>>;
            try {
                if (clsUtilityJTR.IsChange1Area(tg.get_LineType()) === true) {
                    return ptsPoly;
                }


                let j: int = 0;
                let k: int = 0;
                let pts: Array<Point2D>;
                let addPts: Array<Point2D>;
                let pt0: Point2D;
                let pt1: Point2D;
                let line: Line2D;
                ptsPoly2 = new Array();
                let clipPoly: Polygon = new Polygon();

                //ArrayList<Point2D>ptsClipArea=null;
                let n: int = clipBounds.length;
                //for(j=0;j<clipBounds.length;j++)
                for (j = 0; j < n; j++) {
                    clipPoly.addPoint(clipBounds[j].getX() as int, clipBounds[j].getY() as int);
                }
                n = ptsPoly.length;
                //for(j=0;j<ptsPoly.length;j++)
                for (j = 0; j < n; j++) {
                    addPts = null;
                    pts = ptsPoly[j];
                    //find the first point inside the clipbounds
                    let t: int = pts.length;
                    //for(k=0;k<pts.length-1;k++)
                    for (k = 0; k < t - 1; k++) {
                        pt0 = pts[k];
                        pt1 = pts[k + 1];
                        line = new Line2D(pt0, pt1);
                        //both points out of bounds, do not add points
                        if (clipPoly.contains(pt0) === false && clipPoly.contains(pt1) === false) {
                            if (clsUtilityGE.lineIntersectsClipArea(line, clipBounds) === false) {
                                addPts = null;
                                continue;
                            }
                            else {
                                if (addPts == null) {
                                    addPts = new Array();
                                    addPts.push(pt0);
                                }
                                if (addPts.includes(pt0) === false) {

                                    addPts.push(pt0);
                                }


                                addPts.push(pt1);
                                ptsPoly2.push(addPts);
                                addPts = null;
                            }
                        } else if (clipPoly.contains(pt0) === false && clipPoly.contains(pt1) === true) {
                            if (addPts == null) {
                                addPts = new Array();
                                addPts.push(pt0);
                            }
                            if (addPts.includes(pt0) === false) {

                                addPts.push(pt0);
                            }


                            addPts.push(pt1);
                        } else if (clipPoly.contains(pt0) === true && clipPoly.contains(pt1) === true) {
                            if (addPts == null) {
                                addPts = new Array();
                                addPts.push(pt0);
                            }
                            if (addPts.includes(pt0) === false) {

                                addPts.push(pt0);
                            }


                            addPts.push(pt1);
                        } else if (clipPoly.contains(pt0) === true && clipPoly.contains(pt1) === false) {
                            if (addPts == null) {
                                addPts = new Array();
                                addPts.push(pt0);
                            }
                            if (addPts.includes(pt0) === false) {

                                addPts.push(pt0);
                            }

                            //end the current polyline
                            //and add it to the array list
                            addPts.push(pt1);
                            ptsPoly2.push(addPts);
                            addPts = null;
                        }
                    }
                    //add the final array list
                    if (addPts != null && addPts.length > 0) {

                        ptsPoly2.push(addPts);
                    }

                }
            } catch (exc) {
                if (exc instanceof Error) {
                    ErrorLogger.LogException(clsUtilityGE._className, "ptsPolyToPtsPoly",
                        new RendererException("Failed inside ptsPolyToPtsPoly", exc));
                } else {
                    throw exc;
                }
            }
            return ptsPoly2;
        }
    }

    /**
     * removes leading or trailing segments after the points were clipped
     * @param tg
     * @param clipArea 
     */
    static removeTrailingPoints(tg: TGLight, clipArea: Point2D[] | Rectangle | Rectangle2D): void {
        try {
            let isClosed: boolean = clsUtilityJTR.isClosedPolygon(tg.get_LineType());
            if (isClosed) {

                return;
            }


            let poly: Polygon = new Polygon();
            let area: Area;
            let clipBounds: Rectangle2D;
            let clipPoints: Array<Point2D>;
            let pt2d: Point2D;
            let j: int = 0;
            if (clipArea == null) {

                return;
            }

            if (clipArea instanceof Rectangle2D) {
                clipBounds = clipArea as Rectangle2D;
            } else if (clipArea instanceof Rectangle) {
                //clipBounds=(Rectangle2D)clipArea;
                let rectx: Rectangle = clipArea as Rectangle;
                clipBounds = new Rectangle2D(rectx.x, rectx.y, rectx.width, rectx.height);
            } else if (clipArea instanceof Array) {
                clipPoints = clipArea as Array<Point2D>;

            }

            if (clipBounds != null) {
                clipPoints = new Array<Point2D>();
                clipPoints.push(new Point2D(clipBounds.getX(), clipBounds.getY()));
                clipPoints.push(new Point2D(clipBounds.getX() + clipBounds.getWidth(), clipBounds.getY()));
                clipPoints.push(new Point2D(clipBounds.getX() + clipBounds.getWidth(), clipBounds.getY() + clipBounds.getHeight()));
                clipPoints.push(new Point2D(clipBounds.getX(), clipBounds.getY() + clipBounds.getHeight()));
                clipPoints.push(new Point2D(clipBounds.getX(), clipBounds.getY()));
            }

            let ptLast: Point2D = clipPoints[clipPoints.length - 1];
            let pt02d: Point2D = clipPoints[0];
            let pt12d: Point2D;
            //close the area
            if (pt02d.getX() !== ptLast.getX() || pt02d.getY() !== ptLast.getY()) {
                clipPoints.push(new Point2D(pt02d.getX(), pt02d.getY()));
                //poly.addPoint((int)pt02d.getX(),(int)pt02d.getY());
            }
            //fill the polygon
            let n: int = clipPoints.length;
            //for(j=0;j<clipPoints.length;j++)
            for (j = 0; j < n; j++) {
                pt02d = clipPoints[j];
                poly.addPoint(pt02d.getX() as int, pt02d.getY() as int);
            }
            area = new Area(poly);
            let line: Line2D;
            let pt0: POINT2;
            let pt1: POINT2;
            let intersects: boolean = false;
            let frontIndex: int = 0;
            let backIndex: int = tg.Pixels.length - 1;
            //breaks at the first leading segment that intersects the clip area
            n = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                pt0 = tg.Pixels[j];
                pt1 = tg.Pixels[j + 1];
                line = new Line2D(pt0.x, pt0.y, pt1.x, pt1.y);
                intersects = clsUtilityGE.lineIntersectsClipArea(line, clipPoints);
                if (intersects === true) {
                    frontIndex = j;
                    break;
                }
                else {
                    if (area.contains(pt0.x as int, pt0.y as int) || area.contains(pt1.x as int, pt1.y as int)) {
                        frontIndex = j;
                        break;
                    }
                }

            }
            //breaks at the first trailing segment that intersects the clip area
            n = tg.Pixels.length;
            //for(j=tg.Pixels.length-1;j>0;j--)
            for (j = n - 1; j > 0; j--) {
                pt0 = tg.Pixels[j];
                pt1 = tg.Pixels[j - 1];
                line = new Line2D(pt0.x, pt0.y, pt1.x, pt1.y);
                intersects = clsUtilityGE.lineIntersectsClipArea(line, clipPoints);
                if (intersects === true) {
                    backIndex = j;
                    break;
                }
                else {
                    if (area.contains(pt0.x as int, pt0.y as int) || area.contains(pt1.x as int, pt1.y as int)) {
                        backIndex = j;
                        break;
                    }
                }

            }
            let pts: Array<POINT2> = new Array();
            for (j = frontIndex; j <= backIndex; j++) {
                pt0 = new POINT2(tg.Pixels[j]);
                pts.push(pt0);
            }
            tg.Pixels = pts;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("clsRenderer", "removeTrailingPoints",
                    new RendererException("Failed inside removeTrailingPoints", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
         * tests of a Line2D intersects a polygon by using line.intersectsLine on each segment of the polygon
         * assumes clip clipping area was parsed to shift points of vertical segments to make them not vertical
         * @param line a clipping line in the clipping polygon
         * @param clipPts array of clip points assumed to be closed
         * @return true if the line intersects the clip bounds
         */
    private static lineIntersectsClipArea(line: Line2D,
        clipPts: Array<Point2D>): boolean {
        let result: boolean = false;
        try {
            let j: int = 0;

            //test if polygon contains an end point
            let poly: Polygon = new Polygon();
            let n: int = clipPts.length;
            //for(j=0;j<clipPts.length;j++)
            for (j = 0; j < n; j++) {

                poly.addPoint(clipPts[j].getX() as int, clipPts[j].getY() as int);
            }


            if (poly.contains(line.getX1(), line.getY1())) {

                return true;
            }

            if (poly.contains(line.getX2(), line.getY2())) {

                return true;
            }

            //end section

            let currentSegment: Line2D;
            n = clipPts.length;
            //for(j=0;j<clipPts.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                currentSegment = new Line2D(clipPts[j].getX(), clipPts[j].getY(), clipPts[j + 1].getX(), clipPts[j + 1].getY());
                if (line.intersectsLine(currentSegment) === true) {

                    return true;
                }

            }
            //if the clipPts are not closed then the above loop did not test the closing segment            
            let pt0: Point2D = clipPts[0];
            let ptLast: Point2D = clipPts[clipPts.length - 1];
            //int n=clipPts.length-1;
            if (pt0.getX() !== ptLast.getX() || pt0.getY() !== ptLast.getY()) {
                //currentSegment=new Line2D(clipPts[n].getX(),clipPts[n].getY(),clipPts[0].getX(),clipPts[0].getY());
                currentSegment = new Line2D(ptLast.getX(), ptLast.getY(), pt0.getX(), pt0.getY());
                if (line.intersectsLine(currentSegment) === true) {

                    return true;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "lineIntersectsClipArea",
                    new RendererException("Failed inside lineIntersectsClipArea", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }
    /**
     * returns true if segment data set for MSR, ASR, Boundary
     * @param tg
     * @return 
     */
    protected static segmentColorsSet(tg: TGLight): boolean {
        try {
            switch (tg.get_LineType()) {
                case TacticalLines.BOUNDARY:
                case TacticalLines.MSR:
                case TacticalLines.ASR:
                case TacticalLines.ROUTE: {
                    break;
                }

                default: {
                    return false;
                }

            }
            let strH: string = tg.get_H();
            if (strH == null || strH.length === 0) {

                return false;
            }

            let strs: string[] = strH.split(",");
            if (strs.length > 1) {

                return true;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "segmentColorsSet",
                    new RendererException("Failed inside segmentColorsSet", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }
    /**
     * Use clipping rectangle or clip points to build a zoom factor if the client zoomed in after the initial render.
     * Multiply the geo segmenting interval by this factor.
     * @param rect
     * @param clipPoints
     * @param pixels
     * @return 
     */
    static getZoomFactor(rect: Rectangle2D, clipPoints: Array<Point2D>, pixels: Array<POINT2>): double {
        let factor: double = -1;
        try {
            if (pixels == null || pixels.length < 2) {

                return factor;
            }

            if (clipPoints == null && rect == null) {

                return factor;
            }

            let maxLengthPixels: double = 0;
            let maxLengthClipArea: double = 0;
            let temp: double = 0;
            let j: int = 0;
            let pt2d0: Point2D;
            let pt2d1: Point2D; let pt0: POINT2;
            let pt1: POINT2;
            for (j = 0; j < pixels.length - 1; j++) {
                pt0 = pixels[j];
                pt1 = pixels[j + 1];
                temp = lineutility.CalcDistanceDouble(pt0, pt1);
                if (temp > maxLengthPixels) {

                    maxLengthPixels = temp;
                }

            }
            temp = 0;
            if (clipPoints != null) {
                for (j = 0; j < clipPoints.length - 1; j++) {
                    pt2d0 = clipPoints[j];
                    pt2d1 = clipPoints[j + 1];
                    pt0 = new POINT2(pt2d0.getX(), pt2d0.getY());
                    pt1 = new POINT2(pt2d1.getX(), pt2d1.getY());
                    temp = lineutility.CalcDistanceDouble(pt0, pt1);
                }
            }
            else {
                if (rect != null) {
                    temp = rect.getMaxX() - rect.getMinX();
                    if (temp < rect.getMaxY() - rect.getMinY()) {

                        temp = rect.getMaxY() - rect.getMinY();
                    }

                }
            }

            if (temp > maxLengthClipArea) {

                maxLengthClipArea = temp;
            }

            if (maxLengthPixels > 0 && maxLengthClipArea > 0) {

                factor = maxLengthClipArea / maxLengthPixels;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityGE._className, "getZoomFactor",
                    new RendererException("Failed inside getZoomFactor", exc));
            } else {
                throw exc;
            }
        }
        return factor;
    }

}
