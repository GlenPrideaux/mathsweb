function prepareAlgebraChart()
{
    var chart=setupChart();
    chart.style=styles.LONG;
    chart.compare=algCompare;
    SIZE=3+chart.diff;
    var pronumerals=['a','b','c','d','e','f','g','h','k','m','n','p','q','r','s','t','u','v','w','x','y','z'];
    chart.pronumeral = pronumerals[randBetween(0,pronumerals.length-1)];

    for(r=0; r<SIZE; r++) {
	chart.chartRow[r]=new Array();
	if(r==0) {
	    for(c=1; c<SIZE; c++) {
		chart.chartRow[r][c]= { coefficient : randomTerm(chart.diff), 
					constant : randomTerm(chart.diff),
					solved: false,
					pronumeral: chart.pronumeral };
		chart.chartRow[r][c].nakedValue=algToText(chart.chartRow[r][c], chart);
		chart.chartRow[r][c].value="\\("+chart.chartRow[r][c].nakedValue+"\\)";
	    }
	} else {
	    chart.chartRow[r][0] =  { coefficient : randomTerm(chart.diff), 
				      constant : randomTerm(chart.diff),
				      solved: false,
				      pronumeral: chart.pronumeral };
	    chart.chartRow[r][0].nakedValue=algToText(chart.chartRow[r][0], chart);
	    chart.chartRow[r][0].value="\\("+chart.chartRow[r][0].nakedValue+"\\)";
	    for(c=1; c<SIZE; c++) {
		chart.chartRow[r][c]= { coefficient : chart.chartRow[r][0].coefficient+chart.chartRow[0][c].coefficient,
					constant : chart.chartRow[r][0].constant+chart.chartRow[0][c].constant,
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
    if(expression.coefficient==0) {
	html=html+expression.constant;
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
// parse a text string and extract coefficient and constant for a linear expression in x
// split into terms by breaking before each + or -
// if a term has a pronumeral read its coefficient
// otherwise treat it as constant.
    var e = { coefficient: 0, constant: 0};
    var sign, mag;
    sign=1;
    mag=0;
    text=text.replace(new RegExp(" ", 'g'),"");
    text=text.replace(new RegExp("-", 'g'),"+-");
    terms=text.split("+");
    for(i=0; i<terms.length; i++) {
	if(terms[i]!="") {
	    if(terms[i]==pronumeral) {
		e.coefficient=1;
	    } else if(terms[i]=="-"+pronumeral) {
		e.coefficient=-1;
	    } else {
		var numpart=terms[i].match("^-?[0-9]*");
		if(terms[i].search(pronumeral+"$")>-1) {
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
    var input=algParse(element.value, n.pronumeral);
    return (input.coefficient==n.coefficient && input.constant==n.constant);
}

// function algebraAnswerTable(chart)
// We make the multiplication answer table serve for this ... checking will need to take into account both

// similarly  algebraBlankBodyTable(chart) and algebraPuzzleTable(chart)
// we make sure the .value associated with chartRow[r][c] is the text version using algToText

function blankAlgChart()
{
    chart=prepareAlgebraChart();
    chart.chartdiv.appendChild(multiplicationBlankBodyTable(chart));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}

function algPuzzle()
{
    chart=prepareAlgebraChart();
    chart.chartdiv.appendChild(multiplicationPuzzleTable(chart));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}
