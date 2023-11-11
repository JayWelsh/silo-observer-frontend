import numeral from "numeral";
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

export const centerShortenLongString = (string: string, maxLength: number) => {
	if(typeof string === 'string') {
		if(string.length > maxLength) {
			let charCountForRemoval = string.length - maxLength;
			let stringHalfwayPoint = Math.floor(maxLength/2);
			string = string.slice(0, stringHalfwayPoint) + "..." + string.slice(stringHalfwayPoint + charCountForRemoval, string.length);
			return string;
		}else{
			return string;
		}
	}else{
		return '';
	}
}

const getDynamicFormat = (currentFormat = '0,0.00', number: number | string) => {
	let requestedDecimals = 0;
	let preDecimalFormat;
	let postDecimalFormat;
	if(currentFormat.split(".").length > 0) {
			requestedDecimals = currentFormat.split(".")[1].length;
			postDecimalFormat = currentFormat.split(".")[1];
			preDecimalFormat = currentFormat.split(".")[0];
	}
	let currentFormattedNumber = numeral(number).format(currentFormat).toString();
	let currentFormattedDecimals = '';
	if(currentFormattedNumber.split('.') && currentFormattedNumber.split('.')[1]) {
			currentFormattedDecimals = currentFormattedNumber.split('.')[1];
	}
	let currentUnformattedDecimals = '';
	if(number.toString().split(".").length > 0 && number.toString().split(".")[1]) {
			currentUnformattedDecimals = number.toString().split(".")[1];
	}
	let dynamicFormat = currentFormat;
	if((currentFormattedDecimals.replace(/[^1-9]/g,"").length < requestedDecimals) && (currentUnformattedDecimals.replace(/[^1-9]/g,"").length >= requestedDecimals)) {
			let indexOfSignificantFigureAchievement = 0;
			let significantFiguresEncountered = 0;
			let numberString = number.toString();
			let numberStringPostDecimal = "";
			if(numberString.split(".").length > 0) {
					numberStringPostDecimal = numberString.split(".")[1]
			}
			for(let i = 0; i < numberStringPostDecimal.length; i++) {
					// @ts-ignore
					if((numberStringPostDecimal[i] * 1) > 0) {
							significantFiguresEncountered++;
							if(significantFiguresEncountered === requestedDecimals) {
									indexOfSignificantFigureAchievement = i + 1;
							}
					}
			}
			if(indexOfSignificantFigureAchievement > requestedDecimals) {
					let requestedDecimalsToSignificantFiguresDelta = indexOfSignificantFigureAchievement - requestedDecimals;
					dynamicFormat = preDecimalFormat + ".";
					if(postDecimalFormat) {
							dynamicFormat = preDecimalFormat + "." + postDecimalFormat;
					}
					for(let i = 0; i < requestedDecimalsToSignificantFiguresDelta; i++) {
							dynamicFormat = dynamicFormat + "0";
					}
			}
	}
	return dynamicFormat;
}

export const priceFormat = (number: number | string, decimals = 2, currency = "$", prefix = true) => {
	if(!number) {
		return "0.00";
	}
	let decimalString = "";
	for(let i = 0; i < decimals; i++){
			decimalString += "0";
	}
	if (currency.length > 1) {
			prefix = false;
	}
	let format = '0,0.' + decimalString;
	if(Number(number) < 10) {
			format = getDynamicFormat(format, number);
	}
	let result = numeral(number).format(format);
	if(result === 'NaN') {
		result = '0.00';
	}
	if (prefix) {
			return `${currency}${'\u00A0'}`+ result;
	} else {
			return result + `${'\u00A0'}${currency}`
	}
}

export const formatTimeAgo = (timestamp: number): string => {
  const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds
  const timeDifference = currentTime - timestamp;

  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const intervalCount = Math.floor(timeDifference / seconds);

    if (intervalCount >= 1) {
      return intervalCount === 1 ? `${intervalCount} ${unit} ago` : `${intervalCount} ${unit}s ago`;
    }
  }

  return 'Just now';
}

export const formatTokenAmount = (amount: string, decimals: number) => {
	return utils.formatUnits(amount, decimals);
}

export const tokenImageName = (symbol: string) => {
	switch(symbol.toLowerCase()) {
		case "silo":
			return "SILO"
		case "weth":
			return "ETH-light"
	}
	return symbol;
}

// Credit for percToColour: https://gist.github.com/mlocati/7210513
export const percToColor = (perc: number) => {
	if(perc > 100){
		perc = 100;
	}
	let r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	let h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ETHERSCAN_PREFIXES_NETWORK_NAME: { [key: string]: string } = {
	'ethereum': 'etherscan.io',
	'ropsten': 'ropsten.etherscan.io',
	'rinkeby': 'rinkeby.etherscan.io',
	'goerli': 'goerli.etherscan.io',
	'arbitrum': 'arbiscan.io',
	'sepolia': 'sepolia.etherscan.io'
}
  
export function getEtherscanLink(
	chainName: string,
	data: string,
	type: 'transaction' | 'token' | 'address' | 'block'
): string {
	const prefix = `https://${ETHERSCAN_PREFIXES_NETWORK_NAME[chainName]}`

	switch (type) {
		case 'transaction': {
		return `${prefix}/tx/${data}`
		}
		case 'token': {
		return `${prefix}/token/${data}`
		}
		case 'block': {
		return `${prefix}/block/${data}`
		}
		case 'address':
		default: {
		return `${prefix}/address/${data}`
		}
	}
}

export const subtractNumbers = (value1: number | string, value2: number | string) => BigNumber(value1).minus(BigNumber(value2)).toString();

export const addNumbers = (value1: number | string, value2: number | string) => BigNumber(value1).plus(BigNumber(value2)).toString();

export const multiplyNumbers = (value1: number | string, value2: number | string) => BigNumber(value1).multipliedBy(BigNumber(value2)).toString();

export const divideNumbers = (value1: number | string, value2: number | string) => BigNumber(value1).dividedBy(BigNumber(value2)).toString();

export const debounce = (
	func: (arg0: any) => void,
	wait: number,
	immediate: boolean
) => {
	// 'private' variable for instance
	// The returned function will be able to reference this due to closure.
	// Each call to the returned function will share this common timer.
	let timeout: NodeJS.Timeout;

	// Calling debounce returns a new anonymous function
	return function() {
		// reference the context and args for the setTimeout function
		// @ts-ignore
		let context = this;
		let args = arguments;

		// Should the function be called now? If immediate is true
		//   and not already in a timeout then the answer is: Yes
		let callNow = immediate && !timeout;

		// This is the basic debounce behaviour where you can call this 
		//   function several times, but it will only execute once 
		//   [before or after imposing a delay]. 
		//   Each time the returned function is called, the timer starts over.
		clearTimeout(timeout);

		// Set the new timeout
		timeout = setTimeout(function() {

			// Inside the timeout function, clear the timeout variable
			// which will let the next execution run when in 'immediate' mode
			// @ts-ignore
			timeout = undefined;

			// Check if the function already ran with the immediate flag
			if (!immediate) {
				// Call the original function with apply
				// apply lets you define the 'this' object as well as the arguments 
				//    (both captured before setTimeout)
				// @ts-ignore
				func.apply(context, args);
			}
		}, wait);

		// Immediate mode and no wait timer? Execute the function..
		// @ts-ignore
		if (callNow) func.apply(context, args);
	}
}

export const capitalizeFirstLetter = (input: string): string => {
  if (input.length === 0) {
    return input; // Return the input as is if it's an empty string
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export const selectedChainIDsToDisplayString = (input: string[]): string => {
	return input.map((entry) => capitalizeFirstLetter(entry)).join(" & ");
}

export const compareArrays = (array1: string[], array2: string[]): boolean => {
	// Convert arrays to sets for efficient comparison
	const set1 = new Set(array1);
	const set2 = new Set(array2);

	// Check if the sets are equal, indicating that the contents match
	return arraysAreEqual(set1, set2);
}

export const arraysAreEqual = <T>(set1: Set<T>, set2: Set<T>): boolean => {
	if (set1.size !== set2.size) {
			return false;
	}

	for (const item of set1) {
			if (!set2.has(item)) {
					return false;
			}
	}

	return true;
}

// export const parsePostgresDate = () => {
// 	const parseDate = timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
// 	return 
// }