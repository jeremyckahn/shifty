import { Tweenable } from './tweenable';
declare module './tweenable' {
    interface Tweenable {
        /**
         * @ignore
         */
        _tokenData?: FormatSignature;
    }
}
interface FormatSignature {
    [propertyName: string]: {
        formatString: string;
        chunkNames: string[];
    };
}
export declare const doesApply: (tweenable: Tweenable) => boolean;
export declare function tweenCreated(tweenable: Tweenable): void;
export declare function beforeTween(tweenable: Tweenable): void;
export declare function afterTween(tweenable: Tweenable): void;
export {};
