function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("posx", ev.offsetX);
    ev.dataTransfer.setData("posy", ev.offsetY);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var tile=document.getElementById(data);
    ev.currentTarget.appendChild(tile);
    tile.style.position="static";
    check();
    ev.cancelBubble = true;
}
function bodydrop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var pos = {x:ev.dataTransfer.getData("posx"), y:ev.dataTransfer.getData("posy")};
    var tile=document.getElementById(data);
    ev.currentTarget.appendChild(tile);
    tile.style.position="absolute";
    tile.style.top=(ev.y-pos.y).toString()+"px";
    tile.style.left=(ev.x-pos.x).toString()+"px";
    check();
}


// generate a random non-negative integer less than n
function randInt(n) {
    return Math.floor(Math.random()*n);
}

// return the digits 1 to 9 in random order.
function shuffle() {
    const grid=[];
    const digits=[1,2,3,4,5,6,7,8,9];
    while(digits.length>0) {
	var item=randInt(digits.length);
	grid.push(digits[item]);
	digits.splice(item,1);
    }
    return grid;
}

// locations to place n clues
function cluePlaces(n) {
    const places=new Array(9);
    places.fill(false);
    const slots=[0,1,2,3,4,5,6,7,8];
    for(var clue=0; clue<n; clue++) {
	var item=randInt(slots.length);
	places[slots[item]]=true;
	slots.splice(item,1);
    }
    return places;
}

function calcTotal(a,b,c) {
    return operate(operate(a,b),c);
}
function buildTable(grid) {
    const nClues=randInt(3)+2;
    const places=cluePlaces(nClues);
    const binNumbers=new Array(9);
    binNumbers.fill(false);
    var maintable=document.getElementById("maintable");
    for(var row=0; row<3; row++) {
	if(row>maintable.rows.length) maintable.insertRow(row);
	var thisrow=maintable.rows[row];
	for(var cell=0; cell<3; cell++) {
	    if(cell>thisrow.cells.length) thisrow.insertCell(cell);
	    var thiscell=thisrow.cells[cell];
	    if(places[row*3+cell])
		thiscell.innerHTML=grid[row*3+cell];
	    else {
		binNumbers[grid[row*3+cell]-1]=true;
		thiscell.ondrop=function(event){drop(event);};
		thiscell.ondragover=function(event){allowDrop(event);};
	    }
	}
	if(3>thisrow.cells.length) thisrow.insertCell(3);
	var thiscell=thisrow.cells[3];
	var total=calcTotal(grid[row*3+0],grid[row*3+1],grid[row*3+2]);
	thiscell.innerHTML=total;
    }
    if(3>maintable.rows.length) maintable.insertRow(3);
    var thisrow=maintable.rows[3];
    for(var cell=0; cell<3; cell++) {
	if(cell>thisrow.cells.length) thisrow.insertCell(cell);
	var thiscell=thisrow.cells[cell];
	var total=calcTotal(grid[0*3+cell],grid[1*3+cell],grid[2*3+cell]);
	thiscell.innerHTML=total;
    }
    var bin=document.getElementById("bin");
    for(var entry=0; entry<9; entry++) {
	if(binNumbers[entry]) {
	    var tile=document.createElement("div");
	    var content=document.createTextNode(entry+1);
	    tile.appendChild(content);
	    tile.classList.add("tile");
	    tile.id=entry+1;
	    tile.draggable=true;
	    tile.ondragstart=function(event) { drag(event); };
	    bin.appendChild(tile);
	}
    }
}

function rowSum(r) {
    var maintable=document.getElementById("maintable");
    var sum=identity;
    for(var c=0; c<3; c++) {
	if(maintable.rows[r].cells[c].textContent>"")
	    sum=operate(sum,Number(maintable.rows[r].cells[c].textContent));
    }
    return sum==Number(maintable.rows[r].cells[3].textContent);
}
function colSum(c) {
    var maintable=document.getElementById("maintable");
    var sum=identity;
    for(var r=0; r<3; r++) {
	if(maintable.rows[r].cells[c].textContent>"")
	    sum=operate(sum,Number(maintable.rows[r].cells[c].textContent));
    }
    return sum==Number(maintable.rows[3].cells[c].textContent);
}

function check() {
    var maintable=document.getElementById("maintable");
    if( rowSum(0) && rowSum(1) && rowSum(2) &&
	colSum(0) && colSum(1) && colSum(2) ) {
	maintable.classList.add("done");
    } else {
	maintable.classList.remove("done");
    }
}

document.addEventListener("DOMContentLoaded", function(){
     buildTable(shuffle());
});

