function createNodeLink(data_csv) {

  console.log(data_csv);

  let width = 960;
  let height = 500;
  let pad = 140;
  let diameter = 700;

  // setup svg width and height
  let svg = d3.select("body").select("svg#nodelink")
    .style("width", width)
    .style("height", height);

  // shift (0, 0) a little bit to leave some padding
  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad + 300, pad + 100)); //translate(width / 2, (height / 2) ))

  let nested_data = d3.nest()
    .key(function(d) {
      return d["City"];
    })
    .key(function(d) {
      return d["Call Type Group"]
    })
    .key(function(d) {
      return d["Call Type"]
    })
    .key(function(d) {
      return d["Call Final Disposition"]
    })
    .rollup(function(v) {
      return v.length;
    })
    .entries(data_csv);

  console.log("nested_data", nested_data);

  root = nested_data[0].key;
  console.log("root", root);

  let data = d3.hierarchy(nested_data[0], function(d) {
    //console.log("values", d.values);
    return d.values;
  });

  data.count()
  data.sum(d => d.value);

  data.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });

  let layout = d3.cluster().size([2 * Math.PI, (diameter / 2) - pad]);

  layout(data);

  data.each(function(node) {
    node.theta = node.x;
    node.radial = node.y;

    let point = toCartesian(node.radial, node.theta);
    node.x = point.x;
    node.y = point.y;
  });


  let generator = d3.linkRadial()
    .angle(d => d.theta + Math.PI / 2) // rotate, 0 angle is mapped differently here
    .radius(d => d.radial);

  myColor = d3.scaleSequential([data.height, 0], d3.interpolatePRGn)

  drawLinks(plot.append("g"), data.links(), generator);
  drawNodes(plot.append("g"), data.descendants(), true);


  function toCartesian(r, theta) {
    return {
      x: r * Math.cos(theta),
      y: r * Math.sin(theta)
    };
  }

  function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
  }

  function drawLinks(g, links, generator) {
    let paths = g.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', generator)
      .attr('class', 'link');
  }

  function drawNodes(g, nodes, raise) {
    //console.log(nodes);

    let circles = g.selectAll('circle')
      .data(nodes, node => node.data.key)
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.key)
      .text(function(d) {
        return d.data.key;
      })
      .attr('class', 'node')
      .style('fill', d => myColor(d.depth))
      .style('stroke', 'black')

    //remove empty circles
    let empty = circles.filter(d => (d.data.key === "")).remove()


    setupEvents(g, circles);
  }

  function setupEvents(g, selection) {

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
      console.log(d);
      let selected = d3.select(this);
      showTooltip(g, d3.select(this));

      //create a filter for only last line of circles
      if (d.height === 0 || d.height === 1) {
        selection.filter(e => (d.data.key !== e.data.key))
          .transition()
          .duration(500)
          .attr("fill-opacity", "0.1")
          .style("stroke", "")
      }
    })

    // remove tooltip text on mouseout
    selection.on('mouseout.tooltip', function(d) {
      selection
        .transition()
        .attr("fill-opacity", "1")
        .style('stroke', 'black');
      g.select("#tooltip").remove();
    });
  }

  ///add legend
  //add color circles
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 120)
    .attr("r", 5)
    .style("fill", "rgb(64, 0, 75)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 140)
    .attr("r", 5)
    .style("fill", "rgb(206, 180, 215)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 160)
    .attr("r", 5)
    .style("fill", "rgb(182, 225, 176)")
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
    .attr("y", height - 120)
    .text("Call Final Disposition")
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
    .attr("y", height - 160)
    .text("Call Type Group")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 180)
    .attr("y", height - 180)
    .text("City")
    .attr("alignment-baseline", "middle")
}
