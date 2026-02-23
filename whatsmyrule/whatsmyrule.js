var m, c, d, type, ticks;

function randInt(min,max)
{
    return min+Math.floor(Math.random()*(max-min+1));
}
function newRule(difficulty)
{
// generate a new rule with up to three operations (*, +, / in any order) using randomly generated integer operands, depending on the level of difficulty. Level 1: two operations giving y=mx+c (type 0), m in [1,5], c in [-5,5]; disallow m=1 & c=0. Level 2: two operations giving either y=mx+c or y=x/d+c (type 1), m in [-10,10], c in [-20,20], d in {2, 4, 5, 10} Level 3: three operations giving y=mx/d+c (type 2) or y=(mx+c)/d (type 3) with the same limits as level 2 for m and d, and c in [-99,99].

    var maxM, maxC, minM, minC;
    ticks=0;
    switch(difficulty) {
    case 1:
	type=0;
	maxM=5;
	minM=1;
	maxC=5;
	minC=-5;
	break;
    case 2:
	type=(Math.random()<0.4)?1:0;
	maxM=10;
	minM=-10;
	maxC=20;
	minC=-20;
	break;
    case 3:
	type=Math.floor(Math.random()*4);
	maxM=10;
	minM=-10;
	maxC=99;
	minC=-99;
	break;
    }
    do {
	m=randInt(minM,maxM);
	c=randInt(minC,maxC);
    } while(m==1 && c==0 && type==0);
    switch(randInt(0,3)) {
    case 0:
	d=2;
	break;
    case 1:
	d=4;
	break;
    case 2:
	d=5;
	break;
    case 3:
	d=10;
	break;
    }
    var buttonDiv=document.getElementById("buttons");
    var ioDiv=document.getElementById("io");
    var iorow=document.getElementById("myIOrow");
    var inp=document.getElementById("in");
    var out=document.getElementById("out");
    var calculate=document.getElementById("calculate");
    var giveup=document.getElementById("giveup");
    buttonDiv.style.display="none";
    ioDiv.style.display="block";
    iorow.style.display="table-row";
    rule.style.display="none";
    giveup.style.display="none";
    var table=document.getElementById("results");
    while (row = table.rows[3]) {
        table.deleteRow(3);
    }
    readyNext();
}

// do this when the user puts something into the output slot
function guess()
{
    var calculate=document.getElementById("calculate");
    var out=document.getElementById("out");
    if(out.value!=null && out.value!='') {
	calculate.value="Check";
    } else {
	calculate.value="Calculate";
    }
}
function input()
{
    var calculate=document.getElementById("calculate");
    var nmInput=document.getElementById("nmInput");
    var out=document.getElementById("out");
    var inp=document.getElementById("in");
    if(inp.value!=null && inp.value!='') {
	calculate.disabled=false;
	out.disabled=false;
    } else {
	calculate.disabled=true;
	out.disabled=true;
    }
    nmInput.innerHTML=inp.value;
}
function calculate()
{
// decide whether to calculate or check based on the presence/absence of a value in
// out.
    var calculate=document.getElementById("calculate");
    var out=document.getElementById("out");
    var inp=document.getElementById("in");
    var nmInput=document.getElementById("nmInput");
    var nmOutput=document.getElementById("nmOutput");
    var y;
    var x=inp.value;
    switch(type) {
    case 0:
	y=m*x+c;
	break;
    case 1:
	y=x/d+c;
	break;
    case 2:
	y=m*x/d+c;
	break;
    case 3:
	y=(m*x+c)/d;
	break;
    }
    if(calculate.value=="Calculate") {
	out.value=y;
	nmOutput.innerHTML=out.value;
	setTransition(nmInput,"transform 0.5s ease-in");
	setTransition(nmOutput,"transform 0.5s ease-out 0.5s");
	setTransform(nmInput,"scaleX(0.25) translateY(40px)");
	setTransform(nmOutput,"none");
	
	calculate.value="Record";
	inp.disabled=true;
	out.disabled=true;
    } else if(calculate.value=="Check") {
	if(isUnique(x)) {
	    nmOutput.innerHTML=y;
	    setTransition(nmInput,"transform 0.5s ease-in");
	    setTransition(nmOutput,"transform 0.5s ease-out 0.5s");
	    setTransform(nmInput,"scaleX(0.25) translateY(40px)");
	    setTransform(nmOutput,"none");
	    if(out.value==y) {
		if(ticks==0) {
		    window.alert("Well done! Think you know the rule? Prove it by doing it one more time.");
		    calculate.value="Calculate";
		    ticks=1;
		    addResult(x,y);
		    inp.disabled=false;
		    calculate.disabled=true;
		    out.disabled=true;
		    inp.value=null;
		    out.value=null;
		} else {
		    window.alert("Well done!");
		    calculate.value="Calculate";
		    ticks=1;
		    addResult(x,y);
		    var buttons=document.getElementById("buttons");
		    var rule=document.getElementById("rule");
		    var io=document.getElementById("io");
		    var symbols=document.getElementById("symbols");
		    var words=document.getElementById("words");
		    var iorow=document.getElementById("myIOrow");
		    var giveup=document.getElementById("giveup");
		    buttons.style.display="block";
		    iorow.style.display="none";
		    rule.style.display="block";
		    giveup.style.display="none";
		    symbols.innerHTML=ruleInSymbols();
		    typeset();
		    words.innerHTML=ruleInWords();
		    inp.value=null;
		    out.value=null;
		    calculate.disabled=true;
		    out.disabled=true;
		}
	    } else {
		window.alert("That's not right. The correct value is "+y);
		calculate.value="Calculate";
		ticks=-1;
		addResult(x,y);
		inp.disabled=false;
		calculate.disabled=true;
		out.disabled=true;
		inp.value=null;
		out.value=null;
	    }
	} else {
	    window.alert("You've already tried "+x+". Try a different input value.");
	}
	readyNext();
    } else { // record
	addResult(x,y);
	readyNext();
    }
}

function readyNext()
{
    var calculate=document.getElementById("calculate");
    var out=document.getElementById("out");
    var inp=document.getElementById("in");
    var nmInput=document.getElementById("nmInput");
    var nmOutput=document.getElementById("nmOutput");
    inp.value=null;
    inp.disabled=false;
    out.value=null;
    nmInput.innerHTML="";
    nmOutput.innerHTML="";
    clearTransition(nmInput);
    clearTransition(nmOutput);
    setTransform(nmInput,"none");
    setTransform(nmOutput,"scaleX(0.25) translateY(-40px)");
    calculate.value="Calculate";
    calculate.disabled=true;
}
function setTransform(element,xform)
{
	element.style.transform=xform;
	element.style.webkitTransform=xform;
	element.style.mozTransform=xform;
	element.style.oTransform=xform;
	element.style.msTransform=xform;
}
function setTransition(element, transition)
{
    element.style.transition=transition;
    element.style.mozTransition="-moz-"+transition;
    element.style.webkitTransition="-webkit-"+transition;
    element.style.oTransition="-o-"+transition;
    element.style.msTransition="-ms-"+transition;
}
function clearTransition(element)
{
    element.style.transition="none";
    element.style.mozTransition="none";
    element.style.webkitTransition="none";
    element.style.oTransition="none";
    element.style.msTransition="none";
}

function isUnique(x)
{
    var table=document.getElementById("results");
    for (var i = 3, row; row = table.rows[i]; i++) {
	var pastX=row.cells[0].innerHTML;
	if (x==pastX) {
	    return false;
	}
    }
    return true;
}
function addResult(x,y)
{
    var table=document.getElementById("results");
    var row=table.insertRow(3);
    var cell1=row.insertCell(0);
    var cell2=row.insertCell(1);
    var cell3;
    if(ticks==1) {
	ticks=2;
	cell3=row.insertCell(2);
	cell3.innerHTML="&#x2714;";
	cell3.style.textAlign="left";
	cell3.style.color="red";
    } else if(ticks==-1) {
        ticks=0;
        cell3=row.insertCell(2);
        cell3.innerHTML=".";
        cell3.style.textAlign="left";
        cell3.style.color="red";
    }
    cell1.innerHTML=x;
    cell2.innerHTML=y;
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
    if(rows>6) {
	var giveup=document.getElementById("giveup");
	giveup.style.display="inline";
	giveup.disabled=false;
    }
}

function ruleInSymbols()
{
    return ruleInSymbolsMathML();
}

function ruleInSymbolsMathML()
{
    var rule="<math><mrow><mi>y</mi><mo>=</mo>";
    switch(type) {
        case 0:
            if(m==-1) {
                rule=rule+"<mo>-</mo>";
            } else if (m!=1) {
                rule=rule+"<mn>"+m+"</mn><mo>&InvisibleTimes;</mo>";
            }
            rule=rule+"<mi>x</mi>";
            if(c>0) {
                rule=rule+"<mo>+</mo><mn>"+c+"</mn>";
            } else if (c<0) {
                rule=rule+"<mo>-</mo><mn>"+(-c)+"</mn>";
            }
            break;
        case 1:
            rule=rule+"<mfrac><mrow><mi>x</mi></mrow><mrow><mn>"+d+"</mn></mrow></mfrac>";
            if(c>0) {
                rule=rule+"<mo>+</mo><mn>"+c+"</mn>";
            } else if (c<0) {
                rule=rule+"<mo>-</mo><mn>"+(-c)+"</mn>";
            }
            break;
        case 2:
            var absM=m;
            if(m<0) {
                rule=rule+"<mo>-</mo>";
                absM=-m;
            }
            rule=rule+"<mfrac><mrow>"
            if(absM!=1) {
                rule=rule+"<mn>"+absM+"</mn><mo>&InvisibleTimes;</mo>";
            }
            rule=rule+"<mi>x</mi></mrow><mrow><mn>"+d+"</mn></mrow></mfrac>";
            if(c>0) {
                rule=rule+"<mo>+</mo><mn>"+c+"</mn>";
            } else if (c<0) {
                rule=rule+"<mo>-</mo><mn>"+(-c)+"</mn>";
            }
            break;
        case 3:
            var absM=m;
            rule=rule+"<mfrac><mrow>"
            if(m==-1) {
                rule=rule+"<mo>-</mo>";
            } else if (m!=1) {
                rule=rule+"<mn>"+m+"</mn><mo>&InvisibleTimes;</mo>";
            }
            rule=rule+"<mi>x</mi>";
            if(c>0) {
                rule=rule+"<mo>+</mo><mn>"+c+"</mn>";
            } else if (c<0) {
                rule=rule+"<mo>-</mo><mn>"+(-c)+"</mn>";
            }
            rule=rule+"</mrow><mrow><mn>"+d+"</mn></mrow></mfrac>";
            break;
    }
    rule=rule+"</mrow>";
    rule=rule+"</math>";
    return rule;
}

// obsolescent ... mathJax is overkill; let mathML take care of it.
function ruleInSymbolsTex()
{
    var rule="\\[y=";
    switch(type) {
    case 0:
	if(m==-1) {
	    rule=rule+"-";
	} else if (m!=1) {
	    rule=rule+m;
	}
	rule=rule+"x";
	if(c>0) {
	    rule=rule+"+"+c;
	} else if (c<0) {
	    rule=rule+c;
	}
	break;
    case 1:
	rule=rule+"{{x}\\over{"+d+"}}";
	if(c>0) {
	    rule=rule+"+"+c;
	} else if (c<0) {
	    rule=rule+c;
	}
	break;
    case 2:
	var absM=m;
	if(m<0) {
	    rule=rule+"-";
	    absM=-m;
	}
	rule=rule+"{{"
	if(absM!=1) {
	    rule=rule+absM;
	}
	rule=rule+"x}\\over{"+d+"}}";
	if(c>0) {
	    rule=rule+"+"+c;
	} else if (c<0) {
	    rule=rule+c;
	}
	break;
    case 3:
	var absM=m;
	rule=rule+"{{"
	if(m==-1) {
	    rule=rule+"-";
	} else if (m!=1) {
	    rule=rule+m;
	}
	rule=rule+"x";
	if(c>0) {
	    rule=rule+"+"+c;
	} else if (c<0) {
	    rule=rule+c;
	}
	rule=rule+"}\\over{"+d+"}}";
	break;
    }
    rule=rule+"\\]";
    return rule;
}

function ruleInWords()
{
    var rule="To get the output, ";
    switch(type) {
    case 0:
	if (m!=1) {
	    rule=rule+"multiply by "+m;
        if(c!=0) {
            rule=rule+" then ";
        }
	}
	if(c>0) {
	    rule=rule+" add "+c;
	} else if (c<0) {
	    rule=rule+" subtract "+(-c);
	}
	break;
    case 1:
	rule=rule+"divide by "+d;
	if(c>0) {
	    rule=rule+" then add "+c;
	} else if (c<0) {
	    rule=rule+" then subtract "+(-c);
	}
	break;
    case 2:
	if (m!=1) {
	    rule=rule+"multiply by "+m;
	}
	rule=rule+" and divide by "+d;
	if(c>0) {
	    rule=rule+" then add "+c;
	} else if (c<0) {
	    rule=rule+" then subtract "+(-c);
	}
	break;
    case 3:
	if (m!=1) {
	    rule=rule+"multiply by "+m;
        if(c!=0) {
            rule=rule+" then ";
        }
	}
	if(c>0) {
	    rule=rule+" add "+c;
	} else if (c<0) {
	    rule=rule+" subtract "+(-c);
	}
	rule=rule+" and then divide by "+d;
	break;
    }
    return rule;
}

function giveUp()
{
//    calculate.value="Calculate";
    var buttons=document.getElementById("buttons");
    var rule=document.getElementById("rule");
    var io=document.getElementById("io");
    var symbols=document.getElementById("symbols");
    var words=document.getElementById("words");
    var iorow=document.getElementById("myIOrow");
    buttons.style.display="block";
    iorow.style.display="none";
    rule.style.display="block";
    symbols.innerHTML=ruleInSymbols();
    typeset();
    words.innerHTML=ruleInWords();
//    inp.value=null;
//    out.value=null;
//    calculate.disabled=true;
//    out.disabled=true;
}

function typeset()
{
    if(typeof MathJax !== 'undefined') {
	MathJax.Hub.Typeset();
    }
}