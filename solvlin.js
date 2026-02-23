/* solvlin.js - solving simple linear equations auto-generated exercises
 *
 * Requires: MathematicsParser.js, MathJax.js
 */

var SIZE=4, chartRow;

// =====================================================
// Code for the modal dialog box
// Get the modal
var modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// =====================================================

// Generate a random term with (non-zero) coefficient only
function randomConstant(diff)
{
    var rval;
    do { rval=randomValue(diff); } while(rval.isZero);
    return rval;
}
// Generate a random term with constant value
function randomValue(diff)
{
    var rval;
    var value;
    var sign=1;
    switch(diff) {
    case "2":
	value = randBetween(1,10)+randBetween(1,10);
	if(Math.random()<0.25) sign=-1;
	break;
    case "3":
	value = new Decimal(randBetween(1,200),10);
	if(Math.random()<0.4) sign=-1;
	break;
    case "4":
	var num=randBetween(1,20);
	var den=Math.floor((Math.random()*Math.random())*9+1);
	var factor = gcd(num,den);
	num /= factor;
	den /= factor;
	value = undefined;
	rval= new Term( [ new Factor(new Atom(num)), new Factor(new Atom(den), new Atom(-1)) ] );
	if(Math.random()<0.5) sign=-1;
	break;
    case "1":
    default:
	value = randBetween(1,6)+randBetween(1,6);
	break;
    }
    if(value!==undefined) rval = new Term( new Factor(new Atom(value)) );
    rval.sign = sign;
    return rval;
}

function randomTerm(diff) {
    var t = new Term( new RandomSpecifier(RANDOM.term, 0, 2*diff-1) );
    var c = randomConstant(diff);
    if(c.isUnity && t.factors.length>0) {
	t.sign *= c.sign;
	return t;
    } else return c.multiply(t);
}

// now we define a problem with LHS and RHS of type Expression
// Each part will start with the pronumeral with a pre-determined value, then apply one,
// two or three operations (+c, -c, *c, /c) to it to give an expression, doing the same
// to LHS and RHS. 
// This gives a single-sided equation.

// For a double-sided equation,
// start with x = c
// multiply by some constant to give mx=mc
// * add some multiple n/=m of x to both sides and collect terms on lhs (n+m)x=mc+nx
// randomly reorder terms
// apply zero, one, or two other operations, depending on difficulty, doing the same to LHS and RHS
// collectFactors and collectTerms to lhs and rhs
// randomly swap lhs and rhs
// present equation

class Equation{
    constructor(lhs,rhs) {
	if(typeof lhs == "string") {
	    this.lhsString = lhs;
	    this.lhs = PARSER.parse(lhs);
	} else {
	    this.lhs=lhs;
	}
	if(typeof rhs == "string") {
	    this.rhsString = rhs;
	    if(rhs=="") this.rhs=null;
	    else this.rhs = PARSER.parse(rhs);
	} else {
	    this.rhs=rhs;
	}
    }
    satisfies(subs) {
	if(this.rhs === undefined) return false;
	var lhs=this.lhs.substitute(subs);
	var rhs=this.rhs.substitute(subs);
	return lhs.expandAll().isEqual(rhs.expandAll());
    }
    applyOperation(fn, expr) {
	var lhs = fn.call(this.lhs, expr);
	var rhs = fn.call(this.rhs, expr);
	return new Equation(lhs,rhs);	
    }
    add(expr) {
	return this.applyOperation(Equation.prototype.add, expr);
    }
    subtract(expr) {
	return this.add(expr.negate());
    }
    negate() {
	return this.applyOperation(Equation.prototype.negate, undefined);
    }
    subtractFrom(expr) {
	return this.negate().add(expr);
    }
    multiply(expr) {
	return this.applyOperation(Equation.prototype.product, expr);
    }
    swap() {
	return new Equation(this.rhs, this.lhs);
    }
    toString() {
	return this.lhs.toString()+" = "+this.rhs.toString();
    }
    toLaTeX(align) {
	var equal="=";
	if(align!=undefined && align) equal="&=";
	var rval = this.lhs.toLaTeX();
	if(this.rhs !== undefined) {
	    rval += equal;
	    if(this.rhs !== null) rval += this.rhs.toLaTeX();
	}
	return rval;
    }
    static parse(input) {
	// split the input at the "="
	var sides = input.split('=');
	if(sides.length == 1) { // no = found ... parse it all as LHS
	    return new Equation(sides[0]);
	} else 
	if(sides.length!=2) throw "Expected a single equation";
	return new Equation(PARSER.parse(sides[0]), PARSER.parse(sides[1]));
    }

}

function randomProblem(diff, sided) {
    var pronumeral = new Factor(new Atom(new RandomSpecifier(RANDOM.pronumeral)));
    var value = randomValue(diff);
    var LHS = new Expression(new Term(pronumeral));
    var RHS = new Expression(value);
    var sidedStep=-1;
    if(sided>1) sidedStep=randBetween(0,diff-1);
    for(i=0; i<diff; i++) {
	var op;
	// random operation, but not two consecutive addition/subtraction or multiplication/division
	// (and only division for hardest)
	if(i==0) 
	    op = randBetween(0,diff>3?3:2);
	else if(op<2)
	    op = (diff>3)?randBetween(2,3):2;
	else
	    op = randBetween(0,1);
	var operand = randomConstant(diff);
	switch(op) {
	case 0: // add a number to both sides
	    LHS = LHS.add(operand);
	    RHS = RHS.add(operand);
	    // shuffle terms
	    LHS.terms.sort(function(a,b){ return randBetween(0,1)*2-1; });
	    break;
	case 1: // subtract a number to both sides
	    LHS = LHS.add(operand.negate());
	    RHS = RHS.add(operand.negate());
	    // shuffle terms
	    LHS.terms.sort(function(a,b){ return randBetween(0,1)*2-1; });
	    break;
	case 2: // multiply both sides by a number
	    while(operand.isUnity) { operand = randomConstant(diff); }
	    LHS = LHS.product(new Expression(operand));
	    RHS = RHS.product(new Expression(operand));
	    break;
	case 3: // divide both sides by a number
	    while(operand.isUnity) { operand = randomConstant(diff); }
	    operand = operand.reciprocal();
	    LHS = LHS.product(new Expression(operand));
	    RHS = RHS.product(new Expression(operand));
	    break;
	}
	if(i==sidedStep) {
	    // add a multiple of x to RHS and the number equivalent to LHS.
	    // make sure we don't end up eliminating the pronumeral
	    var newLHS, newRHS;
	    //console.log("sidedStep="+sidedStep);
	    do{
		operand = randomConstant(diff);
		newLHS = LHS.add(operand.multiply(value));
		newRHS = RHS.add(operand.multiply(pronumeral));
	    } while(newLHS.expandAll().isEqual(newRHS.expandAll()));
	    LHS=newLHS;
	    RHS=newRHS;
	}
	console.log("RHS="+RHS.toString());
	RHS = RHS.expand().collectFactors().sortFactors().collectTerms();
	console.log("collected to:"+RHS.toString()+"\n");
	LHS = LHS.collectFactors().sortFactors().collectTerms();
    }
    var eq = new Equation(LHS, RHS);
    if(randBetween(0,3)==0) eq=eq.swap();
    return {equation: eq, pronumeral: pronumeral, value: value};
}


//==============================================================
// interface code

function getDifficulty()
{
    var radios=document.getElementsByName("difficulty");
    var rval=1;
    for (var i = 0, length = radios.length; i < length; i++) {
	if (radios[i].checked) {
            rval=radios[i].value;
	    break;
	}
    }
    return rval;
}
function getSided()
{
    var radios=document.getElementsByName("sided");
    var rval=1;
    for (var i = 0, length = radios.length; i < length; i++) {
	if (radios[i].checked) {
            rval=radios[i].value;
	    break;
	}
    }
    return rval;
}

var solved;
var problem;
var workInProgress;
var problemSpan;
var answerSpan;
function prepareProblem()
{
    var diff=getDifficulty();
    var sided = getSided();
    var list = document.getElementById("problems");
    var history = document.getElementById("history");
    // if problemSpan already contains a problem, and it has class name "problem good" or "problem unsimple"
    // them make a copy of it at the end of the history div before clearing it.
    if(problemSpan !== undefined && (problemSpan.className == "problem good" || problemSpan.className == "problem unsimple")) 
	history.appendChild(problemSpan.cloneNode(true));

    while(list.hasChildNodes()) {
	list.removeChild(list.lastChild);
    }

    problem = randomProblem(diff,sided);
    solved=false;
//    var newChild = document.createElement("DIV");
    problemSpan = document.createElement("DIV");
    answerSpan = document.createElement("DIV");
    var input = document.createElement("INPUT");
    
    workInProgress=problem.equation.toLaTeX(true);
    problemSpan.innerHTML = "\\begin{align}"+workInProgress+"\\end{align}";
    problemSpan.setAttribute("class","problem");
    list.appendChild(problemSpan);

    //answerSpan.innerHTML = "\\("+problem.simplify().toLaTeX()+"\\)";
    answerSpan.setAttribute("class","answer");

    input.setAttribute("class","answer");
    input.setAttribute("type","text");
    input.onkeyup = function(event){ return mathInput(event); };
    input.setAttribute("onchange", "check(event,"+ i+ ")");
    //	input.onchange = function(event) { check(event, i, problems); };
    list.appendChild(answerSpan);
    list.appendChild(input);
//    list.appendChild(newChild);

    MathJax.Hub.Queue(["Typeset",MathJax.Hub,list]);
    input.focus();
}


function isAllSolved()
{
    if(!solved.some(function(x){return !x;})) modal.style.display = "block";
}

function check(event, n)
{
    mirror = answerSpan;//event.target.nextElementSibling;
    if(event.target.value=="" || event.target.value==null) {
	target.className="answer";
    } else {
	try{
	    var inp = Equation.parse(event.target.value); 
	} catch(err) {
	    var bits =event.target.value.split("=")
	    if(bits.length<2) mirror.className = "answer needEquation";
	    else if(bits.length>2) mirror.className = "answer tooManyEquals";
	    else mirror.className = "answer parseError";
	}
	if(inp.satisfies({pronumeral: problem.pronumeral.factor.item, value: problem.value})) {
	    // expression is correct, but is it fully simplified?
	    // if it is, the LHS should evaluate to a single term, with a single factor equal to the pronumeral.
	    if(inp.lhs.length == 1 &&
	       inp.lhs.terms[0].length == 1 &&
	       inp.lhs.terms[0].factors[0].factor.item == problem.pronumeral.factor.item &&
	       inp.lhs.terms[0].factors[0].index.item == 1 &&
	       inp.rhs.length == 1 &&
	       inp.rhs.terms[0].length == 1 &&
	       inp.rhs.terms[0].factors[0].factor.item * inp.rhs.terms[0].sign ==
	          problem.value.factors[0].factor.item * problem.value.sign &&
	       inp.rhs.terms[0].factors[0].index.item == 1
	      ) {
		// mirror.className="answer good";
		problemSpan.className="problem good";
		solved=true;
		// add to workInProgress
		workInProgress += "\\\\"+inp.toLaTeX(true)+"\\tag*{$\\checkmark$}";
		problemSpan.innerHTML = "\\begin{align*}"+workInProgress+"\\end{align*}";
		MathJax.Hub.Queue(["Typeset",MathJax.Hub,problemSpan]);
		// remove the input,
		event.target.value="";
		var list = document.getElementById("problems");
		mirror.parentNode.removeChild(mirror);
		event.target.parentNode.removeChild(event.target);
		document.getElementById("generate").focus();
		//		    isAllSolved();
	    } else {
		//mirror.className="answer unsimple";
		problemSpan.className="problem unsimple";
		solved=false;
		// add to workInProgress
		workInProgress += "\\\\"+inp.toLaTeX(true)+"\\tag*{$\\tiny(\\checkmark)$}";
		problemSpan.innerHTML = "\\begin{align*}"+workInProgress+"\\end{align*}";
		MathJax.Hub.Queue(["Typeset",MathJax.Hub,problemSpan]);
		// remove the input,
		event.target.value="";
		mirror.innerHTML="";
		// create a new input as a new sibling after mirror
		// create a new mirror
	    }
	} else {
	    mirror.className="answer bad";
	    solved==false;
	}
    }
}

function mathInput(event) {
    // attach as a keyup event to format input controls on the fly
        // 1. Do nothing if text is selected
    var selection = window.getSelection().toString();
    if ( selection !== '' ) {
        return;
    }
    // 2. ignore arrow keys and Enter
    if( [38,40,37,39,13].some(function(x){ return x==event.keyCode; } ) ) {
        return;
    }

    var mirror = answerSpan;//event.target.nextElementSibling;
    mirror.className = "answer";

    // 1 Get the value so far
    var input = event.target.value;

    // we just parse it then use toLaTeX, but if an incomplete input fails to parse, we just apply some simple sugar
    // first remove any trailing operators or spaces
    tidyTail = function(inp) {
	var tails = inp.match(/[^a-zA-Z0-9).]*$/);
	if(tails[0]>"") return { tidy: inp.slice(0,-tails[0].length), tail:tails[0] };
	else return { tidy: inp, tail:"" };
    }
    sweeten = function(latex) {
	if(latex == undefined || latex.length==0) return "";
	// replace num/dem with \frac{num}{dem}
	var myRegExp = /([^+-\/]+)\/(-?[0-9.]+)/g;
	latex=latex.replace(myRegExp, "\\frac{$1}{$2}");
	
	// one or more digits after a letter are an index
	myRegExp = /([a-zA-Z])([0-9]+)/g;
	latex = latex.replace(myRegExp,"$1^{$2}");
	
	return latex;
    }

    tidied = tidyTail(input);
    var parsed;
    try {
	parsed = Equation.parse(tidied.tidy);
	mirror.innerHTML = "\\[" + parsed.toLaTeX() + tidied.tail + "\\]";
    } catch(err) {
	splits=input.split("=");
	mirror.innerHTML = "\\["+sweeten(splits[0])+"="+sweeten(splits[1])+"\\]";
    }
    
    // and tell MathJax to format it
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,mirror]);
}
