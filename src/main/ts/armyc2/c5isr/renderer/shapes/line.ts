import { Point } from "./point";
import { ShapeTypes } from "./types";
import { Rectangle } from "./rectangle";
import { ShapeUtilties } from "./utilities";


export class Line
{
    private pt1:Point;
    private pt2:Point;
    private rectangle:Rectangle

    constructor(x1:number,y1:number,x2:number,y2:number) {

        this.pt1 = new Point(x1,y1);
        this.pt2 = new Point(x2,y2);

        this.rectangle = new Rectangle(x1,y1,1,1);
        this.rectangle.unionPoint(new Point(x2,y2));            

    };
     
    // <editor-fold defaultstate="collapsed" desc="Public Functions">
    getShapeType(){
        return ShapeTypes.LINE;
    };

    getBounds(){
        return new Rectangle(this.rectangle.getX(),
                                this.rectangle.getY(),
                                this.rectangle.getWidth(),
                                this.rectangle.getHeight());
    };
    getP1()
    {
        return this.pt1;
    };
    getP2()
    {
        return this.pt2;
    };
    
    shift(x:number,y:number){

        this.rectangle.shift(x,y);
        
        this.pt1.shift(x,y);
        this.pt2.shift(x,y);

    };
        /**
     * Tests if the specified line segment intersects this line segment.
     * @param line the specified <code>Line</code>
     * @return <code>true</code> if this line segment and the specified line
     *			segment intersect each other; 
     *			<code>false</code> otherwise.
     */
    intersectsLine(line:Line)
    {
        return ShapeUtilties.linesIntersect(
                    this.getP1().getX(),this.getP1().getY(),
                    this.getP2().getX(),this.getP2().getY(),
                    line.getP1().getX(),line.getP1().getY(),
                    line.getP2().getX(),line.getP2().getY());
        
    };


    setPath(context:CanvasRenderingContext2D){

        //context.beginPath();
        context.moveTo(this.pt1.getX(),this.pt1.getY());
        context.lineTo(this.pt2.getX(),this.pt2.getY());

    };
    stroke(context:CanvasRenderingContext2D){
        context.beginPath();
        context.moveTo(this.pt1.getX(),this.pt1.getY());
        context.lineTo(this.pt2.getX(),this.pt2.getY());
        context.stroke();
    };
    fill(context:CanvasRenderingContext2D){
        context.beginPath();
        context.moveTo(this.pt1.getX(),this.pt1.getY());
        context.lineTo(this.pt2.getX(),this.pt2.getY());
        context.fill();
    };
    
    toSVGElement(stroke:string | null, strokeWidth:number, fill:string | null):string
    {
        var line = '<line x1="' + this.pt1.getX() + '" y1="' + this.pt1.getY();
        line += '" x2="' + this.pt2.getX() + '" y2="' + this.pt2.getY() + '"';
        
        if(strokeWidth)
            line += ' stroke-width="' + strokeWidth + '"';
        else if(stroke) 
            line += ' stroke-width="2"';
        
        if(stroke)
            line += ' stroke="' + stroke + '"';
            
        if(fill)
            line += ' fill="' + fill + '"';
        else
            line += ' fill="none"';
        
        line += '/>';
        return line;
    };
}



    
