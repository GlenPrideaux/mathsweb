function prepareAlgebraChart()
{
    var chart=setupChart();
    chart.style=styles.LONG;
    chart.compare=algCompare;
    SIZE=3+chart.diff;
    var pronumerals=['a','b','c','d','e','f','g','h','k','m','n','p','q','r','s','t','u','v','w','x','y','z'];
    chart.pronumeral = pronumerals[randBetween(0,pronumerals.length-1)];

    /* Each row heading and each column heading is a linear factor. We generate them just like for addition charts.
     * Each table entry is a quadratic we get by multiplying the corresponding headings.
     * Each heading needs one coefficient and one constant.
     * Each table entry needs an x^2 coefficient, an x coefficient and a constant.
     */
    for(r=0; r<SIZE; r++) {
	chart.chartRow[r]=new Array();
	if(r==0) {
	    for(c=1; c<SIZE; c++) {
		do {
		    factor=randomLinear(chart.diff);
		    chart.chartRow[r][c]= { squarecoefficient : 0,
					    coefficient : factor.coefficient, 
					    constant : factor.constant,
					    solved: false,
					    pronumeral: chart.pronumeral };
		    chart.chartRow[r][c].nakedValue=algToText(chart.chartRow[r][c], chart);
		    chart.chartRow[r][c].value="\\(("+chart.chartRow[r][c].nakedValue+")\\)";
		} while(hasDupes(chart.chartRow,rc.COLUMNS));
	    }
	} else {
	    do {
		factor=randomLinear(chart.diff);
		chart.chartRow[r][0] =  { squarecoefficient : 0,
					  coefficient : factor.coefficient, 
					  constant : factor.constant,
					  solved: false,
					  pronumeral: chart.pronumeral };
		chart.chartRow[r][0].nakedValue=algToText(chart.chartRow[r][0], chart);
		chart.chartRow[r][0].value="\\(("+chart.chartRow[r][0].nakedValue+")\\)";
	    } while(hasDupes(chart.chartRow,rc.ROWS))
	    for(c=1; c<SIZE; c++) {
		chart.chartRow[r][c]= { squarecoefficient : chart.chartRow[r][0].coefficient*chart.chartRow[0][c].coefficient,
					coefficient : chart.chartRow[r][0].coefficient*chart.chartRow[0][c].constant +
					              chart.chartRow[0][c].coefficient*chart.chartRow[r][0].constant,
					constant : chart.chartRow[r][0].constant*chart.chartRow[0][c].constant,
					solved: false,
					pronumeral: chart.pronumeral };
		chart.chartRow[r][c].nakedValue=algToText(chart.chartRow[r][c], chart);
		chart.chartRow[r][c].value="\\("+chart.chartRow[r][c].nakedValue+"\\)";
	    }
	}
    }
    chart.chartRow[0][0]={solved:true};

    // replace the chart node with an empty clone of itself
    var cChart = chart.chartdiv.cloneNode(false);
    chart.chartdiv.parentNode.replaceChild(cChart, chart.chartdiv);
    chart.chartdiv=cChart;

    return chart;
}

function algToText(expression, chart)
{
    html="";
    if(expression.squarecoefficient!=0) {
	 if(expression.squarecoefficient==1) {
            html=html+chart.pronumeral+"^2";
        } else if(expression.squarecoefficient==-1) {
            html=html+"-"+chart.pronumeral+"^2";
        } else {
	    html=html+expression.squarecoefficient+chart.pronumeral+"^2";
        }
	if(expression.coefficient>0
	   || (expression.coefficient==0 && expression.constant>0) ) {
	    html=html+"+";
	}
    }
    if(expression.coefficient==0) {
	if(expression.constant==0) {
	    if(expression.squarecoefficient==0) {
		html="0";
	    }
	} else {
	    html=html+expression.constant;
	}  
    } else {
        if(expression.coefficient==1) {
            html=html+chart.pronumeral;
        } else if(expression.coefficient==-1) {
            html=html+"-"+chart.pronumeral;
        } else {
	    html=html+expression.coefficient+chart.pronumeral;
        }
	if(expression.constant>0) {
	    html=html+"+"+expression.constant;
	} else if (expression.constant<0) {
	    html=html+expression.constant;
        }
    }
    return html;
}



function algParse(text, pronumeral)
{
    // parse a text string and extract squarecoefficient, coefficient and constant for a quadratic expression in x
    // split into terms by breaking before each + or -
    // if a term has a pronumeral read its coefficient and
    // -- if it has ^2 save it as squarecoefficient otherwise as coefficient
    // otherwise treat it as constant.
    var e = { squarecoefficient: 0, coefficient: 0, constant: 0};
    var sign, mag;
    sign=1;
    mag=0;
    text=text.replace(new RegExp(" ", 'g'),"");
    text=text.replace(new RegExp("-", 'g'),"+-");
    text=text.replace(new RegExp("^\\\\left\\(", 'g'),"");
    text=text.replace(new RegExp("\\\\right\\)$", 'g'),"");
    terms=text.split("+");
    for(i=0; i<terms.length; i++) {
	if(terms[i]!="") {
	    if(terms[i]==pronumeral+"^2") {
		e.squarecoefficient=1;
	    } else if(terms[i]=="-"+pronumeral+"^2") {
		e.squarecoefficient=-1;
	    } else if(terms[i]==pronumeral) {
		e.coefficient=1;
	    } else if(terms[i]=="-"+pronumeral) {
		e.coefficient=-1;
	    } else {
		var numpart=terms[i].match("^-?[0-9]*");
		if(terms[i].search(pronumeral+"\\^2$")>-1) {
		    e.squarecoefficient=new Number(numpart);
		} else if(terms[i].search(pronumeral+"$")>-1) {
		    e.coefficient=new Number(numpart);
		} else {
		    e.constant=new Number(numpart);
		}
	    }
	}
    }
    return e;
}

function algCompare(element, n)
{
    var input=algParse(element, n.pronumeral);
    return (input.coefficient==n.coefficient && input.constant==n.constant && input.squarecoefficient==n.squarecoefficient);
}

// function algebraAnswerTable(chart)
// We make the multiplication answer table serve for this ... checking will need to take into account both

// similarly  algebraBlankBodyTable(chart) and algebraPuzzleTable(chart)
// we make sure the .value associated with chartRow[r][c] is the text version using algToText

function blankAlgChart()
{
    configMQ();
    chart=prepareAlgebraChart();
    chart.chartdiv.appendChild(multiplicationBlankBodyTable(chart));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}

function algPuzzle()
{
    configMQ();
    chart=prepareAlgebraChart();
    chart.chartdiv.appendChild(multiplicationPuzzleTable(chart));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}
