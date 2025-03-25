/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { type double } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"

import { BasicStroke } from "../graphics2d/BasicStroke"

import { Font } from "../graphics2d/Font"
import { FontMetrics } from "../graphics2d/FontMetrics"
import { FontRenderContext } from "../graphics2d/FontRenderContext"

import { Color } from "../renderer/utilities/Color"



/**
 *
 *
 */
export class Graphics2D {
    private _font: Font;
    private _fontMetrics: FontMetrics;
    private _fontRenderContext: FontRenderContext;
    public constructor() {

        this._font = new Font("arial", 10, 10);
        this._fontMetrics = new FontMetrics(this._font);
    }
    public setFont(value: Font): void {
        this._font = value;
        this._fontMetrics = new FontMetrics(this._font);
    }
    public getFont(): Font {
        return this._font;
    }
    public setFontMetrics(value: FontMetrics): void {
        this._fontMetrics = value;
    }
    public getFontMetrics(): FontMetrics {
        return this._fontMetrics;
    }
    public setColor(color: Color): void {
        //return;
    }
    public setBackground(color: Color): void {
        //return;
    }
    public setTransform(id: AffineTransform): void {
        //return;
    }
    public getTransform(): null {
        return null;
    }
    public setStroke(stroke: BasicStroke): void {
        //return;
    }
    public drawLine(x1: double, y1: double, x2: double, y2: double): void {
        //return;
    }
    public dispose(): void {
        //return;
    }
    public rotate(theta: double, x: double, y: double): void {
        //return;
    }
    public clearRect(x: double, y: double, width: double, height: double): void {
        //return;
    }
    public drawString(s: string, x: double, y: double): void {
        //return;
    }
    public getFontRenderContext(): FontRenderContext {
        return this._fontRenderContext;
    }
}
