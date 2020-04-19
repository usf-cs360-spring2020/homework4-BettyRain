function createSpaceFilling(data_csv) {

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
      .text(function(d) {
        return d.data.key;
      })
      .attr('class', 'node')
      .style('fill', d => myColor(d.depth))
      .style('stroke', 'black')

    let empty = circles.filter(d => (d.data.key === ""))
      .style("stroke", "")
      .attr("fill-opacity", "0")
  }



  ///add legend
  //add color circles
  svg.append("circle")
    .attr("cx", width - 200)
    .attr("cy", height - 160)
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
    .attr("cy", height - 120)
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
    .attr("y", height - 160)
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
    .attr("y", height - 120)
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
