/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
document.addEventListener('DOMContentLoaded', function() {

  //my color selection  - mix of a lot of google, chatgpt to fix errors and help turn to hex and check if color can show on picker
  const player1ColorString = document.getElementById('player1ColorString');
  const player2ColorString = document.getElementById('player2ColorString');
  const player1Color= document.getElementById('player1Color');
  const player2Color = document.getElementById('player2Color');

  player1Color.addEventListener('input', function() {
    player1Color.value = player1Color.value;
  });
  player1ColorString.addEventListener('input', function () {
    if(isValidColor(player1ColorString.value)) {
      player1Color.value = colorToHex(player1ColorString.value);
    }
  });

  player2Color.addEventListener('input', function() {
    player2Color.value = player2Color.value;
  });
  player2ColorString.addEventListener('input', function () {
    if(isValidColor(player2ColorString.value)) {
      player2Color.value = colorToHex(player2ColorString.value);
    }
  });
  // Utility function to check if a color name or hex code is valid
  function isValidColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
  }

  // Utility function to convert color names to hex (if possible)
  function colorToHex(color) {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = color;
      return ctx.fillStyle;
  }
 
  //now handle game start
  document.getElementById('gameStartButton').addEventListener('click', function() {
    //get p1 color
    let p1 = player1Color.value;
    //get p2 color
    let p2 = player2Color.value;
    new Game(p1, p2);
  });

  class Game {
    constructor(p1, p2, height = 6, width = 7) {
      this.players = [{color: p1, player: 1 },{color: p2, player: 2}]; 
      this.currPlayer = this.players[0];
      this.width = width;
      this.height = height;
      history.board = [];

      this.makeBoard();
      this.makeHtmlBoard();
      this.gameOver = false;
    }

    /** makeBoard: create in-JS board structure:
     *   board = array of rows, each row is array of cells  (board[y][x])
     */

    makeBoard() {
      this.board = [];
      for (let y = 0; y < this.height; y++) {
        this.board.push(Array.from({ length: this.width }));
      }
    }

    /** makeHtmlBoard: make HTML table and row of column tops. */

    makeHtmlBoard() {
      const board = document.getElementById('board');
      board.innerHTML = "";
      // make column tops (clickable area for adding a piece to that column)
      const top = document.createElement('tr');
      top.setAttribute('id', 'column-top');

      this.handleGameClick = this.handleClick.bind(this); //causing me issues

      top.addEventListener('click', this.handleGameClick);

      for (let x = 0; x < this.width; x++) {
        const headCell = document.createElement('td');
        headCell.setAttribute('id', x);
        top.append(headCell);
      }

      board.append(top);

      // make main part of board
      for (let y = 0; y < this.height; y++) {
        const row = document.createElement('tr');

        for (let x = 0; x < this.width; x++) {
          const cell = document.createElement('td');
          cell.setAttribute('id', `${y}-${x}`);
          row.append(cell);
        }

        board.append(row);
      }
    }

    /** findSpotForCol: given column x, return top empty y (null if filled) */

    findSpotForCol(x) {
      for (let y = this.height - 1; y >= 0; y--) {
        if (!this.board[y][x]) {
          return y;
        }
      }
      return null;
    }

    /** placeInTable: update DOM to place piece into HTML table of board */

    placeInTable(y, x) {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.style.backgroundColor = this.currPlayer.color;
      piece.style.top = -50 * (y + 2);

      const spot = document.getElementById(`${y}-${x}`);
      spot.append(piece);
    }

    /** endGame: announce game end */

    endGame(msg) {
      
      //need to remove event listener for column-top to stop game from being able to be progressed
      document.querySelector('#column-top').removeEventListener("click", this.handleGameClick);
      setTimeout(() => {
        alert(msg); }, 500);
    }

    /** handleClick: handle click of column top to play piece */

    handleClick(evt) {
      // get x from ID of clicked cell
      if(this.gameOver) return;

      const x = +evt.target.id;

      // get next spot in column (if none, ignore click)
      const y = this.findSpotForCol(x);
      if (y === null) {
        return;
      }

      // place piece in board and add to HTML table
      this.board[y][x] = this.currPlayer;
      this.placeInTable(y, x);
      
      // check for win
      if (this.checkForWin()) {
        this.gameOver = true;
        return this.endGame(`Player ${this.currPlayer.player} won!`);
      }
      
      // check for tie
      if (this.board.every(row => row.every(cell => cell))) {
        this.gameOver = true;
        return this.endGame('Tie!');

      }
        
      // switch players
      this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
    }

    /** checkForWin: check board cell-by-cell for "does a win start here?" */

    checkForWin() {
      const _win = cells =>  {
        return cells.every(
          ([y, x]) =>
            y >= 0 &&
            y < this.height &&
            x >= 0 &&
            x < this.width &&
            this.board[y][x] === this.currPlayer
        );
      };

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          // get "check list" of 4 cells (starting here) for each of the different
          // ways to win
          const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
          const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
          const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
          const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

          // find winner (only checking each win-possibility as needed)
          if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
            return true;
          }
        }
      }
      return false;
    }
  }
  
})
