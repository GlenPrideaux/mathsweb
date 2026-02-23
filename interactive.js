
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
    var input=document.createElement('input');
    input.classList.add('screenOnly');
    input.classList.add('el');
    input.classList.add('incomplete');
    input.setAttribute('autocomplete','off');
    if(style==styles.INTEGER) {
	input.setAttribute("type", "number");
	input.setAttribute("min","1");
	input.setAttribute("max","999");
	input.setAttribute("maxlength","3");
	input.setAttribute("size","3");
	input.setAttribute("step","1");
    } else if(style==styles.FLEX) {
	input.setAttribute("type", "text");
	input.setAttribute("size","5");
    } else {
	input.setAttribute("type", "text");
	input.setAttribute("size","9");
    }
    input.setAttribute("name","i"+thisval.toString());
    input.addEventListener("change", function(){ check(input, thisval, compare); });
    item.appendChild(content);
    item.appendChild(input);
    item.myInput=input;
    return item;
}
function gapItem(grid, thisval, node='div', style=styles.INTEGER, compare=compareValue)
{
    return grid.appendChild(_gapItem(thisval, node, style, compare));
}
function cheatItem(grid, thisval, node='div', style=styles.INTEGER, compare=noop)
{
    var item=_gapItem(thisval, node, style, compare);
    item.myInput.value=thisval;
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
function compareRaw(a,b)
{
    return (parse(a.value).value==b);
}
// note: event is not really an event, it's the HTML input element that changed
function check(event, n, compare=compareValue)
{
    if(event.value=="" || event.value==null) {
	event.classList.remove("good");
	event.classList.remove("bad");
	event.classList.add("incomplete");
    } else {
	event.classList.remove("incomplete");
	if (compare(event, n)) {
	    event.classList.remove("bad");
	    event.classList.add("good");
	    isAllSolved();
	} else {
	    event.classList.remove("good");
	    event.classList.add("bad");
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
    if(! typeof MathJax===undefined) MathJax.Hub.Queue(["Typeset",MathJax.Hub,newChild]);

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
var chartTypes = { MULTIPLICATION: 1, ADDITION: 2, ALGEBRA: 3 };

function chartMode()
{
    // Switch between MultiplicationCharts and AdditionCharts based on the file's name
    var path = window.location.pathname,
	page = (path.split("/").pop()).split(".")[0],
    // default to Multiplication
        chart = { chartType : window.chartTypes.MULTIPLICATION,
		  symbol : "×",
		  operation : function(a,b) { return a*b; },
		  compare : compareValue
		};
    
    // switch to addition if the page name is AdditionCharts
    if(page == "AdditionCharts") {
	chart.chartType = chartTypes.ADDITION;
	(document.getElementById("title")).innerHTML = document.title = "Addition Charts";
	chart.symbol = "+";
	chart.operation = function(a,b) { return a+b; };
    } else if(page == "AlgebraCharts") {
	chart.chartType = chartTypes.ALGEBRA;
	chart.symbol = "+";
	//chart.operation = function(a,b) { return a+b; };
    }
 
    return chart;
}

function randomTerm(diff)
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
    if(rval!=0) return rval;
    else return randomTerm(diff);
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
// disallow zero using tail recursion
    return choices[randBetween(0, choices.length-1)];
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

function blankChart()
{
    chart=prepareMultiplicationChart();
    chart.chartdiv.appendChild(multiplicationBlankBodyTable(chart));
    if(! typeof MathJax===undefined) MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}
function puzzle()
{
    chart=prepareMultiplicationChart();
    chart.chartdiv.appendChild(multiplicationPuzzleTable(chart));
    if(! typeof MathJax===undefined) MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}


function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}








function setupTimesTableChart()
{
    var chart=chartMode();
    chart.size=1+Number(document.getElementsByName("size")[0].value);
    chart.chartRow=[]; // array of objects containing cell values and whether or not a cell is solved
    chart.diff=Number(document.getElementsByName("difficulty")[0].value);

    chart.chartdiv=document.getElementById("chart");
    chart.style=styles.FLEX;
    chart.compare=compareRaw;
    return chart;
}

function prepareTimesTableChart()
{
    chart=setupTimesTableChart();
    for(r=0; r<chart.size; r++) {
	chart.chartRow[r]=new Array();
	if(r==0) {
	    for(c=1; c<chart.size; c++) {
		chart.chartRow[r][c]= { value : c, solved: true, nakedValue: c };
	    }
	} else {
	    chart.chartRow[r][0] =  { value : r, solved: true, nakedValue: r};
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


function ttChart()
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
		    // difficulty ranges between 10 and 80
		    // we want the probability of a number being blank to be distributed such that the size of the product
		    // most likely to be blank is (size*difficulty/100)^2, with higher difficulty having more blanks
		    // but not 8 times as many ... say 3 or 4 times as many. Generate a normally distributed random
		    // number with mean (size*difficulty/100) and s.d. (size/2). If the absolute difference between 
		    // the product and the square of this random number is less than (difficulty+20)/100*w (where w is a
		    // subjectively selected constant) then make a blank
		    var rn=randn_bm()*chart.size/4+chart.size*chart.diff/100;
		    if((Math.sqrt(Math.abs(rn*rn - chart.chartRow[r][c].value))<(50+chart.diff)/100*3)
		       // if diff <= 20 only allow 1, 2, 3, 5 and 10 times
		       && (chart.diff>20 || c<=3||c==5||c==10||r<=3||r==5||r==10)
		       // if diff <=25 also allow 4 times and 11 times
		       && (chart.diff>25 || c==4||r==4||c==11||r==11|| c<=3||c==5||c==10||r<=3||r==5||r==10)
		       // if diff <=30 also allow 9 times
		       && (chart.diff>30 || c==9||r==9||c==4||r==4||c==11||r==11|| c<=3||c==5||c==10||r<=3||r==5||r==10)
		      ) {
			var cell;
			cell=gapItem(row, chart.chartRow[r][c].value, "td", chart.style, chart.compare);
			cell.column=c;
			cell.addEventListener("focusin", (e) => {
			    focusColumn(e.currentTarget,true);
			});
			cell.addEventListener("focusout", (e) => {
			    focusColumn(e.currentTarget,false);
			});

		    } else {
			showItem(row, chart.chartRow[r][c].value, "td", chart.style, chart.compare);
		    }
		}
	    }
	}
	table.appendChild(row);
    }
    return table;
}

function timesTableChart()
{
    chart=prepareTimesTableChart();
    chart.chartdiv.appendChild(ttChart(chart));
    if(! typeof MathJax===undefined) MathJax.Hub.Queue(["Typeset",MathJax.Hub,chart.chartdiv]);
}


function xxx()
{
    var grid=setupGrid(size+1);
    var gapCounter=0;
    chart=prepareMultiplicationChart();

    headingItem(grid, "✖");
    for(thisval = 1; thisval<=size; thisval++) headingItem(grid, thisval);
    for(thisval = 1; thisval<=size; thisval++) {
	headingItem(grid, thisval);
	for(thatval = 1; thatval<=size; thatval++) {
	    product=thisval*thatval;
	    // we want the probability of a number being blank to be distributed such that the size of the product
	    // most likely to be blank is 0.25 * size^2, with higher difficulty having more blanks
	    // so p(blank) is the product of difficulty/100 and p(z<(n-s^2/4)/s^2/2) where z is a random normal score
	    if(randBetween(-10,0)<difficulty && Math.abs(randn_bm()*size*size/4+size*size*difficulty*difficulty/10000 - product)<(1+0.3*difficulty)) {
		gapItem(grid, { value: product }, "div", styles.FLEX);
		gapCounter+=1;
	    } else {
		showItem(grid, product);
	    }
	}
    }
}
function headingItem(grid, thisval, node='div')
{
    var item=document.createElement(node);
    item.classList.add('tableHeading');
    var content = document.createTextNode(thisval.toString());
    item.appendChild(content);
    grid.appendChild(item);
}






