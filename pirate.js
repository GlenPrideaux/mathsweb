document.addEventListener('DOMContentLoaded', () => {
    const crossOutButton = document.getElementById('crossOutButton');
    const randomSelectButton = document.getElementById('randomSelectButton');
    const addNameButton = document.getElementById('addNameButton');
    const resetButton = document.getElementById('resetButton');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    const crossedOutList = document.getElementById('crossedOutList');
    const nameInput = document.getElementById('nameInput');
    const nameList = document.getElementById('nameList');

    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertButton = document.getElementById('closeAlertButton');

    const undoStack = [];
    const redoStack = [];

    // Function to show a custom alert
    function showAlert(message) {
        alertMessage.textContent = message;
        alertBox.style.display = 'block';
    }

    closeAlertButton.addEventListener('click', () => {
        alertBox.style.display = 'none';
    });

        // Show custom confirm
    function showConfirm(message, callback) {
        confirmMessage.textContent = message;
        confirmBox.style.display = 'block';

        confirmYesButton.onclick = () => {
            confirmBox.style.display = 'none';
            callback(true); // Execute callback with true
        };

        confirmNoButton.onclick = () => {
            confirmBox.style.display = 'none';
            callback(false); // Execute callback with false
        };
    }

    // Function to cross out a cell programmatically
    function crossOutCell(cell, coordinate, isRandom = false) {
	if (!cell.classList.contains('crossed')) {
            cell.classList.add('crossed');
            if (isRandom) {
		cell.style.backgroundColor = 'lightblue'; // Highlight for random selection
            } else {
		cell.style.backgroundColor = ''; // Clear any random highlighting
            }
	    
            // Add the coordinate to the crossed out list
            const listItem = document.createElement('div');
            listItem.textContent = coordinate;
            crossedOutList.appendChild(listItem);
	    
            // Add action to undo stack
            addToHistory({ type: 'crossOut', cellId: cell.id, coordinate, isRandom });
	}
    }

    function setupGrid() {
	// Set up the grid dynamically
	const tableBody = document.querySelector('#pirateTable tbody');
	for (let i = 1; i <= 7; i++) {
            const row = document.createElement('tr');
            const rowHeader = document.createElement('th');
            rowHeader.textContent = i;
            row.appendChild(rowHeader);
            for (let j = 1; j <= 7; j++) {
		const cell = document.createElement('td');
		const col = String.fromCharCode(64 + j);
		const coordinate = `${col}${i}`
		cell.id = `${i}-${col}`; // E.g., "1-A"
		// Add click event listener to the cell
		cell.addEventListener('click', () => {
                    crossOutCell(cell, coordinate, false);
		});

		row.appendChild(cell);
            }
            tableBody.appendChild(row);
	}
    }

    setupGrid();

    // Helper function to add actions to undo stack
    function addToHistory(action) {
        undoStack.push(action);
        redoStack.length = 0; // Clear redo stack when new action is performed
	undoButton.disabled=false;
	redoButton.disabled=true;
	resetButton.disabled=false;
    }

    // Undo functionality
    function undo() {
        if (!undoStack.length) return;

        const action = undoStack.pop();
        redoStack.push(action);
	redoButton.disabled=false;
	undoButton.disabled=(undoStack.length==0);

        switch (action.type) {
            case 'crossOut':
                const cell = document.getElementById(action.cellId);
                cell.classList.remove('crossed');
                cell.style.backgroundColor = ''; // Remove light blue for random selections
                const last = Array.from(crossedOutList.children).pop();
                if (last) crossedOutList.removeChild(last);
                break;

            case 'addName':
                const lastName = Array.from(nameList.children).pop();
                if (lastName) nameList.removeChild(lastName);
                break;

            case 'reset':
                redoStack.pop(); // Prevent reset from replaying
                resetGame(false);
                break;

            case 'crossOutName':
                const nameItem = action.name;
            nameItem.classList.remove('crossed');
                break;
        }
    }

    // Redo functionality
    function redo() {
        if (!redoStack.length) return;

        const action = redoStack.pop();
        undoStack.push(action);
	undoButton.disabled=false;
	redoButton.disabled=(redoStack.length==0);

	
        switch (action.type) {
            case 'crossOut':
                const cell = document.getElementById(action.cellId);
                cell.classList.add('crossed');
                cell.style.backgroundColor = action.isRandom ? 'lightblue' : ''; // Restore light blue for random
                const square = document.createElement('div');
                square.textContent = action.coordinate;
                crossedOutList.appendChild(square);
                break;

            case 'addName':
                const nameDiv = document.createElement('li');
                nameDiv.textContent = action.name;
                nameDiv.style.cursor = 'pointer';
                nameDiv.addEventListener('click', () => {
                    crossOutName(nameDiv);
                });
                nameList.appendChild(nameDiv);
                break;

            case 'reset':
                resetGame(true);
                break;

            case 'crossOutName':
                const nameToCross = action.name;
            if (nameToCross) {
		nameToCross.classList.add('crossed');
                }
                break;
        }
    }

    // Function to reset the game
    function resetGame(track = true) {
        //if (track) addToHistory({ type: 'reset' });
        document.querySelectorAll('#pirateTable td').forEach(cell => {
            cell.classList.remove('crossed');
            cell.style.backgroundColor = ''; // Clear all backgrounds
        });
        crossedOutList.innerHTML = '';
        nameList.innerHTML = '';
	redoStack.length = 0;
	undoStack.length = 0;
	undoButton.disabled=true;
	redoButton.disabled=true;
	resetButton.disabled=true;
    }

    // Handle "Cross Out" button
    crossOutButton.addEventListener('click', () => {
        const row = document.getElementById('row').value;
        const col = document.getElementById('column').value.toUpperCase();
        const cellId = `${row}-${col}`;
        const cell = document.getElementById(cellId);

        if (cell && !cell.classList.contains('crossed')) {
            cell.classList.add('crossed');
            const coordinate = `${col}${row}`;
            const listItem = document.createElement('div');
            listItem.textContent = coordinate;
            crossedOutList.appendChild(listItem);

            addToHistory({ type: 'crossOut', cellId, coordinate, isRandom: false });
        } else {
            showAlert('This cell is already crossed out.');
        }
    });

    // Handle "Randomly Select Square" button
    randomSelectButton.addEventListener('click', () => {
        const table = document.getElementById('pirateTable');
        const cells = Array.from(table.querySelectorAll('td')).filter(cell => !cell.classList.contains('crossed'));

        if (cells.length === 0) {
            showAlert('No uncrossed cells remaining!');
            return;
        }

        const randomCell = cells[Math.floor(Math.random() * cells.length)];
        const [row, col] = randomCell.id.split('-');
        randomCell.classList.add('crossed');
        randomCell.style.backgroundColor = 'lightblue'; // Highlight with light blue for random selection

        const coordinate = `${col}${row}`;
        const listItem = document.createElement('div');
        listItem.textContent = coordinate;
        crossedOutList.appendChild(listItem);

        addToHistory({ type: 'crossOut', cellId: randomCell.id, coordinate, isRandom: true });
    });

    // Handle "Add Name" button
    function addName() {
        const name = nameInput.value.trim();
        if (name) {
            const listItem = document.createElement('li');
            listItem.textContent = name;
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => {
                crossOutName(listItem);
            });
            nameList.appendChild(listItem);

            addToHistory({ type: 'addName', name });
            nameInput.value = '';
        }
    }

    addNameButton.addEventListener('click', addName);

    // Handle pressing Enter in the name input
    nameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior
            addName(); // Call the addName function
        }
    });

    // Function to cross out a name
    function crossOutName(item) {
	item.classList.add("crossed");
        addToHistory({ type: 'crossOutName', name: item });
    }

    // Handle "Reset" button
    resetButton.addEventListener('click', () => {
        showConfirm('Are you sure you want to reset?', (confirmed) => {
            if (confirmed) {
                resetGame();
            }
        });
    });

    // Handle "Undo" button
    undoButton.addEventListener('click', undo);

    // Handle "Redo" button
    redoButton.addEventListener('click', redo);
});
