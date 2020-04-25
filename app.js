/*jslint bitwise: true, es5: true */
(function(window,undefined){
    'use strict';
var canvas=null,ctx=null;
var lastPress=null,
    lastRelease=null,
    mouse = {x:0 , y:0},
    pointer = {x:0,y:0},
    dragging = null,
    draggables = [];
var i=0,l=0;
var grid = [];
var isFinished = false; 
var spritesheet = new Image();
var tapArea=null;
var lastUpdate=0;
// var KEY_LEFT=37,KEY_RIGHT=39;
function enableInputs(){
    document.addEventListener('mousemove',function(evt){
        mouse.x = evt.pageX - canvas.offsetLeft;
        mouse.y = evt.pageY - canvas.offsetTop;
    },false);
    document.addEventListener('mouseup',function(evt){
        lastRelease=evt.which;
        console.log(lastRelease)
    },false);
    canvas.addEventListener('mousedown',function(evt){
        evt.preventDefault();
        lastPress=evt.which;
    },false);
    canvas.addEventListener('contextmenu',function(evt){
        evt.preventDefault();
    },false);
}
function getPuzzleSolved(){
    for(var i = 0,l = grid.length;i<l;i++){
        if(draggables[i].x !== grid[i].x || draggables[i].y !== grid[i].y){
            return false;
        }
    }
    return true;
}
function random(max){
    return ~~(Math.random()*max);
}
function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width=600;
    canvas.height=400;

    var x = 0,y=0;
    for (y =0;y<4;y++){
        for(x=0;x<6;x++){
            grid.push(new Rectangle2D(x*50+150,y*50+100,50,50,true))
            var draggable =new Rectangle2D(random(canvas.width),random(canvas.height),50,50,false)
            draggable.rotation= random(4) * 90;
            draggables.push(draggable);
        }
    }
    tapArea = new Rectangle2D(0,0,6,6,false);
    spritesheet.src = 'assets/puzzle.png'
    enableInputs();
    run()
}
function run (){
    window.requestAnimationFrame(run);
    var now = Date.now(),
        deltaTime = (now-lastUpdate)/1000;
    if(deltaTime>1){
        deltaTime=0;
    }
    lastUpdate=now;
    act(deltaTime);
    paint(ctx);

    lastPress = null;
    lastRelease = null;
}
function act (deltaTime){
    pointer.x=mouse.x;
    pointer.y=mouse.y;
   
     for(i =0 , l = draggables.length;i<l;i++){
         if(draggables[i].rotationTransition<0){
             draggables[i].rotationTransition+=deltaTime *360;
             if(draggables[i].rotationTransition>0){
                 draggables[i].rotationTransition=0;
             }
         }else if(draggables[i].rotationTransition>0){
            draggables[i].rotationTransition-=deltaTime *360;
            if(draggables[i].rotationTransition<0){
                draggables[i].rotationTransition=0;
            }
        }
     }
    if(lastPress ===1 || lastPress===3){
        for ( i = 0,l = draggables.length ; i<l;i++){
            if(draggables[i].contains(pointer)){
                dragging=i;
                break;
            }
        }
        tapArea.x=pointer.x
        tapArea.y=pointer.y
    } 
 
    if(dragging !== null){
        draggables[dragging].x = pointer.x ;
        draggables[dragging].y = pointer.y ;

        if(lastRelease===1 || lastRelease===3){
            if(tapArea.contains(pointer)){
            if(lastRelease===1){
                draggables[dragging].rotationTransition-=90;
                draggables[dragging].rotation+=90;
                if(draggables[dragging].rotation >=360){
                    draggables[dragging].rotation-=360;
                    }
               
            }else if(lastRelease===3){
                draggables[dragging].rotationTransition+=90;
                draggables[dragging].rotation-=90;
                if(draggables[dragging].rotation <0){
                    draggables[dragging].rotation+=360;
                    }
               }
            }
            if(grid[dragging].contains(pointer) && draggables[dragging].rotation===0){
                draggables[dragging].x = grid[dragging].x;
                draggables[dragging].y = grid[dragging].y;
                isFinished=getPuzzleSolved();
                
            }
            
            dragging=null;
        }
    }
}
function paint(ctx){    
    ctx.fillStyle='#55f';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fff';
    ctx.strokeStyle='#fff'
    ctx.textAlign='center';
    for (var i=0, l = grid.length;i<l;i++){
        grid[i].stroke(ctx);
        // ctx.fillText(i,grid[i].x,grid[i].y);
    }
    for (var p = 0;p<draggables.length;p++ ){
        // ctx.fillStyle='#0ff'
        var x = p%6,
            y = ~~(p/6);
        draggables[p].drawImageArea(ctx,spritesheet,x*25,y*25,25,25);
        // ctx.fillStyle='#fff';
        // ctx.fillText(p,draggables[p].x, draggables[p].y);
    }
    if(isFinished){
        ctx.fillStyle='#000';
        ctx.font='20px sans-serif'
        ctx.fillText('WELL DONE!',canvas.width/2,75)
    }
    ctx.font='10px sans-serif'
    ctx.textAlign='left';
    ctx.fillStyle='#0f0'
    ctx.fillRect(pointer.x,pointer.y,1,1)
    ctx.strokeStyle='#000';
    tapArea.stroke(ctx);
}
function Rectangle(x,y,width,height){
    this.x = (x===undefined)?0:x;
    this.y = (y===undefined)?0:y;
    this.width = (width===undefined)?0:width;
    this.height = (height===undefined)?this.width:height;
}
Rectangle.prototype.draw = function(ctx){
    if(ctx !== undefined){            
        ctx.strokeRect(this.x,this.y,this.width,this.height);}
}
Rectangle.prototype.intersects = function(rect){
    if(rect !== undefined){
        var rectWidth = rect.width||0,
            rectHeight = rect.height||0;
        return (this.x < rect.x + rectWidth&&
                rect.x < this.x + this.width&&
                this.y < rect.y + rectHeight&&
                rect.y < this.y + this.height)
    }
}
Rectangle.prototype.contains = function (rect){
    if(rect !== undefined){
    var rectWidth = rect.width||0,
        rectHeight = rect.height||0;
    return (this.x < rect.x &&
        this.x+this.width> rect.x + rectWidth&&
        this.y < rect.y &&
        this.y + this.height > rect.y + rectHeight)
    }
}
function Rectangle2D (x,y,width,height,createFromTopLeft){
    this.width = (width===undefined)?0:width;
    this.height = (height===undefined)?this.width:height;
        if(createFromTopLeft){
            this.left = (x===undefined)?0:x;
            // this.right = this.left + this.width;
            this.top = (y===undefined)?0:y;
            // this.bottom = this.top + this.height;
        }else{
            this.x =(x===undefined)?0:x;
            this.y = (y===undefined)?0:y;
        }
}
Rectangle2D.prototype = {
    left : 0,
    top : 0,
    width:0,
    height:0,
    rotation:0,
    rotationTransition:0,

    get x() {
        return this.left + this.width/2;
    },
    set x(value){
        this.left = value - this.width/2;
    },
    get y (){
        return this.top + this.height/2;
    },
    set y(value){
        this.top = value - this.height/2;
    },
    get right(){
        return this.left + this.width;
    },
    set right (value){
        this.left = value - this.width;
    },
    get bottom(){
        return this.top + this.height;
    },
    set bottom(value){
        this.top = value -this.height;
    },

    contains: function(rect){
        if(rect!==undefined){
          return (this.left < (rect.left || rect.x)&&
                this.right > (rect.right || rect.x)&&
                this.top < (rect.top || rect.y)&&
                this.bottom > (rect.bottom || rect.y));
        }
    },
    intersects : function(rect){
        if (rect!==undefined){
            return(this.left < rect.right &&
                this.right > rect.left &&
                this.bottom > rect.top &&
                this.top < rect.bottom)
        }
    },
    fill : function(ctx){
        if (ctx !==undefined){
        ctx.fillRect(this.left,this.top,this.width,this.height);
        }
    },
    stroke : function(ctx){
        if(ctx!==undefined){
            ctx.strokeRect(this.left,this.top,this.width,this.height);   
        }
    },
    drawImageArea: function (ctx,img,sx,sy,sw,sh){
        if(img.width){
            ctx.save();
            ctx.translate(this.x,this.y)
            ctx.rotate((this.rotation+this.rotationTransition)*Math.PI/180);
            ctx.drawImage(img,sx,sy,sw,sh,-this.width/2,-this.height/2,this.width,this.height);
            ctx.restore();
        }
    }
};


window.addEventListener('load',function(){
    init()
},false);
   
window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback,17);
            };
    }());

})(window)