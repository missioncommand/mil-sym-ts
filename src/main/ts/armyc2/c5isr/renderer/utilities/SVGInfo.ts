
import { Rectangle2D } from "../../graphics2d/Rectangle2D"

export class SVGInfo {
    private _ID: string;
    private _Bbox: Rectangle2D;
    private _SVG: string;
    public constructor(id: string, measurements: Rectangle2D, svg: string) {
        this._ID = id;
        this._Bbox = measurements;
        this._SVG = svg;
    }

    public getID(): string {
        return this._ID;
    }

    public getBbox(): Rectangle2D {
        return this._Bbox;
    }

    public getSVG(): string {
        return this._SVG;
    }

    public toString(): string {
        return this._ID + "\n" + this._Bbox.toString() + "\n" + this._SVG;
    }
}
