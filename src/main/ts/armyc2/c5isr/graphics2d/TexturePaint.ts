/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { Graphics2D } from "../graphics2d/Graphics2D"
import { Rectangle2D } from "../graphics2d/Rectangle2D"


//import android.graphics.RectF;
/**
 *
 *
 * @deprecated
 */
export class TexturePaint {
    private _rect: Rectangle2D | null;
    private _g2d: Graphics2D;
    private _bi: ImageBitmap;
    public constructor(bi: ImageBitmap, rect: Rectangle2D | null) {
        this._rect = rect;
        this._bi = bi;
    }
}
