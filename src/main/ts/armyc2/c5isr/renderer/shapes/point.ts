import { Point2D } from "../../graphics2d/Point2D";

export class Point{
    public x = 0;
    public y = 0;

    /**
     * 
     * @param x 
     * @param y 
     */
    constructor(x:number,y:number)
    {
        this.x = x;
        this.y = y;
    };
    /**
     * Returns a string representing one of the shape types
     * from "armyc2.c2sd.renderer.so.ShapeTypes"
     * @returns {String} 
     */
    public getShapeType():string
    {
        return "POINT";//armyc2.c2sd.renderer.so.ShapeTypes.POINT;
    };
    /**
     * 
     * @returns {Number}
     */
    public getX():number
    {
        return this.x;
    };
    /**
     * 
     * @returns {Number}
     */
     public getY():number
     {
        return this.y;
    };
    /**
     * Reset the x & y of this point object.
     * @param {Number} x
     * @param {Number} y
     * @returns {void}
     */
    public setLocation(x:number,y:number): void
    {
        this.x = x;
        this.y = y;
    };
    /**
     * move x & y by specified amounts.
     * @param {Number} x shift x point by this value
     * @param {Number} y shift y point by this value
     * @returns {void}
     */
    public shift(x:number,y:number): void
    {
        this.x += x;
        this.y += y;
    };
    /**
     * @returns {String} like "{x:#,y:#}"
     */
    public toStringFormatted(): string
    {
        return "{x:" + this.x + ", y:" + this.y + "}";
    };
    /**
     * Makes a copy of this point object.
     * @returns {armyc2.c2sd.renderer.so.Point} Copy of original point.
     */
    public clone():Point
    {
        return new Point(this.x,this.y);
    };
    /**
     * @param {CanvasRenderingContext2D} context object from html5 canvas
     * @returns {void}
     */
    public setPath(context:CanvasRenderingContext2D): void
    {
        let x = this.x;
        let y = this.y;

        //context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 1,y);
        context.lineTo(x + 1,y + 1);
        context.lineTo(x,y + 1);
        context.closePath();

    };
    /**
     * @param {context} context object from html5 canvas
     * @returns {void}
     */
    public stroke(context:CanvasRenderingContext2D): void{
        context.beginPath();
        this.setPath(context);
        context.stroke();
    };
    /**
     * @param {context} context object from html5 canvas
     * @returns {void}
     */
    public fill(context:CanvasRenderingContext2D): void{
        context.beginPath();
        this.setPath(context);
        context.fill();
    };

    public toPoint2D()
    {
        return new Point2D(this.x,this.y);
    }

}
