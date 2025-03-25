import { PathIterator } from "./pathiterator";
import { Point } from "./point";
import { Rectangle } from "./rectangle";
import { ActionTypes, ShapeTypes } from "./types";

export class Path
{
    private _actions:Array<Array<any>> = [];
    private _dashArray:string|null = null;
    private _startPoint:Point|null=null;
    private _endPoint:Point|null=null;
    private _lastMoveTo:Point|null = null;
    private _rectangle:Rectangle|null = null;
    private _method:String|null = null;//stroke,fill,fillPattern

    /**
     * @return {ShapeTypes} ShapeTypes.Path
     */
    getShapeType()
    {
        return ShapeTypes.PATH;
    }
    
    setLineDash(dashArray:string)
    {
        this._dashArray = dashArray;
    }

    
    getBounds():Rectangle
    {
        if(this._rectangle)
        {
            return new Rectangle(this._rectangle.getX(),
                this._rectangle.getY(),
                this._rectangle.getWidth(),
                this._rectangle.getHeight());
        }
        else
        {
            return null;
        }
    };

    shift(x:number,y:number)
    {
        var size = this._actions.length;
        var temp = null;
        this._rectangle.shift(x,y);

        for(var i=0; i<size;i++)
        {
            temp = this._actions[i];
            if(temp[0]===ActionTypes.ACTION_MOVE_TO)
            {
                temp[1] = temp[1] + x;
                temp[2] = temp[2] + y;
            }
            else if(temp[0]===ActionTypes.ACTION_LINE_TO)
            {
                temp[1] = temp[1] + x;
                temp[2] = temp[2] + y;
            }
            else if(temp[0]===ActionTypes.ACTION_CURVE_TO)
            {
                temp[1] = temp[1] + x;
                temp[2] = temp[2] + y;
                temp[3] = temp[3] + x;
                temp[4] = temp[4] + y;
                temp[5] = temp[5] + x;
                temp[6] = temp[6] + y;
            }
            else if(temp[0]===ActionTypes.ACTION_QUAD_TO)
            {
                temp[1] = temp[1] + x;
                temp[2] = temp[2] + y;
                temp[3] = temp[3] + x;
                temp[4] = temp[4] + y;
            }
            else if(temp[0]===ActionTypes.ACTION_ARC_TO)
            {
                temp[1] = temp[1] + x;
                temp[2] = temp[2] + y;
                temp[3] = temp[3] + x;
                temp[4] = temp[4] + y;
            }
            else if(temp[0]===ActionTypes.ACTION_ARC)
            {
                temp[1] = temp[1] + x;
                temp[2] = temp[2] + y;
            }
        }
        this._startPoint.shift(x,y);
        this._endPoint.shift(x,y);
        this._lastMoveTo.shift(x,y);
    }

    /**
     * The number of this._actions on the path
     */
    getLength()
    {
        this._actions.length;
    };

    /**
     * Adds a point to the path by moving to the specified coordinates specified
     * @param x 
     * @param y 
     */
    moveTo(x:number,y:number)
    {

        if(this._actions.length === 0)
        {
            this._rectangle = new Rectangle(x,y,1,1);
            this._startPoint = new Point(x,y);
            this._endPoint = new Point(x,y);
            //curr_startPoint = new armyc2.c2sd.renderer.Point(x,y);
            //curr_endPoint = new armyc2.c2sd.renderer.Point(x,y);
        }
        this._rectangle.unionPoint(new Point(x,y));
        this._actions.push([ActionTypes.ACTION_MOVE_TO,x,y]);
        this._lastMoveTo = new Point(x,y);
		this._endPoint = new Point(x,y);
    };
    /**
     * Adds a point to the path by drawing a straight line from the current 
     * coordinates to the new specified coordinates specified
     * @param x 
     * @param y 
     */
    lineTo(x:number,y:number){
        
        if(this._actions.length === 0)
        {
            this.moveTo(0,0);
        }
        this._actions.push([ActionTypes.ACTION_LINE_TO,x,y]);
        this._rectangle.unionPoint(new Point(x,y));
        this._endPoint = new Point(x,y);
    };
	
	/**
     * Adds a point to the path by drawing a straight line from the current 
     * coordinates to the new specified coordinates specified
     * @param x 
     * @param y 
     * @param pattern 
     */
    dashedLineTo(x:number,y:number,pattern:Array<number>){
        
        if(this._actions.length === 0)
        {
            this.moveTo(0,0);
        }
		var start = this.getCurrentPoint();
        this._actions.push([ActionTypes.ACTION_DASHED_LINE_TO,start.getX(),start.getY(), x, y, pattern]);
        this._rectangle.unionPoint(new Point(x,y));
        this._endPoint = new Point(x,y);
    };
	
    /**
     * Adds a curved segment, defined by three new points, to the path by 
     * drawing a Bézier curve that intersects both the current coordinates 
     * and the specified coordinates (x,y), using the specified points 
     * (cp1x,xp1y) and (cp2x,cp2y) as Bézier control points.
     * @param cp1x 
     * @param cp1y 
     * @param cp2x 
     * @param cp2y 
     * @param x 
     * @param y 
     */
    bezierCurveTo(cp1x:number, cp1y:number, cp2x:number, cp2y:number,x:number,y:number){
        
        if(this._actions.length === 0)
        {
            this.moveTo(0,0);
        }
        this._actions.push([ActionTypes.ACTION_CURVE_TO,cp1x,cp1y,cp2x,cp2y,x,y]);
        this._rectangle.unionPoint(new Point(cp1x,cp1y));
        this._rectangle.unionPoint(new Point(cp2x,cp2y));
        this._rectangle.unionPoint(new Point(x,y));
        this._endPoint = new Point(x,y);
    };
    /**
     * Adds a curved segment, defined by two new points, to the path by 
     * drawing a Quadratic curve that intersects both the current 
     * coordinates and the specified coordinates (x,y), using the 
     * specified point (cpx,cpy) as a quadratic parametric control point.
     * @param cpx
     * @param cpy
     * @param x
     * @param y
     * @returns 
     */
    quadraticCurveTo(cpx:number,cpy:number,x:number,y:number){
        
        if(this._actions.length === 0)
        {
            this.moveTo(0,0);
        }
        this._actions.push([ActionTypes.ACTION_QUAD_TO,cpx,cpy,x,y]);
        this._rectangle.unionPoint(new Point(cpx,cpy));
        this._rectangle.unionPoint(new Point(x,y));
        this._endPoint = new Point(x,y);
    };
    /**
     * The arcTo() method creates an arc/curve between two tangents on the canvas.
     * @param x1 The x-coordinate of the beginning of the arc
     * @param y1 The y-coordinate of the beginning of the arc
     * @param x2 The x-coordinate of the end of the arc
     * @param y2 The y-coordinate of the end of the arc
     * @param r The radius of the arc
     * @returns 
     */
    arcTo(x1:number,y1:number,x2:number,y2:number,r:number){
        
        if(this._actions.length === 0)
        {
            this.moveTo(0,0);
        }
        this._actions.push([ActionTypes.ACTION_ARC_TO,x1,y1,x2,y2]);
        this._rectangle.unionPoint(new Point(x1,y1));
        this._rectangle.unionPoint(new Point(x2,y2));
        this._endPoint = new Point(x2,y2);
    };
    /**
     * The arc() method creates an arc/curve 
     * (use to create circles. or parts of circles).
     * @param x The x-coordinate of the center of the circle
     * @param y The y-coordinate of the center of the circle
     * @param r The radius of the circle
     * @param sAngle The starting angle, in degrees 
     * (0 is at the 3 -'clock position of the arc's circle)
     * @param eAngle The ending angle, in degrees
     * @param counterclockwise Optional. Specifies wheter the drawing 
     * should be counterclockwise or clockwise.  False=clockwise, 
     * true=counter-clockwise;
     * @returns 
     */
    arc(x:number,y:number,r:number,sAngle:number,eAngle:number,counterclockwise:boolean){
        
        
        
        if(counterclockwise !== true)
        {
            counterclockwise = false;
        }
        
        //degrees to radians
        var sa = sAngle * (Math.PI / 180),
            ea = eAngle * (Math.PI / 180);
    

        if(this._startPoint===null)
        {
            var sX = r * Math.cos(sa) + x;
            var sY = r * Math.sin(sa) + y;
            this._startPoint = new Point(sX,sY);
            this._rectangle = new Rectangle(sX,sY,1,1);
        }
        

        this._actions.push([ActionTypes.ACTION_ARC,x,y,r,sa,ea,counterclockwise]);
        this._rectangle.union(new Rectangle(x-r,y-r,r*2,r*2));
        
        var newX = r * Math.cos(ea) + x;
        var newY = r * Math.sin(ea) + y;
        this._endPoint = new Point(newX,newY);
        this.moveTo(newX,newY);
        
    };
    /**
     * Closes the current subpath by drawing a straight line back to the coordinates of the last moveTo.
     * @return  
     */
    closePath(){
        this.lineTo(this._lastMoveTo.getX(),this._lastMoveTo.getY());
        this._endPoint = this._lastMoveTo.clone();
    };
    /**
     * @return Point
     */
    getCurrentPoint()
    {
        return this._endPoint.clone();
    };
    /**
     * @return PathIterator
     */
    getPathIterator()
    {
        return new PathIterator(this._actions);
    };
    /**
     * Apply the path to the passed context (doesn't draw)
     * @param context
     * @return  
     */
    private setPath(context:OffscreenCanvasRenderingContext2D){

        //context.beginPath();
        var size = this._actions.length;
        var temp = null;
        
        for(var i=0; i<size;i++)
        {
            temp = this._actions[i];
			

            if(temp[0]===ActionTypes.ACTION_MOVE_TO)
            {
                //context.moveTo(temp[1],temp[2]);
                
                if(i === 0 || this._method !== "fillPattern")
                {
                    context.moveTo(temp[1],temp[2]);
                }
                else//no moves in a fill shape except maybe for the first one
                {
                    context.lineTo(temp[1],temp[2]);
                }//*/
            }
            else if(temp[0]===ActionTypes.ACTION_LINE_TO)
            {
                context.lineTo(temp[1],temp[2]);
            }
            else if(temp[0]===ActionTypes.ACTION_DASHED_LINE_TO)
            {
                if(this._method === "stroke")
                {
                    context.lineTo(temp[3],temp[4]);

                    //function prototype exists in shape utilities class but there doesn't seem to be a need
                    //since setLineDash exists.
                    //context.dashedLineTo(temp[1],temp[2],temp[3],temp[4],temp[5]);    
                }
                else //you don't dash a fill shape
                {
                    context.lineTo(temp[3],temp[4]);
                }
            }
            else if(temp[0]===ActionTypes.ACTION_CURVE_TO)
            {
                context.bezierCurveTo(temp[1],temp[2],temp[3],temp[4],temp[5],temp[6]);
            }
            else if(temp[0]===ActionTypes.ACTION_QUAD_TO)
            {
                context.quadraticCurveTo(temp[1],temp[2],temp[3],temp[4]);
            }
            else if(temp[0]===ActionTypes.ACTION_ARC_TO)
            {
                context.arcTo(temp[1],temp[2],temp[3],temp[4],temp[5]);
            }
            else if(temp[0]===ActionTypes.ACTION_ARC)
            {
                context.arc(temp[1],temp[2],temp[3],temp[4],temp[5],temp[6]);
            }//*/
        }
        
    };
    /**
     * Draws the path to the passed context
     * @param context
     * @return  
     */
    stroke(context:OffscreenCanvasRenderingContext2D){
        this._method = "stroke";
        if(this._dashArray)
        {
            let temp:Array<string> = this._dashArray.split(" ");
            let temp2:Array<number> = new Array();

            for(let i:number = 0; i < temp.length; i++)
            {
                temp2[i] = parseInt(temp[i]);
            }

            context.setLineDash(temp2);
        }
        context.beginPath();
        this.setPath(context);
        context.stroke();
        context.setLineDash([]);
    };
    /**
     * Fills the path on the passed context
     * @param context
     * @return  
     */
    fill(context:OffscreenCanvasRenderingContext2D){
        this._method = "fill";
        context.beginPath();
        this.setPath(context);
        context.fill();
    };
    
    fillPattern(context:OffscreenCanvasRenderingContext2D,fillPattern:CanvasImageSource){
        this._method = "fillPattern";
        context.beginPath();
        this.setPath(context);
        let pattern:CanvasPattern = context.createPattern(fillPattern, "repeat");   
        context.fillStyle = pattern;
        context.fill();
    };
    
    /**
     * Arc and ArcTo do not covert currently
     */
    toSVGElement(stroke:string | null, strokeWidth:number, fill:string | null, strokeOpacity:number=1, fillOpacity:number=1, svgFormat:number=0)
    {
        var format = 1;
        if(svgFormat)
        {
            format = svgFormat;
        }
        
        //context.beginPath();
        var size = this._actions.length;
        var temp = null;
        var path = "";
        
        for(var i=0; i<size;i++)
        {
            temp = this._actions[i];
			
            /*if(path !== "")
                path += " ";*/

            if(temp[0]===ActionTypes.ACTION_LINE_TO)
            {
                path += "L" + temp[1] + " " + temp[2];
                //context.lineTo(temp[1],temp[2]);
            }
            else if(temp[0]===ActionTypes.ACTION_MOVE_TO)
            {
                //context.moveTo(temp[1],temp[2]);
                
                if(i === 0 || this._method !== "fillPattern")
                {
                    path += "M" + temp[1] + " " + temp[2];
                    //context.moveTo(temp[1],temp[2]);
                }
                else//no moves in a fill shape except maybe for the first one
                {
                    path += "L" + temp[1] + " " + temp[2];
                    //context.lineTo(temp[1],temp[2]);
                }//*/
            }
            else if(temp[0]===ActionTypes.ACTION_DASHED_LINE_TO)
            {
                path += "L" + temp[3] + " " + temp[4];
                /*if(this._method === "stroke")
                {
                    context.dashedLineTo(temp[1],temp[2],temp[3],temp[4],temp[5]);    
                }
                else //you don't dash a fill shape
                {
                    context.lineTo(temp[3],temp[4]);
                }//*/
            }
            else if(temp[0]===ActionTypes.ACTION_CURVE_TO)
            {
                //C100 100 250 100 250 200
                path += "C" + temp[1] + " " + temp[2] + " " + temp[3] + " " + temp[4] + " " + temp[5] + " " + temp[6]; 
                //context.bezierCurveTo(temp[1],temp[2],temp[3],temp[4],temp[5],temp[6]);
            }
            else if(temp[0]===ActionTypes.ACTION_QUAD_TO)
            {
                path += "Q" + temp[1] + " " + temp[2] + " " + temp[3] + " " + temp[4];
                //context.quadraticCurveTo(temp[1],temp[2],temp[3],temp[4]);
            }
            else if(temp[0]===ActionTypes.ACTION_ARC_TO)
            {
                //path += "C" + temp[1] + " " + temp[2] + " " + temp[3] + " " + temp[4] + " " + temp[5];
                //context.arcTo(temp[1],temp[2],temp[3],temp[4],temp[5]);
            }
            else if(temp[0]===ActionTypes.ACTION_ARC)
            {
                //context.arc(temp[1],temp[2],temp[3],temp[4],temp[5],temp[6]);
            }//*/
        }
        //TODO: generate path svg element
        var line = '<path d="' + path + '"';

        if(stroke)
        {
            //line += ' stroke="' + stroke + '"';
            if(format === 2)
                line += ' stroke="' + stroke.replace(/#/g,"%23") + '"';//.replace(/#/g,"%23")
            else
                line += ' stroke="' + stroke + '"';
            /*else
                line += ' stroke="' + stroke.replace(/#/g,"&#35;") + '"';*/
            
            if(strokeWidth)
                line += ' stroke-width="' + strokeWidth + '"';
            else
                line += ' stroke-width="2"';
        
            if(strokeOpacity !== 1.0)
            {
                //stroke-opacity="0.4"
                line += ' stroke-opacity="' + strokeOpacity + '"';
            }
            
            //line += ' stroke-linejoin="round"';
            line += ' stroke-linecap="round"';
            //line += ' stroke-linecap="square"';
        }
            
        if(this._dashArray != null)
            line += ' stroke-dasharray="' + this._dashArray + '"';
            
        if(fill)
        {
            if(fill.indexOf("url") === 0)
            {
                line += ' fill="url(#fillPattern)"';
                //line += ' fill="url(&#35;fillPattern)"';
            }
            else
            {
                //line += ' fill="' + fill + '"';
                if(format === 2)
                    line += ' fill="' + fill.replace(/#/g,"%23") + '"';//text = text.replace(/\</g,"&gt;");
                else
                    line += ' fill="' + fill + '"';//text = text.replace(/\</g,"&gt;");
                /*else
                    line += ' fill="' + fill.replace(/#/g,"&#35;") + '"';//text = text.replace(/\</g,"&gt;");*/
                    
                if(fillOpacity !== 1.0)
                {
                    //fill-opacity="0.4"
                    line += ' fill-opacity="' + fillOpacity + '"';
                }    
            }
            
        }
        else
            line += ' fill="none"';
        
        line += ' />';
        return line;
        
    }
}