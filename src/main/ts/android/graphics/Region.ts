import { GeneralPath } from "../../armyc2/c5isr/graphics2d/GeneralPath";
import { RectF } from "./RectF";
import { Rectangle } from "../../armyc2/c5isr/graphics2d/Rectangle";

export class Region
{
    private _gp:GeneralPath = new GeneralPath();
    private _rect:RectF = null;
    public constructor()
    {
        if (arguments.length === 1)
        {
            var rect = arguments[0];
            this._gp.moveTo(rect.x, rect.y);
            this._gp.lineTo(rect.x + rect.width, rect.y);
            this._gp.lineTo(rect.x + rect.width, rect.y + rect.height);
            this._gp.lineTo(rect.x, rect.y + rect.height);
            this._gp.lineTo(rect.x, rect.y);
            this._rect = rect;
        }
    }
    
    public setPath(path, clipRegion) {
        return true;
    };
    public contains(x:number, y:number) {
        return this._gp.contains(x, y);
    };
    public getBounds = function() {
        var rect = this._gp.getBounds();
        return  new Rectangle(rect.x, rect.y, rect.width, rect.height);
    };
    public op = function(region:any, op:any) {
        return false;
    };
};