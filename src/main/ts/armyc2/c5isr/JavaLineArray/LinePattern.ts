import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Color } from "../renderer/utilities/Color"
import { MilStdAttributes } from "../renderer/utilities/MilStdAttributes"
import { RectUtilities } from "../renderer/utilities/RectUtilities"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { RendererUtilities } from "../renderer/utilities/RendererUtilities"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../renderer/utilities/SymbolUtilities"


export class LinePattern{

    private svg: string | null = null;
    private vOffset: number = 0;

    constructor(svgPattern: string | null, verticalOffset: number) {
        this.svg = svgPattern;
        this.vOffset = verticalOffset;}


    public getLinePatternSVG(): string | null {
    return this.svg;
    }

    public getLinePatternVerticalOffset(): number {
    return this.vOffset;
    }

    public static supportsLinePattern(symbolCode: string): boolean {
        const ec = SymbolID.getEntityCode(symbolCode);
        if (SymbolID.getSymbolSet(symbolCode) === SymbolID.SymbolSet_ControlMeasure) {
          switch (ec) {
            // FLOT
            case 140100:
            // Line of Contact
            case 140200:
            // Strong Point
            case 151203:
            // Encirclement
            case 151800:
            // Obstacle Belt || Obstacle Zone || Obstacle Line
            case 270100:
            case 270200:
            case 290100:
            // Obstacle Free Zone OR Obstacle Restricted Zone OR Antitank Wall
            case 270300:
            case 270400:
            case 290204:
            // Ditch - Under Construction || Ditch - Completed
            case 290201:
            case 290202:
            // Ditch Reinforced, with Antitank Mines
            case 290203:
            // Unspecified (Obstacle)
            case 290301:
            // Single Fence
            case 290302:
            // Double Fence
            case 290303:
            // Double Apron Fence
            case 290304:
            // Low Wire Fence
            case 290305:
            // High Wire Fence
            case 290306:
            // Single Concertina
            case 290307:
            // Double Strand Concertina
            case 290308:
            // Triple Strand Concertina
            case 290309:
            // Fortified Line OR Fortified Area
            case 290900:
            case 151000:
              return true;
            default:
              return false;
          }
        } else {
          return false;
        }
      }


      public static getLinePattern(
        symbolCode: string,
        lineColor: Color,
        fillColor: Color | null,
        lineWidth: number
      ): LinePattern | null {
        let lp: LinePattern | null = null;
        let svgPath: string | null = null;
        let svgEllipse: string | null = null;
        let svgText: string | null = null; // reserved, matches Java code
        let svgBounds: Rectangle2D | null = null;
        let vOffset = 0;
        let grouped = false;
        let key: string | null = null;
    
        if (symbolCode != null && symbolCode.length >= 20) {
          const symbolSet = SymbolID.getSymbolSet(symbolCode);
          const ec = SymbolID.getEntityCode(symbolCode);
          const dpi = RendererSettings.getInstance().getDeviceDPI();
    
          const offset = lineWidth / 2.0;
          const multiplier = dpi > 96 ? dpi / 96.0 : 1.0;
    
        
          // Each branch mirrors the Java logic, but using TypeScript string concatenation.
    
          if (ec === 140100) {
            // FLOT
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = 0;
            const eRadH = (10 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternHeight = eRadH + lineWidth;
            const patternWidth = lwOffset + (eRadW * 2) + lineWidth + lwOffset;
    
            // build line pattern
            let path = "<path d=\"";
    
            // build 'uuuu'
            y += eRadH + lineWidth;
            path += "M " + lwOffset + " " + y + " ";
            path +=
              "a " +
              (eRadW + lwOffset) +
              "," +
              (eRadW + lwOffset) +
              " 0 0,1 " +
              ((eRadW * 2) + lineWidth) +
              ",0\" ";
    
            // calculate bounds of line pattern
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y;
    
            vOffset = lwOffset + eRadH;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          }
    
          if (ec === 140200) {
            // Line of Contact
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = 0;
            const eRadH = (10 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternHeight = (eRadH + lineWidth) * 2;
            const patternWidth = lwOffset + (eRadW * 2) + lineWidth + lwOffset;
    
            let path = "<path d=\"";
    
            // red squiggle
            y += patternHeight;
            path += "M " + lwOffset + " " + y + " ";
            path +=
              "a " +
              (eRadW + lwOffset) +
              "," +
              (eRadW + lwOffset) +
              " 0 0,1 " +
              ((eRadW * 2) + lineWidth) +
              ",0\" ";
            path += "style=\"fill:none;stroke:red;";
            if (lineColor.getAlpha() < 255) {
              path += "stroke-opacity:" + lineColor.getAlpha() / 255.0 + ";";
            }
            path += "stroke-width:" + lineWidth + "\" />";
            // affiliation color squiggle
            path += "<path d=\"";
            path += "M " + lwOffset + " " + 0 + " ";
            path +=
              "a " +
              (eRadW + lwOffset) +
              "," +
              (eRadW + lwOffset) +
              " 0 0,0 " +
              ((eRadW * 2) + lineWidth) +
              ",0\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y;
    
            vOffset = patternHeight;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 151203) {
            // Strong Point
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = 0;
            const eRadH = (10 + lineWidth) * multiplier;
            const eRadW = eRadH * 0.5;
            const patternHeight = eRadH + lineWidth;
            const patternWidth = (eRadW * 2) + lineWidth;
    
            let path = "<path d=\"";
    
            // build '_|_' repeating
            y += eRadH + lwOffset;
            path += "M " + 0 + " " + y + " ";
            path += "l " + patternWidth / 2 + " 0 ";
            path += "l 0 " + (-eRadH - lineWidth) + " ";
            path += "m 0 " + (eRadH + lineWidth) + " ";
            path += "l " + patternWidth / 2 + " 0\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = lwOffset + eRadH;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 151800) {
            // Encirclement
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (10 + (lineWidth * 2)) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = (eRadW * 3) + lineWidth;
    
            let path = "<path d=\"";
    
            // build '/\'
            y += lineWidth + eRadH + lwOffset;
            path += "M " + 0 + " " + y + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0 ";
            path += "l " + eRadW + " " + (-eRadH - lineWidth) + " ";
            path += "l " + eRadW + " " + (eRadH + lineWidth) + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0 Z\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = y;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 270100 || ec === 270200 || ec === 290100) {
            // Obstacle Belt || Obstacle Zone || Obstacle Line
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (10 + (lineWidth * 2)) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = (eRadW * 3) + lineWidth;
    
            let path = "<path d=\"";
    
            y += lwOffset + eRadH + lwOffset;
            path += "M " + 0 + " " + y + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0 ";
            path += "l " + eRadW + " " + (-eRadH) + " ";
            path += "l " + eRadW + " " + eRadH + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = y;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 270300 || ec === 270400 || ec === 290204) {
            // Obstacle Free Zone || Obstacle Restricted Zone || Antitank Wall
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (10 + (lineWidth * 2)) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = (eRadW * 3) + lineWidth;
    
            let path = "<path d=\"";
    
            y += lwOffset + eRadH + lwOffset;
            path += "M " + 0 + " " + lwOffset + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0 ";
            path += "l " + eRadW + " " + eRadH + " ";
            path += "l " + eRadW + " " + (-eRadH) + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290201 || ec === 290202) {
            // Ditch - Under Construction || Ditch - Completed
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (10 + (lineWidth * 2)) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = (eRadW * 2) + lineWidth;
    
            let path = "<path d=\"";
    
            y += lwOffset + eRadH + lwOffset;
            path += "M " + lwOffset + " " + y + " ";
            path += "l " + eRadW + " " + (-eRadH) + " ";
            path += "l " + eRadW + " " + eRadH + " Z\" ";
    
            if (ec === 290202) {
              fillColor = SymbolUtilities.getLineColorOfAffiliation(symbolCode);
            }
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = y;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290203) {
            // Ditch Reinforced, with Antitank Mines
            fillColor = SymbolUtilities.getLineColorOfAffiliation(symbolCode);
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (10 + (lineWidth * 2)) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = (eRadW * 3) + lineWidth * 2 + (eRadW * 0.6);
    
            let path = "<path d=\"";
            let ellipse = "<circle ";
    
            y += lwOffset + eRadH + lwOffset;
            path += "M " + lwOffset + " " + lwOffset + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0 ";
            path += "l " + eRadW + " " + eRadH + " ";
            path += "l " + eRadW + " " + (-eRadH) + " Z ";
            path += "M " + 0 + " " + lwOffset + " ";
            path += "l " + patternWidth + " 0\" ";
    
            ellipse +=
              "r=\"" +
              ((eRadW * 0.6) - lwOffset) +
              "\" cx=\"" +
              (lineWidth + (eRadW * 3) + lineWidth) +
              "\" cy=\"" +
              ((y + lwOffset) * 0.6) +
              "\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
            svgEllipse = ellipse;
          } else if (ec === 290301) {
            // Unspecified (Obstacle)
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (6 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadH + lineWidth) * 2.5;
    
            let path = "<path d=\"";
    
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lwOffset + eRadH;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " \" ";
    
            y += eRadH * 2 + lwOffset;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = eRadH * 2 + lineWidth;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290302) {
            // Single Fence
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (6 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadH + lineWidth) * 3.5;
    
            let path = "<path d=\"";
    
            let eCenterX = lwOffset + patternWidth / 2;
            let eCenterY = lwOffset + eRadH;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " ";
    
            y += lineWidth + eRadH * 2 + lineWidth;
            path += "M " + x + " " + eCenterY + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            y += eRadH * 2 + lwOffset;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = eRadH * 2 + lineWidth;
    
            vOffset = eCenterY;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290303) {
            // Double Fence
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (6 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadH + lineWidth) * 5.5;
    
            let path = "<path d=\"";
    
            let eCenterX = patternWidth / 2 - eRadW - lwOffset;
            let eCenterY = lwOffset + eRadH;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " ";
    
            eCenterX = patternWidth / 2 + eRadW + lwOffset;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " ";
    
            y += lineWidth + eRadH * 2 + lineWidth;
            path += "M " + x + " " + eCenterY + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            y += eRadH * 2 + lwOffset;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = eRadH * 2 + lineWidth;
    
            vOffset = eCenterY;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290304) {
            // Double Apron Fence
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (6 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadH + lineWidth) * 2.5;
    
            let path = "<path d=\"";
    
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lwOffset + eRadH;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " ";
    
            y += lineWidth + eRadH * 2 + lineWidth;
            path += "M " + x + " " + eCenterY + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            y += eRadH * 2 + lwOffset;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = eRadH * 2 + lineWidth;
    
            vOffset = eCenterY;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290305) {
            // Low Wire Fence
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (6 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadH + lineWidth) * 2.5;
    
            let path = "<path d=\"";
    
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lwOffset + eRadH;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " ";
    
            path += "M " + x + " " + lwOffset + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            y += eRadH * 2 + lwOffset;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = eRadH * 2 + lineWidth;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290306) {
            // High Wire Fence
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (6 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadH + lineWidth) * 2.5;
    
            let path = "<path d=\"";
    
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lwOffset + eRadH;
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY - eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + (eRadH * 2) + " ";
            path +=
              "M " +
              (eCenterX - eRadW) +
              " " +
              (eCenterY + eRadH) +
              " ";
            path += "l " + (eRadW * 2) + " " + -(eRadH * 2) + " ";
    
            path += "M " + x + " " + lwOffset + " ";
            path += "l " + (patternWidth + lineWidth) + " 0";
    
            y += eRadH * 2 + lwOffset;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = eRadH * 2 + lineWidth;
    
            path += "M " + x + " " + (bottom - lwOffset) + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          } else if (ec === 290307) {
            // Single Concertina
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (5 + lineWidth) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = eRadH * 2.5;
    
            let ellipse = "<ellipse ";
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lineWidth + lwOffset + eRadH;
            ellipse += "cx=\"" + eCenterX + "\" cy=\"" + eCenterY + "\" ";
            ellipse += "rx=\"" + eRadW + "\" ry=\"" + eRadH + "\" ";
    
            let path = "<path d=\"";
    
            path += "M " + x + " " + lwOffset + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            y += lineWidth + eRadH * 2 + lineWidth;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
            svgEllipse = ellipse;
          } else if (ec === 290308) {
            // Double Strand Concertina
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (5 + lineWidth) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = eRadH * 2.5;
    
            let ellipse = "<ellipse ";
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lineWidth + lwOffset + eRadH;
            ellipse += "cx=\"" + eCenterX + "\" cy=\"" + eCenterY + "\" ";
            ellipse += "rx=\"" + eRadW + "\" ry=\"" + eRadH + "\" ";
    
            let path = "<path d=\"";
    
            path += "M " + x + " " + eCenterY + " ";
            path += "l " + (patternWidth + lineWidth) + " 0 ";
    
            path += "M " + x + " " + lwOffset + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            y += lineWidth + eRadH * 2 + lineWidth;
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
            svgEllipse = ellipse;
          } else if (ec === 290309) {
            // Triple Strand Concertina
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = lwOffset;
            const eRadH = (5 + lineWidth) * multiplier;
            const eRadW = eRadH * 0.6;
            const patternWidth = eRadH * 2.5;
    
            let ellipse = "<ellipse ";
            const eCenterX = lwOffset + patternWidth / 2;
            const eCenterY = lineWidth + lwOffset + eRadH;
            ellipse += "cx=\"" + eCenterX + "\" cy=\"" + eCenterY + "\" ";
            ellipse += "rx=\"" + eRadW + "\" ry=\"" + eRadH + "\" ";
    
            let path = "<path d=\"";
    
            path += "M " + x + " " + y + " ";
            path += "l " + (patternWidth + lineWidth) + " 0 ";
    
            y += lineWidth + eRadH * 2 + lineWidth;
            path += "M " + x + " " + y + " ";
            path += "l " + (patternWidth + lineWidth) + " 0\" ";
    
            const left = 0;
            const width = patternWidth + lineWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = lwOffset;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
            svgEllipse = ellipse;
          } else if (ec === 290900 || ec === 151000) {
            // Fortified Line OR Fortified Area
            fillColor = null;
            const lwOffset = lineWidth / 2.0;
            let x = 0;
            let y = 0;
            const eRadH = (10 + lineWidth) * multiplier;
            const eRadW = eRadH;
            const patternWidth = (eRadW * 2) + (lineWidth * 2);
    
            let path = "<path d=\"";
    
            y += lwOffset + eRadH + lwOffset;
            path += "M " + 0 + " " + y + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0 ";
            path += "l 0 " + (-eRadH - lwOffset) + " ";
            path += "l " + (eRadW + lineWidth) + " 0 ";
            path += "l 0 " + (eRadH + lwOffset) + " ";
            path += "l " + ((eRadW / 2) + lwOffset) + " 0\" ";
    
            const left = 0;
            const width = patternWidth;
            const top = 0;
            const bottom = y + lwOffset;
    
            vOffset = y;
            svgBounds = new Rectangle2D(left, top, width, bottom - top);
            svgPath = path;
          }
    
          if (svgPath != null && svgBounds != null) {
            // build style string
            let sbStyle = "style=\"";
            if (fillColor != null) {
              sbStyle += "fill:" + RendererUtilities.colorToHexString(fillColor, false) + ";";
              if (fillColor.getAlpha() < 255) {
                sbStyle += "fill-opacity:" + fillColor.getAlpha() / 255.0 + ";";
              }
            } else {
              sbStyle += "fill:none;";
            }
            sbStyle += "stroke:" + RendererUtilities.colorToHexString(lineColor, false) + ";";
            if (lineColor.getAlpha() < 255) {
              sbStyle += "stroke-opacity:" + lineColor.getAlpha() / 255.0 + ";";
            }
            sbStyle += "stroke-width:" + lineWidth + "\"";
    
            // add style to SVGPath
            svgPath += sbStyle;
            svgPath += " />";
    
            // add style to ellipse
            if (svgEllipse != null) {
              svgEllipse += sbStyle;
              svgEllipse += " />";
            }
    
            // build svg tag
            let sbSVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" ";
            sbSVG += "width=\"" + svgBounds.getWidth() + "\" height=\"" + svgBounds.getHeight() + "\" ";
            sbSVG +=
              "viewBox=\"" +
              svgBounds.getX() +
              " " +
              svgBounds.getY() +
              " " +
              svgBounds.getWidth() +
              " " +
              svgBounds.getHeight() +
              "\" ";
            sbSVG += "fill=\"none\">";
    
            sbSVG += svgPath;
            if (svgEllipse != null) {
              sbSVG += svgEllipse;
            }
            if (grouped) {
              sbSVG += "</g>";
            }
            sbSVG += "</svg>";
    
            
            lp = new LinePattern(sbSVG, vOffset);
            
          }
        }
    
        return lp;
      }
    

}