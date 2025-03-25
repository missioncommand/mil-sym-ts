import { Point2D } from "./Point2D";

/**
 *
 *
 */
export class Point {
    public x: number = 0;
    public y: number = 0;
    public constructor();
    public constructor(x1: number, y1: number);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {
                this.setLocation(0, 0)
                break;
            }

            case 2: {
                const [x1, y1] = args as [number, number];
                this.setLocation(x1, y1)
                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public getX(): number {
        return this.x;
    }
    public getY(): number {
        return this.y;
    }

    public setLocation(x1: number, y1: number): void {
        this.x = Math.trunc(x1);
        this.y = Math.trunc(y1);
    }
    /**
     * Returns a string representing one of the shape types
     * from "armyc2.c2sd.renderer.so.ShapeTypes"
     * @returns {String} 
     */
    public getShapeType(): string {
        return "POINT";//armyc2.c2sd.renderer.so.ShapeTypes.POINT;
    };

    /**
     * move x & y by specified amounts.
     * @param {Number} x shift x point by this value
     * @param {Number} y shift y point by this value
     * @returns {void}
     */
    public shift(x: number, y: number): void {
        this.x += x;
        this.y += y;
    };
    /**
     * @returns {String} like "{x:#,y:#}"
     */
    public toStringFormatted(): string {
        return "{x:" + this.x + ", y:" + this.y + "}";
    };
    /**
     * Makes a copy of this point object.
     * @returns {armyc2.c2sd.renderer.so.Point} Copy of original point.
     */
    public clone(): Point {
        return new Point(this.x, this.y);
    };

    public toPoint2D(): Point2D {
        return new Point2D(this.x, this.y);
    }
    /**
     * @param {OffscreenCanvasRenderingContext2D} context object from html5 canvas
     * @returns {void}
     */
    public setPath(context: OffscreenCanvasRenderingContext2D): void {
        let x = this.x;
        let y = this.y;

        //context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 1, y);
        context.lineTo(x + 1, y + 1);
        context.lineTo(x, y + 1);
        context.closePath();

    };
    /**
     * @param {context} context object from html5 canvas
     * @returns {void}
     */
    public stroke(context: OffscreenCanvasRenderingContext2D): void {
        context.beginPath();
        this.setPath(context);
        context.stroke();
    };
    /**
     * @param {context} context object from html5 canvas
     * @returns {void}
     */
    public fill(context: OffscreenCanvasRenderingContext2D): void {
        context.beginPath();
        this.setPath(context);
        context.fill();
    };
}
