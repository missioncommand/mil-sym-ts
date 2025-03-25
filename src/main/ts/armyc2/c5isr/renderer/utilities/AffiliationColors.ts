/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { Color } from "../../renderer/utilities/Color"

/**
 * Default Affiliation Colors for the symbols
 *
 */
export abstract class AffiliationColors {

	//public static colorexists: boolean = (typeof Color === 'function');
	/// <summary>
	/// Friendly Unit Fill Color.
	/// </summary>
	public static FriendlyUnitFillColor: Color = new Color(128, 224, 255);
	/// <summary>
	/// Hostile Unit Fill Color.
	/// </summary>
	public static HostileUnitFillColor: Color = new Color(255, 128, 128);//new Color(255,130,132);//Color.RED;
	/// <summary>
	/// Neutral Unit Fill Color.
	/// </summary>
	public static NeutralUnitFillColor: Color = new Color(170, 255, 170);//new Color(144,238,144);//Color.GREEN;//new Color(0,255,0);//new Color(144,238,144);//light green//Color.GREEN;new Color(0,226,0);
	/// <summary>
	/// Unknown Unit Fill Color.
	/// </summary>
	public static UnknownUnitFillColor: Color = new Color(255, 255, 128);// new Color(255,255,128);//Color.YELLOW;

	public static SuspectUnitFillColor: Color = new Color(255, 229, 153);

	/// <summary>
	/// Friendly Graphic Fill Color.
	/// </summary>
	public static FriendlyGraphicFillColor: Color = new Color(128, 224, 255);//Crystal Blue //Color.CYAN;
	/// <summary>
	/// Hostile Graphic Fill Color.
	/// </summary>
	public static HostileGraphicFillColor: Color = new Color(255, 128, 128);//salmon
	/// <summary>
	/// Neutral Graphic Fill Color.
	/// </summary>
	public static NeutralGraphicFillColor: Color = new Color(170, 255, 170);//Bamboo Green //new Color(144,238,144);//light green
	/// <summary>
	/// Unknown Graphic Fill Color.
	/// </summary>
	public static UnknownGraphicFillColor: Color = new Color(255, 255, 128);//light yellow  new Color(255,255,224);//light yellow

	public static SuspectGraphicFillColor: Color = new Color(255, 229, 153);

	/// <summary>
	/// Friendly Unit Line Color.
	/// </summary>
	public static FriendlyUnitLineColor: Color = Color.BLACK;
	/// <summary>
	/// Hostile Unit Line Color.
	/// </summary>
	public static HostileUnitLineColor: Color = Color.BLACK;
	/// <summary>
	/// Neutral Unit Line Color.
	/// </summary>
	public static NeutralUnitLineColor: Color = Color.BLACK;
	/// <summary>
	/// Unknown Unit Line Color.
	/// </summary>
	public static UnknownUnitLineColor: Color = Color.BLACK;

	public static SuspectUnitLineColor: Color = Color.BLACK;

	/// <summary>
	/// Friendly Graphic Line Color.
	/// </summary>
	public static FriendlyGraphicLineColor: Color = Color.BLACK;
	/// <summary>
	/// Hostile Graphic Line Color.
	/// </summary>
	public static HostileGraphicLineColor: Color = Color.RED;
	/// <summary>
	/// Neutral Graphic Line Color.
	/// </summary>
	public static NeutralGraphicLineColor: Color = Color.GREEN;
	/// <summary>
	/// Unknown Graphic Line Color.
	/// </summary>
	public static UnknownGraphicLineColor: Color = Color.YELLOW;

	public static SuspectGraphicLineColor: Color = new Color(255, 188, 1);

	public static WeatherRed: Color = new Color(198, 16, 33);//0xC61021;// 198,16,33
	public static WeatherBlue: Color = new Color(0, 0, 255);//0x0000FF;// 0,0,255

	public static WeatherPurpleDark: Color = new Color(128, 0, 128);//0x800080;// 128,0,128 Plum Red
	public static WeatherPurpleLight: Color = new Color(226, 159, 255);//0xE29FFF;// 226,159,255 Light Orchid

	public static WeatherBrownDark: Color = new Color(128, 98, 16);//0x806210;// 128,98,16 Safari
	public static WeatherBrownLight: Color = new Color(210, 176, 106);//0xD2B06A;// 210,176,106 Khaki

}
