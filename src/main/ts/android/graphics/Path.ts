import { POINT2 } from "../../armyc2/c5isr/JavaLineArray/POINT2"

export class Path {
    private pts: Array<POINT2> = [];

    public lineTo(x, y) {
        if (this.pts.length > 0)
        {
            var lastPt = this.pts[this.pts.length - 1];
            if (lastPt.x === x && lastPt.y === y)
                return;
        }
        this.pts.push(new POINT2(x, y));
    };
    public moveTo(x, y) {
        if (this.pts.length > 0)
        {
            var lastPt = this.pts[this.pts.length - 1];
            if (lastPt.x === x && lastPt.y === y)
                return;
        }
        this.pts.push(new POINT2(x, y));
    };
    public curveTo(x1, y1, x2, y2, x3, y3) {
        this.pts.push(new POINT2(x1, y1));
        this.pts.push(new POINT2(x2, y2));
        this.pts.push(new POINT2(x3, y3));
    };
    public cubicTo(x1, y1, x2, y2, x3, y3) {
        this.pts.push(new POINT2(x1, y1));
        this.pts.push(new POINT2(x2, y2));
        this.pts.push(new POINT2(x3, y3));
    };
    public quadTo(x1, y1, x2, y2) {
        this.pts.push(new POINT2(x1, y1));
        this.pts.push(new POINT2(x2, y2));
    };
    public addPath(path) {
        this.pts.push(...path.getPts());
        return;
    };
    public computeBounds(rect, exact) {
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




