const {TokenType} = require('./Lexer/TokenGenerator')
function parse(input){

    var PRECEDENCE = {
        "=": 1,
        "||": 2,
        "&&": 3,
        "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
        "+": 10, "-": 10,
        "*": 20, "/": 20, "%": 20,
    };
    
    var FALSE = { type: "bool", value: false };

    return parseTopLevel();

    function parseTopLevel(){
        var prog=[];

        while(!input.eof()){
            prog.push(parseExpression());
            if(!input.eof())
               skipPunc(";");
        }

        return {type : "prog" , prog : prog };
    }

    function delimiter(start,stop,separator,parser){
        var a=[]
        first = true
        skipPunc(start);
        while(!input.eof()){
            if(isPunc(stop)) break;
            if(first) first=false;
            else skipPunc(separator);
            if(isPunc(stop)) break;
            a.push(parser());
        }
        skipPunc(stop)
        return a;

    }
    function parseExpression(){
        return mayCall(function(){
            return mayBinary(parse_(),0);
        })
    }

    function mayCall(expr){
        expr = expr();
        return isPunc('(') ? parseCall(expr) : expr;
    }

    function mayBinary(left,myPrec){
        var token = isOp();
        if(token){
            var itPrec = PRECEDENCE[token.value];
            if(itPrec>myPrec){
                input.next();
                return mayBinary({
                    type     : token.value == "=" ? "assign" : "binary",
                    operator : token.value,
                    left     : left,
                    right    : mayBinary(parse_(), itPrec)
                }, myPrec);
            }
        }
        return left;
    }

    function parse_(){

        return mayCall(function(){

            if(isPunc('{')) 
                return parseProg();
            if(isKeyword('lambda')) { 
                input.next(); 
                return parseLambda();
            }
            if(isKeyword('if')) 
                return parseIf();
            if(isKeyword('true')|| isKeyword('false')) 
                return parseBool();
            if(isPunc('(')){
                input.next();
                var exp  =parseExpression()
                skipPunc(')')
                return exp;
            }

            var token = input.next();
            if(token.type == TokenType.Number || token.type == TokenType.String || token.type == TokenType.Variable)
                return token;
            
            cantHandle();    
        });
    }

    function parseProg(){
        var prog = delimiter('{','}',';',parseExpression);
        if(prog.length==0) return FALSE;
        if(prog.length==1) return prog[0];
        return { type : prog , prog};
    }

    function parseLambda(){
        return {
            type : "lambda",
            vars : delimiter('(',')',';',parseVar),
            body : parseExpression
        }
    }

    function parseVar(){
        var variable = input.next();
        if(varivale.type!=TokenType.Variable) input.croak("Expecting Variable");
        return variable.value;
    }

    function parseBool(){
            return {
                type : 'bool',
                value : input.next() == 'true'
            }
    }

    function parseIf(){
        skipKeyword('if');
        var cond = parseExpression();
        if(!isPunc('{')) skipKeyword('then');
        var then = parseExpression();
        var ret ={
            type : 'if',
            cond : cond,
            then : then
        }
        if(isKeyword('else')){
            input.next();
            ret.else = parseExpression
        }
        return ret;
    }

    function parseCall(){
        return {
            type: "call",
            func: func,
            args: delimiter("(", ")", ",", parseExpression),
        };
    }

    function isPunc(ch) {
        var tok = input.peek();
        return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
    }

    function isKeyword(kw) {
        var tok = input.peek();
        return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
    }
    function isOp(op) {
        var tok = input.peek();
        return tok && tok.type == "op" && (!op || tok.value == op) && tok;
    }
    function skipPunc(ch) {
        if (isPunc(ch)) input.next();
        else input.croak("Expecting punctuation: \"" + ch + "\"");
    }
    function skipKeyword(kw) {
        if (is_kw(kw)) input.next();
        else input.croak("Expecting keyword: \"" + kw + "\"");
    }
    function skipOp(op) {
        if (is_op(op)) input.next();
        else input.croak("Expecting operator: \"" + op + "\"");
    }
    function cantHandle() {
        input.croak("Unexpected token: " + JSON.stringify(input.peek()));
    }
}

module.exports= {parse};