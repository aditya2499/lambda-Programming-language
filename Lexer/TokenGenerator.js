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
         //console.log("readNext ");
        if(input.eof()) return null;
        var ch = input.peek();
        //console.log(ch);
        if(ch === '#'){
            skipComment();
            return readNext();
        }

        if(ch === '"') return readString();

        if(isDigit(ch)) return readNumber();

        if(isPunc(ch)){
            //console.log(ch);
            return new Token(TokenType.Punc,input.next());}
        
        if(isOperator(ch)) 
            return readOperator();
        
        if(isIdentSt(ch)) return readIdentifier();

        input.croak("Error at line :"+input.getLine()+" col : "+input.getCol()+" "+ch);
    }
    
    function isDigit(ch){
        return /[0-9]/i.test(ch);
    }
    
    function isIdentSt(ch){
        return /[a-z]/i.test(ch);
    }

    function isIdent(ch){
        return isIdentSt(ch) || "-0123456789".indexOf(ch)>=0;
    }

    function isPunc(ch){
        return " ,;(){}[]".indexOf(ch)>=0
    }

    function isOperator(ch){
        return "+-*/><&%=!|".indexOf(ch)>=0
    }
    
    function isWhitespaces(ch){
        return " \t\n".indexOf(ch)>=0
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
            ch = input.peek();
            if(ch=='.'){
                if(hasDot) break;
                hasDot = true
            }
            
            if(isDigit(ch)) {input.next();num+=ch}
            else break
        }

        return new Token(TokenType.Number,parseFloat(num))
    }

    function readIdentifier(){
        iden=""

        while(!input.eof()){
            ch = input.peek();
            if(isIdent(ch)){
                input.next();
                iden+=ch
            }
            else break
        }
        //console.log(iden);
        var type;
        if(Keyword.includes(iden)) type=TokenType.Keyword
        else type = TokenType.Variable
        //console.log(iden);
        return new Token(type,iden)
    }

    function readOperator(){
        op=""
        while(!input.eof()){
            ch = input.peek();
            if(isOperator(ch))
              { op+=ch,input.next();}
            else break;   
        }
        return new Token(TokenType.Operator,op);
    }

    function read_while(predicate) {
        var str = "";
        //console.log("in");
        while (!input.eof() && predicate(input.peek()))
            {str += input.next();
            //console.log("whitespaecs");
        }
            //console.log(input.peek());
        return str;
    }

    function peek() {
       // console.log("peek");
        //console.log(current || (current = readNext()))
        return current || (current = readNext());
    }
    function next() {
        var tok = current;
        current = null;
        //console.log(tok || readNext())
        return tok || readNext();
    }
    function eof() {
        return peek() == null;
    }
}

module.exports={tokenStream,TokenType,Token};
