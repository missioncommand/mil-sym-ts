import { POINT2 } from "../JavaLineArray/POINT2"


/**
 * A class for channel points used by clsChannelUtility
 *
 */
export class CChannelPoints2 {
	m_Line1: POINT2;
	m_Line2: POINT2;
	constructor();
	constructor(pts: CChannelPoints2);
	constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {
				this.m_Line1 = new POINT2();
				this.m_Line2 = new POINT2();
				break;
			}

			case 1: {
				const [pts] = args as [CChannelPoints2];
				this.m_Line1 = new POINT2(pts.m_Line1);
				this.m_Line2 = new POINT2(pts.m_Line2);
				break;
			}

			default: {
				throw Error(`Invalid number of arguments`);
			}
		}
	}

}
