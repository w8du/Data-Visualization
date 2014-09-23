/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
            var data = [];
            var parseDate = d3.time.format("%d-%b-%y").parse;
            var clickPoint = undefined;
            var margin = {top: 20, right: 20, bottom: 30, left: 50};
            var width = 1200 - margin.left - margin.right;
            var height = 500 - margin.top - margin.bottom;
            var sectionID = 1;
        //parse and store the input from textarea
            function store(input) {
                var arr = input.trim().split(/\n/);
                var i = 0;
                while (i < arr.length) {
                    var point = {"date": parseDate(arr[i].trim().split(' ')[0]), 
                        "close": parseInt(arr[i].trim().split(' ')[1])};
                    data.push(point);
                    i += 1;
                }
            }
        //display the panel for entering tag on click
        //modify can only be undefined or a tag
            function displayPanel(abs_posn, rel_posn, id, modify) {
                var panel = document.createElement('div');
                panel.setAttribute('class', 'panel');
                panel.setAttribute('style', 'left:'+abs_posn.pageX+'px;'+
                        'top:'+abs_posn.pageY+'px;'+'text-align:center');
                panel.setAttribute('id', 'section'+id);
                
                var box = document.createElement('textarea');
                box.setAttribute('placeholder','Enter your tag');
                box.setAttribute('rows', 1);
                box.setAttribute('cols', 20);
                
                var enter = document.createElement('button');
                enter.innerHTML = 'Enter';
                enter.setAttribute('id', 'section'+id);
                enter.setAttribute('style', 'float:left');
                
                var close = document.createElement('button');
                close.innerHTML='Cancel';
                close.setAttribute('style','float:right');
                close.addEventListener("click", function() {
                    this.parentNode.remove();
                });
                
                panel.appendChild(box);
                panel.appendChild(document.createElement('br'));
                panel.appendChild(enter);
                panel.appendChild(close);
            //if modify is a tag, then append a button for deleting the tag
                if (modify !== undefined) {
                    enter.addEventListener("click", function() {
                        modify.innerHTML = this.parentNode.firstChild.value; 
                        this.parentNode.remove();
                    });
                    var del = document.createElement('button');
                    del.innerHTML = 'Delete';
                    del.setAttribute('style','float:right');
                    del.addEventListener('click', function() {
                       modify.remove();
                       this.parentNode.remove();
                    });
                    panel.appendChild(del);
                } else {
                 enter.addEventListener("click", function() {
                    d3.select('svg')
                           .append('text')
                           .attr('id', this.id)
                           .attr('class','tag')
                           .attr('x', rel_posn[0])
                           .attr('y', rel_posn[1])
                           .attr('style', 'visibility:hidden;')
                           .html(this.parentNode.firstChild.value)
                           .on('click', function() {
                               displayPanel(d3.event, d3.mouse(this), this.id.substring(7), this);
                    })
                           .on('mouseover', function() {
                                d3.selectAll('text').filter("#"+this.id)
                                .attr('style','visibility:visible');
                    });
                    this.parentNode.remove();
                 });
             }
                document.body.appendChild(panel);
            }
        //create a section on line graph after two valid clicks    
            function selectSection(posn) {
              //store the first click
                if (clickPoint === undefined) {
                    clickPoint = posn;
                } else {
                  //alert if the second click is left to the first click
                    if (clickPoint[0] >= posn[0]) {
                        alert("Error: endpoint less than startpoint. Please try again.");
                        clickPoint = undefined;
                        return;
                    }
                    var id = sectionID;
                    var section_id = 'section'+id;
                    var rect = d3.select("svg").append("rect")
                            .attr('id', section_id)
                            .attr('class', 'section')
                            .attr("height", height)
                            .attr("x", clickPoint[0]+margin.left)
                            .attr("y", margin.top)
                            .attr('width', posn[0] - clickPoint[0])
                            .attr('style', 'fill:yellow;fill-opacity:0.5;')
                            .on('click', function() {
                                var p = d3.mouse(this);
                                displayPanel(d3.event, p, id);
                    })
                            .on('mouseover', function() {
                                d3.selectAll('text').filter("#"+section_id)
                                .attr('style', 'visibility:visible');
                                d3.select(this).attr('style', 'fill:yellow;fill-opacity:0.5');
                    })
                            .on('mouseout', function() {
                                d3.selectAll('text').filter("#"+section_id)
                                .attr('style', 'visibility:hidden');
                                d3.select(this).attr('style', 'fill:yellow;fill-opacity:0.3');
                    })
                  //the close button
                    var close = d3.select('svg').append('text')
                            .attr('id', section_id)
                            .attr('class', 'closeX')
                            .attr("x", posn[0]+margin.left-22)
                            .attr("y", margin.top+22)
                            .html('&#x2715')
                            .on('click', function () {
                                d3.selectAll('[id='+this.id+']').remove();
                    })
                            .on('mouseover', function() {
                                d3.selectAll('text').filter("#"+section_id)
                                .attr('style','visibility:visible');
                    });
                    displayPanel(d3.event, [(clickPoint[0] + posn[0])/2+margin.left, margin.top + height/2], sectionID);
                    clickPoint = undefined;
                    sectionID += 1;
                }
            }
        //function for drawing the line graph. Derived from http://bl.ocks.org/mbostock/3883245
            function draw() {
                d3.selectAll('svg').remove();
                data = [];
                store(document.getElementById('idata').value);
                               
            var x = d3.time.scale()
                    .range([0, width]);
            var y = d3.scale.linear()
                    .range([height, 0]);
            var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");
            var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");
            var line = d3.svg.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.close); });
            var svg = d3.selectAll("div").filter('#center').insert("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.append("rect")
                    .attr('width', width)
                    .attr('height', height)
                    .attr('style', 'fill-opacity:0.0')
                    .on("click", function() {
                        var posn = d3.mouse(this);
                        console.log(posn);
                        selectSection(posn);
                    });
            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain(d3.extent(data, function(d) { return d.close; }));
            svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
            svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Price ($)");
            svg.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", line)
                    .on("click", function() {
                        var posn = d3.mouse(this);
                        console.log(posn);
                        selectSection(posn);
            });
  }


