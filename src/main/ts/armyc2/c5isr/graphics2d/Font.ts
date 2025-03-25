/**
 *
 *
 */
export class Font {
    public static readonly PLAIN: number = 0;
    public static readonly BOLD: number = 1;
    public static readonly ITALIC: number= 2; 

    protected _size: number = 10;
    protected _text: string = "";
    protected _type: number = 0;
    public constructor(s: string, type: number, size: number) {
        this._text = s;
        this._type = type;
        this._size = size;
        return;
    }
    public getSize(): number {
        return this._size;
    }
    public getName():string
    {
        return this._text;
    }
    public getType():number
    {
        return this._type;
    }
    public isBold():boolean
    {
        return (this._type === Font.BOLD)
    }
    public getTypeString():string
    {
        let ret:string;
        switch(this._type)
        {
            case Font.BOLD:
            {
                ret = "bold";
                break;
            }
            case Font.ITALIC:
            {
                ret = "italic";
                break;
            }
            default:
            {
                ret = "normal";
                break;
            }
        }
        return ret;

    }
    public static getTypeString(type:number):string
    {
        let ret:string;
        switch(type)
        {
            case Font.BOLD:
            {
                ret = "bold";
                break;
            }
            /*case Font.ITALIC:
            {
                ret = "italic";
                break;
            }*/
            default:
            {
                ret = "normal";
                break;
            }
        }
        return ret;

    }
    public static getTypeInt(type:string):number
    {
        let ret:number = Font.PLAIN;
        switch(type)
        {
            case "bold":
            {
                ret = Font.BOLD;
                break;
            }
            case "italic":
            {
                ret = Font.ITALIC;
                break;
            }
            default:
            {
                ret = Font.PLAIN;
                break;
            }
        }
        return ret;

    }
    public toString():string
    {
        let font:string = this.getTypeString() + " " + this._size + "px " + this._text;
        return font;
    }
}
