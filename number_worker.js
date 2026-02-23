// This is a worker file.

const DEBUG=false;
const DEBUG_ROUND=true;
const DEBUG_TRY=false;
const DEBUG_PAIR=false;
let lily;

self.onmessage = function(event) {
    if(event.data.run) {
	lily=new Lily(event.data.n, event.data.t, progress, event.data.all);
	const solution=lily.solve();	
	self.postMessage({type:"solution", solution: solution} );
    } else {
	lily.abort=true;
    }
}
function progress(expression, value, error) {
    self.postMessage({type:"progress", expression:expression, value:value, error:error});
}


    class LilyAttempt {
	constructor() {
	    this.soFar="";
	    this.mayNeedBrackets=false;
	    this.total=0;
	    this.numbersUsed=0;
	    this.isSingleNumber=false;
	}
	isEquivalent(operand) {
	    return (this.total == operand.total) && (this.numbersUsed == operand.numbersUsed);
	}
	isIdentical(operand) {
	    return (this.soFar == operand.soFar);
	}
	isMatch(operand, findAll) {
	    return findAll?this.isIdentical(operand):this.isEquivalent(operand);
	}
	copyPlus(operand) {
	    const result = new LilyAttempt;
	    if(! result instanceof LilyAttempt) return null;
	    let larger, smaller;
	    if(this.total >= operand.total) {
		larger = this;
		smaller = operand;
	    } else {
		larger = operand;
		smaller=this;
	    }
	    result.total = this.total + operand.total;
	    result.mayNeedBrackets = true;
	    result.soFar = larger.soFar + "+" + smaller.soFar;
	    result.numbersUsed = this.numbersUsed | operand.numbersUsed;
	    return result;
	}
	copyDifference(operand) {
	    const result = new LilyAttempt;
	    if(! result instanceof LilyAttempt) return null;
	    let larger, smaller;
	    if(this.total >= operand.total) {
		larger = this;
		smaller = operand;
	    } else {
		larger = operand;
		smaller=this;
	    }
	    result.total = larger.total - smaller.total;
	    if(result.total == 0) return null; // zero is not a useful result
	    result.mayNeedBrackets = true;
	    if(smaller.mayNeedBrackets)
		result.soFar = larger.soFar + "-(" + smaller.soFar + ")";
	    else
		result.soFar = larger.soFar + "-" + smaller.soFar;
	    result.numbersUsed = this.numbersUsed | operand.numbersUsed;
	    return result;
	}
	copyTimes(operand) {
	    const result = new LilyAttempt;
	    if(! result instanceof LilyAttempt) return null;
	    let larger, smaller;
	    if(this.total >= operand.total) {
		larger = this;
		smaller = operand;
	    } else {
		larger = operand;
		smaller=this;
	    }
	    if(smaller.total == 1) return null; // multiplying by one is not useful
	    result.total = this.total * operand.total;
	    result.mayNeedBrackets = false;
	    if(larger.mayNeedBrackets)
		result.soFar = "("+larger.soFar+")×"
	    else
		result.soFar = larger.soFar+"×"
	    if(smaller.mayNeedBrackets)
		result.soFar += "(" + smaller.soFar + ")";
	    else
		result.soFar += smaller.soFar;
	    result.numbersUsed = this.numbersUsed | operand.numbersUsed;
	    return result;
	}
	copyQuotient(operand) {
	    const result = new LilyAttempt;
	    if(! result instanceof LilyAttempt) return null;
	    let larger, smaller;
	    if(this.total >= operand.total) {
		larger = this;
		smaller = operand;
	    } else {
		larger = operand;
		smaller=this;
	    }
	    if(smaller.total == 1) return null; // dividing by one is not useful
	    if(larger.total % smaller.total != 0) return null;
	    result.total = larger.total / smaller.total;
	    result.mayNeedBrackets = false;
	    if(larger.mayNeedBrackets)
		result.soFar = "("+larger.soFar+")÷"
	    else
		result.soFar = larger.soFar+"÷"
	    if(!smaller.isSingleNumber)
		result.soFar += "(" + smaller.soFar + ")";
	    else
		result.soFar += smaller.soFar;
	    result.numbersUsed = this.numbersUsed | operand.numbersUsed;
	    return result;
	}
	newPairingsWith(operand) {
	    const pairings = [];
	    let result = this.copyPlus(operand);
	    if(result !== null) pairings.push(result);
	    result = this.copyDifference(operand);
	    if(result !== null) pairings.push(result);
	    result = this.copyTimes(operand);
	    if(result !== null) pairings.push(result);
	    result = this.copyQuotient(operand);
	    if(result !== null) pairings.push(result);
	    return pairings;
	}
    }
    
    class Lily {
	constructor(numbers, target, progress=null, findAll) {
	    this.bestError=999;
	    this.bestSolution = null;
	    this.target = Number(target); 
	    this.numbers = [];
	    this.progress = progress;
	    this.findAll = findAll;
	    this.abort = false;
	    let numberUsed = 1;
	    for (const value of numbers) {
		const attempt = new LilyAttempt;
		attempt.total = Number(value);
		attempt.isSingleNumber = true;
		attempt.numbersUsed = numberUsed;
		attempt.soFar = String(attempt.total);
		numberUsed <<= 1;
		this.numbers.push(attempt);
		if(Math.abs(attempt.total - this.target) < this.bestError) {
		    this.bestError = Math.abs(attempt.total - this.target);
		    this.bestSolution = attempt;
		}
	    }
	}
	// find new pairings between two attempts using each of the four operations, pushing any
	// valid pairings onto the foundPairings array.
	addPairings(attemptA, attemptB, foundPairings) {
	    let numbersUsed=0b111111;
	    if(0 == (attemptA.numbersUsed & attemptB.numbersUsed)) {
		if(DEBUG_PAIR) console.log("  Pairing "+attemptA.soFar+" by "+attemptB.soFar);
		const pairings = attemptA.newPairingsWith(attemptB);
		for(const pairing of pairings) {
		    // only add a pairing if an equivalent solution doesn't already exist
		    if(this.allAttempts.findIndex(attempt => pairing.isMatch(attempt,this.findAll)) == -1
		       && foundPairings.findIndex(attempt => pairing.isMatch(attempt,this.findAll)) == -1) {
			if(Math.abs(pairing.total - this.target) < this.bestError || pairing.total == this.target) {
			    this.bestError = Math.abs(pairing.total - this.target);
			    this.bestSolution = pairing;
			    if(progress !== null) {
				progress(pairing.soFar, pairing.total, this.bestError);
			    }
			}
			foundPairings.push(pairing);
			if(DEBUG) console.log("    "+pairing.soFar + "=" + pairing.total);
			numbersUsed &= pairing.numbersUsed;
			if(this.bestError == 0 && !this.findAll) break;
		    }
		}
	    }
	    return numbersUsed;
	}
	solve() {
	    // round 0: one number attempts
	    // round 1: 2 number attempts by combinations of all one number attempts with each other
	    // round 2: 3 and 4 number attempts by combinations of all 1- and 2- number attempts with 2- number attempts
	    // round 3: 5- and 6- number attempts by combinations of all 1-, 2-, 3- and 4- number attempts with 3- and 4- number attempts
	    // round 4: remaining 6-number attempts by combinations of 1- and 5-number attempts
	    
	    let newAttempts = this.numbers;
	    this.allAttempts = [];
	    let numbersUsed = 0b111111;
	    for(var round=1; (round<5 && (this.bestError>0 || this.findAll) && newAttempts.length>0); round++) {
		if(DEBUG_ROUND) console.log("Round "+round);
		const foundPairings = [];
		// first combine allAttempts with newAttempts
		for(const attemptA of this.allAttempts) {
		    for(const attemptB of newAttempts) {
			if(this.abort) return null;
			if(DEBUG_TRY) console.log("Round "+round+": trying "+attemptA.soFar+" by "+attemptB.soFar);
			numbersUsed &= this.addPairings(attemptA, attemptB, foundPairings);
			if(this.bestError == 0 && !this.findAll) break;
		    }
		    if(this.bestError == 0 && !this.findAll) break;
		}
		// Add the newAttempts to this.allAttempts
		this.allAttempts.push(...newAttempts);
		
		// then combine newAttempts with newAttempts
		for(let i=0; i<newAttempts.length-1; i++) {
		    const attemptA=newAttempts[i];
		    for(let j=i+1; j<newAttempts.length; j++) {
			if(this.abort) return null;
			const attemptB=newAttempts[j];
			if(DEBUG_TRY) console.log("Round "+round+"a: trying "+attemptA.soFar+" by "+attemptB.soFar);
			numbersUsed &= this.addPairings(attemptA, attemptB, foundPairings);
			if(this.bestError == 0 && !this.findAll) break;
		    }
		    if(this.bestError == 0 && !this.findAll) break;
		}
		// anything found becomes the newAttempts to try next cycle
		newAttempts = foundPairings;
		// if all new attempts use all six numbers, no more combinations are possible.
		if(DEBUG_ROUND) console.log(" round "+round+" numbers used = "+numbersUsed.toString(2));
		if(numbersUsed == 0b111111) break;
	    }
	    if(this.bestError == 0) return this.bestSolution.soFar+"="+this.bestSolution.total;
	    else return this.bestSolution.soFar+"="+this.bestSolution.total +" (the best solution found of "+(this.allAttempts.length+newAttempts.length)+" examined.)";
	}
    }
