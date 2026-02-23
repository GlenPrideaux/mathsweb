
var lexer = new Lexer;
lexer.sawNumber=false;
lexer.addRule(/\s+/, function () {
    /* skip whitespace*/
});
// if x or ( are preceded by a number (not an operator), infer multiplication.
lexer.addRule(/x/, function (lexeme) {
    if(lexer.sawNumber) {
	return ["*",lexer.x];
    } else {
	lexer.sawNumber=true;	
	return lexer.x;
    }
});
lexer.addRule(/\(/, function (lexeme) {
    if(lexer.sawNumber) {
	return ["*",lexeme];
    } else {
	return lexeme;
    }
});
// treat a closing bracket as if the whole bracket represents a number, to allow implied multiplication
lexer.addRule(/\)/, function (lexeme) {
    lexer.sawNumber=true;
    return lexeme;
});

// an operator, not a number ... don't allow two operators consecutively, so each of these should have sawNumber = true
lexer.addRule(/[\+\-\*\/\^]/, function (lexeme) {
    if(!lexer.sawNumber) {
	this.reject=true;
	return;
    }
    lexer.sawNumber=false;
    return lexeme; // punctuation (i.e. "+", "-", "*", "/", "^")
});
// numbers ... can't have a number after a number without an operator
lexer.addRule(/-?[\d]+\.[\d]*/, function(lexeme) {
    if(lexer.sawNumber) {
	this.reject=true;
	return;
    }
    lexer.sawNumber=true;
    return parseFloat(lexeme);
});
lexer.addRule(/-?[\d]+/, function(lexeme) {
    if(lexer.sawNumber) {
	this.reject=true;
	return;
    }
    lexer.sawNumber=true;
    return parseInt(lexeme);
});
// random number generator ... generates random integers. e.g. R10 generates 0-9, etc.
lexer.addRule(/([RST])([\d]+)/, function(lexeme,key,multiplier) {
    let rval=Math.floor(Math.random()*parseInt(multiplier));
    this[key]=rval;
    if(this.sawNumber) {
	return ["*",rval];
    }
    lexer.sawNumber=true;
    return rval;
});
lexer.addRule(/([RST])\1/, function(lexeme,key) {
    let rval=this[key];
    if(this.sawNumber) {
	return ["*",rval];
    }
    this.sawNumber=true;
    return rval;
});
var index = {
    precedence: 3,
    associativity: "left"
};

var factor = {
    precedence: 2,
    associativity: "left"
};

var term = {
    precedence: 1,
    associativity: "left"
};

var parser = new Parser({
    "+": term,
    "-": term,
    "*": factor,
    "/": factor,
    "^": index
});

function parse(input, x) {
    lexer.x=x;
    lexer.sawNumber=false;
    lexer.setInput(input);
    var tokens = [], token;
    while ((token = lexer.lex()) !== undefined) tokens.push(token);
    return parser.parse(tokens);
}

var stack = [];

var operator = {
    "+": function (a, b) { return a + b; },
    "-": function (a, b) { return a - b; },
    "*": function (a, b) { return a * b; },
    "/": function (a, b) { return a / b; },
    "^": Math.pow
};


function parseAndEvaluate(input, x) {
    lexer.parsing=false;
    let output="";
    parse(input, x).forEach(function (c) {
	switch (c) {
	case "+":
	case "-":
	case "*":
	case "/":
	case "^":
            var b =+ stack.pop();
            var a =+ stack.pop();
            stack.push(operator[c](a, b));
            break;
	default:
            stack.push(c);
	}
    });
    return stack.pop();
}

var superLexer = new Lexer;
superLexer.addRule(/\[([^\]]+)\]/, function(lexeme, parseText) {
    return parseAndEvaluate(parseText,this.x).toString();
});

superLexer.addRule(/[^\[]+/, function(lexeme) {
    return lexeme;
});

function superParse(input, x) {
    let output=""
    superLexer.x=x;
    superLexer.setInput(input);
    while (token = superLexer.lex()) {
	output = output + token;
    }
    return output;
}
//alert(parseAndEvaluate("x^2-2*x+3.0/3", 5));

