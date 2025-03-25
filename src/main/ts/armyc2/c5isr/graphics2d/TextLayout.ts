/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { type float, type int } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { Font } from "../graphics2d/Font"
import { FontRenderContext } from "../graphics2d/FontRenderContext"
import { GeneralPath } from "../graphics2d/GeneralPath"
import { Rectangle } from "../graphics2d/Rectangle"
import { Shape } from "../graphics2d/Shape"


//import android.graphics.drawable.shapes.Shape;
//import android.graphics.drawable.shapes.PathShape;
//import android.graphics.Path;
/**
 *
 *
 */
export class TextLayout {
    protected _font: Font;
    protected _str: string = "";
    public constructor(s: string, font: Font, frc: FontRenderContext) {

        this._font = font;
        this._str = s;
        //return;
    }
    public getOutline(tx: AffineTransform | null): Shape {
        return new GeneralPath();
    }
    //used by ShapeInfo
    public getPixelBounds(frc: FontRenderContext, x: float, y: float): null {
        return null;
    }
    public getBounds(): Rectangle {
        let width: int = this._font.getSize() / 2 * this._str.length;
        let height: int = this._font.getSize();
        let rect: Rectangle = new Rectangle(0, 0, width, height);
        return rect;
    }
}
