document.addEventListener('DOMContentLoaded', () => {
    const solveButton = document.getElementById('solveButton');
    const solveAllButton = document.getElementById('solveAllButton');
    const solution = document.getElementById('solution');
    const progressDiv = document.getElementById('progress');
    const target = document.getElementById('target');
    const showProgressiveAttempts = document.getElementById('showProgressiveAttempts');
    const solving = document.getElementById('solving');
    const clearButton = document.getElementById('clear');
    showProgressiveAttempts.addEventListener("change", function () {
        if (showProgressiveAttempts.checked) {
            progressDiv.style.display="block";
        } else {
            progressDiv.style.display="none";
        }
    });
    let worker;

    // TODO: make the clear button abort any in-progress solve.
    
    function startSolving(findAll=false) {
	solveButton.disabled = true;
	solveAllButton.disabled = findAll;
	solving.style.visibility="visible";
	clearButton.disabled = true;
	const numbers=[];
	for(i=0; i<6; i++) {
	    numbers[i]=document.getElementById("n"+i).textContent;
	}
	solution.innerHTML="";
	progressDiv.innerHTML="";
	worker = new Worker("number_worker.js");
	worker.onmessage = function(event) {
	    if(event.data.type=="progress") {
		progress(event.data.expression, event.data.value, event.data.error);
	    } else {
		if(solution.innerHTML=="") solution.innerHTML="<p>"+event.data.solution+"</p>"
		solving.style.visibility="hidden";
		clearButton.disabled = false;
	    }
	}
	worker.postMessage({run:true, n:numbers, t:target.textContent, all:findAll});
    }
    solveButton.addEventListener('click', () => {
	startSolving(false);
    });
    solveAllButton.addEventListener('click', () => {
	startSolving(true);
    });
    solving.addEventListener('click',() => {
	worker.terminate();
	solving.style.visibility="hidden";
	clearButton.disabled = false;
	solveButton.disabled = false;
	solveAllButton.disabled = false;
	progressDiv.innerHTML+="<p>Solving aborted.</p>";
    });
	
    function progress(expression, value, error) {
	const pTag=(error==0)?'<p class="exact">':'<p>';
	if(error == 0)
	    solution.innerHTML+=pTag+expression+"="+value+(error==0?"":" ... "+error+" off.")+"</p>";
	else
	    progressDiv.innerHTML += pTag+expression+"="+value+(error==0?"":" ... "+error+" off.")+"</p>";
	solution.scrollIntoView({ behavior: "smooth", block: "end" });
    }
});
