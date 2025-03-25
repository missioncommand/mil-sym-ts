import { LineInfo } from "./LineInfo";
import { TextInfo } from "./TextInfo";



/**
 *
 *
 */
export class SymbolInfo {

    private _LineInfo: Array<LineInfo>;
    private _TextInfo: Array<TextInfo>;

    public constructor();
    public constructor(ti: Array<TextInfo>, li: Array<LineInfo>);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {
                break;
            }

            case 2: {
                const [ti, li] = args as [Array<TextInfo>, Array<LineInfo>];

                this._LineInfo = li;
                this._TextInfo = ti;
                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public getTextInfoList(): Array<TextInfo> {
        return this._TextInfo;
    }

    public getLineInfoList(): Array<LineInfo> {
        return this._LineInfo;
    }

}
