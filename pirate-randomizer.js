document.addEventListener('DOMContentLoaded', () => {
  class ItemDeck {
    constructor() {
      this.deck=[];
    }
    push(...args) {
      this.deck.push(...args);
    }
    shuffle() {
      for (let i = this.deck.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
	
        // Swap elements at index i and index j
	if(j!=i) [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    }
    item(i) {
      return this.deck[i];
    }
    length() {
      return this.deck.length;
    }
  }

  const itemDeck=new ItemDeck;
  class GridItem {
    constructor(name, image, text, number, tick, description) {
      this.name=name;
      this.image=image;
      this.text=text;
      this.number=number;
      this.tick=tick;
      this.description = description;
      itemDeck.push(...Array(number).fill(this));
    }
    html() {
      if(this.image != null) {
	return `<img src="${this.image}" class="icon"/>`;
      } else {
	return '<div>'+this.text+'</div>';
      }
    }
  }

  // set up the item deck and the option key
  itemList=[
    new GridItem('rob', 'pirate/ship.png', null, 1, true, "Rob someone's points"),
    new GridItem('kill', 'pirate/kill.png', null, 1, true, "Kill someone"),
    new GridItem('gift', 'pirate/gift.png', null, 1, true, "Gift someone 1000 points"),
    new GridItem('skull', 'pirate/skull.png', null, 1, true, "Disaster: Apply class rule"),
    new GridItem('swap', 'pirate/swap.png', null, 1, true, "Swap scores"),
    new GridItem('choose', 'pirate/choose.png', null, 1, true, "Choose next square"),
    new GridItem('shield', 'pirate/shield.png', null, 1, false, "Shield: block the bad"),
    new GridItem('mirror', 'pirate/mirror.png', null, 1, false, "Mirror: reflect the bad"),
    new GridItem('bomb', 'pirate/bomb.png', null, 1, false, "Bomb: YOU go to zero"),
    new GridItem('x2', 'pirate/double.png', null, 1, false, "Double your score"),
    new GridItem('bank', 'pirate/bank.png', null, 1, false, "Bank your score"),
    new GridItem('5000', null, '5000', 1, false, "5000 points"),
    new GridItem('3000', null, '3000', 2, false, "3000 points"),
    new GridItem('1000', null, '1000', 10, false, "1000 points"),
    new GridItem('200', null, '200', 25, false, "200 points")
  ];


  class Grid {
    setup() {
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
	  cell.innerHTML=itemDeck.item(i*7+j-8).html();
	  
	  row.appendChild(cell);
        }
        tableBody.appendChild(row);
      }
    }
  }

  class Key {
    generate() {
      const tableBody = document.querySelector('#keyTable tbody');
      for(let item of itemList) {
	if(item.image != null) {
	  const row=document.createElement('tr');
	  const tickCell=document.createElement('td');
	  if(item.tick) {
	    tickCell.textContent = '✔';
	    tickCell.style.fontSize="200%";
	    tickCell.style.color="red";
	  }
	  const imageCell=document.createElement('td');
	  imageCell.innerHTML=item.html();
	  const descriptionCell=document.createElement('td');
	  descriptionCell.textContent=item.description;
	  row.appendChild(tickCell);
	  row.appendChild(imageCell);
	  row.appendChild(descriptionCell);
	  tableBody.appendChild(row);
	}
      }
    }
  }

  const grid=new Grid;
  const key=new Key;
  
  itemDeck.shuffle();
  grid.setup();
  key.generate();

});
