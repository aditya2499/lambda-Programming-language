function InputStream  (input){

    var pos =0, line =1, col=0;

    return {
        next : next,
        peek : peek,
        eof : eof,
        croak : croak,
        getLine : getLine,
        getCol : getCol
    }

    function next(){
        var ch = input.charAt(pos++);
        if(ch=='\n') line++,col=0
        else col++;
        //console.log('inputStream'+ch);
        return ch;

    }

    function peek(){
        //console.log("inputStream"+input.charAt(pos));
        return input.charAt(pos);
    }

    function eof(){
        return peek() == "";
    }

    function croak(msg){
        throw new Error(msg + '('+line+':'+col+')');
    }

    function getLine(){
        return line;
    }
    function getCol(){
        return col;
    }
}
module.exports= {InputStream};