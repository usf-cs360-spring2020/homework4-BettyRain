function createSpaceFillingDown(data_csv, type) {

  let width = 960;
  let height = 500;
  let pad = 140;
  let diameter = 700;
  let r = 20;

  // setup svg width and height
  let svg = d3.select("body").select("svg#spacefilling")
    //d3.select(DOM.svg(width, height))
    .style("width", width)
    .style("height", height);

  // shift (0, 0) a little bit to leave some padding
  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad + 50, pad - 100));

  let old_nested_data = d3.nest()
    .key(function(d) {
      return d["Neighborhooods"];
    })
    .key(function(d) {
      return d["Call Type Group"]
    })
    .key(function(d) {
      return d["Call Type"]
    })
    .rollup(function(v) {
      return v.length;
    })
    .entries(data_csv);

  let nested_data = old_nested_data.filter(function(d) {
     return d.key == type;
  });

  root = nested_data[0].key;

  let data = d3.hierarchy(nested_data[0], function(d) {
    return d.values;
  });

  data.count()
  data.sum(d => d.value);

  data.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });

  let layout = d3.pack()
    .padding(r)
    .size([diameter - 2 * pad, diameter - 2 * pad]);

  layout(data);

  myColor = d3.scaleSequential([data.height, 0], d3.interpolatePRGn)

  drawNodes(plot.append("g"), data.descendants(), false);


  function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
  }


  function drawNodes(g, nodes, raise) {

    let circles = g.selectAll('circle')
      .data(nodes, node => node.data.key)
      .enter()
      .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.key)
      .attr('class', 'node')
      .style('fill', d => myColor(d.depth))
      .style('stroke', 'black')
      .on("click", function(d) {
        if (focus !== d) zoom(d), d3.event.stopPropagation();
      });

    let empty = circles.filter(d => (d.data.key === ""))
      .style("stroke", "")
      .attr("fill-opacity", "0")

    setupEvents(g, circles, raise);
  }

  function zoom(d) {
    let circles = d3.selectAll('circle').remove();
    d3.select("#tooltip").remove();
    d3.selectAll("text.legend-text").remove();
    createSpaceFilling(data_csv);
  }

  function setupEvents(g, selection, raise) {

    function showTooltip(g, node) {
      let gbox = g.node().getBBox(); // get bounding box of group BEFORE adding text
      let nbox = node.node().getBBox(); // get bounding box of node

      // calculate shift amount
      let dx = nbox.width / 2;
      let dy = nbox.height / 2;

      // retrieve node attributes (calculate middle point)
      let x = nbox.x + dx;
      let y = nbox.y + dy;

      // get data for node
      let datum = node.datum();

      // remove "java.base." from the node name
      let name = datum.data.key;

      // use node name and total size as tooltip text
      numberFormat = d3.format(".2~s");
      let text = `${name} (${numberFormat(datum.value)} cases)`;

      // create tooltip
      let tooltip = g.append('text')
        .text(text)
        .attr('x', x)
        .attr('y', y)
        .attr('dy', -dy - 4) // shift upward above circle
        .attr('text-anchor', 'middle') // anchor in the middle
        .attr('id', 'tooltip');

      // get bounding box for the text
      let tbox = tooltip.node().getBBox();

      // if text will fall off left side, anchor at start
      if (tbox.x < gbox.x) {
        tooltip.attr('text-anchor', 'start');
        tooltip.attr('dx', -dx); // nudge text over from center
      }
      // if text will fall off right side, anchor at end
      else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
        tooltip.attr('text-anchor', 'end');
        tooltip.attr('dx', dx);
      }

      // if text will fall off top side, place below circle instead
      if (tbox.y < gbox.y) {
        tooltip.attr('dy', dy + tbox.height);
      }
    }


    // show tooltip text on mouseover (hover)
    selection.on('mouseover.tooltip', function(d) {
      let selected = d3.select(this);
      let arr = selected._groups;
      let arr2 = arr[0];
      if (arr2[0].id !== "") {
        showTooltip(g, d3.select(this));
      }
    })

    // remove tooltip text on mouseout
    selection.on('mouseout.tooltip', function(d) {
      g.select("#tooltip").remove();
    });

    selection.on('click.tooltip', function(d) {
      let selected = d3.select(this);
      let arr = selected._groups;
      let arr2 = arr[0];

      console.log(arr2[0])
      //showTooltip(g, d3.select(this));

    });
  }



  ///add legend
  //add color circles
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 140)
    .attr("r", 5)
    .style("fill", "rgb(64, 0, 75)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 160)
    .attr("r", 5)
    .style("fill", "rgb(206, 180, 215)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 180)
    .attr("r", 5)
    .style("fill", "rgb(0, 68, 27)")
    .style("stroke", "black")

  //add text
  svg.append("text")
    .attr("class", "legend-text")
    .attr("x", width - 180)
    .attr("y", height - 160)
    .text("Call Type Group")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 180)
    .attr("y", height - 140)
    .text("Call Type")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 180)
    .attr("y", height - 180)
    .text("Neighborhoood")
    .attr("alignment-baseline", "middle")
}
