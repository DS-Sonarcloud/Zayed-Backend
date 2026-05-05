
(function($,undefined){
  '$:nomunge'; 
  $.fn.serializeObject = function(){
    var obj = {};
    $.each( this.serializeArray(), function(i,o){
      var n = o.name,
        v = o.value;
        obj[n] = obj[n] === undefined ? v
          : Array.isArray( obj[n] ) ? obj[n].concat( v )
          : [ obj[n], v ];
    });
    return obj;
  };
})(jQuery);
