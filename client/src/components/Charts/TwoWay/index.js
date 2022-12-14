import { useD3 } from '../../../hooks/useD3.js';
import * as d3 from 'd3';

import '../style.scss'

function TwoWay({ title , labels, curveColors, axis, data }){
    const ref = useD3((svg) => {
          const height = 330;
          const width = 500;
          const margin = { top: 20, right: 10, bottom: 15, left: 40 };
    
          const x = d3.scaleLinear()
                      .domain([0,axis["xAxis"]])
                      .range([margin.left, width - margin.right])

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

          const line = d3.line()
                    .x(d => x(d.quantity))
                    .y(d => y(d.price))
                    .curve(d3.curveStep)
    
          svg.select(".firstCurve")
            .datum(data.filter(obs => obs.curve == "supply")
                       .sort((obs1,obs2) => d3.ascending(obs1.quantity, obs2.quantity)))
            .attr("d", line)
            .attr("fill","none")
            .attr("stroke", curveColors[0])
            .attr("stroke-width", "1.5")
            .attr("stroke-miterlimit", "1")

          svg.select(".secondCurve")
          .datum(data.filter(obs => obs.curve == "demand")
                      .sort((obs1,obs2) => d3.ascending(obs1.quantity, obs2.quantity)))
          .attr("d", line)
          .attr("fill","none")
          .attr("stroke", curveColors[1])
          .attr("stroke-width", "1.5")
          .attr("stroke-miterlimit", "1")
        },
        [data.length, axis]);
    
      return (
        <div className = "graph">
          <div className = "caption">{title}</div>
          <div className = "legend">
            <div>Bids</div>
            <div style = {{backgroundColor: curveColors[1]}}></div>
            <div>Asks</div>
            <div style = {{backgroundColor: curveColors[0]}}></div>
          </div>
          <svg ref={ref}>
            <path className = "firstCurve"/>
            <path className = "secondCurve"/>
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

export default TwoWay