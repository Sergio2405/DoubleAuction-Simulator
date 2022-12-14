import { useD3 } from '../../../hooks/useD3.js';
import * as d3 from 'd3';

import '../style.scss'

function Serie({ title , labels, axis, data }){
    const ref = useD3((svg) => {
        const height = 330;
        const width = 500;
        const margin = { top: 20, right: 10, bottom: 15, left: 40 };

        const x = d3.scaleTime()
                      .domain(axis["xAxis"].map(time => d3.timeParse("%H:%M:%S.%f")(time)))
                      .range([margin.left, width - margin.right]);
        
        const y = d3.scaleLinear()
                    .domain([0, axis["yAxis"]])
                    .range([height - margin.bottom, margin.top]);
  
        const xAxis = (g) =>
          g.attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x))
          .select("text")
          .attr("x", -15)
          .attr("y", 150)
          .attr("transform", "translate(280,-120)")
          .attr("fill","black")
  
        const yAxis = (g) =>
          g.attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .select("text")
            .attr("x", -15)
            .attr("y", 150)
            .attr("transform", "translate(-177,150) rotate(-90)")
            .attr("fill","black")

        svg.attr("width", width )
          .attr("height", height + margin.bottom)
  
        svg.select(".x-axis").call(xAxis);
        svg.select(".y-axis").call(yAxis);

        const area = d3.area()
                  .x(d => x(d3.timeParse("%H:%M:%S.%f")(d.time)))
                  .y0(y(0))
                  .y1(d => y(d.price))
  
        svg.select(".serie")
          .datum(data)
          .attr("d", area)
          .attr("fill","#a8d8ff")
          .attr("stroke", "#0059a2")
          .attr("stroke-width", "2.5")
          .attr("stroke-miterlimit", "1")
      },[data.length, axis]);
    
      return (
        <div className = "graph">
          <div className = "caption">{title}</div>
          <div className = "legend">
            <div>Price Serie</div>
            <div style = {{border:"2.5px solid #0059a2",backgroundColor: "#a8d8ff"}}></div>
          </div>
          <svg ref={ref}>
            <path className = "serie"/>
            <g className="x-axis">
              <text>{labels["xAxis"]}</text>  
            </g>
            <g className="y-axis">
              <text>{labels["yAxis"]}</text>  
            </g>
          </svg>
        </div>
      );
}

export default Serie