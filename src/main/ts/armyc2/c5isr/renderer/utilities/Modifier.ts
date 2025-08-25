
/**
 * 
 */
export class Modifier {
    private _modifierID:string = null;
    private _yIndex:number = -999;
    private _xIndex:number = -999;
    private _x:number = 0;
    private _y:number = 0;
    private _text:string = "";
    private _centered:boolean = true;

    public constructor(id:string, text:string, indexX:number, indexY:number, centered:boolean, x:number = 0, y:number = 0)
    {
        this._modifierID = id;
        if(text != null && text !== "")
            this._text = text;
        this._xIndex = indexX;
        this._yIndex = indexY;
        this._x = x;
        this._y = y;
        this._centered = centered;
    }


    public getID():string 
        {return this._modifierID;}

    public getText():string
        {return this._text;}

    public getIndexX():number
        {return this._xIndex;}

    public getIndexY():number
        {return this._yIndex;}

    public getCentered():boolean
        {return this._centered;}

    public getX():number    
        {return this._x;}
    
        public setX(x:number)
        {this._x = x;}

    public getY():number
        {return this._y;}
    
        public setY(y:number)
        {this._y = y;}
}
