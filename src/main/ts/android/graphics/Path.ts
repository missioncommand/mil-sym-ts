import { RectF } from "./RectF";
import { POINT2 } from "../../armyc2/c5isr/JavaLineArray/POINT2"
import { type double, type int } from "../../armyc2/c5isr/graphics2d/BasicTypes";

export class Path {
    private pts: Array<POINT2> = [];

    public lineTo(x: double, y: double) {
        if (this.pts.length > 0)
        {
            var lastPt = this.pts[this.pts.length - 1];
            if (lastPt.x === x && lastPt.y === y)
                return;
        }
        this.pts.push(new POINT2(x, y));
    };
    public moveTo(x: double, y: double) {
        if (this.pts.length > 0)
        {
            var lastPt = this.pts[this.pts.length - 1];
            if (lastPt.x === x && lastPt.y === y)
                return;
        }
        this.pts.push(new POINT2(x, y));
    };
    public curveTo(x1: double, y1: double, x2: double, y2: double, x3: double, y3: double) {
        this.pts.push(new POINT2(x1, y1));
        this.pts.push(new POINT2(x2, y2));
        this.pts.push(new POINT2(x3, y3));
    };
    public cubicTo(x1: double, y1: double, x2: double, y2: double, x3: double, y3: double) {
        this.pts.push(new POINT2(x1, y1));
        this.pts.push(new POINT2(x2, y2));
        this.pts.push(new POINT2(x3, y3));
    };
    public quadTo(x1: double, y1: double, x2: double, y2: double) {
        this.pts.push(new POINT2(x1, y1));
        this.pts.push(new POINT2(x2, y2));
    };
    public addPath(path: Path) {
        this.pts.push(...path.getPts());
        return;
    };
    public computeBounds(rect: RectF, exact: boolean) {
        var j = 0;
        var left = this.pts[0].x;
        var right = this.pts[0].x;
        var top = this.pts[0].y;
        var bottom = this.pts[0].y;
        var pt = null;
        for (j = 1; j < this.pts.length; j++) {
            pt = this.pts[j];
            if (pt.x < left)
                left = pt.x;
            if (pt.x > right)
                right = pt.x;
            if (pt.y < top)
                top = pt.y;
            if (pt.y > bottom)
                bottom = pt.y;
        }
        rect.left = left;
        rect.top = top;
        rect.right = right;
        rect.bottom = bottom;
        return;
    };
    public close() {
    };
    public getPts() {
        return this.pts;
    };
    public reset() {
        this.pts.length = 0;
    }
};




