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

var VARIABLES;

// Generate a random term with coefficient only
function randomConstant(diff)
{
    var rval;
    var num;
    var sign=1;
    var decimals = getRadio("decimals");
    var den = decimals?((diff<3)?10:100):1;
    var lower, upper;
    switch(diff) {
    case 1:
	lower=-2;
	upper=5;
	break;
    case 2:
	lower=-4;
	upper=8;
	break;
    case 3:
	lower = -10;
	upper = 10;
    }
    lower*=den;
    upper*=den;
    do { num = randBetween(lower,upper)+randBetween(lower,upper); } while(num==0);
    if(num<0) { num=-num; sign=-1; }
    rval = new Term( new Factor(new Decimal(num,den)) );
    rval.isUnity=(num==den);
    rval.sign = sign;
    return rval;
}

function randomTerm(diff) {
    // In order to ensure that there are more opportunities for
    // collecting like terms, we limit the number of
    // distinct variables to the difficulty+1.
    
    var t;
    if(VARIABLES.length <= diff) {
	do {
	    t = new Term( new RandomSpecifier(RANDOM.term, 0, diff) );
	} while( VARIABLES.some(function(el){ return el.isLike(t); }) );
	VARIABLES.push(t);
    } else {
	t = VARIABLES[randBetween(0,diff)];
    }
    var c = randomConstant(diff);
    if(c.isUnity && t.factors.length>0) {
	t.sign *= c.sign;
	return t.collectFactors();
    } else return c.multiply(t).collectFactors();
}

function randomTerms(diff,n) {
    var terms, nextTerm;
    // we can't have more terms than we have maximum distinct variables.
    if(n>diff+1) n = diff+1;
    terms=[];
    for(var i=0; i<n; i++) {
	do { nextTerm = randomTerm(diff); }
	while(terms.some(function(x){return x.isLike(nextTerm);}));
	terms.push(nextTerm.collectFactors());
    }
    return terms;
}

// now we define a 'part' of type Term. 
// Each 'part' will look like a(b+c) where a, b and c
// are all random terms.
function randomPart(diff) {
    var unity = new Term(new Factor(1));
    var leftFactor;
    switch(getOrder()) {
    case 1:
	do{ leftFactor= randomTerms(diff,1) }
	while (new Expression(leftFactor[0]).isEqual(unity));
	var nRightTerms=2;
	if(diff>1 && randBetween(0,99)<10*diff) nRightTerms++;
	if(diff>1 && randBetween(0,99)<5*diff) nRightTerms++;
	var rightTerms = randomTerms(diff,nRightTerms);
	return leftFactor[0].multiply(new Factor(new Atom(new Expression(rightTerms))));
    case 2:
	var nLeftTerms=2;
	if(diff>1 && randBetween(0,99)<10*diff) nLeftTerms++;
	if(diff>1 && randBetween(0,99)<5*diff) nLeftTerms++;
	var leftTerms = randomTerms(diff,nLeftTerms);
	var nRightTerms=2;
	if(diff>1 && randBetween(0,99)<10*diff) nRightTerms++;
	if(diff>1 && randBetween(0,99)<5*diff) nRightTerms++;
	var rightTerms = randomTerms(diff,nRightTerms);
	return new Term([new Factor(new Atom(new Expression(leftTerms))),
			 new Factor(new Atom(new Expression(rightTerms)))]);
    case 3:
	var nLeftTerms=randBetween(1,2);
	if(diff>1 && randBetween(0,99)<10*diff) nLeftTerms++;
	if(diff>1 && randBetween(0,99)<5*diff) nLeftTerms++;
	var leftTerms = randomTerms(diff,nLeftTerms);
	if(nLeftTerms==1) leftTerms=leftTerms[0];
	else leftTerms = new Term(new Factor(new Atom(new Expression(leftTerms))));
	for(var i=0; i<2; i++) {
	    var nRightTerms=2;
	    if(diff>1 && randBetween(0,99)<10*diff) nRightTerms++;
	    if(diff>1 && randBetween(0,99)<5*diff) nRightTerms++;
	    var rightTerms = randomTerms(diff,nRightTerms);
	    leftTerms=leftTerms.multiply( new Factor(new Atom(new Expression(rightTerms))));
	}
	return leftTerms;
    }
}

// finally a problem: an expression with one or more parts
function randomProblem(diff,len) {
    VARIABLES = [];
    var parts = [ randomPart(diff) ];
    if(len > 1) parts.push(randomPart(diff));
    if(len > 1 && diff > 2 && randBetween(1,3)==1) parts.push(randomPart(diff));
    return new Expression(parts);
}

//==============================================================
// interface code

function getRadio(name)
{
    var radios=document.getElementsByName(name);
    var rval=1;
    for (var i = 0, length = radios.length; i < length; i++) {
	if (radios[i].checked) {
            rval=parseInt(radios[i].value);
	    break;
	}
    }
    return rval;
}

function getDifficulty()
{
    return getRadio("difficulty");
}
function getLength()
{
    return getRadio("length");
}
function getOrder()
{
    return getRadio("order");
}

var solved=[];
var problems=[];
var answerSpans=[];
var problemSpans=[];
var inputs=[];
var wip=[];
var maths=[];
function prepareProblems()
{
    solved=[];
    problems=[];
    answerSpans=[];
    problemSpans=[];
    inputs=[];
    wip=[];
    maths=[];
    
    modal.style.display = "none";
    var diff=getDifficulty();
    var len = getLength();
    var list = document.getElementById("problems");
    while(list.hasChildNodes()) {
	list.removeChild(list.lastChild);
    }
    var problem;
    problems=[];
    for(var i=0; i<5; i++) {
	problem = randomProblem(diff,len);
	solved[i]=false;
	problems.push(problem);
	var newChild = document.createElement("DIV");
	answerSpan = document.createElement("DIV");
	answerSpans.push(answerSpan);
	var problemSpan = document.createElement("SPAN");
	problemSpans.push(problemSpan);
	var input = document.createElement("INPUT");
	inputs.push(input);
	wip[i]=problem.toLaTeX();//+"\\\\&\\quad=";
	problemSpan.innerHTML = "\\begin{align*}&"+wip[i]+"\\end{align*}";
	problemSpan.setAttribute("class","problem");
	newChild.appendChild(problemSpan);

	//answerSpan.innerHTML = "\\["+problem.simplify().toLaTeX()+"\\]";
	answerSpan.setAttribute("class","answer");

	input.setAttribute("class","answer");
	input.setAttribute("type","text");
	input.onkeyup = function(event){ return mathInput(event); };
	input.setAttribute("onchange", "check(event,"+ i+ ")");
//	input.onchange = function(event) { check(event, i, problems); };
	newChild.appendChild(answerSpan);
	newChild.appendChild(input);
	list.appendChild(newChild);
    }
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,list]);
}


function isAllSolved()
{
    if(!solved.some(function(x){return !x;})) modal.style.display = "block";
}
function check(event, n)
{
    // don't do it again if it's already solved.
    if(solved[n]) return;
    
    mirror = answerSpans[n];
    problemSpan = problemSpans[n];
    if(event.target.value=="" || event.target.value==null) {
	target.className="answer";
    } else {
	try{
	    var inp = PARSER.parse(event.target.value); 
	} catch(err) {
	    mirror.className = "answer parseError";
	}
	var ans = problems[n].expandAll().collectTerms();
	if(inp.expandAll().isEqual(ans)) {
	    // expression is correct, but is it fully simplified?
	    // an expression is simple if
	    // - it has no bracketed factors,
	    // - it satisfies Expression.isSimple
	    if(wip[n].slice(-1)!="=") wip[n]+="\\\\&\\quad=";
	    wip[n]+=inp.toLaTeX();
	    
	    if(inp.length == ans.length &&
	       inp.isSimpleAndExpanded ) {
		problemSpan.className="problem good";
		solved[n]=true;
		wip[n]+="\\tag*{$\\checkmark$}";
		event.target.style.display = 'none';
		mirror.style.display = 'none';
		if(n<4) inputs[n+1].focus(); else document.getElementById('generate').focus();
	    } else {
		problemSpan.className="problem unsimple";
		solved[n]=false;
		wip[n]+="\\tag*{$\\tiny(\\checkmark)$}";
	    }
//	    if(! maths[n]) maths[n] = MathJax.Hub.getAllJax(problemSpan)[0];
//	    MathJax.Hub.Queue(["Text",maths[n],"\\begin{align*}&"+wip[n]+"\\end{align*}"]);
	    problemSpan.innerHTML="\\begin{align*}&"+wip[n]+"\\end{align*}"
	    // and tell MathJax to format it
	    MathJax.Hub.Queue(["Typeset",MathJax.Hub,problemSpan]);
	    if(solved[n]) isAllSolved();
	} else {
	    mirror.className="answer bad";
	    solved[n]==false;
	}
    }
}

var inputMaths=[];
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
    var n = inputs.indexOf(event.target);
    var mirror = answerSpans[n];//event.target.nextElementSibling;

    // 1 Get the value so far
    var input = event.target.value;

    // we just parse it then use toLaTeX, but if an incomplete input fails to parse, we just apply some simple sugar
    // first remove any trailing operators or spaces
    tidyTail = function(inp) {
	var tails = inp.match(/[^a-zA-Z0-9)]*$/);
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
	mirror.innerHTML = "\\[=" + parsed.toLaTeX() + tidied.tail + "\\]";
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,mirror]);
    } catch(err) {
	mirror.innerHTML = "\\[="+sweeten(input)+"\\]";
	MathJax.Hub.Queue(["Typeset",MathJax.Hub,mirror]);
    }
    MathJax.Hub.Queue(function() { mirror.className = "answer"; });
}
