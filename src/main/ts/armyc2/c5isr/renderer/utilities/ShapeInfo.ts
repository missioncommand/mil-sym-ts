import { type int, type double } from "../../graphics2d/BasicTypes";

import { AffineTransform } from "../../graphics2d/AffineTransform"
import { BasicStroke } from "../../graphics2d/BasicStroke"
import { GeneralPath } from "../../graphics2d/GeneralPath"
import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle } from "../../graphics2d/Rectangle"
import { Shape } from "../../graphics2d/Shape"
import { TextLayout } from "../../graphics2d/TextLayout"
import { TexturePaint } from "../../graphics2d/TexturePaint"
import { Color } from "../../renderer/utilities/Color"
import { MilStdSymbol } from "../../renderer/utilities/MilStdSymbol"
import { SVGSymbolInfo } from "./SVGSymbolInfo";



/**
 * Holds information on how to draw the pieces of a multipoint symbol.
 * Can be retrieved from {@link MilStdSymbol#getSymbolShapes()} and
 * {@link MilStdSymbol#getModifierShapes()} after {@link armyc2.c5isr.web.render.WebRenderer#RenderMultiPointAsMilStdSymbol(String, String, String, String, String, String, double, String, Map, Map)} is called.
 */
export class ShapeInfo {


    public static SHAPE_TYPE_POLYLINE: int = 0;
    //public static int SHAPE_TYPE_POLYGON=1;
    public static SHAPE_TYPE_FILL: int = 1;
    public static SHAPE_TYPE_MODIFIER: int = 2;
    public static SHAPE_TYPE_MODIFIER_FILL: int = 3;
    public static SHAPE_TYPE_UNIT_FRAME: int = 4;
    public static SHAPE_TYPE_UNIT_FILL: int = 5;
    public static SHAPE_TYPE_UNIT_SYMBOL1: int = 6;
    public static SHAPE_TYPE_UNIT_SYMBOL2: int = 7;
    public static SHAPE_TYPE_UNIT_DISPLAY_MODIFIER: int = 8;
    public static SHAPE_TYPE_UNIT_ECHELON: int = 9;
    public static SHAPE_TYPE_UNIT_AFFILIATION_MODIFIER: int = 10;
    public static SHAPE_TYPE_UNIT_HQ_STAFF: int = 11;
    public static SHAPE_TYPE_TG_SP_FILL: int = 12;
    public static SHAPE_TYPE_TG_SP_FRAME: int = 13;
    public static SHAPE_TYPE_TG_Q_MODIFIER: int = 14;
    public static SHAPE_TYPE_TG_SP_OUTLINE: int = 15;
    public static SHAPE_TYPE_SINGLE_POINT_OUTLINE: int = 16;
    public static SHAPE_TYPE_UNIT_OUTLINE: int = 17;
    public static SHAPE_TYPE_UNIT_OPERATIONAL_CONDITION: int = 18;

    public static justify_left: int = 0;
    public static justify_center: int = 1;
    public static justify_right: int = 2;


    protected _Shape: Shape = null;
    private stroke: BasicStroke = null;
    private gp: GeneralPath = null;
    private fillStyle: int = 0;
    /**
     * @deprecated
     */
    private texturePaint: TexturePaint | null = null;
    private _ShapeType: int = -1;
    private lineColor: Color | null = null;
    private fillColor: Color | null = null;
    private textBackgoundColor: Color = null;
    // private affineTransform: AffineTransform;

    //private _GlyphVector: GlyphVector;
    private _TextLayout: TextLayout = null;
    private _Position: Point2D = null;
    private _ModifierString: string = null;
    private _ModifierPosition: Point2D = null;

    private _ModifierImageInfo: SVGSymbolInfo = null;
    private _ModifierAngle: double = 0;
    private _Tag: any = null;
    /**
     * @deprecated
     */
    private _shader: ImageBitmap = null;
    private _patternFillInfo: SVGSymbolInfo = null;
    private _justify: int = ShapeInfo.justify_left;
    //for google earth
    private _Polylines: Array<Array<Point2D>> = null;

    //enum DrawMethod{Draw,Fill;}

    //private Polygon poly=new Polygon();
    constructor();

    constructor(shape: Shape);

    //constructor(glyphVector: GlyphVector, position: Point2D);

    constructor(textLayout: TextLayout, position: Point2D);

    /**
     *
     * @param shape
     * @param shapeType
     * ShapeInfo.SHAPE_TYPE_
     */
    constructor(shape: Shape, shapeType: int);
    constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {
                break;
            }

            case 1: {
                const [shape] = args as [Shape];
                this._Shape = shape;
                break;
            }

            //  case 2: {
            //    const [glyphVector, position] = args as [GlyphVector, Point2D];
            //    this._GlyphVector = glyphVector;
            //     this._Position = position;
            //     break;
            //  }

            case 2: {
                if (args[0] instanceof TextLayout) {
                    const [textLayout, position] = args as [TextLayout, Point2D];
                    this._TextLayout = textLayout;
                    this._Position = position;
                } else {
                    const [shape, shapeType] = args as [Shape, int];
                    this._Shape = shape;
                    this._ShapeType = shapeType;
                }
                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public getShape(): Shape {
        return this._Shape;
    }

    public setShape(value: Shape): void {
        this._Shape = value;
        // this._GlyphVector = null;
        this._TextLayout = null;
    }

    // public getGlyphVector(): GlyphVector {
    //     return this._GlyphVector;
    // }

    //public setGlyphVector(value: GlyphVector, position: Point2D): void {
    //   this._GlyphVector = value;
    //    this._Position = position;
    //    this._Shape = null;
    //    this._TextLayout = null;
    // }

    public getTextLayout(): TextLayout {
        return this._TextLayout;
    }

    public setTextLayout(value: TextLayout): void {
        this._TextLayout = value;
        //  this._GlyphVector = null;
        this._Shape = null;
    }

    //set this when returning text string.
    public setModifierString(value: string): void {
        this._ModifierString = value;
    }

    public getModifierString(): string {
        return this._ModifierString;
    }

    //location to draw ModifierString.
    public setModifierPosition(value: Point2D): void {
        this._ModifierPosition = value;
    }

    public getModifierPosition(): Point2D {
        return this._ModifierPosition;
    }

    //angle to draw ModifierString.
    public setModifierAngle(value: double): void {
        this._ModifierAngle = value;
    }

    public getModifierAngle(): double {
        return this._ModifierAngle;
    }
    
    /**
     * 
     * @deprecated use {@link setModifierPosition()} 
     */
    public setModifierStringPosition(value: Point2D): void {
        this.setModifierPosition(value);
    }

    /**
     * 
     * @deprecated use {@link getModifierPosition()} 
     */
    public getModifierStringPosition(): Point2D {
        return this.getModifierPosition();
    }

    /**
     * 
     * @deprecated use {@link setModifierAngle()} 
     */
    public setModifierStringAngle(value: double): void {
        this.setModifierAngle(value);
    }

    /**
     * 
     * @deprecated use {@link getModifierAngle()} 
     */
    public getModifierStringAngle(): double {
        return this.getModifierAngle();
    }

    public setModifierImage(value: SVGSymbolInfo): void {
        this._ModifierImageInfo = value;
    }

    public getModifierImage(): string {
        if (this._ModifierImageInfo)
            return this._ModifierImageInfo.getSVGDataURI();
        else
            return null;
    }

    public getModifierImageInfo(): SVGSymbolInfo {
        return this._ModifierImageInfo;
    }

    /**
     * Object that can be used to store anything.
     * Will not be looked at when rendering.
     * Null by default
     * @param value
     */
    public setTag(value: any): void {
        this._Tag = value;
    }

    /**
     * Object that can be used to store anything.
     * Will not be looked at when rendering.
     * Null by default
     * @return
     */
    public getTag(): any {
        return this._Tag;
    }


    /*
     * OLD
     * @return
     *//*
public Rectangle getBounds()
{
   Rectangle temp = null;

   if(_Shape != null)
       return _Shape.getBounds();
   else if(_GlyphVector != null)
       return _GlyphVector.getPixelBounds(null, (float)_Position.getX(), (float)_Position.getY());
   else if(_TextLayout != null && _Position != null)
   {
       temp = _TextLayout.getPixelBounds(null, (float)_Position.getX(), (float)_Position.getY());
       return temp;
   }
   else if(_TextLayout != null)//for deutch multipoint labels
   {
       //in this case, user set position using affine tranformation.
       temp = new Rectangle();
       temp.setRect(_TextLayout.getBounds());
       return temp;
   }
   else
       return null;
}//*/

    /**
     * Gets bounds for the shapes.  Incorporates AffineTransform if not null
     * in the ShapeInfo object.
     * @return
     */
    public getBounds(): Rectangle | null {
        let temp: Rectangle;

        if (this._Shape != null) {
            temp = this._Shape.getBounds();
            if (this._Shape instanceof GeneralPath) {
                if (this._ShapeType === ShapeInfo.SHAPE_TYPE_UNIT_OUTLINE) {
                    if (this.lineColor != null && this.stroke != null) {
                        if (this.stroke != null && this.stroke.getLineWidth() > 2) {

                            temp.grow(this.stroke.getLineWidth() as int / 2, this.stroke.getLineWidth() as int / 2);
                        }

                    }
                }
                else {
                    //mobility and other drawn symbol decorations.
                    if (this.lineColor != null && this.stroke != null) {
                        if (this.stroke != null && this.stroke.getLineWidth() > 2) {

                            temp.grow(this.stroke.getLineWidth() as int - 1, this.stroke.getLineWidth() as int - 1);
                        }

                    }
                }
            }
        }
        else {
            //   if (this._GlyphVector != null) {
            //       temp = this._GlyphVector.getPixelBounds(null, this._Position.getX() as double, this._Position.getY() as double);
            //   }
            //else {
            if (this._TextLayout != null && this._Position != null) {
                temp = this._TextLayout.getPixelBounds(null, this._Position.getX() as double, this._Position.getY() as double);

            }
            else {
                if (this._TextLayout != null)//for deutch multipoint labels
                {
                    temp = new Rectangle();
                    temp.setRect(this._TextLayout.getBounds());
                    //return temp;
                }
                else {

                    return null;
                }

            }

            //  }

        }



        // if (this.affineTransform != null) {
        //   //position set by affinetransform
        //    let sTemp: Shape = temp;
        //    sTemp = this.affineTransform.createTransformedShape(temp);
        //    temp = sTemp.getBounds();
        // }

        return temp;
    }


    /**
     * needed to draw Glyphs and TextLayouts
     * @param position
     */
    public setGlyphPosition(position: Point | Point2D): void {
        if (position instanceof Point)
            this._Position = new Point2D(position.x, position.y);
        else
            this._Position = position;
    }


    /**
     * needed to draw Glyphs and TextLayouts
     * @return
     */
    public getGlyphPosition(): Point2D {
        return this._Position;
    }

    public setLineColor(value: Color | null): void {
        this.lineColor = value;
    }
    public getLineColor(): Color {
        return this.lineColor;
    }

    //    /**
    //     *
    //     * @param value
    //     * @deprecated Use setStroke
    //     */
    //    public void setLineWidth(int value)
    //    {
    //        lineWidth=value;
    //    }
    //    /**
    //     * @deprecated Use getStroke
    //     * @return
    //     */
    //    public int getLineWidth()
    //    {
    //        return lineWidth;
    //    }

    public setFillColor(value: Color | null): void {
        this.fillColor = value;
    }
    public getFillColor(): Color | null {
        return this.fillColor;
    }

    public setTextBackgroundColor(value: Color): void {
        this.textBackgoundColor = value;
    }
    public getTextBackgroundColor(): Color {
        return this.textBackgoundColor;
    }

    //  public setAffineTransform(value: AffineTransform): void {
    //      this.affineTransform = value;
    //  }
    //  public getAffineTransform(): AffineTransform {
    //      return this.affineTransform;
    //  }


    public getStroke(): BasicStroke {
        return this.stroke;
    }

    /**
     * @deprecated
     */
    public getTexturePaint(): TexturePaint | null {
        return this.texturePaint;
    }

    /**
     * @deprecated
     */
    public setTexturePaint(value: TexturePaint | null): void {
        this.texturePaint = value;
    }

    public getFillStyle(): int {
        return this.fillStyle;
    }
    public setFillStyle(value: int): void {
        this.fillStyle = value;
    }

    public setStroke(s: BasicStroke): void {
        this.stroke = s;
    }

    /**
     * For Internal Renderer use
     * @param value
     * ShapeInfo.SHAPE_TYPE_
     *
     */
    public setShapeType(value: int): void {
        this._ShapeType = value;
    }
    /**
     * For Internal Renderer use
     * @return ShapeInfo.SHAPE_TYPE_
     *
     */
    public getShapeType(): int {
        return this._ShapeType;
    }

    public getPolylines(): Array<Array<Point2D>> {
        return this._Polylines;
    }

    public setPolylines(value: Array<Array<Point2D>>): void {
        this._Polylines = value;
    }

    /**
     * @deprecated
     */
    public setShader(value: ImageBitmap): void {
        this._shader = value;
    }

    /**
     * @deprecated
     */
    public getShader(): ImageBitmap {
        return this._shader;
    }

    public setPatternFillImage(img: SVGSymbolInfo): void {
        this._patternFillInfo = img;
    }

    public getPatternFillImage(): string {
        if (this._patternFillInfo)
            return this._patternFillInfo.getSVGDataURI();
        else
            return null;
    }

    public getPatternFillImageInfo(): SVGSymbolInfo {
        return this._patternFillInfo;
    }

    public getTextJustify(): int {
        return this._justify;
    }

    public setTextJustify(value: int): void {
        this._justify = value;
    }
}
