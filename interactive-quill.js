/* This is a straight copy of interactive.js but adapted to use MathQuill for inputs
 */

function randBetween(from,to)
{
  return Math.floor(Math.random()*(to-from+1)+from);
}

// clear the contents by replacing the node with an empty clone, then set up column template
function setupGrid(columns)
{
    var grid = document.getElementById("chart");
    var template="";
    for(i=0; i<columns; i++) template = template+"auto ";
    var cGrid = grid.cloneNode(false);
    cGrid.style.gridTemplateColumns = template;
    grid.parentNode.replaceChild(cGrid, grid);
    return cGrid;
}
function getRadio(name)
{
    var radios=document.getElementsByName(name);
    var rval=1;
    for (var i = 0, length = radios.length; i < length; i++) {
	if (radios[i].checked) {
            rval=Number(radios[i].value);
	    break;
	}
    }
    return rval;
}
var chartTypes = { MULTIPLICATION: 1, ADDITION: 2, ALGEBRA: 3 };

function missingNumberChart()
{
    var skip=Number(document.getElementsByName("skip")[0].value);
    var direction=getRadio("direction");
    var doRandom=getRadio("random");
    var rows=Number(document.getElementsByName("rows")[0].value);
    var columns=Number(document.getElementsByName("columns")[0].value);
    var smallest=Number(document.getElementsByName("smallest")[0].value);
    var gaps=Number(document.getElementsByName("gaps")[0].value);
    var minval = smallest;
    var maxval = smallest+((rows*columns-1)*skip);
    var step = skip*direction;
    var grid=setupGrid(columns);
    var counter=randBetween(0,10/gaps);
    var gapCounter=0;
    for(thisval = direction<0?maxval:minval; direction<0?(thisval>=minval):(thisval<=maxval); thisval+=step) {
	counter+=1;
	if(doRandom?(randBetween(0,9)<gaps):((gapCounter+1)/counter*10<=gaps)) {
	    if(thisval > minval && thisval < maxval)
		gapItem(grid, { value: thisval });
	    else
		showItem(grid, thisval);
	    gapCounter+=1;
	} else {
	    showItem(grid, thisval);
	}
    }
}
var styles={INTEGER: 0, FLEX: 1, LONG: 2}

function showItem(grid, thisval, node='div')
{
    var item=document.createElement(node);
    item.classList.add('el');
    var content = document.createTextNode(thisval.toString());
    item.appendChild(content);
    grid.appendChild(item);
}
function _gapItem(thisval, node, style, compare)
{
    var item=document.createElement(node);
    item.classList.add('el');
    if(chart.chartType == chartTypes.ALGEBRA) item.classList.add('algebra');
    var content = document.createElement('span');
    content.appendChild(document.createTextNode("__"));
    content.classList.add('printOnly');
    var input=document.createElement('span');
    input.classList.add('screenOnly');
    input.classList.add('el');
    input.classList.add('incomplete');
    input.setAttribute('autocomplete','off');
    //input.setAttribute("name","i"+thisval.toString());
    input.setAttribute("width","80px");
    item.appendChild(content);
    var mathInput=MQ.MathField(input);
    mathInput.config( {
	handlers: {
	    enter: function() { check(mathInput, input, thisval, compare); },
	    edit: function() { check(null, input, thisval, compare); },
	} } );
    // haven't been able to work out how to detect when the MathQuill input loses focus ...
    //    input.addEventListener("blur", function(){ check(mathInput, input, thisval, compare); });
    // focusout should bubble up to the container, the item, where we can process it ...
    item.addEventListener("focusout", function(){ check(mathInput,input, thisval, compare); });
    item.appendChild(input);
    item.myInput=mathInput;
    return item;
}
function gapItem(grid, thisval, node='div', style=styles.INTEGER, compare=compareValue)
{
    return grid.appendChild(_gapItem(thisval, node, style, compare));
}
function cheatItem(grid, thisval, node='div', style=styles.INTEGER, compare=noop)
{
    var item=_gapItem(thisval, node, style, compare);
    item.myInput.latex(thisval);
    grid.appendChild(item);
    return item;
}

function noop(a,b)
{
    return true;
}
function compareValue(a,b)
{
    return (parse(a.value).value==b.value);
}
// note: event is not really an event, it's the HTML input element that changed
function check(event, field, n, compare=compareValue)
{
    if(event==null || event.latex()=="") {
	field.classList.remove("good");
	field.classList.remove("bad");
	field.classList.add("incomplete");
    } else {
	field.classList.remove("incomplete");
	if (compare(event.latex(), n)) {
	    field.classList.remove("bad");
	    field.classList.add("good");
	    isAllSolved();
	} else {
	    field.classList.remove("good");
	    field.classList.add("bad");
	}
    }
}

function isAllSolved()
{
    var incomplete = document.getElementsByClassName("incomplete");
    if(incomplete.length>0) return;
    incomplete = document.getElementsByClassName("bad");
    if(incomplete.length>0) return;
    
    // congratulate with a modal dialog
    modalOn();
    return;
}

function parse(text)
{
// parse a text string and extract constant
    return { value : new Number(text) };
}



var cheatTemp;
function cheatOn(chart)
{
    cheatTemp=document.getElementById("chartTable");
    var parent = cheatTemp.parentNode;
    var newChild = multiplicationAnswerTable(chart);
    parent.replaceChild(newChild,cheatTemp);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,newChild]);

}
function blankCheatOff()
{
    var answerTable=document.getElementById("chartTable");
    var parent=answerTable.parentNode;
    parent.replaceChild(cheatTemp, answerTable);
}

function modalOff()
{
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
}

function modalOn()
{
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
}

function setupModal()
{
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = modalOff;

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
	if (event.target == document.getElementById('myModal')) {
            modalOff();
	}
    }
}

setupModal();


/* multiplicationCharts code */

function chartMode()
{
    // Switch between MultiplicationCharts and AdditionCharts based on the file's name
    var path = window.location.pathname,
	page = (path.split("/").pop()).split(".")[0],
    // default to Multiplication
        chart = { chartType : chartTypes.MULTIPLICATION,
		  symbol : "\\( \\times \\)",
		  operation : function(a,b) { return a*b; },
		  compare : compareValue
		};
    
    // switch to addition if the page name is AdditionCharts
    if(page == "AdditionCharts") {
	chart.chartType = chartTypes.ADDITION;
	(document.getElementById("title")).innerHTML = document.title = "Addition Charts";
	chart.symbol = "\\( + \\)";
	chart.operation = function(a,b) { return a+b; };
    } else if(page == "AlgebraCharts") {
	chart.chartType = chartTypes.ALGEBRA;
	chart.symbol = "\\( + \\)";
	//chart.operation = function(a,b) { return a+b; };
    }
 
    return chart;
}

function randomTerm(diff, nz=true)
{
    var rval;
    switch(diff) {
    case 2:
	rval= randBetween(0,10)+randBetween(-5,10);
	break;
    case 3:
	rval= randBetween(-10,10)+randBetween(-10,10);
	break;
    case 1:
    default:
	rval= randBetween(0,10);
	break;
    }
// disallow zero using tail recursion
    if(rval!=0 || !nz)
        return rval;
    else
	return randomTerm(diff);
}

// randomCoeff -- for multiplication charts, we make the coefficient 0 or 1 for the first level of difficulty
// -1, 0 or 1 for the second level,
// and any number between -10 and 10 for the third
function randomCoeff(diff)
{
    var rval;
    switch(diff) {
    case 2:
	choices = [ -1, -1, -1, 0, 1, 1, 1, 1, 1 ];
	break;
    case 3:
	choices = [ -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
	break;
    case 1:
    default:
	choices = [ 0, 1, 1, 1, 1, 1 ];
	break;
    }
// we don't disallow zero
    return choices[randBetween(0, choices.length-1)];
}
function randomLinear(diff)
{
    rv={coefficient:0, constant:0};
    while(rv.coefficient==0 && rv.constant==0) {
	rv.coefficient=randomCoeff(diff);
	rv.constant=randomTerm(diff,false);
    }
    return rv;
}
var rc = {
    COLUMNS: 1,
    ROWS: 2
};

// extract a column of a 2D matrix.
function getCol(matrix, col){
    var column = [];
    for(var i=0; i<matrix.length; i++){
        column.push(matrix[i][col]);
    }
    return column;
}

// check whether duplicate values exist in row or column headings
function hasDupes(chartRow, rowsOrColumns)
{
    var headings,
	i,
	len,
	lastval;
    // get row or column headings
    if (rowsOrColumns == rc.COLUMNS) {
	headings = chartRow[0];
    } else {
	headings = getCol(chartRow,0);
    }
    len=headings.length;
    // we must have length of at least 3 in order to have dupes
    // (since headings[0] is unused)
    if(len<3) return false;

    // because we reject an entry if it's a duplicate, the only
    // place a duplicated entry can exist is at the end of the list,
    // so we don't need to do anything very clever.
    lastval = headings[len-1].value;
    // for each heading excluding the last,
    //   check to see if its value = lastval,
    //   if so, we have dupes
    for (i=1;i<len-1;i++) {
	if(headings[i].value == lastval) { return true; }
    }
    return false;
}

function setupChart()
{
    var chart=chartMode();
    chart.size=4; // size of the (square) grid
    chart.chartRow=[]; // array of objects containing cell values and whether or not a cell is solved
    chart.diff=getRadio("difficulty");
    chart.size=3+chart.diff;

    chart.chartdiv=document.getElementById("chart");
    chart.style=styles.FLEX;
    chart.compare=compareValue;
    return chart;
}

function prepareMultiplicationChart()
{
    chart=setupChart();
    for(r=0; r<chart.size; r++) {
	chart.chartRow[r]=new Array();
	if(r==0) {
	    for(c=1; c<chart.size; c++) {
		do {
		    chart.chartRow[r][c]= { value : randomTerm(chart.diff), solved: false };
		    chart.chartRow[r][c].nakedValue=chart.chartRow[r][c].value;
		} while (hasDupes(chart.chartRow,rc.COLUMNS));
	    }
	} else {
	    do {
		chart.chartRow[r][0] =  { value : randomTerm(chart.diff), solved: false};
		chart.chartRow[r][0].nakedValue=chart.chartRow[r][0].value;
	    } while (hasDupes(chart.chartRow, rc.ROWS));
	    for(c=1; c<chart.size; c++) {
		chart.chartRow[r][c]= {
		    value : chart.operation(chart.chartRow[r][0].value, chart.chartRow[0][c].value),
		    solved : false
		};
		chart.chartRow[r][c].nakedValue=chart.chartRow[r][c].value;
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

function toText(expression)
{
    html="\(";
    html=html+expression.value;
    html=html+"\)";
    return html;
}

function focusColumn(cell,f)
{
    // what is the column number of the current cell?
    var n=cell.column;
    // find the enclosing table
    var p=cell.parentElement;
    while(p.nodeName!='TABLE') p=p.parentElement;
    // find the colgroup
    var cg=p.firstElementChild;
    while(cg.nodeName!='COLGROUP') cg=cg.nextElementSibling;
    var c=cg.firstElementChild
    // select the nth column
    for(i=0; i<n; i++) c=c.nextElementSibling;
    // if f add focus to the classList, otherwise remove it
    if(f) c.classList.add('focus');
    else c.classList.remove('focus');
}
function makeColgroup(n)
{
    var colgroup=document.createElement('colgroup');
    for(c=0; c<n; c++) {
	var col=document.createElement('col');
	col.id="c"+c
	colgroup.appendChild(col);
    }
    return colgroup;
}


function multiplicationAnswerTable(chart)
{
    var table=document.createElement('table');
    table.id="chartTable";
    var colgroup=makeColgroup(chart.size);
    table.appendChild(colgroup)

    for(r=0; r<chart.size; r++) {
	var row = document.createElement('tr');
	row.addEventListener("focusin", (e) => {
	    e.currentTarget.classList.add('focus');
	});
	row.addEventListener("focusout", (e) => {
	    e.currentTarget.classList.remove('focus');
	});
	for(c=0; c<chart.size; c++) {
	    if(r==0 && c==0) {
		var cell = document.createElement('th');
		cell.addEventListener("mouseup", blankCheatOff);
		cell.appendChild(document.createTextNode(chart.symbol));
		row.appendChild(cell);
	    } else {
		var node=(c==0 || r==0)?'th':'td';
		if(chart.chartRow[r][c].visible) {
		    showItem(row, chart.chartRow[r][c].value, node);
		} else {
		    cheatItem(row, chart.chartRow[r][c].nakedValue, node, chart.style);
		}
	    }
	}
	table.appendChild(row);
    }
    return table;
}

function multiplicationBlankBodyTable(chart)
{
    var table=document.createElement('table');
    table.id="chartTable";
    var colgroup=makeColgroup(chart.size);
    table.appendChild(colgroup)

    for(r=0; r<chart.size; r++) {
	var row = document.createElement('tr');
	row.addEventListener("focusin", (e) => {
	    e.currentTarget.classList.add('focus');
	});
	row.addEventListener("focusout", (e) => {
	    e.currentTarget.classList.remove('focus');
	});

	if(r==0) {
	    for(c=0; c<chart.size; c++) {
		if(c==0) {
		    var cell = document.createElement('th');
		    cell.addEventListener("mousedown", function(){ cheatOn(chart); });
		    cell.appendChild(document.createTextNode(chart.symbol));
		    row.appendChild(cell);
		} else {
		    showItem(row, chart.chartRow[r][c].value, 'th');
		    chart.chartRow[r][c].solved=true;
		    chart.chartRow[r][c].visible=true;
		}
	    }
	} else {
	    for(c=0; c<chart.size; c++) {
		if(c==0) {
		    showItem(row, chart.chartRow[r][c].value, 'th');
		    chart.chartRow[r][c].solved=true;
		    chart.chartRow[r][c].visible=true;
		} else {
		    var cell;
		    cell=gapItem(row, chart.chartRow[r][c], "td", chart.style, chart.compare);
		    cell.column=c;
		    cell.addEventListener("focusin", (e) => {
			focusColumn(e.currentTarget,true);
		    });
		    cell.addEventListener("focusout", (e) => {
			focusColumn(e.currentTarget,false);
		    });
		}
	    }
	}
	table.appendChild(row);
    }
    return table;
}

function multiplicationPuzzleTable(chart)
{
// start at r0 and random c, put in the value.
// then random undetermined r in that same c, put in the value.
// then random undetermined c in that r, put in the value,
// and so on until every r and c is determined.
// (sometimes start at c0 and random r instead)
    var undeterminedRow=new Array();
    var undeterminedCol=new Array();
    for(i=0; i<chart.size;i++) {
	undeterminedRow[i]=i;
	undeterminedCol[i]=i;
    }
    var rc=randBetween(0,1); // 0 for row, 1 for col
    currentRow=0;
    currentCol=0;
    for(i=0; i<2*chart.size-2; i++) {
	if(rc) {
	    rc=0;
	    var col=randBetween(1,undeterminedCol.length-1);
//	    document.write("c:"+col+"/"+undeterminedCol.length+",");
	    currentCol=undeterminedCol[col];
	    undeterminedCol.splice(col,1);
	    chart.chartRow[currentRow][currentCol].visible=true;
	} else {
	    rc=1;
	    var row=randBetween(1,undeterminedRow.length-1);
//	    document.write("r:"+row+"/"+undeterminedRow.length+",");
	    currentRow=undeterminedRow[row];
	    undeterminedRow.splice(row,1);
	    chart.chartRow[currentRow][currentCol].visible=true;
	}
    }

    var table=document.createElement('table');
    table.id="chartTable";
    var colgroup=makeColgroup(chart.size);
    table.appendChild(colgroup)

    for(r=0; r<chart.size; r++) {
	var row = document.createElement('tr');
	row.addEventListener("focusin", (e) => {
	    e.currentTarget.classList.add('focus');
	});
	row.addEventListener("focusout", (e) => {
	    e.currentTarget.classList.remove('focus');
	});
	for(c=0; c<chart.size; c++) {
	    if(r==0 && c==0) {
		var cell = document.createElement('th');
		cell.addEventListener("mousedown", function(){ cheatOn(chart); });
		cell.appendChild(document.createTextNode(chart.symbol));
		row.appendChild(cell);
	    } else {
		var node=(c==0 || r==0)?'th':'td';
		if(chart.chartRow[r][c].visible) {
		    showItem(row, chart.chartRow[r][c].value, node);
		    chart.chartRow[r][c].solved=true;
		} else {
		    var cell;
		    cell=gapItem(row, chart.chartRow[r][c], node, chart.style, chart.compare);
		    cell.column=c;
		    cell.addEventListener("focusin", (e) => {
			focusColumn(e.currentTarget,true);
		    });
		    cell.addEventListener("focusout", (e) => {
			focusColumn(e.currentTarget,false);
		    });
		}
	    }
	}
	table.appendChild(row);
    }
    return table;
}

function configMQ()
{
    MQ.config({
	restrictMismatchedBrackets: true,
	charsThatBreakOutOfSupSub: '+-)',
	spaceBehavesLikeTab: true,
	supSubsRequireOperand: true,
	maxDepth: 1,
	handlers: {
//	    edit: function(mathField) { ... },
//	    upOutOf: function(mathField) { ... },
//	    moveOutOf: function(dir, mathField) { if (dir === MQ.L) ... else ... }
	}
    });
}
function blankChart()
{
    configMQ();
    chart=prepareMultiplicationChart();
    chart.chartdiv.appendChild(multiplicationBlankBodyTable(chart));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}
function puzzle()
{
    configMQ();
    chart=prepareMultiplicationChart();
    chart.chartdiv.appendChild(multiplicationPuzzleTable(chart));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}








