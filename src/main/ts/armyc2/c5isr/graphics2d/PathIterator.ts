/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { type int, type double } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { POINT2 } from "../JavaLineArray/POINT2"
//import { IPathIterator } from "../graphics2d/IPathIterator"



/**
 *
 *
 */
export class PathIterator {
    public static readonly SEG_CLOSE: int = 4;
    public static readonly SEG_CUBICTO: int = 3;
    public static readonly SEG_LINETO: int = 1;
    public static readonly SEG_MOVETO: int = 0;
    public static readonly SEG_QUADTO: int = 2;
    public static readonly WIND_EVEN_ODD: int = 0;
    public static readonly WIND_NON_ZERO: int = 1;
    private _currentSeg: int = 0;
    private _pts: Array<POINT2>;
    public constructor(tx: AffineTransform | null) {

        this._currentSeg = 0;
        this._pts = new Array();
    }
    public getPoints(): Array<POINT2> {
        return this._pts;
    }
    
    public currentSegment(coords: number[]): int {
        let type: int = this._pts[this._currentSeg].style;
        if (type === PathIterator.SEG_LINETO || type === PathIterator.SEG_MOVETO) {
            coords[0] = this._pts[this._currentSeg].x;
            coords[1] = this._pts[this._currentSeg].y;
        } else if (type === PathIterator.SEG_CUBICTO) {
            coords[0] = this._pts[this._currentSeg].x;
            coords[1] = this._pts[this._currentSeg].y;
            this._currentSeg++;
            coords[2] = this._pts[this._currentSeg].x;
            coords[3] = this._pts[this._currentSeg].y;
            this._currentSeg++;
            coords[4] = this._pts[this._currentSeg].x;
            coords[5] = this._pts[this._currentSeg].y;
        } else if (type === PathIterator.SEG_QUADTO) {
            coords[0] = this._pts[this._currentSeg].x;
            coords[1] = this._pts[this._currentSeg].y;
            this._currentSeg++;
            coords[2] = this._pts[this._currentSeg].x;
            coords[3] = this._pts[this._currentSeg].y;
        }
        return type;
    }

    public getWindingRule(): int {
        return 1;
    }
    public isDone(): boolean {
        if (this._currentSeg === this._pts.length) {

            return true;
        }


        return false;
    }
    public next(): void {
        this._currentSeg++;
    }

    //public methods to collect the poins and the moves
    //GeneralPath must call this whenever its getPathIterator method is called to reset the iterator
    public reset(): void {
        this._currentSeg = 0;
    }
    public moveTo(x: double, y: double): void {
        this._pts.push(new POINT2(x, y, PathIterator.SEG_MOVETO));
    }
    public lineTo(x: double, y: double): void {
        this._pts.push(new POINT2(x, y, PathIterator.SEG_LINETO));
    }
    public cubicTo(x1: double, y1: double, x2: double, y2: double, x3: double, y3: double): void {
        this._pts.push(new POINT2(x1, y1, PathIterator.SEG_CUBICTO));
        this._pts.push(new POINT2(x2, y2, PathIterator.SEG_CUBICTO));
        this._pts.push(new POINT2(x3, y3, PathIterator.SEG_CUBICTO));
    }
    public curveTo(x1: double, y1: double, x2: double, y2: double, x3: double, y3: double): void {
        this._pts.push(new POINT2(x1, y1, PathIterator.SEG_CUBICTO));
        this._pts.push(new POINT2(x2, y2, PathIterator.SEG_CUBICTO));
        this._pts.push(new POINT2(x3, y3, PathIterator.SEG_CUBICTO));
    }
    public quadTo(x1: double, y1: double, x2: double, y2: double): void {
        this._pts.push(new POINT2(x1, y1, PathIterator.SEG_QUADTO));
        this._pts.push(new POINT2(x2, y2, PathIterator.SEG_QUADTO));
    }
    public getBounds(): Rectangle2D {
        let j: int = 0;
        let left: double = this._pts[0].x;
        let right: double = this._pts[0].x;
        let top: double = this._pts[0].y;
        let bottom: double = this._pts[0].y;
        let n: int = this._pts.length;
        //for(j=1;j<_pts.length;j++)
        for (j = 1; j < n; j++) {
            if (this._pts[j].x < left) {

                left = this._pts[j].x;
            }

            if (this._pts[j].x > right) {

                right = this._pts[j].x;
            }

            if (this._pts[j].y < top) {

                top = this._pts[j].y;
            }

            if (this._pts[j].y > bottom) {

                bottom = this._pts[j].y;
            }

        }
        let rect: Rectangle2D = new Rectangle2D(left, top, right - left, bottom - top);
        return rect;
    }
    public setPathIterator(pts: Array<POINT2>): void {
        this.reset();
        this._pts = pts;
    }
}
