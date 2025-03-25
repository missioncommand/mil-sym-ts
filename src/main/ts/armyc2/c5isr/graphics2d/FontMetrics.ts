/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { type int } from "../graphics2d/BasicTypes";

import { Font } from "../graphics2d/Font"
import { FontRenderContext } from "../graphics2d/FontRenderContext"


/**
 *
 *
 */
export class FontMetrics  {
    protected _fontRenderContext: FontRenderContext;
    protected _font: Font;
    public constructor(font: Font) {
        //_fontRenderContext=new FontRenderContext();
        this._font = font;
    }
    public stringWidth(str: string): int {
        return this._font.getSize() / 2 * str.length;
    }
    public getFontRenderContext(): FontRenderContext {
        return this._fontRenderContext;
    }
}
