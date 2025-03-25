import { type double, type int } from "../../c5isr/graphics2d/BasicTypes";
import { Line2D } from "../graphics2d/Line2D"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { clsUtility } from "../JavaTacticalRenderer/clsUtility"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { RendererException } from "../renderer/utilities/RendererException"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger";
import { clsUtilityCPOF } from "./clsUtilityCPOF";


/**
 * A class to clip tactical lines and areas
 *
 */
export class clsClipPolygon2 {

    private static readonly _className: string = "clsClipPolygon2";
    /**
     * Calculate the point the line intersects an edge of the clipbounds
     * @param pt0 start point of the line
     * @param pt1 end point of the line
     * @param currentEdge
     * @return
     */
    private static intersectPoint(pt0: Point2D,
        pt1: Point2D,
        currentEdge: Line2D): Point2D {
        let ptIntersect: Point2D;
        try {
            let edgePt1: Point2D = currentEdge.getP1();
            let edgePt2: Point2D = currentEdge.getP2();
            let edge_x: double = 0;
            let edge_y: double = 0;
            let m: double = 0;
            let deltaX: double = 0;
            let deltaY: double = 0;
            //vertical edge
            if (Math.abs(edgePt1.getX() - edgePt2.getX()) < Math.abs(edgePt1.getY() - edgePt2.getY())) {
                ptIntersect = new Point2D();
                edge_x = edgePt1.getX();
                //if (pt1.getX() == pt0.getX())
                if (Math.abs(pt1.getX() - pt0.getX()) < 1) {

                    pt1.setLocation(pt1.getX() + 1, pt1.getY());
                }


                m = (pt1.getY() - pt0.getY()) / (pt1.getX() - pt0.getX());
                deltaX = edge_x - pt0.getX();
                ptIntersect.setLocation(edge_x, pt0.getY() + m * deltaX);
            }
            //horizontal edge
            else {
                ptIntersect = new Point2D();
                edge_y = edgePt1.getY();
                //if (pt1.getX() == pt0.getX())
                if (Math.abs(pt1.getX() - pt0.getX()) < 1) {

                    pt1.setLocation(pt1.getX() + 1, pt1.getY());
                }


                m = (pt1.getY() - pt0.getY()) / (pt1.getX() - pt0.getX());
                deltaY = edge_y - pt0.getY();
                ptIntersect.setLocation(pt0.getX() + deltaY / m, edge_y);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "intersectPoint",
                    new RendererException("Failed inside intersectPoint", exc));
            } else {
                throw exc;
            }
        }
        return ptIntersect;
    }
    /**
     * clip the top
     * on the line is considered inside
     * @param pts
     * @param clipBounds
     * @return
     */
    private static clipTop(tg: TGLight, pts: Array<Point2D>,
        clipBounds: Rectangle2D): Array<Point2D> {
        let ptsResult: Array<Point2D> = new Array();
        try {
            let ulx: double = 0;
            let uly: double = 0;
            let lrx: double = 0;// lry = 0;
            ulx = clipBounds.getMinX();
            uly = clipBounds.getMinY();
            let ul: Point2D = new Point2D(ulx, uly);
            let ur: Point2D = new Point2D(lrx, uly);

            let j: int = 0;
            let current: Point2D;
            let previous: Point2D;
            let intersectPt: Point2D;
            let edge: Line2D;
            let n: int = pts.length;
            //for (j = 0; j < pts.length; j++) 
            for (j = 0; j < n; j++) {
                current = pts[j];
                if (j === 0) {
                    previous = pts[pts.length - 1];
                }
                else {
                    previous = pts[j - 1];
                }

                //both inside
                if (previous.getY() >= ul.getY() && current.getY() >= ul.getY()) {
                    ptsResult.push(current);
                }
                //previous inside, current outside
                if (previous.getY() >= ul.getY() && current.getY() < ul.getY()) {
                    edge = new Line2D(ul, ur);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }
                    tg.set_WasClipped(true);
                }
                //both outside
                if (previous.getY() < ul.getY() && current.getY() < ul.getY()) {
                    continue;
                }

                //previous outside current inside
                if (previous.getY() < ul.getY() && current.getY() >= ul.getY()) {
                    edge = new Line2D(ul, ur);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }
                    ptsResult.push(current);
                    tg.set_WasClipped(true);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "clipTop",
                    new RendererException("Failed inside clipTop", exc));
            } else {
                throw exc;
            }
        }
        return ptsResult;
    }
    /**
     * on the boundary is considered inside
     * clip the bottom
     * @param pts
     * @param clipBounds
     * @return
     */
    private static clipBottom(tg: TGLight, pts: Array<Point2D>,
        clipBounds: Rectangle2D): Array<Point2D> {
        let ptsResult: Array<Point2D> = new Array();
        try {
            let ulx: double = 0;
            let uly: double = 0;
            let lrx: double = 0;
            let lry: double = 0;
            ulx = clipBounds.getMinX();
            lrx = clipBounds.getMaxX();
            lry = clipBounds.getMaxY();
            let ll: Point2D = new Point2D(ulx, lry);
            let lr: Point2D = new Point2D(lrx, lry);

            let j: int = 0;
            let current: Point2D;
            let previous: Point2D;
            let intersectPt: Point2D;
            let edge: Line2D;
            let n: int = pts.length;
            //for (j = 0; j < pts.length; j++)
            for (j = 0; j < n; j++) {
                current = pts[j];
                if (j === 0) {
                    previous = pts[pts.length - 1];
                }
                else {
                    previous = pts[j - 1];
                }

                //both inside
                if (previous.getY() <= lr.getY() && current.getY() <= lr.getY()) {
                    ptsResult.push(current);
                }
                //previous inside, current outside
                if (previous.getY() <= lr.getY() && current.getY() > lr.getY()) {
                    edge = new Line2D(ll, lr);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }
                    tg.set_WasClipped(true);
                }
                //both outside
                if (previous.getY() > lr.getY() && current.getY() > lr.getY()) {
                    continue;
                }

                //previous outside current inside
                if (previous.getY() > lr.getY() && current.getY() <= lr.getY()) {
                    edge = new Line2D(ll, lr);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }

                    ptsResult.push(current);
                    tg.set_WasClipped(true);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "clipBottom",
                    new RendererException("Failed inside clipBottom", exc));
            } else {
                throw exc;
            }
        }
        return ptsResult;
    }
    /**
     * on the bounds is considered inside
     * clip the right side
     * @param pts
     * @param clipBounds
     * @return
     */
    private static clipRight(tg: TGLight, pts: Array<Point2D>,
        clipBounds: Rectangle2D): Array<Point2D> {
        let ptsResult: Array<Point2D> = new Array();
        try {
            let uly: double = 0;
            let lrx: double = 0;
            let lry: double = 0;
            uly = clipBounds.getMinY();
            lrx = clipBounds.getMaxX();
            lry = clipBounds.getMaxY();
            let ur: Point2D = new Point2D(lrx, uly);
            let lr: Point2D = new Point2D(lrx, lry);
            let j: int = 0;
            let current: Point2D;
            let previous: Point2D;
            let intersectPt: Point2D;
            let edge: Line2D;
            let n: int = pts.length;
            //for (j = 0; j < pts.length; j++) 
            for (j = 0; j < n; j++) {
                current = pts[j];
                if (j === 0) {
                    previous = pts[pts.length - 1];
                } else {
                    previous = pts[j - 1];
                }

                //both inside
                if (previous.getX() <= lr.getX() && current.getX() <= lr.getX()) {
                    ptsResult.push(current);
                }
                //previous inside, current outside
                if (previous.getX() <= lr.getX() && current.getX() > lr.getX()) {
                    edge = new Line2D(ur, lr);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }
                    tg.set_WasClipped(true);
                }
                //both outside
                if (previous.getX() > lr.getX() && current.getX() > lr.getX()) {
                    continue;
                }

                //previous outside current inside
                if (previous.getX() > lr.getX() && current.getX() <= lr.getX()) {
                    edge = new Line2D(ur, lr);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }

                    //if(j!=0 || clsUtility.isClosedPolygon(tg.get_LineType())==true)
                    ptsResult.push(current);
                    tg.set_WasClipped(true);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "clipRight",
                    new RendererException("Failed inside clipRight", exc));
            } else {
                throw exc;
            }
        }
        return ptsResult;
    }
    /**
     * on the line is considered inside
     * clip the left side
     * @param pts
     * @param clipBounds
     * @return
     */
    private static clipLeft(tg: TGLight, pts: Array<Point2D>,
        clipBounds: Rectangle2D): Array<Point2D> {
        let ptsResult: Array<Point2D> = new Array();
        try {
            let ulx: double = 0;
            let uly: double = 0;
            let lry: double = 0;
            ulx = clipBounds.getMinX();
            uly = clipBounds.getMinY();
            lry = clipBounds.getMaxY();
            let ul: Point2D = new Point2D(ulx, uly);
            let ll: Point2D = new Point2D(ulx, lry);

            let j: int = 0;
            let current: Point2D;
            let previous: Point2D;
            let intersectPt: Point2D;
            let edge: Line2D;
            let n: int = pts.length;
            //for (j = 0; j < pts.length; j++) 
            for (j = 0; j < n; j++) {
                current = pts[j];
                if (j === 0) {
                    previous = pts[pts.length - 1];
                }
                else {
                    previous = pts[j - 1];
                }

                //both inside
                if (previous.getX() >= ll.getX() && current.getX() >= ll.getX()) {
                    ptsResult.push(current);
                }
                //previous inside, current outside
                if (previous.getX() >= ll.getX() && current.getX() < ll.getX()) {
                    edge = new Line2D(ul, ll);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }
                    tg.set_WasClipped(true);
                }
                //both outside
                if (previous.getX() < ll.getX() && current.getX() < ll.getX()) {
                    continue;
                }

                //previous outside current inside
                if (previous.getX() < ll.getX() && current.getX() >= ll.getX()) {
                    edge = new Line2D(ul, ll);
                    intersectPt = clsClipPolygon2.intersectPoint(previous, current, edge);
                    if (intersectPt != null) {
                        ptsResult.push(intersectPt);
                    }

                    //if(j!=0 || clsUtility.isClosedPolygon(tg.get_LineType())==true)
                    ptsResult.push(current);
                    tg.set_WasClipped(true);
                }
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "clipLeft",
                    new RendererException("Failed inside clipLeft", exc));
            } else {
                throw exc;
            }
        }
        return ptsResult;
    }

    /**
     * for non-areas add points to the ends as necessary to make the algorithm work
     * @param polygon
     * @param clipBounds
     */
    private static AddBoundaryPointsForLines(polygon: Array<Point2D>,
        clipBounds: Rectangle2D): int {
        let result: int = 0;
        try {
            let ulx: double = 0;
            let uly: double = 0;
            let lrx: double = 0;
            let lry: double = 0;
            ulx = clipBounds.getMinX();
            uly = clipBounds.getMinY();
            lrx = clipBounds.getMaxX();
            lry = clipBounds.getMaxY();
            //move these inside by 10 pixels so the algoithm will treat them as inside points
            let ul: Point2D = new Point2D(ulx + 10, uly + 10);
            let ur: Point2D = new Point2D(lrx - 10, uly + 10);
            let ll: Point2D = new Point2D(ulx + 10, lry - 10);
            let lr: Point2D = new Point2D(lrx - 10, lry - 10);

            let pt0: Point2D = polygon[0];
            let ptn: Point2D = polygon[polygon.length - 1];
            //double dist0 = 0, dist1 = 0;
            let addToFront: boolean = false;
            let addToEnd: boolean = false;
            //add a point to the begining of the array
            if (pt0.getY() < uly) //above the top clip
            {
                polygon.splice(0, 0, ul);
                addToFront = true;
            } else if (pt0.getX() < ulx) //outside the left clip
            {
                polygon.splice(0, 0, ul);
                addToFront = true;
            } else if (pt0.getX() > lrx) //outside the right clip
            {
                polygon.splice(0, 0, lr);
                addToFront = true;
            } else if (pt0.getY() > lry) //below the bottom clip
            {
                polygon.splice(0, 0, lr);
                addToFront = true;
            }

            //add a point to the end of the array
            if (ptn.getY() < uly) //above the top clip
            {
                polygon.push(ul);
                addToEnd = true;
            } else if (ptn.getX() < ulx) //outside the left clip
            {
                polygon.push(ul);
                addToEnd = true;
            } else if (ptn.getX() > lrx) //outside the right clip
            {
                polygon.push(lr);
                addToEnd = true;
            } else if (ptn.getY() > lry) //below the bottom clip
            {
                polygon.push(lr);
                addToEnd = true;
            }

            if (addToFront === false && addToEnd === false) {
                result = 0;
            }
            if (addToFront === true && addToEnd === false) {
                result = 1;
            }
            if (addToFront === false && addToEnd === true) {
                result = 2;
            }
            if (addToFront === true && addToEnd === true) {
                result = 3;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "AddBoundaryPointsForLines",
                    new RendererException("Failed inside AddBoundaryPointsForLines", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }
    /**
     * closes an area
     * @param tg
     */
    private static closeAreaTG(tg: TGLight): void {
        try {
            if (tg.Pixels == null || tg.Pixels.length === 0) {

                return;
            }


            let pt0: POINT2 = tg.Pixels[0];
            let ptn: POINT2 = tg.Pixels[tg.Pixels.length - 1];
            if (pt0.x !== ptn.x || pt0.y !== ptn.y) {

                tg.Pixels.push(pt0);
            }


        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "closeAreaTG",
                    new RendererException("Failed inside closeAreaTG", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * DMA, DMAF fill must be handled separately because of the feint
     * @param tg
     * @param clipBounds
     * @return
     */
    protected static fillDMA(tg: TGLight,
        clipBounds: Rectangle2D): Array<Shape2> {
        let shapes: Array<Shape2> = new Array();
        try {
            switch (tg.get_LineType()) {
                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
                case TacticalLines.STRONG:
                case TacticalLines.ZONE:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM: {
                    break;
                }

                default: {
                    return shapes;
                }

            }
            let shape: Shape2;

            //create a generic area tg from the pixels and clip it
            let j: int = 0;
            let tg2: TGLight = new TGLight();
            tg2.set_LineType(TacticalLines.GENERAL);
            tg2.Pixels = new Array();
            //to get the original pixels size
            //int n=0;
            let n: int = tg.Pixels.length;

            for (j = 0; j < n; j++) {

                tg2.Pixels.push(tg.Pixels[j]);
            }


            clsClipPolygon2.closeAreaTG(tg2);

            if (clipBounds != null) {

                clsClipPolygon2.ClipPolygon(tg2, clipBounds);
            }


            if (tg2.Pixels == null || tg2.Pixels.length === 0) {

                return shapes;
            }


            //shape=new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
            shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
            shape.setFillColor(tg.get_FillColor());

            shape.moveTo(tg2.Pixels[0]);
            //original pixels do not include feint
            n = tg2.Pixels.length;
            //for(j=1;j<tg2.Pixels.length;j++)
            for (j = 1; j < n; j++) {

                shape.lineTo(tg2.Pixels[j]);
            }


            shapes.push(shape);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "fillDMA",
                    new RendererException("Failed inside fillDMA", exc));
            } else {
                throw exc;
            }
        }
        return shapes;
    }
    /**
     * for pre-clipped lines which also require fill but need the processed points
     * to create the fill. This functioni is called after the clip, so the fill
     * does not get clipped.
     * @param tg
     * @param shapes
     */
    static addAbatisFill(tg: TGLight,
        shapes: Array<Shape2>): void {
        try {
            if (tg.Pixels == null ||
                tg.Pixels.length < 2 ||
                tg.get_FillColor() == null ||
                tg.get_FillColor().getAlpha() < 2 ||
                shapes == null) {

                return;
            }


            let j: int = 0;
            let n: int = tg.Pixels.length;
            let shape: Shape2;
            let tg2: TGLight;
            switch (tg.get_LineType()) {
                case TacticalLines.MSDZ: {
                    let dist0: double = 0;
                    let dist1: double = 0;
                    let dist2: double = 0;
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setFillColor(tg.get_FillColor());
                    if (tg.Pixels != null && tg.Pixels.length >= 300) {
                        dist0 = Math.abs(tg.Pixels[0].x - tg.Pixels[50].x);
                        dist1 = Math.abs(tg.Pixels[100].x - tg.Pixels[150].x);
                        dist2 = Math.abs(tg.Pixels[200].x - tg.Pixels[250].x);
                        let start: int = -1;
                        let end: int = -1;
                        if (dist0 >= dist1 && dist0 >= dist2) {
                            start = 0;
                            end = 99;
                        }
                        else {
                            if (dist1 >= dist0 && dist1 >= dist2) {
                                start = 100;
                                end = 199;
                            }
                            else {
                                start = 200;
                                end = 299;
                            }
                        }

                        shape.moveTo(tg.Pixels[start]);
                        for (j = start; j <= end; j++) {

                            shape.lineTo(tg.Pixels[j]);
                        }


                        //shapes.add(0,shape);
                    }
                    break;
                }

                case TacticalLines.ABATIS: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setFillColor(tg.get_FillColor());
                    tg2 = new TGLight();
                    tg2.set_LineType(TacticalLines.GENERAL);
                    tg2.Pixels = new Array();
                    if (tg.Pixels != null && tg.Pixels.length > 2) {
                        tg2.Pixels.push(tg.Pixels[n - 3]);
                        tg2.Pixels.push(tg.Pixels[n - 2]);
                        tg2.Pixels.push(tg.Pixels[n - 1]);
                        tg2.Pixels.push(tg.Pixels[n - 3]);

                        shape.moveTo(tg2.Pixels[0]);
                        for (j = 1; j < tg2.Pixels.length; j++) {

                            shape.lineTo(tg2.Pixels[j]);
                        }


                        //shapes.push(shape);
                    }
                    break;
                }

                default: {
                    return;
                }

            }//end switch
            if (shapes != null) {
                shapes.splice(0, 0, shape);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "addAbatisFill",
                    new RendererException("Failed inside addAbatisFill", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * for lines with glyphs the fill must be handled (clipped) as a separate shape.
     * this function needs to be called before the clipping is done to the line
     * @param tg
     * @param clipBounds
     */
    static LinesWithFill(tg: TGLight,
        clipBounds: Rectangle2D | null): Array<Shape2> | null {
        let shapes: Array<Shape2> = null;
        try {
            if (tg.get_FillColor() == null || tg.get_FillColor().getAlpha() <= 1 ||
                tg.Pixels == null || tg.Pixels.length === 0) {

                return shapes;
            }


            switch (tg.get_LineType()) {
                case TacticalLines.ABATIS:
                case TacticalLines.SPT:
                case TacticalLines.MAIN:
                case TacticalLines.AAAAA:
                case TacticalLines.AIRAOA:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.CORDONSEARCH:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.SECURE:
                case TacticalLines.OCCUPY:
                case TacticalLines.RETAIN:
                case TacticalLines.ISOLATE:
                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY: {
                    return shapes;
                }

                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET: {
                    return null;
                }

                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
                case TacticalLines.STRONG:
                case TacticalLines.ZONE:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM: {
                    return clsClipPolygon2.fillDMA(tg, clipBounds);
                }

                default: {
                    break;
                }

            }
            if (clsUtility.LinesWithFill(tg.get_LineType()) === false) {
                return shapes;
            }


            shapes = new Array();
            //undo any fillcolor that might have been set for the existing shape
            //because we are divorcing fill from the line
            let shape: Shape2;

            //create a generic area tg from the pixels and clip it
            let tg2: TGLight = new TGLight();
            tg2.set_LineType(TacticalLines.GENERAL);
            tg2.Pixels = new Array();
            tg2.Pixels.push(...tg.Pixels);
            clsClipPolygon2.closeAreaTG(tg2);
            //tg2.Pixels.push(tg.Pixels[0]);
            if (clipBounds != null) {

                clsClipPolygon2.ClipPolygon(tg2, clipBounds);
            }



            if (tg2.Pixels == null || tg2.Pixels.length === 0) {

                return null;
            }


            let j: int = 0;
            //shape=new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
            shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
            shape.setFillColor(tg.get_FillColor());

            shape.moveTo(tg2.Pixels[0]);
            for (j = 1; j < tg2.Pixels.length; j++) {

                shape.lineTo(tg2.Pixels[j]);
            }


            if (tg.get_FillColor() != null || tg.get_FillColor().getAlpha() > 1) {
                shapes.push(shape);
            }
            else {

                return null;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "LinesWithFill",
                    new RendererException("Failed inside LinesWithFill", exc));
            } else {
                throw exc;
            }
        }
        return shapes;
    }
    /**
     * @deprecated
     * for polygon completely outside the clip area
     * pass back a small box to be able to continue normal processing
     * @param clipBounds
     * @return
     */
    private static buildBox(clipBounds: Rectangle2D): Array<Point2D> {
        let box: Array<Point2D> = new Array();
        try {
            {
                let ulx: double = 0;
                let uly: double = 0;
                let lrx: double = 0;
                let lry: double = 0;
                ulx = clipBounds.getMinX() - 200;
                uly = clipBounds.getMinY() - 200;
                lrx = clipBounds.getMaxX() + 200;
                lry = clipBounds.getMaxY() + 200;
                let lr: Point2D = new Point2D(ulx, uly);
                let ll: Point2D = new Point2D(ulx - 10, uly);
                let ul: Point2D = new Point2D(ulx - 10, uly - 10);
                let ur: Point2D = new Point2D(ulx, uly - 10);
                box.push(lr);
                box.push(ll);
                box.push(ul);
                box.push(ur);
                box.push(lr);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "buildBox",
                    new RendererException("Failed inside buildBox", exc));
            } else {
                throw exc;
            }
        }
        return box;
    }
    /**
     * Works for tactical lines and areas
     * @param tg
     * @param clipBounds
     * @return
     */
    public static ClipPolygon(tg: TGLight,
        clipBounds: Rectangle2D): Array<Point2D> {
        let poly: Array<Point2D> = new Array();
        try {
            let polygon: Array<Point2D> = clsUtilityCPOF.POINT2toPoint2D(tg.Pixels);
            let isClosed: boolean = clsUtility.isClosedPolygon(tg.get_LineType());
            //create a hashtable to hold the original points
            let hashMap: Map<string, Point2D> = new Map<string, Point2D>();
            let j: int = 0;
            for (j = 0; j < polygon.length; j++) {
                hashMap.set(j.toString(), polygon[j]);
            }

            let clipBounds2: Rectangle2D = new Rectangle2D(clipBounds.getX() - 50, clipBounds.getY() - 50, clipBounds.getWidth() + 100, clipBounds.getHeight() + 100);

            let addedLinePoints: int = 0;
            if (isClosed) {
                polygon.splice(polygon.length - 1, 1);
                isClosed = true;
            } else {
                //for tactical lines it always seems to work if the 0th and last points are inside the area
                //add points on the edge as needed to make that happen
                addedLinePoints = clsClipPolygon2.AddBoundaryPointsForLines(polygon, clipBounds2);
            }
            //expand the clip bounds by 10 pixels

            poly = clsClipPolygon2.clipRight(tg, polygon, clipBounds2);
            poly = clsClipPolygon2.clipTop(tg, poly, clipBounds2);
            poly = clsClipPolygon2.clipLeft(tg, poly, clipBounds2);
            poly = clsClipPolygon2.clipBottom(tg, poly, clipBounds2);

            if (isClosed) {
                if (poly.length > 0) {
                    poly.push(poly[0]);
                }
            }
            else {
                switch (addedLinePoints) {
                    case 0: { //no points were added, do nothing
                        break;
                    }

                    case 1: { //point was added to the front to make algorithm work, remove segment
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        break;
                    }

                    case 2: { //point was added to the end to make algorithm work, remove segment
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        break;
                    }

                    case 3: { //point was added to the front and end to make algorithm work, remove segments
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        break;
                    }


                    default:

                }
            }

            if (isClosed === true) {
                if (poly.length > 2) {
                    //tg.Pixels = clsUtilityCPOF.Point2DtoPOINT2(poly);
                    tg.Pixels = clsUtilityCPOF.Point2DtoPOINT2Mapped(poly, hashMap);
                }
                else {
                    //poly = buildBox(clipBounds);
                    //tg.Pixels = clsUtilityCPOF.Point2DtoPOINT2(poly);
                    tg.Pixels = new Array();
                }

            }
            else {
                if (poly.length > 1) {
                    tg.Pixels = clsUtilityCPOF.Point2DtoPOINT2Mapped(poly, hashMap);
                }
                else {
                    tg.Pixels = new Array();
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipPolygon2._className, "ClipPolygon",
                    new RendererException("Failed inside ClipPolygon", exc));
            } else {
                throw exc;
            }
        }
        return poly;
    }
}
