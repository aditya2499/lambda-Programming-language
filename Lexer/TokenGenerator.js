
let TokenType = {
   String : 'str',
   Number : 'num',
   Variable : 'var',
   Keyword : 'kw',
   Operator : 'op',
   Punc : 'punc'
}

const Keyword =["lambda","if","else","then","true","false","let"];

class Token{

    constructor(type,value){
        this.type = type,
        this.value = value;
    }
}

function tokenStream(input){
    var current = null
    return {
        next : next,
        peek : peek,
        eof : eof,
        croak : input.croak
    }

    function readNext(){
        read_while(isWhitespaces)

        if(input.eof()) return null;
        var ch = input.peek();
        
        if(ch === '#'){
            skipComment();
            return readNext();
        }

        if(ch === '"') return readString();

        if(isDigit(ch)) return readNumber();

        if(isPunc(ch))
            return new Token(TokenType.Punc,input.next());
        
        if(isOperator(ch)) 
            return readOperator();
        
        if(isIdentSt(ch)) return readIdentifier();

        input.croak("Error at line :"+input.getLine()+" col : "+input.getCol());
    }
    
    function isDigit(ch){
        return /[0-9]/i.test(ch);
    }
    
    function isIdentSt(ch){
        return /[a-z_]/i.test(ch);
    }

    function isIdent(ch){
        return isIdentSt || "-0123456789".indexOf(ch)>=0;
    }

    function isPunc(ch){
        return ",;(){}[]".indexOf(ch)>=0
    }

    function isOperator(ch){
        return "+-*/><&%=!|".indexOf(ch)>=0
    }
    
    function isWhitespaces(ch){
        return "\t\n".indexOf(ch)>=0
    }

    function skipComment(){
        while(input.next()!='\n'); 
    }
    
    function readString(){
        str = "";
        input.next();
        escape = true;
        while(!input.eof()){
            ch = input.next();
            if(escape){
                str+=ch;
                escape =false
            }
            else if(ch=='\\'){
                escape = true;
            }
            else if( ch == '"'){
               break;}
            else{
                str+=ch
            }
        }
        return new Token(TokenType.String,str);
    }

    function readNumber(){
        num = "";
        hasDot=false
        while(!input.eof()){
            ch = input.next();
            if(ch=='.'){
                if(hasDot) break;
                hasDot = true
            }
            
            if(isDigit(ch)) num+=ch
            else break
        }

        return new Token(TokenType.Number,parseFloat(num))
    }

    function readIdentifier(){
        iden=""

        while(!input.eof()){
            ch = input.next();
            if(isIdent(ch)){
                iden+=ch
            }
            else break
        }

        var type;
        if(Keyword.includes(iden)) type=TokenType.Keyword
        else type = TokenType.Variable
        
        return new Token(type,iden)
    }

    function readOperator(){
        op=""
        while(!input.eof()){
            ch = input.next();
            if(isOperator(ch))
               op+=ch
            else break;   
        }
        return new Token(TokenType.Operator,op);
    }

    function read_while(predicate) {
        var str = "";
        while (!input.eof() && predicate(input.peek()))
            str += input.next();
        return str;
    }

    function peek() {
        return current || (current = readNext());
    }
    function next() {
        var tok = current;
        current = null;
        return tok || read_next();
    }
    function eof() {
        return peek() == null;
    }
}

module.exports={tokenStream,TokenType};
