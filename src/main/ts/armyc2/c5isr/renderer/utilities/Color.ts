//import { RendererUtilities } from "../../renderer/utilities/RendererUtilities"


/**
 * Integer based Color class with utility functions
 */
export class Color {

	/**
	 * The color white.  In the default sRGB space.
	 */
	public static readonly white: Color = new Color(255, 255, 255);

	/**
	 * The color white.  In the default sRGB space.
	 *
	 */
	public static readonly WHITE: Color = Color.white;

	/**
	 * The color light gray.  In the default sRGB space.
	 */
	public static readonly lightGray: Color = new Color(192, 192, 192);

	/**
	 * The color light gray.  In the default sRGB space.
	 *
	 */
	public static readonly LIGHT_GRAY: Color = Color.lightGray;

	/**
	 * The color gray.  In the default sRGB space.
	 */
	public static readonly gray: Color = new Color(128, 128, 128);

	/**
	 * The color gray.  In the default sRGB space.
	 *
	 */
	public static readonly GRAY: Color = Color.gray;

	/**
	 * The color dark gray.  In the default sRGB space.
	 */
	public static readonly darkGray: Color = new Color(64, 64, 64);

	/**
	 * The color dark gray.  In the default sRGB space.
	 *
	 */
	public static readonly DARK_GRAY: Color = Color.darkGray;

	/**
	 * The color black.  In the default sRGB space.
	 */
	public static readonly black: Color = new Color(0, 0, 0);

	/**
	 * The color black.  In the default sRGB space.
	 *
	 */
	public static readonly BLACK: Color = Color.black;

	/**
	 * The color red.  In the default sRGB space.
	 */
	public static readonly red: Color = new Color(255, 0, 0);

	/**
	 * The color red.  In the default sRGB space.
	 *
	 */
	public static readonly RED: Color = Color.red;

	/**
	 * The color pink.  In the default sRGB space.
	 */
	public static readonly pink: Color = new Color(255, 175, 175);

	/**
	 * The color pink.  In the default sRGB space.
	 *
	 */
	public static readonly PINK: Color = Color.pink;

	/**
	 * The color orange.  In the default sRGB space.
	 */
	public static readonly orange: Color = new Color(255, 128, 0);

	/**
	 * The color orange.  In the default sRGB space.
	 *
	 */
	public static readonly ORANGE: Color = Color.orange;

	/**
	 * The color yellow.  In the default sRGB space.
	 */
	public static readonly yellow: Color = new Color(255, 255, 0);

	/**
	 * The color yellow.  In the default sRGB space.
	 *
	 */
	public static readonly YELLOW: Color = Color.yellow;

	/**
	 * The color green.  In the default sRGB space.
	 */
	public static readonly green: Color = new Color(0, 255, 0);

	/**
	 * The color green.  In the default sRGB space.
	 *
	 */
	public static readonly GREEN: Color = Color.green;

	/**
	 * The color magenta.  In the default sRGB space.
	 */
	public static readonly magenta: Color = new Color(255, 0, 255);

	/**
	 * The color magenta.  In the default sRGB space.
	 *
	 */
	public static readonly MAGENTA: Color = Color.magenta;

	/**
	 * The color cyan.  In the default sRGB space.
	 */
	public static readonly cyan: Color = new Color(0, 255, 255);

	/**
	 * The color cyan.  In the default sRGB space.
	 *
	 */
	public static readonly CYAN: Color = Color.cyan;

	/**
	 * The color blue.  In the default sRGB space.
	 */
	public static readonly blue: Color = new Color(0, 0, 255);

	/**
	 * The color blue.  In the default sRGB space.
	 *
	 */
	public static readonly BLUE: Color = Color.blue;

	private _A: number = 255;
	private _R: number = 0;
	private _G: number = 0;
	private _B: number = 0;

	    /**
     *
     * @param hexValue - String representing hex value (formatted "0xRRGGBB"
     * i.e. "0xFFFFFF") OR formatted "0xAARRGGBB" i.e. "0x00FFFFFF" for a color
     * with an alpha value I will also put up with "RRGGBB" and "AARRGGBB"
     * without the starting "0x" or "#"
     * @return
     */
		private getColorsFromHexString(hexValue: string): Array<number> | null 
		{

			try {
				if (hexValue == null || hexValue.length === 0) {
	
					return null;
				}
	
				let hexOriginal: string = hexValue;
	
				let hexAlphabet: string = "0123456789ABCDEF";
	
				if (hexValue.charAt(0) === '#') {
					hexValue = hexValue.substring(1);
				}
				if (hexValue.substring(0, 2) === "0x" || hexValue.substring(0, 2) === "0X") {
					hexValue = hexValue.substring(2);
				}
	
				hexValue = hexValue.toUpperCase();
	
				let count: number = hexValue.length;
				let value: number[];
				let k: number = 0;
				let int1: number = 0;
				let int2: number = 0;
	
				if (count === 8 || count === 6) {
					value = new Array<number>((count / 2));
					for (let i: number = 0; i < count; i += 2) {
						int1 = hexAlphabet.indexOf(hexValue.charAt(i));
						int2 = hexAlphabet.indexOf(hexValue.charAt(i + 1));
	
						if (int1 === -1 || int2 === -1) {
							throw Error("Bad hex value: " + hexOriginal);
						}
	
						value[k] = (int1 * 16) + int2;
						k++;
					}
	
					return value;
				}
				else
				{
					throw Error("Bad hex value: " + hexValue);
				}
				return null;
			} catch (exc) {
				if (exc instanceof Error) {
					throw Error("Bad hex value: " + hexValue);
				} else {
					throw exc;
				}
			}
			return null;
		}

	public constructor();
	public constructor(color: Color);

	public constructor(color: number);

	public constructor(hexString: string);

	public constructor(R: number, G: number, B: number);

	public constructor(R: number, G: number, B: number, A: number);
	public constructor(...args: unknown[]) {
		switch (args.length)
		{
			case 1: 
			{
				if(typeof args[0] === 'number')
				{
					const [color] = args as [Color];

					if (color != null) {
						this._A = color.getAlpha();
						this._R = color.getRed();
						this._G = color.getGreen();
						this._B = color.getBlue();
					}
					else {
						this._A = 255;
						this._R = 0;
						this._G = 0;
						this._B = 0;
					}
				}
				else if(typeof args[0] === 'string')
				{
					const [hexString] = args as [string];

					let arr:Array<number> | null = this.getColorsFromHexString(hexString);

					if(arr != null && (arr.length === 4 || arr.length === 3) )
					{
						if(arr.length === 4)
						{
							this._A = arr[0];
							this._R = arr[1];
							this._G = arr[2];
							this._B = arr[3];
						}
						else
						{
							this._A = 255;
							this._R = arr[0];
							this._G = arr[1];
							this._B = arr[2];
						}	
						
					}
				}
				else if(args[0] instanceof Color)
				{
					const [color] = args as [number];

					this._A = this.getAlphaFromColor(color);
					this._R = this.getRedFromColor(color);
					this._G = this.getGreenFromColor(color);
					this._B = this.getBlueFromColor(color);
				}
				else
				{
					this._A = 255;
					this._R = 0;
					this._G = 0;
					this._B = 0;
				}

				break;
			}

			case 3: {
				const [R, G, B] = args as [number, number, number];

				this._A = 255;
				this._R = R;
				this._G = G;
				this._B = B;


				break;
			}

			case 4: {
				const [R, G, B, A] = args as [number, number, number, number];

				this._A = A;
				this._R = R;
				this._G = G;
				this._B = B;


				break;
			}

			case 0: {

				this._A = 255;
				this._R = 0;
				this._G = 0;
				this._B = 0;

				break;
			}

			default: {
				throw new Error("Color() - Invalid number of arguments");//java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}//*/
		}
	}

	public static makeColor(r:number,g:number,b:number):Color
	{
		let color:Color = null;
		try
		{
			color = new Color(r,g,b);
		}
		catch(e)
		{
			console.log(e.message);
		}
		return color;
	}

	public toRGB():number
    {
        return (this._R*65536) + (this._G*256) + this._B;
    }

	public toARGB(): number {
		let returnVal: number = 0;
		returnVal = (this._A << 24) + ((this._R & 0xFF) << 16) + ((this._G & 0xFF) << 8) + (this._B & 0xFF);
		return returnVal;
	}

	private convert(integer:number):string
    {
        //Simpler
        //var str = integer.toString(16);
        //return str.length === 1 ? "0" + str : str;

        //Much Faster
        var hexAlphabet = "0123456789ABCDEF";
        return isNaN(integer) ? "00" : hexAlphabet.charAt((integer - integer % 16)/16) + hexAlphabet.charAt(integer % 16);
    }

    /**
     * A hex string in the format of AARRGGBB
     * @param {Boolean} withAlpha Optional, default is true. If set to false,
     * will return a hex string without alpha values.
     */
    public toHexString(withAlpha:boolean = false):string
    {
        if(withAlpha === false)
        {
            return "#" + this.convert(this._R) +
                            this.convert(this._G) +
                            this.convert(this._B);
        }
        else
        {
            return "#" + this.convert(this._A) +
                            this.convert(this._R) +
                            this.convert(this._G) +
                            this.convert(this._B);
        }
    }

	public toString(): string {
		return "Color{A=" + this._A.toString() + ",R=" + this._R.toString() +
			",G=" + this._G.toString() + ",B=" + this._B.toString() + "}";
	}

	public getRed(): number {
		return this._R;
	}

	public getGreen(): number {
		return this._G;
	}

	public getBlue(): number {
		return this._B;
	}

	public getAlpha(): number {
		return this._A;
	}

	/**
	 *
	 * @param alpha 0-255
	 */
	public setAlpha(alpha: number): void {
		this._A = alpha;
	}

	public toInt(): number {
		return this.toARGB();
	}


	/**
	 * get alpha value from uint
	 * */
	private getAlphaFromColor(color: number): number {
		let alpha: number = 255;
		if (color > 16777215) {

			alpha = (color >>> 24);
		}

		return alpha;
	}
	/**
	 * get red value from uint
	 * */
	private getRedFromColor(color: number): number {
		let red: number = 255;
		red = (color >> 16) & 0xFF;
		return red;
	}
	/**
	 * get green value from uint
	 * */
	private getGreenFromColor(color: number): number {
		let green: number = 255;
		green = (color >> 8) & 0xFF;
		return green;
	}
	/**
	 * get blue value from uint
	 * */
	private getBlueFromColor(color: number): number {
		let blue: number = 255;
		if (color > 16777215) {

			blue = color & 0x000000FF;
		}

		else {

			blue = color & 0x0000FF;
		}

		return blue;
	}



}
