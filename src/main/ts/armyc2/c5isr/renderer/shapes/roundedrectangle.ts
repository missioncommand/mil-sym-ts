import { Rectangle } from "./rectangle";

export class RoundedRectangle
{
    private radius:number;
    private rectangle:Rectangle

    constructor(x,y,w,h,radius) 
    {

        this.radius = radius;

        this.rectangle = new Rectangle(x,y,w,h);
	
    }

    /**
     * 
     */
    getShapeType():string{
        return "ROUNDED_RECTANGLE";//ShapeTypes.ROUNDED_RECTANGLE;
    };

    /**
     * 
     */
    getBounds():Rectangle
    {
        return new Rectangle(this.rectangle.getX()-1,
                                this.rectangle.getY()-1,
                                this.rectangle.getWidth()+2,
                                this.rectangle.getHeight()+2);
    };

    shift(x:number,y:number)
    {
        this.rectangle.shift(x,y);
    };

    setPath(context:CanvasRenderingContext2D){
        var x = this.rectangle.getX(),
            y = this.rectangle.getY(),
            w = this.rectangle.getWidth(),
            h = this.rectangle.getHeight();
        if(w < (2 * this.radius))
            this.radius = w/2;
        if(h < (2 * this.radius))
            this.radius = h/2;
        var r = this.radius;

        //context.beginPath();
        context.moveTo(x + r, y);
        context.lineTo(x + w -r,y);
        context.arcTo(x + w, y, x + w, y+r, r);
        context.lineTo(x + w,y + h - r);
        context.arcTo(x + w, y+h, x+w-r, y + h, r);
        context.lineTo(x + r,y + h);
        context.arcTo(x, y+h, x, y+h-r, r);
        context.lineTo(x,y + r);
        context.arcTo(x, y, x + r, y, r);

    };

    stroke(context:CanvasRenderingContext2D){
        context.beginPath();
        this.setPath(context);
        context.stroke();
    };

    fill(context:CanvasRenderingContext2D){
        context.beginPath();
        this.setPath(context);
        context.fill();
    };
    
    toSVGElement(stroke:string | null, strokeWidth:number, fill:string | null):string
    {  
        var line = '<rect x="' + this.rectangle.getX() + '" y="' + this.rectangle.getY();
        line += '" rx="' + this.radius + '" ry="' + this.radius;
        line += '" width="' + this.rectangle.getWidth() + '" height="' + this.rectangle.getHeight() + '"';
        
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
    }

}