import { BasicStroke } from "../../../graphics2d/BasicStroke";
import { Point2D } from "../../../graphics2d/Point2D";
import { Color } from "../../../renderer/utilities/Color";


/**
 *
 *
 */
export class LineInfo {

    private lineColor: Color;
    private fillColor: Color;
    //private int lineWidth = 2;
    private stroke: BasicStroke;

    private _Polylines: Array<Array<Point2D>>;

    public constructor() {
    }

    public setLineColor(value: Color): void {
        this.lineColor = value;
    }
    public getLineColor(): Color {
        return this.lineColor;
    }

    public setFillColor(value: Color): void {
        this.fillColor = value;
    }
    public getFillColor(): Color {
        return this.fillColor;
    }

    public getStroke(): BasicStroke {
        return this.stroke;
    }
    //client will use this to do fills (if it is not null)
    /*
        public TexturePaint getTexturePaint()
        {
            return texturePaint;
        }
        public void setTexturePaint(TexturePaint value)
        {
            texturePaint=value;
        }*/

    public setStroke(s: BasicStroke): void {
        this.stroke = s;
    }

    public getPolylines(): Array<Array<Point2D>> {
        return this._Polylines;
    }

    public setPolylines(value: Array<Array<Point2D>>): void {
        this._Polylines = value;
    }

}
