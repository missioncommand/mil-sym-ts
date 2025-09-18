import { Rect } from "./Rect";
import { type float } from "../../armyc2/c5isr/graphics2d/BasicTypes";
import { Typeface } from "./Typeface";

export class Paint
{
    public constructor()
    {

    }
    public getTextBounds(str:string, xstart:number, end:number, rect:Rect): void {
        return null;
    };
    public setTextSize(size:float) {
        return;
    };
    public setAntiAlias(b:boolean) {
        return;
    };
    public setColor(color: number) {
        return;
    };
    public setTypeface(tf: Typeface) {
        return;
    };

};