/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



import { type int, type double } from "../graphics2d/BasicTypes";

import { GeneralPath } from "../graphics2d/GeneralPath"
import { IPathIterator } from "../graphics2d/IPathIterator"
import { Line2D } from "../graphics2d/Line2D"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point2D } from "../graphics2d/Point2D"
import { Polygon } from "../graphics2d/Polygon"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"

import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"


import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"


/**
 *
 *
 */
export class Area extends GeneralPath {
    private static readonly _className: string = "Area";
    //private ArrayList<POINT2>_pts;

    public constructor(arg: Polygon | Shape) {
        if (arg instanceof Polygon) {
            super();
            const poly = arg;
            let j: int = 0;
            let n: int = poly.npoints;
            //for(j=0;j<poly.npoints;j++)
            for (j = 0; j < n; j++) {
                if (j === 0) {
                    this.moveTo(poly.xpoints[j], poly.ypoints[j]);
                }

                else {
                    this.lineTo(poly.xpoints[j], poly.ypoints[j]);
                }
            }
        } else {
            super();
            const shape = arg;
            let j: int = 0;
            let p: PathIterator = shape.getPathIterator(null);
            let pts: Array<POINT2> = p.getPoints();
            let pt: POINT2;
            let n: int = pts.length;
            //for(j=0;j<pts.length;j++)
            for (j = 0; j < n; j++) {
                pt = pts[j];
                switch (pt.style) {
                    case IPathIterator.SEG_MOVETO: {
                        this.moveTo(pt.x, pt.y);
                        break;
                    }

                    case IPathIterator.SEG_LINETO: {
                        this.lineTo(pt.x, pt.y);
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
        }
    }

    /**
     * organizes intersect points by increasing distance from the hatch line origin
     * @param hatchLine
     * @param pts 
     */
    private static reorderPointsByDistance(hatchLine: Line2D, pts: Array<Point2D>): void {
        try {

            var minDistance = 0;
            var dist = 0;
            var j = 0;
            var minIndex = -1;
            var distances =  new Map<int,double>(); //new java.util.HashMap ();
            var ptsOrdered =  new Array();//new java.util.ArrayList ();
            var origin = hatchLine.getP1 ();
            var pt0 =  new POINT2 (origin.getX (), origin.getY ());
            var pt1 = null;
            for (j = 0; j < pts.length; j++) {
                pt1 =  new POINT2 (pts.at(j).getX (), pts.at(j).getY ());
                dist = lineutility.CalcDistanceDouble (pt0, pt1);
                distances.set(j, dist);
            }
            while (distances.size > 0) {
                for (j = 0; j < pts.length; j++) {
                    if (distances.has(j)) {
                        minIndex = j;
                        minDistance = (distances.get (j));
                        break;
                    }
                }
                for (j = 0; j < pts.length; j++) {
                    if (distances.has(j)) {
                        dist = (distances.get (j))
                        if (dist < minDistance) {
                            minDistance = dist;
                            minIndex = j;
                        }
                    }
                }
                ptsOrdered.push (pts.at(minIndex));
                distances.delete(minIndex);
            }
            pts.length = 0; // pts.clear()
            for (j = 0; j < ptsOrdered.length; j++) 
                pts.push(ptsOrdered.at(j));

            /*
            let minDistance: double = 0;
            let dist: double = 0;
            let j: int = 0;
            let minIndex: int = -1;
            let distances: HashMap<number, number> = new HashMap();
            //let distances: Array<number> = new Array();
            let ptsOrdered: Array<Point2D> = new Array();
            let origin: Point2D = hatchLine.getP1();
            let pt0: POINT2 = new POINT2(origin.getX(), origin.getY());
            let pt1: POINT2;
            //build the distances array
            let n: int = pts.length;
            //for(j=0;j<pts.length;j++)
            for (j = 0; j < n; j++) {
                pt1 = new POINT2(pts[j].getX(), pts[j].getY());
                dist = lineutility.CalcDistanceDouble(pt0, pt1);
                distances.put(j, dist);
            }

            while (distances.size() > 0) {
                //initialize minDistance after an array element was removed
                minIndex = distances.keySet().stream().findFirst();//.get();
                minDistance = distances[minIndex];

                //loop through the remaining elements to find the next minimum distance
                //for(j=0;j<pts.length;j++)
                for (j = 0; j < n; j++) {
                    if (distances.containsKey(j)) {
                        dist = distances.get(j);
                        if (dist < minDistance) {
                            minDistance = dist;
                            minIndex = j;
                        }
                    }
                }

                //add the next point to the array
                ptsOrdered.push(pts[minIndex]);
                distances.remove(minIndex);
            }

            pts.length = 0; // pts.clear()
            n = ptsOrdered.length;
            //for(j=0;j<ptsOrdered.length;j++)
            for (j = 0; j < n; j++) {
                pts.push(ptsOrdered[j]);
            }//*/

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Area._className, "reorderPointsByDistance",
                    new RendererException("Failed inside reorderPointsByDistance", exc));
            } else {
                throw exc;
            }
        }
    }
    protected getMBR(polygon: Array<POINT2>): Rectangle2D {
        let j: int = 0;
        let left: double = polygon[0].x;
        let top: double = polygon[0].y;
        let right: double = polygon[0].x;
        let bottom: double = polygon[0].y;
        let n: int = polygon.length;
        //for (j=1;j<polygon.length;j++)
        for (j = 1; j < n; j++) {
            if (polygon[j].x < left) {

                left = polygon[j].x;
            }

            if (polygon[j].x > right) {

                right = polygon[j].x;
            }


            if (polygon[j].y < top) {

                top = polygon[j].y;
            }

            if (polygon[j].y > bottom) {

                bottom = polygon[j].y;
            }

        }
        return new Rectangle2D(left, top, right - left, bottom - top);
    }
    protected static isVertical(edge: Line2D): boolean {
        if (edge.getX1() === edge.getX2()) {

            return true;
        }

        else {
            return false;
        }

    }
    private static adjustVerticalLine(line: Line2D): void {
        let linePt0: Point2D = line.getP1();
        let linePt1: Point2D = line.getP1();
        if (Area.isVertical(line)) {
            let x: double = line.getX2() + .001;
            let y: double = line.getY2();
            linePt1.setLocation(x, y);
            line.setLine(linePt0, linePt1);
        }
    }
    /**
     * 
     * @param hatchLine the hatch line to intersect against the area points.
     * the thatch line is assumed to start outside the area (polygon) MBR
     * @return the GeneralPath which represents the intersection
     */
    private static getLineIntersectPoints(polygon: Array<POINT2>, hatchLine: Line2D): Array<POINT2> {
        let pts: Array<POINT2>;
        try {
            let j: int = 0;
            let k: int = 0;
            let segment: Line2D;
            let pt0: Point2D;
            let pt1: Point2D;
            //no (exactly) vertical hatch lines
            Area.adjustVerticalLine(hatchLine);
            let ptsPath: Array<Point2D> = new Array();
            let x: double = 0;
            let y: double = 0;
            let m1: double = 0;
            let     //hatch line
                m2: double = 0;
            let    //segment slope
                b1: double = 0;
            let    //hatch line y intercept
                b2: double = 0;   //segment y intercept
            let n: int = polygon.length;
            //for(j=0;j<polygon.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                pt0 = new Point2D(polygon[j]);
                pt1 = new Point2D(polygon[j + 1]);
                segment = new Line2D(pt0, pt1);
                //no vertical segments
                Area.adjustVerticalLine(segment);
                pt0 = segment.getP1();
                pt1 = segment.getP2();
                m1 = (hatchLine.getY1() - hatchLine.getY2()) / (hatchLine.getX1() - hatchLine.getX2());
                m2 = (pt0.getY() - pt1.getY()) / (pt0.getX() - pt1.getX());
                if (hatchLine.intersectsLine(segment)) {
                    //m1=(hatchLine.getY1()-hatchLine.getY2())/(hatchLine.getX1()-hatchLine.getX2());
                    //m2=(pt0.getY()-pt1.getY())/(pt0.getX()-pt1.getX());
                    if (m1 === m2) {
                        ptsPath.push(pt0);
                        ptsPath.push(pt1);
                    }
                    else    //slopes not equal
                    {
                        //add one intersection point
                        b1 = hatchLine.getY1() - m1 * hatchLine.getX1();
                        b2 = segment.getY1() - m2 * segment.getX1();
                        x = (b2 - b1) / (m1 - m2);  //cannot blow up
                        y = (m1 * x + b1);

                        /*
                        Touching vertex logic:
                        If intersect vertex the line is entering or exiting a shape, add point once
                        if tangent to vertex the line is not entering or exiting shape, add point twice to negate changes

                        Intersect vertex => points before and after in the shape are on different sides of the line
                        Tangent to vertex => points before and after in the shape are on the same side of the line

                        Every vertex is in two segments of the shape, one where its pt0 and another as pt1
                        Always add vertex if pt0 of polygon
                        If pt1 of polygon and pts before and after are on same side then add pt1
                         */
                        if (Math.abs(pt1.getX() - x) < .001 && Math.abs(pt1.getY() - y) < .001) {
                            let ptBefore: Point2D = new Point2D(polygon[j]);
                            let ptAfter: Point2D = new Point2D(polygon[(j + 2) % (polygon.length - 1)]);
                            if ((ptBefore.getY() > m1 * ptBefore.getX() + b1 && ptAfter.getY() > m1 * ptAfter.getX() + b1) ||
                                (ptBefore.getY() < m1 * ptBefore.getX() + b1 && ptAfter.getY() < m1 * ptAfter.getX() + b1)) {
                                // Points before and after vertex on the same side
                                ptsPath.push(new Point2D(x, y));
                            }
                        }
                        else {
                            ptsPath.push(new Point2D(x, y));
                        }
                    }
                }
            }
            //reorder ptsPath by distance from the hatch line origin
            Area.reorderPointsByDistance(hatchLine, ptsPath);
            let pt: Point2D;
            pts = new Array();
            n = ptsPath.length;
            //for(k=0;k<ptsPath.length;k++)
            for (k = 0; k < n; k++) {
                pt = ptsPath[k];
                if (k % 2 === 0) {
                    pts.push(new POINT2(pt.getX(), pt.getY(), IPathIterator.SEG_MOVETO));
                }
                else {
                    pts.push(new POINT2(pt.getX(), pt.getY(), IPathIterator.SEG_LINETO));
                }

            }
            ptsPath.length = 0; // ptsPath.clear()
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Area._className, "getLineIntersectPoints",
                    new RendererException("Failed inside getLineIntersectPoints", exc));
            } else {
                throw exc;
            }
        }
        return pts;
    }
    /**
     * this is functionality for clsUtilityGE.buildHatchFillwhich calls hatchLineArea.intersect(shapeArea).
     * so it assumes that this._pts is the hatch lines so it is hatchLines.intersect(shape) where
     * shape is the polygon to be filled with hatch lines
     * @param area 
     */
    public intersect(area: Area): void {
        try {
            //assume area is the polygon and "this" is the hatch line shape
            let j: int = 0;
            let polygon: Array<POINT2> = area.getPathIterator(null).getPoints();
            let hatchLines: Array<POINT2> = this.getPathIterator(null).getPoints();
            // Remove duplicates from the shape
            for (let i: int = 0; i < polygon.length - 1; i++) {
                let pt0: POINT2 = polygon[i];
                let pt1: POINT2 = polygon[i + 1];
                if (pt0.x === pt1.x && pt0.y === pt1.y) {
                    polygon.splice(i + 1, 1);
                    i--;
                }
            }
            //close the polygon
            if (polygon[0].x !== polygon[polygon.length - 1].x || polygon[0].y !== polygon[polygon.length - 1].y) {
                polygon.push(new POINT2(polygon[0]));
            }
            //GeneralPath gp=null;
            //GeneralPath masterGP=null;
            let hatchLine: Line2D;
            let rectHatch: Rectangle2D;
            let rectPoly: Rectangle2D = this.getMBR(polygon);
            let pts: Array<POINT2> = new Array();
            let ptsTemp: Array<POINT2>;
            let n: int = hatchLines.length;
            //for(j=0;j<hatchLines.length-1;j++)
            for (j = 0; j < n - 1; j++) {
                hatchLine = new Line2D(hatchLines[j].x, hatchLines[j].y, hatchLines[j + 1].x, hatchLines[j + 1].y);
                rectHatch = hatchLine.getBounds2D();
                if (rectHatch.intersects(rectPoly) === false) {

                    continue;
                }


                ptsTemp = Area.getLineIntersectPoints(polygon, hatchLine);
                if (ptsTemp != null) {

                    for (const value of ptsTemp) {
                        pts.push(value);
                    }

                }

            }
            let pt: POINT2;
            //area.getPathIterator(null).reset();
            //area.getPathIterator(null).getPoints().clear();
            //this._pts.clear();            
            this.getPathIterator(null).getPoints().length = 0; // this.getPathIterator(null).getPoints().clear()
            //area._pts.clear();
            n = pts.length;
            //for(j=0;j<pts.length;j++)
            for (j = 0; j < n; j++) {
                pt = pts[j];
                switch (pt.style) {
                    case IPathIterator.SEG_MOVETO: {
                        this.moveTo(pt.x, pt.y);
                        break;
                    }

                    case IPathIterator.SEG_LINETO: {
                        this.lineTo(pt.x, pt.y);
                        break;
                    }

                    default: {
                        break;
                    }

                }
            }
            this.getPathIterator(null).reset();
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(Area._className, "intersect",
                    new RendererException("Failed inside intersect", exc));
            } else {
                throw exc;
            }
        }
    }
}
